/**
 * Permit Forecast Visualization Module
 *
 * Displays SARIMA model forecasts with confidence intervals
 * Integrates with the main dashboard to show historical + forecast data
 */

(function() {
  'use strict';

  // Configuration
  const FORECAST_CSV_URL = './data/permit_forecasts.csv';
  const ACCURACY_CSV_URL = './data/forecast_accuracy.csv';

  // Module state
  let forecastData = [];
  let accuracyData = [];
  let forecastChart = null;
  let showForecast = false;

  // Date parsing for forecast data
  const parseForecastDate = d3.timeParse('%Y-%m-%d');
  const fmtDate = d3.timeFormat('%b %Y');

  /**
   * Initialize the forecast module
   */
  async function init() {
    console.log('Initializing forecast module...');

    try {
      // Load forecast data
      const [forecastText, accuracyText] = await Promise.all([
        fetch(FORECAST_CSV_URL).then(r => r.text()),
        fetch(ACCURACY_CSV_URL).then(r => r.text())
      ]);

      forecastData = d3.csvParse(forecastText, d => ({
        jurisdiction: d.jurisdiction,
        date: parseForecastDate(d.date),
        forecast: +d.forecast,
        ci_80_lower: +d.ci_80_lower,
        ci_80_upper: +d.ci_80_upper,
        ci_95_lower: +d.ci_95_lower,
        ci_95_upper: +d.ci_95_upper,
        is_post_reform: +d.is_post_reform
      })).filter(d => d.date && Number.isFinite(d.forecast));

      accuracyData = d3.csvParse(accuracyText, d3.autoType);

      console.log(`Loaded ${forecastData.length} forecast records for ${accuracyData.length} jurisdictions`);

      // Add UI controls
      addForecastControls();

      return true;
    } catch (error) {
      console.warn('Forecast data not available:', error);
      return false;
    }
  }

  /**
   * Add forecast toggle controls to the dashboard
   */
  function addForecastControls() {
    const controlsCard = document.querySelector('.top-controls');
    if (!controlsCard) return;

    // Create toggle button
    const toggleDiv = document.createElement('div');
    toggleDiv.innerHTML = `
      <label>
        <input type="checkbox" id="forecastToggle" style="margin-right: 4px;">
        Show Forecasts
      </label>
    `;

    controlsCard.appendChild(toggleDiv);

    // Add event listener
    const checkbox = document.getElementById('forecastToggle');
    checkbox.addEventListener('change', function() {
      showForecast = this.checked;

      // Trigger update event
      const event = new CustomEvent('forecastToggled', {
        detail: { enabled: showForecast }
      });
      document.dispatchEvent(event);
    });

    // Add forecast metrics display to state detail
    const stateDetailCard = document.querySelector('.card:has(#stateDetailHint)');
    if (stateDetailCard) {
      const metricsDiv = document.createElement('div');
      metricsDiv.id = 'forecastMetrics';
      metricsDiv.style.marginTop = '10px';
      metricsDiv.style.display = 'none';
      metricsDiv.innerHTML = `
        <div class="state-section-title">Forecast Accuracy (2024 validation)</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px;">
          <div style="background: #020617; padding: 8px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="color: var(--muted); font-size: 10px;">MAPE</div>
            <div id="metricMAPE" style="font-size: 14px;">—</div>
          </div>
          <div style="background: #020617; padding: 8px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="color: var(--muted); font-size: 10px;">RMSE</div>
            <div id="metricRMSE" style="font-size: 14px;">—</div>
          </div>
        </div>
      `;

      const reformList = stateDetailCard.querySelector('#stateReformList');
      if (reformList && reformList.parentNode) {
        reformList.parentNode.parentNode.insertBefore(metricsDiv, reformList.parentNode);
      }
    }
  }

  /**
   * Get forecast data for a specific jurisdiction
   */
  function getForecastForJurisdiction(jurisdiction) {
    return forecastData.filter(d =>
      d.jurisdiction.toLowerCase() === jurisdiction.toLowerCase()
    );
  }

  /**
   * Get accuracy metrics for a jurisdiction
   */
  function getAccuracyForJurisdiction(jurisdiction) {
    return accuracyData.find(d =>
      d.jurisdiction.toLowerCase() === jurisdiction.toLowerCase()
    );
  }

  /**
   * Create forecast chart with historical + forecast data
   */
  function createForecastChart(ctx, historicalData, jurisdiction) {
    if (!showForecast) {
      return null;
    }

    const forecast = getForecastForJurisdiction(jurisdiction);
    if (!forecast.length) {
      return null;
    }

    // Prepare datasets
    const datasets = [];

    // Historical data
    if (historicalData && historicalData.length) {
      datasets.push({
        label: 'Historical',
        data: historicalData.map(d => ({ x: d.date, y: d.permits })),
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: false
      });
    }

    // Forecast line
    datasets.push({
      label: 'Forecast',
      data: forecast.map(d => ({ x: d.date, y: d.forecast })),
      borderColor: '#f97316',
      backgroundColor: '#f97316',
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 2,
      pointHoverRadius: 4,
      fill: false
    });

    // 95% confidence interval
    datasets.push({
      label: '95% CI',
      data: forecast.map(d => ({ x: d.date, y: d.ci_95_upper })),
      borderColor: 'rgba(249, 115, 22, 0.2)',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      borderWidth: 0,
      pointRadius: 0,
      fill: '+1',
      order: 10
    });

    datasets.push({
      label: '95% CI Lower',
      data: forecast.map(d => ({ x: d.date, y: d.ci_95_lower })),
      borderColor: 'rgba(249, 115, 22, 0.2)',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      borderWidth: 0,
      pointRadius: 0,
      fill: false,
      order: 10
    });

    const chart = new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#e5e7eb',
              font: { size: 11 },
              filter: (item) => !item.text.includes('Lower')
            }
          },
          tooltip: {
            backgroundColor: '#020617',
            borderColor: '#1f2937',
            borderWidth: 1,
            titleColor: '#e5e7eb',
            bodyColor: '#e5e7eb',
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;

                if (label.includes('CI')) {
                  return null;
                }

                return `${label}: ${Math.round(value).toLocaleString()} permits`;
              },
              afterBody: function(contexts) {
                const idx = contexts[0].dataIndex;
                const dataset = contexts[0].dataset;

                if (dataset.label === 'Forecast' && forecast[idx]) {
                  const f = forecast[idx];
                  return [
                    `95% CI: ${Math.round(f.ci_95_lower).toLocaleString()} - ${Math.round(f.ci_95_upper).toLocaleString()}`,
                    `80% CI: ${Math.round(f.ci_80_lower).toLocaleString()} - ${Math.round(f.ci_80_upper).toLocaleString()}`
                  ];
                }
                return [];
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: { month: 'MMM yyyy' }
            },
            grid: { color: '#1f2937' },
            ticks: { color: '#9ca3af', font: { size: 10 } }
          },
          y: {
            beginAtZero: false,
            grid: { color: '#1f2937' },
            ticks: {
              color: '#9ca3af',
              font: { size: 10 },
              callback: value => Math.round(value).toLocaleString()
            }
          }
        }
      }
    });

    return chart;
  }

  /**
   * Update forecast metrics display
   */
  function updateForecastMetrics(jurisdiction) {
    const metricsDiv = document.getElementById('forecastMetrics');
    if (!metricsDiv) return;

    if (!showForecast) {
      metricsDiv.style.display = 'none';
      return;
    }

    const metrics = getAccuracyForJurisdiction(jurisdiction);
    if (!metrics) {
      metricsDiv.style.display = 'none';
      return;
    }

    metricsDiv.style.display = 'block';

    const mapeEl = document.getElementById('metricMAPE');
    const rmseEl = document.getElementById('metricRMSE');

    if (mapeEl) {
      const mapeClass = metrics.mape < 15 ? 'pos' : 'neg';
      mapeEl.innerHTML = `<span class="${mapeClass}">${metrics.mape.toFixed(1)}%</span>`;
    }

    if (rmseEl) {
      rmseEl.textContent = Math.round(metrics.rmse).toLocaleString();
    }
  }

  /**
   * Get combined historical + forecast data for a jurisdiction
   */
  function getCombinedData(jurisdiction, historicalData) {
    if (!showForecast) {
      return historicalData;
    }

    const forecast = getForecastForJurisdiction(jurisdiction);
    if (!forecast.length) {
      return historicalData;
    }

    // Combine historical and forecast
    const combined = [...historicalData];

    forecast.forEach(f => {
      combined.push({
        date: f.date,
        permits: f.forecast,
        is_forecast: true,
        ci_80_lower: f.ci_80_lower,
        ci_80_upper: f.ci_80_upper,
        ci_95_lower: f.ci_95_lower,
        ci_95_upper: f.ci_95_upper
      });
    });

    return combined;
  }

  /**
   * Export module API
   */
  window.ForecastModule = {
    init,
    createForecastChart,
    updateForecastMetrics,
    getForecastForJurisdiction,
    getAccuracyForJurisdiction,
    getCombinedData,
    isEnabled: () => showForecast,
    getData: () => forecastData,
    getAccuracyData: () => accuracyData
  };

  console.log('Forecast module loaded');
})();
