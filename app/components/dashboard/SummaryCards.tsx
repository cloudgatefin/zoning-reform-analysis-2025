"use client";

import React from "react";
import { SummaryStats } from "@/lib/types";
import { formatPercent, formatDate } from "@/lib/data-transforms";

interface SummaryCardsProps {
  stats: SummaryStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-[18px] mb-5">
      <h3 className="text-md font-semibold text-[var(--text-primary)] mb-4">Summary</h3>
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-muted)] mb-1">Reforms (OK windows)</span>
          <span className="text-lg font-semibold text-[var(--text-primary)]">
            {stats.reformsOk ?? "—"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-muted)] mb-1">Avg % change</span>
          <span
            className={`text-lg font-semibold ${
              stats.avgPct !== null && stats.avgPct >= 0
                ? "text-[var(--positive-green)]"
                : "text-[var(--negative-red)]"
            }`}
          >
            {formatPercent(stats.avgPct)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-muted)] mb-1">Effective range</span>
          <span className="text-base text-[var(--text-primary)]">
            {stats.range.earliest && stats.range.latest
              ? `${formatDate(stats.range.earliest)} → ${formatDate(stats.range.latest)}`
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
