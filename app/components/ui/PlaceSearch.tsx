'use client'

import React, { useState, useEffect, useRef } from 'react'

interface Place {
  place_fips: string
  place_name: string
  state_fips: string
  recent_units_2024: number
  growth_rate_5yr: number
  mf_share_recent: number
  rank_permits_national?: number
  rank_growth_national?: number
}

interface PlaceSearchProps {
  onPlaceSelect?: (place: Place) => void
  placeholder?: string
}

export function PlaceSearch({
  onPlaceSelect,
  placeholder = 'Search places...'
}: PlaceSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [placesCount, setPlacesCount] = useState(0)
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
        setPlacesCount(places.length)

        // Initialize Fuse.js for fuzzy search
        const Fuse = (await import('fuse.js')).default
        fuseRef.current = new Fuse(places, {
          keys: ['place_name', 'state_fips'],
          threshold: 0.3, // Allow ~30% fuzzy matching
          includeScore: true,
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
      const searchResults = fuse.search(value).slice(0, 20)
      setResults(searchResults.map((r: any) => r.item))
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

  // State name mapping
  const stateNames: Record<string, string> = {
    '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
    '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
    '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
    '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
    '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
    '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
    '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
    '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
    '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
    '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
    '56': 'WY'
  }

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placesCount > 0 ? `Search ${placesCount.toLocaleString()} places...` : placeholder}
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
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="font-medium text-gray-900">
                        {place.place_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {stateNames[place.state_fips] || place.state_fips}
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
