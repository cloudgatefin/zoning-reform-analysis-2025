'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  Activity,
  AlertTriangle,
  Clock,
  TrendingUp,
  MousePointer,
  Download,
  Search,
  RefreshCw
} from 'lucide-react';

interface AnalyticsMetrics {
  analytics: {
    totalSessions: number;
    activeSessions: number;
    totalPageViews: number;
    pageViewsLastHour: number;
    pageViewsLastDay: number;
    pageViewsLastWeek: number;
    popularPages: { path: string; count: number }[];
    topInteractions: { type: string; target: string; count: number }[];
    totalErrors: number;
    topErrors: { message: string; count: number }[];
    avgSessionDuration: number;
    totalEvents: number;
  };
  performance: {
    webVitals: Record<string, { avg: number; count: number; goodPct: number }>;
    apiStats: {
      totalRequests: number;
      avgDuration: number;
      slowRequests: number;
      errorRequests: number;
    };
    slowestEndpoints: { endpoint: string; avgDuration: number; count: number }[];
    recentAlerts: { message: string; level: string; timestamp: number }[];
  };
  filters: { filter: string; count: number }[];
  downloads: { type: string; count: number }[];
  timestamp: number;
}

export default function AdminAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
            <p className="text-red-300">Error: {error}</p>
            <button
              onClick={fetchMetrics}
              className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Last updated: {metrics ? new Date(metrics.timestamp).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchMetrics}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <Link href="/admin/analytics" className="px-4 py-2 bg-blue-600 rounded-lg">
            Overview
          </Link>
          <Link href="/admin/analytics/usage" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Usage Patterns
          </Link>
          <Link href="/admin/analytics/errors" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Error Logs
          </Link>
          <Link href="/admin/analytics/performance" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Performance
          </Link>
        </div>

        {metrics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">Active Sessions</span>
                </div>
                <p className="text-3xl font-bold">{metrics.analytics.activeSessions}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.analytics.totalSessions} total
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">Page Views</span>
                </div>
                <p className="text-3xl font-bold">{metrics.analytics.pageViewsLastDay}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Last 24 hours
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-gray-400">Errors</span>
                </div>
                <p className="text-3xl font-bold">{metrics.analytics.totalErrors}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Total tracked
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400">Avg Session</span>
                </div>
                <p className="text-3xl font-bold">
                  {formatDuration(metrics.analytics.avgSessionDuration)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Duration
                </p>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Core Web Vitals
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(metrics.performance.webVitals).map(([name, data]) => (
                  <div key={name} className="bg-gray-700 rounded p-4">
                    <p className="text-sm text-gray-400">{name}</p>
                    <p className="text-2xl font-bold">
                      {name === 'CLS' ? data.avg.toFixed(3) : Math.round(data.avg)}
                      {name !== 'CLS' && <span className="text-sm text-gray-500">ms</span>}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Good</span>
                        <span>{data.goodPct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${data.goodPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Popular Pages */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Popular Pages
                </h2>
                <div className="space-y-3">
                  {metrics.analytics.popularPages.map((page, i) => (
                    <div key={page.path} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm w-6">{i + 1}.</span>
                        <span className="text-sm">{page.path}</span>
                      </div>
                      <span className="text-gray-400">{page.count}</span>
                    </div>
                  ))}
                  {metrics.analytics.popularPages.length === 0 && (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </div>
              </div>

              {/* Top Interactions */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MousePointer className="w-5 h-5" />
                  Top Interactions
                </h2>
                <div className="space-y-3">
                  {metrics.analytics.topInteractions.map((interaction, i) => (
                    <div key={`${interaction.type}-${interaction.target}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm w-6">{i + 1}.</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">{interaction.type}</span>
                        <span className="text-sm truncate">{interaction.target}</span>
                      </div>
                      <span className="text-gray-400">{interaction.count}</span>
                    </div>
                  ))}
                  {metrics.analytics.topInteractions.length === 0 && (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* API Performance & Errors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Slowest Endpoints */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Slowest Endpoints
                </h2>
                <div className="space-y-3">
                  {metrics.performance.slowestEndpoints.slice(0, 5).map((endpoint) => (
                    <div key={endpoint.endpoint} className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1">{endpoint.endpoint}</span>
                      <span className={`ml-2 ${endpoint.avgDuration > 1000 ? 'text-red-400' : 'text-gray-400'}`}>
                        {formatDuration(endpoint.avgDuration)}
                      </span>
                    </div>
                  ))}
                  {metrics.performance.slowestEndpoints.length === 0 && (
                    <p className="text-gray-500 text-sm">No API data yet</p>
                  )}
                </div>
              </div>

              {/* Top Errors */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Top Errors
                </h2>
                <div className="space-y-3">
                  {metrics.analytics.topErrors.slice(0, 5).map((error) => (
                    <div key={error.message} className="flex items-center justify-between">
                      <span className="text-sm text-red-300 truncate flex-1">{error.message}</span>
                      <span className="text-gray-400 ml-2">{error.count}</span>
                    </div>
                  ))}
                  {metrics.analytics.topErrors.length === 0 && (
                    <p className="text-gray-500 text-sm">No errors tracked</p>
                  )}
                </div>
              </div>
            </div>

            {/* Filter & Download Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Filter Usage */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Filter Usage
                </h2>
                <div className="space-y-2">
                  {metrics.filters.slice(0, 10).map((filter) => (
                    <div key={filter.filter} className="flex items-center justify-between">
                      <span className="text-sm">{filter.filter}</span>
                      <span className="text-gray-400">{filter.count}</span>
                    </div>
                  ))}
                  {metrics.filters.length === 0 && (
                    <p className="text-gray-500 text-sm">No filter usage yet</p>
                  )}
                </div>
              </div>

              {/* Download Patterns */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Patterns
                </h2>
                <div className="space-y-2">
                  {metrics.downloads.map((download) => (
                    <div key={download.type} className="flex items-center justify-between">
                      <span className="text-sm">{download.type}</span>
                      <span className="text-gray-400">{download.count}</span>
                    </div>
                  ))}
                  {metrics.downloads.length === 0 && (
                    <p className="text-gray-500 text-sm">No downloads yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
