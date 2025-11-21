"use client";

import { useState } from 'react';
import { useExport } from '@/lib/hooks/useExport';
import { generateShareableURL, saveSnapshot, ViewSnapshot } from '@/lib/utils/snapshotUtils';
import { PDFSection } from '@/lib/utils/pdfExport';

interface ExportPanelProps {
  data: Record<string, unknown>[];
  additionalData?: {
    places?: Record<string, unknown>[];
    comparisons?: Record<string, unknown>[];
  };
  currentFilters?: Record<string, unknown>;
  chartIds?: string[];
  onSnapshotSaved?: (snapshot: ViewSnapshot) => void;
}

export function ExportPanel({
  data,
  additionalData,
  currentFilters = {},
  chartIds = [],
  onSnapshotSaved
}: ExportPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [shareURL, setShareURL] = useState('');
  const [copied, setCopied] = useState(false);

  const {
    state: exportState,
    exportCSV,
    exportExcel,
    exportMultiExcel,
    exportReport,
    exportChartPNG,
    printPage
  } = useExport({
    onSuccess: (format) => {
      console.log(`Successfully exported as ${format}`);
    },
    onError: (error) => {
      console.error('Export error:', error);
    }
  });

  const handleExportCSV = async () => {
    await exportCSV(data, `zoning_data_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportExcel = async () => {
    if (additionalData?.places || additionalData?.comparisons) {
      const sheets = [{ name: 'Reform Metrics', data }];
      if (additionalData.places) {
        sheets.push({ name: 'Places', data: additionalData.places });
      }
      if (additionalData.comparisons) {
        sheets.push({ name: 'Comparisons', data: additionalData.comparisons });
      }
      await exportMultiExcel(sheets, `zoning_analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else {
      await exportExcel(data, `zoning_data_${new Date().toISOString().split('T')[0]}.xlsx`, 'Reform Metrics');
    }
  };

  const handleExportPDF = async () => {
    const sections: PDFSection[] = [
      {
        title: 'Summary Statistics',
        type: 'summary',
        content: {
          'Total Records': data.length,
          'Export Date': new Date().toLocaleDateString(),
          'Data Source': 'US Census Building Permits'
        }
      },
      {
        title: 'Reform Metrics',
        type: 'table',
        content: data.slice(0, 50) // Limit for PDF
      }
    ];

    // Add charts if available
    chartIds.forEach((chartId, index) => {
      sections.push({
        title: `Chart ${index + 1}`,
        type: 'chart',
        content: null,
        elementId: chartId
      });
    });

    await exportReport(
      sections,
      `zoning_report_${new Date().toISOString().split('T')[0]}.pdf`,
      'Zoning Reform Analysis Report'
    );
  };

  const handleExportChart = async (chartId: string) => {
    await exportChartPNG(chartId, `chart_${chartId}_${new Date().toISOString().split('T')[0]}.png`);
  };

  const handleSaveSnapshot = () => {
    if (!snapshotName.trim()) return;

    const snapshot = saveSnapshot({
      name: snapshotName,
      filters: currentFilters,
      selectedStates: [],
      selectedPlaces: [],
      visibleCharts: chartIds,
      viewMode: 'dashboard'
    });

    const url = generateShareableURL({
      name: snapshotName,
      filters: currentFilters,
      selectedStates: [],
      selectedPlaces: [],
      visibleCharts: chartIds,
      viewMode: 'dashboard'
    });

    setShareURL(url);
    setSnapshotName('');
    onSnapshotSaved?.(snapshot);
  };

  const handleCopyURL = () => {
    navigator.clipboard.writeText(shareURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-xl z-50">
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-[var(--text-primary)]">Export Options</h3>

            {/* Export Format Buttons */}
            <div className="space-y-2 mb-4">
              <button
                onClick={handleExportCSV}
                disabled={exportState.isExporting || data.length === 0}
                className="w-full px-3 py-2 text-left text-sm bg-[var(--bg-primary)] hover:bg-[var(--border-default)] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="text-lg">📄</span>
                <div>
                  <div className="font-medium">CSV</div>
                  <div className="text-xs text-[var(--text-muted)]">Comma-separated values</div>
                </div>
              </button>

              <button
                onClick={handleExportExcel}
                disabled={exportState.isExporting || data.length === 0}
                className="w-full px-3 py-2 text-left text-sm bg-[var(--bg-primary)] hover:bg-[var(--border-default)] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="text-lg">📊</span>
                <div>
                  <div className="font-medium">Excel</div>
                  <div className="text-xs text-[var(--text-muted)]">Multi-sheet workbook</div>
                </div>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={exportState.isExporting || data.length === 0}
                className="w-full px-3 py-2 text-left text-sm bg-[var(--bg-primary)] hover:bg-[var(--border-default)] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="text-lg">📑</span>
                <div>
                  <div className="font-medium">PDF Report</div>
                  <div className="text-xs text-[var(--text-muted)]">Professional report format</div>
                </div>
              </button>

              <button
                onClick={printPage}
                className="w-full px-3 py-2 text-left text-sm bg-[var(--bg-primary)] hover:bg-[var(--border-default)] rounded transition-colors flex items-center gap-2"
              >
                <span className="text-lg">🖨️</span>
                <div>
                  <div className="font-medium">Print</div>
                  <div className="text-xs text-[var(--text-muted)]">Print-optimized view</div>
                </div>
              </button>
            </div>

            {/* Chart Export */}
            {chartIds.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-[var(--text-muted)] mb-2">Export Charts</h4>
                <div className="flex flex-wrap gap-1">
                  {chartIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => handleExportChart(id)}
                      disabled={exportState.isExporting}
                      className="px-2 py-1 text-xs bg-[var(--bg-primary)] hover:bg-[var(--border-default)] rounded transition-colors disabled:opacity-50"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Snapshot */}
            <div className="border-t border-[var(--border-default)] pt-4">
              <h4 className="text-xs font-medium text-[var(--text-muted)] mb-2">Save Snapshot</h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  placeholder="Snapshot name..."
                  className="flex-1 px-2 py-1 text-sm bg-[var(--bg-primary)] border border-[var(--border-default)] rounded focus:outline-none focus:border-[var(--accent-blue)]"
                />
                <button
                  onClick={handleSaveSnapshot}
                  disabled={!snapshotName.trim()}
                  className="px-3 py-1 text-sm bg-[var(--accent-blue)] text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>

              {shareURL && (
                <div className="mt-2">
                  <div className="text-xs text-[var(--text-muted)] mb-1">Shareable URL:</div>
                  <div className="flex gap-1">
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
                      {copied ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Export Status */}
            {exportState.isExporting && (
              <div className="mt-3 text-xs text-[var(--text-muted)] flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Exporting {exportState.format}...
              </div>
            )}

            {exportState.error && (
              <div className="mt-3 text-xs text-[var(--negative-red)]">
                Error: {exportState.error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportPanel;
