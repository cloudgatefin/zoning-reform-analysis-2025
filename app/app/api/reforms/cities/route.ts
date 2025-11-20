import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Reform {
  state_fips: string
  state_name: string
  place_name: string
  place_fips: string
  reform_type: string
  reform_year: number
  reform_name: string
  description: string
  source: string
  research_notes: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')
  const city = searchParams.get('city')
  const reformType = searchParams.get('type')

  const filePath = path.join(
    process.cwd(),
    'data/raw/city_reforms_expanded.csv'
  )

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({
      reforms: [],
      total: 0,
      message: 'Reforms data not available'
    })
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',')

  const reforms: Reform[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length < headers.length) continue

    const reform: Reform = {
      state_fips: values[0] || '',
      state_name: values[1] || '',
      place_name: values[2] || '',
      place_fips: values[3] || '',
      reform_type: values[4] || '',
      reform_year: parseInt(values[5]) || 0,
      reform_name: values[6] || '',
      description: values[7] || '',
      source: values[8] || '',
      research_notes: values[9] || ''
    }

    // Apply filters
    if (state && reform.state_name.toLowerCase() !== state.toLowerCase()) continue
    if (city && !reform.place_name.toLowerCase().includes(city.toLowerCase())) continue
    if (reformType && reform.reform_type !== reformType) continue

    reforms.push(reform)
  }

  // Sort by year descending
  reforms.sort((a, b) => b.reform_year - a.reform_year)

  // Get summary stats
  const uniqueCities = new Set(reforms.map(r => `${r.state_fips}-${r.place_name}`)).size
  const uniqueStates = new Set(reforms.map(r => r.state_name)).size
  const reformTypes = reforms.reduce((acc, r) => {
    acc[r.reform_type] = (acc[r.reform_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return NextResponse.json({
    reforms,
    total: reforms.length,
    uniqueCities,
    uniqueStates,
    reformTypes
  })
}

// Helper to parse CSV line with quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}
