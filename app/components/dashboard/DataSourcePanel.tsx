"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";

interface DataSourcePanelProps {
  source: "csv" | "live_census";
  onSwitch: () => void;
  onRefresh?: () => void;
  metadata?: {
    source?: string;
    statesCount?: number;
    totalDataPoints?: number;
    fetchedAt?: string;
  };
}

export function DataSourcePanel({ source, onSwitch, onRefresh, metadata }: DataSourcePanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className={`px-3 py-2 rounded-md text-sm ${
                source === "csv"
                  ? "bg-[var(--accent-blue)] text-white"
                  : "bg-[var(--border-default)] text-[var(--text-muted)]"
              }`}
            >
              CSV (Pre-computed)
            </div>
            <div
              className={`px-3 py-2 rounded-md text-sm ${
                source === "live_census"
                  ? "bg-[var(--positive-green)] text-white"
                  : "bg-[var(--border-default)] text-[var(--text-muted)]"
              }`}
            >
              Live Census API
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={onSwitch} variant="secondary" className="flex-1">
              Switch to {source === "csv" ? "Live Census" : "CSV"} Data
            </Button>
            {source === "live_census" && onRefresh && (
              <Button
                onClick={handleRefresh}
                variant="primary"
                disabled={isRefreshing}
                className="flex-1"
              >
                {isRefreshing ? "Refreshing..." : "Refresh from API"}
              </Button>
            )}
          </div>

          {metadata && source === "live_census" && (
            <div className="mt-4 p-3 bg-[var(--border-default)] rounded-md text-sm">
              <div className="grid grid-cols-2 gap-2 text-[var(--text-muted)]">
                <div>States: {metadata.statesCount ?? "—"}</div>
                <div>Data Points: {metadata.totalDataPoints ?? "—"}</div>
                <div className="col-span-2">
                  Fetched: {metadata.fetchedAt ? new Date(metadata.fetchedAt).toLocaleString() : "—"}
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-[var(--text-muted)]">
            {source === "csv" ? (
              <p>
                ⚠️ Using pre-computed data from Python pipeline. Switch to Live Census for real-time
                data directly from census.gov.
              </p>
            ) : (
              <p>
                ✅ Fetching real-time data from U.S. Census Bureau Building Permits Survey (BPS). Data
                is cached for 1 hour.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
