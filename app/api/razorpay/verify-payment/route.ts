import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createOrder } from '@/lib/services/orders.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderDetails) {
      return NextResponse.json({ error: 'Missing payment verification parameters' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay secret key not configured' }, { status: 500 });
    }

    // Generate HMAC-SHA256 signature to verify authenticity
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid Razorpay payment signature' }, { status: 400 });
    }

    // Signature verified! Persist order in InsForge database
    const created = await createOrder({
      userId: orderDetails.userId,
      customerName: orderDetails.customerName,
      customerEmail: orderDetails.customerEmail,
      customerPhone: orderDetails.customerPhone,
      shippingAddress: {
        ...orderDetails.shippingAddress,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      },
      paymentMethod: `razorpay (Paid - ${razorpay_payment_id})`,
      items: orderDetails.items,
      total: orderDetails.total,
      shipping: orderDetails.shipping,
    });

    if (!created) {
      return NextResponse.json({ error: 'Failed to save order to database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderNumber: created.orderNumber,
      paymentId: razorpay_payment_id,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error verifying Razorpay payment';
    console.error('Razorpay Payment Verification Error:', error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
