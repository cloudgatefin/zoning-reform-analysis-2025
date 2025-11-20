import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Place {
  place_fips: string
  place_name: string
  state_fips: string
  recent_units_2024: number
  growth_rate_5yr: number
  mf_share_recent: number
  rank_permits_national: number
  rank_growth_national: number
}

let placesCache: Place[] | null = null

function loadPlaces(): Place[] {
  if (placesCache) return placesCache

  const filePath = path.join(process.cwd(), 'public/data/places.json')
  const data = fs.readFileSync(filePath, 'utf-8')
  placesCache = JSON.parse(data)
  return placesCache!
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q') || ''
  const state = searchParams.get('state') || ''
  const limit = parseInt(searchParams.get('limit') || '20')

  const places = loadPlaces()

  // Filter by state if specified
  let filtered = state
    ? places.filter(p => p.state_fips === state)
    : places

  // Filter by search query (simple substring, Fuse.js will do fuzzy on client)
  if (q) {
    const query = q.toLowerCase()
    filtered = filtered.filter(p =>
      p.place_name.toLowerCase().includes(query)
    )
  }

  // Sort by permit volume
  filtered = filtered.sort((a, b) => b.recent_units_2024 - a.recent_units_2024)

  return NextResponse.json({
    results: filtered.slice(0, limit),
    total: filtered.length,
    query: q
  })
}
