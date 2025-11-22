'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Fuse from 'fuse.js'
import { Search, MapPin, TrendingUp, TrendingDown } from 'lucide-react'

interface Place {
  place_fips: string
  place_name: string
  state_fips: string
  state_name: string
  recent_units_2024: number
  growth_rate_5yr: number
  mf_share_recent: number
}

interface PlaceSearchProps {
  onPlaceSelect: (place: Place) => void
  placeholder?: string
}

export function PlaceSearch({ onPlaceSelect, placeholder = "Search places..." }: PlaceSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const fuseRef = useRef<Fuse<Place> | null>(null)

  // Load places data
  useEffect(() => {
    fetch('/data/places.json')
      .then(res => res.json())
      .then(data => {
        setPlaces(data)
        fuseRef.current = new Fuse(data, {
          keys: ['place_name', 'state_name'],
          threshold: 0.3,
          includeScore: true,
        })
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load places:', err)
        setIsLoading(false)
      })
  }, [])

  // Search logic
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
    setSelectedIndex(-1)

    if (!searchQuery.trim() || !fuseRef.current) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const searchResults = fuseRef.current.search(searchQuery, { limit: 10 })
    setResults(searchResults.map(r => r.item))
    setShowDropdown(true)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSelect = (place: Place) => {
    onPlaceSelect(place)
    setQuery(place.place_name)
    setShowDropdown(false)
    setSelectedIndex(-1)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={isLoading ? "Loading places..." : placeholder}
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 border border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-[var(--accent-blue)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
        />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((place, index) => (
            <button
              key={place.place_fips}
              onClick={() => handleSelect(place)}
              className={`w-full px-4 py-3 text-left hover:bg-[var(--bg-secondary)] border-b border-[var(--border-default)] last:border-0 ${
                index === selectedIndex ? 'bg-[var(--accent-blue)]/10' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[var(--text-muted)] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{place.place_name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{place.state_name}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {place.recent_units_2024.toLocaleString()} units
                  </p>
                  <p className={`text-xs flex items-center justify-end gap-1 ${
                    place.growth_rate_5yr > 0 ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'
                  }`}>
                    {place.growth_rate_5yr > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {place.growth_rate_5yr > 0 ? '+' : ''}{place.growth_rate_5yr.toFixed(1)}%
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlaceSearch
