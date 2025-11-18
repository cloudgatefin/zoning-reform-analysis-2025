"use client";

import React from "react";
import { DataExport } from "./DataExport";
import { ReformMetric } from "@/lib/types";

interface DashboardHeaderProps {
  data?: ReformMetric[];
}

export function DashboardHeader({ data = [] }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
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
  );
}
