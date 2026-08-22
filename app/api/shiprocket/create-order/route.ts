import { NextResponse } from 'next/server';
import { createShiprocketOrder } from '@/lib/shiprocket';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      state,
      pincode,
      paymentMethod,
      items,
      totalAmount,
    } = body;

    if (!orderId || !customerName || !pincode || !items || !totalAmount) {
      return NextResponse.json(
        { success: false, message: 'Missing required shipment parameters.' },
        { status: 400 }
      );
    }

    const result = await createShiprocketOrder({
      orderId,
      customerName,
      customerEmail: customerEmail || 'customer@saanshika.com',
      customerPhone: customerPhone || '9800000000',
      address,
      city,
      state,
      pincode,
      paymentMethod: paymentMethod || 'Prepaid',
      items: Array.isArray(items)
        ? items.map((i: { name: string; quantity?: number; units?: number; price: number }) => ({
            name: i.name,
            units: i.quantity || i.units || 1,
            selling_price: i.price,
          }))
        : [],
      totalAmount,
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error syncing order to Shiprocket';
    console.error('API Create Shiprocket Order Error:', err);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
