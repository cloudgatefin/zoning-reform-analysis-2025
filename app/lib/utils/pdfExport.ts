/**
 * PDF Export Utilities
 * Provides functions for generating professional PDF reports
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter';
  includeTableOfContents?: boolean;
  filters?: Record<string, string>;
}

export interface PDFSection {
  title: string;
  type: 'table' | 'chart' | 'text' | 'summary';
  content: unknown;
  elementId?: string;
}

/**
 * Add header to PDF page
 */
function addHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  pageWidth: number
): number {
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, pageWidth / 2, 28, { align: 'center' });

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 35, { align: 'center' });
  doc.setTextColor(0);

  // Separator line
  doc.setDrawColor(200);
  doc.line(15, 40, pageWidth - 15, 40);

  return 45; // Return Y position after header
}

/**
 * Add footer to PDF page
 */
function addFooter(
  doc: jsPDF,
  pageNumber: number,
  totalPages: number,
  pageWidth: number,
  pageHeight: number
): void {
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    `Page ${pageNumber} of ${totalPages}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  doc.text(
    'Zoning Reform Analysis Dashboard',
    15,
    pageHeight - 10
  );
  doc.setTextColor(0);
}

/**
 * Add summary statistics section
 */
function addSummarySection(
  doc: jsPDF,
  stats: Record<string, string | number>,
  startY: number,
  pageWidth: number
): number {
  let y = startY;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 15, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const statsPerRow = 3;
  const colWidth = (pageWidth - 30) / statsPerRow;
  let col = 0;

  Object.entries(stats).forEach(([key, value]) => {
    const x = 15 + col * colWidth;

    doc.setFont('helvetica', 'bold');
    doc.text(key, x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), x, y + 5);

    col++;
    if (col >= statsPerRow) {
      col = 0;
      y += 15;
    }
  });

  if (col !== 0) y += 15;

  return y + 5;
}

/**
 * Add table to PDF
 */
function addTable(
  doc: jsPDF,
  data: Record<string, unknown>[],
  startY: number,
  pageWidth: number,
  title?: string
): number {
  let y = startY;

  if (title) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, y);
    y += 8;
  }

  if (data.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No data available', 15, y);
    return y + 10;
  }

  const headers = Object.keys(data[0]);
  const colCount = Math.min(headers.length, 6); // Limit columns for readability
  const colWidth = (pageWidth - 30) / colCount;

  // Header row
  doc.setFillColor(37, 99, 235); // Blue background
  doc.rect(15, y - 4, pageWidth - 30, 8, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255);

  for (let i = 0; i < colCount; i++) {
    const text = headers[i].substring(0, 15);
    doc.text(text, 17 + i * colWidth, y);
  }

  doc.setTextColor(0);
  y += 6;

  // Data rows
  doc.setFont('helvetica', 'normal');

  const maxRows = 20; // Limit rows per page section
  const rowsToShow = data.slice(0, maxRows);

  rowsToShow.forEach((row, index) => {
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(15, y - 3, pageWidth - 30, 6, 'F');
    }

    for (let i = 0; i < colCount; i++) {
      const value = row[headers[i]];
      let text = String(value ?? '').substring(0, 15);

      // Format numbers
      if (typeof value === 'number') {
        if (headers[i].includes('pct') || headers[i].includes('change')) {
          text = `${value.toFixed(1)}%`;
        } else if (value > 1000) {
          text = value.toLocaleString();
        } else {
          text = value.toFixed(2);
        }
      }

      doc.text(text, 17 + i * colWidth, y);
    }

    y += 6;
  });

  if (data.length > maxRows) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`... and ${data.length - maxRows} more rows`, 15, y);
    y += 6;
  }

  return y + 5;
}

/**
 * Add filters section showing current filter state
 */
function addFiltersSection(
  doc: jsPDF,
  filters: Record<string, string>,
  startY: number,
  pageWidth: number
): number {
  let y = startY;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Applied Filters:', 15, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  Object.entries(filters).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 20, y);
    y += 5;
  });

  return y + 5;
}

/**
 * Export element as PDF by capturing it as an image
 */
export async function exportElementToPDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = `export_${new Date().toISOString().split('T')[0]}.pdf`,
    title = 'Chart Export',
    orientation = 'landscape'
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Capture element as canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  // Create PDF
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, pageWidth / 2, 15, { align: 'center' });

  // Calculate image dimensions to fit page
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Add image
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, Math.min(imgHeight, pageHeight - 40));

  // Add footer
  addFooter(pdf, 1, 1, pageWidth, pageHeight);

  // Save
  pdf.save(filename);
}

/**
 * Generate full PDF report with multiple sections
 */
export async function generatePDFReport(
  sections: PDFSection[],
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = `report_${new Date().toISOString().split('T')[0]}.pdf`,
    title = 'Zoning Reform Analysis Report',
    subtitle = 'Comprehensive Data Analysis',
    orientation = 'portrait',
    pageSize = 'a4',
    filters = {}
  } = options;

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  let currentY = addHeader(pdf, title, subtitle, pageWidth);
  let pageNumber = 1;
  const totalPages = Math.ceil(sections.length / 2) + 1; // Estimate

  // Add filters if provided
  if (Object.keys(filters).length > 0) {
    currentY = addFiltersSection(pdf, filters, currentY, pageWidth);
  }

  // Process each section
  for (const section of sections) {
    // Check if we need a new page
    if (currentY > pageHeight - 60) {
      addFooter(pdf, pageNumber, totalPages, pageWidth, pageHeight);
      pdf.addPage();
      pageNumber++;
      currentY = 20;
    }

    switch (section.type) {
      case 'summary':
        currentY = addSummarySection(
          pdf,
          section.content as Record<string, string | number>,
          currentY,
          pageWidth
        );
        break;

      case 'table':
        currentY = addTable(
          pdf,
          section.content as Record<string, unknown>[],
          currentY,
          pageWidth,
          section.title
        );
        break;

      case 'chart':
        if (section.elementId) {
          const element = document.getElementById(section.elementId);
          if (element) {
            try {
              const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
              });

              const imgWidth = pageWidth - 30;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              // Check if chart fits
              if (currentY + imgHeight > pageHeight - 30) {
                addFooter(pdf, pageNumber, totalPages, pageWidth, pageHeight);
                pdf.addPage();
                pageNumber++;
                currentY = 20;
              }

              pdf.setFontSize(12);
              pdf.setFont('helvetica', 'bold');
              pdf.text(section.title, 15, currentY);
              currentY += 8;

              const imgData = canvas.toDataURL('image/png');
              pdf.addImage(imgData, 'PNG', 15, currentY, imgWidth, imgHeight);
              currentY += imgHeight + 10;
            } catch (error) {
              console.error('Error capturing chart:', error);
            }
          }
        }
        break;

      case 'text':
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(section.title, 15, currentY);
        currentY += 6;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const textLines = pdf.splitTextToSize(String(section.content), pageWidth - 30);
        pdf.text(textLines, 15, currentY);
        currentY += textLines.length * 5 + 10;
        break;
    }
  }

  // Add final footer
  addFooter(pdf, pageNumber, totalPages, pageWidth, pageHeight);

  // Save
  pdf.save(filename);
}

/**
 * Quick export of current view to PDF
 */
export async function exportViewToPDF(
  containerId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = `view_export_${new Date().toISOString().split('T')[0]}.pdf`,
    title = 'Dashboard View Export',
    orientation = 'landscape'
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with id "${containerId}" not found`);
  }

  // Capture the container
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: -window.scrollY
  });

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add header
  const startY = addHeader(pdf, title, 'Dashboard Export', pageWidth);

  // Calculate dimensions
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const availableHeight = pageHeight - startY - 20;

  // Add image (may span multiple pages)
  const imgData = canvas.toDataURL('image/png');

  if (imgHeight <= availableHeight) {
    pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, imgHeight);
    addFooter(pdf, 1, 1, pageWidth, pageHeight);
  } else {
    // Split across pages
    let remainingHeight = imgHeight;
    let sourceY = 0;
    let pageNum = 1;

    while (remainingHeight > 0) {
      const sliceHeight = Math.min(remainingHeight, availableHeight);
      const sliceRatio = sliceHeight / imgHeight;

      // For first page, image starts after header
      const yPos = pageNum === 1 ? startY : 10;

      pdf.addImage(
        imgData,
        'PNG',
        10,
        yPos,
        imgWidth,
        imgHeight,
        undefined,
        undefined,
        0
      );

      remainingHeight -= sliceHeight;
      sourceY += sliceHeight;

      if (remainingHeight > 0) {
        pdf.addPage();
        pageNum++;
      }
    }

    addFooter(pdf, pageNum, pageNum, pageWidth, pageHeight);
  }

  pdf.save(filename);
}
