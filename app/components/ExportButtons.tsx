"use client";

import { useExport } from '@/lib/hooks/useExport';

interface ExportButtonsProps {
  data: Record<string, unknown>[];
  filename?: string;
  compact?: boolean;
  showLabels?: boolean;
}

export function ExportButtons({
  data,
  filename,
  compact = false,
  showLabels = true
}: ExportButtonsProps) {
  const { state, exportCSV, exportExcel, printPage } = useExport();

  const baseFilename = filename || `export_${new Date().toISOString().split('T')[0]}`;

  const handleCSV = () => exportCSV(data, `${baseFilename}.csv`);
  const handleExcel = () => exportExcel(data, `${baseFilename}.xlsx`);

  if (compact) {
    return (
      <div className="flex gap-1">
        <button
          onClick={handleCSV}
          disabled={state.isExporting || data.length === 0}
          title="Export CSV"
          className="p-1.5 text-xs bg-[var(--bg-card)] hover:bg-[var(--border-default)] rounded transition-colors disabled:opacity-50"
        >
          📄
        </button>
        <button
          onClick={handleExcel}
          disabled={state.isExporting || data.length === 0}
          title="Export Excel"
          className="p-1.5 text-xs bg-[var(--bg-card)] hover:bg-[var(--border-default)] rounded transition-colors disabled:opacity-50"
        >
          📊
        </button>
        <button
          onClick={printPage}
          title="Print"
          className="p-1.5 text-xs bg-[var(--bg-card)] hover:bg-[var(--border-default)] rounded transition-colors"
        >
          🖨️
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleCSV}
        disabled={state.isExporting || data.length === 0}
        className="px-3 py-1.5 text-sm bg-[var(--accent-blue)] text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
      >
        📄 {showLabels && 'CSV'}
      </button>
      <button
        onClick={handleExcel}
        disabled={state.isExporting || data.length === 0}
        className="px-3 py-1.5 text-sm bg-[var(--positive-green)] text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
      >
        📊 {showLabels && 'Excel'}
      </button>
      <button
        onClick={printPage}
        className="px-3 py-1.5 text-sm bg-[var(--bg-card)] border border-[var(--border-default)] rounded hover:bg-[var(--border-default)] transition-colors flex items-center gap-1"
      >
        🖨️ {showLabels && 'Print'}
      </button>
    </div>
  );
}

export default ExportButtons;
