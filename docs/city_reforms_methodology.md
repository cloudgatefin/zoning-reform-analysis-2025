# City-Level Zoning Reform Analysis: Methodology

## Overview

This document describes the methodology for analyzing city-level zoning reforms and their impact on housing construction permits. The analysis extends the existing state-level framework to city jurisdictions, providing more granular data for machine learning models.

## Data Sources

### 1. City Reforms Catalog

**File**: `data/inputs/city_reforms_catalog.csv`

**Description**: Comprehensive catalog of 29 documented city-level zoning reforms from 2017-2024, focusing on cities with population >100,000.

**Columns**:
- `city_name`: City name
- `state_fips`: 2-digit state FIPS code
- `place_fips`: 7-digit Census place FIPS code (state+place)
- `reform_name`: Name/identifier of the reform
- `reform_type`: Classification (ADU, Upzoning, Missing Middle, Density Bonus, Comprehensive)
- `effective_date`: Date reform took effect (YYYY-MM-DD)
- `description`: Brief description of the reform

**Reform Types**:
- **ADU**: Accessory Dwelling Unit legalization/streamlining
- **Upzoning**: Allowing higher density (e.g., duplexes in single-family zones)
- **Missing Middle**: Legalizing 2-4 unit buildings
- **Density Bonus**: Incentive programs for additional units
- **Comprehensive**: Large-scale zoning code overhauls

**Research Sources**:
- City planning department records
- Academic research (Terner Center, Urban Institute)
- News archives and press releases
- State legislative records (for statewide reforms with local implementation)

### 2. Census Building Permit Survey (BPS) Place-Level Data

**Source**: U.S. Census Bureau Building Permits Survey
**URL**: https://www.census.gov/construction/bps/

**Important Note**: Census BPS place-level data is **NOT available via API**. Data must be downloaded manually from the Census website.

**Data Collection**:
1. Visit https://www.census.gov/construction/bps/
2. Navigate to "Place Data" or "Historical Data" section
3. Download monthly place-level permit files for years 2015-2024
4. Save files in `data/raw/` directory

**File Naming**:
- Option A: Single combined file → `data/raw/bps_place_all.csv`
- Option B: Annual files → `data/raw/bps_place_2015.csv`, `bps_place_2016.csv`, etc.

**Required Columns**:
- Place FIPS code (7 digits: 2-digit state + 5-digit place)
- Date/Month (YYYY-MM or YYYYMM format)
- Units/Permits (number of housing units authorized)

**Coverage**: The Census BPS collects data from approximately 20,000 permit-issuing places. Coverage varies by jurisdiction size:
- All places with population >20,000 (monthly reporting)
- Sample of places with population 10,000-20,000
- Sample of places <10,000

**Data Availability**: Not all cities in our reforms catalog may have complete monthly permit data, particularly:
- Smaller jurisdictions (<50,000 population)
- Places that only report annually
- Jurisdictions with recent boundary changes

## Methodology

### Time Windows

Following the state-level analysis methodology, we use a quasi-experimental design with the following time windows:

- **Pre-reform period**: 24 months before reform effective date (excluding buffer)
- **Buffer period**: 12 months starting from effective date (implementation lag)
- **Post-reform period**: 24 months after buffer period

**Example** for reform effective 2020-01-01:
- Pre-period: 2017-07-01 to 2019-06-01 (24 months)
- Buffer: 2020-01-01 to 2020-12-01 (12 months)
- Post-period: 2021-01-01 to 2022-12-01 (24 months)

### Metrics Computed

For each reform with sufficient data:

1. **Pre-reform mean permits**: Average monthly permits during pre-period
2. **Post-reform mean permits**: Average monthly permits during post-period
3. **Absolute change**: Post-mean minus pre-mean
4. **Percent change**: (Absolute change / pre-mean) × 100

### Data Processing Script

**Script**: `scripts/11_fetch_city_permits.py`

**Process**:
1. Load place-level permit data from Census CSV files
2. Normalize data to standard format (place_fips, month, permits)
3. For each reform in catalog:
   - Filter permits for specific place FIPS code
   - Compute pre/post metrics using time windows
   - Handle missing data and insufficient windows
4. Output metrics to `data/outputs/city_reform_metrics.csv`

**Status Codes**:
- `ok`: Metrics successfully computed
- `no_permit_data`: No Census data found for place FIPS
- `insufficient_window`: Data doesn't cover required time windows

### Limitations and Considerations

1. **Data Availability**: Not all cities have monthly permit data available from Census BPS
   - Smaller jurisdictions may only report annually
   - Some cities may have gaps in reporting
   - Census may not cover all permit-issuing places

2. **Causal Inference Limitations**:
   - No control group in current analysis
   - Cannot isolate reform effects from market trends
   - Local economic conditions may confound results
   - COVID-19 pandemic effects (2020-2021) create challenges

3. **Reform Implementation**:
   - 12-month buffer may not capture all implementation delays
   - Some reforms phase in gradually
   - Local adoption may lag state mandates

4. **Geographic Boundaries**:
   - City boundaries may change over time
   - Metropolitan spillover effects not captured
   - Some reforms apply to specific neighborhoods only

## Integration with State-Level Data

### Combining City and State Data

For machine learning models, city-level and state-level reforms can be combined:

1. **Merged Dataset**: Concatenate `city_reform_metrics.csv` with `reform_impact_metrics.csv`
2. **Feature Engineering**:
   - Add jurisdiction type (state vs. city)
   - Add population size categories
   - Add reform type dummies
   - Add effective date year/quarter

3. **Model Training**:
   - Use combined dataset for training
   - Include jurisdiction type as feature
   - Consider hierarchical models (city nested in state)

### Sample Analysis Code

```python
import pandas as pd

# Load data
state_reforms = pd.read_csv('data/outputs/reform_impact_metrics.csv')
city_reforms = pd.read_csv('data/outputs/city_reform_metrics.csv')

# Add jurisdiction type
state_reforms['jurisdiction_type'] = 'state'
city_reforms['jurisdiction_type'] = 'city'

# Standardize columns
state_reforms = state_reforms.rename(columns={'jurisdiction': 'jurisdiction_name'})
city_reforms = city_reforms.rename(columns={'city_name': 'jurisdiction_name'})

# Combine
all_reforms = pd.concat([
    state_reforms[['jurisdiction_name', 'jurisdiction_type', 'reform_type',
                   'effective_date', 'percent_change', 'status']],
    city_reforms[['jurisdiction_name', 'jurisdiction_type', 'reform_type',
                  'effective_date', 'percent_change', 'status']]
], ignore_index=True)

# Filter to successful metrics
successful = all_reforms[all_reforms['status'] == 'ok']

print(f"Total reforms: {len(successful)}")
print(f"State-level: {len(successful[successful['jurisdiction_type']=='state'])}")
print(f"City-level: {len(successful[successful['jurisdiction_type']=='city'])}")
```

## City Catalog Summary

### Geographic Distribution

Our catalog of 29 cities covers:
- **California**: 9 cities (Berkeley, Los Angeles, Oakland, Sacramento, San Diego, San Francisco, San Jose)
- **Texas**: 2 cities (Austin)
- **North Carolina**: 3 cities (Charlotte, Durham, Raleigh)
- **Washington**: 1 city (Seattle)
- **Oregon**: 1 city (Portland)
- **Minnesota**: 1 city (Minneapolis)
- **Massachusetts**: 3 cities (Boston, Cambridge, Somerville)
- **Other states**: 9 cities

### Reform Type Distribution

- **ADU reforms**: 18 cities (62%)
- **Upzoning/Missing Middle**: 8 cities (28%)
- **Density Bonus**: 1 city (3%)
- **Comprehensive**: 2 cities (7%)

### Timeline Distribution

- **2017**: 1 reform
- **2019**: 3 reforms
- **2020**: 10 reforms (peak year for ADU reforms following state legislation)
- **2021**: 8 reforms
- **2022**: 3 reforms
- **2023**: 3 reforms
- **2024**: 1 reform

## Future Enhancements

### Short-term Improvements

1. **Download Census Data**: Manually download BPS place-level data to populate metrics
2. **Data Quality Checks**: Validate FIPS codes and cross-reference with Census geography
3. **Expand Catalog**: Add more cities (target: 50+ reforms)
4. **Add Control Cities**: Identify matched control cities without reforms

### Medium-term Enhancements

1. **Annual Data Fallback**: Use annual BPS data where monthly is unavailable
2. **Neighborhood Analysis**: For cities with neighborhood-specific reforms, use tract-level data
3. **Multiple Reform Handling**: Track cities with multiple reforms over time
4. **Metropolitan Area Analysis**: Include spillover effects using CBSA-level data

### Long-term Research

1. **Diff-in-Diff Analysis**: Implement proper causal inference with control groups
2. **Synthetic Controls**: Use synthetic control method for individual city case studies
3. **Panel Regression**: Estimate fixed effects models with city and time fixed effects
4. **Heterogeneity Analysis**: Examine effect moderation by city characteristics

## References

### Academic Sources

- Monkkonen, P., & Manville, M. (2019). "Opposition to Housing Development in Los Angeles"
- Wegmann, J. (2020). "Death to Single-Family Zoning...and New Life to the Missing Middle"
- Been, V., et al. (2018). "Supply Skepticism: Housing Supply and Affordability"
- Terner Center (2021). "California's HOME Act Turns One" (SB9 analysis)

### Data Sources

- U.S. Census Bureau Building Permits Survey: https://www.census.gov/construction/bps/
- Zoning Reform Tracker (UC Berkeley): https://belonging.berkeley.edu/zoning-reform-tracker
- Local Housing Solutions Case Studies: https://www.localhousingsolutions.org/

### City-Specific Documentation

Each reform in the catalog was verified using primary sources including city council minutes, ordinance records, and official press releases. Source URLs are available upon request.

## Appendix: FIPS Code Reference

### State FIPS Codes (Selected)

| State | FIPS | State | FIPS |
|-------|------|-------|------|
| California | 06 | Oregon | 41 |
| Colorado | 08 | Pennsylvania | 42 |
| Massachusetts | 25 | Tennessee | 47 |
| Minnesota | 27 | Texas | 48 |
| North Carolina | 37 | Virginia | 51 |
| Ohio | 39 | Wisconsin | 55 |

### Example Place FIPS Codes

- Minneapolis, MN: 2743000 (state 27 + place 43000)
- Seattle, WA: 5363000 (state 53 + place 63000)
- Portland, OR: 4159000 (state 41 + place 59000)
- San Francisco, CA: 0667000 (state 06 + place 67000)

Complete FIPS code lookup: https://www.census.gov/library/reference/code-lists/ansi.html
