"use client";

import { useState, useEffect } from "react";

interface Prediction {
  state_fips: string;
  state_name: string;
  wrluri: number;
  growth_rate_pct: number;
  mf_share_pct: number;
  predicted_impact: number;
  ci_lower: number;
  ci_upper: number;
  reform_potential: string;
}

export function ReformPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'impact' | 'wrluri' | 'growth'>('impact');

  useEffect(() => {
    async function fetchPredictions() {
      try {
        const response = await fetch('/api/predictions');
        const result = await response.json();

        if (result.success && result.data) {
          setPredictions(result.data);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPredictions();
  }, []);

  const sortedPredictions = [...predictions].sort((a, b) => {
    switch (sortBy) {
      case 'impact':
        return b.predicted_impact - a.predicted_impact;
      case 'wrluri':
        return b.wrluri - a.wrluri;
      case 'growth':
        return b.growth_rate_pct - a.growth_rate_pct;
      default:
        return 0;
    }
  });

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'Very High':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500';
      case 'High':
        return 'bg-green-500/10 text-green-600 border-green-500';
      case 'Moderate':
        return 'bg-blue-500/10 text-blue-600 border-blue-500';
      case 'Low':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500';
      case 'Negative':
        return 'bg-red-500/10 text-red-600 border-red-500';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] p-6">
        <p className="text-[var(--text-muted)]">Loading predictions...</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            🔮 Predictive Reform Impact Analysis
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Machine learning predictions for states without documented zoning reforms
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('impact')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortBy === 'impact'
                ? 'bg-[var(--accent-blue)] text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--border-default)]'
            }`}
          >
            Sort by Impact
          </button>
          <button
            onClick={() => setSortBy('wrluri')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortBy === 'wrluri'
                ? 'bg-[var(--accent-blue)] text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--border-default)]'
            }`}
          >
            Sort by WRLURI
          </button>
          <button
            onClick={() => setSortBy('growth')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortBy === 'growth'
                ? 'bg-[var(--accent-blue)] text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--border-default)]'
            }`}
          >
            Sort by Growth
          </button>
        </div>
      </div>

      {/* Model Info */}
      <div className="mb-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
          📊 Model Information
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-2">
          Random Forest model trained on 6 states with documented zoning reforms. Predictions based on:
        </p>
        <div className="flex gap-4 text-xs text-[var(--text-muted)]">
          <span>• WRLURI (regulatory restrictiveness)</span>
          <span>• Baseline growth rate (2015-2024)</span>
          <span>• Multi-family share</span>
          <span>• Avg monthly permits</span>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-default)]">
              <th className="text-left py-3 px-2 text-sm font-semibold text-[var(--text-primary)]">Rank</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-[var(--text-primary)]">State</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-[var(--text-primary)]">
                Predicted Impact
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-[var(--text-primary)]">
                Confidence Interval
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-[var(--text-primary)]">
                Reform Potential
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-[var(--text-primary)]">WRLURI</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-[var(--text-primary)]">
                Baseline Growth
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPredictions.map((pred, index) => (
              <tr
                key={pred.state_fips}
                className="border-b border-[var(--border-default)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <td className="py-3 px-2 text-sm text-[var(--text-muted)]">{index + 1}</td>
                <td className="py-3 px-2 text-sm font-medium text-[var(--text-primary)]">
                  {pred.state_name}
                </td>
                <td className="py-3 px-2 text-right">
                  <span
                    className={`text-sm font-semibold ${
                      pred.predicted_impact >= 0
                        ? 'text-[var(--positive-green)]'
                        : 'text-[var(--negative-red)]'
                    }`}
                  >
                    {pred.predicted_impact >= 0 ? '+' : ''}
                    {pred.predicted_impact.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="text-xs text-[var(--text-muted)]">
                    {pred.ci_lower.toFixed(1)}% to {pred.ci_upper.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getPotentialColor(
                      pred.reform_potential
                    )}`}
                  >
                    {pred.reform_potential}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-sm text-[var(--text-muted)]">{pred.wrluri.toFixed(2)}</span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span
                    className={`text-sm ${
                      pred.growth_rate_pct >= 0
                        ? 'text-[var(--positive-green)]'
                        : 'text-[var(--negative-red)]'
                    }`}
                  >
                    {pred.growth_rate_pct >= 0 ? '+' : ''}
                    {pred.growth_rate_pct.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Insights */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-muted)] mb-1">Highest Predicted Impact</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">
            {sortedPredictions[0]?.state_name}
          </p>
          <p className="text-sm text-[var(--positive-green)]">
            +{sortedPredictions[0]?.predicted_impact.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-muted)] mb-1">Most Restrictive (WRLURI)</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">
            {[...predictions].sort((a, b) => b.wrluri - a.wrluri)[0]?.state_name}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            {[...predictions].sort((a, b) => b.wrluri - a.wrluri)[0]?.wrluri.toFixed(2)} WRLURI
          </p>
        </div>
        <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-muted)] mb-1">Avg Predicted Impact</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">
            {(predictions.reduce((sum, p) => sum + p.predicted_impact, 0) / predictions.length).toFixed(1)}%
          </p>
          <p className="text-sm text-[var(--text-muted)]">Across all states</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
        <p className="text-xs text-[var(--text-muted)]">
          ⚠️ <strong>Disclaimer:</strong> These predictions are based on a limited training dataset (6 reform states).
          Actual reform outcomes depend on many factors not captured in this model, including specific policy details,
          local economic conditions, and implementation effectiveness. Use these predictions as exploratory insights, not
          definitive forecasts.
        </p>
      </div>
    </div>
  );
}
