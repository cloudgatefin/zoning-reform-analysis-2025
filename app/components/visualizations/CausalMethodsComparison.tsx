'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface DiDResult {
  jurisdiction: string;
  observed_change_pct: number;
  control_group_change_pct: number;
  treatment_effect: number;
  std_error: number;
  t_statistic: number;
  p_value: number;
  ci_lower: number;
  ci_upper: number;
  statistically_significant: boolean;
}

interface SCMResult {
  jurisdiction: string;
  observed_effect_pct: number;
  synthetic_control_effect_pct: number;
  scm_treatment_effect: number;
  n_control_units: number;
  max_control_distance: number;
}

interface CausalAnalysisData {
  jurisdiction: string;
  did_analysis: {
    method: string;
    description: string;
    treatment_effect_pct: number;
    observed_change_pct: number;
    control_group_change_pct: number;
    standard_error: number;
    t_statistic: number;
    p_value: number;
    confidence_interval: { lower: number; upper: number };
    statistically_significant: boolean;
    interpretation: string;
  };
  scm_analysis: {
    method: string;
    description: string;
    treatment_effect_pct: number;
    observed_effect_pct: number;
    synthetic_control_effect_pct: number;
    n_control_units: number;
    max_control_distance: number;
    interpretation: string;
  };
  methods_comparison: {
    did_effect: number;
    scm_effect: number;
    difference: number;
    correlation: number;
    agreement_level: string;
    recommendation: string;
  };
  summary: string;
}

interface Props {
  jurisdictionFips: string;
  jurisdictionName: string;
}

export default function CausalMethodsComparison({
  jurisdictionFips,
  jurisdictionName,
}: Props) {
  const [data, setData] = useState<CausalAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/causal-analysis/${jurisdictionFips}`
        );
        if (!response.ok) throw new Error('Failed to fetch causal analysis data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jurisdictionFips]);

  if (loading) return <div className="p-4 text-gray-500">Loading causal analysis...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-4 text-gray-500">No causal analysis available</div>;

  const getColorClass = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBackgroundClass = (value: number) => {
    if (value > 0) return 'bg-green-50';
    if (value < 0) return 'bg-red-50';
    return 'bg-gray-50';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        Causal Analysis: {jurisdictionName}
      </h2>

      {/* Methods Comparison Summary */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <h3 className="font-semibold text-gray-700 mb-3">Methods Agreement</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-500 text-sm">DiD Effect</p>
            <p className={`text-lg font-bold ${getColorClass(data.methods_comparison.did_effect)}`}>
              {data.methods_comparison.did_effect > 0 ? '+' : ''}{data.methods_comparison.did_effect.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">SCM Effect</p>
            <p className={`text-lg font-bold ${getColorClass(data.methods_comparison.scm_effect)}`}>
              {data.methods_comparison.scm_effect > 0 ? '+' : ''}{data.methods_comparison.scm_effect.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Correlation</p>
            <p className="text-lg font-bold text-blue-600">
              r = {data.methods_comparison.correlation.toFixed(3)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Agreement Level</p>
            <p className="text-lg font-bold text-purple-600">
              {data.methods_comparison.agreement_level}
            </p>
          </div>
        </div>
        <div className={`mt-3 p-3 rounded ${getBackgroundClass((data.methods_comparison.did_effect + data.methods_comparison.scm_effect) / 2)}`}>
          <p className="text-sm text-gray-700">
            {data.methods_comparison.recommendation}
          </p>
        </div>
      </Card>

      {/* Side-by-Side Method Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Difference-in-Differences Method */}
        <Card className="p-4 border-l-4 border-l-blue-500">
          <h3 className="font-semibold text-gray-700 mb-3">Difference-in-Differences (DiD)</h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Treatment Effect</p>
              <p className={`text-xl font-bold ${getColorClass(data.did_analysis.treatment_effect_pct)}`}>
                {data.did_analysis.treatment_effect_pct > 0 ? '+' : ''}{data.did_analysis.treatment_effect_pct.toFixed(2)}%
              </p>
            </div>

            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-gray-500 mb-1">Confidence Interval (95%)</p>
              <p className="text-sm font-mono text-gray-700">
                [{data.did_analysis.confidence_interval.lower.toFixed(2)}%, {data.did_analysis.confidence_interval.upper.toFixed(2)}%]
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-500 text-xs">Observed Change</p>
                <p className="font-semibold">{data.did_analysis.observed_change_pct.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Control Change</p>
                <p className="font-semibold">{data.did_analysis.control_group_change_pct.toFixed(2)}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-500 text-xs">t-statistic</p>
                <p className="font-semibold">{data.did_analysis.t_statistic.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">p-value</p>
                <p className={`font-semibold ${data.did_analysis.p_value < 0.05 ? 'text-green-600' : 'text-gray-600'}`}>
                  {data.did_analysis.p_value.toFixed(4)}
                </p>
              </div>
            </div>

            <div className={`p-2 rounded ${data.did_analysis.statistically_significant ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <p className="text-xs text-gray-700">
                {data.did_analysis.statistically_significant
                  ? '✓ Statistically significant at p < 0.05'
                  : '⚠ Not statistically significant at p < 0.05'}
              </p>
            </div>

            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <p className="text-xs text-gray-700 leading-relaxed">
                {data.did_analysis.interpretation}
              </p>
            </div>
          </div>
        </Card>

        {/* Synthetic Control Method */}
        <Card className="p-4 border-l-4 border-l-orange-500">
          <h3 className="font-semibold text-gray-700 mb-3">Synthetic Control Method (SCM)</h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Treatment Effect</p>
              <p className={`text-xl font-bold ${getColorClass(data.scm_analysis.treatment_effect_pct)}`}>
                {data.scm_analysis.treatment_effect_pct > 0 ? '+' : ''}{data.scm_analysis.treatment_effect_pct.toFixed(2)}%
              </p>
            </div>

            <div className="bg-orange-50 p-2 rounded">
              <p className="text-xs text-gray-500 mb-1">Control Unit Matching</p>
              <p className="text-sm font-semibold text-gray-700">
                {data.scm_analysis.n_control_units} matched units
              </p>
              <p className="text-xs text-gray-600">
                Max distance: {data.scm_analysis.max_control_distance.toFixed(3)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-500 text-xs">Observed Effect</p>
                <p className="font-semibold">{data.scm_analysis.observed_effect_pct.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Synthetic Control</p>
                <p className="font-semibold">{data.scm_analysis.synthetic_control_effect_pct.toFixed(2)}%</p>
              </div>
            </div>

            <div className="bg-orange-50 p-2 rounded">
              <p className="text-xs text-gray-500 mb-1">Method Description</p>
              <p className="text-xs text-gray-700 leading-relaxed">
                {data.scm_analysis.description}
              </p>
            </div>

            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <p className="text-xs text-gray-700 leading-relaxed">
                {data.scm_analysis.interpretation}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Methodology Section */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Methodology Overview</h3>
        <div className="space-y-3 text-sm">
          <div className="border-b pb-3">
            <h4 className="font-semibold text-gray-700 mb-2">Difference-in-Differences (DiD)</h4>
            <p className="text-gray-600">
              DiD compares the change in outcomes for reform jurisdictions (treatment group) relative to non-reform
              jurisdictions (control group) before and after the reform. This approach isolates the causal effect
              of the reform by controlling for secular trends affecting all jurisdictions.
            </p>
          </div>

          <div className="border-b pb-3">
            <h4 className="font-semibold text-gray-700 mb-2">Synthetic Control Method (SCM)</h4>
            <p className="text-gray-600">
              SCM constructs a weighted combination of non-reform jurisdictions (control pool) that closely matches
              the treated jurisdiction's pre-reform characteristics. This synthetic control serves as a counterfactual
              for what would have happened without the reform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Method Comparison</h4>
            <p className="text-gray-600">
              Both methods provide independent estimates of the causal treatment effect. The correlation coefficient
              (r = {data.methods_comparison.correlation.toFixed(3)}) indicates {data.methods_comparison.agreement_level.toLowerCase()}
              agreement, suggesting the estimates are robust to different identification strategies.
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Statistics */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50">
        <h3 className="font-semibold text-gray-700 mb-2">Causal Inference Summary</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {data.summary}
        </p>
      </Card>
    </div>
  );
}
