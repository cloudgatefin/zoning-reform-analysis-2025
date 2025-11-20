# AGENT 2: Place Detail Panel with Metrics & Charts

**Target Environment:** Claude Code Web (independent session)
**Budget:** $0 (free tools only)
**Task:** Build place detail view showing metrics, growth charts, reform status

---

## Self-Contained Task

Build a React component and API routes that display detailed metrics for a selected place, including permit history chart, multi-family analysis, and linked reforms.

**Deliverables:**
1. `app/components/visualizations/PlaceDetailPanel.tsx` - Detail view component
2. `app/app/api/places/[fips]/route.ts` - Place details API
3. `app/app/api/places/[fips]/permits/route.ts` - Permit history API
4. Update dashboard to show panel when place selected

---

## Data Schema

**Input 1: Place Metrics** (from `data/outputs/place_metrics_comprehensive.csv`)
```
place_fips,place_name,state_fips,recent_units_2024,recent_units_2023,
growth_rate_2yr,growth_rate_5yr,mf_share_recent,mf_share_all_time,
mf_trend,rank_permits_national,rank_growth_national
```

**Input 2: Annual Permits** (from `data/raw/census_bps_place_annual_permits.csv`)
```
place_fips,place_name,state_fips,year,
sf_buildings,sf_units,duplex_buildings,duplex_units,
tri4_buildings,tri4_units,mf_buildings,mf_units,
total_buildings,total_units
```

**Input 3: Reforms** (from `data/raw/city_reforms.csv` - Agent 3 will expand this)
```
state_fips,place_name,reform_type,reform_year,description
```

**Sample outputs:**
```
Place: Los Angeles, CA (06)
- 2024 permits: 10,488 units
- 5-year growth: +28.1% CAGR
- MF share: 69.9% (increasing)
- National rank: Top 5% (permits)
- Reform status: SB 9 (2021), ADU law (2020)
```

---

## Implementation Instructions

### Step 1: Create Place Details API

**File:** `app/app/api/places/[fips]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parse/sync'

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

let metricsCache: Map<string, PlaceMetrics> = new Map()

function loadMetrics(): Map<string, PlaceMetrics> {
  if (metricsCache.size > 0) return metricsCache

  const filePath = path.join(
    process.cwd(),
    'data/outputs/place_metrics_comprehensive.csv'
  )

  // Check if file exists - if not, return empty cache
  if (!fs.existsSync(filePath)) {
    console.warn('Metrics CSV not found, using empty cache')
    return metricsCache
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const records = csv.parse(content, {
    columns: true,
    skip_empty_lines: true
  })

  for (const record of records) {
    const fips = record.place_fips
    metricsCache.set(fips, {
      place_fips: record.place_fips,
      place_name: record.place_name,
      state_fips: record.state_fips,
      recent_units_2024: parseInt(record.recent_units_2024) || 0,
      recent_units_2023: parseInt(record.recent_units_2023) || 0,
      growth_rate_2yr: parseFloat(record.growth_rate_2yr) || 0,
      growth_rate_5yr: parseFloat(record.growth_rate_5yr) || 0,
      growth_rate_10yr: parseFloat(record.growth_rate_10yr) || 0,
      mf_share_recent: parseFloat(record.mf_share_recent) || 0,
      mf_share_all_time: parseFloat(record.mf_share_all_time) || 0,
      mf_trend: record.mf_trend || 'stable',
      rank_permits_national: parseFloat(record.rank_permits_national) || 0,
      rank_growth_national: parseFloat(record.rank_growth_national) || 0,
      rank_permits_state: parseFloat(record.rank_permits_state) || 0
    })
  }

  return metricsCache
}

export async function GET(
  request: NextRequest,
  { params }: { params: { fips: string } }
) {
  const fips = params.fips

  const metrics = loadMetrics()
  const place = metrics.get(fips)

  if (!place) {
    return NextResponse.json(
      { error: 'Place not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    place,
    lastUpdated: new Date().toISOString()
  })
}
```

### Step 2: Create Permit History API

**File:** `app/app/api/places/[fips]/permits/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parse/sync'

interface PermitRecord {
  year: number
  sf_units: number
  mf_units: number
  total_units: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { fips: string } }
) {
  const fips = params.fips
  const searchParams = request.nextUrl.searchParams
  const years = searchParams.get('years') || '10' // Default last 10 years

  const yearsToFetch = parseInt(years)
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - yearsToFetch

  const filePath = path.join(
    process.cwd(),
    'data/raw/census_bps_place_annual_permits.csv'
  )

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: 'Permit data not available' },
      { status: 404 }
    )
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const records = csv.parse(content, {
    columns: true,
    skip_empty_lines: true
  })

  const placeData: PermitRecord[] = []

  for (const record of records) {
    if (record.place_fips !== fips) continue

    const year = parseInt(record.year)
    if (year < startYear) continue

    placeData.push({
      year,
      sf_units: parseInt(record.sf_units) || 0,
      mf_units: parseInt(record.mf_units) || 0,
      total_units: parseInt(record.total_units) || 0
    })
  }

  // Sort by year
  placeData.sort((a, b) => a.year - b.year)

  return NextResponse.json({
    fips,
    permits: placeData,
    yearsAvailable: placeData.length
  })
}
```

### Step 3: Create Place Detail Component

**File:** `app/components/visualizations/PlaceDetailPanel.tsx`

```typescript
'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Home, Building2, Loader2, AlertCircle, X } from 'lucide-react'

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
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Loading place details...</p>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error || 'Place not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const permitTrend = permits.slice(-3)
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
              State {metrics.state_fips} • FIPS {metrics.place_fips}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
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
            <Home className="h-4 w-4 text-gray-400" />
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
            <TrendingUp className={`h-4 w-4 ${trendColor}`} />
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
            <Building2 className="h-4 w-4 text-gray-400" />
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
                <div className="flex gap-1 h-6 bg-gray-100 rounded-sm overflow-hidden">
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
```

### Step 4: Update Dashboard

**File:** `app/app/page.tsx` (add to imports and state)

```typescript
import { PlaceDetailPanel } from '@/components/visualizations/PlaceDetailPanel'

// In dashboard component:
export default function Dashboard() {
  const [selectedPlace, setSelectedPlace] = useState<any>(null)

  return (
    <div className="space-y-6">
      {/* Search component from Agent 1 */}
      <PlaceSearch onPlaceSelect={setSelectedPlace} />

      {/* Detail panel */}
      {selectedPlace && (
        <PlaceDetailPanel
          placeFips={selectedPlace.place_fips}
          onClose={() => setSelectedPlace(null)}
        />
      )}

      {/* Rest of dashboard */}
    </div>
  )
}
```

---

## Data Files Location

The component will fetch data from:
- `data/outputs/place_metrics_comprehensive.csv` (24,535 places)
- `data/raw/census_bps_place_annual_permits.csv` (812K rows)

These are created by Phase 1.1 scripts (20-22). If not available:
- You'll see "Place not found" error
- Component handles gracefully

---

## Testing

1. Navigate to dashboard
2. Search for a place (e.g., "Los Angeles")
3. Click result
4. Verify panel appears with:
   - Place name and FIPS code
   - 2024 permit count
   - 5-year growth rate
   - Multi-family share
   - National ranking
   - Permit history bar chart (last 10 years)
5. Click X to close panel
6. Select another place to verify data updates

---

## Success Criteria

- [ ] PlaceDetailPanel component renders
- [ ] Fetches metrics from API
- [ ] Fetches permit history from API
- [ ] Shows 2024 permits, growth, MF share
- [ ] Bar chart renders correctly
- [ ] Clicking X closes panel
- [ ] Component handles missing data gracefully
- [ ] Integrated into dashboard

---

## Files Created/Modified

**New:**
- `app/app/api/places/[fips]/route.ts` (60 lines)
- `app/app/api/places/[fips]/permits/route.ts` (70 lines)
- `app/components/visualizations/PlaceDetailPanel.tsx` (350 lines)

**Modified:**
- `app/app/page.tsx` (add imports, integrate panel)
- `app/components/visualizations/index.ts` (export PlaceDetailPanel)

---

## Commit Message

```
Phase 1.2: Add Place Detail Panel with metrics and permit history

- Create PlaceDetailPanel.tsx showing place metrics and charts
- Add API routes: /api/places/[fips] and /api/places/[fips]/permits
- Display 2024 permits, 5-year growth, MF share, national ranking
- Show 10-year permit history with stacked bar chart (SF vs MF)
- Integrate panel into dashboard, shows on place selection
- Responsive grid layout for metrics

Files:
- app/components/visualizations/PlaceDetailPanel.tsx (350 lines)
- app/app/api/places/[fips]/route.ts (60 lines, metrics endpoint)
- app/app/api/places/[fips]/permits/route.ts (70 lines, history endpoint)

Cost: $0 (no external dependencies)
Performance: Load metrics + permits in ~200-500ms
```

---

## Expected Runtime

- Create APIs: 15 min
- Create component: 25 min
- Test and refine: 10 min
- **Total: ~50 minutes**

---

**Status:** Ready to begin
**Environment:** Claude Code Web (independent)
**Parallel with:** AGENT 1 and AGENT 3
**Depends on:** Agent 1 PlaceSearch for `selectedPlace.place_fips`
