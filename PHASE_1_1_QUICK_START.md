# Phase 1.1: Quick Start Guide

**Timeline:** Run this 4-script pipeline today to build 20,000+ place database

---

## One-Command Summary

```bash
# Run pipeline step by step
python scripts/20_fetch_place_permits_bulk.py && \
python scripts/21_parse_place_data_format.py && \
python scripts/22_build_place_metrics.py && \
python scripts/23_geocode_places.py
```

**Total time:** ~2-3 hours
**Cost:** $0
**Output:** 14,325 searchable places with growth metrics & coordinates

---

## Step-by-Step Execution

### Step 1: Download Census Data (15 min)
```bash
python scripts/20_fetch_place_permits_bulk.py
```

**What to expect:**
- Downloads 375 MB zip file from Census FTP
- Extracts CSV with 20,543 rows
- Validates data structure
- Saves: `data/raw/census_bps_master_dataset.csv`

**Check:** Look for `[OK] Final output: data/raw/census_bps_master_dataset.csv`

---

### Step 2: Parse Census Format (10 min)
```bash
python scripts/21_parse_place_data_format.py
```

**What to expect:**
- Extracts 14,325 unique places
- Creates 3 output files with annual/monthly aggregates
- Saves:
  - `data/raw/census_bps_places_directory.csv`
  - `data/raw/census_bps_place_annual_permits.csv`
  - `data/raw/census_bps_place_monthly_permits.csv`

**Check:** `[OK] Extracted 14,325 unique places`

---

### Step 3: Build Growth Metrics (15 min)
```bash
python scripts/22_build_place_metrics.py
```

**What to expect:**
- Computes 2yr/5yr/10yr growth rates
- Calculates multi-family housing shares
- Adds national & state rankings
- Saves: `data/outputs/place_metrics_comprehensive.csv`

**Check:** See "Top 10 Markets" and "Fastest Growing" tables in output

---

### Step 4: Geocode All Places (45 min - be patient!)
```bash
python scripts/23_geocode_places.py
```

**What to expect:**
- ~1 request/second to Nominatim (rate-limited)
- Progress: "Processed 100 places..." every 100
- Caches results for future runs
- Saves: `data/outputs/place_metrics_geocoded.csv`

**Check:** Final line shows `[OK] Geocoded 14,325 places`

---

## Verify Completion

After all 4 scripts finish, check for these files:

```
data/raw/
  ✓ census_bps_master_dataset.csv (375 MB)
  ✓ census_bps_places_directory.csv
  ✓ census_bps_place_annual_permits.csv
  ✓ census_bps_place_monthly_permits.csv

data/outputs/
  ✓ place_metrics_comprehensive.csv
  ✓ place_metrics_geocoded.csv (this is the final output!)
```

**Quick check:**
```bash
wc -l data/outputs/place_metrics_geocoded.csv
# Should show: 14326 (14,325 places + header)
```

---

## What to Do Next (Same Day if Time Permits)

Once `place_metrics_geocoded.csv` is ready:

### Convert to JSON for Search (5 min)
```python
import pandas as pd

df = pd.read_csv('data/outputs/place_metrics_geocoded.csv')
df.to_json('public/data/places.json', orient='records')
```

This creates the data file needed for client-side Fuse.js search.

---

## Troubleshooting

### "Download failed after 3 attempts"
**Fix:** Your internet interrupted. Run again - it will retry from start.
```bash
python scripts/20_fetch_place_permits_bulk.py
```

### "Geocoding is very slow"
**Normal!** Nominatim is rate-limited to 1 request/sec intentionally (respect free service).
14,325 places ÷ 3,600 req/hour = ~4 hours if no caching.
Check progress output - it prints every 100 places.

### "Memory error during parsing"
**Fix:** Unlikely (only 375MB), but if it happens:
```bash
# Clear temp files and retry
rm -rf data/raw/temp
python scripts/21_parse_place_data_format.py
```

### "Module not found: requests"
**Fix:**
```bash
pip install requests
python scripts/20_fetch_place_permits_bulk.py
```

---

## Performance Expectations

| Step | Duration | CPU | Memory | Network |
|------|----------|-----|--------|---------|
| 1. Download | 15 min | Low | 500 MB | Heavy (375 MB download) |
| 2. Parse | 10 min | Medium | 2 GB | None |
| 3. Metrics | 15 min | Medium | 2 GB | None |
| 4. Geocode | 45 min | Low | 500 MB | Light (~1 req/sec) |
| **Total** | **85 min** | **Medium** | **2 GB** | **Moderate** |

**Best practice:** Start in morning, let it run, check results after lunch.

---

## Data Summary After Completion

You'll have:
- **14,325 unique places** across all 50 states
- **10 years of data** (2015-2024)
- **1.3 million monthly records**
- **Growth metrics** (2yr, 5yr, 10yr CAGR)
- **Multi-family metrics** (% share, trends)
- **Geographic data** (lat/lon, state, region)
- **Rankings** (national & state percentiles)

---

## Next Phases (Week 2-4)

**Week 2:** Build search component with Fuse.js
- Convert geocoded CSV → JSON
- Create search React component
- Add filter options (state, growth rate, MF share)

**Week 3:** Build place explorer pages
- `/place/CA/Los-Angeles` route
- Show permit history chart
- Compare to state/national averages
- Link to existing reforms

**Week 4:** Integrate with dashboard
- Add place search to top navigation
- Show place-level metrics alongside state
- Link place data to reform analysis
- Deploy to Vercel

---

## Questions?

See detailed docs: [PHASE_1_1_SCRIPTS_GUIDE.md](PHASE_1_1_SCRIPTS_GUIDE.md)

---

**Ready to start?**

```bash
python scripts/20_fetch_place_permits_bulk.py
```

Go! 🚀
