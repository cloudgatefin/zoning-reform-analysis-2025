"use client";

import { useState, useMemo } from "react";
import { DashboardHeader, FilterControls, SummaryCards, PercentChangeChart, ReformsTable } from "@/components/dashboard";
import { ChoroplethMap, StateDetailPanel, WRLURIScatterPlot, StateComparison, ReformTimeline, CountyDrillDown, ReformPredictions } from "@/components/visualizations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useReformMetrics } from "@/lib/hooks/useReformMetrics";
import { computeSummary, getUniqueJurisdictions, getUniqueReformTypes } from "@/lib/data-transforms";
import { ReformMetric } from "@/lib/types";

export default function DashboardPage() {
  const { metrics, isLoading, isError } = useReformMetrics();
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("__ALL__");
  const [selectedReformType, setSelectedReformType] = useState("__ALL__");
  const [selectedState, setSelectedState] = useState<ReformMetric | null>(null);
  const [countyDrillDown, setCountyDrillDown] = useState<{ stateFips: string; stateName: string } | null>(null);

  // Get unique values for filters
  const jurisdictions = useMemo(() => getUniqueJurisdictions(metrics), [metrics]);
  const reformTypes = useMemo(() => getUniqueReformTypes(metrics), [metrics]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = metrics;

    if (selectedJurisdiction !== "__ALL__") {
      filtered = filtered.filter((d) => d.jurisdiction === selectedJurisdiction);
    }

    if (selectedReformType !== "__ALL__") {
      filtered = filtered.filter((d) => d.reform_type === selectedReformType);
    }

    return filtered;
  }, [metrics, selectedJurisdiction, selectedReformType]);

  // Compute summary stats
  const summary = useMemo(() => computeSummary(filteredData), [filteredData]);

  const handleClearFilters = () => {
    setSelectedJurisdiction("__ALL__");
    setSelectedReformType("__ALL__");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-5 py-5">
        <DashboardHeader />
        <Card>
          <CardContent>
            <p className="text-base text-[var(--text-muted)]">Loading reform metrics...</p>
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
            <p className="text-base text-[var(--negative-red)]">
              Error loading data. Make sure the Python pipeline has generated the metrics file.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-5 py-5">
      <DashboardHeader data={filteredData} />

      <FilterControls
        jurisdictions={jurisdictions}
        reformTypes={reformTypes}
        selectedJurisdiction={selectedJurisdiction}
        selectedReformType={selectedReformType}
        onJurisdictionChange={setSelectedJurisdiction}
        onReformTypeChange={setSelectedReformType}
        onClear={handleClearFilters}
      />

      <SummaryCards stats={summary} />

      {/* Interactive Choropleth Map */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>🗺️ U.S. Zoning Reform Impact Map</CardTitle>
        </CardHeader>
        <CardContent>
          <ChoroplethMap
            data={filteredData}
            onStateClick={(stateFips, stateName) => setCountyDrillDown({ stateFips, stateName })}
          />
          <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
            💡 Click any state to view county-level breakdown
          </p>
        </CardContent>
      </Card>

      {/* State Comparison Feature */}
      <div className="mb-5">
        <StateComparison reformData={filteredData} />
      </div>

      {/* Reform Timeline Animation */}
      <div className="mb-5">
        <ReformTimeline data={filteredData} />
      </div>

      {/* Predictive Modeling */}
      <div className="mb-5">
        <ReformPredictions />
      </div>

      {/* Scatter Plot & Bar Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader>
            <CardTitle>Regulatory Restrictiveness vs. Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <WRLURIScatterPlot
              data={filteredData}
              onPointClick={setSelectedState}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Percent Change by Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent>
            <PercentChangeChart data={filteredData.slice(0, 15)} />
          </CardContent>
        </Card>
      </div>

      {/* Reform Details Table */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Reform Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ReformsTable data={filteredData} />
        </CardContent>
      </Card>

      {/* Data Source Info */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Data Source & Methodology</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-base text-[var(--text-primary)]">
            <p><strong>Source:</strong> U.S. Census Bureau Building Permits Survey (2015-2024)</p>
            <p><strong>Coverage:</strong> Annual state-level permit data distributed to monthly estimates with seasonal adjustment</p>
            <p><strong>Analysis:</strong> Pre/post reform analysis with 24-month windows and 12-month supply response lag</p>
            <p className="text-sm text-[var(--text-muted)] mt-3">
              Methodology follows research framework: Pre-period (24 months before reform), Lag period (12 months), Post-period (24 months after lag).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* State Detail Panel (Modal) */}
      {selectedState && (
        <StateDetailPanel
          state={selectedState}
          onClose={() => setSelectedState(null)}
        />
      )}

      {/* County Drill-Down (Modal) */}
      {countyDrillDown && (
        <CountyDrillDown
          stateFips={countyDrillDown.stateFips}
          stateName={countyDrillDown.stateName}
          onClose={() => setCountyDrillDown(null)}
        />
      )}
    </div>
  );
}
