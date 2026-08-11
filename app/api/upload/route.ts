import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'plv8a0nv').trim();
    const apiKey = (process.env.CLOUDINARY_API_KEY || '474523215625557').trim();
    const apiSecret = (process.env.CLOUDINARY_API_SECRET || 'FviCVHcldkEwlY-3HJl7GWHqszo').trim();

    const timestamp = Math.floor(Date.now() / 1000);
    const strToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('api_key', apiKey);
    uploadData.append('timestamp', String(timestamp));
    uploadData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Cloudinary API upload error:', data);
      return NextResponse.json({ error: data?.error?.message || 'Upload failed' }, { status: 400 });
    }

    return NextResponse.json({ url: data.secure_url || data.url });
  } catch (err: unknown) {
    console.error('Server upload route error:', err);
    return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 });
  }
}
