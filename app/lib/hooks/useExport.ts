/**
 * useExport Hook
 * Provides export functionality for components
 */

"use client";

import { useCallback, useState } from 'react';
import { downloadCSV, exportReformMetricsCSV } from '../utils/csvExport';
import { exportToExcel, exportMultiSheetExcel } from '../utils/excelExport';
import { exportElementToPDF, generatePDFReport, exportViewToPDF, PDFSection } from '../utils/pdfExport';

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'png' | 'svg';

export interface ExportState {
  isExporting: boolean;
  format: ExportFormat | null;
  progress: number;
  error: string | null;
}

export interface UseExportOptions {
  onSuccess?: (format: ExportFormat) => void;
  onError?: (error: Error, format: ExportFormat) => void;
}

export function useExport(options: UseExportOptions = {}) {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    format: null,
    progress: 0,
    error: null
  });

  const { onSuccess, onError } = options;

  const setExporting = useCallback((format: ExportFormat) => {
    setState({
      isExporting: true,
      format,
      progress: 0,
      error: null
    });
  }, []);

  const setComplete = useCallback((format: ExportFormat) => {
    setState({
      isExporting: false,
      format: null,
      progress: 100,
      error: null
    });
    onSuccess?.(format);
  }, [onSuccess]);

  const setError = useCallback((error: Error, format: ExportFormat) => {
    setState({
      isExporting: false,
      format: null,
      progress: 0,
      error: error.message
    });
    onError?.(error, format);
  }, [onError]);

  /**
   * Export data to CSV
   */
  const exportCSV = useCallback(async <T extends Record<string, unknown>>(
    data: T[],
    filename?: string
  ): Promise<void> => {
    setExporting('csv');
    try {
      downloadCSV(data, { filename });
      setComplete('csv');
    } catch (error) {
      setError(error as Error, 'csv');
      throw error;
    }
  }, [setExporting, setComplete, setError]);

  /**
   * Export reform metrics to CSV with proper formatting
   */
  const exportReformCSV = useCallback(async (
    data: Record<string, unknown>[],
    filename?: string
  ): Promise<void> => {
    setExporting('csv');
    try {
      exportReformMetricsCSV(data, filename);
      setComplete('csv');
    } catch (error) {
      setError(error as Error, 'csv');
      throw error;
    }
  }, [setExporting, setComplete, setError]);

  /**
   * Export data to Excel
   */
  const exportExcel = useCallback(async <T extends Record<string, unknown>>(
    data: T[],
    filename?: string,
    sheetName?: string
  ): Promise<void> => {
    setExporting('excel');
    try {
      await exportToExcel(data, { filename, sheetName });
      setComplete('excel');
    } catch (error) {
      setError(error as Error, 'excel');
      throw error;
    }
  }, [setExporting, setComplete, setError]);

  /**
   * Export multiple sheets to Excel
   */
  const exportMultiExcel = useCallback(async (
    sheets: Array<{ name: string; data: Record<string, unknown>[] }>,
    filename?: string
  ): Promise<void> => {
    setExporting('excel');
    try {
      await exportMultiSheetExcel(sheets, { filename });
      setComplete('excel');
    } catch (error) {
      setError(error as Error, 'excel');
      throw error;
    }
  }, [setExporting, setComplete, setError]);

  /**
   * Export element to PDF
   */
  const exportPDF = useCallback(async (
    elementId: string,
    filename?: string,
    title?: string
  ): Promise<void> => {
    setExporting('pdf');
    try {
      await exportElementToPDF(elementId, { filename, title });
      setComplete('pdf');
    } catch (error) {
      setError(error as Error, 'pdf');
      throw error;
    }
  }, [setExporting, setComplete, setError]);

  /**
   * Generate full PDF report
   */
  const exportReport = useCallback(async (
    sections: PDFSection[],
    filename?: string,
    title?: string
  ): Promise<void> => {
    setExporting('pdf');
    try {
      await generatePDFReport(sections, { filename, title });
      setComplete('pdf');
    } catch (error) {
      setError(error as Error, 'pdf');
      throw error;
    }
  }, [setExporting, setComplete, setError]);

  /**
   * Export view container to PDF
   */
  const exportView = useCallback(async (
    containerId: string,
    filename?: string,
    title?: string
  ): Promise<void> => {
    setExporting('pdf');
    try {
      await exportViewToPDF(containerId, { filename, title });
      setComplete('pdf');
    } catch (error) {
      setError(error as Error, 'pdf');
      throw error;
    }
  }, [setExporting, setComplete, setError]);

  /**
   * Export chart as PNG image
   */
  const exportChartPNG = useCallback(async (
    elementId: string,
    filename?: string
  ): Promise<void> => {
    setExporting('png');
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element "${elementId}" not found`);
      }

      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename || `chart_${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');

      setComplete('png');
    } catch (error) {
      setError(error as Error, 'png');
      throw error;
    }
  }, [setExporting, setComplete, setError]);

  /**
   * Export SVG element
   */
  const exportChartSVG = useCallback(async (
    elementId: string,
    filename?: string
  ): Promise<void> => {
    setExporting('svg');
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element "${elementId}" not found`);
      }

      const svgElement = element.querySelector('svg');
      if (!svgElement) {
        throw new Error('No SVG element found in container');
      }

      // Clone and prepare SVG for download
      const clone = svgElement.cloneNode(true) as SVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // Inline styles
      const styles = document.querySelectorAll('style');
      const styleText = Array.from(styles)
        .map(s => s.textContent)
        .join('\n');

      if (styleText) {
        const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.textContent = styleText;
        clone.insertBefore(styleElement, clone.firstChild);
      }

      const svgData = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `chart_${new Date().toISOString().split('T')[0]}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setComplete('svg');
    } catch (error) {
      setError(error as Error, 'svg');
      throw error;
    }
  }, [setExporting, setComplete, setError]);

  /**
   * Print current page
   */
  const printPage = useCallback(() => {
    window.print();
  }, []);

  return {
    state,
    exportCSV,
    exportReformCSV,
    exportExcel,
    exportMultiExcel,
    exportPDF,
    exportReport,
    exportView,
    exportChartPNG,
    exportChartSVG,
    printPage
  };
}

export default useExport;
