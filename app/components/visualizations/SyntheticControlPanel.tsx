'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface SCMAnalysis {
  treated_city: string;
  treated_fips: string;
  reform_type: string;
  adoption_year: number;
  treatment_effect_pct: number;
  treatment_effect_permits: number;
  pre_treatment_fit_rmse: number;
  donor_pool_size: number;
  interpretation: string;
}

interface SCMDetail {
  treated_city: string;
  treated_fips: string;
  reform_type: string;
  adoption_year: number;
  synthetic_city: string;
  treatment_effect: number;
  treatment_effect_pct: number;
  pre_treatment_fit_rmse: number;
  donor_weights: Record<string, number>;
  top_donors: string[];
  time_series: {
    pre_years: number[];
    post_years: number[];
    treated_permits_pre: number[];
    synthetic_permits_pre: number[];
    treated_permits_post: number[];
    synthetic_permits_post: number[];
    treatment_effect_post: number[];
  };
  interpretation: string;
}

interface SCMData {
  generated_at: string;
  n_analyses: number;
  summary: {
    mean_effect_pct: number;
    median_effect_pct: number;
    positive_effects: number;
    negative_effects: number;
  };
  analyses: SCMAnalysis[];
}

export default function SyntheticControlPanel() {
  const [data, setData] = useState<SCMData | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedReform, setSelectedReform] = useState<string>('');
  const [cityDetail, setCityDetail] = useState<SCMDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/causal-analysis/scm');
        if (!response.ok) throw new Error('Failed to fetch SCM data');
        const result = await response.json();
        setData(result);

        // Set default selections
        if (result.analyses?.length > 0) {
          setSelectedCity(result.analyses[0].treated_fips);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load city detail when selection changes
  useEffect(() => {
    if (!selectedCity) return;

    const fetchDetail = async () => {
      try {
        setDetailLoading(true);
        const response = await fetch(`/api/causal-analysis/scm?city_fips=${selectedCity}`);
        if (!response.ok) throw new Error('Failed to fetch city detail');
        const result = await response.json();
        setCityDetail(result);
      } catch (err) {
        console.error('Error loading city detail:', err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedCity]);

  if (loading) return <div className="p-4 text-gray-500">Loading SCM analysis...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-4 text-gray-500">No SCM analysis available</div>;

  // Get unique reform types
  const reformTypes = [...new Set(data.analyses.map((a) => a.reform_type))];

  // Filter cities by reform type
  const filteredCities = selectedReform
    ? data.analyses.filter((a) => a.reform_type === selectedReform)
    : data.analyses;

  // Prepare chart data
  const chartData = cityDetail
    ? [
        ...cityDetail.time_series.pre_years.map((year, i) => ({
          year,
          treated: cityDetail.time_series.treated_permits_pre[i],
          synthetic: cityDetail.time_series.synthetic_permits_pre[i],
        })),
        ...cityDetail.time_series.post_years.map((year, i) => ({
          year,
          treated: cityDetail.time_series.treated_permits_post[i],
          synthetic: cityDetail.time_series.synthetic_permits_post[i],
        })),
      ]
    : [];

  const getColorClass = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">
        Synthetic Control Method Analysis
      </h2>

      {/* Summary Stats */}
      <Card className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
        <h3 className="font-semibold text-gray-700 mb-3">Analysis Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Cities Analyzed</p>
            <p className="text-lg font-bold text-gray-900">{data.n_analyses}</p>
          </div>
          <div>
            <p className="text-gray-500">Mean Effect</p>
            <p className={`text-lg font-bold ${getColorClass(data.summary.mean_effect_pct)}`}>
              {data.summary.mean_effect_pct > 0 ? '+' : ''}{data.summary.mean_effect_pct.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500">Positive Effects</p>
            <p className="text-lg font-bold text-green-600">{data.summary.positive_effects}</p>
          </div>
          <div>
            <p className="text-gray-500">Negative Effects</p>
            <p className="text-lg font-bold text-red-600">{data.summary.negative_effects}</p>
          </div>
        </div>
      </Card>

      {/* City Selection */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Select City for Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Reform Type</label>
            <select
              className="w-full p-2 border rounded-md bg-white"
              value={selectedReform}
              onChange={(e) => {
                setSelectedReform(e.target.value);
                // Reset city selection when reform changes
                const cities = e.target.value
                  ? data.analyses.filter((a) => a.reform_type === e.target.value)
                  : data.analyses;
                if (cities.length > 0) {
                  setSelectedCity(cities[0].treated_fips);
                }
              }}
            >
              <option value="">All Reform Types</option>
              {reformTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">City</label>
            <select
              className="w-full p-2 border rounded-md bg-white"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {filteredCities.map((city) => (
                <option key={city.treated_fips} value={city.treated_fips}>
                  {city.treated_city} ({city.treatment_effect_pct > 0 ? '+' : ''}{city.treatment_effect_pct.toFixed(1)}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Visual Comparison Chart */}
      {detailLoading ? (
        <Card className="p-4">
          <div className="h-64 flex items-center justify-center text-gray-500">
            Loading city analysis...
          </div>
        </Card>
      ) : cityDetail ? (
        <>
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700 mb-3">
              {cityDetail.treated_city} vs Synthetic Control
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'Permits/Year', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine
                    x={cityDetail.adoption_year}
                    stroke="#666"
                    strokeDasharray="5 5"
                    label={{ value: 'Reform', position: 'top' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="treated"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name={cityDetail.treated_city}
                    dot={{ fill: '#2563eb' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="synthetic"
                    stroke="#f97316"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Synthetic Control"
                    dot={{ fill: '#f97316' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Gap between lines post-reform represents the treatment effect attributable to {cityDetail.reform_type}
            </p>
          </Card>

          {/* Donor Cities */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Donor Pool Weights</h3>
            <p className="text-sm text-gray-600 mb-3">
              {cityDetail.synthetic_city}
            </p>
            <div className="space-y-2">
              {Object.entries(cityDetail.donor_weights)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([donor, weight]) => (
                  <div key={donor} className="flex items-center">
                    <div className="flex-1">
                      <div
                        className="h-4 bg-orange-400 rounded"
                        style={{ width: `${weight * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-600 w-16 text-right">
                      {(weight * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </Card>

          {/* Pre-Treatment Fit Quality */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Pre-Treatment Fit Quality</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">RMSE</p>
                <p className="text-xl font-bold text-gray-900">
                  {cityDetail.pre_treatment_fit_rmse.toFixed(2)}
                </p>
                {cityDetail.pre_treatment_fit_rmse > 10 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Synthetic match not perfect; interpret results cautiously
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-sm">Treatment Effect</p>
                <p className={`text-xl font-bold ${getColorClass(cityDetail.treatment_effect_pct)}`}>
                  {cityDetail.treatment_effect_pct > 0 ? '+' : ''}{cityDetail.treatment_effect_pct.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">
                  ({cityDetail.treatment_effect > 0 ? '+' : ''}{cityDetail.treatment_effect.toFixed(0)} permits/yr)
                </p>
              </div>
            </div>
          </Card>

          {/* Results Summary */}
          <Card className="p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-2">Results Interpretation</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {cityDetail.interpretation}
            </p>
          </Card>
        </>
      ) : null}

      {/* Methodology Note */}
      <Card className="p-4 border-l-4 border-l-orange-500">
        <h3 className="font-semibold text-gray-700 mb-2">About Synthetic Control Method</h3>
        <p className="text-sm text-gray-600">
          SCM constructs a weighted combination of control cities that closely matches
          the treated city&apos;s pre-reform characteristics. The gap between the actual
          and synthetic post-reform outcomes represents the causal effect of the reform.
          This method is particularly useful for single city case studies.
        </p>
      </Card>
    </div>
  );
}
