import type { SavedAddress } from '@/lib/types';

/**
 * Shiprocket shipment creation.
 *
 * Every order that gets saved is pushed here so it appears in the Shiprocket
 * dashboard ready to be assigned a courier. Nothing in this file is allowed to
 * throw: a customer who has already paid must never see an error because our
 * logistics provider was slow, and the order row is already safely written by
 * the time we are called.
 *
 * Courier assignment and label printing stay manual in the Shiprocket
 * dashboard — we only create the order and record the ids we get back.
 */

const API = 'https://apiv2.shiprocket.in/v1/external';

/** Shiprocket tokens last 10 days; refresh a little early to be safe. */
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000;

type CachedToken = { token: string; expiresAt: number };

/**
 * Cached on the module so a warm lambda reuses one login. A cold start just
 * logs in again — Shiprocket permits concurrent tokens.
 */
let cached: CachedToken | null = null;

function env(name: string, fallback = ''): string {
  return (process.env[name] ?? fallback).trim();
}

function numEnv(name: string, fallback: number): number {
  const n = Number(env(name));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function isShiprocketConfigured(): boolean {
  return Boolean(env('SHIPROCKET_EMAIL') && env('SHIPROCKET_PASSWORD'));
}

async function getToken(): Promise<string | null> {
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const email = env('SHIPROCKET_EMAIL');
  const password = env('SHIPROCKET_PASSWORD');
  if (!email || !password) return null;

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Shiprocket login failed:', res.status, await res.text().catch(() => ''));
      return null;
    }

    const data = (await res.json()) as { token?: string };
    if (!data.token) {
      console.error('Shiprocket login returned no token');
      return null;
    }

    cached = { token: data.token, expiresAt: Date.now() + TOKEN_TTL_MS };
    return data.token;
  } catch (err) {
    console.error('Shiprocket login threw:', err);
    return null;
  }
}

/** `2026-08-21 14:30`, the format Shiprocket expects for order_date. */
function formatOrderDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/** Shiprocket wants first and last name separately; we store one string. */
function splitName(full: string): { first: string; last: string } {
  const parts = String(full ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: 'Customer', last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

export type ShiprocketLine = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
};

export type ShiprocketOrderInput = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: SavedAddress;
  lines: ShiprocketLine[];
  /**
   * Items total *before* discount, matching the sum of the line selling
   * prices. Shiprocket works out the COD collectible itself as
   * `sub_total + shipping_charges - total_discount`, so passing an
   * already-discounted figure here alongside `discount` would subtract the
   * coupon twice and short-collect every COD order.
   */
  subTotal: number;
  discount: number;
  shipping: number;
  /** True for cash-on-delivery, false for anything already paid. */
  isCod: boolean;
};

export type ShiprocketResult =
  | { ok: true; shiprocketOrderId: string; shipmentId: string; status: string }
  | { ok: false; reason: string };

/**
 * Push one order to Shiprocket.
 *
 * Weight and dimensions come from env rather than the catalogue: the products
 * table has no such columns, and for a single garment a flat parcel size is
 * close enough. Couriers re-weigh at pickup and reconcile the difference, so a
 * rough figure delays nothing — it only affects the initial rate estimate.
 */
export async function createShipment(input: ShiprocketOrderInput): Promise<ShiprocketResult> {
  if (!isShiprocketConfigured()) {
    return { ok: false, reason: 'Shiprocket credentials not configured' };
  }

  const token = await getToken();
  if (!token) return { ok: false, reason: 'Could not authenticate with Shiprocket' };

  const addr = input.shippingAddress ?? ({} as SavedAddress);
  const { first, last } = splitName(input.customerName || addr.name);

  // One parcel per order. Multiply weight by the number of garments so a
  // three-piece order is not declared at the weight of one.
  const units = input.lines.reduce((n, l) => n + Math.max(1, Number(l.quantity) || 1), 0);
  const perItemKg = numEnv('SHIPROCKET_DEFAULT_WEIGHT_KG', 0.5);

  const payload = {
    order_id: input.orderNumber,
    order_date: formatOrderDate(),
    pickup_location: env('SHIPROCKET_PICKUP_LOCATION', 'Primary'),

    billing_customer_name: first,
    billing_last_name: last,
    billing_address: addr.street ?? '',
    billing_address_2: addr.landmark ?? '',
    billing_city: addr.city ?? '',
    billing_pincode: addr.pincode ?? '',
    billing_state: addr.state ?? '',
    billing_country: 'India',
    billing_email: input.customerEmail ?? '',
    billing_phone: input.customerPhone || addr.phone || '',

    shipping_is_billing: true,

    order_items: input.lines.map((l) => ({
      name: [l.name, l.size && `Size ${l.size}`, l.color].filter(Boolean).join(' · ').slice(0, 250),
      // No SKU column in the catalogue, so the product id is the stable handle.
      sku: [l.id, l.size, l.color].filter(Boolean).join('-'),
      units: Math.max(1, Number(l.quantity) || 1),
      selling_price: Number(l.price) || 0,
      discount: 0,
      tax: 0,
    })),

    // 'Prepaid' tells Shiprocket to collect nothing at the door; for 'COD' it
    // derives the collectible from the three figures below.
    payment_method: input.isCod ? 'COD' : 'Prepaid',
    sub_total: Number(input.subTotal) || 0,
    shipping_charges: Number(input.shipping) || 0,
    total_discount: Number(input.discount) || 0,
    giftwrap_charges: 0,
    transaction_charges: 0,

    length: numEnv('SHIPROCKET_DEFAULT_LENGTH_CM', 30),
    breadth: numEnv('SHIPROCKET_DEFAULT_BREADTH_CM', 25),
    height: numEnv('SHIPROCKET_DEFAULT_HEIGHT_CM', 5),
    weight: Number((perItemKg * Math.max(1, units)).toFixed(2)),
  };

  try {
    const res = await fetch(`${API}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const body = (await res.json().catch(() => null)) as
      | { order_id?: number | string; shipment_id?: number | string; status?: string; message?: string; errors?: unknown }
      | null;

    if (!res.ok || !body?.shipment_id) {
      // A stale token reads as 401; drop it so the next order logs in again.
      if (res.status === 401) cached = null;
      const reason =
        body?.message ||
        (body?.errors ? JSON.stringify(body.errors) : '') ||
        `Shiprocket returned ${res.status}`;
      console.error('Shiprocket order create failed:', reason);
      return { ok: false, reason };
    }

    return {
      ok: true,
      shiprocketOrderId: String(body.order_id ?? ''),
      shipmentId: String(body.shipment_id),
      status: String(body.status ?? 'NEW'),
    };
  } catch (err) {
    console.error('Shiprocket order create threw:', err);
    return { ok: false, reason: err instanceof Error ? err.message : 'Shiprocket request failed' };
  }
}
