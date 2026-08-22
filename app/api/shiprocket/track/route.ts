import { NextResponse } from 'next/server';
import { trackShiprocketOrder } from '@/lib/shiprocket';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Order number query parameter is required.' },
        { status: 400 }
      );
    }

    const result = await trackShiprocketOrder(orderNumber);
    return NextResponse.json(result);
  } catch (err) {
    console.error('API Shiprocket Track Error:', err);
    return NextResponse.json(
      { success: false, message: 'Could not fetch live tracking information.' },
      { status: 500 }
    );
  }
}
