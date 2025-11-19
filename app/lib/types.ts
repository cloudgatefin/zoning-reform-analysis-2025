/**
 * Type definitions for reform metrics and timeseries data
 */

export interface ReformMetric {
  jurisdiction: string;
  reform_name: string;
  reform_type: string;
  effective_date: string;
  // Basic metrics
  pre_mean_permits?: number | string | null;
  post_mean_permits?: number | string | null;
  percent_change?: number | string | null;
  status: string;
  // Extended fields from comprehensive metrics
  state_fips?: string;
  pct_change?: number | string | null;
  pre_mean_total?: number | string | null;
  post_mean_total?: number | string | null;
  mf_share_change?: number | string | null;
  wrluri_score?: number | string | null;
}

export interface TimeseriesData {
  jurisdiction: string;
  date: Date;
  permits: number;
}

export interface SummaryStats {
  reformsOk: number;
  avgPct: number | null;
  range: {
    earliest: Date | null;
    latest: Date | null;
  };
}

export interface BaselineStateMetric {
  state_fips: string;
  state_name: string;
  total_permits_2015_2024: number;
  avg_monthly_permits: number;
  first_half_avg: number;
  second_half_avg: number;
  growth_rate_pct: number;
  mf_share_pct: number;
  data_months: number;
}

/**
 * Safe number parsing utility
 * Converts string | number | null | undefined to number
 */
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(num) ? num : 0;
}
