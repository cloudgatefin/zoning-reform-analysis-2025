import { NextResponse } from 'next/server';
import { analyticsStore } from '@/lib/analytics';
import { performanceStore } from '@/lib/performance';

// Admin-only endpoint for analytics data
export async function GET() {
  try {
    const analyticsMetrics = analyticsStore.getMetrics();
    const usagePatterns = analyticsStore.getUsagePatterns();
    const filterUsage = analyticsStore.getFilterUsage();
    const downloadPatterns = analyticsStore.getDownloadPatterns();
    const performanceSummary = performanceStore.getSummary();
    const endpointAnalysis = performanceStore.getEndpointAnalysis();

    return NextResponse.json({
      analytics: analyticsMetrics,
      usage: usagePatterns,
      filters: filterUsage,
      downloads: downloadPatterns,
      performance: performanceSummary,
      endpoints: endpointAnalysis,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Analytics metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
