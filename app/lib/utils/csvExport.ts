/**
 * CSV Export Utilities
 * Provides functions for exporting data to CSV format with proper formatting
 */

export interface CSVExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  headerComments?: string[];
}

/**
 * Format a date value to YYYY-MM-DD format
 */
function formatDate(value: unknown): string {
  if (!value) return '';

  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  if (typeof value === 'string') {
    // Check if it's a date string
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  return String(value);
}

/**
 * Escape a CSV value properly
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Check if it's a date-like value
  if (value instanceof Date) {
    return formatDate(value);
  }

  const str = String(value);

  // Check if escaping is needed
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Escape double quotes by doubling them
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generate CSV content from data array
 */
export function generateCSV<T extends Record<string, unknown>>(
  data: T[],
  options: CSVExportOptions = {}
): string {
  if (data.length === 0) {
    return '';
  }

  const {
    includeHeaders = true,
    headerComments = []
  } = options;

  const lines: string[] = [];

  // Add header comments
  if (headerComments.length > 0) {
    headerComments.forEach(comment => {
      lines.push(`# ${comment}`);
    });
    lines.push(`# Generated: ${new Date().toISOString()}`);
    lines.push('');
  }

  // Get headers from first row
  const headers = Object.keys(data[0]);

  // Add header row
  if (includeHeaders) {
    lines.push(headers.map(h => escapeCSVValue(h)).join(','));
  }

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return escapeCSVValue(value);
    });
    lines.push(values.join(','));
  });

  return lines.join('\n');
}

/**
 * Download CSV data as a file
 */
export function downloadCSV<T extends Record<string, unknown>>(
  data: T[],
  options: CSVExportOptions = {}
): void {
  const {
    filename = `export_${new Date().toISOString().split('T')[0]}.csv`
  } = options;

  const csvContent = generateCSV(data, options);

  // Add BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export reform metrics to CSV with proper formatting
 */
export function exportReformMetricsCSV(
  data: Record<string, unknown>[],
  filename?: string
): void {
  downloadCSV(data, {
    filename: filename || `zoning_reform_metrics_${new Date().toISOString().split('T')[0]}.csv`,
    includeHeaders: true,
    headerComments: [
      'Zoning Reform Analysis - Reform Metrics Export',
      'Data includes pre/post reform permit changes and regulatory indicators',
      'Source: US Census Building Permits Survey'
    ]
  });
}

/**
 * Export places data to CSV
 */
export function exportPlacesCSV(
  data: Record<string, unknown>[],
  filename?: string
): void {
  downloadCSV(data, {
    filename: filename || `places_data_${new Date().toISOString().split('T')[0]}.csv`,
    includeHeaders: true,
    headerComments: [
      'Zoning Reform Analysis - Places Data Export',
      'Includes city-level permit data and reform information'
    ]
  });
}

/**
 * Export comparison data to CSV
 */
export function exportComparisonCSV(
  data: Record<string, unknown>[],
  filename?: string
): void {
  downloadCSV(data, {
    filename: filename || `comparison_data_${new Date().toISOString().split('T')[0]}.csv`,
    includeHeaders: true,
    headerComments: [
      'Zoning Reform Analysis - Comparison Data Export',
      'Side-by-side comparison of selected jurisdictions'
    ]
  });
}
