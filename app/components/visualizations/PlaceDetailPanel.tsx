'use client'

import React, { useState, useEffect } from 'react'
import { X, Building2, TrendingUp, TrendingDown, Home, Building, Calendar } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface PlaceDetails {
  place_fips: string
  place_name: string
  state_name: string
  population: number
  recent_units_2024: number
  growth_rate_5yr: number
  mf_share_recent: number
  total_units_5yr: number
  sf_units_5yr: number
  mf_units_5yr: number
}

interface PermitRecord {
  year: number
  single_family: number
  multi_family: number
  total_units: number
}

interface Reform {
  reform_name: string
  reform_type: string
  effective_date: string
}

interface PlaceDetailPanelProps {
  placeFips: string
  onClose: () => void
}

export function PlaceDetailPanel({ placeFips, onClose }: PlaceDetailPanelProps) {
  const [details, setDetails] = useState<PlaceDetails | null>(null)
  const [permits, setPermits] = useState<PermitRecord[]>([])
  const [reforms, setReforms] = useState<Reform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      fetch(`/api/places/${placeFips}`).then(r => r.json()),
      fetch(`/api/places/${placeFips}/permits`).then(r => r.json()),
      fetch(`/api/places/${placeFips}/reforms`).then(r => r.json()),
    ])
      .then(([detailsData, permitsData, reformsData]) => {
        setDetails(detailsData)
        setPermits(permitsData.permits || [])
        setReforms(reformsData.reforms || [])
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load place details')
        setLoading(false)
      })
  }, [placeFips])

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading place details...</span>
        </div>
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <p className="text-red-600">{error || 'Place not found'}</p>
      </div>
    )
  }

  // Chart data
  const chartData = {
    labels: permits.map(p => p.year.toString()),
    datasets: [
      {
        label: 'Single Family',
        data: permits.map(p => p.single_family),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Multi Family',
        data: permits.map(p => p.multi_family),
        backgroundColor: 'rgba(147, 51, 234, 0.7)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{details.place_name}</h2>
            <p className="text-gray-600">{details.state_name}</p>
            {details.population > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Population: {details.population.toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 2024 Permits */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">2024 Permits</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {details.recent_units_2024.toLocaleString()}
            </p>
          </div>

          {/* Growth Rate */}
          <div className={`p-4 rounded-lg ${
            details.growth_rate_5yr > 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {details.growth_rate_5yr > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                details.growth_rate_5yr > 0 ? 'text-green-900' : 'text-red-900'
              }`}>5yr Growth</span>
            </div>
            <p className={`text-2xl font-bold ${
              details.growth_rate_5yr > 0 ? 'text-green-900' : 'text-red-900'
            }`}>
              {details.growth_rate_5yr > 0 ? '+' : ''}{details.growth_rate_5yr.toFixed(1)}%
            </p>
          </div>

          {/* MF Share */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">MF Share</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {details.mf_share_recent.toFixed(1)}%
            </p>
          </div>

          {/* 5yr Total */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">5yr Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {details.total_units_5yr.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Permit History Chart */}
      {permits.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Permit History</h3>
          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Reforms */}
      {reforms.length > 0 && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zoning Reforms</h3>
          <div className="space-y-3">
            {reforms.map((reform, idx) => (
              <div key={idx} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">{reform.reform_name}</p>
                    <p className="text-sm text-amber-700">{reform.reform_type}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Effective: {new Date(reform.effective_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaceDetailPanel
