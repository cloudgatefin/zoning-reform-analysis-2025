/**
 * POST /api/reforms/predict
 * Make permit increase prediction for a reform+city combination
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { heuristicPredict, PredictionRequest } from '@/lib/reform-impact-utils'

interface RequestBody {
  city_name: string
  state: string
  reform_type: string
  place_permits_2024: number
  place_growth_rate_5yr: number
  place_mf_share: number
  baseline_wrluri?: number
}

interface PredictionResponse {
  success: boolean
  predicted_increase_pct?: number
  confidence_interval?: [number, number]
  baseline_permits?: number
  predicted_permits?: number
  model_version?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RequestBody

    // Validate required fields
    if (!body.reform_type || body.place_permits_2024 === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for ML model (optional enhancement)
    const modelPath = path.join(
      process.cwd(),
      'data/outputs/reform_impact_model_v3.pkl'
    )
    const hasMLModel = fs.existsSync(modelPath)

    // Make prediction using heuristic model
    const predictionRequest: PredictionRequest = {
      reform_type: body.reform_type,
      city_name: body.city_name,
      state_name: body.state,
      place_permits_2024: body.place_permits_2024,
      place_growth_rate_5yr: body.place_growth_rate_5yr || 0,
      place_mf_share: body.place_mf_share || 0,
      baseline_wrluri: body.baseline_wrluri,
    }

    const prediction = heuristicPredict(predictionRequest)

    // Calculate predicted permits
    const predictedPermits = Math.round(
      body.place_permits_2024 * (1 + prediction.increase / 100)
    )

    return NextResponse.json({
      success: true,
      predicted_increase_pct: parseFloat(prediction.increase.toFixed(2)),
      confidence_interval: [
        parseFloat(prediction.interval[0].toFixed(2)),
        parseFloat(prediction.interval[1].toFixed(2)),
      ],
      baseline_permits: body.place_permits_2024,
      predicted_permits: predictedPermits,
      model_version: hasMLModel ? 'v3-ml' : 'v1-heuristic',
    })
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { success: false, error: 'Prediction failed' },
      { status: 500 }
    )
  }
}
