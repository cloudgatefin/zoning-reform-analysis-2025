"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { ReformMetric } from "@/lib/types";
import { formatPercent } from "@/lib/data-transforms";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PercentChangeChartProps {
  data: ReformMetric[];
}

export function PercentChangeChart({ data }: PercentChangeChartProps) {
  const chartData = {
    labels: data.map((d) => d.jurisdiction),
    datasets: [
      {
        label: "% Change",
        data: data.map((d) => d.percent_change ?? 0),
        backgroundColor: data.map((d) =>
          (d.percent_change ?? 0) >= 0 ? "#22c55e" : "#ef4444"
        ),
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#9ca3af" },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#9ca3af",
          callback: (value) => `${value}%`,
        },
        grid: { color: "#111827" },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed.y ?? 0;
            return `${label}: ${formatPercent(value)}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
