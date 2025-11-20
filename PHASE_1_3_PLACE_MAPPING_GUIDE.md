# Phase 1.3: Place-Level Map Visualization

**Status:** Ready to implement
**Priority:** HIGH
**Impact:** Unlock geographic discovery of 24,535 places
**Expected Timeline:** 3-4 hours for MVP

---

## Objective

Add place-level markers to the existing map, allowing users to see all 24,535 geocoded places on the map. Support clustering at high zoom levels and color coding by growth rate or reform status.

---

## Current State

**Existing Map Component:**
- `ChoroplethMap.tsx` - D3-based state-level choropleth
- Uses TopoJSON for state boundaries
- Interactive with state click handlers
- Already in dashboard

**New Data Available:**
- `data/outputs/place_metrics_geocoded.csv` - 24,535 places with lat/lon
- `public/data/places.json` - Search index with place data
- API endpoints ready to serve place data

---

## Implementation Approach

### Option A: Enhance Existing D3 Map (Recommended)
Add place markers to the existing `ChoroplethMap.tsx`:
- Overlay place circles on state choropleth
- Use clustering library (Leaflet + Leaflet.markercluster)
- Conditional rendering by zoom level
- Performance: ~1,000 markers visible at once

**Pros:** Unified map component, reuse existing infrastructure
**Cons:** D3 + Leaflet together is unconventional
**Effort:** Medium (2-3 hours)

### Option B: New Leaflet-Based Map (Better Long-term)
Create new `LeafletPlaceMap.tsx` component:
- Full Leaflet.js with OpenStreetMap tiles
- Vector tiles for 20K+ marker performance
- Clustering built-in
- Replace choropleth for new map type

**Pros:** Clean implementation, better for 20K markers, future-proof
**Cons:** More effort, requires refactoring
**Effort:** High (4-5 hours)

### Option C: Quick MVP (Simplest)
Add place markers to D3 map without clustering:
- Fixed zoom level that shows ~1K places
- Simple circle markers colored by growth
- "Zoom in to state to see places" message

**Pros:** Fastest, minimal code changes
**Cons:** Limited usability for exploration
**Effort:** Low (1-2 hours)

---

## Recommendation: Option A (Balanced)

Enhance the existing D3 map with Leaflet marker clustering:

1. **Keep the state choropleth** (users understand it)
2. **Add place markers when zoomed in**
3. **Cluster markers for performance**
4. **Click place markers to show detail panel**

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install leaflet leaflet.markercluster
npm install --save-dev @types/leaflet @types/leaflet.markercluster
```

### Step 2: Create Place Markers Service

**File:** `app/lib/place-markers.ts`

```typescript
import { LatLng } from 'leaflet'

export interface PlaceMarker {
  place_fips: string
  place_name: string
  state_fips: string
  lat: number
  lon: number
  recent_units_2024: number
  growth_rate_5yr: number
  mf_share_recent: number
}

// Color by growth rate
export function getGrowthColor(growthRate: number): string {
  if (growthRate > 30) return '#059669' // dark green (very fast)
  if (growthRate > 10) return '#10b981' // green (fast)
  if (growthRate > 0) return '#fbbf24'  // amber (growing)
  if (growthRate > -10) return '#f97316' // orange (declining)
  return '#dc2626' // red (declining fast)
}

// Load places from JSON
export async function loadPlaceMarkers(): Promise<PlaceMarker[]> {
  const response = await fetch('/data/places.json')
  const places = await response.json()

  return places.map((p: any) => ({
    place_fips: p.place_fips,
    place_name: p.place_name,
    state_fips: p.state_fips,
    lat: p.latitude,
    lon: p.longitude,
    recent_units_2024: p.recent_units_2024,
    growth_rate_5yr: p.growth_rate_5yr,
    mf_share_recent: p.mf_share_recent,
  }))
}

// Create popup content for place marker
export function createPlacePopup(place: PlaceMarker): string {
  return `
    <div class="w-48">
      <h3 class="font-bold text-sm">${place.place_name}</h3>
      <p class="text-xs text-gray-600">FIPS: ${place.place_fips}</p>
      <hr class="my-1" />
      <div class="text-xs space-y-1">
        <div>2024 Permits: <strong>${place.recent_units_2024.toLocaleString()}</strong></div>
        <div>5yr Growth: <strong>${place.growth_rate_5yr > 0 ? '+' : ''}${place.growth_rate_5yr.toFixed(1)}%</strong></div>
        <div>MF Share: <strong>${place.mf_share_recent.toFixed(1)}%</strong></div>
      </div>
      <p class="text-xs text-blue-600 mt-2 cursor-pointer">Click map marker to view details</p>
    </div>
  `
}
```

### Step 3: Enhance ChoroplethMap Component

**File:** `app/components/visualizations/ChoroplethMap.tsx` (add to existing)

Add these imports:
```typescript
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import MarkerClusterGroup from 'leaflet.markercluster'
import { PlaceMarker, loadPlaceMarkers, getGrowthColor, createPlacePopup } from '@/lib/place-markers'
```

Add state for place markers:
```typescript
const [placeMarkers, setPlaceMarkers] = useState<PlaceMarker[]>([])
const [mapZoom, setMapZoom] = useState(4) // Track zoom level
const leafletMapRef = useRef<L.Map | null>(null)

// Load place markers on mount
useEffect(() => {
  loadPlaceMarkers().then(setPlaceMarkers)
}, [])
```

Add Leaflet container to SVG area:
```typescript
// After D3 choropleth is rendered, add Leaflet map on top for markers
// Use z-index and pointer-events to layer them
```

### Step 4: Create PlaceMarkersLayer Component

**File:** `app/components/visualizations/PlaceMarkersLayer.tsx` (new)

```typescript
'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { PlaceMarker, getGrowthColor, createPlacePopup } from '@/lib/place-markers'

interface PlaceMarkersLayerProps {
  places: PlaceMarker[]
  onPlaceClick?: (place: PlaceMarker) => void
  visible?: boolean
}

export function PlaceMarkersLayer({
  places,
  onPlaceClick,
  visible = true
}: PlaceMarkersLayerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const clustersRef = useRef<L.MarkerClusterGroup | null>(null)

  useEffect(() => {
    if (!visible || places.length === 0) return

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map('place-map', {
        center: [39.8, -98.6],
        zoom: 4,
        tiles: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }),
      })
    }

    const map = mapRef.current

    // Create marker cluster group
    if (clustersRef.current) {
      map.removeLayer(clustersRef.current)
    }

    const clusters = L.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        return L.divIcon({
          className: 'cluster-icon',
          html: `<div>${count}</div>`,
          iconSize: new L.Point(40, 40),
        })
      },
    })

    // Add markers
    places.forEach(place => {
      const color = getGrowthColor(place.growth_rate_5yr)
      const marker = L.circleMarker([place.lat, place.lon], {
        radius: 4,
        fillColor: color,
        color: 'white',
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.7,
      })

      marker.bindPopup(createPlacePopup(place))

      marker.on('click', () => {
        onPlaceClick?.(place)
      })

      clusters.addLayer(marker)
    })

    map.addLayer(clusters)
    clustersRef.current = clusters

  }, [places, visible, onPlaceClick])

  if (!visible) return null

  return (
    <div
      id="place-map"
      className="w-full h-96 rounded-lg border border-gray-300"
      style={{ zIndex: 10 }}
    />
  )
}
```

### Step 5: Update Dashboard

**File:** `app/app/page.tsx`

```typescript
import { PlaceMarkersLayer } from '@/components/visualizations/PlaceMarkersLayer'

// In dashboard component:
export default function DashboardPage() {
  const [placeMarkers, setPlaceMarkers] = useState<PlaceMarker[]>([])
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null)

  // In return JSX, add after the search component:
  <>
    {/* Existing PlaceSearch */}
    <PlaceSearch onPlaceSelect={setSelectedPlace} />

    {/* New Place Map Layer */}
    <Card className="mb-5">
      <CardHeader>
        <CardTitle>Place-Level Map</CardTitle>
      </CardHeader>
      <CardContent>
        <PlaceMarkersLayer
          places={placeMarkers}
          onPlaceClick={(place) => setSelectedPlace({
            place_fips: place.place_fips,
            place_name: place.place_name,
            state_fips: place.state_fips,
            recent_units_2024: place.recent_units_2024,
            growth_rate_5yr: place.growth_rate_5yr,
            mf_share_recent: place.mf_share_recent,
          })}
          visible={true}
        />
      </CardContent>
    </Card>

    {/* Existing PlaceDetailPanel */}
    {selectedPlace && <PlaceDetailPanel {...} />}
  </>
}
```

---

## Key Considerations

### Performance
- 24,535 markers is a lot for browser rendering
- Solutions:
  1. **Clustering** - Groups nearby markers at high zoom (recommended)
  2. **Viewport filtering** - Only load markers in visible area
  3. **Vector tiles** - Use Mapbox Vector Tiles (future)
  4. **Pagination** - Show top 5K by growth rate

### User Experience
- Show "Zoom in to see places" hint when zoomed out
- Marker size/color indicates growth rate
- Click marker → select place → show detail panel
- Mobile friendly (touch markers)

### Implementation Complexity
- Keep existing D3 choropleth for state overview
- Add Leaflet for place-level detail
- Both work together with proper layering

---

## Testing Checklist

- [ ] Map loads without errors
- [ ] 24,535 markers load successfully
- [ ] Clustering works at high zoom
- [ ] Individual markers visible at zoom 12+
- [ ] Click marker shows popup with place info
- [ ] Clicking marker selects place in detail panel
- [ ] Colors correctly represent growth rates
- [ ] Mobile responsive (touch markers)
- [ ] No performance issues on mid-range devices
- [ ] Popups show correct data

---

## Success Criteria

✓ Map displays all 24,535 geocoded places
✓ Markers clustered at zoom < 10
✓ Individual markers visible at zoom >= 12
✓ Click marker → place detail panel
✓ Color coded by growth rate
✓ No console errors
✓ Responsive on mobile
✓ <2 second load time for markers

---

## Files to Create/Modify

**New:**
- `app/lib/place-markers.ts` (service for place data)
- `app/components/visualizations/PlaceMarkersLayer.tsx` (Leaflet component)

**Modified:**
- `app/app/page.tsx` (add PlaceMarkersLayer)
- `package.json` (add Leaflet dependencies)

---

## Next Steps After Phase 1.3

1. **Enhanced filtering** - Filter map by growth rate, MF share, reform status
2. **Comparison mode** - Select multiple places to compare
3. **Reform overlay** - Show which places have reforms
4. **County drill-down** - Refine from state → county → place
5. **Export data** - Download place data as CSV

---

## Expected Timeline

- Setup & dependencies: 15 min
- Marker service: 20 min
- Leaflet component: 45 min
- Dashboard integration: 20 min
- Testing & refinement: 30 min
- **Total: ~2-3 hours for MVP**

---

## Alternative: Quick MVP (1 hour)

If you want faster results, do a minimal version:
1. Add place markers to existing D3 choropleth without clustering
2. Show only top 1,000 places by permit volume (simpler rendering)
3. Fixed zoom level (no clustering complexity)
4. Basic popup on click

Trade-off: Less data visible, but 3x faster to implement

---

## Questions?

Check existing implementations:
- Search component: `PlaceSearch.tsx`
- Detail panel: `PlaceDetailPanel.tsx`
- State map: `ChoroplethMap.tsx`

All follow the same patterns (TypeScript, React hooks, Tailwind CSS, API integration).
