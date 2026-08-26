import { NextResponse } from 'next/server';
import { trackShipment } from '@/lib/services/shiprocket';

/**
 * Live courier tracking for one order, by *our* order number.
 *
 * Deliberately public, matching /track-order: a shopper who checked out as a
 * guest has no session to authenticate with, and the order number from their
 * confirmation email is the only thing they hold. The response carries courier
 * movements only — no address, no contact details, no money — so knowing an
 * order number reveals no more here than the tracking page already shows.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = (searchParams.get('orderNumber') ?? '').trim().toUpperCase();

    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, reason: 'Order number query parameter is required.' },
        { status: 400 }
      );
    }

    // Reject anything that is not one of our order numbers before spending a
    // Shiprocket call on it.
    if (!/^SE-[A-Z0-9]{4,20}$/.test(orderNumber)) {
      return NextResponse.json(
        { ok: false, reason: 'That does not look like an order number (SE-XXXXXXXX).' },
        { status: 400 }
      );
    }

    return NextResponse.json(await trackShipment(orderNumber));
  } catch (err) {
    console.error('Shiprocket tracking failed:', err);
    return NextResponse.json({ ok: false, reason: 'Could not fetch tracking information.' });
  }
}
