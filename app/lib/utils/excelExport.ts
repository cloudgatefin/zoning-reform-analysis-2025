/**
 * Excel Export Utilities
 * Provides functions for exporting data to Excel format with professional formatting
 */

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeMetadata?: boolean;
  title?: string;
  description?: string;
}

export interface MultiSheetData {
  name: string;
  data: Record<string, unknown>[];
  title?: string;
}

/**
 * Apply professional styling to a worksheet
 */
function styleWorksheet(
  worksheet: ExcelJS.Worksheet,
  columnCount: number
): void {
  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' }  // Blue background
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  // Freeze header row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Auto-fit columns (approximate)
  for (let i = 1; i <= columnCount; i++) {
    const column = worksheet.getColumn(i);
    let maxLength = 10;

    column.eachCell({ includeEmpty: true }, (cell) => {
      const length = cell.value ? String(cell.value).length : 0;
      if (length > maxLength) {
        maxLength = Math.min(length, 50);
      }
    });

    column.width = maxLength + 2;
  }

  // Add borders to all cells
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
    });
  });

  // Apply number formatting for specific columns
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const header = worksheet.getRow(1).getCell(colNumber).value as string;
      const value = cell.value;

      // Format percentages
      if (header && (header.includes('pct') || header.includes('change') || header.includes('rate'))) {
        if (typeof value === 'number') {
          cell.numFmt = '0.00%';
          if (value < -100) {
            // Already a percentage value, not a decimal
            cell.numFmt = '0.00';
          }
        }
      }

      // Format currency
      if (header && (header.includes('cost') || header.includes('price') || header.includes('value'))) {
        if (typeof value === 'number') {
          cell.numFmt = '$#,##0.00';
        }
      }

      // Format large numbers
      if (typeof value === 'number' && value > 1000) {
        cell.numFmt = '#,##0';
      }
    });
  });
}

/**
 * Create metadata sheet with export information
 */
function createMetadataSheet(
  workbook: ExcelJS.Workbook,
  title: string,
  description: string
): void {
  const metaSheet = workbook.addWorksheet('Metadata');

  metaSheet.addRow(['Export Information']);
  metaSheet.addRow([]);
  metaSheet.addRow(['Title:', title]);
  metaSheet.addRow(['Description:', description]);
  metaSheet.addRow(['Export Date:', new Date().toISOString()]);
  metaSheet.addRow(['Source:', 'Zoning Reform Analysis Dashboard']);
  metaSheet.addRow([]);
  metaSheet.addRow(['Data Notes:']);
  metaSheet.addRow(['- Dates are in YYYY-MM-DD format']);
  metaSheet.addRow(['- Percentage changes are calculated as (post - pre) / pre * 100']);
  metaSheet.addRow(['- WRLURI values indicate regulatory restrictiveness (higher = more restrictive)']);

  // Style the metadata sheet
  metaSheet.getColumn(1).width = 20;
  metaSheet.getColumn(2).width = 60;

  const titleRow = metaSheet.getRow(1);
  titleRow.font = { bold: true, size: 14 };

  metaSheet.getRow(3).font = { bold: true };
  metaSheet.getRow(4).font = { bold: true };
  metaSheet.getRow(5).font = { bold: true };
  metaSheet.getRow(6).font = { bold: true };
  metaSheet.getRow(8).font = { bold: true };
}

/**
 * Export data to a single-sheet Excel file
 */
export async function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExcelExportOptions = {}
): Promise<void> {
  const {
    filename = `export_${new Date().toISOString().split('T')[0]}.xlsx`,
    sheetName = 'Data',
    includeMetadata = true,
    title = 'Data Export',
    description = 'Exported data from Zoning Reform Analysis'
  } = options;

  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Zoning Reform Analysis';
  workbook.created = new Date();

  // Add metadata sheet first if requested
  if (includeMetadata) {
    createMetadataSheet(workbook, title, description);
  }

  // Create data worksheet
  const worksheet = workbook.addWorksheet(sheetName);

  // Get headers from first row
  const headers = Object.keys(data[0]);

  // Add headers
  worksheet.addRow(headers);

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => row[header]);
    worksheet.addRow(values);
  });

  // Apply styling
  styleWorksheet(worksheet, headers.length);

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, filename);
}

/**
 * Export multiple datasets to a multi-sheet Excel workbook
 */
export async function exportMultiSheetExcel(
  sheets: MultiSheetData[],
  options: ExcelExportOptions = {}
): Promise<void> {
  const {
    filename = `export_${new Date().toISOString().split('T')[0]}.xlsx`,
    includeMetadata = true,
    title = 'Multi-Sheet Data Export',
    description = 'Multiple datasets exported from Zoning Reform Analysis'
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Zoning Reform Analysis';
  workbook.created = new Date();

  // Add metadata sheet first
  if (includeMetadata) {
    createMetadataSheet(workbook, title, description);
  }

  // Add each data sheet
  for (const sheet of sheets) {
    if (sheet.data.length === 0) continue;

    const worksheet = workbook.addWorksheet(sheet.name);

    // Get headers from first row
    const headers = Object.keys(sheet.data[0]);

    // Add headers
    worksheet.addRow(headers);

    // Add data rows
    sheet.data.forEach(row => {
      const values = headers.map(header => row[header]);
      worksheet.addRow(values);
    });

    // Apply styling
    styleWorksheet(worksheet, headers.length);
  }

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, filename);
}

/**
 * Export reform analysis data to Excel with multiple sheets
 */
export async function exportReformAnalysisExcel(
  reformMetrics: Record<string, unknown>[],
  places?: Record<string, unknown>[],
  comparisons?: Record<string, unknown>[]
): Promise<void> {
  const sheets: MultiSheetData[] = [
    {
      name: 'Reform Metrics',
      data: reformMetrics,
      title: 'Reform Metrics'
    }
  ];

  if (places && places.length > 0) {
    sheets.push({
      name: 'Places',
      data: places,
      title: 'Places Data'
    });
  }

  if (comparisons && comparisons.length > 0) {
    sheets.push({
      name: 'Comparisons',
      data: comparisons,
      title: 'Comparison Data'
    });
  }

  await exportMultiSheetExcel(sheets, {
    filename: `zoning_reform_analysis_${new Date().toISOString().split('T')[0]}.xlsx`,
    title: 'Zoning Reform Analysis Export',
    description: 'Complete reform metrics, places data, and comparisons'
  });
}
