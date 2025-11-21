'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorData {
  total: number;
  grouped: { message: string; count: number; lastSeen: number; stack?: string }[];
  recent: {
    message: string;
    stack?: string;
    source?: string;
    timestamp: number;
    pageUrl: string;
  }[];
}

export default function ErrorLogsPage() {
  const [data, setData] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedError, setExpandedError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/errors');
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch error data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
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
          <h1 className="text-3xl font-bold">Error Logs</h1>
          <p className="text-gray-400 mt-1">Track and debug application errors</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <Link href="/admin/analytics" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Overview
          </Link>
          <Link href="/admin/analytics/usage" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Usage Patterns
          </Link>
          <Link href="/admin/analytics/errors" className="px-4 py-2 bg-blue-600 rounded-lg">
            Error Logs
          </Link>
          <Link href="/admin/analytics/performance" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Performance
          </Link>
        </div>

        {/* Error Summary */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold">Error Summary</h2>
          </div>
          <p className="text-4xl font-bold text-red-400">{data?.total || 0}</p>
          <p className="text-gray-400 mt-1">Total errors tracked</p>
        </div>

        {/* Grouped Errors */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Errors by Frequency</h2>
          <div className="space-y-3">
            {data?.grouped.map((error) => (
              <div key={error.message} className="border border-gray-700 rounded-lg">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/50"
                  onClick={() => setExpandedError(
                    expandedError === error.message ? null : error.message
                  )}
                >
                  <div className="flex-1">
                    <p className="text-red-300 font-mono text-sm">{error.message}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{error.count} occurrences</span>
                      <span>Last seen: {formatTime(error.lastSeen)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-red-900/50 text-red-300 px-2 py-1 rounded text-sm">
                      {error.count}
                    </span>
                    {expandedError === error.message ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                {expandedError === error.message && error.stack && (
                  <div className="border-t border-gray-700 p-4 bg-gray-900/50">
                    <p className="text-xs text-gray-500 mb-2">Stack trace:</p>
                    <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap font-mono">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            ))}
            {(!data?.grouped || data.grouped.length === 0) && (
              <p className="text-gray-500 text-center py-8">No errors tracked yet</p>
            )}
          </div>
        </div>

        {/* Recent Errors */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Errors
          </h2>
          <div className="space-y-4">
            {data?.recent.map((error, i) => (
              <div key={`${error.timestamp}-${i}`} className="border-l-2 border-red-500 pl-4 py-2">
                <p className="text-red-300 font-mono text-sm">{error.message}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>{formatTime(error.timestamp)}</span>
                  <span>{error.pageUrl}</span>
                  {error.source && <span>{error.source}</span>}
                </div>
              </div>
            ))}
            {(!data?.recent || data.recent.length === 0) && (
              <p className="text-gray-500 text-center py-8">No recent errors</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
