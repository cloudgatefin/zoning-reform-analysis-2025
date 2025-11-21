"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface AdvancedFiltersProps {
  reformTypes?: FilterOption[];
  states?: FilterOption[];
  jurisdictionTypes?: FilterOption[];
  onFiltersChange?: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  reformTypes: string[];
  states: string[];
  jurisdictionTypes: string[];
  yearRange: [number, number];
  permitRange: [number, number];
  growthRange: [number, number];
}

const defaultFilters: FilterState = {
  reformTypes: [],
  states: [],
  jurisdictionTypes: [],
  yearRange: [2010, 2024],
  permitRange: [0, 100000],
  growthRange: [-50, 100],
};

// Default options if not provided
const defaultReformTypes: FilterOption[] = [
  { value: "ADU", label: "ADU Legalization" },
  { value: "Upzoning", label: "Upzoning" },
  { value: "Parking", label: "Parking Reform" },
  { value: "Streamlining", label: "Permit Streamlining" },
  { value: "Missing Middle", label: "Missing Middle" },
  { value: "By-Right", label: "By-Right Development" },
];

const defaultJurisdictionTypes: FilterOption[] = [
  { value: "State", label: "State" },
  { value: "City", label: "City" },
  { value: "County", label: "County" },
];

export function AdvancedFilters({
  reformTypes = defaultReformTypes,
  states = [],
  jurisdictionTypes = defaultJurisdictionTypes,
  onFiltersChange,
  className = "",
}: AdvancedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Sync filters with URL params on mount
  useEffect(() => {
    const reformTypesParam = searchParams.get("reformTypes");
    const statesParam = searchParams.get("states");
    const jurisdictionTypesParam = searchParams.get("jurisdictionTypes");

    setFilters({
      ...defaultFilters,
      reformTypes: reformTypesParam ? reformTypesParam.split(",") : [],
      states: statesParam ? statesParam.split(",") : [],
      jurisdictionTypes: jurisdictionTypesParam ? jurisdictionTypesParam.split(",") : [],
    });
  }, [searchParams]);

  // Update URL params when filters change
  const updateUrlParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newFilters.reformTypes.length > 0) {
        params.set("reformTypes", newFilters.reformTypes.join(","));
      } else {
        params.delete("reformTypes");
      }

      if (newFilters.states.length > 0) {
        params.set("states", newFilters.states.join(","));
      } else {
        params.delete("states");
      }

      if (newFilters.jurisdictionTypes.length > 0) {
        params.set("jurisdictionTypes", newFilters.jurisdictionTypes.join(","));
      } else {
        params.delete("jurisdictionTypes");
      }

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Handle multi-select toggle
  const handleToggle = useCallback(
    (category: keyof Pick<FilterState, "reformTypes" | "states" | "jurisdictionTypes">, value: string) => {
      setFilters((prev) => {
        const current = prev[category];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];

        const newFilters = { ...prev, [category]: updated };
        onFiltersChange?.(newFilters);
        updateUrlParams(newFilters);
        return newFilters;
      });
    },
    [onFiltersChange, updateUrlParams]
  );

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
    router.push(window.location.pathname, { scroll: false });
  }, [onFiltersChange, router]);

  // Count active filters
  const activeFilterCount =
    filters.reformTypes.length +
    filters.states.length +
    filters.jurisdictionTypes.length;

  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-md)] ${className}`}>
      {/* Filter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--border-default)] transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--accent-blue)]" />
          <span className="font-medium text-[var(--text-primary)]">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent-blue)] text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        )}
      </button>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-[var(--border-default)]">
          {/* Reform Types */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Reform Type
            </label>
            <div className="flex flex-wrap gap-2">
              {reformTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleToggle("reformTypes", type.value)}
                  className={`px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors
                           focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:ring-offset-2
                           focus:ring-offset-[var(--bg-primary)]
                           ${filters.reformTypes.includes(type.value)
                             ? "bg-[var(--accent-blue)] text-white"
                             : "bg-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--border-hover)]"
                           }`}
                  aria-pressed={filters.reformTypes.includes(type.value)}
                >
                  {type.label}
                  {type.count !== undefined && (
                    <span className="ml-1 text-xs opacity-75">({type.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Jurisdiction Types */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Jurisdiction Type
            </label>
            <div className="flex flex-wrap gap-2">
              {jurisdictionTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleToggle("jurisdictionTypes", type.value)}
                  className={`px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors
                           focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:ring-offset-2
                           focus:ring-offset-[var(--bg-primary)]
                           ${filters.jurisdictionTypes.includes(type.value)
                             ? "bg-[var(--accent-blue)] text-white"
                             : "bg-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--border-hover)]"
                           }`}
                  aria-pressed={filters.jurisdictionTypes.includes(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* States (if provided) */}
          {states.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                State
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {states.map((state) => (
                  <button
                    key={state.value}
                    onClick={() => handleToggle("states", state.value)}
                    className={`px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors
                             focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:ring-offset-2
                             focus:ring-offset-[var(--bg-primary)]
                             ${filters.states.includes(state.value)
                               ? "bg-[var(--accent-blue)] text-white"
                               : "bg-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--border-hover)]"
                             }`}
                    aria-pressed={filters.states.includes(state.value)}
                  >
                    {state.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear All Button */}
          {activeFilterCount > 0 && (
            <div className="pt-2 border-t border-[var(--border-default)]">
              <Button
                variant="ghost"
                onClick={handleClearAll}
                className="w-full flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdvancedFilters;
