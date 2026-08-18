import { createOrder } from '@/lib/services/orders.service';
import { decrementStock } from '@/lib/services/products.service';
import { sendOrderConfirmation } from '@/lib/services/email.service';
import { priceOrder, type RequestedItem } from '@/lib/services/pricing';
import { getUserOrders } from '@/lib/services/orders.service';
import type { SavedAddress } from '@/lib/types';

/**
 * The one place an order becomes real.
 *
 * Prices are recomputed from the database, the row is written, stock comes
 * down and the receipt goes out — in that order. Every payment route (Razorpay
 * verify, Razorpay recovery, COD) funnels through here so they cannot drift.
 */

export type FulfilInput = {
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: SavedAddress;
  items: RequestedItem[];
  couponCode?: string | null;
  /** Human-readable, e.g. `cod` or `razorpay (Paid - pay_xxx)`. */
  paymentMethod: string;
  /** Razorpay identifiers, recorded alongside the address. */
  paymentId?: string;
  razorpayOrderId?: string;
};

export type FulfilResult =
  | { ok: true; orderNumber: string; grandTotal: number }
  | { ok: false; reason: string };

export async function fulfilOrder(input: FulfilInput): Promise<FulfilResult> {
  let isFirstOrder = true;
  if (input.userId) {
    const previous = await getUserOrders(input.userId);
    isFirstOrder = previous.length === 0;
  }

  const priced = await priceOrder(input.items, input.couponCode, isFirstOrder);
  if (!priced.ok) return { ok: false, reason: priced.reason };

  const created = await createOrder({
    userId: input.userId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    shippingAddress: {
      ...input.shippingAddress,
      ...(input.paymentId ? { paymentId: input.paymentId } : {}),
      ...(input.razorpayOrderId ? { razorpayOrderId: input.razorpayOrderId } : {}),
      ...(priced.couponCode
        ? { couponCode: priced.couponCode, couponDiscount: priced.discount }
        : {}),
    },
    paymentMethod: input.paymentMethod,
    // Stored with the prices we verified, not the ones the browser claimed.
    items: priced.lines.map((l) => ({
      id: l.id,
      name: l.name,
      price: l.price,
      quantity: l.quantity,
      image: l.image,
      priceDisplay: `₹${l.price.toLocaleString('en-IN')}`,
      category: l.category,
      size: l.size,
      color: l.color,
    })),
    total: Math.max(0, priced.subtotal - priced.discount),
    shipping: priced.shipping,
  });

  if (!created) return { ok: false, reason: 'Failed to save order to database' };

  // Neither of these may block the confirmation the customer is waiting on.
  await decrementStock(priced.lines.map((l) => ({ id: l.id, quantity: l.quantity })));

  await sendOrderConfirmation({
    to: input.customerEmail,
    orderNumber: created.orderNumber,
    customerName: input.customerName,
    items: priced.lines,
    subtotal: priced.subtotal,
    discount: priced.discount,
    couponCode: priced.couponCode,
    shipping: priced.shipping,
    grandTotal: priced.grandTotal,
    paymentMethod: input.paymentMethod,
    address: input.shippingAddress,
  });

  return { ok: true, orderNumber: created.orderNumber, grandTotal: priced.grandTotal };
}
