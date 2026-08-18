import { insforge } from '@/lib/insforge-client';
import { validateCoupon } from '@/lib/coupons';

/**
 * Authoritative order pricing.
 *
 * The browser may only say *what* was ordered — never what it costs. Every
 * amount the customer is charged is recomputed here from the price stored in
 * the products table, so a tampered request cannot buy a lehenga for ₹1.
 *
 * Used by the Razorpay order route, the payment verifier, the recovery route
 * and the COD route, so all four agree on a single number.
 */

/** Free shipping at or above this subtotal; a flat fee below it. */
export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 99;

/** What the client is allowed to tell us about a line. */
export type RequestedItem = {
  id: string;
  quantity: number;
  size?: string;
  color?: string;
};

export type PricedLine = {
  id: string;
  name: string;
  price: number;      // unit price straight from the database
  quantity: number;
  size?: string;
  color?: string;
  image: string;
  category: string;
  lineTotal: number;
};

export type PricedOrder = {
  ok: true;
  lines: PricedLine[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shipping: number;
  grandTotal: number;
};

export type PricingFailure = { ok: false; reason: string };

function toNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * @param items         lines the client claims to be buying
 * @param couponCode    optional code, re-validated here rather than trusted
 * @param isFirstOrder  whether this customer has no previous orders
 */
export async function priceOrder(
  items: RequestedItem[],
  couponCode?: string | null,
  isFirstOrder = false
): Promise<PricedOrder | PricingFailure> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, reason: 'Your cart is empty.' };
  }

  // Collapse duplicate ids so one product is fetched once, and reject nonsense
  // quantities before they reach the database.
  const wanted = new Map<string, RequestedItem[]>();
  for (const raw of items) {
    const id = String(raw?.id ?? '').trim();
    const quantity = Math.floor(toNumber(raw?.quantity, 0));
    if (!id) return { ok: false, reason: 'A cart item is missing its product.' };
    if (quantity < 1 || quantity > 20) {
      return { ok: false, reason: 'Quantity must be between 1 and 20 per item.' };
    }
    const line = { id, quantity, size: raw?.size, color: raw?.color };
    wanted.set(id, [...(wanted.get(id) ?? []), line]);
  }

  const { data, error } = await insforge.database
    .from('products')
    .select('*')
    .in('id', [...wanted.keys()]);

  if (error || !data) {
    return { ok: false, reason: 'Could not verify product prices. Please try again.' };
  }

  const byId = new Map<string, Record<string, unknown>>();
  for (const row of data as unknown[]) {
    const r = row as Record<string, unknown>;
    byId.set(String(r.id), r);
  }

  const lines: PricedLine[] = [];
  let subtotal = 0;

  for (const [id, requestedLines] of wanted) {
    const product = byId.get(id);
    if (!product) {
      return { ok: false, reason: 'One of the items is no longer available.' };
    }

    // Stock is checked against the total across every size/colour of this product.
    const stock = toNumber(product.stock, 0);
    const totalWanted = requestedLines.reduce((s, l) => s + l.quantity, 0);
    if (stock > 0 && totalWanted > stock) {
      return {
        ok: false,
        reason: `Only ${stock} left of "${String(product.name)}". Please reduce the quantity.`,
      };
    }
    if (stock <= 0) {
      return { ok: false, reason: `"${String(product.name)}" is out of stock.` };
    }

    const price = toNumber(product.price, 0);
    if (price <= 0) {
      return { ok: false, reason: `"${String(product.name)}" is not priced correctly.` };
    }

    const images = Array.isArray(product.images) ? (product.images as string[]) : [];

    for (const l of requestedLines) {
      const lineTotal = price * l.quantity;
      subtotal += lineTotal;
      lines.push({
        id,
        name: String(product.name ?? ''),
        price,
        quantity: l.quantity,
        size: l.size,
        color: l.color,
        image: images[0] ?? '',
        category: String(product.category_slug ?? ''),
        lineTotal,
      });
    }
  }

  // Coupon is re-validated against the server-side subtotal.
  let discount = 0;
  let appliedCode: string | null = null;
  if (couponCode) {
    const result = validateCoupon(couponCode, subtotal, isFirstOrder);
    if (result.ok) {
      discount = result.discount;
      appliedCode = result.coupon.code;
    }
    // An invalid code is simply ignored rather than failing the order — the
    // customer already saw the error on the checkout page.
  }

  const payable = Math.max(0, subtotal - discount);
  const shipping = payable >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  return {
    ok: true,
    lines,
    subtotal,
    discount,
    couponCode: appliedCode,
    shipping,
    grandTotal: payable + shipping,
  };
}
