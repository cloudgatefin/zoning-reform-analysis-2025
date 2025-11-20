/**
 * POST /api/reforms/predict
 * Predict reform impact using heuristic model
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface PredictionRequest {
  reform_type: string
  wrluri: number
  city_name?: string
  state_name?: string
}

interface PredictionResponse {
  predicted_change: number
  confidence: 'high' | 'medium' | 'low'
  factors: {
    reform_type_effect: number
    wrluri_effect: number
    base_effect: number
  }
  comparable_cities: string[]
}

// Reform type impact coefficients (based on research)
const REFORM_TYPE_EFFECTS: Record<string, number> = {
  'Comprehensive Reform': 12.5,
  'ADU/Lot Split': 8.2,
  'Zoning Upzones': 10.8,
  'By-Right Development': 15.0,
  'Parking Reform': 6.5
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json()
    const { reform_type, wrluri, city_name } = body

    // Get base effect for reform type
    const reform_type_effect = REFORM_TYPE_EFFECTS[reform_type] || 8.0

    // WRLURI effect: higher restrictiveness = more impact from reform
    // Formula: Reforms have more effect in highly regulated areas
    const wrluri_effect = (wrluri - 1.0) * 3.5

    // Base effect (market conditions, population growth, etc.)
    const base_effect = 2.5

    // Total predicted change
    const predicted_change = reform_type_effect + wrluri_effect + base_effect

    // Determine confidence based on data availability
    let confidence: 'high' | 'medium' | 'low' = 'medium'
    if (reform_type in REFORM_TYPE_EFFECTS) {
      confidence = wrluri >= 0.5 && wrluri <= 2.5 ? 'high' : 'medium'
    } else {
      confidence = 'low'
    }

    // Find comparable cities
    const comparable_cities: string[] = []
    try {
      const filePath = path.join(process.cwd(), 'data/raw/city_reforms.csv')
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n').slice(1)

        lines.forEach(line => {
          const parts = line.split(',')
          if (parts[5] === reform_type && parts[1] !== city_name) {
            comparable_cities.push(`${parts[1]}, ${parts[3]}`)
          }
        })
      }
    } catch (e) {
      // Ignore errors in finding comparables
    }

    const response: PredictionResponse = {
      predicted_change: Math.round(predicted_change * 10) / 10,
      confidence,
      factors: {
        reform_type_effect: Math.round(reform_type_effect * 10) / 10,
        wrluri_effect: Math.round(wrluri_effect * 10) / 10,
        base_effect
      },
      comparable_cities: comparable_cities.slice(0, 5)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    )
  }
}
