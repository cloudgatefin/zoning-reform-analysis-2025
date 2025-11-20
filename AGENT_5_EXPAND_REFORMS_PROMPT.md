# Agent 5: Expand Reforms Database (30 → 500+ Cities)

**Phase:** 2.1
**Priority:** HIGH
**Effort:** 6-8 hours (research-intensive)
**Independence:** High (no dependencies on other Phase 2 agents)
**Parallelizable:** Yes (can run simultaneously with Agents 6-7)

---

## Objective

Research and document 470+ additional US cities with zoning reforms, expanding the reforms database from 30 cities to 500+ cities. This will provide better training data for the ML model and higher coverage for policymakers.

---

## Current State

**Existing file:** `data/raw/city_reforms.csv` (30 cities)

**Current schema:**
```csv
city_name,state,reform_type,reform_year,reform_description,source_url,notes
Austin,Texas,Affordability Zoning,2021,Mandate 25% affordable units in new developments,https://...,Applicant fees reduced
Portland,Oregon,ADU Legalization,2020,Allow ADUs on any residential lot,https://...,No separate parking required
... (28 more cities)
```

**Cities currently covered:**
1. Austin, TX - Affordability
2. Portland, OR - ADU/Transit
3. Seattle, WA - Upzoning/ADU
4. San Francisco, CA - ADU/Parking
5. Denver, CO - Zoning Modernization
6. Minneapolis, MN - Single-family elimination
... (24 more)

**Total:** 30 cities

---

## What You Need to Do

### Step 1: Research Strategy

You'll research and document **470+ additional cities** with zoning reforms. Use multiple sources:

**Primary Sources:**
- Google Scholar (academic papers on zoning reform)
- NLIHC (National Low Income Housing Coalition)
- Lincoln Institute of Land Policy (zoning research)
- Furman Center for Real Estate (NYU)
- City planning department websites
- Zoning law change announcements

**Secondary Sources:**
- News articles (Local Housing News, CityLab, etc.)
- Urban Land Institute publications
- Regional planning associations
- State legislature websites
- HUD documentation

**Research Focus Areas:**
- Single-family zoning elimination
- ADU (accessory dwelling unit) legalization
- Height/density increases
- Parking requirement reductions
- Affordability requirements
- Mixed-use zoning
- Transit-oriented development

### Step 2: Data Collection

For each city, collect:

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| city_name | City name | "Minneapolis" | Yes |
| state | Two-letter state code | "MN" | Yes |
| reform_type | Category of reform | "Single-Family Elimination" | Yes |
| reform_year | Year reform passed/effective | 2020 | Yes |
| reform_description | 1-2 sentence description | "Eliminated single-family zoning citywide" | Yes |
| source_url | Primary source URL | "https://..." | Yes |
| notes | Additional context | "Part of 2040 Comprehensive Plan" | Optional |

**Reform Type Categories** (use these exactly):
- Accessory Dwelling Units (ADU)
- Single-Family Elimination
- Height/Density Increase
- Parking Reduction
- Affordability Requirements
- Mixed-Use Zoning
- Transit-Oriented Development (TOD)
- Zoning Modernization (general)
- Inclusionary Zoning
- Form-Based Code
- Other

### Step 3: Create Research Tracking

Create a working document to track your research:

**Format:** `PHASE_2_REFORMS_RESEARCH_LOG.md`

```markdown
# Phase 2.1 Reforms Research Log

## Research Status
- Target: 500+ cities
- Current: 30 cities
- Goal: Add 470+ more
- Progress: [X/470]

## Research Sources Used
- [ ] Google Scholar
- [ ] NLIHC reports
- [ ] Lincoln Institute
- [ ] City planning sites
- [ ] News articles

## Cities Found (sorted by state)

### Alabama (X cities)
- [City Name] - [Reform Type] - [Year] - [Source]

### Alaska (X cities)
- [City Name] - [Reform Type] - [Year] - [Source]

... (all 50 states)

## Key Findings
- Most common reforms: ADU, Height increases
- States with most reforms: CA, OR, WA, CO, MN, etc.
- Earliest reforms: 2010s (San Francisco)
- Most recent: 2024
- Research progress: [percentage]
```

### Step 4: Build the Expanded CSV

Create `data/raw/city_reforms_expanded.csv` with:

**Append to existing 30 cities:**
```csv
city_name,state,reform_type,reform_year,reform_description,source_url,notes
Austin,Texas,Affordability Zoning,2021,Mandate 25% affordable units in new developments,https://...,Applicant fees reduced
Portland,Oregon,ADU Legalization,2020,Allow ADUs on any residential lot,https://...,No separate parking required
... (original 30)
... (add 470+ new cities here)
```

**CSV Requirements:**
- UTF-8 encoding
- Proper quoting for special characters
- No missing required fields
- Unique city-state combinations (no duplicates)
- URLs should be full and valid

### Step 5: Data Quality Validation

Before finalizing, validate:

```python
import pandas as pd

df = pd.read_csv('data/raw/city_reforms_expanded.csv')

# Check 1: No missing required fields
assert df[['city_name', 'state', 'reform_type', 'reform_year', 'reform_description', 'source_url']].notna().all().all()

# Check 2: No duplicates (city-state pairs)
assert not df.duplicated(subset=['city_name', 'state']).any()

# Check 3: Reform years are reasonable (2000-2024)
assert (df['reform_year'] >= 2000) & (df['reform_year'] <= 2024).all()

# Check 4: Valid reform types
valid_types = ['Accessory Dwelling Units (ADU)', 'Single-Family Elimination', 'Height/Density Increase', ...]
assert df['reform_type'].isin(valid_types).all()

# Results
print(f"✓ {len(df)} cities")
print(f"✓ {df['state'].nunique()} states")
print(f"✓ {df['reform_type'].nunique()} reform types")
print(f"✓ Reform years: {df['reform_year'].min()}-{df['reform_year'].max()}")
```

---

## Data Dictionary

**city_name** (string)
- City name as officially recognized
- Examples: "Austin", "Portland", "San Francisco"

**state** (string)
- Two-letter state code (TX, OR, CA, etc.)
- Use standard USPS codes

**reform_type** (string)
- Category of zoning reform
- Must be one of the defined categories
- Examples: "Accessory Dwelling Units (ADU)", "Single-Family Elimination"

**reform_year** (integer)
- Year reform was passed or became effective
- Range: 2000-2024
- Use year reform took effect, not when passed

**reform_description** (string)
- 1-2 sentence plain English description
- Describe what the reform does
- Example: "Allows ADUs on any residential lot without separate parking"

**source_url** (string)
- URL to primary source (government, academic, or news)
- Should be accessible and relevant
- Examples: city planning website, academic paper, news article

**notes** (string, optional)
- Additional context (part of comprehensive plan, linked reforms, etc.)
- Keep to one sentence
- Optional field

---

## Research Tips

### High-Yield Sources

**For comprehensive lists:**
- NLIHC Zoning Reform Tracker (if available)
- Lincoln Institute resources
- State housing finance agency websites
- State legislature bill tracking
- County planning associations

**For case studies:**
- Academic databases (Google Scholar, JSTOR)
- Planning magazine archives
- Local government conference proceedings
- HUD policy reports

**For recent reforms (2023-2024):**
- State HB/SB tracking websites
- City council meeting minutes
- Local news archives (search "zoning reform" + city)
- Urban Land Institute member cities

### Research Workflow

1. **Create spreadsheet** with columns: City | State | Reform Type | Year | Notes | Source
2. **Search systematically** (state by state or region by region)
3. **Document sources** as you go (don't lose URLs!)
4. **Cross-reference** to avoid duplicates
5. **Validate data** before finalizing CSV

### Time Management

- **Target:** 470+ cities = ~9 cities per hour
- **Realistic:** 5-6 cities per hour with proper sourcing
- **Total time:** 6-8 hours of focused research
- **Breaks:** Take 15-min breaks every 2 hours

---

## Deliverables

### Final File: `data/raw/city_reforms_expanded.csv`

**Requirements:**
- [ ] 500+ total cities (30 existing + 470+ new)
- [ ] All required fields populated
- [ ] No duplicate city-state pairs
- [ ] Valid URLs for sources
- [ ] Diverse reform types represented
- [ ] Spread across 40+ states
- [ ] Years 2000-2024 represented
- [ ] UTF-8 encoding
- [ ] Proper CSV formatting

### Documentation: `docs/city_reforms_sources.md`

**Contents:**
- [ ] Total cities count
- [ ] States represented
- [ ] Reform types breakdown (with counts)
- [ ] Sources used (with descriptions)
- [ ] Data quality notes
- [ ] Any research limitations
- [ ] Recommendations for future expansion

---

## Execution Steps

### Step 1: Setup (15 minutes)
```bash
# Create working directory
mkdir -p research/phase2
cd research/phase2

# Load existing CSV to see schema
head -5 ../../data/raw/city_reforms.csv

# Create research tracker
touch RESEARCH_LOG.md
```

### Step 2: Research (5-6 hours)
- Systematically research cities
- Document each finding
- Update tracking spreadsheet
- Take breaks

### Step 3: Build CSV (30 minutes)
```bash
# Create expanded CSV
# Copy existing 30 cities
# Add 470+ new cities
# Save as data/raw/city_reforms_expanded.csv
```

### Step 4: Validate Data (30 minutes)
```bash
python3 << 'EOF'
import pandas as pd

df = pd.read_csv('data/raw/city_reforms_expanded.csv')
print(f"Total cities: {len(df)}")
print(f"States: {df['state'].nunique()}")
print(f"Reform types: {df['reform_type'].nunique()}")
print(f"\nReform type counts:\n{df['reform_type'].value_counts()}")
print(f"\nState counts:\n{df['state'].value_counts()}")
EOF
```

### Step 5: Document Results (30 minutes)
- Create `docs/city_reforms_sources.md`
- Summarize findings
- List sources used
- Document any limitations

### Step 6: Commit Changes (15 minutes)
```bash
git add data/raw/city_reforms_expanded.csv
git add docs/city_reforms_sources.md
git add PHASE_2_REFORMS_RESEARCH_LOG.md
git commit -m "Agent 5: Expand reforms database to 500+ cities"
git push origin main
```

---

## Success Criteria

- [x] 500+ cities documented
- [x] All required fields populated
- [x] No duplicate city-state pairs
- [x] Diverse reform types (5+ types)
- [x] Geographic spread (30+ states)
- [x] Valid sources for all entries
- [x] Data quality validated
- [x] CSV properly formatted
- [x] Documentation complete
- [x] Code committed to git

---

## Troubleshooting

### "I can't find enough cities"

**Solution:** You don't need to find exactly 470. Finding 200-300 more cities is still a 7-10x improvement. Focus on quality over quantity.

### "Many cities don't have documented reforms"

**Solution:** That's actually valuable data. You can research what zoning changes DID happen (even without formal "reform" label). Check:
- Comprehensive plan updates
- Zoning code rewrites
- Specific code amendments
- Planning commission decisions

### "I found a city but can't find a good source"

**Solution:** Use this priority order:
1. Official city planning website (best)
2. City council meeting minutes
3. Academic paper or policy report
4. News article from reputable source
5. If still can't find: Skip it (don't guess)

### "URLs keep changing/breaking"

**Solution:** Use Archive.org Wayback Machine to preserve URLs. Example:
- Original: `https://austin.gov/zoning-reform`
- Archive: `https://web.archive.org/web/20210601000000*/austin.gov/zoning-reform`

---

## Expected Output

After 6-8 hours of research:

**data/raw/city_reforms_expanded.csv**
```
500+ rows × 7 columns
States: 40+ represented
Reform types: 8+ types
Coverage: Every region of US
Quality: All fields validated
Sources: All verified
```

**docs/city_reforms_sources.md**
```
Summary of research
Sources listed
Statistics provided
Limitations documented
```

---

## What Happens Next

After you finish Agent 5:

1. **Agent 6** (ML Enhancement) waits for your CSV file
   - Will use `city_reforms_expanded.csv` to retrain model on 500+ cities
2. **Agent 3** uses your data for impact calculator
3. **Agent 4** integrates everything for production

Your work directly enables the ML model improvement and impact calculator.

---

## Questions?

If you need clarification:
- Check existing `data/raw/city_reforms.csv` for format examples
- Review PHASE_2_AGENT_STRATEGY.md for project context
- Ask for specific cities/states to research

---

## Ready to Start?

1. Open this prompt in Claude Code Web
2. Create research workspace
3. Start systematic research (state by state recommended)
4. Document as you go
5. Build final CSV when research complete
6. Validate data quality
7. Commit changes when done

**Estimated completion:** 6-8 hours focused research

**Expected impact:** 500+ cities for ML model training (vs 30 now)

Let's expand the reforms database! 🚀
