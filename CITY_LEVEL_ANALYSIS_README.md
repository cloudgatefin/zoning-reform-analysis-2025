# City-Level Building Permits Analysis

## Overview

This directory contains scripts and data for analyzing the impact of zoning reforms on building permits at the city (place) level. The analysis uses Census Bureau Building Permits Survey (BPS) data to measure pre/post reform changes in housing production.

## Files Created

### Scripts

1. **`scripts/11_fetch_city_permits_api.py`**
   - Fetches place-level building permit data from Census API
   - Covers all US cities for years 2015-2024
   - Fully automated with error handling and retry logic
   - Rate-limited to respect Census API limits (120 calls/min)

2. **`scripts/12_compute_city_metrics.py`**
   - Computes pre/post reform metrics for each city
   - Calculates 24-month periods before/after reform
   - Generates comprehensive impact metrics
   - Includes data quality assessment

3. **`scripts/create_sample_data.py`**
   - Creates synthetic test data for development/testing
   - Generates realistic permit patterns with reform impacts

### Data Files

1. **`data/raw/city_reforms.csv`**
   - Database of 30 US cities with documented zoning reforms
   - Includes reform names, types, effective dates
   - Baseline WRLURI (Wharton Residential Land Use Regulatory Index) scores

2. **`data/raw/census_bps_place_all_years.csv`**
   - Place-level building permit data for all years (2015-2024)
   - Currently contains sample data (see note below)
   - Schema: year, place_fips, place_name, state_fips, state_name, sf_permits, mf_permits, total_permits

3. **`data/outputs/city_reforms_with_metrics.csv`**
   - Final output with pre/post reform analysis
   - Includes absolute and percentage changes
   - Multi-family share calculations
   - Data quality indicators

## Census API Setup

### Getting an API Key

The Census Bureau provides free API access with a key:

1. Request a key at: https://api.census.gov/data/key_signup.html
2. Check your email for the API key
3. Set the environment variable:
   ```bash
   export CENSUS_API_KEY="your_key_here"
   ```

4. Or add to your `.bashrc` / `.zshrc`:
   ```bash
   echo 'export CENSUS_API_KEY="your_key_here"' >> ~/.bashrc
   source ~/.bashrc
   ```

### API Endpoint Information

The script uses the Census Building Permits Survey API:
- **Base URL**: `https://api.census.gov/data/{year}/bps/place`
- **Geography**: Place-level (cities and incorporated places)
- **Variables**:
  - `PERMITTOTAL_1UNIT`: Single-family permits
  - `PERMITTOTAL_2UNIT`: 2-unit permits
  - `PERMITTOTAL_34UNIT`: 3-4 unit permits
  - `PERMITTOTAL_5UNIT`: 5+ unit permits

## Important Note: Current API Access

**STATUS**: During initial development, Census API access returned 403 errors from the current environment. This could be due to:
- Network restrictions
- Temporary Census API outages
- Need for API key authentication

The scripts are fully implemented and ready to use. Once API access is available, simply run:

```bash
python scripts/11_fetch_city_permits_api.py
```

### Alternative: Manual Data Download

If API access remains unavailable, place-level data can be downloaded manually from:
- https://www.census.gov/construction/bps/
- Look for "Place-level" or "City-level" annual data files
- Download CSV files for each year (2015-2024)
- Combine into the expected format

## Usage

### Step 1: Fetch Census Data

```bash
# With Census API key set
python scripts/11_fetch_city_permits_api.py
```

This will create: `data/raw/census_bps_place_all_years.csv`

**Estimated runtime**: 4-5 minutes (10 years × 51 states × 0.5s delay)

### Step 2: Compute Reform Metrics

```bash
python scripts/12_compute_city_metrics.py
```

This will create: `data/outputs/city_reforms_with_metrics.csv`

**Runtime**: < 1 minute

### Step 3: Analyze Results

```python
import pandas as pd

results = pd.read_csv('data/outputs/city_reforms_with_metrics.csv')

# Cities with complete data
complete = results[results['data_quality'] == 'complete']

print(f"Mean permit change: {complete['pct_change'].mean():.1f}%")
print(f"Mean MF share increase: {complete['mf_share_change'].mean():.1f} pp")
```

## Output Schema

### city_reforms_with_metrics.csv

| Column | Description |
|--------|-------------|
| `place_fips` | 7-digit Census place FIPS code |
| `city_name` | City name |
| `state_fips` | 2-digit state FIPS code |
| `state_name` | State name |
| `reform_name` | Name of zoning reform |
| `reform_type` | Type (Comprehensive Reform, ADU/Lot Split, Zoning Upzones) |
| `effective_date` | Date reform went into effect |
| `baseline_wrluri` | Pre-reform regulatory index score |
| `pre_mean_sf` | Average SF permits/year in pre-period (24 months) |
| `pre_mean_mf` | Average MF permits/year in pre-period |
| `pre_mean_total` | Average total permits/year in pre-period |
| `pre_years` | Number of years of pre-data available |
| `post_mean_sf` | Average SF permits/year in post-period (24 months) |
| `post_mean_mf` | Average MF permits/year in post-period |
| `post_mean_total` | Average total permits/year in post-period |
| `post_years` | Number of years of post-data available |
| `abs_change` | Absolute change in permits/year |
| `pct_change` | Percentage change in permits |
| `mf_share_pre` | Multi-family share before reform (%) |
| `mf_share_post` | Multi-family share after reform (%) |
| `mf_share_change` | Change in MF share (percentage points) |
| `data_quality` | Quality flags (complete, limited_pre_data, etc.) |

## Data Quality

The script automatically assesses data quality and flags issues:

- **`complete`**: Full 24-month pre/post data available
- **`limited_pre_data`**: Less than 2 years of pre-reform data
- **`limited_post_data`**: Less than 2 years of post-reform data
- **`recent_reform`**: Reform within past 2 years (insufficient post-data)
- **`missing_pre_values`**: Some pre-period data missing
- **`missing_post_values`**: Some post-period data missing

## Reform Types Included

### Comprehensive Reform (10 cities)
Major overhauls of zoning codes affecting broad areas:
- Minneapolis 2040 (ended single-family zoning)
- Portland Residential Infill Project
- Austin Land Development Code Revision
- New Orleans Comprehensive Zoning Ordinance
- Charlotte/Raleigh Unified Development Ordinances

### ADU/Lot Split (12 cities)
California SB-9 implementation + local ADU ordinances:
- Berkeley, Oakland, San Diego, San Francisco
- Long Beach, Richmond, Sacramento
- San Jose, Palo Alto
- Denver, Phoenix (local ADU reforms)

### Zoning Upzones (8 cities)
Targeted upzoning and density increases:
- Seattle HALA
- Atlanta City Design
- New York Mandatory Inclusionary Housing
- Salt Lake City Affordable Housing Incentives

## Validation

The script includes validation against state-level totals:
- Place-level permits should sum to ~95%+ of state totals
- Validates data completeness and accuracy
- Reports coverage percentage by state and year

## Cities Included (n=30)

| City | State | Reform Type | Effective Date |
|------|-------|-------------|----------------|
| Minneapolis | MN | Comprehensive Reform | 2019-03-01 |
| Portland | OR | Comprehensive Reform | 2021-08-01 |
| Austin | TX | Comprehensive Reform | 2021-05-01 |
| Seattle | WA | Zoning Upzones | 2019-03-01 |
| Berkeley | CA | ADU/Lot Split | 2022-01-01 |
| Oakland | CA | ADU/Lot Split | 2022-01-01 |
| San Diego | CA | ADU/Lot Split | 2022-01-01 |
| San Francisco | CA | ADU/Lot Split | 2022-01-01 |
| (22 more...) | | | |

See `data/raw/city_reforms.csv` for complete list.

## Troubleshooting

### Census API 403 Errors

If you encounter 403 Access Denied errors:

1. **Check API key**: Ensure `CENSUS_API_KEY` is set correctly
2. **Request a key**: Get one at https://api.census.gov/data/key_signup.html
3. **Check endpoint**: Some years may not be available yet
4. **Alternative**: Download data manually from census.gov/construction/bps/

### Missing Data

Some cities may have incomplete data:
- Smaller cities may not report monthly
- Some years may have gaps
- Script handles this gracefully with data quality flags

### Rate Limiting

If requests fail due to rate limiting:
- Increase `RATE_LIMIT_DELAY` in the script (default: 0.5s)
- Census limit is 120 calls/minute
- Script includes exponential backoff retry logic

## Next Steps

1. **Get Census API key** and fetch real data
2. **Run metrics computation** on real data
3. **Integrate with ML model** (Phase 1 of project)
4. **Add more cities** as reforms are identified
5. **Validate against state totals** using existing state-level data

## References

- Census Building Permits Survey: https://www.census.gov/construction/bps/
- Census API Guide: https://www.census.gov/data/developers/guidance/api-user-guide.html
- Census API Key Signup: https://api.census.gov/data/key_signup.html
- Minneapolis 2040: https://minneapolis2040.com/
- California SB-9: https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202120220SB9

## Contact

For questions about this analysis or data issues, please open an issue or contact the project maintainer.
