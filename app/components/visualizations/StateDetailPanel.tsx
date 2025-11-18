"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { ReformMetric } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

interface StateDetailPanelProps {
  state: ReformMetric | null;
  onClose: () => void;
}

export function StateDetailPanel({ state, onClose }: StateDetailPanelProps) {
  const sparklineRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!state || !sparklineRef.current) return;

    // Generate sample trend data (in real app, this would come from time series data)
    const trendData = generateTrendData(state);

    // Clear existing
    d3.select(sparklineRef.current).selectAll("*").remove();

    const width = 300;
    const height = 80;
    const margin = { top: 10, right: 10, bottom: 20, left: 40 };

    const svg = d3.select(sparklineRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(trendData, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(trendData, d => d.value) as number])
      .range([height - margin.bottom, margin.top]);

    // Line generator
    const line = d3.line<{date: Date, value: number}>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw area (fill under line)
    const area = d3.area<{date: Date, value: number}>()
      .x(d => xScale(d.date))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(trendData)
      .attr("fill", "rgba(37, 99, 235, 0.1)")
      .attr("d", area);

    // Draw line
    svg.append("path")
      .datum(trendData)
      .attr("fill", "none")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add reform marker
    const reformDate = new Date(state.effective_date);
    svg.append("line")
      .attr("x1", xScale(reformDate))
      .attr("x2", xScale(reformDate))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(4)
      .tickFormat(d3.timeFormat("%Y") as any);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .attr("color", "#9ca3af")
      .attr("font-size", "10px");

  }, [state]);

  if (!state) return null;

  const pctChange = parseFloat(state.pct_change as any);
  const isPositive = pctChange >= 0;

  return (
    <Card className="fixed top-20 right-5 w-96 z-50 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{state.jurisdiction}</CardTitle>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          ✕
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reform Info */}
        <div>
          <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            {state.reform_name}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {state.reform_type} • Effective {new Date(state.effective_date).toLocaleDateString()}
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--bg-primary)] p-3 rounded-lg">
            <div className="text-xs text-[var(--text-muted)] mb-1">Pre-Reform</div>
            <div className="text-lg font-semibold text-[var(--text-primary)]">
              {parseFloat(state.pre_mean_total as any).toFixed(0)}
            </div>
            <div className="text-xs text-[var(--text-muted)]">permits/month</div>
          </div>

          <div className="bg-[var(--bg-primary)] p-3 rounded-lg">
            <div className="text-xs text-[var(--text-muted)] mb-1">Post-Reform</div>
            <div className="text-lg font-semibold text-[var(--text-primary)]">
              {parseFloat(state.post_mean_total as any).toFixed(0)}
            </div>
            <div className="text-xs text-[var(--text-muted)]">permits/month</div>
          </div>
        </div>

        {/* Percent Change */}
        <div className={`p-4 rounded-lg ${isPositive ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
          <div className="text-xs text-[var(--text-muted)] mb-1">Total Change</div>
          <div className={`text-2xl font-bold ${isPositive ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'}`}>
            {isPositive ? '+' : ''}{pctChange.toFixed(1)}%
          </div>
        </div>

        {/* Sparkline Trend */}
        <div>
          <div className="text-xs font-semibold text-[var(--text-muted)] mb-2">
            Permit Trend (2015-2024)
          </div>
          <svg ref={sparklineRef} className="w-full" />
          <div className="text-xs text-[var(--text-muted)] text-center mt-1">
            <span className="text-[var(--negative-red)]">━</span> Reform Date
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="border-t border-[var(--border-default)] pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">MF Share Change:</span>
            <span className={parseFloat(state.mf_share_change as any) >= 0 ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'}>
              {parseFloat(state.mf_share_change as any) >= 0 ? '+' : ''}{parseFloat(state.mf_share_change as any).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">WRLURI Baseline:</span>
            <span className="text-[var(--text-primary)]">{state.baseline_wrluri}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">Data Quality:</span>
            <span className={state.status === 'ok' ? 'text-[var(--positive-green)]' : 'text-[var(--text-muted)]'}>
              {state.status === 'ok' ? '✓ Complete' : '⚠ Limited'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to generate sample trend data
function generateTrendData(state: ReformMetric) {
  const startDate = new Date(2015, 0, 1);
  const endDate = new Date(2024, 11, 31);
  const reformDate = new Date(state.effective_date);

  const data: { date: Date; value: number }[] = [];

  // Generate monthly data points
  let currentDate = new Date(startDate);
  const preMean = parseFloat(state.pre_mean_total as any);
  const postMean = parseFloat(state.post_mean_total as any);

  while (currentDate <= endDate) {
    const monthsSinceStart = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const monthsSinceReform = (currentDate.getTime() - reformDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    let value: number;

    if (currentDate < reformDate) {
      // Pre-reform: slight growth trend with noise
      value = preMean * (1 + Math.sin(monthsSinceStart / 12) * 0.1) * (1 + Math.random() * 0.1 - 0.05);
    } else if (monthsSinceReform < 12) {
      // Transition period: linear interpolation
      const progress = monthsSinceReform / 12;
      value = preMean + (postMean - preMean) * progress + Math.random() * preMean * 0.1;
    } else {
      // Post-reform: new mean with noise
      value = postMean * (1 + Math.sin(monthsSinceStart / 12) * 0.1) * (1 + Math.random() * 0.1 - 0.05);
    }

    data.push({
      date: new Date(currentDate),
      value: Math.max(0, value)
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return data;
}
