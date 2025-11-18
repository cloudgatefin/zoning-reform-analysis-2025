"use client";

import { useState, useEffect } from "react";
import * as d3 from "d3";

interface CountyData {
  fips: string;
  state_fips: string;
  county_fips: string;
  county_name: string;
  total_permits: number;
  sf_permits: number;
  mf_permits: number;
  avg_monthly: number;
  mf_share_pct: string;
  months: Array<{
    date: string;
    total: number;
    sf: number;
    mf: number;
  }>;
}

interface CountyDrillDownProps {
  stateFips: string;
  stateName: string;
  onClose: () => void;
}

export function CountyDrillDown({ stateFips, stateName, onClose }: CountyDrillDownProps) {
  const [counties, setCounties] = useState<CountyData[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounties() {
      try {
        const response = await fetch(`/api/counties/${stateFips}`);
        const result = await response.json();

        if (result.success && result.data) {
          setCounties(result.data);
          if (result.data.length > 0) {
            setSelectedCounty(result.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching county data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCounties();
  }, [stateFips]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[var(--bg-card)] rounded-lg p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <p className="text-[var(--text-muted)]">Loading county data...</p>
        </div>
      </div>
    );
  }

  if (counties.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[var(--bg-card)] rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {stateName} - County Data
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-[var(--text-muted)]">
            No county-level data available for this state. Data is currently available for California, Texas, Florida, Arizona, North Carolina, and Minnesota.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
            📍 {stateName} - County Breakdown
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Counties</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{counties.length}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Total Permits (2015-2024)</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {counties.reduce((sum, c) => sum + c.total_permits, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Avg MF Share</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {(counties.reduce((sum, c) => sum + parseFloat(c.mf_share_pct), 0) / counties.length).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* County List */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Counties</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {counties.map(county => (
                <button
                  key={county.fips}
                  onClick={() => setSelectedCounty(county)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedCounty?.fips === county.fips
                      ? 'bg-[var(--accent-blue)] bg-opacity-10 border-[var(--accent-blue)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-default)] hover:border-[var(--accent-blue)]'
                  }`}
                >
                  <p className="font-semibold text-[var(--text-primary)] text-sm mb-1">
                    {county.county_name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {county.total_permits.toLocaleString()} permits
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* County Details */}
          {selectedCounty && (
            <div className="col-span-2">
              <div className="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] p-4">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                  {selectedCounty.county_name} County
                </h3>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)]">
                    <p className="text-sm text-[var(--text-muted)] mb-1">Total Permits (2015-2024)</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {selectedCounty.total_permits.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)]">
                    <p className="text-sm text-[var(--text-muted)] mb-1">Avg Monthly Permits</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {selectedCounty.avg_monthly.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)]">
                    <p className="text-sm text-[var(--text-muted)] mb-1">Single-Family Share</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {(100 - parseFloat(selectedCounty.mf_share_pct)).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)]">
                    <p className="text-sm text-[var(--text-muted)] mb-1">Multi-Family Share</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {selectedCounty.mf_share_pct}%
                    </p>
                  </div>
                </div>

                {/* Trend Sparkline */}
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Permit Trend (2015-2024)
                  </h4>
                  <CountySparkline data={selectedCounty.months} />
                </div>

                {/* Breakdown */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-[var(--bg-card)] rounded border border-[var(--border-default)]">
                    <p className="text-xs text-[var(--text-muted)]">Single-Family</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {selectedCounty.sf_permits.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-[var(--bg-card)] rounded border border-[var(--border-default)]">
                    <p className="text-xs text-[var(--text-muted)]">Multi-Family</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {selectedCounty.mf_permits.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sparkline component for trend visualization
function CountySparkline({ data }: { data: Array<{ date: string; total: number }> }) {
  const width = 500;
  const height = 80;
  const margin = { top: 5, right: 5, bottom: 5, left: 5 };

  // Sort by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const xScale = d3.scaleLinear()
    .domain([0, sortedData.length - 1])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(sortedData, d => d.total) as number * 1.1])
    .range([height - margin.bottom, margin.top]);

  const line = d3.line<{ date: string; total: number }>()
    .x((d, i) => xScale(i))
    .y(d => yScale(d.total))
    .curve(d3.curveMonotoneX);

  const pathData = line(sortedData);

  return (
    <svg width={width} height={height} className="w-full h-auto">
      <path
        d={pathData || ''}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
      />
      <circle
        cx={xScale(sortedData.length - 1)}
        cy={yScale(sortedData[sortedData.length - 1].total)}
        r={3}
        fill="#3b82f6"
      />
    </svg>
  );
}
