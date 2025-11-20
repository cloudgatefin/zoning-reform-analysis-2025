# AGENT 3: Expand City Reforms Database (30 → 100+ Cities)

**Target Environment:** Claude Code Web (independent session)
**Budget:** $0 (research + CSV creation, no APIs needed)
**Task:** Research and expand city_reforms.csv from 30 to 100+ cities with documented zoning reforms

---

## Self-Contained Task

Expand the zoning reform database by researching 70+ additional US cities with documented zoning reforms. Create structured CSV with reform details, years, and sources. Focus on cities where Census BPS data exists (from Phase 1.1).

**Deliverables:**
1. `data/raw/city_reforms_expanded.csv` - 100+ cities with reforms (updated from 30 original)
2. `data/raw/reform_research_notes.md` - Source documentation
3. Update dashboard to show reform status in place detail panel

---

## Data Schema

**Input:** Current reforms file at `data/raw/city_reforms.csv`

**Output:** Expanded file `data/raw/city_reforms_expanded.csv`

**CSV Format:**
```
state_fips,state_name,place_name,place_fips,reform_type,reform_year,
reform_name,description,source,research_notes
```

**Reform Types:**
- "ADU" - Accessory Dwelling Unit legalization
- "Upzoning" - Increasing allowed density
- "Zoning_Deregulation" - Removing/relaxing zoning restrictions
- "Height/Parking_Reduction" - Reducing height limits or parking requirements
- "Mixed_Use" - Allowing mixed-use development
- "Affordability_Mandate" - Affordable housing requirement
- "Fast_Track_Permitting" - Streamlined approval process
- "Density_Bonus" - Density bonus for affordability/green features
- "Other" - Other reforms

**Sample rows:**
```
06,California,Los Angeles,0644000,ADU,2021,
Accessory Dwelling Unit Law,Legalized ADU production citywide,
CA Department of Housing,SB 9 (state) + local expansion

06,California,Los Angeles,0644000,Upzoning,2021,
Transit-Oriented Zoning,Zoning near transit stations for 5+ units,
LA Planning,Specific plan adoption

36,New York,New York city,3651000,Zoning_Deregulation,2020,
Zoning Modernization,Updating 1961 zoning code sections,
NYC Planning,Citywide text amendments
```

---

## Research Instructions

### Phase 1: Identify Target Cities (30 min)

Start with these known reform cities documented in YIMBY/urban planning literature:

**West Region (CA, OR, WA):**
- San Francisco, CA - SB 9/10, parking reduction
- Berkeley, CA - Permitting reform, ADU expansion
- Oakland, CA - Zoning amendments, height changes
- San Diego, CA - Transit-oriented zoning
- Los Angeles, CA - ADU law, upzoning near transit
- Seattle, WA - Upzoning, MF-zoning
- Portland, OR - Density, infill zoning
- Eugene, OR - ADU/middle housing
- Denver, CO - Zoning modernization
- Minneapolis, MN - Single-family zoning repeal

**South Region (TX, NC, VA, FL):**
- Austin, TX - Affordability zoning, height changes
- Houston, TX - Non-zoned/flexible zoning (unique case)
- Charlotte, NC - Mixed-use zoning
- Raleigh, NC - ADU, upzoning
- Richmond, VA - Height limits, parking reduction
- Nashville, TN - Zoning modernization
- Dallas, TX - Zoning amendments
- Phoenix, AZ - ADU, infill zoning
- Tampa, FL - Mixed-use development
- Miami, FL - Transit zoning

**Northeast Region (NY, NJ, MA, CT):**
- New York City, NY - Zoning modernization efforts
- Boston, MA - ADU/accessory structures
- Philadelphia, PA - Mixed-use zoning
- New Haven, CT - Inclusionary zoning
- Jersey City, NJ - Mixed-use development
- Providence, RI - Zoning updates

And ~20-30 more from secondary research...

### Phase 2: Research Each City (1-2 min each)

For each city, find:
1. **Reform Type** (ADU, Upzoning, etc.)
2. **Year** (when adopted/effective)
3. **Reform Name** (official name or common reference)
4. **Description** (1-2 sentence impact)
5. **Source** (YIMBY Atlas, city planning website, news article, research paper)

**Research Sources** (all free/public):
- YIMBY Atlas (yimby.org/atlas) - Comprehensive reforms database
- City planning websites (planning.cityname.gov) - Official documents
- Nolan Gray/Strong Towns articles - Urban planning analysis
- Lincoln Institute reports - Zoning research
- Local news archives - Implementation coverage
- AARP Livability Index - Age-friendly zoning
- Bipartisan Policy Center reports - Housing policy

### Phase 3: Create Expanded CSV

Structure with required columns:
```
state_fips,state_name,place_name,place_fips,reform_type,
reform_year,reform_name,description,source,research_notes
```

**Requirements:**
- Must have valid state FIPS code (01-56)
- Must have place_name that matches Census name (if known)
- Leave place_fips blank if not matching Phase 1.1 data (will be joined later)
- Must have reform_year (4-digit year)
- Reform_type must match list above
- Description should be 1-2 sentences
- Source should cite specific source URL or document
- research_notes for any caveats or additional context

### Phase 4: Validate & Quality Check (20 min)

1. Check no duplicate (state_fips, place_name, reform_year) combinations
2. Check all reform_types are in allowed list
3. Check all years are between 2000-2024
4. Count total cities (goal: 100+)
5. Check geographic distribution (should have >10 states)
6. Document any uncertain data

---

## Implementation

### Create Expanded CSV Script

**File:** `scripts/24_expand_city_reforms.py`

```python
import pandas as pd
from pathlib import Path

# Load existing reforms
existing = pd.read_csv('data/raw/city_reforms.csv')

# Create new reforms from research
new_reforms = pd.DataFrame([
    {
        'state_fips': '06',
        'state_name': 'California',
        'place_name': 'San Francisco',
        'place_fips': '',
        'reform_type': 'ADU',
        'reform_year': 2018,
        'reform_name': 'ADU Legalization',
        'description': 'Legalized accessory dwelling units citywide with expedited permitting',
        'source': 'SF Planning Department',
        'research_notes': 'State law SB 9/10 enabled local action'
    },
    # ... add 70+ more cities from research
])

# Combine
all_reforms = pd.concat([existing, new_reforms], ignore_index=True)

# Remove duplicates (keep first occurrence)
all_reforms = all_reforms.drop_duplicates(
    subset=['state_fips', 'place_name', 'reform_year'],
    keep='first'
)

# Sort
all_reforms = all_reforms.sort_values(['state_name', 'place_name', 'reform_year'])

# Save
all_reforms.to_csv('data/raw/city_reforms_expanded.csv', index=False)

print(f"Created expanded reforms database:")
print(f"  Total cities: {all_reforms['place_name'].nunique()}")
print(f"  Total reforms: {len(all_reforms)}")
print(f"  States: {all_reforms['state_name'].nunique()}")
print(f"  Year range: {all_reforms['reform_year'].min()}-{all_reforms['reform_year'].max()}")

# Show summary
print(f"\nReforms by type:")
print(all_reforms['reform_type'].value_counts())
```

### Run Script

```bash
python scripts/24_expand_city_reforms.py
```

Output: `data/raw/city_reforms_expanded.csv` with 100+ cities

---

## Cities to Research (Sample - Add 70+ More)

### Currently Known (From Existing Data)
Already have 30 cities documented - verify and expand each.

### High-Priority Additions (Fast Growing, Strong Reform Track Records)

**ADU Reforms:**
- Bend, OR (2016)
- Sacramento, CA (2016)
- Olympia, WA (2018)
- Bozeman, MT (2017)
- Fort Collins, CO (2021)
- Indianapolis, IN (2019)
- Columbus, OH (2018)

**Upzoning/Density:**
- Minneapolis, MN (2019) - Landmark single-family zoning repeal
- Philadelphia, PA (2019)
- Toronto, ON (2022) - If including Canada
- Madison, WI (2020)
- Ann Arbor, MI (2020)
- Somerville, MA (2019)
- Cambridge, MA (2018)

**Mixed-Use/Mixed-Income:**
- Arlington, VA
- Washington, DC
- Bethesda, MD
- Santa Monica, CA
- Pasadena, CA
- Long Beach, CA

**Streamlined Permitting:**
- San Jose, CA
- Sunnyvale, CA
- Mountain View, CA
- Palo Alto, CA
- Cupertino, CA

### Secondary Cities (Research-Based)
Add 40+ more from Urban Institute, YIMBY Atlas, research papers

---

## Quality Checks

### Before Saving

```python
# Check 1: No duplicates
assert all_reforms.duplicated(
    subset=['state_fips', 'place_name', 'reform_year']
).sum() == 0

# Check 2: Valid reform types
valid_types = [
    'ADU', 'Upzoning', 'Zoning_Deregulation',
    'Height/Parking_Reduction', 'Mixed_Use',
    'Affordability_Mandate', 'Fast_Track_Permitting',
    'Density_Bonus', 'Other'
]
assert all_reforms['reform_type'].isin(valid_types).all()

# Check 3: Year range
assert (all_reforms['reform_year'] >= 1990).all()
assert (all_reforms['reform_year'] <= 2024).all()

# Check 4: FIPS codes
assert (all_reforms['state_fips'].str.len() == 2).all()

# Check 5: Geographic diversity
assert all_reforms['state_name'].nunique() >= 15  # At least 15 states

print("[OK] All quality checks passed!")
```

---

## API Route for Reforms

**File:** `app/app/api/places/[fips]/reforms/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parse/sync'

interface Reform {
  reform_type: string
  reform_year: number
  reform_name: string
  description: string
  source: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { fips: string } }
) {
  const fips = params.fips

  const filePath = path.join(
    process.cwd(),
    'data/raw/city_reforms_expanded.csv'
  )

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({
      fips,
      reforms: [],
      message: 'Reforms data not available'
    })
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const records = csv.parse(content, {
    columns: true,
    skip_empty_lines: true
  })

  const reforms: Reform[] = []

  for (const record of records) {
    if (record.place_fips === fips && record.place_fips) {
      reforms.push({
        reform_type: record.reform_type,
        reform_year: parseInt(record.reform_year),
        reform_name: record.reform_name,
        description: record.description,
        source: record.source
      })
    }
  }

  // Sort by year descending (most recent first)
  reforms.sort((a, b) => b.reform_year - a.reform_year)

  return NextResponse.json({
    fips,
    reforms,
    total: reforms.length
  })
}
```

### Update PlaceDetailPanel

In `PlaceDetailPanel.tsx`, replace the placeholder:

```typescript
// Add to state
const [reforms, setReforms] = useState<Reform[]>([])

// Add to useEffect
const reformsRes = await fetch(`/api/places/${placeFips}/reforms`)
if (reformsRes.ok) {
  const reformsData = await reformsRes.json()
  setReforms(reformsData.reforms)
}

// Replace the placeholder section with:
{reforms.length > 0 && (
  <div className="p-6 border-b border-gray-200">
    <h3 className="font-semibold text-gray-900 mb-4">
      Zoning Reforms ({reforms.length})
    </h3>

    <div className="space-y-3">
      {reforms.map((reform, idx) => (
        <div key={idx} className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">
                {reform.reform_name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {reform.description}
              </p>
            </div>
            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-200 text-blue-800">
              {reform.reform_year}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Type: {reform.reform_type} | Source: {reform.source}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## Research Strategy

**Best approach:**
1. Start with well-known reform cities (Minneapolis, San Francisco, etc.)
2. Use YIMBY Atlas as primary source
3. Cross-reference with city planning websites
4. Add ~10 cities per category (ADU, Upzoning, Mixed-Use, etc.)
5. Document sources for each reform
6. Quality check for accuracy

**Time-saving tips:**
- Copy from YIMBY Atlas systematically
- Use city planning websites for official confirmation
- Group by reform type (easier to research in bulk)
- Take notes on uncertain cases (add to research_notes column)

---

## Success Criteria

- [ ] Expanded CSV created with 100+ cities
- [ ] All rows have required columns
- [ ] No duplicate city-year-reform combinations
- [ ] All reform_types are valid
- [ ] All years between 1990-2024
- [ ] At least 15 different states
- [ ] Documented sources for each reform
- [ ] Quality checks pass
- [ ] File saved to `data/raw/city_reforms_expanded.csv`
- [ ] API route working
- [ ] PlaceDetailPanel shows reforms correctly

---

## Files Created/Modified

**New:**
- `data/raw/city_reforms_expanded.csv` (100+ cities)
- `scripts/24_expand_city_reforms.py` (50 lines)
- `data/raw/reform_research_notes.md` (documentation)
- `app/app/api/places/[fips]/reforms/route.ts` (60 lines)

**Modified:**
- `app/components/visualizations/PlaceDetailPanel.tsx` (add reforms section)
- `app/app/page.tsx` (if needed)

---

## Commit Message

```
Phase 1.2: Expand zoning reforms database from 30 to 100+ cities

Research and document comprehensive zoning reform data:
- Researched 70+ additional US cities with documented reforms
- Created expanded CSV: data/raw/city_reforms_expanded.csv
- Covers ADU legalization, upzoning, density bonus, mixed-use reforms
- Geographic coverage: 15+ states across US regions
- All reforms sourced and documented with citations
- Added API route: /api/places/[fips]/reforms
- Integrated reforms display into PlaceDetailPanel

Data:
- 100+ cities with zoning reform data
- 150+ documented reforms across types
- Years: 1990-2024 (focus on 2010+)
- Sources: YIMBY Atlas, city planning websites, research papers

Files:
- data/raw/city_reforms_expanded.csv (expanded database)
- scripts/24_expand_city_reforms.py (creation script)
- app/app/api/places/[fips]/reforms/route.ts (API endpoint)

Cost: $0 (research-based, no APIs)
Quality: All sources documented, accuracy verified
```

---

## Expected Runtime

- Research & data entry: 2-3 hours
- Script creation: 15 min
- Testing & validation: 15 min
- **Total: ~2.5-3 hours**

---

## Notes on Place FIPS Matching

After creation, there's an optional matching step:
- CSV has blank place_fips initially
- Can join with Phase 1.1 place_metrics_geocoded.csv to add FIPS codes
- This enables showing reforms for discovered places in dashboard

Script for matching:
```python
metrics = pd.read_csv('data/outputs/place_metrics_geocoded.csv')
reforms = pd.read_csv('data/raw/city_reforms_expanded.csv')

# Join on state_fips + place_name
merged = reforms.merge(
    metrics[['state_fips', 'place_name', 'place_fips']],
    on=['state_fips', 'place_name'],
    how='left'
)

# Save updated
merged.to_csv('data/raw/city_reforms_expanded.csv', index=False)
```

---

**Status:** Ready to begin
**Environment:** Claude Code Web (independent)
**Parallel with:** AGENT 1 and AGENT 2
**No dependencies** - works independently
