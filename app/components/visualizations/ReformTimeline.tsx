"use client";

import { useState, useEffect, useRef } from "react";
import { ReformMetric, toNumber } from "@/lib/types";
import * as d3 from "d3";

interface ReformTimelineProps {
  data: ReformMetric[];
}

interface TimelineEvent {
  date: Date;
  jurisdiction: string;
  reform_name: string;
  reform_type: string;
  pct_change: number;
  state_fips: string;
}

export function ReformTimeline({ data }: ReformTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const animationRef = useRef<number | null>(null);

  // Parse and sort reform events
  const events: TimelineEvent[] = data
    .filter(d => d.effective_date && d.pct_change !== null)
    .map(d => ({
      date: new Date(d.effective_date),
      jurisdiction: d.jurisdiction,
      reform_name: d.reform_name,
      reform_type: d.reform_type,
      pct_change: toNumber(d.pct_change),
      state_fips: d.state_fips ?? '',
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const minYear = events.length > 0 ? events[0].date.getFullYear() : 2015;
  const maxYear = events.length > 0 ? events[events.length - 1].date.getFullYear() : 2024;

  useEffect(() => {
    if (!svgRef.current || events.length === 0) return;

    const width = 900;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Create scales
    const xScale = d3.scaleTime()
      .domain([new Date(minYear, 0, 1), new Date(maxYear, 11, 31)])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([-20, 25])
      .range([height - margin.bottom, margin.top]);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(maxYear - minYear + 1)
      .tickFormat(d => d3.timeFormat("%Y")(d as Date));

    const yAxis = d3.axisLeft(yScale)
      .ticks(9)
      .tickFormat(d => `${d}%`);

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr("class", "axis")
      .selectAll("text")
      .attr("fill", "#9ca3af")
      .attr("font-size", "11px");

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .attr("class", "axis")
      .selectAll("text")
      .attr("fill", "#9ca3af")
      .attr("font-size", "11px");

    // Style axis lines
    svg.selectAll(".axis path, .axis line")
      .attr("stroke", "#374151")
      .attr("stroke-width", 1);

    // Add horizontal zero line
    svg.append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");

    // Add labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .text("Reform Effective Date");

    svg.append("text")
      .attr("transform", `translate(15, ${height / 2}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .text("Permit Change (%)");

    // Create tooltip group
    const tooltip = svg.append("g")
      .attr("class", "timeline-tooltip")
      .style("display", "none");

    tooltip.append("rect")
      .attr("fill", "var(--bg-card)")
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 2)
      .attr("rx", 6);

    tooltip.append("text")
      .attr("class", "tooltip-text")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "11px");

    // Add reform points
    const points = svg.append("g")
      .selectAll("circle")
      .data(events)
      .join("circle")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.pct_change))
      .attr("r", 0)
      .attr("fill", d => d.pct_change >= 0 ? "#10b981" : "#ef4444")
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 2)
      .attr("opacity", 0.8)
      .attr("class", "reform-point cursor-pointer")
      .on("mouseenter", function(event, d) {
        d3.select(this)
          .attr("r", 10)
          .attr("opacity", 1);

        const tooltipText = `${d.jurisdiction}\n${d.reform_name}\n${d.pct_change >= 0 ? '+' : ''}${d.pct_change.toFixed(1)}%`;
        const lines = tooltipText.split('\n');

        tooltip.style("display", "block");

        const textGroup = tooltip.select(".tooltip-text");
        textGroup.selectAll("*").remove();

        lines.forEach((line, i) => {
          textGroup.append("tspan")
            .attr("x", 10)
            .attr("y", 15 + i * 14)
            .text(line)
            .attr("font-weight", i === 0 ? "600" : "400");
        });

        const bbox = (textGroup.node() as any).getBBox();
        tooltip.select("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", bbox.width + 20)
          .attr("height", bbox.height + 10);

        const x = xScale(d.date);
        const y = yScale(d.pct_change);
        tooltip.attr("transform", `translate(${x + 15}, ${y - bbox.height / 2})`);
      })
      .on("mouseleave", function() {
        if (!currentYear || d3.select(this).datum().date.getFullYear() <= currentYear) {
          d3.select(this).attr("r", 6);
        } else {
          d3.select(this).attr("r", 0);
        }
        d3.select(this).attr("opacity", 0.8);
        tooltip.style("display", "none");
      });

    // Animate points if currentYear is set
    if (currentYear !== null) {
      points
        .transition()
        .duration(500)
        .attr("r", d => d.date.getFullYear() <= currentYear ? 6 : 0);
    }

    // Add vertical line for current year
    if (currentYear !== null) {
      const currentDate = new Date(currentYear, 11, 31);
      svg.append("line")
        .attr("class", "year-marker")
        .attr("x1", xScale(currentDate))
        .attr("x2", xScale(currentDate))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 3)
        .attr("opacity", 0.6);

      svg.append("text")
        .attr("x", xScale(currentDate))
        .attr("y", margin.top - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#3b82f6")
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .text(currentYear);
    }

  }, [events, currentYear, minYear, maxYear]);

  // Animation logic
  useEffect(() => {
    if (isPlaying) {
      const startYear = currentYear || minYear;
      let year = startYear;

      const animate = () => {
        if (year <= maxYear) {
          setCurrentYear(year);
          year++;
          animationRef.current = window.setTimeout(animate, 800);
        } else {
          setIsPlaying(false);
          setCurrentYear(maxYear);
        }
      };

      animate();
    } else {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, minYear, maxYear]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentYear === maxYear) {
        setCurrentYear(minYear);
      }
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentYear(null);
  };

  const handleYearChange = (year: number) => {
    setIsPlaying(false);
    setCurrentYear(year);
  };

  if (events.length === 0) {
    return (
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] p-6">
        <p className="text-[var(--text-muted)]">No reform data available for timeline.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Reform Adoption Timeline
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] hover:bg-[var(--border-default)] transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handlePlayPause}
            className="px-4 py-1.5 bg-[var(--accent-blue)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="mb-4">
        <svg ref={svgRef} className="w-full h-auto" />
      </div>

      {/* Year slider */}
      <div className="mt-4">
        <div className="flex items-center gap-4">
          <label className="text-sm text-[var(--text-muted)] min-w-fit">
            Select Year:
          </label>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={currentYear || minYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-[var(--bg-surface)] rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentYear || minYear) - minYear) / (maxYear - minYear) * 100}%, var(--bg-surface) ${((currentYear || minYear) - minYear) / (maxYear - minYear) * 100}%, var(--bg-surface) 100%)`
            }}
          />
          <span className="text-sm font-semibold text-[var(--text-primary)] min-w-[60px] text-right">
            {currentYear || minYear}
          </span>
        </div>
      </div>

      {/* Reform summary for current year */}
      {currentYear !== null && (
        <div className="mt-4 p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Reforms Through {currentYear}
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-muted)]">Total Reforms</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {events.filter(e => e.date.getFullYear() <= currentYear).length}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Positive Impact</p>
              <p className="text-lg font-bold text-[var(--positive-green)]">
                {events.filter(e => e.date.getFullYear() <= currentYear && e.pct_change >= 0).length}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Negative Impact</p>
              <p className="text-lg font-bold text-[var(--negative-red)]">
                {events.filter(e => e.date.getFullYear() <= currentYear && e.pct_change < 0).length}
              </p>
            </div>
          </div>

          {/* List of reforms in current year */}
          {events.filter(e => e.date.getFullYear() === currentYear).length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border-default)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">
                Reforms in {currentYear}:
              </p>
              <ul className="space-y-1">
                {events
                  .filter(e => e.date.getFullYear() === currentYear)
                  .map((e, i) => (
                    <li key={i} className="text-xs text-[var(--text-primary)] flex items-center gap-2">
                      <span className="text-[#fbbf24]">⭐</span>
                      <span className="font-medium">{e.jurisdiction}</span>
                      <span className="text-[var(--text-muted)]">-</span>
                      <span className={e.pct_change >= 0 ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'}>
                        {e.pct_change >= 0 ? '+' : ''}{e.pct_change.toFixed(1)}%
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
