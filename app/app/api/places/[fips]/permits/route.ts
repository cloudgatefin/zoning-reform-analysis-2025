import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fips: string }> }
) {
  try {
    const { fips } = await params

    // Read permits file
    const permitsPath = path.join(process.cwd(), '..', 'data', 'raw', 'census_bps_place_annual_permits.csv')
    const permitsData = await fs.readFile(permitsPath, 'utf-8')

    // Parse CSV
    const lines = permitsData.trim().split('\n')
    const headers = lines[0].split(',')

    const permits = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const row: Record<string, string | number> = {}

      headers.forEach((header, idx) => {
        const value = values[idx]
        const num = parseFloat(value)
        row[header] = isNaN(num) ? value : num
      })

      if (row.place_fips === fips) {
        permits.push({
          year: row.year,
          single_family: row.single_family,
          multi_family: row.multi_family,
          total_units: row.total_units,
        })
      }
    }

    // Sort by year
    permits.sort((a, b) => (a.year as number) - (b.year as number))

    return NextResponse.json({ permits })
  } catch (error) {
    console.error('Error fetching permits:', error)
    return NextResponse.json({ error: 'Failed to fetch permits' }, { status: 500 })
  }
}
