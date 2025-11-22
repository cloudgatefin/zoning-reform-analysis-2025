import { NextResponse } from 'next/server';
import { performanceStore } from '@/lib/performance';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (data.type === 'webvital') {
      performanceStore.addWebVital(data.metric);
    } else if (data.type === 'component') {
      performanceStore.addComponentMetric(data.metric);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
