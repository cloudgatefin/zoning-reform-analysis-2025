import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fips: string }> }
) {
  try {
    const { fips } = await params

    // Read metrics file
    const metricsPath = path.join(process.cwd(), '..', 'data', 'outputs', 'place_metrics_comprehensive.csv')
    const metricsData = await fs.readFile(metricsPath, 'utf-8')

    // Parse CSV
    const lines = metricsData.trim().split('\n')
    const headers = lines[0].split(',')

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const row: Record<string, string | number> = {}

      headers.forEach((header, idx) => {
        const value = values[idx]
        // Try to parse as number
        const num = parseFloat(value)
        row[header] = isNaN(num) ? value : num
      })

      if (row.place_fips === fips) {
        return NextResponse.json(row)
      }
    }

    return NextResponse.json({ error: 'Place not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching place:', error)
    return NextResponse.json({ error: 'Failed to fetch place' }, { status: 500 })
  }
}
