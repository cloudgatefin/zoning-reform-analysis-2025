"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { ReformMetric, toNumber } from "@/lib/types";

interface WRLURIScatterPlotProps {
  data: ReformMetric[];
  width?: number;
  height?: number;
  onPointClick?: (state: ReformMetric) => void;
}

export function WRLURIScatterPlot({
  data,
  width = 600,
  height = 400,
  onPointClick
}: WRLURIScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear existing
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.baseline_wrluri) as number * 1.1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([
        (d3.min(data, d => toNumber(d.pct_change)) ?? 0) * 1.2,
        (d3.max(data, d => toNumber(d.pct_change)) ?? 0) * 1.2
      ])
      .range([innerHeight, 0]);

    // Add zero line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", "#4b5563")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr("color", "#9ca3af")
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "#e5e7eb")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("WRLURI Baseline (Regulatory Restrictiveness)");

    g.append("g")
      .call(yAxis)
      .attr("color", "#9ca3af")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -45)
      .attr("fill", "#e5e7eb")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Permit Change (%)");

    // Color scale by reform type
    const reformTypes = Array.from(new Set(data.map(d => d.reform_type)));
    const colorScale = d3.scaleOrdinal<string>()
      .domain(reformTypes)
      .range(["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]);

    // Draw points
    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.baseline_wrluri))
      .attr("cy", d => yScale(toNumber(d.pct_change)))
      .attr("r", 8)
      .attr("fill", d => colorScale(d.reform_type))
      .attr("opacity", 0.8)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("class", "cursor-pointer transition-all hover:opacity-100 hover:r-10")
      .on("mouseenter", function(event, d) {
        if (tooltipRef.current) {
          const tooltip = d3.select(tooltipRef.current);

          tooltip
            .style("display", "block")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`)
            .html(`
              <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-3 shadow-lg">
                <div class="font-semibold text-[var(--text-primary)] mb-1">${d.jurisdiction}</div>
                <div class="text-xs text-[var(--text-muted)] mb-2">${d.reform_type}</div>
                <div class="text-sm">
                  <div class="flex justify-between gap-3 mb-1">
                    <span class="text-[var(--text-muted)]">WRLURI:</span>
                    <span class="text-[var(--text-primary)]">${d.baseline_wrluri.toFixed(2)}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-[var(--text-muted)]">Change:</span>
                    <span class="${toNumber(d.pct_change) >= 0 ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'}">
                      ${toNumber(d.pct_change) >= 0 ? '+' : ''}${toNumber(d.pct_change).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            `);
        }

        d3.select(this)
          .attr("r", 12)
          .attr("opacity", 1);
      })
      .on("mousemove", function(event) {
        if (tooltipRef.current) {
          d3.select(tooltipRef.current)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        }
      })
      .on("mouseleave", function() {
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style("display", "none");
        }

        d3.select(this)
          .attr("r", 8)
          .attr("opacity", 0.8);
      })
      .on("click", (event, d) => {
        if (onPointClick) {
          onPointClick(d);
        }
      });

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, 30)`);

    reformTypes.forEach((type, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow.append("circle")
        .attr("r", 5)
        .attr("fill", colorScale(type))
        .attr("opacity", 0.8);

      legendRow.append("text")
        .attr("x", 10)
        .attr("y", 4)
        .attr("fill", "#e5e7eb")
        .attr("font-size", "10px")
        .text(type.length > 15 ? type.substring(0, 12) + "..." : type);
    });

  }, [data, width, height, onPointClick]);

  return (
    <div className="relative">
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
