import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { fulfilOrder } from '@/lib/services/order-fulfilment';

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderDetails) {
      return NextResponse.json({ error: 'Missing payment verification parameters' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay secret key not configured' }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid Razorpay payment signature' }, { status: 400 });
    }

    // Signature is good — build the order from database prices, not the payload.
    const result = await fulfilOrder({
      userId: orderDetails.userId ?? null,
      customerName: orderDetails.customerName,
      customerEmail: orderDetails.customerEmail,
      customerPhone: orderDetails.customerPhone,
      shippingAddress: orderDetails.shippingAddress,
      items: orderDetails.items ?? [],
      couponCode: orderDetails.couponCode ?? null,
      paymentMethod: `razorpay (Paid - ${razorpay_payment_id})`,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderNumber: result.orderNumber,
      paymentId: razorpay_payment_id,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error verifying Razorpay payment';
    console.error('Razorpay Payment Verification Error:', error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
