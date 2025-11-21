"use client";

import { ReactNode, useRef } from 'react';
import { useExport } from '@/lib/hooks/useExport';

interface ChartExportWrapperProps {
  children: ReactNode;
  chartId: string;
  title?: string;
  showExportButtons?: boolean;
  className?: string;
}

export function ChartExportWrapper({
  children,
  chartId,
  title,
  showExportButtons = true,
  className = ''
}: ChartExportWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, exportChartPNG, exportChartSVG } = useExport();

  const handleExportPNG = () => {
    exportChartPNG(chartId, `${chartId}_${new Date().toISOString().split('T')[0]}.png`);
  };

  const handleExportSVG = () => {
    exportChartSVG(chartId, `${chartId}_${new Date().toISOString().split('T')[0]}.svg`);
  };

  return (
    <div className={`relative ${className}`}>
      {showExportButtons && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity z-10 no-print">
          <button
            onClick={handleExportPNG}
            disabled={state.isExporting}
            title="Export as PNG"
            className="p-1.5 text-xs bg-[var(--bg-card)] hover:bg-[var(--border-default)] rounded transition-colors disabled:opacity-50 border border-[var(--border-default)]"
          >
            PNG
          </button>
          <button
            onClick={handleExportSVG}
            disabled={state.isExporting}
            title="Export as SVG"
            className="p-1.5 text-xs bg-[var(--bg-card)] hover:bg-[var(--border-default)] rounded transition-colors disabled:opacity-50 border border-[var(--border-default)]"
          >
            SVG
          </button>
        </div>
      )}

      <div
        id={chartId}
        ref={containerRef}
        className="chart-container"
      >
        {title && (
          <h3 className="text-sm font-medium mb-2 text-[var(--text-primary)]">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}

export default ChartExportWrapper;
