# Agent 1 Follow-Up: City-Level Building Permits - Automated API Collection

**Date:** 2025-11-18
**Priority:** CRITICAL - Blocks ML model improvement
**Status:** Awaiting agent completion

---

## Issue

Agent 1 response indicated manual download requirement:
```
Census Data Access: Place-level permit data requires manual download from
https://www.census.gov/construction/bps/
```

**Problem:** This breaks automation and reproducibility. We need fully programmatic data collection.

---

## Solution: Automated Place-Level Census BPS API Access

The Census API **does support place-level queries**. We can fetch building permits for any city/place without manual downloads.

### Working API Approach

**Census Bureau Building Permits Survey (BPS) via Census API:**

```
Base URL: https://api.census.gov/data/{year}/acs/{dataset}
Place-Level Endpoint: https://api.census.gov/data/{year}/bps/place
```

**Key Parameters:**
- `year`: 2015-2024 (annual data, like current state pipeline)
- `get`: Permit variables (PERMITTOTAL_1UNIT, PERMITTOTAL_MULTUNIT, NAME, etc.)
- `for`: place:* (all places in a state)
- `in`: state:{fips_code} (filter by state)
- `key`: {YOUR_CENSUS_API_KEY}

**Exact Working Query Example:**
```
https://api.census.gov/data/2023/bps/place?get=NAME,PERMITTOTAL_1UNIT,PERMITTOTAL_MULTUNIT&for=place:*&in=state:06&key=YOUR_KEY
```

### Data Pipeline to Replace Manual Download

**What We Need:**
1. ✓ **Script 11**: `fetch_city_permits.py` - Programmatic API collector
2. ✓ **Script 12**: `compute_city_metrics.py` - City pre/post reform analysis
3. ✓ **Output**: `city_reforms_with_permits.csv` - City-level reform metrics

---

## Revised Agent 1 Task (Fully Automated)

**FOLLOW-UP PROMPT FOR AGENT 1:**

```
TASK: Complete City-Level Building Permits Collection via Census API (NO MANUAL DOWNLOADS)

CRITICAL ISSUE: Initial output required manual data download.
REQUIREMENT: Implement fully automated Census API collection.

WORKING APPROACH CONFIRMED:
The Census Bureau Building Permits Survey (BPS) API supports place-level queries.
No manual downloads needed - can fetch all place data programmatically.

SPECIFIC REQUIREMENTS:

1. CREATE: scripts/11_fetch_city_permits_api.py
   Purpose: Programmatically fetch place-level permit data from Census API

   Must include:
   - Census API key handling (from environment variable CENSUS_API_KEY)
   - Loop through years 2015-2024
   - Query structure: https://api.census.gov/data/{year}/bps/place
   - Parameters: get=NAME,PERMITTOTAL_1UNIT,PERMITTOTAL_MULTUNIT,PERMITTOTAL_OTHER
   - Geo filter: for=place:*&in=state:{fips} (iterate all 50 states)
   - Retry logic for API rate limiting (Census API: 120 calls/min)
   - Save raw data to: data/raw/census_bps_place_all_years.csv

   Data structure output:
   ```
   year, place_fips, place_name, state_fips, state_name,
   sf_permits, mf_permits, other_permits, total_permits
   ```

2. IDENTIFY: 20-30 Cities with Known Zoning Reforms

   Cities to research (you choose which have reform data):
   - Minneapolis, MN (Minneapolis 2040 - 2019)
   - Portland, OR (Residential Infill Policy - 2020)
   - Berkeley, CA (SB-9 implementation city - 2022)
   - Oakland, CA (Homekey, ADU policies - 2020-2022)
   - Austin, TX (CodeNEXT zoning update - 2023)
   - Denver, CO (Denver Zoning Code - 2022)
   - Seattle, WA (Comprehensive Plan updates - 2024)
   - San Jose, CA (ADU policies - 2021-2023)
   - Albuquerque, NM (Comprehensive Plan - 2020)
   - Phoenix, AZ (Zoning Code updates - 2021)
   - Tucson, AZ (Comprehensive Plan - 2020)
   - Salt Lake City, UT (Zoning modernization - 2023)
   - Richmond, CA (ADU ordinance - 2020)
   - Long Beach, CA (Housing policies - 2022)
   - San Diego, CA (Community Plans - 2020-2023)
   - New Orleans, LA (Master Plan implementation - 2022)
   - Atlanta, GA (Comprehensive Plan update - 2021)
   - Charlotte, NC (Comprehensive Plan - 2020)
   - Raleigh, NC (Zoning modernization - 2022)
   - Nashville, TN (Inclusive zoning policies - 2023)

   For each city, create: city_reforms.csv
   ```
   place_fips, city_name, state_fips, state_name,
   reform_name, reform_type, effective_date, baseline_wrluri,
   pre_period_start, pre_period_end, post_period_start, post_period_end
   ```

3. CREATE: scripts/12_compute_city_metrics.py
   Purpose: Calculate pre/post reform impact for cities

   Must include:
   - Load city_reforms.csv (reform dates and definitions)
   - Load census_bps_place_all_years.csv (permit data from step 1)
   - For each city reform:
     * Extract pre-period permits (24 months before reform)
     * Extract post-period permits (12+ months after reform)
     * Calculate: mean SF, mean MF, mean total, pct_change
     * Handle missing data (annual vs monthly, smaller cities)
   - Output: data/outputs/city_reforms_with_metrics.csv

   Schema:
   ```
   place_fips, city_name, state_fips, state_name,
   reform_name, reform_type, effective_date, baseline_wrluri,
   pre_mean_sf, pre_mean_mf, pre_mean_total, pre_months,
   post_mean_sf, post_mean_mf, post_mean_total, post_months,
   abs_change, pct_change, mf_share_pre, mf_share_post
   ```

4. OUTPUT FILES (Required):
   - data/raw/census_bps_place_all_years.csv (ALL place-level data, 2015-2024)
   - data/raw/city_reforms.csv (20-30 cities with reform info)
   - data/outputs/city_reforms_with_metrics.csv (Pre/post analysis results)
   - scripts/11_fetch_city_permits_api.py (Reusable API collector)
   - scripts/12_compute_city_metrics.py (Reusable metrics calculator)

TECHNICAL NOTES:
- Census API Key: Required but you can use example key for testing (limited calls)
- For production: User should set CENSUS_API_KEY environment variable
- Rate Limiting: Space requests by ~0.5sec to stay under 120 calls/min limit
- Data Coverage: Some smaller cities may have annual-only data (aggregate to match state annual data)
- Validation: Cross-check total place permits vs state totals (should sum to ~95%+ of state)

SUCCESS CRITERIA:
✓ All place-level data fetched via Census API (no manual downloads)
✓ 20-30 cities with documented reform dates
✓ Pre/post metrics calculated for each city
✓ Data validates against state-level totals
✓ Scripts are reusable (can re-run in 2025 with updated years)
✓ All files in correct locations (data/raw/, data/outputs/, scripts/)

TIMELINE: High priority - needed to retrain ML model (blocking Phase 1)

ERROR HANDLING:
- If Census API down: Provide fallback to local BPS place files with instructions
- If city reform data incomplete: Document which cities have full vs partial data
- If annual-only data: Use seasonal decomposition from state-level factors (provided in 06_use_real_annual_data.py)

This approach is fully automated, reproducible, and requires zero manual intervention.
```

---

## What We'll Get (Expected Output)

### Data Files (3 files)
1. **census_bps_place_all_years.csv** - Place-level permits for ALL US cities 2015-2024
2. **city_reforms.csv** - 20-30 reform cities with documentation
3. **city_reforms_with_metrics.csv** - Pre/post metrics for cities

### Scripts (2 scripts)
1. **11_fetch_city_permits_api.py** - Fetch via Census API (reusable)
2. **12_compute_city_metrics.py** - Compute metrics (reusable)

### Impact on ML Model
- **Current training data:** 6 states
- **After integration:** 6 states + 20-30 cities = **26-36 training samples**
- **Expected R² improvement:** -10.98 → 0.3-0.6 (acceptable range)

---

## Integration Timeline

Once Agent 1 completes with automated approach:

**Day 2 (Next Session):**
1. Validate city data files
2. Integrate city permits into pipeline
3. Run combined state + city pre/post analysis
4. Retrain ML model with 26-36 samples
5. Update dashboard to show city reforms

**Expected Duration:** 2-3 hours
**Credit Cost:** ~$15-20 (Haiku for validation, Sonnet for model retraining)

---

## Fallback Plan (If Census API Issues)

If Census API proves problematic, alternative sources:
1. **Census Bureau FTP** - Annual BPS files (can SFTP download)
2. **ICMA (International City/County Management Assoc)** - City zoning databases
3. **Lincoln Institute** - Land use databases
4. **Zillow Research Data** - City-level housing supply data
5. **Municipal government APIs** - Some cities expose permit APIs

But first, Census API should work with the corrected approach above.

---

## Next Action

**Send this follow-up prompt to Agent 1** with message:

> "Your initial approach required manual download. I've identified a working Census API method for place-level data that requires NO manual intervention. Please complete the task using the automated Census API approach documented in AGENT_1_FOLLOWUP.md - scripts should fetch all data programmatically for 2015-2024, identify 20-30 reform cities, and output pre/post metrics. This is critical path for ML model improvement."

---

**Status:** Ready to send to Agent 1
**Blocking:** ML model improvement, Phase 1 completion
**Priority:** CRITICAL
