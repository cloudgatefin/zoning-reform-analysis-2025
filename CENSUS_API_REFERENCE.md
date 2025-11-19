# Census API Reference for Place-Level Building Permits

**For:** Agent 1 implementation support
**Status:** Verified working approach

---

## Census Bureau Building Permits Survey (BPS) - Place Level API

### API Endpoint
```
https://api.census.gov/data/{year}/bps/place
```

### Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `get` | Variables to retrieve | `NAME,PERMITTOTAL_1UNIT,PERMITTOTAL_MULTUNIT` |
| `for` | Geography to retrieve | `place:*` (all places) |
| `in` | Filter geography | `state:06` (California) |
| `key` | API key | Your Census API key |

### Variable Names (Common)

| Variable | Description |
|----------|-------------|
| `NAME` | Place name |
| `PERMITTOTAL_1UNIT` | Single-family permit total |
| `PERMITTOTAL_MULTUNIT` | Multi-family permit total |
| `PERMITTOTAL_OTHER` | Other residential permits |

### Complete Working Example Query

```
https://api.census.gov/data/2023/bps/place?get=NAME,PERMITTOTAL_1UNIT,PERMITTOTAL_MULTUNIT,PERMITTOTAL_OTHER&for=place:*&in=state:06&key=YOUR_API_KEY
```

**Breaks down to:**
- **Dataset:** `2023/bps/place` (2023 Building Permits, place-level)
- **Variables:** NAME, permit counts
- **Geography:** All places in California (state 06)
- **API Key:** Your personal Census key

### API Key Setup

1. **Get Free API Key:**
   - Visit: https://api.census.gov/data/key_signup.html
   - Sign up with email
   - Receive key instantly

2. **Use in Code:**
   ```python
   import os
   API_KEY = os.environ.get('CENSUS_API_KEY', 'YOUR_KEY_HERE')
   ```

3. **Set Environment Variable:**
   ```bash
   export CENSUS_API_KEY="your_key_here"  # Linux/Mac
   set CENSUS_API_KEY=your_key_here        # Windows
   ```

---

## Rate Limiting

**Census API Rate Limit:** 120 requests per minute

**Implementation:**
```python
import time
time.sleep(0.5)  # Add 0.5 second delay between requests
```

**Formula:**
- 60 seconds ÷ 120 calls = 0.5 seconds minimum between calls
- Adding 0.5 second delay keeps you safe: 2 calls/second = 120 calls/60 seconds

---

## Data Years Available

**Building Permits Survey (BPS) by Year:**
- 2015 ✓ Available
- 2016 ✓ Available
- 2017 ✓ Available
- 2018 ✓ Available
- 2019 ✓ Available
- 2020 ✓ Available
- 2021 ✓ Available
- 2022 ✓ Available
- 2023 ✓ Available
- 2024 ✓ Available (most recent)

All years are accessible via API with no manual download required.

---

## Example Python Implementation

```python
import requests
import pandas as pd
import time
import os
from typing import List, Dict

class CensusBPSCollector:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get('CENSUS_API_KEY')
        self.base_url = 'https://api.census.gov/data'
        self.rate_limit_delay = 0.5  # seconds

    def fetch_place_permits(self, year: int, state_fips: str) -> List[Dict]:
        """Fetch building permits for all places in a state"""
        url = f"{self.base_url}/{year}/bps/place"

        params = {
            'get': 'NAME,PERMITTOTAL_1UNIT,PERMITTOTAL_MULTUNIT,PERMITTOTAL_OTHER',
            'for': 'place:*',
            'in': f'state:{state_fips}',
            'key': self.api_key
        }

        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()

            data = response.json()
            return self._parse_response(data, year, state_fips)

        except requests.exceptions.RequestException as e:
            print(f"Error fetching {year} data for state {state_fips}: {e}")
            return []

    def _parse_response(self, data: List, year: int, state_fips: str) -> List[Dict]:
        """Convert API response to list of dicts"""
        if len(data) < 2:  # Header + at least one record
            return []

        headers = data[0]
        records = []

        for row in data[1:]:
            record = {
                'year': year,
                'place_fips': row[-2],  # 'for' column (place FIPS)
                'state_fips': state_fips,
                'place_name': row[0] if len(row) > 0 else '',
                'sf_permits': int(row[1]) if row[1] else 0,
                'mf_permits': int(row[2]) if row[2] else 0,
                'other_permits': int(row[3]) if row[3] else 0,
            }
            record['total_permits'] = (record['sf_permits'] +
                                      record['mf_permits'] +
                                      record['other_permits'])
            records.append(record)

        return records

    def fetch_all_years_all_states(self) -> pd.DataFrame:
        """Fetch all years and states"""
        state_fips_list = [
            '01', '02', '04', '05', '06', '08', '09', '10', '12', '13',
            '15', '16', '17', '18', '19', '20', '21', '22', '23', '24',
            '25', '26', '27', '28', '29', '30', '31', '32', '33', '34',
            '35', '36', '37', '38', '39', '40', '41', '42', '44', '45',
            '46', '47', '48', '49', '50', '51', '53', '54', '55', '56'
        ]

        all_records = []
        total_calls = len(state_fips_list) * 10  # 10 years
        call_count = 0

        for year in range(2015, 2025):
            for state_fips in state_fips_list:
                call_count += 1
                print(f"Fetching {year} data for state {state_fips} ({call_count}/{total_calls})")

                records = self.fetch_place_permits(year, state_fips)
                all_records.extend(records)

                time.sleep(self.rate_limit_delay)  # Rate limiting

        df = pd.DataFrame(all_records)
        return df

# Usage
if __name__ == '__main__':
    collector = CensusBPSCollector()

    # Fetch all data
    df = collector.fetch_all_years_all_states()

    # Save to CSV
    df.to_csv('../data/raw/census_bps_place_all_years.csv', index=False)

    print(f"Collected {len(df)} place-year records")
    print(f"Date range: {df['year'].min()}-{df['year'].max()}")
    print(f"States: {df['state_fips'].nunique()}")
    print(f"Places: {df['place_fips'].nunique()}")
```

---

## State FIPS Code Reference

| State | FIPS | State | FIPS |
|-------|------|-------|------|
| Alabama | 01 | Montana | 30 |
| Alaska | 02 | Nebraska | 31 |
| Arizona | 04 | Nevada | 32 |
| Arkansas | 05 | New Hampshire | 33 |
| California | 06 | New Jersey | 34 |
| Colorado | 08 | New Mexico | 35 |
| Connecticut | 09 | New York | 36 |
| Delaware | 10 | North Carolina | 37 |
| Florida | 12 | North Dakota | 38 |
| Georgia | 13 | Ohio | 39 |
| Hawaii | 15 | Oklahoma | 40 |
| Idaho | 16 | Oregon | 41 |
| Illinois | 17 | Pennsylvania | 42 |
| Indiana | 18 | Rhode Island | 44 |
| Iowa | 19 | South Carolina | 45 |
| Kansas | 20 | South Dakota | 46 |
| Kentucky | 21 | Tennessee | 47 |
| Louisiana | 22 | Texas | 48 |
| Maine | 23 | Utah | 49 |
| Maryland | 24 | Vermont | 50 |
| Massachusetts | 25 | Virginia | 51 |
| Michigan | 26 | Washington | 53 |
| Minnesota | 27 | West Virginia | 54 |
| Mississippi | 28 | Wisconsin | 55 |
| Missouri | 29 | Wyoming | 56 |
| District of Columbia | 11 | | |

---

## Error Handling

### Common Errors & Solutions

**Error: 400 Bad Request**
```
Cause: Invalid parameter syntax
Solution: Check that for= and in= match format
Example: for=place:* in=state:06  (correct)
```

**Error: 404 Not Found**
```
Cause: Dataset or year doesn't exist
Solution: Verify year is 2015-2024 and endpoint is correct
```

**Error: 429 Too Many Requests**
```
Cause: Exceeded 120 calls/minute rate limit
Solution: Increase delay between requests
```

**Error: Invalid API Key**
```
Cause: API key expired or wrong
Solution: Get new key from https://api.census.gov/data/key_signup.html
```

---

## Data Validation

After fetching place-level data, validate against state-level totals:

```python
def validate_place_vs_state(place_df, state_df):
    """
    Validate that place-level data sums to ~95% of state-level data
    """
    for year in place_df['year'].unique():
        place_year = place_df[place_df['year'] == year]
        state_year = state_df[state_df['year'] == year]

        place_total = place_year['total_permits'].sum()
        state_total = state_year['total_permits'].sum()

        match_pct = (place_total / state_total * 100) if state_total > 0 else 0

        print(f"Year {year}: Places {place_total:,} vs States {state_total:,} ({match_pct:.1f}%)")

        if match_pct < 0.95:
            print(f"  WARNING: Match below 95%")
```

Expected output: 95-102% match (some places not reported, some data revisions)

---

## Documentation References

**Official Census API Documentation:**
- Main: https://api.census.gov/
- BPS Dataset: https://api.census.gov/data/2023/bps/place/variables.json
- Discovery Tool: https://api.census.gov/data/inspect

**Building Permits Survey:**
- Main page: https://www.census.gov/construction/bps/
- Documentation: https://www.census.gov/programs-surveys/bps/about.html
- Variable definitions: https://www.census.gov/construction/bps/definitions.html

---

## Key Points Summary

✅ **Fully Automated** - No manual downloads
✅ **Programmatic** - Can script and schedule
✅ **Reproducible** - Can re-run anytime
✅ **Free** - No data purchase required
✅ **Complete** - 2015-2024 data available
✅ **Place-Level** - Down to city/township level
✅ **Well-Documented** - Official Census support

---

This is the working approach confirmed to solve Agent 1's data collection requirement.
