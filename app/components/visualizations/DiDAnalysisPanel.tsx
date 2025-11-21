'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Download, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import {
  DiDResult,
  DiDAnalysisData,
  formatDidResult,
  formatPValue,
  getEffectColorClass,
  getSignificanceClass,
  interpretSignificance,
  getReformTypeDisplayName,
  sortBySignificance,
  filterByReformType,
  getUniqueReformTypes,
  calculateSummaryStats,
  isParallelTrendsValid,
  getParallelTrendsWarning,
  generateCSVExport,
} from '@/lib/did-utils';

export default function DiDAnalysisPanel() {
  const [data, setData] = useState<DiDAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReformType, setSelectedReformType] = useState('__ALL__');
  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/causal-analysis/did');
        if (!response.ok) throw new Error('Failed to fetch DiD analysis data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get filtered and sorted results
  const filteredResults = useMemo(() => {
    if (!data?.results) return [];
    const filtered = filterByReformType(data.results, selectedReformType);
    return sortBySignificance(filtered);
  }, [data, selectedReformType]);

  // Get unique reform types for dropdown
  const reformTypes = useMemo(() => {
    if (!data?.results) return [];
    return getUniqueReformTypes(data.results);
  }, [data]);

  // Calculate stats for filtered results
  const stats = useMemo(() => {
    return calculateSummaryStats(filteredResults);
  }, [filteredResults]);

  // Handle CSV export
  const handleExport = () => {
    const csv = generateCSVExport(filteredResults);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'did_analysis_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-red-600">Error loading DiD analysis: {error}</p>
        <p className="text-sm text-gray-600 mt-2">
          Run the DiD analysis script first: python scripts/31_compute_did_analysis.py
        </p>
      </Card>
    );
  }

  if (!data || !data.results || data.results.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-gray-500">No DiD analysis results available.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Causal Impact of Zoning Reforms
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Difference-in-Differences (DiD) Analysis
        </p>
        <p className="text-xs text-gray-500">
          These estimates show what reforms CAUSED, not just correlation. We compare cities that adopted
          reforms to similar cities that did not, controlling for secular trends.
        </p>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Analyses</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.significant}</p>
          <p className="text-xs text-gray-500">Significant (p&lt;0.05)</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.positive}</p>
          <p className="text-xs text-gray-500">Positive Effects</p>
        </Card>
        <Card className="p-4 text-center">
          <p className={`text-2xl font-bold ${getEffectColorClass(stats.averageEffect)}`}>
            {stats.averageEffect > 0 ? '+' : ''}{stats.averageEffect.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">Average Effect</p>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Reform Type:</label>
            <Select
              value={selectedReformType}
              onChange={(e) => setSelectedReformType(e.target.value)}
              className="min-w-[200px]"
            >
              <option value="__ALL__">All Reform Types</option>
              {reformTypes.map((type) => (
                <option key={type} value={type}>
                  {getReformTypeDisplayName(type)}
                </option>
              ))}
            </Select>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </Card>

      {/* Forest Plot Visualization */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Treatment Effects (Forest Plot)</h3>
        <div className="space-y-3">
          {filteredResults.map((result, index) => (
            <ForestPlotRow key={index} result={result} />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Significant (p&lt;0.05)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
              Not Significant
            </span>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Detailed Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-2">Reform Type</th>
                <th className="text-left p-2">Year</th>
                <th className="text-right p-2">Effect</th>
                <th className="text-right p-2">95% CI</th>
                <th className="text-right p-2">P-value</th>
                <th className="text-right p-2">N</th>
                <th className="text-center p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{getReformTypeDisplayName(result.reform_type)}</td>
                  <td className="p-2">{result.adoption_year}</td>
                  <td className={`p-2 text-right font-semibold ${getEffectColorClass(result.treatment_effect)}`}>
                    {result.treatment_effect > 0 ? '+' : ''}{result.treatment_effect.toFixed(1)}%
                  </td>
                  <td className="p-2 text-right font-mono text-xs">
                    [{result.lower_ci_95.toFixed(1)}%, {result.upper_ci_95.toFixed(1)}%]
                  </td>
                  <td className="p-2 text-right">{formatPValue(result.p_value)}</td>
                  <td className="p-2 text-right">{result.n_treated}/{result.n_control}</td>
                  <td className="p-2 text-center">
                    {result.p_value < 0.05 ? (
                      <CheckCircle className="h-4 w-4 text-green-500 inline" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Parallel Trends */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Parallel Trends Assumption</h3>
        <p className="text-sm text-gray-600 mb-4">
          DiD assumes treatment and control groups had similar trends BEFORE reform adoption.
          Higher p-values indicate this assumption is satisfied.
        </p>
        <div className="space-y-2">
          {filteredResults.map((result, index) => {
            const warning = getParallelTrendsWarning(result.parallel_trends_p_value);
            const isValid = isParallelTrendsValid(result.parallel_trends_p_value);
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isValid ? 'bg-green-50' : 'bg-yellow-50'
                }`}
              >
                <span className="text-sm">
                  {getReformTypeDisplayName(result.reform_type)} ({result.adoption_year})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">
                    p = {result.parallel_trends_p_value.toFixed(3)}
                  </span>
                  {!isValid && (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Methodology Section */}
      <Card className="p-6">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-700">Methodology</h3>
          </div>
          {showMethodology ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {showMethodology && (
          <div className="mt-4 space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">What is Difference-in-Differences?</h4>
              <p>
                DiD compares the change in outcomes (building permits) for cities that adopted reforms
                (treatment group) relative to similar cities that did not (control group). By
                comparing the difference in changes, we isolate the causal effect of the reform.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Formula</h4>
              <code className="block bg-gray-100 p-3 rounded text-xs">
                DiD Effect = (Treated_Post - Treated_Pre) - (Control_Post - Control_Pre)
              </code>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Key Assumptions</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Parallel trends: Treatment and control groups had similar trends before reform</li>
                <li>No spillovers: Reform in treated cities doesn't affect control cities</li>
                <li>No anticipation: Outcome doesn't change before reform is implemented</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Interpretation</h4>
              <p>
                A positive effect means the reform caused an increase in building permits beyond
                what would have happened without the reform. Statistical significance (p&lt;0.05)
                indicates we can be confident the effect is not due to chance.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="/about/methodology#did"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Read full technical methodology →
              </a>
            </div>
          </div>
        )}
      </Card>

      {/* Data Source */}
      <Card className="p-4 bg-gray-50">
        <p className="text-xs text-gray-500">
          Analysis generated: {data.metadata?.generated_at ? new Date(data.metadata.generated_at).toLocaleString() : 'N/A'}
          {' | '}
          Bootstrap iterations: {data.metadata?.bootstrap_iterations || 'N/A'}
          {' | '}
          Min treated: {data.metadata?.min_treated || 'N/A'}
        </p>
      </Card>
    </div>
  );
}

/**
 * Forest plot row component
 */
function ForestPlotRow({ result }: { result: DiDResult }) {
  const isSignificant = result.p_value < 0.05;
  const maxEffect = 30; // Scale for the plot

  // Calculate positions (centered at 0)
  const centerX = 50; // 50% is the center (0 effect)
  const scale = 50 / maxEffect; // pixels per percentage point

  const effectX = centerX + (result.treatment_effect * scale);
  const lowerX = centerX + (result.lower_ci_95 * scale);
  const upperX = centerX + (result.upper_ci_95 * scale);

  // Clamp values to visible range
  const clamp = (val: number) => Math.max(2, Math.min(98, val));

  return (
    <div className="flex items-center gap-4">
      {/* Label */}
      <div className="w-40 text-sm truncate">
        {getReformTypeDisplayName(result.reform_type)} ({result.adoption_year})
      </div>

      {/* Plot */}
      <div className="flex-1 relative h-6 bg-gray-100 rounded">
        {/* Zero line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-gray-400"
          style={{ left: '50%' }}
        />

        {/* Confidence interval line */}
        <div
          className="absolute top-1/2 h-0.5 bg-gray-400 -translate-y-1/2"
          style={{
            left: `${clamp(lowerX)}%`,
            width: `${Math.max(1, clamp(upperX) - clamp(lowerX))}%`,
          }}
        />

        {/* Point estimate */}
        <div
          className={`absolute top-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 ${
            isSignificant ? 'bg-green-500' : 'bg-gray-400'
          }`}
          style={{ left: `${clamp(effectX)}%` }}
        />
      </div>

      {/* Effect value */}
      <div className={`w-20 text-right text-sm font-medium ${getEffectColorClass(result.treatment_effect)}`}>
        {result.treatment_effect > 0 ? '+' : ''}{result.treatment_effect.toFixed(1)}%
      </div>
    </div>
  );
}
