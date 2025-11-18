// data-export.js - Enhanced data export with CSV, JSON, and clipboard

export class DataExport {
  constructor() {
    this.summaryData = null;
    this.filteredData = null;
  }

  updateData(summaryData, filteredData) {
    this.summaryData = summaryData;
    this.filteredData = filteredData;
  }

  exportCSV() {
    if (!this.filteredData || this.filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'jurisdiction',
      'reform_name',
      'reform_type',
      'effective_date',
      'pre_mean_permits',
      'post_mean_permits',
      'percent_change',
      'status'
    ];

    const csvRows = [headers.join(',')];

    this.filteredData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape values that contain commas or quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `zoning-reform-filtered-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportJSON() {
    if (!this.filteredData || this.filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalRecords: this.filteredData.length,
        summary: this.summaryData
      },
      data: this.filteredData
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `zoning-reform-filtered-${new Date().toISOString().slice(0, 10)}.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async copyToClipboard() {
    if (!this.summaryData) {
      alert('No summary data available');
      return;
    }

    const avgPct = this.summaryData.avgPct != null && Number.isFinite(this.summaryData.avgPct)
      ? this.summaryData.avgPct.toFixed(2) + '%'
      : 'N/A';

    const dateRange = this.summaryData.range.earliest && this.summaryData.range.latest
      ? `${this.summaryData.range.earliest.toISOString().slice(0, 10)} to ${this.summaryData.range.latest.toISOString().slice(0, 10)}`
      : 'N/A';

    const summaryText = `
Zoning Reform Dashboard - Summary Statistics
Generated: ${new Date().toLocaleString()}

Total Reforms (OK windows): ${this.summaryData.reformsOk}
Average Percent Change: ${avgPct}
Effective Date Range: ${dateRange}
Filtered Records: ${this.filteredData?.length || 0}
    `.trim();

    try {
      await navigator.clipboard.writeText(summaryText);

      // Show feedback
      const btn = document.getElementById('copyStatsBtn');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('btn-success');

        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('btn-success');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard. Please try again.');
    }
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="export-controls">
        <button id="exportCSVBtn" class="btn btn-secondary">
          📊 Export CSV
        </button>
        <button id="exportJSONBtn" class="btn btn-secondary">
          📋 Export JSON
        </button>
        <button id="copyStatsBtn" class="btn btn-secondary">
          📑 Copy Summary
        </button>
      </div>
    `;

    // Event listeners
    document.getElementById('exportCSVBtn')?.addEventListener('click', () => this.exportCSV());
    document.getElementById('exportJSONBtn')?.addEventListener('click', () => this.exportJSON());
    document.getElementById('copyStatsBtn')?.addEventListener('click', () => this.copyToClipboard());
  }
}
