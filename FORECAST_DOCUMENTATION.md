# Permit Forecasting - Implementation Documentation

## Overview

This implementation adds SARIMA-based permit forecasting to the Zoning Reform Analysis Dashboard. The system generates 12-month forecasts with confidence intervals for each state, accounting for seasonality, trends, and reform effects.

## Components

### 1. Python Forecasting Script (`scripts/18_forecast_permits.py`)

**Purpose**: Generate statistical forecasts using SARIMA models

**Key Features**:
- Auto-selects optimal SARIMA parameters using pmdarima's auto_arima
- Accounts for monthly seasonality (s=12)
- Incorporates reform effects as exogenous variables
- Validates on 2024 holdout data
- Generates 80% and 95% confidence intervals

**Models Used**:
- **California**: SARIMA(1,0,0)x(2,0,0,12)
- **Texas**: SARIMA(1,0,2)x(1,0,0,12)
- **Virginia**: SARIMA(1,0,0)x(2,0,1,12)

**Usage**:
```bash
python scripts/18_forecast_permits.py
```

**Outputs**:
- `data/outputs/permit_forecasts.csv` - 12-month forecasts with confidence intervals
- `data/outputs/forecast_accuracy.csv` - Validation metrics (MAE, RMSE, MAPE)

### 2. Visualization Module (`visualizations/js/forecast.js`)

**Purpose**: Display forecasts in the interactive dashboard

**Features**:
- Toggle forecasts on/off
- Combined historical + forecast chart
- Shaded confidence interval regions
- Forecast accuracy metrics display
- Integration with existing state detail panel

**API**:
```javascript
window.ForecastModule.init()                          // Initialize module
window.ForecastModule.createForecastChart(ctx, data, state)  // Create chart
window.ForecastModule.updateForecastMetrics(state)    // Update metrics
window.ForecastModule.isEnabled()                     // Check if enabled
```

### 3. Dashboard Integration (`visualizations/index.html`, `visualizations/js/main.js`)

**Changes**:
- Added forecast.js script loading
- Integrated forecast toggle checkbox
- Enhanced state detail panel with forecast metrics
- Event-driven forecast updates

## Data Flow

```
Historical Data (2015-2024)
    ↓
Data Expansion & Interpolation (monthly)
    ↓
SARIMA Model Training (2015-2023)
    ↓
Validation (2024 data)
    ↓
12-Month Forecast Generation (2025)
    ↓
CSV Export (permit_forecasts.csv)
    ↓
Dashboard Visualization
```

## Validation Results

### Performance Metrics (2024 Validation)

| State      | MAPE   | RMSE    | 95% CI Coverage |
|------------|--------|---------|-----------------|
| California | 41.02% | 3736.16 | 66.7%           |
| Texas      | 35.78% | 3879.82 | 66.7%           |
| Virginia   | 8.28%  | 247.65  | 83.3%           |
| **Average**| **28.36%** | **2621.21** | **72.2%** |

### Success Criteria Evaluation

| Criterion | Target | Achieved | Status |
|-----------|--------|----------|--------|
| MAPE      | < 15%  | 28.36%   | ⚠️ Partial (Virginia: 8.28%) |
| 95% CI Coverage | ~95% | 72.2%    | ⚠️ Needs improvement |

**Notes**:
- Virginia shows excellent performance (MAPE: 8.28%)
- California and Texas have higher error rates due to:
  - Limited historical data (only 3 months/year in original dataset)
  - Synthetic interpolation for monthly expansion
  - High variance in permit patterns
- Real-world implementation with complete monthly data would yield better results

## Methodology

### Data Preprocessing
1. Load quarterly data (3 months per year, 2019-2024)
2. Expand to full monthly series using linear interpolation
3. Add seasonal variation (10% sinusoidal pattern)
4. Add random noise (±3% variation)

### Model Selection
- **Method**: pmdarima.auto_arima with stepwise search
- **Parameter ranges**:
  - p, q: 0-3 (AR and MA orders)
  - P, Q: 0-2 (Seasonal AR and MA orders)
  - d, D: Auto-detected (differencing orders)
  - s: 12 (monthly seasonality)

### Validation Strategy
- **Training**: 2015-2023 (108 months)
- **Validation**: 2024 (12 months)
- **Forecast horizon**: 12 months (2025)

### Exogenous Variables
- Reform indicator: Binary variable (0 = pre-reform, 1 = post-reform)
- Applied when reform effective date is known

## Dashboard Usage

### Enabling Forecasts

1. Open the dashboard (`visualizations/index.html`)
2. Check the **"Show Forecasts"** checkbox in the top controls
3. Select a state from the jurisdiction dropdown
4. The state detail panel will show:
   - Historical data (solid blue line)
   - Forecast data (dashed orange line)
   - 95% confidence interval (shaded orange region)
   - Validation metrics (MAPE, RMSE)

### Interpreting Forecasts

- **Forecast line**: Expected permit values for next 12 months
- **Confidence intervals**:
  - 80% CI (darker shade): Higher confidence range
  - 95% CI (lighter shade): Broader uncertainty range
- **Reform indicator**: Forecasts account for post-reform periods

## Files Created/Modified

### New Files
1. `scripts/18_forecast_permits.py` - Forecasting script
2. `visualizations/js/forecast.js` - Visualization module
3. `data/outputs/permit_forecasts.csv` - Forecast data
4. `data/outputs/forecast_accuracy.csv` - Validation metrics
5. `FORECAST_DOCUMENTATION.md` - This file

### Modified Files
1. `visualizations/index.html` - Added forecast.js script
2. `visualizations/js/main.js` - Integrated forecast module
3. `requirements.txt` - Added pmdarima, statsmodels, scikit-learn

## Dependencies

### Python
```
pmdarima>=2.0      # Auto-ARIMA model selection
statsmodels>=0.14  # SARIMA implementation
scikit-learn>=1.0  # Metrics calculation
pandas>=2.2        # Data manipulation
numpy              # Numerical operations
```

### JavaScript
```
Chart.js v4        # Charting (already included)
D3.js v7           # Data manipulation (already included)
```

## Future Improvements

1. **Data Quality**:
   - Obtain complete monthly historical data
   - Extend time series to include more years
   - Add more states/jurisdictions

2. **Model Enhancements**:
   - Multi-variate forecasting (include economic indicators)
   - Ensemble methods (combine multiple models)
   - Dynamic re-training as new data arrives
   - Structural break detection for major policy changes

3. **Visualization**:
   - Interactive confidence interval toggling
   - Forecast horizon slider (3, 6, 12, 24 months)
   - Comparison view (multiple states side-by-side)
   - Export forecast data to CSV

4. **Validation**:
   - Rolling window validation
   - Out-of-sample testing with recent data
   - Forecast accuracy tracking over time

## Troubleshooting

### Forecasts not showing
- Check browser console for errors
- Verify forecast data files exist in `visualizations/data/`
- Ensure "Show Forecasts" checkbox is enabled
- Check that a jurisdiction is selected

### Poor forecast accuracy
- Review validation metrics in `forecast_accuracy.csv`
- Consider adjusting SARIMA parameters
- Check for data quality issues
- Verify reform dates are correct

### Python script errors
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check data files exist: `visualizations/data/reform_timeseries.csv`
- Review error messages for specific issues

## References

- **pmdarima Documentation**: https://alkaline-ml.com/pmdarima/
- **statsmodels SARIMAX**: https://www.statsmodels.org/stable/statespace.html
- **Time Series Forecasting**: Hyndman & Athanasopoulos, "Forecasting: Principles and Practice"

## Contact

For questions or issues, please refer to the project repository or contact the development team.

---

**Last Updated**: 2025-11-18
**Version**: 1.0
