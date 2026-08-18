import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/services/orders.service';

/**
 * Recovery endpoint for interrupted mobile payments.
 *
 * On phones, handing off to a UPI app (GPay / PhonePe) or a bank page can get
 * the browser tab evicted. When the customer returns, the page is a fresh load
 * and the in-memory Razorpay `handler` callback is gone — so a payment that
 * actually succeeded would never be written to the database.
 *
 * The client stashes the pending order before opening Razorpay and calls this
 * route on the next load. We ask Razorpay directly whether that order was
 * captured; the gateway's own answer is authoritative, so no signature needed.
 */
export async function POST(req: Request) {
  try {
    const { razorpay_order_id, orderDetails } = await req.json();

    if (!razorpay_order_id || !orderDetails) {
      return NextResponse.json({ error: 'Missing recovery parameters' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay API credentials not configured' }, { status: 500 });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const rzpRes = await fetch(
      `https://api.razorpay.com/v1/orders/${razorpay_order_id}/payments`,
      { headers: { Authorization: `Basic ${auth}` }, cache: 'no-store' }
    );

    if (!rzpRes.ok) {
      return NextResponse.json({ error: 'Could not reach Razorpay' }, { status: 502 });
    }

    const payments = await rzpRes.json();
    const paid = (payments.items ?? []).find(
      (p: { status: string }) => p.status === 'captured' || p.status === 'authorized'
    );

    // Nothing was paid — the customer abandoned or the payment failed.
    if (!paid) {
      return NextResponse.json({ success: false, paid: false });
    }

    const created = await createOrder({
      userId: orderDetails.userId,
      customerName: orderDetails.customerName,
      customerEmail: orderDetails.customerEmail,
      customerPhone: orderDetails.customerPhone,
      shippingAddress: {
        ...orderDetails.shippingAddress,
        paymentId: paid.id,
        razorpayOrderId: razorpay_order_id,
      },
      paymentMethod: `razorpay (Paid - ${paid.id})`,
      items: orderDetails.items,
      total: orderDetails.total,
      shipping: orderDetails.shipping,
    });

    if (!created) {
      return NextResponse.json({ error: 'Failed to save recovered order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      paid: true,
      orderNumber: created.orderNumber,
      paymentId: paid.id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error recovering Razorpay payment';
    console.error('Razorpay recovery error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
