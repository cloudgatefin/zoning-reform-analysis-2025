import { NextResponse } from 'next/server';
import { analyticsStore, PageView } from '@/lib/analytics';

export async function POST(request: Request) {
  try {
    const pageView: PageView = await request.json();
    analyticsStore.addPageView(pageView);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
