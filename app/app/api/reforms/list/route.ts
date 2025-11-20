/**
 * GET /api/reforms/list
 * Return list of all reforms for calculator UI
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Reform {
  place_fips: string
  city_name: string
  state_name: string
  reform_name: string
  reform_type: string
  effective_date: string
  baseline_wrluri: number
}

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(
      process.cwd(),
      'data/raw/city_reforms_expanded.csv'
    )

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Reforms database not found' },
        { status: 404 }
      )
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').slice(1) // Skip header

    const reforms: Reform[] = lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split(',')
        return {
          place_fips: parts[0],
          city_name: parts[1],
          state_name: parts[3],
          reform_name: parts[4],
          reform_type: parts[5],
          effective_date: parts[6],
          baseline_wrluri: parseFloat(parts[7]) || 1.0
        }
      })
      .filter(r => r.place_fips && r.city_name)

    return NextResponse.json(reforms)
  } catch (error) {
    console.error('Error loading reforms:', error)
    return NextResponse.json(
      { error: 'Failed to load reforms' },
      { status: 500 }
    )
  }
}
