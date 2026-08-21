import { createOrder, updateOrderShipping } from '@/lib/services/orders.service';
import { decrementStock } from '@/lib/services/products.service';
import { sendOrderConfirmation } from '@/lib/services/email.service';
import { createShipment, isShiprocketConfigured } from '@/lib/services/shiprocket';
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

  // None of what follows may block the confirmation the customer is waiting on.
  await decrementStock(priced.lines.map((l) => ({ id: l.id, quantity: l.quantity })));

  // Hand the parcel to Shiprocket. A failure here must not fail the order —
  // the money is taken and the row is written, so the shipment is a back-office
  // problem. We record the reason on the order so it is visible in /admin
  // rather than only in a server log nobody reads.
  if (isShiprocketConfigured()) {
    const isCod = input.paymentMethod.toLowerCase().startsWith('cod');
    const shipment = await createShipment({
      orderNumber: created.orderNumber,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      shippingAddress: input.shippingAddress,
      lines: priced.lines.map((l) => ({
        id: l.id,
        name: l.name,
        price: l.price,
        quantity: l.quantity,
        size: l.size,
        color: l.color,
      })),
      // Undiscounted, to match the line selling prices — Shiprocket subtracts
      // `discount` itself when working out what a COD courier collects.
      subTotal: priced.subtotal,
      discount: priced.discount,
      shipping: priced.shipping,
      isCod,
    });

    await updateOrderShipping(
      created.orderNumber,
      shipment.ok
        ? {
            shiprocketOrderId: shipment.shiprocketOrderId,
            shipmentId: shipment.shipmentId,
            status: shipment.status,
          }
        : { status: `FAILED: ${shipment.reason}` }
    );
  }

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
