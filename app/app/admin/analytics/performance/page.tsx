'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Clock, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';

interface PerformanceData {
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
  endpoints: {
    endpoint: string;
    count: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
    errorRate: number;
  }[];
}

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/metrics');
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch performance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  const getVitalStatus = (name: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'text-gray-400';
    if (value <= threshold.good) return 'text-green-400';
    if (value <= threshold.poor) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Performance Metrics</h1>
          <p className="text-gray-400 mt-1">Monitor Core Web Vitals and API performance</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <Link href="/admin/analytics" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Overview
          </Link>
          <Link href="/admin/analytics/usage" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Usage Patterns
          </Link>
          <Link href="/admin/analytics/errors" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Error Logs
          </Link>
          <Link href="/admin/analytics/performance" className="px-4 py-2 bg-blue-600 rounded-lg">
            Performance
          </Link>
        </div>

        {data && (
          <>
            {/* Core Web Vitals */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Core Web Vitals
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(data.performance.webVitals).map(([name, vital]) => (
                  <div key={name} className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">{name}</p>
                    <p className={`text-3xl font-bold ${getVitalStatus(name, vital.avg)}`}>
                      {name === 'CLS' ? vital.avg.toFixed(3) : Math.round(vital.avg)}
                    </p>
                    {name !== 'CLS' && <p className="text-xs text-gray-500">ms</p>}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Good rate</span>
                        <span>{vital.goodPct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${vital.goodPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{vital.count} samples</p>
                    </div>
                  </div>
                ))}
                {Object.keys(data.performance.webVitals).length === 0 && (
                  <p className="col-span-full text-gray-500 text-center py-4">
                    No Web Vitals data yet
                  </p>
                )}
              </div>
            </div>

            {/* API Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Total Requests</p>
                <p className="text-3xl font-bold">{data.performance.apiStats.totalRequests}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Avg Response</p>
                <p className="text-3xl font-bold">
                  {formatDuration(data.performance.apiStats.avgDuration)}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Slow Requests</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {data.performance.apiStats.slowRequests}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Error Requests</p>
                <p className="text-3xl font-bold text-red-400">
                  {data.performance.apiStats.errorRequests}
                </p>
              </div>
            </div>

            {/* Endpoint Performance */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Endpoint Performance
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3">Endpoint</th>
                      <th className="pb-3 text-right">Count</th>
                      <th className="pb-3 text-right">Avg</th>
                      <th className="pb-3 text-right">P50</th>
                      <th className="pb-3 text-right">P95</th>
                      <th className="pb-3 text-right">P99</th>
                      <th className="pb-3 text-right">Error %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.endpoints.slice(0, 15).map((endpoint) => (
                      <tr key={endpoint.endpoint} className="border-b border-gray-700/50">
                        <td className="py-3 text-sm">{endpoint.endpoint}</td>
                        <td className="py-3 text-right text-gray-400">{endpoint.count}</td>
                        <td className={`py-3 text-right ${endpoint.avg > 1000 ? 'text-yellow-400' : ''}`}>
                          {formatDuration(endpoint.avg)}
                        </td>
                        <td className="py-3 text-right text-gray-400">{formatDuration(endpoint.p50)}</td>
                        <td className={`py-3 text-right ${endpoint.p95 > 2000 ? 'text-yellow-400' : ''}`}>
                          {formatDuration(endpoint.p95)}
                        </td>
                        <td className={`py-3 text-right ${endpoint.p99 > 3000 ? 'text-red-400' : ''}`}>
                          {formatDuration(endpoint.p99)}
                        </td>
                        <td className={`py-3 text-right ${endpoint.errorRate > 0.05 ? 'text-red-400' : ''}`}>
                          {(endpoint.errorRate * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                    {data.endpoints.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          No API performance data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Alerts */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Performance Alerts
              </h2>
              <div className="space-y-3">
                {data.performance.recentAlerts.map((alert, i) => (
                  <div
                    key={`${alert.timestamp}-${i}`}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      alert.level === 'error' ? 'bg-red-900/30' : 'bg-yellow-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${
                        alert.level === 'error' ? 'text-red-300' : 'text-yellow-300'
                      }`}>
                        {alert.message}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
                  </div>
                ))}
                {data.performance.recentAlerts.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No performance alerts</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
