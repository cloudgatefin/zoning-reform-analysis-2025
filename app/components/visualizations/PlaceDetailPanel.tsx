'use client'

import React, { useState, useEffect } from 'react'

interface PlaceMetrics {
  place_fips: string
  place_name: string
  state_fips: string
  recent_units_2024: number
  recent_units_2023: number
  growth_rate_2yr: number
  growth_rate_5yr: number
  growth_rate_10yr: number
  mf_share_recent: number
  mf_share_all_time: number
  mf_trend: string
  rank_permits_national: number
  rank_growth_national: number
  rank_permits_state: number
}

interface PermitRecord {
  year: number
  sf_units: number
  mf_units: number
  total_units: number
}

interface PlaceDetailPanelProps {
  placeFips: string
  onClose?: () => void
}

export function PlaceDetailPanel({ placeFips, onClose }: PlaceDetailPanelProps) {
  const [metrics, setMetrics] = useState<PlaceMetrics | null>(null)
  const [permits, setPermits] = useState<PermitRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load metrics
        const metricsRes = await fetch(`/api/places/${placeFips}`)
        if (!metricsRes.ok) throw new Error('Failed to load metrics')
        const metricsData = await metricsRes.json()
        setMetrics(metricsData.place)

        // Load permits
        const permitsRes = await fetch(`/api/places/${placeFips}/permits?years=10`)
        if (!permitsRes.ok) throw new Error('Failed to load permit history')
        const permitsData = await permitsRes.json()
        setPermits(permitsData.permits)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [placeFips])

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        <p className="mt-2 text-sm text-gray-600">Loading place details...</p>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error || 'Place not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const maxPermits = Math.max(...permits.map(p => p.total_units), 1)
  const trendDirection = metrics.growth_rate_5yr > 0 ? 'up' : 'down'
  const trendColor = trendDirection === 'up' ? 'text-green-600' : 'text-red-600'

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {metrics.place_name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              State {metrics.state_fips} | FIPS {metrics.place_fips}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b border-gray-200">
        {/* Permits 2024 */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              2024 Permits
            </p>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.recent_units_2024.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {metrics.recent_units_2023 > 0
              ? `${((
                  ((metrics.recent_units_2024 - metrics.recent_units_2023) /
                    metrics.recent_units_2023) *
                    100
                ).toFixed(1))}% vs 2023`
              : 'No prior year data'}
          </p>
        </div>

        {/* 5-Year Growth */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              5-Year Growth
            </p>
            <svg className={`h-4 w-4 ${trendColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className={`text-2xl font-bold ${trendColor}`}>
            {metrics.growth_rate_5yr > 0 ? '+' : ''}{metrics.growth_rate_5yr.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">
            CAGR (2019-2024)
          </p>
        </div>

        {/* Multi-Family Share */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              MF Share (Recent)
            </p>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.mf_share_recent.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Trend: {metrics.mf_trend}
          </p>
        </div>

        {/* National Rank */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              National Rank
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            Top {Math.round(100 - metrics.rank_permits_national)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">
            by permit volume
          </p>
        </div>
      </div>

      {/* Permit History Chart */}
      {permits.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Permit History (Last 10 Years)</h3>

          <div className="space-y-3">
            {permits.slice(-10).map(permit => (
              <div key={permit.year}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700">
                    {permit.year}
                  </p>
                  <p className="text-sm text-gray-600">
                    {permit.total_units.toLocaleString()} units
                  </p>
                </div>

                {/* Bar chart */}
                <div className="flex gap-0.5 h-6 bg-gray-100 rounded-sm overflow-hidden">
                  {/* SF bar */}
                  <div
                    className="bg-orange-400"
                    style={{
                      width: `${(permit.sf_units / maxPermits) * 100}%`
                    }}
                    title={`SF: ${permit.sf_units}`}
                  />
                  {/* MF bar */}
                  <div
                    className="bg-blue-500"
                    style={{
                      width: `${(permit.mf_units / maxPermits) * 100}%`
                    }}
                    title={`MF: ${permit.mf_units}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded" />
              <span className="text-gray-600">Single-Family</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-gray-600">Multi-Family</span>
            </div>
          </div>
        </div>
      )}

      {/* Reform Status (Placeholder for Agent 3) */}
      <div className="p-6 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Reforms</h3>
        <p className="text-sm text-gray-600 italic">
          Reform data loading... (will be populated by Agent 3)
        </p>
      </div>
    </div>
  )
}
