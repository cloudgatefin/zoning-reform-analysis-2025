import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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
  const lines = content.split('\n')
  const headers = lines[0].split(',')

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(',')
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header.trim()] = values[index] || ''
    })

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
  { params }: { params: Promise<{ fips: string }> }
) {
  const { fips } = await params

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
