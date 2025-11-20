"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

interface Reform {
  state_fips: string;
  state_name: string;
  place_name: string;
  place_fips: string;
  reform_type: string;
  reform_year: number;
  reform_name: string;
  description: string;
  source: string;
  research_notes: string;
}

interface CityReformsPanelProps {
  selectedState?: string;
  selectedCity?: string;
  onClose?: () => void;
}

const REFORM_TYPE_COLORS: Record<string, string> = {
  'ADU': 'bg-blue-100 text-blue-800 border-blue-200',
  'Upzoning': 'bg-green-100 text-green-800 border-green-200',
  'Mixed_Use': 'bg-purple-100 text-purple-800 border-purple-200',
  'Height/Parking_Reduction': 'bg-orange-100 text-orange-800 border-orange-200',
  'Affordability_Mandate': 'bg-pink-100 text-pink-800 border-pink-200',
  'Density_Bonus': 'bg-teal-100 text-teal-800 border-teal-200',
  'Fast_Track_Permitting': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Zoning_Deregulation': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Other': 'bg-gray-100 text-gray-800 border-gray-200'
};

export function CityReformsPanel({
  selectedState,
  selectedCity,
  onClose
}: CityReformsPanelProps) {
  const [reforms, setReforms] = useState<Reform[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    uniqueCities: number;
    uniqueStates: number;
    reformTypes: Record<string, number>;
  }>({ total: 0, uniqueCities: 0, uniqueStates: 0, reformTypes: {} });
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    async function fetchReforms() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedState) params.set('state', selectedState);
        if (selectedCity) params.set('city', selectedCity);
        if (filterType) params.set('type', filterType);

        const response = await fetch(`/api/reforms/cities?${params}`);
        if (response.ok) {
          const data = await response.json();
          setReforms(data.reforms);
          setStats({
            total: data.total,
            uniqueCities: data.uniqueCities,
            uniqueStates: data.uniqueStates,
            reformTypes: data.reformTypes
          });
        }
      } catch (error) {
        console.error('Failed to fetch reforms:', error);
      }
      setLoading(false);
    }

    fetchReforms();
  }, [selectedState, selectedCity, filterType]);

  const displayedReforms = reforms.slice(0, 50); // Limit display

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">
            City Zoning Reforms Database
          </CardTitle>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {stats.uniqueCities} cities • {stats.uniqueStates} states • {stats.total} reforms
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            ✕
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 overflow-y-auto max-h-[600px]">
        {/* Filter by reform type */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('')}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              !filterType
                ? 'bg-[var(--bg-accent)] border-[var(--border-accent)]'
                : 'border-[var(--border-default)] hover:border-[var(--border-accent)]'
            }`}
          >
            All ({stats.total})
          </button>
          {Object.entries(stats.reformTypes)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  filterType === type
                    ? 'bg-[var(--bg-accent)] border-[var(--border-accent)]'
                    : 'border-[var(--border-default)] hover:border-[var(--border-accent)]'
                }`}
              >
                {type.replace('_', ' ')} ({count})
              </button>
            ))}
        </div>

        {/* Reforms list */}
        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            Loading reforms...
          </div>
        ) : displayedReforms.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            No reforms found
          </div>
        ) : (
          <div className="space-y-3">
            {displayedReforms.map((reform, idx) => (
              <div
                key={`${reform.place_name}-${reform.reform_year}-${idx}`}
                className="rounded-lg border border-[var(--border-default)] p-4 hover:border-[var(--border-accent)] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      {reform.reform_name}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      {reform.place_name}, {reform.state_name}
                    </p>
                  </div>
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-[var(--bg-accent)] text-[var(--text-primary)]">
                    {reform.reform_year}
                  </span>
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  {reform.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                    REFORM_TYPE_COLORS[reform.reform_type] || REFORM_TYPE_COLORS['Other']
                  }`}>
                    {reform.reform_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    Source: {reform.source}
                  </span>
                </div>

                {reform.research_notes && (
                  <p className="text-xs text-[var(--text-muted)] mt-2 italic">
                    {reform.research_notes}
                  </p>
                )}
              </div>
            ))}

            {reforms.length > 50 && (
              <p className="text-center text-xs text-[var(--text-muted)] py-2">
                Showing 50 of {reforms.length} reforms
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
