import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface PermitRecord {
  year: number
  sf_units: number
  mf_units: number
  total_units: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fips: string }> }
) {
  const { fips } = await params
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
  const lines = content.split('\n')
  const headers = lines[0].split(',')

  const placeData: PermitRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(',')
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header.trim()] = values[index] || ''
    })

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
