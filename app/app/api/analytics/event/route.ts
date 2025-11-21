import { NextResponse } from 'next/server';
import { analyticsStore, AnalyticsEvent } from '@/lib/analytics';

export async function POST(request: Request) {
  try {
    const event: AnalyticsEvent = await request.json();
    analyticsStore.addEvent(event);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
