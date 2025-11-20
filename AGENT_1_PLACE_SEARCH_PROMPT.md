# AGENT 1: Place Search Component with Fuse.js

**Target Environment:** Claude Code Web (independent session)
**Budget:** $0 (free tools only)
**Task:** Build searchable place finder with autocomplete

---

## Self-Contained Task

Build a React search component that lets users find any of 24,535+ US places from Census data. Component should have autocomplete, fuzzy matching, and filtering.

**Deliverables:**
1. `app/components/ui/PlaceSearch.tsx` - Search component with Fuse.js
2. `app/app/api/places/search/route.ts` - Search API endpoint
3. `public/data/places.json` - Search index (converted from CSV)
4. Update `app/app/page.tsx` - Integrate search into dashboard

---

## Data Schema

Your data file will be generated from: `data/outputs/place_metrics_comprehensive.csv`

**Column structure** (this file exists after running scripts 20-22):
```
place_fips,place_name,state_fips,location_type,recent_units_2024,
recent_units_2023,prior_units_2022,growth_rate_2yr,growth_rate_5yr,
growth_rate_10yr,avg_annual_units,volatility_cv,mf_share_recent,
mf_share_all_time,sf_share_all_time,mf_units_total,sf_units_total,
mf_trend,total_units_all,years_available,first_year,last_year,
rank_permits_national,rank_growth_national,rank_permits_state,rank_growth_state
```

**Sample rows:**
```
01001,Adamsville city,01,...,145,128,110,+13.3%,+8.2%,+2.1%,85,0.45,28.3%,25.1%,...
06001,Acton city,06,...,98,102,95,+3.9%,-1.2%,+0.8%,62,0.52,12.5%,15.3%,...
```

**Expected data stats:**
- ~24,535 places total
- Fields: growth rates, MF share, rankings, permit counts
- Ready to convert to JSON for client-side search

---

## Implementation Instructions

### Step 1: Convert CSV to JSON for Client-Side Search

Create script to convert the metrics CSV to searchable JSON:

```python
import pandas as pd
import json

# Read the comprehensive metrics CSV
df = pd.read_csv('data/outputs/place_metrics_comprehensive.csv', dtype={'state_fips': str})

# Select relevant columns for search/display
search_cols = [
    'place_fips', 'place_name', 'state_fips', 'recent_units_2024',
    'growth_rate_5yr', 'mf_share_recent', 'rank_permits_national',
    'rank_growth_national'
]

df_search = df[search_cols].fillna(0)

# Convert to list of dicts
places = df_search.to_dict('records')

# Write to public folder for client access
with open('public/data/places.json', 'w') as f:
    json.dump(places, f)

print(f"Created search index: {len(places)} places")
```

Run this: `python convert_to_json.py`
Creates: `public/data/places.json` (~8-10 MB)

### Step 2: Create Search API Route

**File:** `app/app/api/places/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Place {
  place_fips: string
  place_name: string
  state_fips: string
  recent_units_2024: number
  growth_rate_5yr: number
  mf_share_recent: number
  rank_permits_national: number
  rank_growth_national: number
}

let placesCache: Place[] | null = null

function loadPlaces(): Place[] {
  if (placesCache) return placesCache

  const filePath = path.join(process.cwd(), 'public/data/places.json')
  const data = fs.readFileSync(filePath, 'utf-8')
  placesCache = JSON.parse(data)
  return placesCache
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q') || ''
  const state = searchParams.get('state') || ''
  const limit = parseInt(searchParams.get('limit') || '20')

  const places = loadPlaces()

  // Filter by state if specified
  let filtered = state
    ? places.filter(p => p.state_fips === state)
    : places

  // Filter by search query (simple substring, Fuse.js will do fuzzy on client)
  if (q) {
    const query = q.toLowerCase()
    filtered = filtered.filter(p =>
      p.place_name.toLowerCase().includes(query)
    )
  }

  // Sort by permit volume
  filtered = filtered.sort((a, b) => b.recent_units_2024 - a.recent_units_2024)

  return NextResponse.json({
    results: filtered.slice(0, limit),
    total: filtered.length,
    query: q
  })
}
```

### Step 3: Create Search Component

**File:** `app/components/ui/PlaceSearch.tsx`

```typescript
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, MapPin } from 'lucide-react'

interface Place {
  place_fips: string
  place_name: string
  state_fips: string
  recent_units_2024: number
  growth_rate_5yr: number
  mf_share_recent: number
}

interface PlaceSearchProps {
  onPlaceSelect?: (place: Place) => void
  placeholder?: string
}

export function PlaceSearch({
  onPlaceSelect,
  placeholder = 'Search 24,535+ places...'
}: PlaceSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Load places data and initialize Fuse.js
  const placesRef = useRef<Place[]>([])
  const fuseRef = useRef<any>(null)

  useEffect(() => {
    // Load places data for client-side search
    const loadPlaces = async () => {
      try {
        const response = await fetch('/data/places.json')
        const places = await response.json()
        placesRef.current = places

        // Initialize Fuse.js for fuzzy search
        const Fuse = (await import('fuse.js')).default
        fuseRef.current = new Fuse(places, {
          keys: ['place_name', 'state_fips'],
          threshold: 0.3, // Allow ~30% fuzzy matching
          includeScore: true,
          limit: 20
        })
      } catch (error) {
        console.error('Failed to load places:', error)
      }
    }

    loadPlaces()
  }, [])

  // Search with Fuse.js
  const handleSearch = (value: string) => {
    setQuery(value)
    setSelectedIndex(-1)

    if (!value.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    if (fuseRef.current) {
      const fuse = fuseRef.current
      const searchResults = fuse.search(value)
      setResults(searchResults.map(r => r.item))
      setIsOpen(true)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => (i < results.length - 1 ? i + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => (i > 0 ? i - 1 : results.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelectPlace(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const handleSelectPlace = (place: Place) => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    onPlaceSelect?.(place)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          <div className="max-h-96 overflow-y-auto">
            {results.map((place, index) => (
              <button
                key={place.place_fips}
                onClick={() => handleSelectPlace(place)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {place.place_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        State {place.state_fips}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-900">
                      {place.recent_units_2024.toLocaleString()} units
                    </div>
                    <div className={`text-xs ${
                      place.growth_rate_5yr > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {place.growth_rate_5yr > 0 ? '+' : ''}{place.growth_rate_5yr.toFixed(1)}% growth
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {results.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
              {results.length} place{results.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {isOpen && query && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-lg">
          No places found matching "{query}"
        </div>
      )}
    </div>
  )
}
```

### Step 4: Update Dashboard

**File:** `app/app/page.tsx` (add to imports and component)

```typescript
import { PlaceSearch } from '@/components/ui/PlaceSearch'

// In your dashboard component:
export default function Dashboard() {
  const [selectedPlace, setSelectedPlace] = useState<any>(null)

  return (
    <div>
      {/* Add search to top navigation */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Find Any US Place
          </h2>
          <PlaceSearch
            onPlaceSelect={(place) => {
              setSelectedPlace(place)
              // Navigate to place or show panel
            }}
          />
        </div>
      </div>

      {/* Show selected place details below */}
      {selectedPlace && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          Selected: {selectedPlace.place_name}
          {/* Will be populated by Agent 2 */}
        </div>
      )}

      {/* Rest of dashboard */}
    </div>
  )
}
```

---

## Installation

```bash
# Install Fuse.js if not already installed
npm install fuse.js

# Run conversion script
python convert_to_json.py

# Build and test
npm run dev
```

---

## Testing

1. Start dev server: `npm run dev`
2. Navigate to dashboard
3. Click search box
4. Type place name (e.g., "los ang", "austin", "brooklyn")
5. Verify fuzzy matching works (e.g., "los ang" finds "Los Angeles")
6. Verify results show growth rate and permit volume
7. Verify keyboard navigation (up/down arrows, enter to select)

---

## Success Criteria

- [ ] PlaceSearch component renders
- [ ] Fuse.js initializes with 24,535 places
- [ ] Fuzzy search returns results (try "los ang" → "Los Angeles")
- [ ] Shows recent permits and 5-year growth
- [ ] Keyboard navigation works (arrows, enter, escape)
- [ ] Click outside closes dropdown
- [ ] Component exports from index
- [ ] Integrated into dashboard page

---

## Files Created/Modified

**New:**
- `app/components/ui/PlaceSearch.tsx` (250 lines)
- `app/app/api/places/search/route.ts` (50 lines)
- `public/data/places.json` (~8 MB, generated)
- `convert_places_to_json.py` (20 lines)

**Modified:**
- `app/app/page.tsx` (add imports, integrate component)
- `app/components/ui/index.ts` (export PlaceSearch)

---

## Commit Message

```
Phase 1.2: Add Place Search component with Fuse.js autocomplete

- Create PlaceSearch.tsx with fuzzy matching on 24,535 places
- Implement Fuse.js for fast client-side search (<50ms)
- Add search API route for server-side filtering
- Convert place_metrics_comprehensive.csv to JSON search index
- Integrate search into dashboard header
- Keyboard navigation: arrows, enter, escape
- Shows recent permits and 5-year growth in results

Files:
- app/components/ui/PlaceSearch.tsx (250 lines, fuzzy search component)
- app/app/api/places/search/route.ts (50 lines, API endpoint)
- public/data/places.json (generated, 24,535 places)
- convert_places_to_json.py (script to generate search index)

Cost: $0 (Fuse.js is free and client-side)
Performance: <50ms search on 24K records
```

---

## Expected Runtime

- Create component: 20 min
- Test and refine: 10 min
- **Total: ~30 minutes**

---

## Questions/Issues

If `places.json` not found:
- Run: `python convert_places_to_json.py`
- Verify file: `ls -la public/data/places.json`

If Fuse.js not found:
- Install: `npm install fuse.js`

If component doesn't appear:
- Check: `app/components/ui/index.ts` exports PlaceSearch
- Check: `app/app/page.tsx` imports PlaceSearch

---

**Status:** Ready to begin
**Environment:** Claude Code Web (independent)
**Parallel with:** AGENT 2 and AGENT 3
