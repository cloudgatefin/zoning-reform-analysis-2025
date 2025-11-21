'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Clock, Calendar, RefreshCw } from 'lucide-react';

interface UsageData {
  analytics: {
    totalPageViews: number;
    pageViewsLastHour: number;
    pageViewsLastDay: number;
    pageViewsLastWeek: number;
    popularPages: { path: string; count: number }[];
    avgSessionDuration: number;
  };
  usage: {
    hourlyUsage: Record<number, number>;
    dailyUsage: Record<number, number>;
  };
  filters: { filter: string; count: number }[];
  downloads: { type: string; count: number }[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function UsagePatternsPage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/metrics');
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch usage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const maxHourlyUsage = data ? Math.max(...Object.values(data.usage.hourlyUsage), 1) : 1;
  const maxDailyUsage = data ? Math.max(...Object.values(data.usage.dailyUsage), 1) : 1;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Usage Patterns</h1>
          <p className="text-gray-400 mt-1">Understand when and how users engage</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <Link href="/admin/analytics" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Overview
          </Link>
          <Link href="/admin/analytics/usage" className="px-4 py-2 bg-blue-600 rounded-lg">
            Usage Patterns
          </Link>
          <Link href="/admin/analytics/errors" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Error Logs
          </Link>
          <Link href="/admin/analytics/performance" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Performance
          </Link>
        </div>

        {data && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">Last Hour</span>
                </div>
                <p className="text-2xl font-bold">{data.analytics.pageViewsLastHour}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">Last Day</span>
                </div>
                <p className="text-2xl font-bold">{data.analytics.pageViewsLastDay}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 text-sm">Last Week</span>
                </div>
                <p className="text-2xl font-bold">{data.analytics.pageViewsLastWeek}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Total Views</span>
                </div>
                <p className="text-2xl font-bold">{data.analytics.totalPageViews}</p>
              </div>
            </div>

            {/* Hourly Usage */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Usage by Hour</h2>
              <div className="flex items-end gap-1 h-40">
                {HOURS.map(hour => {
                  const count = data.usage.hourlyUsage[hour] || 0;
                  const height = (count / maxHourlyUsage) * 100;
                  return (
                    <div key={hour} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                        title={`${hour}:00 - ${count} views`}
                      />
                      <span className="text-xs text-gray-500 mt-1">
                        {hour % 6 === 0 ? hour : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Usage */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Usage by Day</h2>
              <div className="flex items-end gap-4 h-40">
                {DAYS.map((day, i) => {
                  const count = data.usage.dailyUsage[i] || 0;
                  const height = (count / maxDailyUsage) * 100;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                        title={`${day} - ${count} views`}
                      />
                      <span className="text-xs text-gray-400 mt-2">{day}</span>
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Pages & Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Most Visited Pages</h2>
                <div className="space-y-3">
                  {data.analytics.popularPages.map((page, i) => (
                    <div key={page.path} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-6">{i + 1}.</span>
                        <span className="text-sm">{page.path}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(page.count / (data.analytics.popularPages[0]?.count || 1)) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm w-12 text-right">{page.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Top Filters Used</h2>
                <div className="space-y-3">
                  {data.filters.slice(0, 10).map((filter, i) => (
                    <div key={filter.filter} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-6">{i + 1}.</span>
                        <span className="text-sm">{filter.filter}</span>
                      </div>
                      <span className="text-gray-400">{filter.count}</span>
                    </div>
                  ))}
                  {data.filters.length === 0 && (
                    <p className="text-gray-500 text-sm">No filter data yet</p>
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
