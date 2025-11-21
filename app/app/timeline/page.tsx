"use client";

import { useState, useEffect } from "react";
import { ReformAdoptionTimeline } from "@/components/visualizations";
import { Card, CardContent } from "@/components/ui";
import Link from "next/link";

interface Reform {
  id: string;
  city: string;
  state: string;
  state_code: string;
  reform_name: string;
  reform_type: string;
  adoption_date: string;
  year: number;
  region: string;
  baseline_wrluri: number | null;
}

export default function TimelinePage() {
  const [reforms, setReforms] = useState<Reform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/data/reforms_timeline.json");
        if (!response.ok) {
          throw new Error("Failed to load timeline data");
        }
        const data = await response.json();
        setReforms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="container mx-auto max-w-7xl px-5 py-5">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/"
            className="text-[var(--accent-blue)] hover:underline text-sm"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Zoning Reform Timeline
        </h1>
        <p className="text-[var(--text-muted)] mt-2">
          Visualize how zoning reforms have spread across America from 2015 to 2024.
          Filter by reform type, region, and date range to explore trends.
        </p>
      </div>

      {/* Content */}
      {isLoading && (
        <Card>
          <CardContent>
            <p className="text-[var(--text-muted)]">Loading reform data...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent>
            <p className="text-[var(--negative-red)]">
              Error: {error}. Make sure the timeline data has been generated.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && reforms.length > 0 && (
        <ReformAdoptionTimeline reforms={reforms} />
      )}

      {/* Footer info */}
      <div className="mt-6 p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
        <h3 className="font-semibold text-[var(--text-primary)] mb-2">
          About This Timeline
        </h3>
        <div className="text-sm text-[var(--text-muted)] space-y-2">
          <p>
            This timeline shows {reforms.length} documented zoning reforms across U.S.
            cities. Data includes ADU legalization, parking reforms, comprehensive
            zoning updates, and density increases.
          </p>
          <p>
            <strong>Note:</strong> The significant spike in 2022 reflects California
            SB-9 implementation, which enabled ADU and lot split developments
            statewide.
          </p>
        </div>
      </div>
    </div>
  );
}
