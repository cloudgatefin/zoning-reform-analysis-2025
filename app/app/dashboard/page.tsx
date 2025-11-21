"use client";

import { useState, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardHeader, FilterControls, SummaryCards, PercentChangeChart, ReformsTable } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent, PlaceSearch } from "@/components/ui";
import { Search, ArrowRight, Calculator } from 'lucide-react';
import Link from 'next/link';
import { useReformMetrics } from "@/lib/hooks/useReformMetrics";
import { computeSummary, getUniqueJurisdictions, getUniqueReformTypes } from "@/lib/data-transforms";
import { ReformMetric } from "@/lib/types";
import analytics from "@/lib/analytics";

// Lazy load heavy visualization components
const ChoroplethMap = dynamic(() => import("@/components/visualizations/ChoroplethMap").then(m => ({ default: m.ChoroplethMap })), {
  loading: () => <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />,
  ssr: false
});

const StateDetailPanel = dynamic(() => import("@/components/visualizations/StateDetailPanel").then(m => ({ default: m.StateDetailPanel })), {
  ssr: false
});

const WRLURIScatterPlot = dynamic(() => import("@/components/visualizations/WRLURIScatterPlot").then(m => ({ default: m.WRLURIScatterPlot })), {
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />,
  ssr: false
});

const StateComparison = dynamic(() => import("@/components/visualizations/StateComparison").then(m => ({ default: m.StateComparison })), {
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
});

const ReformTimeline = dynamic(() => import("@/components/visualizations/ReformTimeline").then(m => ({ default: m.ReformTimeline })), {
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
});

const CountyDrillDown = dynamic(() => import("@/components/visualizations/CountyDrillDown").then(m => ({ default: m.CountyDrillDown })), {
  ssr: false
});

const ReformPredictions = dynamic(() => import("@/components/visualizations/ReformPredictions").then(m => ({ default: m.ReformPredictions })), {
  loading: () => <div className="h-48 bg-gray-800 animate-pulse rounded-lg" />
});

const EconomicContextPanel = dynamic(() => import("@/components/visualizations/EconomicContextPanel"));

const CausalMethodsComparison = dynamic(() => import("@/components/visualizations/CausalMethodsComparison"));

const PlaceDetailPanel = dynamic(() => import("@/components/visualizations/PlaceDetailPanel"));

const ReformImpactCalculator = dynamic(() => import("@/components/visualizations/ReformImpactCalculator"), {
  loading: () => <div className="h-32 bg-gray-800 animate-pulse rounded-lg" />
});

const SyntheticControlPanel = dynamic(() => import("@/components/visualizations/SyntheticControlPanel"), {
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
});

const EventStudyChart = dynamic(() => import("@/components/visualizations/EventStudyChart"), {
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
});

interface SelectedPlace {
  place_fips: string
  place_name: string
  state_fips: string
  recent_units_2024: number
  growth_rate_5yr: number
  mf_share_recent: number
}

export default function DashboardPage() {
  const { metrics, isLoading, isError } = useReformMetrics();
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("__ALL__");
  const [selectedReformType, setSelectedReformType] = useState("__ALL__");
  const [selectedState, setSelectedState] = useState<ReformMetric | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ fips: string; name: string } | null>(null);
  const [countyDrillDown, setCountyDrillDown] = useState<{ stateFips: string; stateName: string } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [causalAnalysisTab, setCausalAnalysisTab] = useState<'scm' | 'event-study'>('scm');

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
    analytics.buttonClick('clear_filters');
  };

  const handleJurisdictionChange = (value: string) => {
    setSelectedJurisdiction(value);
    analytics.filterChange('jurisdiction', value);
  };

  const handleReformTypeChange = (value: string) => {
    setSelectedReformType(value);
    analytics.filterChange('reform_type', value);
  };

  const handlePlaceSelect = (place: SelectedPlace) => {
    setSelectedPlace(place);
    analytics.placeSelected(place.place_fips, place.place_name);
  };

  const handleStateClick = (stateFips: string, stateName: string) => {
    setCountyDrillDown({ stateFips, stateName });
    analytics.mapInteraction('state_click', stateName);
  };

  const handleCityClick = (fips: string, name: string) => {
    setSelectedCity({ fips, name });
    analytics.placeSelected(fips, name);
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
        onJurisdictionChange={handleJurisdictionChange}
        onReformTypeChange={handleReformTypeChange}
        onClear={handleClearFilters}
      />

      <SummaryCards stats={summary} />

      {/* Scenario Builder CTA */}
      <Card className="mb-5 bg-gradient-to-r from-[var(--accent-blue)]/10 to-[var(--accent-blue)]/5 border-[var(--accent-blue)]/30">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--accent-blue)]/20 rounded-lg">
                <Calculator className="w-6 h-6 text-[var(--accent-blue)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  What if we adopt this reform?
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Use our Scenario Builder to predict how reforms will impact your city. Get optimistic, realistic, and pessimistic scenarios based on comparable cities.
                </p>
              </div>
            </div>
            <Link
              href="/scenario"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-blue)] text-white rounded-lg font-medium hover:bg-[var(--accent-blue)]/90 transition-colors whitespace-nowrap"
            >
              Build Scenario
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Phase 2: Reform Impact Calculator */}
      <Card className="mb-5 border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="text-lg">
            Reform Impact Calculator
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Predict how a zoning reform will affect building permits in your jurisdiction
          </p>
        </CardHeader>
        <CardContent>
          <ReformImpactCalculator />
        </CardContent>
      </Card>

      {/* Place Search Section */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Place Explorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlaceSearch
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search 24,535+ places... (e.g., Austin, Minneapolis, Portland)"
          />
          <p className="text-xs text-gray-500 mt-3">
            Search for cities with documented permit data and zoning reforms
          </p>
        </CardContent>
      </Card>

      {/* Place Detail Panel */}
      {selectedPlace && (
        <div className="mb-5">
          <PlaceDetailPanel
            placeFips={selectedPlace.place_fips}
            onClose={() => setSelectedPlace(null)}
          />
        </div>
      )}

      {/* Interactive Choropleth Map */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>U.S. Zoning Reform Impact Map</CardTitle>
        </CardHeader>
        <CardContent>
          <ChoroplethMap
            data={filteredData}
            onStateClick={handleStateClick}
          />
          <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
            Click any state to view county-level breakdown
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

      {/* Causal Analysis Section - SCM & Event Study */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Causal Analysis</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Advanced causal inference methods to quantify reform impacts
          </p>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex border-b mb-4">
            <button
              onClick={() => setCausalAnalysisTab('scm')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                causalAnalysisTab === 'scm'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Synthetic Control
            </button>
            <button
              onClick={() => setCausalAnalysisTab('event-study')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                causalAnalysisTab === 'event-study'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Event Study
            </button>
          </div>

          {/* Tab Content */}
          {causalAnalysisTab === 'scm' && <SyntheticControlPanel />}
          {causalAnalysisTab === 'event-study' && <EventStudyChart />}
        </CardContent>
      </Card>

      {/* City-Level Analysis Section */}
      {selectedCity && (
        <div className="space-y-5 mb-5">
          <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                City-Level Analysis: {selectedCity.name}
              </h2>
              <button
                onClick={() => setSelectedCity(null)}
                className="text-gray-500 hover:text-gray-700 font-bold text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Detailed economic context and causal inference analysis for this jurisdiction
            </p>
          </Card>

          {/* Economic Context Section */}
          <Card className="p-4">
            <EconomicContextPanel
              jurisdictionFips={selectedCity.fips}
              jurisdictionName={selectedCity.name}
            />
          </Card>

          {/* Causal Methods Comparison Section */}
          <Card className="p-4">
            <CausalMethodsComparison
              jurisdictionFips={selectedCity.fips}
              jurisdictionName={selectedCity.name}
            />
          </Card>
        </div>
      )}

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
          <ReformsTable
            data={filteredData}
            onCityClick={handleCityClick}
          />
          <p className="text-xs text-gray-500 mt-3">
            Click on any city name to view detailed economic context and causal analysis
          </p>
        </CardContent>
      </Card>

      {/* Data Source Info */}
      <Card>
        <CardHeader>
          <CardTitle>Data Source & Methodology</CardTitle>
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
