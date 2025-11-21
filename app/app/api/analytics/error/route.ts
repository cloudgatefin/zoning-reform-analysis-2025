import { NextResponse } from 'next/server';
import { analyticsStore, ErrorEvent } from '@/lib/analytics';

export async function POST(request: Request) {
  try {
    const errorEvent: ErrorEvent = await request.json();
    analyticsStore.addError(errorEvent);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
