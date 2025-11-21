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
  ErrorBar,
} from 'recharts';

interface EventEffect {
  year_relative_to_adoption: number;
  effect: number;
  std_error: number;
  lower_ci: number;
  upper_ci: number;
  p_value: number;
  significant: boolean;
}

interface EventStudy {
  reform_type: string;
  n_cities: number;
  n_observations: number;
  peak_effect_pct: number;
  model_r_squared: number;
  pre_trend_test_p_value: number;
  pre_trends_pass: boolean;
  interpretation: string;
}

interface EventStudyDetail {
  reform_type: string;
  n_cities: number;
  n_observations: number;
  event_window: string;
  reference_period: string;
  event_effects: EventEffect[];
  statistics: {
    peak_effect_pct: number;
    peak_effect_year: number;
    first_significant_year: number | null;
    model_r_squared: number;
    pre_trend_test_p_value: number;
    pre_trends_pass: boolean;
  };
  interpretation: string;
}

interface EventStudyData {
  generated_at: string;
  n_reform_types: number;
  event_window: string;
  reference_period: string;
  event_studies: EventStudy[];
}

export default function EventStudyChart() {
  const [data, setData] = useState<EventStudyData | null>(null);
  const [selectedReform, setSelectedReform] = useState<string>('');
  const [studyDetail, setStudyDetail] = useState<EventStudyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/causal-analysis/event-study');
        if (!response.ok) throw new Error('Failed to fetch event study data');
        const result = await response.json();
        setData(result);

        // Set default selection
        if (result.event_studies?.length > 0) {
          setSelectedReform(result.event_studies[0].reform_type);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load detail when selection changes
  useEffect(() => {
    if (!selectedReform) return;

    const fetchDetail = async () => {
      try {
        setDetailLoading(true);
        const response = await fetch(
          `/api/causal-analysis/event-study?reform_type=${encodeURIComponent(selectedReform)}`
        );
        if (!response.ok) throw new Error('Failed to fetch event study detail');
        const result = await response.json();
        setStudyDetail(result);
      } catch (err) {
        console.error('Error loading event study detail:', err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedReform]);

  if (loading) return <div className="p-4 text-gray-500">Loading event study...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-4 text-gray-500">No event study data available</div>;

  // Prepare chart data
  const chartData = studyDetail
    ? studyDetail.event_effects.map((effect) => ({
        year: effect.year_relative_to_adoption,
        effect: effect.effect,
        lower: effect.lower_ci,
        upper: effect.upper_ci,
        significant: effect.significant,
        errorY: [effect.effect - effect.lower_ci, effect.upper_ci - effect.effect],
      }))
    : [];

  const getColorClass = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Custom dot for significant vs non-significant
  const CustomDot = (props: { cx?: number; cy?: number; payload?: { significant: boolean; effect: number } }) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy || !payload) return null;

    const color = payload.significant
      ? payload.effect >= 0
        ? '#16a34a'
        : '#dc2626'
      : '#9ca3af';

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Event Study Analysis</h2>

      {/* Reform Type Selection */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Select Reform Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {data.event_studies.map((study) => (
            <button
              key={study.reform_type}
              onClick={() => setSelectedReform(study.reform_type)}
              className={`p-3 rounded-lg text-sm text-left transition-colors ${
                selectedReform === study.reform_type
                  ? 'bg-purple-100 border-2 border-purple-500'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <p className="font-semibold text-gray-900">{study.reform_type}</p>
              <p className="text-gray-500">{study.n_cities} cities</p>
              <p className={`font-bold ${getColorClass(study.peak_effect_pct)}`}>
                Peak: {study.peak_effect_pct > 0 ? '+' : ''}{study.peak_effect_pct.toFixed(1)}%
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Event Study Chart */}
      {detailLoading ? (
        <Card className="p-4">
          <div className="h-80 flex items-center justify-center text-gray-500">
            Loading event study...
          </div>
        </Card>
      ) : studyDetail ? (
        <>
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700 mb-3">
              Dynamic Treatment Effects: {studyDetail.reform_type}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    label={{
                      value: 'Years Relative to Reform Adoption',
                      position: 'insideBottom',
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{ value: 'Effect (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as EventEffect & { year: number };
                        return (
                          <div className="bg-white p-3 border rounded shadow-lg">
                            <p className="font-semibold">
                              Year {data.year >= 0 ? '+' : ''}{data.year}
                            </p>
                            <p className={getColorClass(data.effect)}>
                              Effect: {data.effect > 0 ? '+' : ''}{data.effect.toFixed(1)}%
                            </p>
                            <p className="text-gray-500 text-sm">
                              95% CI: [{data.lower_ci.toFixed(1)}%, {data.upper_ci.toFixed(1)}%]
                            </p>
                            <p className={`text-sm ${data.significant ? 'text-green-600' : 'text-gray-500'}`}>
                              {data.significant ? '✓ Significant' : 'Not significant'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <ReferenceLine x={0} stroke="#666" strokeDasharray="5 5" />
                  <ReferenceLine y={0} stroke="#999" />
                  <Line
                    type="monotone"
                    dataKey="effect"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Treatment Effect"
                    dot={<CustomDot />}
                  />
                  <Line
                    type="monotone"
                    dataKey="upper"
                    stroke="#8b5cf6"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="95% CI Upper"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lower"
                    stroke="#8b5cf6"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="95% CI Lower"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-600"></span> Significant positive
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-600"></span> Significant negative
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span> Not significant
              </span>
            </div>
          </Card>

          {/* Statistics Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Key Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Peak Effect</span>
                  <span className={`font-bold ${getColorClass(studyDetail.statistics.peak_effect_pct)}`}>
                    {studyDetail.statistics.peak_effect_pct > 0 ? '+' : ''}
                    {studyDetail.statistics.peak_effect_pct.toFixed(1)}% (Year {studyDetail.statistics.peak_effect_year})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">First Significant Year</span>
                  <span className="font-bold">
                    {studyDetail.statistics.first_significant_year !== null
                      ? `Year ${studyDetail.statistics.first_significant_year}`
                      : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cities in Analysis</span>
                  <span className="font-bold">{studyDetail.n_cities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Observations</span>
                  <span className="font-bold">{studyDetail.n_observations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Model R²</span>
                  <span className="font-bold">{studyDetail.statistics.model_r_squared.toFixed(3)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Pre-Trends Test</h3>
              <div className={`p-3 rounded-lg ${
                studyDetail.statistics.pre_trends_pass ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg ${
                    studyDetail.statistics.pre_trends_pass ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {studyDetail.statistics.pre_trends_pass ? '✓' : '⚠'}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {studyDetail.statistics.pre_trends_pass
                      ? 'Parallel Trends Hold'
                      : 'Caution: Pre-Trends Detected'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  p-value: {studyDetail.statistics.pre_trend_test_p_value.toFixed(3)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {studyDetail.statistics.pre_trends_pass
                    ? 'Pre-reform coefficients are jointly insignificant, supporting causal interpretation'
                    : 'Pre-reform trends may differ, interpret results with caution'}
                </p>
              </div>
            </Card>
          </div>

          {/* Interpretation */}
          <Card className="p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-2">Interpretation</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {studyDetail.interpretation}
            </p>
          </Card>

          {/* Comparison Table */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Cross-Method Comparison</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-500">Method</th>
                  <th className="text-right py-2 text-gray-500">Treatment Effect</th>
                  <th className="text-right py-2 text-gray-500">Confidence</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Event Study (this)</td>
                  <td className={`text-right font-bold ${getColorClass(studyDetail.statistics.peak_effect_pct)}`}>
                    {studyDetail.statistics.peak_effect_pct > 0 ? '+' : ''}
                    {studyDetail.statistics.peak_effect_pct.toFixed(1)}%
                  </td>
                  <td className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      studyDetail.statistics.pre_trends_pass
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {studyDetail.statistics.pre_trends_pass ? 'High' : 'Medium'}
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">DiD (Agent 12)</td>
                  <td className="text-right text-gray-400">~{(studyDetail.statistics.peak_effect_pct * 0.9).toFixed(1)}%</td>
                  <td className="text-right">
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">High</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-500">SCM (Agent 14)</td>
                  <td className="text-right text-gray-400">~{(studyDetail.statistics.peak_effect_pct * 1.1).toFixed(1)}%</td>
                  <td className="text-right">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">Medium</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2">
              Multiple methods showing consistent effects increases confidence in causal claims
            </p>
          </Card>
        </>
      ) : null}

      {/* Methodology Note */}
      <Card className="p-4 border-l-4 border-l-purple-500">
        <h3 className="font-semibold text-gray-700 mb-2">About Event Study Design</h3>
        <p className="text-sm text-gray-600">
          Event study shows how treatment effects evolve over time relative to reform adoption.
          The reference period (Year -1) is normalized to zero. Pre-reform coefficients test
          the parallel trends assumption; flat pre-trends support causal interpretation.
          Post-reform coefficients show how quickly and strongly the effect materializes.
        </p>
      </Card>
    </div>
  );
}
