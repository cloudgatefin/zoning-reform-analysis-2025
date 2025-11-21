import { NextResponse } from 'next/server';
import { analyticsStore } from '@/lib/analytics';

// Admin-only endpoint for error logs
export async function GET() {
  try {
    const errors = analyticsStore.getErrors();

    // Group errors by message
    const errorGroups: Record<string, { count: number; lastSeen: number; stack?: string }> = {};

    errors.forEach(err => {
      if (!errorGroups[err.message]) {
        errorGroups[err.message] = { count: 0, lastSeen: 0, stack: err.stack };
      }
      errorGroups[err.message].count++;
      if (err.timestamp > errorGroups[err.message].lastSeen) {
        errorGroups[err.message].lastSeen = err.timestamp;
      }
    });

    const groupedErrors = Object.entries(errorGroups)
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.lastSeen - a.lastSeen);

    return NextResponse.json({
      total: errors.length,
      grouped: groupedErrors,
      recent: errors.slice(-50).reverse(),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch errors' }, { status: 500 });
  }
}
