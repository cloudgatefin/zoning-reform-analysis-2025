"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Types
interface Reform {
  id: string;
  city: string;
  state: string;
  state_code: string;
  reform_name: string;
  reform_type: string;
  adoption_date: string;
  year: number;
  region: string;
  baseline_wrluri: number | null;
}

interface TimelineProps {
  reforms: Reform[];
}

// Color mapping for reform types
const REFORM_COLORS: Record<string, string> = {
  "ADU/Lot Split": "#3B82F6",      // Blue
  "Parking Reform": "#10B981",      // Green
  "Comprehensive Reform": "#F59E0B", // Orange
  "Zoning Upzones": "#8B5CF6",      // Purple
  "Other": "#6B7280",               // Gray
};

// Region list
const REGIONS = ["West Coast", "Mountain", "Midwest", "South", "Northeast", "Other"];

// Helper functions
function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    acc[k] = acc[k] || [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function countBy<T>(arr: T[], key: keyof T): Record<string, number> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// Main Component
export function ReformAdoptionTimeline({ reforms }: TimelineProps) {
  // Filter state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[number, number]>([2015, 2024]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationYear, setAnimationYear] = useState<number | null>(null);
  const [selectedReform, setSelectedReform] = useState<Reform | null>(null);

  // Get unique reform types
  const reformTypes = useMemo(() => {
    return [...new Set(reforms.map((r) => r.reform_type))].sort();
  }, [reforms]);

  // Filter reforms
  const filteredReforms = useMemo(() => {
    return reforms.filter((r) => {
      const inTypeFilter =
        selectedTypes.length === 0 || selectedTypes.includes(r.reform_type);
      const inRegionFilter =
        selectedRegions.length === 0 || selectedRegions.includes(r.region);
      const inDateRange = r.year >= dateRange[0] && r.year <= dateRange[1];
      const inAnimation = animationYear === null || r.year <= animationYear;
      return inTypeFilter && inRegionFilter && inDateRange && inAnimation;
    });
  }, [reforms, selectedTypes, selectedRegions, dateRange, animationYear]);

  // Prepare chart data (stacked by reform type per year)
  const chartData = useMemo(() => {
    const years = Array.from(
      { length: dateRange[1] - dateRange[0] + 1 },
      (_, i) => dateRange[0] + i
    );

    return years.map((year) => {
      const yearReforms = filteredReforms.filter((r) => r.year === year);
      const byType = countBy(yearReforms, "reform_type");

      return {
        year,
        "ADU/Lot Split": byType["ADU/Lot Split"] || 0,
        "Parking Reform": byType["Parking Reform"] || 0,
        "Comprehensive Reform": byType["Comprehensive Reform"] || 0,
        "Zoning Upzones": byType["Zoning Upzones"] || 0,
        total: yearReforms.length,
      };
    });
  }, [filteredReforms, dateRange]);

  // Statistics
  const stats = useMemo(() => {
    const byType = countBy(filteredReforms, "reform_type");
    const byRegion = countBy(filteredReforms, "region");

    // Calculate YoY trend
    const thisYear = filteredReforms.filter((r) => r.year === 2024).length;
    const lastYear = filteredReforms.filter((r) => r.year === 2023).length;
    const yoyChange = lastYear > 0 ? ((thisYear - lastYear) / lastYear) * 100 : 0;

    return {
      total: filteredReforms.length,
      byType,
      byRegion,
      yoyChange,
      leadingRegion: Object.entries(byRegion).sort((a, b) => b[1] - a[1])[0],
    };
  }, [filteredReforms]);

  // Animation logic
  useEffect(() => {
    if (!isAnimating) return;

    const startYear = dateRange[0];
    let year = animationYear || startYear;

    const timer = setInterval(() => {
      if (year < dateRange[1]) {
        year++;
        setAnimationYear(year);
      } else {
        setIsAnimating(false);
      }
    }, 600);

    return () => clearInterval(timer);
  }, [isAnimating, dateRange, animationYear]);

  const handlePlayPause = () => {
    if (isAnimating) {
      setIsAnimating(false);
    } else {
      if (animationYear === dateRange[1]) {
        setAnimationYear(dateRange[0]);
      }
      setIsAnimating(true);
    }
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setSelectedRegions([]);
    setDateRange([2015, 2024]);
    setIsAnimating(false);
    setAnimationYear(null);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    const total = payload.reduce((sum: number, p: any) => sum + p.value, 0);
    const yearReforms = filteredReforms.filter((r) => r.year === label);

    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-[var(--text-primary)] mb-2">
          {label}: {total} reforms
        </p>
        <div className="space-y-1">
          {payload
            .filter((p: any) => p.value > 0)
            .map((p: any) => (
              <div key={p.name} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: p.fill }}
                />
                <span className="text-[var(--text-muted)]">{p.name}:</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {p.value}
                </span>
              </div>
            ))}
        </div>
        {yearReforms.length > 0 && yearReforms.length <= 5 && (
          <div className="mt-2 pt-2 border-t border-[var(--border-default)]">
            <p className="text-xs text-[var(--text-muted)] mb-1">Cities:</p>
            {yearReforms.slice(0, 5).map((r) => (
              <p key={r.id} className="text-xs text-[var(--text-primary)]">
                {r.city}, {r.state_code}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Reform Adoption Timeline
        </h2>
        <p className="text-[var(--text-muted)] mt-1">
          Track how zoning reforms are spreading across the United States
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
        <div className="flex flex-wrap items-center gap-4">
          {/* Reform Type Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Reform Type
            </label>
            <div className="flex flex-wrap gap-2">
              {reformTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedTypes.includes(type)
                      ? "bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]"
                      : "bg-transparent text-[var(--text-primary)] border-[var(--border-default)] hover:border-[var(--accent-blue)]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Region Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Region
            </label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.filter(r => stats.byRegion[r] > 0).map((region) => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedRegions.includes(region)
                      ? "bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]"
                      : "bg-transparent text-[var(--text-primary)] border-[var(--border-default)] hover:border-[var(--accent-blue)]"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date Range Slider */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Date Range: {dateRange[0]} - {dateRange[1]}
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={2015}
              max={2024}
              value={dateRange[0]}
              onChange={(e) =>
                setDateRange([Math.min(parseInt(e.target.value), dateRange[1]), dateRange[1]])
              }
              className="flex-1"
            />
            <input
              type="range"
              min={2015}
              max={2024}
              value={dateRange[1]}
              onChange={(e) =>
                setDateRange([dateRange[0], Math.max(parseInt(e.target.value), dateRange[0])])
              }
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-muted)]">Total Reforms</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">
            {stats.total}
          </p>
        </div>

        <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-muted)]">ADU/Lot Split</p>
          <p className="text-2xl font-bold" style={{ color: REFORM_COLORS["ADU/Lot Split"] }}>
            {stats.byType["ADU/Lot Split"] || 0}
          </p>
        </div>

        <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-muted)]">Comprehensive</p>
          <p className="text-2xl font-bold" style={{ color: REFORM_COLORS["Comprehensive Reform"] }}>
            {stats.byType["Comprehensive Reform"] || 0}
          </p>
        </div>

        <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-muted)]">Leading Region</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">
            {stats.leadingRegion ? `${stats.leadingRegion[0]} (${stats.leadingRegion[1]})` : "-"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
            <XAxis
              dataKey="year"
              stroke="var(--text-muted)"
              tick={{ fill: "var(--text-muted)" }}
            />
            <YAxis
              stroke="var(--text-muted)"
              tick={{ fill: "var(--text-muted)" }}
              label={{
                value: "Number of Reforms",
                angle: -90,
                position: "insideLeft",
                fill: "var(--text-muted)",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="ADU/Lot Split"
              stackId="a"
              fill={REFORM_COLORS["ADU/Lot Split"]}
              name="ADU/Lot Split"
            />
            <Bar
              dataKey="Comprehensive Reform"
              stackId="a"
              fill={REFORM_COLORS["Comprehensive Reform"]}
              name="Comprehensive"
            />
            <Bar
              dataKey="Zoning Upzones"
              stackId="a"
              fill={REFORM_COLORS["Zoning Upzones"]}
              name="Upzones"
            />
            <Bar
              dataKey="Parking Reform"
              stackId="a"
              fill={REFORM_COLORS["Parking Reform"]}
              name="Parking"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          {isAnimating ? "Pause" : "Play"} Timeline
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--border-default)] transition-colors"
        >
          Reset Filters
        </button>
        {animationYear && (
          <span className="text-sm text-[var(--text-muted)]">
            Showing reforms through {animationYear}
          </span>
        )}
      </div>

      {/* Recent Reforms List */}
      {filteredReforms.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            Recent Reforms ({filteredReforms.slice(-10).length} of {filteredReforms.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredReforms.slice(-12).reverse().map((reform) => (
              <button
                key={reform.id}
                onClick={() => setSelectedReform(reform)}
                className="p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] text-left hover:border-[var(--accent-blue)] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[var(--text-primary)]">
                    {reform.city}, {reform.state_code}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {reform.year}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: REFORM_COLORS[reform.reform_type] || REFORM_COLORS["Other"],
                    }}
                  />
                  <span className="text-sm text-[var(--text-muted)]">
                    {reform.reform_type}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reform Detail Popup */}
      {selectedReform && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {selectedReform.city}, {selectedReform.state_code}
              </h3>
              <button
                onClick={() => setSelectedReform(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Reform Name</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {selectedReform.reform_name}
                </p>
              </div>

              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Type</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          REFORM_COLORS[selectedReform.reform_type] ||
                          REFORM_COLORS["Other"],
                      }}
                    />
                    <span className="text-[var(--text-primary)]">
                      {selectedReform.reform_type}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Adoption Date</p>
                  <p className="text-[var(--text-primary)]">
                    {selectedReform.adoption_date}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[var(--text-muted)]">Region</p>
                <p className="text-[var(--text-primary)]">{selectedReform.region}</p>
              </div>

              {selectedReform.baseline_wrluri && (
                <div>
                  <p className="text-sm text-[var(--text-muted)]">
                    Regulatory Restrictiveness (WRLURI)
                  </p>
                  <p className="text-[var(--text-primary)]">
                    {selectedReform.baseline_wrluri.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedReform(null)}
              className="mt-6 w-full px-4 py-2 bg-[var(--accent-blue)] text-white rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
