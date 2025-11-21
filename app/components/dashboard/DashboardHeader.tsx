"use client";

import React from "react";
import Link from "next/link";
import { DataExport } from "./DataExport";
import { ReformMetric } from "@/lib/types";
import { BarChart3, Calculator, Home, Info } from "lucide-react";

interface DashboardHeaderProps {
  data?: ReformMetric[];
}

export function DashboardHeader({ data = [] }: DashboardHeaderProps) {
  return (
    <div className="mb-5">
      {/* Navigation */}
      <nav className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Home className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--accent-blue)]">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="/scenario" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Calculator className="w-4 h-4" />
            <span className="text-sm">Scenario Builder</span>
          </Link>
          <Link href="/about/methodology" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Info className="w-4 h-4" />
            <span className="text-sm">Methodology</span>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            Zoning Reform Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Analysis of zoning reform impact on housing permits across U.S. states • Real Census Data (2015-2024)
          </p>
        </div>
        <DataExport data={data} />
      </div>
    </div>
  );
}
