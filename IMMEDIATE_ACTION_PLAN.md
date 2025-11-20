# Immediate Action Plan: Next 30 Days

**Date:** 2025-11-19
**Urgency:** HIGH - Execute this plan immediately
**Timeline:** 4 weeks to MVP with 20,000 places

---

## Week 1: Foundation Setup (This Week!)

### Task 1.1: PostgreSQL Database Migration (2 days)
**Owner:** Database/DevOps Lead
**Effort:** 15 hours

**Steps:**
```bash
# 1. Set up PostgreSQL locally (or use managed service)
# Option A: Local (PostgreSQL 15+)
brew install postgresql@15
pg_ctl -D /usr/local/var/postgres start

# Option B: Docker (recommended for team consistency)
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15

# 2. Create schema (see ROADMAP_ANALYSIS_AND_EXECUTION_PLAN.md)
psql -f scripts/00_create_schema.sql

# 3. Set up connection pool
# Update app/.env with POSTGRES_URL

# 4. Migrate existing CSV data
python scripts/25_migrate_csv_to_postgres.py

# 5. Verify data integrity
python scripts/validate_data_quality.py
```

**Deliverable:** PostgreSQL running with existing 36-jurisdiction data

---

### Task 1.2: Meilisearch Setup (1 day)
**Owner:** Backend Lead
**Effort:** 8 hours

**Steps:**
```bash
# 1. Install Meilisearch (or use cloud)
brew install meilisearch
meilisearch --db-path ./meilisearch-data

# 2. Create search index
curl -X POST 'http://localhost:7700/indexes' \
  -H 'Content-Type: application/json' \
  -d '{
    "uid": "places",
    "primaryKey": "place_fips"
  }'

# 3. Configure searchable attributes
curl -X PATCH 'http://localhost:7700/indexes/places/settings/searchable-attributes' \
  -H 'Content-Type: application/json' \
  -d '[
    "place_name",
    "state_name",
    "county_name"
  ]'

# 4. Index initial data
python scripts/26_index_places_meilisearch.py

# 5. Set up Next.js API route for search
# Create: app/app/api/search/[query]/route.ts
```

**Deliverable:** Meilisearch running, places indexed and searchable

---

### Task 1.3: Document Phase 1 Data Architecture (1 day)
**Owner:** Technical Lead
**Effort:** 5 hours

**Deliverable:** Document explaining:
- Data sources (Census BPS bulk download)
- ETL pipeline design
- Data quality checks
- Schedule (daily/weekly updates)

**Create file:** `docs/PHASE_1_DATA_ARCHITECTURE.md`

---

### Week 1 Deliverables
- ✅ PostgreSQL with existing data
- ✅ Meilisearch search index
- ✅ Data architecture documented
- ✅ Team aligned on Phase 1 approach
- **Go/No-Go Decision:** Ready for Phase 1 sprint? YES ✅

---

## Week 2-3: Phase 1 Execution - Census Data Pipeline

### Task 2.1: Fetch Census BPS Place Data (5 days)
**Owner:** Data Engineer
**Effort:** 40 hours

**Approach: Bulk Download (Recommended)**

```python
# Script: scripts/20_fetch_place_permits_bulk.py
# Purpose: Download all Census BPS place-level data

import requests
import os
import pandas as pd
from pathlib import Path

BASE_URL = "https://www2.census.gov/econ/bps/Place/"
YEARS = range(2015, 2025)  # Start with recent data

def download_place_files():
    """Download annual place permit files"""
    for year in YEARS:
        filename = f"pl{year}a.txt"
        url = f"{BASE_URL}Annual/{filename}"

        # Download with resume capability
        download_file(url, f"data/raw/census_bps/{filename}")
        print(f"Downloaded {filename}")

def download_file(url, filepath):
    """Download with progress tracking"""
    Path(filepath).parent.mkdir(parents=True, exist_ok=True)

    response = requests.get(url, stream=True)
    with open(filepath, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

# Expected output:
# data/raw/census_bps/
# ├── pl2015a.txt (10-15 MB each)
# ├── pl2016a.txt
# ├── ...
# └── pl2024a.txt
# Total: ~100-150 MB
```

**Success Criteria:**
- [ ] All files downloaded (2015-2024)
- [ ] Files verified (checksums or file size sanity checks)
- [ ] Data accessible for parsing

---

### Task 2.2: Parse Census Fixed-Width Format (5 days)
**Owner:** Data Engineer
**Effort:** 30 hours

```python
# Script: scripts/21_parse_place_data_format.py
# Purpose: Parse Census fixed-width format into CSV

import pandas as pd
from io import StringIO

# Census BPS record layout
PLACE_LAYOUT = {
    'FIPS_Code': (0, 7),        # Positions 1-7
    'Place_Name': (7, 62),      # Positions 8-62
    'Permits_1Unit': (62, 68),  # Positions 63-68
    'Permits_2Unit': (68, 74),  # etc.
    'Permits_3to4Unit': (74, 80),
    'Permits_5Plus': (80, 86),
    'Year': (86, 90)
}

def parse_place_file(filepath):
    """Parse fixed-width file into DataFrame"""
    with open(filepath, 'r') as f:
        lines = f.readlines()

    records = []
    for line in lines:
        record = {}
        for field, (start, end) in PLACE_LAYOUT.items():
            value = line[start:end].strip()
            record[field] = value
        records.append(record)

    return pd.DataFrame(records)

# For each year's file:
# 1. Parse fixed-width format
# 2. Validate fields
# 3. Export to CSV
# 4. Load to PostgreSQL

# Expected output: 20,000+ places × 10 years = 200,000 records
```

**Success Criteria:**
- [ ] All files parsed without errors
- [ ] 200,000+ records in database
- [ ] Data types correct (numeric, date, string)
- [ ] No obvious data quality issues

---

### Task 2.3: Build Place Metrics (2 days)
**Owner:** Data Analyst
**Effort:** 20 hours

```python
# Script: scripts/22_build_place_metrics.py
# Purpose: Compute permit growth rates, MF share, etc.

def compute_place_metrics(df):
    """Compute metrics for each place"""

    metrics = []
    for place_fips, group in df.groupby('place_fips'):
        # Sort by year
        group = group.sort_values('year')

        # Calculate growth rate
        permits_2015 = group[group['year'] == 2015]['total_permits'].values
        permits_2024 = group[group['year'] == 2024]['total_permits'].values

        if len(permits_2015) > 0 and len(permits_2024) > 0:
            growth_pct = ((permits_2024[0] - permits_2015[0]) / permits_2015[0]) * 100
        else:
            growth_pct = None

        # Multi-family share
        mf_total = group['permits_2plus'].sum()
        total = group['total_permits'].sum()
        mf_share = (mf_total / total * 100) if total > 0 else None

        metrics.append({
            'place_fips': place_fips,
            'permits_growth_2015_2024_pct': growth_pct,
            'mf_share_pct': mf_share,
            'avg_annual_permits': group['total_permits'].mean(),
            'recent_trend': calculate_trend(group.tail(3))
        })

    return pd.DataFrame(metrics)
```

**Success Criteria:**
- [ ] Growth rates computed for all places
- [ ] MF share calculated
- [ ] No NaN values in key fields
- [ ] Metrics exported to database

---

### Task 2.4: Geocoding (3 days)
**Owner:** Data Engineer
**Effort:** 20 hours

```python
# Script: scripts/23_geocode_places.py
# Purpose: Add latitude/longitude for each place

# Option A: Use Census GEOID (has built-in lat/lon in metadata files)
# Option B: Geopy library (Google/Nominatim)

from geopy.geocoders import Nominatim
import time

geocoder = Nominatim(user_agent="zoning-dashboard")

for place_name, state_name in places:
    try:
        location = geocoder.geocode(f"{place_name}, {state_name}")
        if location:
            update_database(place_name, state_name,
                          lat=location.latitude,
                          lon=location.longitude)
        time.sleep(1)  # Rate limit (free tier)
    except Exception as e:
        print(f"Error geocoding {place_name}: {e}")

# OR use Census FTP location file:
# https://www2.census.gov/geo/docs/reference/cenpop2020/place_codes.txt
```

**Success Criteria:**
- [ ] >95% of places have lat/lon
- [ ] Coordinates validated (within US bounds)
- [ ] Geocoding quality flagged if needed

---

### Task 2.5: Link Existing 36 Jurisdictions (1 day)
**Owner:** Data Analyst
**Effort:** 8 hours

Match existing city data to Census place codes:
```python
# Script: scripts/24_match_reforms_to_places.py

# Load existing reforms
existing_reforms = pd.read_csv('data/raw/city_reforms.csv')

# Match to Census places
for _, reform in existing_reforms.iterrows():
    place_matches = find_census_place_match(
        reform['city_name'],
        reform['state_name']
    )

    # Insert into reforms table
    if place_matches:
        insert_reform_to_database(reform, place_matches[0])
```

**Success Criteria:**
- [ ] All 30 existing cities linked
- [ ] Match quality high (>90% confidence)
- [ ] Reformdata now queryable by place_fips

---

### Week 2-3 Deliverables
- ✅ 20,000+ places in PostgreSQL
- ✅ All 10 years of data (2015-2024)
- ✅ Permits, MF share, growth rates computed
- ✅ Geocoding complete (>95% coverage)
- ✅ Existing 30 cities linked
- **Milestone:** Data foundation complete! 🎉

---

## Week 4: Search & Discovery UX

### Task 3.1: Place Search Component (2 days)
**Owner:** Frontend Lead
**Effort:** 16 hours

```typescript
// app/components/dashboard/PlaceSearch.tsx

import { useState } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';

export function PlaceSearch({ onPlaceSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      const response = await fetch(
        `/api/search/${encodeURIComponent(debouncedQuery)}`
      );
      const data = await response.json();
      setResults(data.results);
      setLoading(false);
    };

    search();
  }, [debouncedQuery]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search places..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded shadow-lg">
          {results.map((place) => (
            <button
              key={place.place_fips}
              onClick={() => onPlaceSelect(place)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              <strong>{place.place_name}</strong>, {place.state_name}
              <br />
              <small className="text-gray-500">
                {place.permits_2024} permits (2024)
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Task 3.2: API Search Endpoint (1 day)
**Owner:** Backend Lead
**Effort:** 8 hours

```typescript
// app/api/search/[query]/route.ts

import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { query: string } }
) {
  const searchQuery = decodeURIComponent(params.query);

  // Query Meilisearch
  const response = await fetch('http://localhost:7700/indexes/places/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: searchQuery,
      limit: 20,
      offset: 0,
      attributesToHighlight: ['place_name', 'state_name']
    })
  });

  const data = await response.json();

  return NextResponse.json({
    results: data.results.map((place) => ({
      place_fips: place.place_fips,
      place_name: place.place_name,
      state_name: place.state_name,
      permits_2024: place.recent_permits,
      permits_growth_pct: place.growth_rate,
      lat: place.lat,
      lon: place.lon
    }))
  });
}
```

---

### Task 3.3: Place Detail Page (2 days)
**Owner:** Frontend Lead
**Effort:** 20 hours

```typescript
// app/pages/place/[state]/[city].tsx

export async function getServerSideProps(context) {
  const { state, city } = context.params;

  const place = await db.query(
    'SELECT * FROM places WHERE state_code = $1 AND slug = $2',
    [state, city]
  );

  const permits = await db.query(
    'SELECT * FROM permits WHERE place_fips = $1 ORDER BY year DESC',
    [place.place_fips]
  );

  const reforms = await db.query(
    'SELECT * FROM reforms WHERE place_fips = $1',
    [place.place_fips]
  );

  return {
    props: { place, permits, reforms },
    revalidate: 86400 // ISR: revalidate every 24 hours
  };
}

export default function PlacePage({ place, permits, reforms }) {
  return (
    <div className="container">
      {/* Place header */}
      <div className="mb-8">
        <h1>{place.place_name}, {place.state_name}</h1>
        <p className="text-gray-600">
          Population: {place.population.toLocaleString()}
        </p>
      </div>

      {/* Permit trends */}
      <PermitTrend data={permits} />

      {/* Reform history */}
      {reforms.length > 0 && (
        <ReformHistory reforms={reforms} />
      )}

      {/* Comparison to state average */}
      <Comparison place={place} />
    </div>
  );
}
```

---

### Week 4 Deliverables
- ✅ Place search working (Meilisearch)
- ✅ Place detail pages for all 20,000 places
- ✅ Permit trend visualization
- ✅ Reform history display
- ✅ State/national comparisons
- **Milestone:** MVP Complete! 20,000 searchable places 🎉

---

## Success Metrics After 4 Weeks

### Data Metrics
- ✅ 20,000 places in PostgreSQL
- ✅ 200,000+ permit records
- ✅ 10 years of historical data
- ✅ >95% geocoding coverage
- ✅ 30+ reform linkages

### Technical Metrics
- ✅ Search <100ms latency
- ✅ Place pages <2s load time
- ✅ Database indexes optimized
- ✅ API endpoints documented
- ✅ Data pipeline automated

### Business Metrics
- ✅ 20,000 places searchable
- ✅ 10x increase in addressable market
- ✅ Competitive moat established
- ✅ Foundation for future phases

---

## Next Steps (After Week 4)

### Phase 2 (Weeks 5-8): Reform Expansion
- Integrate YIMBY Action Tracker
- Add Urban Institute HIRP data
- Expand to 200+ cities with reforms

### Phase 3 (Weeks 9-12): ML Upgrade
- Retrain model on 200+ cities
- Implement Event Study method
- Build scenario modeling tool

### Phase 4 (Weeks 13+): Policymaker Dashboard
- Jurisdiction-specific dashboards
- Scenario modeling interface
- Research API

---

## Resources Needed

### Infrastructure
- PostgreSQL 15+
- Meilisearch
- Mapbox GL JS
- Vercel/hosting

### Team
- 1 Data Engineer (Weeks 1-3)
- 1 Backend Engineer (Weeks 1-4)
- 1 Frontend Engineer (Weeks 2-4)
- 1 DevOps/DBA (ongoing)

### Data Sources
- Census BPS (free)
- GEOID file (free)
- Place codes (free)

### Budget (if contracted)
- Weeks 1-4: ~$25-35K (100-140 hours)
- Weeks 5-12: ~$35-50K (200-250 hours)
- Total roadmap: ~$90K

---

## Go/No-Go Checklist

Before starting Week 1, confirm:

- [ ] PostgreSQL purchased/configured
- [ ] Meilisearch path decided
- [ ] Team assigned and committed
- [ ] PRODUCT_ROADMAP reviewed and approved
- [ ] Success metrics defined
- [ ] Timeline approved
- [ ] Budget approved

---

## Status: READY TO EXECUTE

**All planning complete. Ready to begin Week 1 immediately.**

**Decision Required:**
1. Proceed with 4-week MVP plan?
2. Assign team members?
3. Confirm budget/resources?

**If YES:** Begin Task 1.1 (PostgreSQL migration) TODAY.

---

**Next Meeting:** After Week 1 to review Foundation Setup completion

