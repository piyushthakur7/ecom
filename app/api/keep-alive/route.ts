import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  try {
    // Perform a lightweight database query to keep InsForge Postgres active
    const { data, error } = await insforge.database
      .from('categories')
      .select('id, name')
      .limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      console.error('[Keep-Alive] DB ping error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'InsForge Database ping failed',
          error: error.message || error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'InsForge Database keep-alive ping successful!',
      dbStatus: 'active',
      latencyMs: latency,
      recordsFound: data?.length ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Keep-Alive] Unexpected error:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to reach InsForge backend',
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
