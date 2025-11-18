/**
 * Data transformation and utility functions
 */

import { ReformMetric, SummaryStats } from "./types";

/**
 * Safely parse number, return null if invalid
 */
export function safeNumber(value: any): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Filter array to only finite numbers
 */
export function onlyFinite(arr: (number | null)[]): number[] {
  return arr.filter((d): d is number => d !== null && Number.isFinite(d));
}

/**
 * Compute summary statistics from reform metrics
 */
export function computeSummary(data: ReformMetric[]): SummaryStats {
  const pctValues = onlyFinite(data.map((d) => d.percent_change));
  const avgPct = pctValues.length ? pctValues.reduce((a, b) => a + b, 0) / pctValues.length : null;

  const dates = data
    .map((d) => (d.effective_date ? new Date(d.effective_date) : null))
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()));

  const earliest = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
  const latest = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

  return {
    reformsOk: data.filter((d) => d.status === "ok").length,
    avgPct,
    range: {
      earliest,
      latest,
    },
  };
}

/**
 * Get unique jurisdictions from metrics
 */
export function getUniqueJurisdictions(data: ReformMetric[]): string[] {
  return Array.from(new Set(data.map((d) => d.jurisdiction).filter(Boolean))).sort();
}

/**
 * Get unique reform types from metrics
 */
export function getUniqueReformTypes(data: ReformMetric[]): string[] {
  return Array.from(new Set(data.map((d) => d.reform_type).filter(Boolean))).sort();
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toFixed(2) + "%";
}

/**
 * Format date for display
 */
export function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toISOString().slice(0, 10);
}
