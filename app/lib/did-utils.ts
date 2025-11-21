/**
 * Difference-in-Differences (DiD) Analysis Utilities
 *
 * This module provides utility functions for loading, processing, and
 * displaying DiD causal analysis results.
 */

export interface DiDResult {
  reform_type: string;
  adoption_year: number;
  treatment_effect: number;  // % change in permits
  lower_ci_95: number;
  upper_ci_95: number;
  p_value: number;
  n_treated: number;
  n_control: number;
  parallel_trends_p_value: number;
  treated_change_pct: number;
  control_change_pct: number;
  significance: 'significant' | 'not_significant';
  interpretation: string;
}

export interface ReformAnalysis {
  reform_type: string;
  results_by_year: DiDResult[];
  average_effect: number;
  n_analyses: number;
  n_significant: number;
  statistical_summary: string;
}

export interface DiDAnalysisData {
  metadata: {
    generated_at: string;
    methodology: string;
    min_pre_years: number;
    min_post_years: number;
    min_treated: number;
    min_control: number;
    bootstrap_iterations: number;
  };
  summary: {
    total_analyses: number;
    significant_effects: number;
    positive_effects: number;
    average_effect: number;
    average_significant_effect: number;
    confidence: string;
    interpretation: string;
  };
  reform_analyses: ReformAnalysis[];
  all_results: DiDResult[];
}

/**
 * Get DiD estimate for specific reform and year
 */
export function getDidEstimate(
  results: DiDResult[],
  reform_type: string,
  adoption_year: number
): DiDResult | null {
  return results.find(
    r => r.reform_type === reform_type && r.adoption_year === adoption_year
  ) || null;
}

/**
 * Format DiD result for display
 */
export function formatDidResult(result: DiDResult): string {
  const sign = result.treatment_effect > 0 ? '+' : '';
  return `${sign}${result.treatment_effect.toFixed(1)}% [${result.lower_ci_95.toFixed(1)}%, ${result.upper_ci_95.toFixed(1)}%]`;
}

/**
 * Interpret statistical significance
 */
export function interpretSignificance(p_value: number): string {
  if (p_value < 0.01) return 'Highly significant (p<0.01)';
  if (p_value < 0.05) return 'Significant (p<0.05)';
  if (p_value < 0.10) return 'Marginally significant (p<0.10)';
  return 'Not significant (p≥0.10)';
}

/**
 * Get color class based on treatment effect
 */
export function getEffectColorClass(effect: number): string {
  if (effect > 5) return 'text-green-600';
  if (effect > 0) return 'text-green-500';
  if (effect > -5) return 'text-red-500';
  return 'text-red-600';
}

/**
 * Get background color class based on significance
 */
export function getSignificanceClass(p_value: number): string {
  if (p_value < 0.05) return 'bg-green-50 border-green-200';
  if (p_value < 0.10) return 'bg-yellow-50 border-yellow-200';
  return 'bg-gray-50 border-gray-200';
}

/**
 * Format p-value for display
 */
export function formatPValue(p_value: number): string {
  if (p_value < 0.001) return '<0.001';
  if (p_value < 0.01) return p_value.toFixed(3);
  return p_value.toFixed(2);
}

/**
 * Get reform type display name
 */
export function getReformTypeDisplayName(reform_type: string): string {
  const displayNames: Record<string, string> = {
    'ADU/Lot Split': 'ADU & Lot Split',
    'Comprehensive Reform': 'Comprehensive Reform',
    'Zoning Upzones': 'Zoning Upzones',
    'Parking Reform': 'Parking Reform',
  };
  return displayNames[reform_type] || reform_type;
}

/**
 * Sort results by effect size (descending)
 */
export function sortByEffectSize(results: DiDResult[]): DiDResult[] {
  return [...results].sort((a, b) => b.treatment_effect - a.treatment_effect);
}

/**
 * Sort results by significance (significant first)
 */
export function sortBySignificance(results: DiDResult[]): DiDResult[] {
  return [...results].sort((a, b) => {
    if (a.p_value < 0.05 && b.p_value >= 0.05) return -1;
    if (a.p_value >= 0.05 && b.p_value < 0.05) return 1;
    return a.p_value - b.p_value;
  });
}

/**
 * Filter results by reform type
 */
export function filterByReformType(
  results: DiDResult[],
  reform_type: string
): DiDResult[] {
  if (reform_type === '__ALL__') return results;
  return results.filter(r => r.reform_type === reform_type);
}

/**
 * Get unique reform types from results
 */
export function getUniqueReformTypes(results: DiDResult[]): string[] {
  return Array.from(new Set(results.map(r => r.reform_type)));
}

/**
 * Calculate summary statistics for a set of results
 */
export function calculateSummaryStats(results: DiDResult[]) {
  if (results.length === 0) {
    return {
      total: 0,
      significant: 0,
      positive: 0,
      averageEffect: 0,
    };
  }

  const significant = results.filter(r => r.p_value < 0.05).length;
  const positive = results.filter(r => r.treatment_effect > 0).length;
  const averageEffect = results.reduce((sum, r) => sum + r.treatment_effect, 0) / results.length;

  return {
    total: results.length,
    significant,
    positive,
    averageEffect,
  };
}

/**
 * Check if parallel trends assumption is valid
 */
export function isParallelTrendsValid(p_value: number): boolean {
  return p_value >= 0.10;  // We want to NOT reject the null hypothesis
}

/**
 * Get parallel trends warning message
 */
export function getParallelTrendsWarning(p_value: number): string | null {
  if (p_value >= 0.10) return null;
  if (p_value >= 0.05) return 'Borderline parallel trends (0.05 ≤ p < 0.10)';
  return 'Parallel trends may be violated (p < 0.05)';
}

/**
 * Generate CSV export data
 */
export function generateCSVExport(results: DiDResult[]): string {
  const headers = [
    'Reform Type',
    'Adoption Year',
    'Treatment Effect (%)',
    'Lower CI 95%',
    'Upper CI 95%',
    'P-Value',
    'N Treated',
    'N Control',
    'Parallel Trends P-Value',
    'Significance',
  ];

  const rows = results.map(r => [
    r.reform_type,
    r.adoption_year,
    r.treatment_effect.toFixed(2),
    r.lower_ci_95.toFixed(2),
    r.upper_ci_95.toFixed(2),
    r.p_value.toFixed(4),
    r.n_treated,
    r.n_control,
    r.parallel_trends_p_value.toFixed(4),
    r.significance,
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}
