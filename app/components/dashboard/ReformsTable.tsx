"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { ReformMetric } from "@/lib/types";
import { formatPercent } from "@/lib/data-transforms";

interface ReformsTableProps {
  data: ReformMetric[];
}

export function ReformsTable({ data }: ReformsTableProps) {
  return (
    <div className="overflow-auto max-h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jurisdiction</TableHead>
            <TableHead>Reform</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Effective</TableHead>
            <TableHead>Pre mean</TableHead>
            <TableHead>Post mean</TableHead>
            <TableHead>Δ %</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => {
            const pct = row.percent_change;
            const pctColor =
              pct !== null && Number.isFinite(pct)
                ? pct >= 0
                  ? "text-[var(--positive-green)]"
                  : "text-[var(--negative-red)]"
                : "";

            return (
              <TableRow key={idx}>
                <TableCell>{row.jurisdiction ?? "—"}</TableCell>
                <TableCell>{row.reform_name ?? "—"}</TableCell>
                <TableCell>{row.reform_type ?? "—"}</TableCell>
                <TableCell>{row.effective_date ?? "—"}</TableCell>
                <TableCell>
                  {row.pre_mean_permits !== null && typeof row.pre_mean_permits === 'number'
                    ? row.pre_mean_permits.toFixed(2)
                    : row.pre_mean_permits ?? "—"}
                </TableCell>
                <TableCell>
                  {row.post_mean_permits !== null && typeof row.post_mean_permits === 'number'
                    ? row.post_mean_permits.toFixed(2)
                    : row.post_mean_permits ?? "—"}
                </TableCell>
                <TableCell className={pctColor}>{formatPercent(pct)}</TableCell>
                <TableCell>{row.status ?? "—"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
