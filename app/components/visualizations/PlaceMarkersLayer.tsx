'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { PlaceMarker, loadPlaceMarkers, getGrowthColor, getMarkerSize, createPlacePopup } from '@/lib/place-markers'

interface PlaceMarkersLayerProps {
  onPlaceClick?: (place: PlaceMarker) => void
}

/**
 * PlaceMarkersLayer: Displays 24,535+ geocoded places on an interactive map
 * Features:
 * - Marker clustering for performance at high zoom levels
 * - Color coding by 5-year growth rate
 * - Marker size by permit volume
 * - Click to select and view details
 * - Fully responsive design
 */
export function PlaceMarkersLayer({ onPlaceClick }: PlaceMarkersLayerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const clusterGroupRef = useRef<any | null>(null)

  useEffect(() => {
    // Initialize map only once
    if (mapRef.current) return

    const initializeMap = async () => {
      try {
        // Create map container
        if (!mapContainerRef.current) return

        // Initialize Leaflet map
        mapRef.current = L.map(mapContainerRef.current, {
          center: [39.8, -98.6], // US center
          zoom: 4,
          zoomControl: true,
          scrollWheelZoom: true,
          preferCanvas: true, // Better performance for many markers
        })

        // Add OpenStreetMap base layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 2,
        }).addTo(mapRef.current)

        // Load place markers
        const places = await loadPlaceMarkers()

        if (places.length === 0) {
          console.warn('No places loaded for map')
          return
        }

        // Filter places with coordinates
        const placesWithCoords = places.filter(p => p.latitude !== undefined && p.longitude !== undefined)

        if (placesWithCoords.length === 0) {
          console.warn('No places with coordinates available')
          return
        }

        // Create marker cluster group
        const clusterGroup = L.markerClusterGroup({
          maxClusterRadius: 50,
          disableClusteringAtZoom: 12, // Show individual markers at zoom 12+
          iconCreateFunction: (cluster) => {
            const childCount = cluster.getChildCount()
            let className = 'cluster-icon cluster-icon-small'
            let size = 30

            if (childCount > 100) {
              className = 'cluster-icon cluster-icon-large'
              size = 50
            } else if (childCount > 50) {
              className = 'cluster-icon cluster-icon-medium'
              size = 40
            }

            return L.divIcon({
              html: `<div style="
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                font-weight: 700;
                font-size: 13px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              ">${childCount}</div>`,
              className,
              iconSize: new L.Point(size, size),
            })
          },
        })

        // Add markers to cluster group
        placesWithCoords.forEach(place => {
          if (place.latitude === undefined || place.longitude === undefined) return

          const color = getGrowthColor(place.growth_rate_5yr)
          const size = getMarkerSize(place.recent_units_2024)

          // Create circle marker
          const marker = L.circleMarker([place.latitude, place.longitude], {
            radius: size,
            fillColor: color,
            color: 'white',
            weight: 1.5,
            opacity: 0.9,
            fillOpacity: 0.75,
          })

          // Add popup
          marker.bindPopup(createPlacePopup(place), {
            maxWidth: 250,
            className: 'place-popup',
          })

          // Handle click
          marker.on('click', () => {
            onPlaceClick?.(place)
          })

          // Add to cluster group
          clusterGroup.addLayer(marker)
        })

        // Add cluster group to map
        mapRef.current.addLayer(clusterGroup)
        clusterGroupRef.current = clusterGroup

        // Add zoom hint
        addZoomHint(mapRef.current)

        console.log(`Loaded ${placesWithCoords.length} place markers on map`)
      } catch (error) {
        console.error('Error initializing place markers map:', error)
      }
    }

    initializeMap()

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [onPlaceClick])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Legend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '8px',
        fontSize: '12px',
        padding: '8px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#059669',
          }} />
          <span>Fast Growth (&gt;30%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
          }} />
          <span>Growing (10-30%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#fbbf24',
          }} />
          <span>Stable (0-10%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#f97316',
          }} />
          <span>Declining (-10-0%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#dc2626',
          }} />
          <span>Fast Decline (&lt;-10%)</span>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '600px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Info Text */}
      <div style={{
        fontSize: '12px',
        color: '#666',
        padding: '8px',
        backgroundColor: '#f0f9ff',
        borderRadius: '6px',
        border: '1px solid #bfdbfe',
      }}>
        <strong>Tip:</strong> Zoom in to see individual place markers. Clustered numbers show place count in that area. Marker colors indicate 5-year growth rate.
      </div>
    </div>
  )
}

/**
 * Add zoom level hint
 */
function addZoomHint(map: L.Map) {
  const hint = L.control({ position: 'topright' })

  hint.onAdd = () => {
    const div = L.DomUtil.create('div', 'zoom-hint')
    div.innerHTML = `
      <div style="
        background: white;
        padding: 8px 12px;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        font-size: 12px;
        color: #666;
        white-space: nowrap;
      ">
        <strong>Zoom:</strong> <span id="zoom-level">4</span>
      </div>
    `
    return div
  }

  hint.addTo(map)

  // Update zoom level indicator
  const updateZoom = () => {
    const zoomLevel = document.getElementById('zoom-level')
    if (zoomLevel) {
      zoomLevel.textContent = map.getZoom().toString()
    }
  }

  map.on('zoom', updateZoom)
}

// Styles for cluster icons
const style = document.createElement('style')
style.textContent = `
  .cluster-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-family: system-ui, -apple-system, sans-serif;
    border-radius: 50%;
  }

  .cluster-icon-small {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    font-size: 12px;
  }

  .cluster-icon-medium {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
    color: white;
    font-size: 13px;
  }

  .cluster-icon-large {
    background: linear-gradient(135deg, #172554 0%, #0f172a 100%);
    color: white;
    font-size: 14px;
  }

  .place-popup .leaflet-popup-content-wrapper {
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .place-popup .leaflet-popup-tip {
    background: white;
  }

  .leaflet-container {
    font-family: system-ui, -apple-system, sans-serif;
  }

  .leaflet-control-attribution {
    font-size: 10px;
  }
`
document.head.appendChild(style)
