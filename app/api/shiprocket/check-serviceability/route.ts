import { NextResponse } from 'next/server';
import { checkShiprocketServiceability } from '@/lib/shiprocket';

export async function POST(req: Request) {
  try {
    const { pincode, isCod } = await req.json();

    if (!pincode || typeof pincode !== 'string' || !/^\d{6}$/.test(pincode.trim())) {
      return NextResponse.json(
        { serviceable: false, message: 'Please enter a valid 6-digit Pincode' },
        { status: 400 }
      );
    }

    const result = await checkShiprocketServiceability(pincode.trim(), Boolean(isCod));
    return NextResponse.json(result);
  } catch (err) {
    console.error('API Check Serviceability Error:', err);
    return NextResponse.json(
      { serviceable: true, etd: '3–5 Days', courierName: 'Standard Express Courier' },
      { status: 500 }
    );
  }
}
