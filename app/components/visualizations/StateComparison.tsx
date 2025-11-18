"use client";

import { useState, useEffect } from "react";
import { ReformMetric, BaselineStateMetric } from "@/lib/types";
import * as d3 from "d3";

interface StateComparisonProps {
  reformData: ReformMetric[];
}

interface CombinedStateData {
  state_fips: string;
  state_name: string;
  isReform: boolean;
  // Reform fields
  reform_name?: string;
  effective_date?: string;
  pct_change?: number;
  pre_mean_total?: number;
  post_mean_total?: number;
  // Baseline fields
  growth_rate_pct?: number;
  avg_monthly_permits?: number;
  total_permits?: number;
  mf_share_pct?: number;
  first_half_avg?: number;
  second_half_avg?: number;
}

export function StateComparison({ reformData }: StateComparisonProps) {
  const [allStates, setAllStates] = useState<CombinedStateData[]>([]);
  const [state1, setState1] = useState<string>("");
  const [state2, setState2] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all states data
  useEffect(() => {
    async function fetchAllStates() {
      try {
        const response = await fetch('/api/states/baseline');
        const result = await response.json();

        if (result.success && result.data) {
          const baselineStates: BaselineStateMetric[] = result.data;

          // Create combined list with baseline data
          const combinedStates: CombinedStateData[] = baselineStates.map(state => ({
            state_fips: state.state_fips,
            state_name: state.state_name,
            isReform: false,
            growth_rate_pct: state.growth_rate_pct,
            avg_monthly_permits: state.avg_monthly_permits,
            total_permits: state.total_permits_2015_2024,
            mf_share_pct: state.mf_share_pct,
            first_half_avg: state.first_half_avg,
            second_half_avg: state.second_half_avg,
          }));

          // Overlay reform states
          reformData.forEach(reform => {
            const index = combinedStates.findIndex(s => s.state_fips === reform.state_fips);
            if (index !== -1) {
              combinedStates[index] = {
                ...combinedStates[index],
                isReform: true,
                reform_name: reform.reform_name,
                effective_date: reform.effective_date,
                pct_change: parseFloat(reform.pct_change as any),
                pre_mean_total: parseFloat(reform.pre_mean_total as any),
                post_mean_total: parseFloat(reform.post_mean_total as any),
              };
            }
          });

          // Sort alphabetically
          combinedStates.sort((a, b) => a.state_name.localeCompare(b.state_name));

          setAllStates(combinedStates);

          // Set default comparison: California vs Texas
          const california = combinedStates.find(s => s.state_fips === "06");
          const texas = combinedStates.find(s => s.state_fips === "48");
          if (california) setState1("06");
          if (texas) setState2("48");
        }
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllStates();
  }, [reformData]);

  const selectedState1 = allStates.find(s => s.state_fips === state1);
  const selectedState2 = allStates.find(s => s.state_fips === state2);

  const getChangeValue = (state: CombinedStateData) => {
    return state.isReform ? (state.pct_change ?? 0) : (state.growth_rate_pct ?? 0);
  };

  const getChangeLabel = (state: CombinedStateData) => {
    return state.isReform ? "Reform Impact" : "Growth Rate (2015-2024)";
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] p-6">
        <p className="text-[var(--text-muted)]">Loading state comparison...</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] p-6">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
        State Comparison
      </h2>

      {/* State Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            State 1
          </label>
          <select
            value={state1}
            onChange={(e) => setState1(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
          >
            <option value="">Select a state...</option>
            {allStates.map(state => (
              <option key={state.state_fips} value={state.state_fips}>
                {state.isReform ? `⭐ ${state.state_name}` : state.state_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            State 2
          </label>
          <select
            value={state2}
            onChange={(e) => setState2(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
          >
            <option value="">Select a state...</option>
            {allStates.map(state => (
              <option key={state.state_fips} value={state.state_fips}>
                {state.isReform ? `⭐ ${state.state_name}` : state.state_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Cards */}
      {selectedState1 && selectedState2 && (
        <div className="grid grid-cols-2 gap-6">
          {/* State 1 Card */}
          <div className={`p-4 rounded-lg border-2 ${selectedState1.isReform ? 'border-[#fbbf24] bg-[#fbbf24]/5' : 'border-[var(--border-default)] bg-[var(--bg-surface)]'}`}>
            <div className="flex items-center gap-2 mb-3">
              {selectedState1.isReform && <span className="text-xl">⭐</span>}
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {selectedState1.state_name}
              </h3>
            </div>

            {selectedState1.isReform && (
              <div className="mb-3 pb-3 border-b border-[var(--border-default)]">
                <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Reform</p>
                <p className="text-sm text-[var(--text-primary)]">{selectedState1.reform_name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Effective: {selectedState1.effective_date ? new Date(selectedState1.effective_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--text-muted)]">{getChangeLabel(selectedState1)}</p>
                <p className={`text-2xl font-bold ${getChangeValue(selectedState1) >= 0 ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'}`}>
                  {getChangeValue(selectedState1) >= 0 ? '+' : ''}{getChangeValue(selectedState1).toFixed(1)}%
                </p>
              </div>

              {selectedState1.isReform ? (
                <>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Pre-Reform Average</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {(selectedState1.pre_mean_total ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} permits/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Post-Reform Average</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {(selectedState1.post_mean_total ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} permits/mo
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Average Monthly Permits</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {(selectedState1.avg_monthly_permits ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Total Permits (2015-2024)</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {(selectedState1.total_permits ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">2015-2019 Average</p>
                    <p className="text-base text-[var(--text-primary)]">
                      {(selectedState1.first_half_avg ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} permits/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">2020-2024 Average</p>
                    <p className="text-base text-[var(--text-primary)]">
                      {(selectedState1.second_half_avg ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} permits/mo
                    </p>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm text-[var(--text-muted)]">Multi-Family Share</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {(selectedState1.mf_share_pct ?? 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* State 2 Card */}
          <div className={`p-4 rounded-lg border-2 ${selectedState2.isReform ? 'border-[#fbbf24] bg-[#fbbf24]/5' : 'border-[var(--border-default)] bg-[var(--bg-surface)]'}`}>
            <div className="flex items-center gap-2 mb-3">
              {selectedState2.isReform && <span className="text-xl">⭐</span>}
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {selectedState2.state_name}
              </h3>
            </div>

            {selectedState2.isReform && (
              <div className="mb-3 pb-3 border-b border-[var(--border-default)]">
                <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Reform</p>
                <p className="text-sm text-[var(--text-primary)]">{selectedState2.reform_name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Effective: {selectedState2.effective_date ? new Date(selectedState2.effective_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--text-muted)]">{getChangeLabel(selectedState2)}</p>
                <p className={`text-2xl font-bold ${getChangeValue(selectedState2) >= 0 ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'}`}>
                  {getChangeValue(selectedState2) >= 0 ? '+' : ''}{getChangeValue(selectedState2).toFixed(1)}%
                </p>
              </div>

              {selectedState2.isReform ? (
                <>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Pre-Reform Average</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {(selectedState2.pre_mean_total ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} permits/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Post-Reform Average</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {(selectedState2.post_mean_total ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} permits/mo
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Average Monthly Permits</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {(selectedState2.avg_monthly_permits ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Total Permits (2015-2024)</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {(selectedState2.total_permits ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">2015-2019 Average</p>
                    <p className="text-base text-[var(--text-primary)]">
                      {(selectedState2.first_half_avg ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} permits/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">2020-2024 Average</p>
                    <p className="text-base text-[var(--text-primary)]">
                      {(selectedState2.second_half_avg ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} permits/mo
                    </p>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm text-[var(--text-muted)]">Multi-Family Share</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {(selectedState2.mf_share_pct ?? 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Summary */}
      {selectedState1 && selectedState2 && (
        <div className="mt-6 p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Comparison Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-muted)]">Change Difference</p>
              <p className={`font-semibold ${Math.abs(getChangeValue(selectedState1) - getChangeValue(selectedState2)) < 5 ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                {Math.abs(getChangeValue(selectedState1) - getChangeValue(selectedState2)).toFixed(1)}% points
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Better Performer</p>
              <p className="font-semibold text-[var(--text-primary)]">
                {getChangeValue(selectedState1) > getChangeValue(selectedState2) ? selectedState1.state_name : selectedState2.state_name}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">MF Share Difference</p>
              <p className="font-semibold text-[var(--text-primary)]">
                {Math.abs((selectedState1.mf_share_pct ?? 0) - (selectedState2.mf_share_pct ?? 0)).toFixed(1)}% points
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
