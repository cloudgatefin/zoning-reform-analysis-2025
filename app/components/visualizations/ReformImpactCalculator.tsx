"use client"

import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Reform {
  place_fips: string
  city_name: string
  state_name: string
  reform_name: string
  reform_type: string
  effective_date: string
  baseline_wrluri: number
}

interface PredictionResult {
  predicted_change: number
  confidence: 'high' | 'medium' | 'low'
  factors: {
    reform_type_effect: number
    wrluri_effect: number
    base_effect: number
  }
  comparable_cities: string[]
}

export function ReformImpactCalculator() {
  const [reforms, setReforms] = useState<Reform[]>([])
  const [selectedReform, setSelectedReform] = useState<Reform | null>(null)
  const [customWrluri, setCustomWrluri] = useState<number>(1.0)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load reforms on mount
  useEffect(() => {
    async function loadReforms() {
      try {
        const res = await fetch('/api/reforms/list')
        if (!res.ok) throw new Error('Failed to load reforms')
        const data = await res.json()
        setReforms(data)
      } catch (err) {
        setError('Failed to load reforms database')
        console.error(err)
      }
    }
    loadReforms()
  }, [])

  // Make prediction
  const handlePredict = async () => {
    if (!selectedReform) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/reforms/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reform_type: selectedReform.reform_type,
          wrluri: customWrluri,
          city_name: selectedReform.city_name,
          state_name: selectedReform.state_name
        })
      })

      if (!res.ok) throw new Error('Prediction failed')
      const result = await res.json()
      setPrediction(result)
    } catch (err) {
      setError('Failed to generate prediction')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Get unique reform types
  const reformTypes = [...new Set(reforms.map(r => r.reform_type))]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Reform Impact Calculator</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Select Reform Type or City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select a Reform Example
          </label>
          <select
            className="w-full p-2 border rounded-lg bg-white"
            value={selectedReform?.place_fips || ''}
            onChange={(e) => {
              const reform = reforms.find(r => r.place_fips === e.target.value)
              setSelectedReform(reform || null)
              if (reform) setCustomWrluri(reform.baseline_wrluri)
            }}
          >
            <option value="">Choose a city...</option>
            {reformTypes.map(type => (
              <optgroup key={type} label={type}>
                {reforms
                  .filter(r => r.reform_type === type)
                  .map(r => (
                    <option key={r.place_fips} value={r.place_fips}>
                      {r.city_name}, {r.state_name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* WRLURI Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regulatory Restrictiveness (WRLURI)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="3"
            value={customWrluri}
            onChange={(e) => setCustomWrluri(parseFloat(e.target.value) || 0)}
            className="w-full p-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Scale: 0 (least restrictive) to 3 (most restrictive)
          </p>
        </div>
      </div>

      {/* Selected Reform Details */}
      {selectedReform && (
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="font-medium text-purple-900">{selectedReform.reform_name}</p>
          <p className="text-sm text-purple-700">
            {selectedReform.reform_type} · Effective {new Date(selectedReform.effective_date).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Predict Button */}
      <button
        onClick={handlePredict}
        disabled={!selectedReform || loading}
        className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium
                   hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            Calculating...
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4" />
            Predict Reform Impact
          </>
        )}
      </button>

      {/* Prediction Results */}
      {prediction && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Prediction Results
          </h4>

          {/* Main Result */}
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-purple-600">
              {prediction.predicted_change > 0 ? '+' : ''}
              {prediction.predicted_change.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Estimated change in building permits
            </p>
            <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
              prediction.confidence === 'high' ? 'bg-green-100 text-green-800' :
              prediction.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {prediction.confidence.toUpperCase()} confidence
            </span>
          </div>

          {/* Factor Breakdown */}
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Contributing Factors:</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded border">
                <p className="font-semibold">{prediction.factors.reform_type_effect > 0 ? '+' : ''}{prediction.factors.reform_type_effect.toFixed(1)}%</p>
                <p className="text-gray-500">Reform Type</p>
              </div>
              <div className="p-2 bg-white rounded border">
                <p className="font-semibold">{prediction.factors.wrluri_effect > 0 ? '+' : ''}{prediction.factors.wrluri_effect.toFixed(1)}%</p>
                <p className="text-gray-500">WRLURI Effect</p>
              </div>
              <div className="p-2 bg-white rounded border">
                <p className="font-semibold">{prediction.factors.base_effect > 0 ? '+' : ''}{prediction.factors.base_effect.toFixed(1)}%</p>
                <p className="text-gray-500">Base Effect</p>
              </div>
            </div>
          </div>

          {/* Comparable Cities */}
          {prediction.comparable_cities.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Similar Reforms:</p>
              <p className="text-xs text-gray-600">
                {prediction.comparable_cities.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Footer */}
      <p className="text-xs text-gray-500 mt-4">
        Predictions based on analysis of {reforms.length} documented zoning reforms.
        Results are estimates and actual impacts may vary based on local conditions.
      </p>
    </div>
  )
}

export default ReformImpactCalculator
