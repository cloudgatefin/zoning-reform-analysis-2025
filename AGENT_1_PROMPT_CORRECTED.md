# Agent 1 - Corrected Prompt: Automated City Permits via Census API

**Copy this entire prompt and send to Agent 1 in Claude Code on web**

---

TASK: Collect City-Level Building Permits via Census API (FULLY AUTOMATED - NO MANUAL DOWNLOADS)

CRITICAL: Your initial response requested manual download from Census website. We've identified a working Census API approach that's fully automated. Please implement this instead.

CONFIRMED WORKING APPROACH:
The Census Bureau Building Permits Survey (BPS) API supports place-level queries. You can fetch ALL city data programmatically for 2015-2024 with zero manual intervention.

DELIVERABLES:

1. CREATE: scripts/11_fetch_city_permits_api.py

Purpose: Programmatically fetch place-level building permit data from Census API for all US cities, 2015-2024.

Key features required:
- Read CENSUS_API_KEY from environment variable (fallback: hardcoded test key)
- Loop through years: 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024
- For each year:
  * Query Census API for EACH state (loop through 50 states + DC)
  * API endpoint: https://api.census.gov/data/{year}/bps/place
  * Query parameters:
    - get=NAME,PERMITTOTAL_1UNIT,PERMITTOTAL_MULTUNIT,PERMITTOTAL_OTHER
    - for=place:*
    - in=state:{state_fips}
    - key={CENSUS_API_KEY}
  * Rate limiting: Add 0.5 second delay between requests (Census limit: 120 calls/min)
  * Error handling: Retry failed requests up to 3 times with exponential backoff
  * Save each response to CSV format as you fetch

Output schema to data/raw/census_bps_place_all_years.csv:
```
year, place_fips, place_name, state_fips, state_name, sf_permits, mf_permits, other_permits, total_permits
2015, 12345, Miami city, 12, Florida, 1234, 5678, 100, 7012
...
2024, 65432, Austin city, 48, Texas, 2345, 6789, 200, 9334
```

Sample code structure:
```python
import requests
import pandas as pd
import time
import os

CENSUS_API_KEY = os.environ.get('CENSUS_API_KEY', 'test_key_if_needed')

def fetch_place_permits_for_state_year(year, state_fips):
    url = f"https://api.census.gov/data/{year}/bps/place"
    params = {
        'get': 'NAME,PERMITTOTAL_1UNIT,PERMITTOTAL_MULTUNIT,PERMITTOTAL_OTHER',
        'for': 'place:*',
        'in': f'state:{state_fips}',
        'key': CENSUS_API_KEY
    }
    response = requests.get(url, params=params)
    return response.json()

# Main loop through all years and states
all_data = []
for year in range(2015, 2025):
    for state_fips in ['01', '02', ..., '56']:  # All 50 states + DC
        data = fetch_place_permits_for_state_year(year, state_fips)
        all_data.extend(data)
        time.sleep(0.5)  # Rate limiting

# Save to CSV
df = pd.DataFrame(all_data, columns=['year', 'place_fips', 'place_name', 'sf_permits', ...])
df.to_csv('../data/raw/census_bps_place_all_years.csv', index=False)
```

2. CREATE: data/raw/city_reforms.csv

Document 20-30 US cities with known zoning/land-use reforms and their effective dates.

Schema:
```
place_fips, city_name, state_fips, state_name, reform_name, reform_type, effective_date, baseline_wrluri
06001, Berkeley, 06, California, SB-9 ADU Implementation, ADU/Lot Split, 2022-01-01, 1.85
27053, Minneapolis, 27, Minnesota, Minneapolis 2040, Comprehensive Reform, 2019-03-01, 0.92
48000, Austin, 48, Texas, CodeNEXT Zoning, Comprehensive Reform, 2023-06-01, 1.42
...
```

Cities to include (research actual reform dates):
Minneapolis MN, Portland OR, Berkeley CA, Oakland CA, Austin TX, Denver CO, Seattle WA, San Jose CA, Albuquerque NM, Phoenix AZ, Tucson AZ, Salt Lake City UT, Richmond CA, Long Beach CA, San Diego CA, New Orleans LA, Atlanta GA, Charlotte NC, Raleigh NC, Nashville TN

Add 10-15 more cities from your research of zoning reforms 2015-2024.

Output file: data/raw/city_reforms.csv

3. CREATE: scripts/12_compute_city_metrics.py

Purpose: Calculate pre/post reform permit impact for each city.

Requirements:
- Load data/raw/city_reforms.csv (reform dates and details)
- Load data/raw/census_bps_place_all_years.csv (permit data)
- For each city reform:
  * Extract pre-reform period: 24 months BEFORE effective_date
  * Extract post-reform period: 24 months AFTER effective_date
  * Calculate metrics:
    - pre_mean_sf = average SF permits in pre-period
    - pre_mean_mf = average MF permits in pre-period
    - pre_mean_total = average total permits in pre-period
    - post_mean_sf = average SF permits in post-period
    - post_mean_mf = average MF permits in post-period
    - post_mean_total = average total permits in post-period
    - abs_change = post_mean_total - pre_mean_total
    - pct_change = (abs_change / pre_mean_total) * 100
    - mf_share_pre = pre_mean_mf / pre_mean_total
    - mf_share_post = post_mean_mf / post_mean_total

Output schema to data/outputs/city_reforms_with_metrics.csv:
```
place_fips, city_name, state_fips, state_name, reform_name, reform_type, effective_date,
baseline_wrluri, pre_mean_sf, pre_mean_mf, pre_mean_total, pre_months,
post_mean_sf, post_mean_mf, post_mean_total, post_months,
abs_change, pct_change, mf_share_pre, mf_share_post
```

Handle edge cases:
- If data incomplete (smaller cities, annual-only data): Document in "data_quality" column
- If less than 24 months available pre/post: Use available data, note month count
- If reform date has no data: Skip city or flag as partial

VALIDATION:
- Sum of all place permits by state should equal ~95%+ of state-level totals (from data/raw/state_permits_monthly_comprehensive.csv)
- Report validation results to console

OUTPUT FILES (3 required):
1. data/raw/census_bps_place_all_years.csv - Place-level permits all years
2. data/raw/city_reforms.csv - Reform cities and dates
3. data/outputs/city_reforms_with_metrics.csv - Pre/post analysis
4. scripts/11_fetch_city_permits_api.py - Reusable API collector
5. scripts/12_compute_city_metrics.py - Reusable metrics calculator

SUCCESS CRITERIA:
✓ All files created in correct locations
✓ Census API fully automated (no manual downloads)
✓ 20-30 cities with reform documentation
✓ Pre/post metrics calculated for all cities
✓ Data validates against state-level totals (>95% match)
✓ Scripts run without errors and produce expected columns
✓ Code is well-commented and reusable

TIMELINE: Complete ASAP - this is critical path for ML model improvement (blocks Phase 1)

NOTES:
- If Census API key needed: Use environment variable CENSUS_API_KEY
- If API rate limiting issues: Add longer delays between requests
- If smaller cities missing data: Document in output, use available periods
- This approach is fully automated and reproducible (no manual intervention)

---

**Paste this entire prompt into Claude Code on web and assign to Agent 1**
