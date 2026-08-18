import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { priceOrder, type RequestedItem } from '@/lib/services/pricing';
import { getUserOrders } from '@/lib/services/orders.service';

/**
 * Opens a Razorpay order for the amount *we* calculate.
 *
 * The client sends which products it wants, never what they cost — the total
 * is rebuilt from the products table so a tampered request cannot underpay.
 */
export async function POST(req: Request) {
  try {
    const { items, couponCode, userId } = (await req.json()) as {
      items?: RequestedItem[];
      couponCode?: string | null;
      userId?: string | null;
    };

    // A first order unlocks the welcome coupon, so it has to be decided here.
    let isFirstOrder = true;
    if (userId) {
      const previous = await getUserOrders(userId);
      isFirstOrder = previous.length === 0;
    }

    const priced = await priceOrder(items ?? [], couponCode, isFirstOrder);
    if (!priced.ok) {
      return NextResponse.json({ error: priced.reason }, { status: 400 });
    }
    if (priced.grandTotal <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay API credentials not configured' }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: Math.round(priced.grandTotal * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-8)}`,
      notes: { store: 'Saanshika Ethnics' },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      // Echoed back so the checkout page can show the same figures we charged.
      pricing: {
        subtotal: priced.subtotal,
        discount: priced.discount,
        couponCode: priced.couponCode,
        shipping: priced.shipping,
        grandTotal: priced.grandTotal,
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error creating Razorpay order';
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
