/**
 * Reform Impact Calculator Utilities
 * Handle model predictions and data retrieval
 */

import { readFileSync } from 'fs'
import path from 'path'

export interface Reform {
  place_fips: string
  city_name: string
  state_fips: string
  state_name: string
  reform_name: string
  reform_type: string
  effective_date: string
  baseline_wrluri: number
}

export interface Place {
  place_fips: string
  place_name: string
  state_fips: string
  state_name: string
  recent_units_2024: number
  growth_rate_5yr: number
  mf_share_recent: number
}

export interface PredictionRequest {
  reform_type: string
  city_name: string
  state_name: string
  place_permits_2024: number
  place_growth_rate_5yr: number
  place_mf_share: number
  baseline_wrluri?: number
}

export interface PredictionResult {
  predicted_increase_pct: number
  confidence_interval: [number, number]
  baseline_permits: number
  predicted_permits: number
  similar_cities: SimilarCity[]
  feature_contributions: FeatureContribution[]
}

export interface SimilarCity {
  city_name: string
  state_name: string
  reform_type: string
  reform_year: number
  actual_permit_increase_pct: number
  similarity_score: number
}

export interface FeatureContribution {
  feature_name: string
  contribution: number
}

/**
 * Load reform database from CSV
 */
export function loadReformsSync(): Reform[] {
  try {
    const filePath = path.join(process.cwd(), 'data/raw/city_reforms.csv')
    const content = readFileSync(filePath, 'utf-8')

    const lines = content.split('\n')
    const headers = lines[0].split(',')

    return lines.slice(1).map(line => {
      const values = parseCSVLine(line)
      return {
        place_fips: values[0] || '',
        city_name: values[1] || '',
        state_fips: values[2] || '',
        state_name: values[3] || '',
        reform_name: values[4] || '',
        reform_type: values[5] || '',
        effective_date: values[6] || '',
        baseline_wrluri: parseFloat(values[7]) || 0,
      }
    }).filter(r => r.city_name && r.reform_type)
  } catch (error) {
    console.error('Error loading reforms:', error)
    return []
  }
}

/**
 * Simple CSV line parser that handles quoted fields
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values
}

/**
 * Get unique reform types from reforms list
 */
export function getUniqueReformTypes(reforms: Reform[]): string[] {
  const types = new Set(reforms.map(r => r.reform_type))
  return Array.from(types).sort()
}

/**
 * Find cities with same reform type
 */
export function findCitiesWithReform(
  reforms: Reform[],
  reform_type: string
): Reform[] {
  return reforms
    .filter(r => r.reform_type === reform_type)
    .slice(0, 10)
}

/**
 * Calculate similarity between two cities
 * Returns 0-1 score (1 = most similar)
 */
export function calculateSimilarity(
  city1: Place,
  city2: Place
): number {
  const permits_diff = Math.abs(city1.recent_units_2024 - city2.recent_units_2024) / 10000
  const growth_diff = Math.abs(city1.growth_rate_5yr - city2.growth_rate_5yr) / 100
  const mf_diff = Math.abs(city1.mf_share_recent - city2.mf_share_recent) / 100

  const distance = Math.sqrt(
    permits_diff ** 2 + growth_diff ** 2 + mf_diff ** 2
  )

  return Math.exp(-distance)
}

/**
 * Format prediction percentage for display
 */
export function formatPrediction(predicted_increase: number): string {
  if (predicted_increase > 0) {
    return `+${predicted_increase.toFixed(1)}%`
  } else if (predicted_increase < 0) {
    return `${predicted_increase.toFixed(1)}%`
  } else {
    return '~0%'
  }
}

/**
 * Generate confidence interval (95% CI)
 */
export function generateConfidenceInterval(
  point_estimate: number,
  se: number = 15
): [number, number] {
  return [
    point_estimate - 1.96 * se,
    point_estimate + 1.96 * se,
  ]
}

/**
 * Heuristic prediction model
 * Based on reform type and market conditions
 */
export function heuristicPredict(
  req: PredictionRequest
): { increase: number; interval: [number, number] } {
  // Base increase varies by reform type
  const baseIncreases: { [key: string]: number } = {
    'ADU/Lot Split': 12,
    'Comprehensive Reform': 18,
    'Zoning Upzones': 15,
    'Height/Density Increase': 15,
    'Parking Reduction': 5,
    'Affordability Requirements': 3,
    'Mixed-Use Zoning': 12,
    'Transit-Oriented Development (TOD)': 18,
    'Single-Family Elimination': 25,
  }

  const base = baseIncreases[req.reform_type] || 10

  // Adjust by market conditions (growth rate)
  const growth_factor = req.place_growth_rate_5yr / 100
  const adjusted = base + (base * growth_factor * 0.5)

  // Adjust by regulatory environment (WRLURI)
  const wrluri_factor = req.baseline_wrluri ? (req.baseline_wrluri - 1) * -5 : 0
  const with_wrluri = adjusted + wrluri_factor

  // Scale by city size
  const size_factor = Math.min(req.place_permits_2024 / 5000, 1)
  const final = with_wrluri * (0.8 + size_factor * 0.4)

  // Confidence interval (wider for uncertain predictions)
  const se = Math.abs(final * 0.4)
  const interval: [number, number] = [final - se, final + se]

  return {
    increase: Math.max(-30, Math.min(final, 100)),
    interval,
  }
}

/**
 * Get reform year from effective_date string
 */
export function getReformYear(effective_date: string): number {
  const date = new Date(effective_date)
  return date.getFullYear() || 2020
}
