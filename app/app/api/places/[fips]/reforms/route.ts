import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fips: string }> }
) {
  try {
    const { fips } = await params

    // Read reforms file
    const reformsPath = path.join(process.cwd(), '..', 'data', 'raw', 'city_reforms_expanded.csv')
    const reformsData = await fs.readFile(reformsPath, 'utf-8')

    // Parse CSV
    const lines = reformsData.trim().split('\n')
    const headers = lines[0].split(',')

    const reforms = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const row: Record<string, string> = {}

      headers.forEach((header, idx) => {
        row[header] = values[idx] || ''
      })

      if (row.place_fips === fips) {
        reforms.push({
          reform_name: row.reform_name,
          reform_type: row.reform_type,
          effective_date: row.effective_date,
        })
      }
    }

    return NextResponse.json({ reforms })
  } catch (error) {
    console.error('Error fetching reforms:', error)
    return NextResponse.json({ error: 'Failed to fetch reforms' }, { status: 500 })
  }
}
