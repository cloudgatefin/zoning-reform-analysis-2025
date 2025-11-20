/**
 * GET /api/reforms/list
 * Return list of all reforms in database
 */

import { NextResponse } from 'next/server'
import { loadReformsSync, getReformYear } from '@/lib/reform-impact-utils'

export async function GET() {
  try {
    const reforms = loadReformsSync()

    // Transform to API format
    const formattedReforms = reforms.map(r => ({
      place_fips: r.place_fips,
      city_name: r.city_name,
      state: r.state_name,
      reform_type: r.reform_type,
      reform_name: r.reform_name,
      reform_year: getReformYear(r.effective_date),
      reform_description: `${r.reform_name} - ${r.reform_type} reform`,
      baseline_wrluri: r.baseline_wrluri,
    }))

    return NextResponse.json(formattedReforms)
  } catch (error) {
    console.error('Error loading reforms:', error)
    return NextResponse.json(
      { error: 'Failed to load reforms' },
      { status: 500 }
    )
  }
}
