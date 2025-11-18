"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { ReformMetric, BaselineStateMetric } from "@/lib/types";

interface ChoroplethMapProps {
  data: ReformMetric[];
  width?: number;
  height?: number;
  onStateClick?: (stateFips: string, stateName: string) => void;
}

// ColorBrewer diverging scale: red (negative) to blue (positive)
const COLOR_SCALE = d3.scaleSequential(d3.interpolateRdYlBu)
  .domain([-20, 20]); // -20% to +20% change

// Combined state data type
interface StateDisplayData {
  state_fips: string;
  state_name: string;
  isReform: boolean;
  // Reform-specific fields
  jurisdiction?: string;
  reform_name?: string;
  reform_type?: string;
  effective_date?: string;
  pct_change?: number;
  pre_mean_total?: number;
  post_mean_total?: number;
  // Baseline fields
  growth_rate_pct?: number;
  avg_monthly_permits?: number;
  total_permits?: number;
  mf_share_pct?: number;
}

export function ChoroplethMap({ data, width = 960, height = 600, onStateClick }: ChoroplethMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allStatesData, setAllStatesData] = useState<Map<string, StateDisplayData>>(new Map());

  // Fetch baseline state data
  useEffect(() => {
    async function fetchBaselineData() {
      try {
        const response = await fetch('/api/states/baseline');
        const result = await response.json();

        if (result.success && result.data) {
          const baselineStates: BaselineStateMetric[] = result.data;

          // Create a map of all states with baseline data
          const stateMap = new Map<string, StateDisplayData>();

          baselineStates.forEach(state => {
            stateMap.set(state.state_fips, {
              state_fips: state.state_fips,
              state_name: state.state_name,
              isReform: false,
              growth_rate_pct: state.growth_rate_pct,
              avg_monthly_permits: state.avg_monthly_permits,
              total_permits: state.total_permits_2015_2024,
              mf_share_pct: state.mf_share_pct,
            });
          });

          // Overlay reform states (they override baseline data)
          data.forEach(reform => {
            stateMap.set(reform.state_fips, {
              state_fips: reform.state_fips,
              state_name: reform.jurisdiction,
              isReform: true,
              jurisdiction: reform.jurisdiction,
              reform_name: reform.reform_name,
              reform_type: reform.reform_type,
              effective_date: reform.effective_date,
              pct_change: parseFloat(reform.pct_change as any),
              pre_mean_total: parseFloat(reform.pre_mean_total as any),
              post_mean_total: parseFloat(reform.post_mean_total as any),
            });
          });

          setAllStatesData(stateMap);
        }
      } catch (error) {
        console.error('Error fetching baseline state data:', error);
      }
    }

    fetchBaselineData();
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || allStatesData.size === 0) return;

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create map
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Create projection
    const projection = d3.geoAlbersUsa()
      .scale(1300)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load TopoJSON
    fetch('/data/geo/us-states.json')
      .then(response => response.json())
      .then((topology: any) => {
        setIsLoading(false);

        // Convert TopoJSON to GeoJSON
        const states = feature(topology, topology.objects.states) as any;

        // Draw states
        svg.append("g")
          .selectAll("path")
          .data(states.features)
          .join("path")
          .attr("d", path)
          .attr("fill", (d: any) => {
            const stateData = allStatesData.get(d.id.toString().padStart(2, '0'));
            if (!stateData) return "#e5e7eb"; // Gray for no data

            // Use reform pct_change for reform states, growth_rate for baseline states
            const changeValue = stateData.isReform
              ? (stateData.pct_change ?? 0)
              : (stateData.growth_rate_pct ?? 0);

            if (isNaN(changeValue)) return "#e5e7eb";
            return COLOR_SCALE(changeValue);
          })
          .attr("stroke", (d: any) => {
            const stateData = allStatesData.get(d.id.toString().padStart(2, '0'));
            // Reform states get a gold border
            return stateData?.isReform ? "#fbbf24" : "#1f2937";
          })
          .attr("stroke-width", (d: any) => {
            const stateData = allStatesData.get(d.id.toString().padStart(2, '0'));
            // Reform states get thicker border
            return stateData?.isReform ? 1.5 : 0.5;
          })
          .attr("class", "state-path cursor-pointer transition-all hover:stroke-2 hover:stroke-white")
          .on("mouseenter", function(event, d: any) {
            const stateData = allStatesData.get(d.id.toString().padStart(2, '0'));

            if (stateData && tooltipRef.current) {
              const tooltip = d3.select(tooltipRef.current);

              if (stateData.isReform) {
                // Reform state tooltip
                tooltip
                  .style("display", "block")
                  .style("left", `${event.pageX + 10}px`)
                  .style("top", `${event.pageY - 28}px`)
                  .html(`
                    <div class="bg-[var(--bg-card)] border-2 border-[#fbbf24] rounded-lg p-3 shadow-lg">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-lg">⭐</span>
                        <span class="font-semibold text-[var(--text-primary)]">${stateData.jurisdiction}</span>
                      </div>
                      <div class="text-sm text-[var(--text-muted)] mb-2">${stateData.reform_name}</div>
                      <div class="text-base font-semibold ${(stateData.pct_change ?? 0) >= 0 ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'}">
                        Reform Impact: ${(stateData.pct_change ?? 0) >= 0 ? '+' : ''}${(stateData.pct_change ?? 0).toFixed(1)}%
                      </div>
                      <div class="text-xs text-[var(--text-muted)] mt-1">
                        ${(stateData.pre_mean_total ?? 0).toFixed(0)} → ${(stateData.post_mean_total ?? 0).toFixed(0)} permits/mo
                      </div>
                    </div>
                  `);
              } else {
                // Baseline state tooltip
                tooltip
                  .style("display", "block")
                  .style("left", `${event.pageX + 10}px`)
                  .style("top", `${event.pageY - 28}px`)
                  .html(`
                    <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-3 shadow-lg">
                      <div class="font-semibold text-[var(--text-primary)] mb-1">${stateData.state_name}</div>
                      <div class="text-base font-semibold ${(stateData.growth_rate_pct ?? 0) >= 0 ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'}">
                        Growth Rate: ${(stateData.growth_rate_pct ?? 0) >= 0 ? '+' : ''}${(stateData.growth_rate_pct ?? 0).toFixed(1)}%
                      </div>
                      <div class="text-xs text-[var(--text-muted)] mt-1">
                        Avg: ${(stateData.avg_monthly_permits ?? 0).toLocaleString()} permits/mo
                      </div>
                      <div class="text-xs text-[var(--text-muted)]">
                        Total (2015-2024): ${(stateData.total_permits ?? 0).toLocaleString()}
                      </div>
                    </div>
                  `);
              }
            }

            // Highlight state
            d3.select(this)
              .attr("stroke-width", 2)
              .attr("stroke", "#ffffff");
          })
          .on("mousemove", function(event) {
            if (tooltipRef.current) {
              d3.select(tooltipRef.current)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`);
            }
          })
          .on("mouseleave", function(event, d: any) {
            if (tooltipRef.current) {
              d3.select(tooltipRef.current).style("display", "none");
            }

            const stateData = allStatesData.get(d.id.toString().padStart(2, '0'));
            d3.select(this)
              .attr("stroke-width", stateData?.isReform ? 1.5 : 0.5)
              .attr("stroke", stateData?.isReform ? "#fbbf24" : "#1f2937");
          })
          .on("click", function(event, d: any) {
            const stateData = allStatesData.get(d.id.toString().padStart(2, '0'));
            if (stateData && onStateClick) {
              onStateClick(stateData.state_fips, stateData.state_name);
            }
          });

        // Add legend
        const legendWidth = 300;
        const legendHeight = 15;

        const legend = svg.append("g")
          .attr("transform", `translate(${width - legendWidth - 40}, ${height - 60})`);

        // Create gradient
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
          .attr("id", "color-gradient");

        const numStops = 10;
        for (let i = 0; i <= numStops; i++) {
          gradient.append("stop")
            .attr("offset", `${(i / numStops) * 100}%`)
            .attr("stop-color", COLOR_SCALE(-20 + (i / numStops) * 40));
        }

        // Legend rectangle
        legend.append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#color-gradient)")
          .attr("stroke", "#1f2937")
          .attr("stroke-width", 1);

        // Legend labels
        legend.append("text")
          .attr("x", 0)
          .attr("y", legendHeight + 15)
          .attr("text-anchor", "start")
          .attr("fill", "#9ca3af")
          .attr("font-size", "11px")
          .text("-20%");

        legend.append("text")
          .attr("x", legendWidth / 2)
          .attr("y", legendHeight + 15)
          .attr("text-anchor", "middle")
          .attr("fill", "#9ca3af")
          .attr("font-size", "11px")
          .text("0%");

        legend.append("text")
          .attr("x", legendWidth)
          .attr("y", legendHeight + 15)
          .attr("text-anchor", "end")
          .attr("fill", "#9ca3af")
          .attr("font-size", "11px")
          .text("+20%");

        legend.append("text")
          .attr("x", legendWidth / 2)
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .attr("fill", "#e5e7eb")
          .attr("font-size", "12px")
          .attr("font-weight", "500")
          .text("Permit Change (%)");

        // Add reform state indicator legend
        const reformLegend = svg.append("g")
          .attr("transform", `translate(40, ${height - 60})`);

        reformLegend.append("rect")
          .attr("width", 30)
          .attr("height", 15)
          .attr("fill", "none")
          .attr("stroke", "#fbbf24")
          .attr("stroke-width", 1.5);

        reformLegend.append("text")
          .attr("x", 35)
          .attr("y", 12)
          .attr("fill", "#e5e7eb")
          .attr("font-size", "11px")
          .text("⭐ Reform State");

        reformLegend.append("text")
          .attr("x", 0)
          .attr("y", -10)
          .attr("fill", "#9ca3af")
          .attr("font-size", "10px")
          .text("Reform states show impact; others show 2015-2024 growth");
      })
      .catch(error => {
        console.error("Error loading map data:", error);
        setIsLoading(false);
      });

  }, [allStatesData, width, height]);

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)] bg-opacity-50">
          <p className="text-[var(--text-muted)]">Loading map...</p>
        </div>
      )}
      <svg ref={svgRef} className="w-full h-auto" />
      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          display: "none",
          pointerEvents: "none",
          zIndex: 1000
        }}
      />
    </div>
  );
}
