/**
 * Type definitions for reform metrics and timeseries data
 */

export interface ReformMetric {
  jurisdiction: string;
  place_fips?: string;
  reform_name: string;
  reform_type: string;
  effective_date: string;
  pre_mean_permits: number | null;
  post_mean_permits: number | null;
  percent_change: number | null;
  status: string;
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
