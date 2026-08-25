import { NextResponse } from 'next/server';
import { trackShipment } from '@/lib/services/shiprocket';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, reason: 'Order number query parameter is required.' },
        { status: 400 }
      );
    }

    return NextResponse.json(await trackShipment(orderNumber.trim()));
  } catch (err) {
    console.error('Shiprocket tracking failed:', err);
    return NextResponse.json({ ok: false, reason: 'Could not fetch tracking information.' });
  }
}
