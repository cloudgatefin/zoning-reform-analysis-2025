// comparison-mode.js - State-to-state comparison functionality

export class ComparisonMode {
  constructor() {
    this.isActive = false;
    this.state1 = null;
    this.state2 = null;
    this.allData = [];
    this.allTimeseries = [];
    this.onChange = null;
  }

  setData(allData, allTimeseries) {
    this.allData = allData;
    this.allTimeseries = allTimeseries;
  }

  toggle() {
    this.isActive = !this.isActive;
    if (!this.isActive) {
      this.state1 = null;
      this.state2 = null;
    }
    return this.isActive;
  }

  setState1(jurisdiction) {
    this.state1 = jurisdiction;
    if (this.onChange) this.onChange();
  }

  setState2(jurisdiction) {
    this.state2 = jurisdiction;
    if (this.onChange) this.onChange();
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const jurisdictions = Array.from(
      new Set(this.allData.map(d => d.jurisdiction).filter(Boolean))
    ).sort();

    container.innerHTML = `
      <div class="comparison-mode-wrapper">
        <div class="comparison-header">
          <label class="comparison-toggle">
            <input type="checkbox" id="comparisonToggle" ${this.isActive ? 'checked' : ''} />
            <span class="toggle-text">Enable Comparison Mode</span>
          </label>
        </div>

        ${this.isActive ? `
          <div class="comparison-controls">
            <div class="comparison-select-group">
              <label for="compareState1" class="compare-label">State 1:</label>
              <select id="compareState1" class="compare-select">
                <option value="">Select state...</option>
                ${jurisdictions.map(j => `
                  <option value="${j}" ${this.state1 === j ? 'selected' : ''}>${j}</option>
                `).join('')}
              </select>
            </div>

            <div class="comparison-vs">vs</div>

            <div class="comparison-select-group">
              <label for="compareState2" class="compare-label">State 2:</label>
              <select id="compareState2" class="compare-select">
                <option value="">Select state...</option>
                ${jurisdictions.map(j => `
                  <option value="${j}" ${this.state2 === j ? 'selected' : ''}>${j}</option>
                `).join('')}
              </select>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Event listeners
    const toggle = document.getElementById('comparisonToggle');
    toggle?.addEventListener('change', (e) => {
      this.isActive = e.target.checked;
      this.render(containerId);
      if (this.onChange) this.onChange();
    });

    if (this.isActive) {
      document.getElementById('compareState1')?.addEventListener('change', (e) => {
        this.setState1(e.target.value);
      });

      document.getElementById('compareState2')?.addEventListener('change', (e) => {
        this.setState2(e.target.value);
      });
    }
  }

  getComparisonData() {
    if (!this.isActive || !this.state1 || !this.state2) {
      return null;
    }

    const data1 = this.allData.filter(d => d.jurisdiction === this.state1);
    const data2 = this.allData.filter(d => d.jurisdiction === this.state2);

    const ts1 = this.allTimeseries.filter(d => d.jurisdiction === this.state1);
    const ts2 = this.allTimeseries.filter(d => d.jurisdiction === this.state2);

    const getStats = (data) => {
      const pctValues = data
        .map(d => d.percent_change)
        .filter(v => v != null && Number.isFinite(v));

      const preValues = data
        .map(d => d.pre_mean_permits)
        .filter(v => v != null && Number.isFinite(v));

      const postValues = data
        .map(d => d.post_mean_permits)
        .filter(v => v != null && Number.isFinite(v));

      return {
        reformCount: data.length,
        avgPctChange: pctValues.length ? d3.mean(pctValues) : null,
        avgPre: preValues.length ? d3.mean(preValues) : null,
        avgPost: postValues.length ? d3.mean(postValues) : null
      };
    };

    const stats1 = getStats(data1);
    const stats2 = getStats(data2);

    return {
      state1: {
        name: this.state1,
        data: data1,
        timeseries: ts1,
        stats: stats1
      },
      state2: {
        name: this.state2,
        data: data2,
        timeseries: ts2,
        stats: stats2
      },
      difference: {
        reformCount: stats1.reformCount - stats2.reformCount,
        avgPctChange: stats1.avgPctChange != null && stats2.avgPctChange != null
          ? stats1.avgPctChange - stats2.avgPctChange
          : null,
        avgPre: stats1.avgPre != null && stats2.avgPre != null
          ? stats1.avgPre - stats2.avgPre
          : null,
        avgPost: stats1.avgPost != null && stats2.avgPost != null
          ? stats1.avgPost - stats2.avgPost
          : null
      }
    };
  }

  renderComparisonView(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const comparison = this.getComparisonData();
    if (!comparison) {
      container.innerHTML = '<p class="comparison-hint">Select two states to compare</p>';
      return;
    }

    const fmtNum = (n) => n != null && Number.isFinite(n) ? n.toFixed(2) : '—';
    const fmtDiff = (n) => {
      if (n == null || !Number.isFinite(n)) return '—';
      const sign = n >= 0 ? '+' : '';
      return `${sign}${n.toFixed(2)}`;
    };

    container.innerHTML = `
      <div class="comparison-view">
        <h3>State Comparison</h3>

        <div class="comparison-grid">
          <div class="comparison-metric">
            <div class="metric-label">Metric</div>
            <div class="metric-label">${comparison.state1.name}</div>
            <div class="metric-label">${comparison.state2.name}</div>
            <div class="metric-label">Difference</div>
          </div>

          <div class="comparison-metric">
            <div class="metric-name">Reform Count</div>
            <div class="metric-value">${comparison.state1.stats.reformCount}</div>
            <div class="metric-value">${comparison.state2.stats.reformCount}</div>
            <div class="metric-value ${comparison.difference.reformCount >= 0 ? 'pos' : 'neg'}">
              ${fmtDiff(comparison.difference.reformCount)}
            </div>
          </div>

          <div class="comparison-metric">
            <div class="metric-name">Avg % Change</div>
            <div class="metric-value">${fmtNum(comparison.state1.stats.avgPctChange)}%</div>
            <div class="metric-value">${fmtNum(comparison.state2.stats.avgPctChange)}%</div>
            <div class="metric-value ${comparison.difference.avgPctChange >= 0 ? 'pos' : 'neg'}">
              ${fmtDiff(comparison.difference.avgPctChange)}%
            </div>
          </div>

          <div class="comparison-metric">
            <div class="metric-name">Avg Pre Permits</div>
            <div class="metric-value">${fmtNum(comparison.state1.stats.avgPre)}</div>
            <div class="metric-value">${fmtNum(comparison.state2.stats.avgPre)}</div>
            <div class="metric-value ${comparison.difference.avgPre >= 0 ? 'pos' : 'neg'}">
              ${fmtDiff(comparison.difference.avgPre)}
            </div>
          </div>

          <div class="comparison-metric">
            <div class="metric-name">Avg Post Permits</div>
            <div class="metric-value">${fmtNum(comparison.state1.stats.avgPost)}</div>
            <div class="metric-value">${fmtNum(comparison.state2.stats.avgPost)}</div>
            <div class="metric-value ${comparison.difference.avgPost >= 0 ? 'pos' : 'neg'}">
              ${fmtDiff(comparison.difference.avgPost)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  reset() {
    this.isActive = false;
    this.state1 = null;
    this.state2 = null;
  }
}
