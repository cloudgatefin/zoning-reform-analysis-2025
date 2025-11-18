"use client";

import { useState, useMemo } from "react";
import { DashboardHeader, FilterControls, SummaryCards, PercentChangeChart, ReformsTable, DataSourcePanel } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useLiveCensusData, LiveCensusMetric } from "@/lib/hooks/useLiveCensusData";
import { ReformMetric } from "@/lib/types";
import { computeSummary, getUniqueJurisdictions } from "@/lib/data-transforms";

export default function LiveDashboardPage() {
  const { metrics, metadata, isLoading, isError, refresh } = useLiveCensusData(2015, 2024);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("__ALL__");

  // Transform live Census data to match ReformMetric format
  const transformedMetrics = useMemo((): ReformMetric[] => {
    return metrics.map((m: LiveCensusMetric) => ({
      jurisdiction: m.jurisdiction,
      reform_name: `${m.jurisdiction} Trend Analysis`,
      reform_type: "Zoning Reform",
      effective_date: m.dateRange.start.slice(0, 10),
      pre_mean_permits: m.firstHalfAvg,
      post_mean_permits: m.secondHalfAvg,
      percent_change: m.percentChange,
      status: "ok",
    }));
  }, [metrics]);

  // Get unique jurisdictions
  const jurisdictions = useMemo(() => getUniqueJurisdictions(transformedMetrics), [transformedMetrics]);

  // Filter data
  const filteredData = useMemo(() => {
    if (selectedJurisdiction === "__ALL__") return transformedMetrics;
    return transformedMetrics.filter((d) => d.jurisdiction === selectedJurisdiction);
  }, [transformedMetrics, selectedJurisdiction]);

  // Compute summary
  const summary = useMemo(() => computeSummary(filteredData), [filteredData]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-5 py-5">
        <DashboardHeader />
        <Card>
          <CardContent>
            <p className="text-base text-[var(--text-muted)] animate-pulse">
              Fetching real-time data from U.S. Census Bureau...
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              This may take 10-15 seconds for the first load.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-7xl px-5 py-5">
        <DashboardHeader />
        <Card>
          <CardContent>
            <p className="text-base text-[var(--negative-red)] mb-3">
              ❌ Error fetching live Census data
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Possible reasons:
            </p>
            <ul className="text-sm text-[var(--text-muted)] list-disc ml-5 mt-2 space-y-1">
              <li>Census API key is invalid or missing</li>
              <li>Census API is temporarily down</li>
              <li>Network connectivity issues</li>
              <li>Rate limit exceeded (try again in a few minutes)</li>
            </ul>
            <a href="/" className="text-[var(--accent-blue)] underline text-sm mt-3 inline-block">
              ← Back to CSV data
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-5 py-5">
      <DashboardHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <FilterControls
            jurisdictions={jurisdictions}
            reformTypes={[]} // Not applicable for live data
            selectedJurisdiction={selectedJurisdiction}
            selectedReformType="__ALL__"
            onJurisdictionChange={setSelectedJurisdiction}
            onReformTypeChange={() => {}}
            onClear={() => setSelectedJurisdiction("__ALL__")}
          />
        </div>
        <DataSourcePanel
          source="live_census"
          onSwitch={() => (window.location.href = "/")}
          onRefresh={refresh}
          metadata={metadata}
        />
      </div>

      <SummaryCards stats={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader>
            <CardTitle>Permit Trends by State</CardTitle>
          </CardHeader>
          <CardContent>
            <PercentChangeChart data={filteredData.slice(0, 15)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>State Permit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ReformsTable data={filteredData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About This Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-[var(--text-muted)]">
            <p>
              ✅ <strong>Real-time data</strong> from U.S. Census Bureau Building Permits Survey (BPS)
            </p>
            <p>
              📊 Showing {metrics.length} states with {metadata.totalDataPoints} monthly data points
            </p>
            <p>
              📅 Data range: 2015-2024
            </p>
            <p>
              🔄 Auto-refreshes every hour, or click "Refresh from API" to force update
            </p>
            <p>
              ⚡ Percent change calculated by comparing first half vs. second half of time period
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
