"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getSnapshotById,
  getSnapshots,
  deleteSnapshot,
  decodeSnapshotFromURL,
  compareSnapshots,
  ViewSnapshot
} from '@/lib/utils/snapshotUtils';

export default function SnapshotPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [snapshot, setSnapshot] = useState<ViewSnapshot | null>(null);
  const [allSnapshots, setAllSnapshots] = useState<ViewSnapshot[]>([]);
  const [compareId, setCompareId] = useState<string>('');
  const [comparison, setComparison] = useState<Record<string, { before: unknown; after: unknown }> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this is a shared snapshot from URL
    const encodedSnapshot = searchParams.get('s');
    if (encodedSnapshot) {
      const decoded = decodeSnapshotFromURL(encodedSnapshot);
      if (decoded) {
        setSnapshot({
          id: 'shared',
          createdAt: new Date().toISOString(),
          ...decoded
        });
      }
    } else if (params.id) {
      // Load from local storage
      const found = getSnapshotById(params.id as string);
      setSnapshot(found);
    }

    setAllSnapshots(getSnapshots());
    setLoading(false);
  }, [params.id, searchParams]);

  const handleDelete = () => {
    if (snapshot && snapshot.id !== 'shared') {
      if (confirm('Are you sure you want to delete this snapshot?')) {
        deleteSnapshot(snapshot.id);
        window.location.href = '/snapshots';
      }
    }
  };

  const handleCompare = () => {
    if (!snapshot || !compareId) return;

    const otherSnapshot = getSnapshotById(compareId);
    if (otherSnapshot) {
      const diff = compareSnapshots(snapshot, otherSnapshot);
      setComparison(diff);
    }
  };

  const handleApplySnapshot = () => {
    if (!snapshot) return;

    // Build query params from snapshot
    const params = new URLSearchParams();

    Object.entries(snapshot.filters).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    if (snapshot.selectedStates.length > 0) {
      params.set('states', snapshot.selectedStates.join(','));
    }

    if (snapshot.selectedPlaces.length > 0) {
      params.set('places', snapshot.selectedPlaces.join(','));
    }

    if (snapshot.viewMode) {
      params.set('view', snapshot.viewMode);
    }

    window.location.href = `/dashboard?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-[var(--border-default)] rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-[var(--border-default)] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Snapshot Not Found</h1>
          <p className="text-[var(--text-muted)] mb-4">
            The requested snapshot could not be found.
          </p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">{snapshot.name}</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Created: {new Date(snapshot.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApplySnapshot}
              className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded hover:bg-blue-600 text-sm"
            >
              Apply Snapshot
            </button>
            {snapshot.id !== 'shared' && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-[var(--negative-red)] text-white rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Snapshot Details */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Snapshot Details</h2>

          <div className="space-y-4">
            {/* Filters */}
            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Filters</h3>
              {Object.keys(snapshot.filters).length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(snapshot.filters).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium">{key}:</span>{' '}
                      <span className="text-[var(--text-muted)]">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No filters applied</p>
              )}
            </div>

            {/* Selected States */}
            {snapshot.selectedStates.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Selected States</h3>
                <div className="flex flex-wrap gap-2">
                  {snapshot.selectedStates.map((state) => (
                    <span
                      key={state}
                      className="px-2 py-1 text-xs bg-[var(--bg-primary)] rounded"
                    >
                      {state}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Places */}
            {snapshot.selectedPlaces.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Selected Places</h3>
                <div className="flex flex-wrap gap-2">
                  {snapshot.selectedPlaces.map((place) => (
                    <span
                      key={place}
                      className="px-2 py-1 text-xs bg-[var(--bg-primary)] rounded"
                    >
                      {place}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* View Mode */}
            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">View Mode</h3>
              <p className="text-sm">{snapshot.viewMode || 'default'}</p>
            </div>
          </div>
        </div>

        {/* Compare Snapshots */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Compare Snapshots</h2>

          <div className="flex gap-2 mb-4">
            <select
              value={compareId}
              onChange={(e) => setCompareId(e.target.value)}
              className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded text-sm"
            >
              <option value="">Select snapshot to compare...</option>
              {allSnapshots
                .filter((s) => s.id !== snapshot.id)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({new Date(s.createdAt).toLocaleDateString()})
                  </option>
                ))}
            </select>
            <button
              onClick={handleCompare}
              disabled={!compareId}
              className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded hover:bg-blue-600 text-sm disabled:opacity-50"
            >
              Compare
            </button>
          </div>

          {comparison && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Differences:</h3>
              {Object.keys(comparison).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(comparison).map(([key, { before, after }]) => (
                    <div key={key} className="text-sm p-2 bg-[var(--bg-primary)] rounded">
                      <span className="font-medium">{key}:</span>
                      <div className="ml-4">
                        <div className="text-[var(--negative-red)]">
                          - {JSON.stringify(before)}
                        </div>
                        <div className="text-[var(--positive-green)]">
                          + {JSON.stringify(after)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No differences found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
