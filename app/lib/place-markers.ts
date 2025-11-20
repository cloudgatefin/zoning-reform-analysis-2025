/**
 * Place Markers Service
 * Handles loading and formatting place data for map visualization
 */

export interface PlaceMarker {
  place_fips: string
  place_name: string
  state_fips: string
  recent_units_2024: number
  growth_rate_5yr: number
  mf_share_recent: number
  latitude?: number
  longitude?: number
}

/**
 * Color coding by 5-year growth rate
 * Green (fast growing) → Red (declining)
 */
export function getGrowthColor(growthRate: number): string {
  if (growthRate > 30) return '#059669' // Dark green - very fast growth
  if (growthRate > 10) return '#10b981' // Green - fast growth
  if (growthRate > 0) return '#fbbf24' // Amber - growing
  if (growthRate > -10) return '#f97316' // Orange - slight decline
  return '#dc2626' // Red - significant decline
}

/**
 * Generate marker size based on permit volume
 * Larger markets get larger circles
 */
export function getMarkerSize(units: number): number {
  if (units > 10000) return 8
  if (units > 5000) return 6
  if (units > 1000) return 5
  if (units > 500) return 4
  return 3
}

/**
 * Create popup HTML for place marker
 */
export function createPlacePopup(place: PlaceMarker): string {
  const growthColor = getGrowthColor(place.growth_rate_5yr)
  const growthSign = place.growth_rate_5yr > 0 ? '+' : ''

  return `
    <div style="width: 200px; font-family: system-ui, -apple-system, sans-serif;">
      <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">
        ${place.place_name}
      </h3>
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
        FIPS: ${place.place_fips}
      </p>
      <hr style="margin: 8px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <div style="font-size: 12px; line-height: 1.5;">
        <div style="margin-bottom: 4px;">
          <strong>2024 Permits:</strong> ${place.recent_units_2024.toLocaleString()} units
        </div>
        <div style="margin-bottom: 4px;">
          <strong>5yr Growth:</strong>
          <span style="color: ${growthColor}; font-weight: 600;">
            ${growthSign}${place.growth_rate_5yr.toFixed(1)}%
          </span>
        </div>
        <div style="margin-bottom: 4px;">
          <strong>MF Share:</strong> ${place.mf_share_recent.toFixed(1)}%
        </div>
      </div>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #2563eb; cursor: pointer;">
        Click marker to view details
      </p>
    </div>
  `
}

/**
 * Load place markers from the search index JSON
 * This file is created from place_metrics_comprehensive.csv
 */
export async function loadPlaceMarkers(): Promise<PlaceMarker[]> {
  try {
    const response = await fetch('/data/places.json')
    if (!response.ok) {
      throw new Error(`Failed to load places: ${response.statusText}`)
    }

    const places = await response.json()

    // Map to PlaceMarker interface
    return places.map((p: any) => ({
      place_fips: p.place_fips?.toString() || '',
      place_name: p.place_name || 'Unknown',
      state_fips: p.state_fips?.toString() || '',
      recent_units_2024: typeof p.recent_units_2024 === 'number' ? p.recent_units_2024 : 0,
      growth_rate_5yr: typeof p.growth_rate_5yr === 'number' ? p.growth_rate_5yr : 0,
      mf_share_recent: typeof p.mf_share_recent === 'number' ? p.mf_share_recent : 0,
      latitude: p.latitude ? parseFloat(p.latitude) : undefined,
      longitude: p.longitude ? parseFloat(p.longitude) : undefined,
    }))
  } catch (error) {
    console.error('Error loading place markers:', error)
    return []
  }
}

/**
 * Filter places by bounds (for viewport optimization)
 */
export function filterPlacesByBounds(
  places: PlaceMarker[],
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
): PlaceMarker[] {
  return places.filter(place => {
    if (place.latitude === undefined || place.longitude === undefined) return false
    return (
      place.latitude >= minLat &&
      place.latitude <= maxLat &&
      place.longitude >= minLon &&
      place.longitude <= maxLon
    )
  })
}

/**
 * Sort places by metric
 */
export function sortPlaces(
  places: PlaceMarker[],
  sortBy: 'permits' | 'growth' | 'mf_share' = 'permits'
): PlaceMarker[] {
  const sorted = [...places]

  switch (sortBy) {
    case 'permits':
      return sorted.sort((a, b) => b.recent_units_2024 - a.recent_units_2024)
    case 'growth':
      return sorted.sort((a, b) => b.growth_rate_5yr - a.growth_rate_5yr)
    case 'mf_share':
      return sorted.sort((a, b) => b.mf_share_recent - a.mf_share_recent)
    default:
      return sorted
  }
}
