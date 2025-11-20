'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, PlaceSearch } from '@/components/ui'
import { TrendingUp, AlertCircle, Calculator, Info, Building2, ArrowRight } from 'lucide-react'

interface Reform {
  place_fips: string
  city_name: string
  state: string
  reform_type: string
  reform_name: string
  reform_year: number
  reform_description: string
  baseline_wrluri: number
}

interface Place {
  place_fips: string
  place_name: string
  state_fips: string
  state_name: string
  recent_units_2024: number
  growth_rate_5yr: number
  mf_share_recent: number
}

interface Prediction {
  predicted_increase_pct: number
  confidence_interval: [number, number]
  baseline_permits: number
  predicted_permits: number
  model_version: string
}

/**
 * ReformImpactCalculator: Interactive tool for policymakers
 * to predict permit impact from zoning reforms
 */
export function ReformImpactCalculator() {
  const [reforms, setReforms] = useState<Reform[]>([])
  const [reformTypes, setReformTypes] = useState<string[]>([])
  const [selectedReformType, setSelectedReformType] = useState<string>('')
  const [selectedReform, setSelectedReform] = useState<Reform | null>(null)
  const [selectedCity, setSelectedCity] = useState<Place | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load reforms on mount
  useEffect(() => {
    const loadReforms = async () => {
      try {
        const response = await fetch('/api/reforms/list')
        const data = await response.json()
        setReforms(data)

        // Get unique reform types
        const types = [...new Set(data.map((r: Reform) => r.reform_type))] as string[]
        setReformTypes(types.sort())
      } catch (err) {
        console.error('Error loading reforms:', err)
      }
    }
    loadReforms()
  }, [])

  // Filter reforms by selected type
  const filteredReforms = selectedReformType
    ? reforms.filter(r => r.reform_type === selectedReformType)
    : reforms

  const handlePredictClick = async () => {
    if (!selectedReform || !selectedCity) {
      setError('Please select both a reform type and a city')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reforms/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city_name: selectedCity.place_name,
          state: selectedCity.state_name,
          reform_type: selectedReform.reform_type,
          place_permits_2024: selectedCity.recent_units_2024,
          place_growth_rate_5yr: selectedCity.growth_rate_5yr,
          place_mf_share: selectedCity.mf_share_recent,
          baseline_wrluri: selectedReform.baseline_wrluri,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPrediction(data)
      } else {
        setError(data.error || 'Prediction failed')
      }
    } catch (err) {
      setError('Error making prediction')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedReformType('')
    setSelectedReform(null)
    setSelectedCity(null)
    setPrediction(null)
    setError(null)
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Zoning Reform Impact Calculator
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Predict how a zoning reform will affect building permits in your city
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Step 1: Select Reform Type */}
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Select Reform Type
            </h3>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedReformType}
              onChange={(e) => {
                setSelectedReformType(e.target.value)
                setSelectedReform(null)
                setPrediction(null)
              }}
            >
              <option value="">Choose a reform type...</option>
              {reformTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Specific Reform */}
          {selectedReformType && (
            <div className="border-l-4 border-indigo-500 pl-4 py-2">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                Choose Example City
              </h3>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedReform ? `${selectedReform.place_fips}` : ''}
                onChange={(e) => {
                  const reform = filteredReforms.find(r => r.place_fips === e.target.value)
                  setSelectedReform(reform || null)
                  setPrediction(null)
                }}
              >
                <option value="">Choose a city that implemented this reform...</option>
                {filteredReforms.map((reform) => (
                  <option key={reform.place_fips} value={reform.place_fips}>
                    {reform.city_name}, {reform.state} ({reform.reform_year})
                  </option>
                ))}
              </select>

              {selectedReform && (
                <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm">
                  <p className="font-semibold text-indigo-900">{selectedReform.reform_name}</p>
                  <p className="text-indigo-700 mt-1">{selectedReform.reform_description}</p>
                  <div className="mt-2 flex gap-4 text-xs text-indigo-600">
                    <span>Year: {selectedReform.reform_year}</span>
                    <span>WRLURI: {selectedReform.baseline_wrluri.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Target City */}
          {selectedReform && (
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                Select Your City
              </h3>
              <PlaceSearch
                onPlaceSelect={(place) => {
                  setSelectedCity(place)
                  setPrediction(null)
                }}
                placeholder="Search for your city..."
              />

              {selectedCity && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm">
                  <p className="font-semibold text-green-900">
                    {selectedCity.place_name}, {selectedCity.state_name}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-green-600">2024 Permits</span>
                      <p className="font-medium text-green-900">{selectedCity.recent_units_2024.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-green-600">5yr Growth</span>
                      <p className="font-medium text-green-900">{selectedCity.growth_rate_5yr.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-green-600">MF Share</span>
                      <p className="font-medium text-green-900">{selectedCity.mf_share_recent.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Get Prediction */}
          {selectedReform && selectedCity && (
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                Calculate Impact
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handlePredictClick}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      Predict Impact
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Results */}
          {prediction && (
            <div className="border-t pt-5 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Predicted Impact
              </h3>

              {/* Main Prediction */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Expected permit increase</p>
                  <p className={`text-4xl font-bold ${prediction.predicted_increase_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {prediction.predicted_increase_pct > 0 ? '+' : ''}
                    {prediction.predicted_increase_pct.toFixed(1)}%
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-700">
                    <span>{prediction.baseline_permits.toLocaleString()} units</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="font-semibold">{prediction.predicted_permits.toLocaleString()} units/year</span>
                  </div>
                </div>
              </div>

              {/* Confidence Interval */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold mb-2">Confidence Range (95%)</p>
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>
                    {prediction.confidence_interval[0].toFixed(1)}%
                  </span>
                  <span className="font-semibold">
                    {prediction.predicted_increase_pct.toFixed(1)}%
                  </span>
                  <span>
                    {prediction.confidence_interval[1].toFixed(1)}%
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 relative">
                  <div
                    className="absolute h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                    style={{
                      left: '10%',
                      width: '80%',
                    }}
                  />
                  <div
                    className="absolute h-3 w-1 bg-purple-600 rounded-full -top-0.5"
                    style={{
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
              </div>

              {/* Insights */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm font-semibold mb-1 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Key Factors
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>- Reform type: <strong>{selectedReform.reform_type}</strong></li>
                  <li>- Market growth rate: <strong>{selectedCity.growth_rate_5yr.toFixed(1)}%</strong></li>
                  <li>- Multi-family share: <strong>{selectedCity.mf_share_recent.toFixed(1)}%</strong></li>
                  <li>- Regulatory environment (WRLURI): <strong>{selectedReform.baseline_wrluri.toFixed(2)}</strong></li>
                </ul>
              </div>

              {/* Model Info */}
              <div className="text-xs text-gray-500 text-center">
                Model version: {prediction.model_version}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-2">
          <p>
            This calculator uses a predictive model trained on 30+ cities with documented zoning reforms.
          </p>
          <p>
            Predictions consider reform type, local market conditions, and regulatory environment.
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Note: Use as one input among many for policy decisions. Actual outcomes depend on many factors.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReformImpactCalculator
