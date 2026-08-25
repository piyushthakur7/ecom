import { NextResponse } from 'next/server';
import { checkServiceability } from '@/lib/services/shiprocket';

export async function POST(req: Request) {
  try {
    const { pincode, isCod } = await req.json();

    if (!pincode || typeof pincode !== 'string' || !/^\d{6}$/.test(pincode.trim())) {
      return NextResponse.json(
        { status: 'not-serviceable', message: 'Please enter a valid 6-digit Pincode' },
        { status: 400 }
      );
    }

    const result = await checkServiceability(pincode.trim(), Boolean(isCod));
    return NextResponse.json(result);
  } catch (err) {
    console.error('Serviceability check failed:', err);
    // 200 with `unknown`: the check is advisory and must never block checkout,
    // but it also must not claim a delivery estimate we never obtained.
    return NextResponse.json({ status: 'unknown', message: 'Could not check serviceability' });
  }
}
