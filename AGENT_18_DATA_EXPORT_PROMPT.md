# Agent 18: Advanced Data Export & Visualization Enhancement

**Objective:** Let users export and visualize data in multiple formats
**Timeline:** 10-12 hours
**Status:** Ready to launch
**Budget:** $30-40 API cost

---

## Deliverables

### 1. CSV Export
- Export all data tables to CSV format
- Include proper headers
- Format dates (YYYY-MM-DD)
- Handle special characters and escaping
- Add data description in header comments
- Button on every table

### 2. Excel Export
- Multi-sheet Excel workbooks
- Sheet per data type (places, reforms, metrics)
- Professional formatting:
  - Bold headers with background color
  - Proper column widths
  - Number formatting (currency, percentages)
  - Freeze header row
- Add metadata sheet with export date/description

### 3. PDF Report Generation
- Full-page PDF exports
- Include charts and tables
- Professional layout with:
  - Header (title, date, filters used)
  - Table of contents
  - Summary statistics
  - Detailed data tables
  - Footer with page numbers
- Support multiple pages with proper breaks

### 4. Snapshot Feature
- "Save Current View" button
- Stores view state (filters, selections, charts shown)
- Generates shareable URL
- Compare snapshots side-by-side
- Export snapshot as report

### 5. Print Optimization
- Print-friendly CSS
- Hide navigation and unnecessary UI
- Optimize colors for printing
- Proper page breaks for long tables
- Header/footer on each page
- "Print" button on all pages

### 6. Enhanced Visualizations
- Add tooltips to all charts
- Better legend labels
- Data labels on charts (where appropriate)
- Click-to-explore functionality
- Export chart as PNG/SVG
- Interactive chart controls (zoom, pan)

---

## Technical Requirements

### Libraries
- `exceljs` for Excel export
- `jspdf` + `html2canvas` for PDF generation
- `csv-stringify` for CSV export
- Enhance existing chart library (Recharts/similar)

### Files to Create
```
NEW:
  app/components/ExportPanel.tsx
  app/components/ExportButtons.tsx
  app/lib/utils/csvExport.ts
  app/lib/utils/excelExport.ts
  app/lib/utils/pdfExport.ts
  app/lib/hooks/useExport.ts
  app/app/snapshots/[id]/page.tsx
  app/styles/print.css

MODIFIED:
  app/components/dashboard/*.tsx - Add export buttons
  All chart components - Add tooltips, labels, export
```

### Quality Criteria
✅ Exports are complete and accurate
✅ Formatted properly (readable in Excel, etc.)
✅ PDFs look professional
✅ Charts export in high quality
✅ Snapshots shareable and reproducible
✅ Print layout looks good
✅ No sensitive data in exports

---

## Success Definition

Users can:
1. ✅ Export any table to CSV/Excel
2. ✅ Generate professional PDF reports
3. ✅ Save and share current view via snapshot
4. ✅ Print pages that look formatted properly
5. ✅ Download charts as images
6. ✅ Compare multiple snapshots

---

## Implementation Order

1. CSV export (easiest)
2. Excel export (build on CSV)
3. Print stylesheets (CSS only)
4. PDF generation (most complex)
5. Snapshot feature (URL state management)
6. Enhanced visualizations (polish)

---

## When Done, Commit With

```
Agent 18: Advanced Data Export & Visualization

- Implemented CSV, Excel, and PDF export
- Added professional print styling
- Created snapshot feature for view sharing
- Enhanced all visualizations with tooltips and labels
- Added chart export (PNG/SVG)
- All exports include metadata and formatting

Build: ✅ Zero errors
Quality: ✅ Exports are accurate and professional
Performance: ✅ Large exports handle efficiently
```

---

**Ready to enable powerful data export!** 📊

