"use client";

import React from "react";
import { Button, Select, SelectOption } from "@/components/ui";

interface FilterControlsProps {
  jurisdictions: string[];
  reformTypes: string[];
  selectedJurisdiction: string;
  selectedReformType: string;
  onJurisdictionChange: (jurisdiction: string) => void;
  onReformTypeChange: (type: string) => void;
  onClear: () => void;
}

export function FilterControls({
  jurisdictions,
  reformTypes,
  selectedJurisdiction,
  selectedReformType,
  onJurisdictionChange,
  onReformTypeChange,
  onClear,
}: FilterControlsProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-[18px] mb-5">
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={onClear} variant="secondary">
          Clear Filters
        </Button>

        <label className="flex items-center gap-2 text-base text-[var(--text-muted)]">
          <span>Jump to jurisdiction:</span>
          <Select
            value={selectedJurisdiction}
            onChange={(e) => onJurisdictionChange(e.target.value)}
            className="min-w-[200px]"
          >
            <SelectOption value="__ALL__">All Jurisdictions</SelectOption>
            {jurisdictions.map((j) => (
              <SelectOption key={j} value={j}>
                {j}
              </SelectOption>
            ))}
          </Select>
        </label>

        <label className="flex items-center gap-2 text-base text-[var(--text-muted)]">
          <span>Filter by reform type:</span>
          <Select
            value={selectedReformType}
            onChange={(e) => onReformTypeChange(e.target.value)}
            className="min-w-[200px]"
          >
            <SelectOption value="__ALL__">All Types</SelectOption>
            {reformTypes.map((t) => (
              <SelectOption key={t} value={t}>
                {t}
              </SelectOption>
            ))}
          </Select>
        </label>
      </div>
    </div>
  );
}
