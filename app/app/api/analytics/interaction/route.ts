import { NextResponse } from 'next/server';
import { analyticsStore, UserInteraction } from '@/lib/analytics';

export async function POST(request: Request) {
  try {
    const interaction: UserInteraction = await request.json();
    analyticsStore.addInteraction(interaction);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
