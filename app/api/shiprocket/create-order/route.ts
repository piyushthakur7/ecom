import { NextResponse } from 'next/server';
import { createShipment, isShiprocketConfigured, shipmentInputFromOrder } from '@/lib/services/shiprocket';
import { getOrderByNumber, updateOrderShipping } from '@/lib/services/orders.service';
import { requireAdmin } from '@/lib/server/require-admin';

/**
 * Manually push an existing order to Shiprocket, from /admin.
 *
 * Takes only the order number: everything Shiprocket needs is rebuilt from the
 * stored row, so a manual push and the automatic one in order-fulfilment
 * declare the same weight and the same COD collectible. The browser is not
 * trusted to supply prices.
 *
 * Admin-only. The /admin page's own guard is a client-side redirect, which
 * hides the dashboard but leaves this route open to anyone who can guess an
 * order number — and a push here books a real parcel with a real courier.
 */
export async function POST(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, reason: auth.reason }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    // `orderId` is the legacy field name the admin UI used to send.
    const orderNumber = String(body.orderNumber ?? body.orderId ?? '').trim();

    if (!orderNumber) {
      return NextResponse.json({ ok: false, reason: 'orderNumber is required.' }, { status: 400 });
    }

    if (!isShiprocketConfigured()) {
      return NextResponse.json({
        ok: false,
        reason: 'Shiprocket credentials are not configured (SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD).',
      });
    }

    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ ok: false, reason: `Order ${orderNumber} not found.` }, { status: 404 });
    }

    // Shiprocket rejects a repeated order_id, and a second shipment would be a
    // second parcel to pay for. Report the existing one instead.
    if (order.shiprocket_shipment_id) {
      return NextResponse.json({
        ok: true,
        alreadyPushed: true,
        shipmentId: order.shiprocket_shipment_id,
        shiprocketOrderId: order.shiprocket_order_id ?? '',
        status: order.shiprocket_status ?? 'NEW',
      });
    }

    const result = await createShipment(shipmentInputFromOrder(order));

    // Record the outcome either way — the old handler returned the ids to the
    // browser and never wrote them down, so /admin forgot the push had
    // happened the moment the alert was dismissed.
    await updateOrderShipping(
      order.order_number,
      result.ok
        ? {
            shiprocketOrderId: result.shiprocketOrderId,
            shipmentId: result.shipmentId,
            status: result.status,
          }
        : { status: `FAILED: ${result.reason}` }
    );

    return NextResponse.json(result);
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Error syncing order to Shiprocket';
    console.error('Shiprocket manual push failed:', err);
    return NextResponse.json({ ok: false, reason }, { status: 500 });
  }
}
