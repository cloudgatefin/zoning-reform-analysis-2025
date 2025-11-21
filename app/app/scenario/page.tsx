"use client";

import { useState, useEffect } from 'react';
import { ScenarioBuilder } from '@/components/ScenarioBuilder';
import { ScenarioResult, PlaceData } from '@/lib/scenario-utils';
import { ArrowLeft, Download, Share2, RefreshCw, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';

export default function ScenarioPage() {
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [showCaveats, setShowCaveats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load places on mount
  useEffect(() => {
    async function loadPlaces() {
      try {
        const response = await fetch('/data/places.json');
        const data = await response.json();
        setPlaces(data);
      } catch (err) {
        console.error('Failed to load places:', err);
      }
    }
    loadPlaces();
  }, []);

  // Handle form submission
  const handleSubmit = async (params: {
    city_fips: string;
    reform_types: string[];
    time_horizon: number;
    growth_assumption: 'slow' | 'baseline' | 'fast';
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scenarios/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Failed to generate scenarios');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PDF download
  const handleDownload = async () => {
    if (!result) return;

    try {
      const response = await fetch('/api/scenarios/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scenario-report-${result.selected_city.place_name.replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  };

  // Handle share
  const handleShare = () => {
    if (!result) return;
    const url = new URL(window.location.href);
    url.searchParams.set('city', result.selected_city.place_fips);
    url.searchParams.set('reforms', result.selected_reforms.join(','));
    url.searchParams.set('years', result.time_horizon_years.toString());
    navigator.clipboard.writeText(url.toString());
    alert('Link copied to clipboard!');
  };

  // Reset to builder
  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  // Prepare chart data
  const chartData = result?.scenarios[1]?.time_path.map((point, idx) => ({
    year: point.year,
    optimistic: result.scenarios[0].time_path[idx]?.cumulative_increase || 0,
    realistic: result.scenarios[1].time_path[idx]?.cumulative_increase || 0,
    pessimistic: result.scenarios[2].time_path[idx]?.cumulative_increase || 0
  })) || [];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              Scenario Modeling
            </h1>
          </div>
          {result && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-primary)] hover:border-[var(--border-hover)]"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-primary)] hover:border-[var(--border-hover)]"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--accent-blue)] text-white rounded-[var(--radius-md)] hover:bg-[var(--accent-blue)]/90"
              >
                <RefreshCw className="w-4 h-4" />
                New Scenario
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!result ? (
          /* Scenario Builder Form */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                What if we adopt this reform?
              </h2>
              <p className="text-[var(--text-muted)]">
                Select your city and the reforms you&apos;re considering to see predicted outcomes
              </p>
            </div>

            <ScenarioBuilder
              places={places}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />

            {error && (
              <div className="mt-4 p-4 bg-[var(--negative-red)]/10 border border-[var(--negative-red)] rounded-[var(--radius-md)] text-[var(--negative-red)]">
                {error}
              </div>
            )}
          </div>
        ) : (
          /* Scenario Results */
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-[var(--text-muted)]">Selected City</div>
                  <div className="text-lg font-semibold text-[var(--text-primary)]">
                    {result.selected_city.place_name}, {result.selected_city.state_name}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--text-muted)]">Current Annual Permits</div>
                  <div className="text-lg font-semibold text-[var(--text-primary)]">
                    {result.baseline_annual_permits.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--text-muted)]">Selected Reforms</div>
                  <div className="text-lg font-semibold text-[var(--text-primary)]">
                    {result.selected_reforms.join(', ')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--text-muted)]">Time Horizon</div>
                  <div className="text-lg font-semibold text-[var(--text-primary)]">
                    {result.time_horizon_years} years
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {result.scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`bg-[var(--bg-card)] border rounded-[var(--radius-lg)] p-6 ${
                    scenario.id === 'realistic'
                      ? 'border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue)]/20'
                      : 'border-[var(--border-default)]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    {scenario.id === 'optimistic' && <TrendingUp className="w-5 h-5 text-[var(--positive-green)]" />}
                    {scenario.id === 'realistic' && <Minus className="w-5 h-5 text-[var(--accent-blue)]" />}
                    {scenario.id === 'pessimistic' && <TrendingDown className="w-5 h-5 text-[var(--warning-orange)]" />}
                    <h3 className="font-semibold text-[var(--text-primary)]">{scenario.name}</h3>
                  </div>

                  <div className={`text-3xl font-bold mb-2 ${
                    scenario.id === 'optimistic' ? 'text-[var(--positive-green)]' :
                    scenario.id === 'realistic' ? 'text-[var(--accent-blue)]' :
                    'text-[var(--warning-orange)]'
                  }`}>
                    +{scenario.predicted_permit_increase_pct}%
                  </div>

                  <div className="text-sm text-[var(--text-muted)] mb-4">
                    {scenario.description}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[var(--border-default)]">
                    <div>
                      <div className="text-xs text-[var(--text-muted)]">Projected Annual Permits</div>
                      <div className="text-lg font-semibold text-[var(--text-primary)]">
                        ~{scenario.predicted_annual_permits.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-muted)]">Confidence</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent-blue)]"
                            style={{ width: `${scenario.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm text-[var(--text-primary)]">{scenario.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Time Path Chart */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Projected Impact Over Time
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                    <XAxis
                      dataKey="year"
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)' }}
                      label={{ value: 'Years', position: 'bottom', fill: 'var(--text-muted)' }}
                    />
                    <YAxis
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)' }}
                      label={{ value: 'Permit Increase (%)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)'
                      }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="optimistic"
                      fill="var(--positive-green)"
                      fillOpacity={0.1}
                      stroke="none"
                    />
                    <Area
                      type="monotone"
                      dataKey="pessimistic"
                      fill="var(--warning-orange)"
                      fillOpacity={0.1}
                      stroke="none"
                    />
                    <Line
                      type="monotone"
                      dataKey="optimistic"
                      stroke="var(--positive-green)"
                      strokeWidth={2}
                      dot={false}
                      name="Optimistic"
                    />
                    <Line
                      type="monotone"
                      dataKey="realistic"
                      stroke="var(--accent-blue)"
                      strokeWidth={3}
                      dot={false}
                      name="Realistic"
                    />
                    <Line
                      type="monotone"
                      dataKey="pessimistic"
                      stroke="var(--warning-orange)"
                      strokeWidth={2}
                      dot={false}
                      name="Pessimistic"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparable Cities */}
            {result.comparable_cities.length > 0 && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Comparable Cities
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Here&apos;s what happened in similar places that adopted these reforms
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-default)]">
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">City, State</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Reform</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Adopted</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Years Since</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Permit Change</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Current Permits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.comparable_cities.map((city) => (
                        <tr key={city.place_fips} className="border-b border-[var(--border-default)] last:border-0">
                          <td className="py-3 px-4 text-[var(--text-primary)]">
                            {city.place_name}, {city.state_name}
                          </td>
                          <td className="py-3 px-4 text-[var(--text-muted)] text-sm">
                            {city.reform_type}
                          </td>
                          <td className="py-3 px-4 text-center text-[var(--text-primary)]">
                            {city.adoption_year}
                          </td>
                          <td className="py-3 px-4 text-center text-[var(--text-muted)]">
                            {city.years_since_reform}
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${
                            city.permit_increase_pct >= 0 ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'
                          }`}>
                            {city.permit_increase_pct >= 0 ? '+' : ''}{city.permit_increase_pct.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-right text-[var(--text-primary)]">
                            {city.current_annual_permits.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Key Findings */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Key Findings
              </h3>
              <ul className="space-y-3">
                {result.key_findings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[var(--text-primary)]">
                    <span className="text-[var(--accent-blue)]">•</span>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            {/* Caveats */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)]">
              <button
                onClick={() => setShowCaveats(!showCaveats)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Caveats & Limitations
                </h3>
                {showCaveats ? (
                  <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                )}
              </button>

              {showCaveats && (
                <div className="px-6 pb-6">
                  <ul className="space-y-3">
                    {result.caveats.map((caveat, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[var(--text-muted)] text-sm">
                        <span>•</span>
                        {caveat}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                    <a
                      href="/about/limitations"
                      className="text-sm text-[var(--accent-blue)] hover:underline"
                    >
                      Learn more about our methodology and limitations →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
