import { NextResponse } from 'next/server';
import { fulfilOrder } from '@/lib/services/order-fulfilment';

/**
 * Cash-on-delivery orders.
 *
 * Previously the browser wrote this order itself, which meant it also decided
 * the price. It now goes through the same server-side pricing as every card
 * payment, so a COD order cannot be placed for the wrong amount either.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.customerName || !body?.customerEmail || !Array.isArray(body?.items)) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
    }

    const result = await fulfilOrder({
      userId: body.userId ?? null,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      items: body.items,
      couponCode: body.couponCode ?? null,
      paymentMethod: 'cod',
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderNumber: result.orderNumber,
      grandTotal: result.grandTotal,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error placing COD order';
    console.error('COD order error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
