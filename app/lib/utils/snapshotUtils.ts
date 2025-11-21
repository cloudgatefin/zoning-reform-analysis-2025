/**
 * Snapshot Utilities
 * Provides functions for saving and restoring view state
 */

export interface ViewSnapshot {
  id: string;
  name: string;
  createdAt: string;
  filters: Record<string, unknown>;
  selectedStates: string[];
  selectedPlaces: string[];
  visibleCharts: string[];
  viewMode: string;
  comparisonItems?: string[];
  customParams?: Record<string, unknown>;
}

const STORAGE_KEY = 'zoning_reform_snapshots';

/**
 * Generate a unique snapshot ID
 */
function generateSnapshotId(): string {
  return `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Encode snapshot to URL-safe string
 */
export function encodeSnapshotToURL(snapshot: Omit<ViewSnapshot, 'id' | 'createdAt'>): string {
  const data = {
    ...snapshot,
    v: 1 // Version for future compatibility
  };

  const encoded = btoa(JSON.stringify(data));
  return encodeURIComponent(encoded);
}

/**
 * Decode snapshot from URL string
 */
export function decodeSnapshotFromURL(encoded: string): Omit<ViewSnapshot, 'id' | 'createdAt'> | null {
  try {
    const decoded = atob(decodeURIComponent(encoded));
    const data = JSON.parse(decoded);

    return {
      name: data.name || 'Unnamed Snapshot',
      filters: data.filters || {},
      selectedStates: data.selectedStates || [],
      selectedPlaces: data.selectedPlaces || [],
      visibleCharts: data.visibleCharts || [],
      viewMode: data.viewMode || 'default',
      comparisonItems: data.comparisonItems,
      customParams: data.customParams
    };
  } catch (error) {
    console.error('Error decoding snapshot:', error);
    return null;
  }
}

/**
 * Generate shareable URL for snapshot
 */
export function generateShareableURL(snapshot: Omit<ViewSnapshot, 'id' | 'createdAt'>): string {
  const encoded = encodeSnapshotToURL(snapshot);
  const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseURL}/snapshots/view?s=${encoded}`;
}

/**
 * Save snapshot to localStorage
 */
export function saveSnapshot(snapshot: Omit<ViewSnapshot, 'id' | 'createdAt'>): ViewSnapshot {
  const fullSnapshot: ViewSnapshot = {
    ...snapshot,
    id: generateSnapshotId(),
    createdAt: new Date().toISOString()
  };

  const snapshots = getSnapshots();
  snapshots.push(fullSnapshot);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  }

  return fullSnapshot;
}

/**
 * Get all saved snapshots
 */
export function getSnapshots(): ViewSnapshot[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading snapshots:', error);
    return [];
  }
}

/**
 * Get a specific snapshot by ID
 */
export function getSnapshotById(id: string): ViewSnapshot | null {
  const snapshots = getSnapshots();
  return snapshots.find(s => s.id === id) || null;
}

/**
 * Delete a snapshot by ID
 */
export function deleteSnapshot(id: string): boolean {
  const snapshots = getSnapshots();
  const filtered = snapshots.filter(s => s.id !== id);

  if (filtered.length === snapshots.length) {
    return false;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  return true;
}

/**
 * Update an existing snapshot
 */
export function updateSnapshot(id: string, updates: Partial<ViewSnapshot>): ViewSnapshot | null {
  const snapshots = getSnapshots();
  const index = snapshots.findIndex(s => s.id === id);

  if (index === -1) return null;

  snapshots[index] = { ...snapshots[index], ...updates };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  }

  return snapshots[index];
}

/**
 * Compare two snapshots and return differences
 */
export function compareSnapshots(
  snapshot1: ViewSnapshot,
  snapshot2: ViewSnapshot
): Record<string, { before: unknown; after: unknown }> {
  const differences: Record<string, { before: unknown; after: unknown }> = {};

  // Compare filters
  const allFilterKeys = new Set([
    ...Object.keys(snapshot1.filters),
    ...Object.keys(snapshot2.filters)
  ]);

  allFilterKeys.forEach(key => {
    const val1 = snapshot1.filters[key];
    const val2 = snapshot2.filters[key];
    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      differences[`filter.${key}`] = { before: val1, after: val2 };
    }
  });

  // Compare selected states
  if (JSON.stringify(snapshot1.selectedStates) !== JSON.stringify(snapshot2.selectedStates)) {
    differences['selectedStates'] = {
      before: snapshot1.selectedStates,
      after: snapshot2.selectedStates
    };
  }

  // Compare selected places
  if (JSON.stringify(snapshot1.selectedPlaces) !== JSON.stringify(snapshot2.selectedPlaces)) {
    differences['selectedPlaces'] = {
      before: snapshot1.selectedPlaces,
      after: snapshot2.selectedPlaces
    };
  }

  // Compare view mode
  if (snapshot1.viewMode !== snapshot2.viewMode) {
    differences['viewMode'] = {
      before: snapshot1.viewMode,
      after: snapshot2.viewMode
    };
  }

  return differences;
}

/**
 * Export snapshots as JSON file
 */
export function exportSnapshots(): void {
  const snapshots = getSnapshots();
  const data = JSON.stringify(snapshots, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `snapshots_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import snapshots from JSON file
 */
export function importSnapshots(jsonData: string): number {
  try {
    const imported = JSON.parse(jsonData) as ViewSnapshot[];
    const existing = getSnapshots();

    // Merge, avoiding duplicates by ID
    const existingIds = new Set(existing.map(s => s.id));
    const newSnapshots = imported.filter(s => !existingIds.has(s.id));

    const merged = [...existing, ...newSnapshots];

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }

    return newSnapshots.length;
  } catch (error) {
    console.error('Error importing snapshots:', error);
    throw new Error('Invalid snapshot file format');
  }
}

/**
 * Clear all snapshots
 */
export function clearAllSnapshots(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
