"use client";

import { useState } from 'react';
import { ReformMetric } from "@/lib/types";
import { useExport } from "@/lib/hooks/useExport";
import { exportReformAnalysisExcel } from "@/lib/utils/excelExport";
import { generatePDFReport, PDFSection } from "@/lib/utils/pdfExport";
import { saveSnapshot, generateShareableURL } from "@/lib/utils/snapshotUtils";

interface DataExportProps {
  data: ReformMetric[];
  currentFilters?: Record<string, unknown>;
}

export function DataExport({ data, currentFilters = {} }: DataExportProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [shareURL, setShareURL] = useState('');
  const [copied, setCopied] = useState(false);

  const {
    state: exportState,
    exportReformCSV,
    printPage
  } = useExport();

  const handleExportCSV = async () => {
    if (data.length === 0) return;
    await exportReformCSV(data as unknown as Record<string, unknown>[], `zoning_reform_metrics_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportExcel = async () => {
    if (data.length === 0) return;
    await exportReformAnalysisExcel(data as unknown as Record<string, unknown>[]);
  };

  const handleExportPDF = async () => {
    if (data.length === 0) return;

    // Calculate summary stats
    const avgChange = data.reduce((acc, d) => acc + (d.pct_change || 0), 0) / data.length;
    const positiveReforms = data.filter(d => (d.pct_change || 0) > 0).length;

    const sections: PDFSection[] = [
      {
        title: 'Summary Statistics',
        type: 'summary',
        content: {
          'Total Reforms Analyzed': data.length,
          'Average Permit Change': `${avgChange.toFixed(1)}%`,
          'Positive Impact Reforms': `${positiveReforms} (${((positiveReforms / data.length) * 100).toFixed(0)}%)`,
          'Export Date': new Date().toLocaleDateString()
        }
      },
      {
        title: 'Reform Metrics Data',
        type: 'table',
        content: data.slice(0, 100) as unknown as Record<string, unknown>[] // Limit for PDF
      }
    ];

    await generatePDFReport(sections, {
      filename: `zoning_reform_report_${new Date().toISOString().split('T')[0]}.pdf`,
      title: 'Zoning Reform Analysis Report',
      subtitle: 'Building Permit Impact Assessment',
      filters: Object.fromEntries(
        Object.entries(currentFilters).map(([k, v]) => [k, String(v)])
      )
    });
  };

  const handleExportGeoJSON = () => {
    if (data.length === 0) return;

    // State centroids (approximate lat/long for state centers)
    const STATE_CENTROIDS: Record<string, [number, number]> = {
      "06": [-119.4179, 36.7783],   // California
      "41": [-120.5542, 43.8041],   // Oregon
      "27": [-94.6859, 46.7296],    // Minnesota
      "51": [-78.6569, 37.4316],    // Virginia
      "37": [-79.0193, 35.7596],    // North Carolina
      "30": [-109.6333, 46.8797],   // Montana
    };

    // Create GeoJSON Feature Collection
    const geojson = {
      type: "FeatureCollection",
      features: data.map(d => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: (d.state_fips && STATE_CENTROIDS[d.state_fips]) || [0, 0]
        },
        properties: {
          jurisdiction: d.jurisdiction,
          state_fips: d.state_fips,
          reform_name: d.reform_name,
          reform_type: d.reform_type,
          effective_date: d.effective_date,
          baseline_wrluri: d.baseline_wrluri,
          pre_mean_total: d.pre_mean_total,
          post_mean_total: d.post_mean_total,
          pct_change: d.pct_change,
          mf_share_change: d.mf_share_change,
          status: d.status
        }
      }))
    };

    // Create download
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `zoning_reform_metrics_${new Date().toISOString().split('T')[0]}.geojson`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveSnapshot = () => {
    if (!snapshotName.trim()) return;

    const snapshotData = {
      name: snapshotName,
      filters: currentFilters,
      selectedStates: [],
      selectedPlaces: [],
      visibleCharts: [],
      viewMode: 'dashboard'
    };

    saveSnapshot(snapshotData);
    const url = generateShareableURL(snapshotData);
    setShareURL(url);
    setSnapshotName('');
  };

  const handleCopyURL = () => {
    navigator.clipboard.writeText(shareURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Main Export Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportCSV}
          disabled={data.length === 0 || exportState.isExporting}
          className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          📥 Download CSV
        </button>
        <button
          onClick={handleExportExcel}
          disabled={data.length === 0 || exportState.isExporting}
          className="px-4 py-2 bg-[var(--positive-green)] text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          📊 Download Excel
        </button>
        <button
          onClick={handleExportGeoJSON}
          disabled={data.length === 0}
          className="px-4 py-2 bg-[var(--warning-orange)] text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          🗺️ Download GeoJSON
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-md hover:bg-[var(--border-default)] transition-colors text-sm font-medium"
        >
          {isExpanded ? '▲ Less' : '▼ More'}
        </button>
      </div>

      {/* Expanded Options */}
      {isExpanded && (
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg space-y-4">
          {/* Additional Export Options */}
          <div>
            <h4 className="text-sm font-medium mb-2">Additional Export Options</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportPDF}
                disabled={data.length === 0 || exportState.isExporting}
                className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-default)] rounded hover:bg-[var(--border-default)] transition-colors disabled:opacity-50"
              >
                📑 PDF Report
              </button>
              <button
                onClick={printPage}
                className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-default)] rounded hover:bg-[var(--border-default)] transition-colors"
              >
                🖨️ Print View
              </button>
            </div>
          </div>

          {/* Save Snapshot */}
          <div>
            <h4 className="text-sm font-medium mb-2">Save Current View</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="Snapshot name..."
                className="flex-1 px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-default)] rounded focus:outline-none focus:border-[var(--accent-blue)]"
              />
              <button
                onClick={handleSaveSnapshot}
                disabled={!snapshotName.trim()}
                className="px-3 py-1.5 text-sm bg-[var(--accent-blue)] text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>

            {shareURL && (
              <div className="mt-2 flex gap-2 items-center">
                <input
                  type="text"
                  value={shareURL}
                  readOnly
                  className="flex-1 px-2 py-1 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded"
                />
                <button
                  onClick={handleCopyURL}
                  className="px-2 py-1 text-xs bg-[var(--positive-green)] text-white rounded hover:bg-green-600"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {/* Export Status */}
          {exportState.isExporting && (
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Exporting {exportState.format}...
            </div>
          )}

          {exportState.error && (
            <div className="text-xs text-[var(--negative-red)]">
              Error: {exportState.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
