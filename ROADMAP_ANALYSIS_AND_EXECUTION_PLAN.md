# PRODUCT_ROADMAP Review & Optimal Execution Plan

**Date:** 2025-11-19
**Status:** Strategic Analysis Complete
**Recommendation:** Phased Approach with Priority-Based Sequencing

---

## Executive Summary

The PRODUCT_ROADMAP provides a transformative vision: expanding from 30 catalogued cities to **20,000+ places** with intelligent search, comprehensive reform tracking, and city-level ML predictions. This is strategically sound and technically achievable, but requires careful sequencing to maximize impact with available resources.

### Roadmap Assessment: ✅ STRATEGIC & ACTIONABLE

**Strengths:**
- ✅ Clear vision with quantified targets (20,000 places, 500+ reforms, R² > 0.6)
- ✅ Grounded in real data sources (Census BPS has 45 years of historical data)
- ✅ Addresses critical gap (local/place-level analysis vs. state-only)
- ✅ Policymaker-centric use cases
- ✅ Realistic technical approach
- ✅ Phased execution (4 quarters)

**Challenges:**
- Data volume scaling (20,000 places = ~70GB uncompressed)
- Reform catalog curation (500+ cities requires significant research)
- ML model training with geographic data (spatial autocorrelation issues)
- Frontend performance with large datasets
- Real-time data refresh pipeline

---

## Roadmap Overview & Scope

### Proposed 4-Phase Plan (12 Weeks / 3 Months)

| Phase | Theme | Duration | Scope | Expected Impact |
|-------|-------|----------|-------|-----------------|
| **Phase 1** | "Make Every City Searchable" | Weeks 1-3 | 20,000 places + search | +100x user base reach |
| **Phase 2** | "Comprehensive Reform Intelligence" | Weeks 4-6 | 500+ reforms + impact calculator | +16x reform coverage |
| **Phase 3** | "Credible Predictions" | Weeks 7-9 | ML model upgrade + 3 causal methods | R² -0.77 → +0.6+ |
| **Phase 4** | "Insights to Action" | Weeks 10-12 | Jurisdiction dashboard + scenario modeling | Policymaker decision tool |

**Total Effort Estimate:** 200-300 hours (~8-12 weeks full-time)

---

## Current State vs. Vision State

### Current Capabilities (Today)
- ✅ 53 states baseline metrics
- ✅ 36 jurisdictions (6 states + 30 cities) with detailed analysis
- ✅ 3 API endpoints functional
- ✅ 2 causal inference methods (DiD + SCM, r=0.99)
- ✅ ML model V3 (36 samples, R² = -0.77)
- ✅ Responsive dashboard
- ⚠️ Manual city cataloging
- ⚠️ Limited search capability
- ⚠️ State-level focus

### Vision State (After Roadmap)
- 20,000+ places with permit data
- 500+ cities with reform documentation
- 5+ data sources integrated
- ML model trained on 500+ cities
- R² > 0.6 expected
- Full search/discovery UX
- Jurisdiction-specific dashboards
- Scenario modeling capability
- Policymaker decision support

---

## Detailed Roadmap Analysis

### Phase 1: Place-Level Data Foundation ⭐ HIGHEST PRIORITY

**Duration:** 2-3 weeks | **Effort:** HIGH | **Impact:** TRANSFORMATIVE

#### 1.1 Census BPS Place Data Pipeline - CRITICAL

**Why This First:**
- Unlocks 20,000+ places automatically (eliminates manual work)
- Census data is authoritative and complete (1980-2024)
- Creates foundation for all downstream analysis
- Enables scale that impresses policymakers

**Current Situation:**
- You have scripts (11_fetch_city_permits_api.py) for API approach
- Roadmap suggests bulk download from Census FTP as alternative
- Both are valid; API is real-time, bulk download is faster

**Recommended Approach:**
```
Option A: Bulk Download (RECOMMENDED)
├─ Download all place files from: https://www2.census.gov/econ/bps/Place/
├─ Parse fixed-width format
├─ Load into database (PostgreSQL > CSV)
└─ Monthly refresh script

Option B: API Approach (ALREADY DONE)
├─ Use existing scripts/11_fetch_city_permits_api.py
├─ Add pagination for all places
├─ Rate limiting already implemented
└─ More maintainable long-term
```

**Technical Implementation (1 week):**
```python
# New scripts to create:
scripts/
├── 20_fetch_place_permits_bulk.py     # ~200 lines, download all years
├── 21_parse_place_data_format.py      # ~300 lines, parse fixed-width
├── 22_build_place_metrics.py          # ~250 lines, compute metrics
├── 23_geocode_places.py               # ~200 lines, add lat/lon
└── 24_match_reforms_to_places.py      # ~200 lines, link reforms
```

**Effort Breakdown:**
- Data pipeline: 15-20 hours
- Database migration (CSV → PostgreSQL): 5-10 hours
- Data validation & quality checks: 5 hours
- Documentation: 3-5 hours
- **Subtotal: 28-40 hours**

**Success Metrics:**
- [ ] 20,000+ places ingested
- [ ] 10+ years historical data per place
- [ ] Geocoding >95% success rate
- [ ] Data quality >98%
- [ ] Search working for all places

#### 1.2 Place Search & Discovery - HIGH

**Why This Matters:**
- "Can I see my city?" is the #1 user question
- Search + autocomplete essential for engagement
- Relatively simple implementation
- Huge impact on user satisfaction

**Components to Build (1 week):**
```typescript
// New React components:
PlaceSearch.tsx           // 150 lines, autocomplete + fuzzy search
PlaceExplorer.tsx         // 200 lines, state → county → place hierarchy
PlaceComparison.tsx       // 300 lines, multi-place side-by-side
PlaceDetailPanel.tsx      // 400 lines, expanded place dashboard
```

**Technology Choices:**
- Search: Algolia, Typesense, or Meilisearch (scalable full-text search)
- Autocomplete: Downshift or Headless UI
- Fuzzy matching: Fuse.js (client-side) or server-side with PostgreSQL

**Effort Breakdown:**
- Frontend components: 20 hours
- Search backend setup: 10 hours
- Testing & refinement: 8 hours
- **Subtotal: 38 hours**

#### 1.3 Place-Level Map Visualization - HIGH

**Why This Matters:**
- Policymakers are visual
- Regional comparison insights
- Engagement tool

**Technology Stack:**
- Mapbox GL or Leaflet (not D3 choropleth)
- Vector tiles for performance
- Deck.gl for large datasets

**Effort Breakdown:**
- Map implementation: 25 hours
- Clustering/optimization: 15 hours
- Styling/UX: 10 hours
- **Subtotal: 50 hours**

**Phase 1 Total: ~100-140 hours (3-4 weeks full-time)**

---

### Phase 2: Expanded Reform Tracking ⭐ HIGH PRIORITY

**Duration:** 2-3 weeks | **Effort:** MEDIUM-HIGH | **Impact:** HIGH**

#### 2.1 Reform Catalog Expansion - HIGH

**Current State:** 30 cities manually documented
**Target State:** 500+ cities with systematic tracking

**Data Sources (in priority order):**

| Source | Completeness | Effort | Integration |
|--------|-------------|--------|-------------|
| **YIMBY Action Tracker** | ~400 reforms | Easy (structured) | API or CSV |
| **Urban Institute HIRP** | ~300 reforms | Medium (PDF scrape) | Manual compilation |
| **State Legislation DBs** | State-level | Medium (varies by state) | Manual per state |
| **Terner Center** | CA-focused | Medium | Specific region |
| **City websites** | Most accurate | Hard (scraping) | Semi-automated |
| **News aggregation** | Real-time | Medium | API or RSS |

**Recommended Approach:**
1. Start with YIMBY Action Tracker (easiest, most complete)
2. Supplement with Urban Institute HIRP
3. Add state-by-state legislation tracking
4. Establish ongoing news monitoring

**Data Model Enhancement:**
```python
{
  "place_fips": "06075",
  "reform_name": "SB-9 Implementation",
  "reform_type": "Housing Type Legalization",
  "reform_subtype": "Lot Split + ADU",
  "effective_date": "2022-01-01",
  "adoption_date": "2021-09-01",
  "source_url": "https://...",
  "coverage_area": "Entire city",
  "estimated_parcels_affected": 45000,
  "baseline_density": 12,  # units/acre
  "new_max_density": 16,
  "estimated_new_units": 25000,
  "data_quality_flag": "high"  # or medium/low
}
```

**Implementation (2 weeks):**
- YIMBY data integration: 20 hours
- Urban Institute scraping/compilation: 25 hours
- State legislation research: 30 hours
- Data validation: 10 hours
- Database schema updates: 10 hours
- **Subtotal: 95 hours**

#### 2.2 Reform Impact Calculator - MEDIUM

**Concept:** "If we do reform X, how many permits should we expect?"

**Implementation (1 week):**
- Prediction model: Use existing ML model V3/V4
- UI component: 200 lines React
- Sensitivity analysis: 100 lines Python
- **Subtotal: 30 hours**

#### 2.3 Reform Adoption Timeline - LOW

**Nice-to-have visualization** (can skip if time-constrained)
- **Subtotal: 20 hours**

**Phase 2 Total: ~145 hours (4-5 weeks full-time)**

---

### Phase 3: ML Model Enhancement ⭐ CRITICAL FOR CREDIBILITY

**Duration:** 2-3 weeks | **Effort:** HIGHEST | **Impact:** TRANSFORMATIVE**

#### 3.1 City-Level Model Training - CRITICAL

**Current Problem:** 36 samples, R² = -0.77
**Solution:** 500+ city samples, R² > 0.6 expected

**Why This Matters:**
- Current model is worse than mean baseline
- With 500+ cities, model becomes credible
- Geographic stratification fixes spatial autocorrelation
- Scenario modeling requires trustworthy predictions

**Enhanced Feature Set:**
```python
features = {
    # Core (existing)
    'baseline_wrluri': float,
    'baseline_permit_growth': float,
    'mf_share': float,

    # Demographics (NEW - from Census ACS)
    'population': int,
    'population_growth_5yr': float,
    'median_household_income': int,
    'pct_renters': float,
    'median_age': float,
    'pct_college_educated': float,

    # Housing Market (NEW - from Zillow/Redfin)
    'median_home_value': int,
    'home_value_growth_5yr': float,
    'rental_vacancy_rate': float,
    'median_rent': int,

    # Economic (NEW - from BLS/Census)
    'unemployment_rate': float,
    'job_growth_5yr': float,
    'median_commute_time': int,

    # Reform Context (NEW)
    'reform_comprehensiveness': int,  # 1-5 scale
    'years_since_reform': float,
    'neighboring_reforms_count': int
}
```

**Implementation (2-3 weeks):**
- Data integration (you have scripts 13-16): 10 hours
- Feature engineering: 20 hours
- Model architecture (XGBoost/LightGBM): 25 hours
- Geographic stratification: 15 hours
- Cross-validation & testing: 20 hours
- Uncertainty quantification: 15 hours
- **Subtotal: 105 hours**

#### 3.2 Causal Inference Integration - HIGH

**You already have 2 methods (DiD + SCM); roadmap suggests 3rd (Event Study)**

**Event Study Implementation (1 week):**
- Dynamic treatment effects tracking over time
- Pre-trend validation
- Long-term decay analysis
- **Effort: 25 hours**

#### 3.3 Scenario Modeling - MEDIUM

**"What if I implement reform X?" tool**

**Implementation (1 week):**
- Input form: 100 lines React
- Prediction logic: Use trained model
- Comparison to similar cities: 50 lines Python
- **Effort: 30 hours**

**Phase 3 Total: ~160 hours (5-6 weeks full-time)**

---

### Phase 4: Policymaker Experience ⭐ HIGH PRIORITY

**Duration:** 2-3 weeks | **Effort:** MEDIUM | **Impact:** HIGH**

#### 4.1 Jurisdiction Dashboard - HIGH

**Objective:** Dedicated page for each place

**URL Structure:** `/place/{state}/{city-name}` or `/place/{fips}`

**Components (2 weeks):**
```typescript
// New pages & components:
pages/place/[state]/[city].tsx         // Dynamic place page
components/place/PlaceOverview.tsx     // Key metrics card
components/place/PermitTrends.tsx      // Time series + forecast
components/place/ReformHistory.tsx     // Reform timeline
components/place/Comparison.tsx        // vs. peers
components/place/ScenarioTool.tsx      // Scenario modeling
```

**Effort Breakdown:**
- Place page template: 20 hours
- Individual components: 40 hours
- Data fetching/caching: 10 hours
- Mobile responsiveness: 15 hours
- **Subtotal: 85 hours**

#### 4.2 Advanced Features - MEDIUM

- Export reports (PDF/Excel): 15 hours
- API for researchers: 20 hours
- Benchmarking tools: 20 hours
- **Subtotal: 55 hours**

**Phase 4 Total: ~140 hours (4-5 weeks full-time)**

---

## 📊 Complete Effort Summary

| Phase | Primary Task | Effort | Duration | Impact |
|-------|-------------|--------|----------|--------|
| **Phase 1** | Place data + search | 130 hrs | 3-4 wks | 🔥 TRANSFORMATIVE |
| **Phase 2** | Reform expansion | 145 hrs | 4-5 wks | 🔥 TRANSFORMATIVE |
| **Phase 3** | ML upgrade | 160 hrs | 5-6 wks | 🔥 TRANSFORMATIVE |
| **Phase 4** | Policymaker UX | 140 hrs | 4-5 wks | 🔥 HIGH |
| **TOTAL** | Complete roadmap | **575 hrs** | **16-20 wks** | **4x larger tool** |

---

## Optimal Execution Strategy

### Recommended Approach: Phased-Priority Hybrid

Instead of strict sequential phases, recommend **concurrent work with priority tiers:**

```
Timeline View:
┌─────────────────────────────────────────────────────────────┐
│ Week 1-4: PHASE 1 (Data Foundation)                         │
│   ├─ 1.1 Census BPS pipeline (CRITICAL)            [20 hrs] │
│   ├─ 1.2 Place search                              [18 hrs] │
│   └─ 1.3 Map visualization      (parallel start)   [25 hrs] │
├─ Begin Phase 2 (Week 3) - Reform expansion         [10 hrs] │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Week 5-8: PHASE 2 + Start PHASE 3                          │
│   ├─ 2.1 Reform catalog         (continue)         [40 hrs] │
│   ├─ 2.2 Impact calculator                         [15 hrs] │
│   └─ 3.1 ML model training      (start parallel)   [50 hrs] │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Week 9-12: PHASE 3 + PHASE 4                                │
│   ├─ 3.2 Event study            (complete)         [20 hrs] │
│   ├─ 3.3 Scenario modeling                         [15 hrs] │
│   ├─ 4.1 Jurisdiction dashboard (start parallel)   [40 hrs] │
│   └─ 4.2 Advanced features                         [25 hrs] │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Week 13-16: PHASE 4 + Refinement                           │
│   ├─ 4.1 Dashboard (complete)                      [45 hrs] │
│   ├─ Testing & QA               (concurrent)       [40 hrs] │
│   ├─ Performance optimization                      [30 hrs] │
│   └─ Documentation & launch                        [20 hrs] │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Realistic 1 FTE: 16-20 weeks
Realistic 2 FTE: 8-10 weeks
Realistic 3 FTE: 5-7 weeks
```

### Risk-Mitigated Sequencing

**If Time/Resources Constrained (MVP Path):**

**Weeks 1-4:** Phase 1 ONLY (Most Impact)
- Census BPS pipeline (20,000 places)
- Basic search
- Skip map visualization (can use existing choropleth)
- **Result:** 20,000 searchable places (10x reach increase)**

**Weeks 5-8:** Phase 2.1 ONLY (Reform Data)
- Expand reforms to 200+ cities (YIMBY + Urban Institute)
- Skip impact calculator
- **Result:** Comprehensive reform tracking**

**Weeks 9-12:** Phase 3.1 ONLY (Better ML)
- Retrain model on 200+ cities
- Expected R² > 0.3-0.4
- **Result:** Credible predictions**

**Skip Phase 4 initially** (launch 3-phase MVP, add Policymaker Dashboard later)

**This MVP Path:**
- **Effort:** ~300 hours (12 weeks 1 FTE)
- **Impact:** 4x larger tool with credible ML
- **Can iterate** to full roadmap incrementally

---

## Technology Decisions

### Database Migration: CSV → PostgreSQL
**Recommended ASAP** (before Phase 1)

**Why:**
- 20,000 places = too large for CSV in memory
- PostgreSQL enables full-text search
- Better for caching/API queries
- Scales to 100,000+ places

**Schema (simplified):**
```sql
-- Places table
CREATE TABLE places (
  place_fips VARCHAR(7) PRIMARY KEY,
  place_name VARCHAR(100),
  state_fips VARCHAR(2),
  county_fips VARCHAR(5),
  population INT,
  lat DECIMAL(9,6),
  lon DECIMAL(9,6),
  region VARCHAR(50),  -- For clustering
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE INDEX idx_place_name ON places USING GIN (place_name gin_trgm_ops);  -- Full-text

-- Permits table (time series)
CREATE TABLE permits (
  id BIGSERIAL PRIMARY KEY,
  place_fips VARCHAR(7) REFERENCES places,
  year INT,
  month INT,
  permits_1unit INT,
  permits_2unit INT,
  permits_3to4unit INT,
  permits_5plus INT,
  total_permits INT,
  UNIQUE(place_fips, year, month)
);
CREATE INDEX idx_permits_place_year ON permits(place_fips, year);

-- Reforms table
CREATE TABLE reforms (
  id SERIAL PRIMARY KEY,
  place_fips VARCHAR(7) REFERENCES places,
  reform_name VARCHAR(200),
  reform_type VARCHAR(50),
  effective_date DATE,
  source_url TEXT,
  data_quality VARCHAR(20)
);
CREATE INDEX idx_reforms_place ON reforms(place_fips);
```

**Migration Plan:**
1. Keep CSV as source of truth
2. Import to PostgreSQL nightly
3. Switch API endpoints to query PostgreSQL
4. Deprecate CSV access

**Effort:** 20-30 hours
**Timeline:** Before Phase 1

### Search Backend Options

| Option | Cost/mo | Latency | Scale | Recommendation |
|--------|---------|---------|-------|-----------------|
| **Algolia** | $50-500 | <50ms | 10M+ records | ✅ Best UX, managed |
| **Typesense** | Self-hosted | <50ms | 1M+ records | ✅ Great, open-source |
| **Meilisearch** | Self-hosted | <50ms | 1M+ records | ✅ Good, simpler |
| **PostgreSQL Full-Text** | Included | 100ms | 10M records | ⚠️ OK, but slower |

**Recommendation:** Meilisearch (open-source, deployed on existing infrastructure)

### Map Visualization

| Library | Best For | Learning Curve | Recommendation |
|---------|----------|-----------------|-----------------|
| **Mapbox GL** | Large datasets | Medium | ✅ Industry standard |
| **Leaflet** | Simplicity | Low | ✅ Lightweight |
| **Deck.gl** | Big data viz | High | ✅ If 10,000+ points |

**Recommendation:** Mapbox GL (performance + features for this scale)

---

## Implementation Recommendations

### Immediate Actions (Next Week)

**Priority 1: Database Setup (2 days)**
```bash
# Create PostgreSQL schema
# Import existing 36-jurisdiction data
# Set up nightly CSV import pipeline
```

**Priority 2: Phase 1 Planning (3 days)**
- Decide: Bulk download vs. API approach for Census data
- Identify specific place data sources
- Create data pipeline architecture

**Priority 3: Team/Resource Planning (2 days)**
- Assign roles (data, ML, frontend, etc.)
- Determine timeline (1 FTE vs. 2 FTE vs. contract help)
- Set milestones and success metrics

### Week 1-2: Foundation Setup
- Database migration complete
- Phase 1.1 (Census pipeline) started
- Data quality validation tests written

### Week 3-4: Phase 1 Completion
- 20,000 places ingested
- Basic search working
- Place detail panel functional

### Week 5+: Phase 2-4 Progression
- Expand based on learnings from Phase 1
- Adjust timeline based on actual velocity

---

## Success Metrics & Validation

### Phase 1 Success
- [ ] 20,000+ places in database
- [ ] Search finds place in <100ms
- [ ] Geocoding >95% accurate
- [ ] Data quality score >98%
- [ ] MAP rendering <2 seconds for 20K points

### Phase 2 Success
- [ ] 200+ reforms documented
- [ ] Data quality assessment complete
- [ ] Reform impact calculator functional
- [ ] Historical timeline working

### Phase 3 Success
- [ ] Model trained on 200+ cities
- [ ] Cross-validation R² > 0.3-0.4
- [ ] Prediction error <15%
- [ ] Event study shows credible results
- [ ] 3 causal methods agree (r > 0.8)

### Phase 4 Success
- [ ] 500+ jurisdiction dashboards live
- [ ] Policymakers can find their city
- [ ] Scenario modeling tool usable
- [ ] Engagement metrics positive
- [ ] Qualitative feedback strong

---

## Risk Mitigation

### High Risk: Data Quality at Scale
**Risk:** 20,000 places with varied data completeness
**Mitigation:**
- Implement comprehensive validation
- Create data quality dashboard
- Flag uncertain data clearly
- Version all datasets

### High Risk: ML Model Still Negative R²
**Risk:** Even with 200+ cities, model may not improve
**Mitigation:**
- Focus on causal methods (already credible)
- Publish model uncertainty/limitations
- Use ensemble of methods
- Emphasize comparisons, not absolute predictions

### Medium Risk: Reform Catalog Becomes Stale
**Risk:** Manual updates won't keep up
**Mitigation:**
- Establish partnerships (YIMBY, Urban Institute)
- Set up automated news monitoring
- Community contribution feature
- Regular audit/validation

### Medium Risk: Frontend Performance
**Risk:** 20,000 points + complex features = slow
**Mitigation:**
- Vector tiles + clustering
- Lazy loading
- Progressive enhancement
- Performance budget enforcement

---

## Budget Estimate (for Contract Help)

| Phase | Hours | Rate | Cost | Duration |
|-------|-------|------|------|----------|
| **Phase 1** | 130 | $150/hr | $19,500 | 3-4 weeks |
| **Phase 2** | 145 | $150/hr | $21,750 | 4-5 weeks |
| **Phase 3** | 160 | $150/hr | $24,000 | 5-6 weeks |
| **Phase 4** | 140 | $150/hr | $21,000 | 4-5 weeks |
| **QA/Testing** | 40 | $100/hr | $4,000 | 1-2 weeks |
| **TOTAL** | 615 | - | **$90,250** | 20 weeks |

**Team Options:**
- **Option A:** Full roadmap with 1 FTE contractor = ~$90K
- **Option B:** MVP (Phase 1-3) with 1 FTE = ~$60K
- **Option C:** 2 contractors, 10 weeks = ~$120K (faster)
- **Option D:** Internal team (you + 1-2 staff) = time but no cash

---

## Recommendation: Optimal Approach

### Suggested Path: **Phased MVP → Full Roadmap**

**Phase 0 (NOW - 1 week): Foundation Setup**
- Migrate to PostgreSQL ✅
- Set up Meilisearch ✅
- Document Phase 1 data pipeline requirements
- **Goal:** Ready to scale**

**Phase 1 (Weeks 1-4): Data Foundation** ✨ HIGHEST IMPACT
- Census BPS pipeline (20,000 places)
- Basic search
- Place detail pages
- **Effort:** 1-2 FTE
- **Cost:** ~$20-30K if contracted
- **Impact:** 10x increase in searchable places

**Phase 2 (Weeks 5-8): Reform Intelligence** ✨ STRATEGIC VALUE
- Expand reforms to 200+ cities (YIMBY + Urban Institute)
- Reform impact calculator
- **Effort:** 1 FTE
- **Cost:** ~$20-30K if contracted
- **Impact:** Comprehensive reform tracking

**Phase 3 (Weeks 9-12): Model Credibility** ✨ SCIENTIFIC RIGOR
- Retrain on 200+ cities
- Expected R² > 0.3-0.4
- **Effort:** 1 FTE (data scientist)
- **Cost:** ~$25-35K if contracted
- **Impact:** Trustworthy predictions

**LAUNCH MVP with Phases 1-3** (12 weeks)
- Result: 20,000 searchable places + 200+ reforms + better ML
- Cost: ~$65-95K (or 12-16 weeks 1-2 FTE internal)
- Market impact: Significant competitive advantage

**Phase 4 (Weeks 13+): Policymaker Experience** (Add Later)
- Jurisdiction dashboards
- Scenario modeling
- Advanced features
- Can launch after MVP proves value

---

## Implementation Timeline Options

### Option 1: Fast Track (3 FTE, 6 weeks) = Most Expensive
```
Weeks 1-3:   All Phase 1 tasks (3 people)
Weeks 4-6:   Phase 1 completion + Phase 2 start
Weeks 7-9:   Phase 2 + Phase 3 start
Weeks 10-12: Phase 3 + Phase 4 start
Result: Full roadmap in 12 weeks, $90K+ cost
```

### Option 2: Recommended (1-2 FTE, 12-16 weeks) = Balanced
```
Weeks 1-4:   Phase 1 (data + search)
Weeks 5-8:   Phase 2 (reform data) + Phase 1 optimization
Weeks 9-12:  Phase 3 (ML upgrade)
Weeks 13-16: Phase 4 (dashboards)
Result: Full roadmap in 16 weeks, $60-80K if contracted
```

### Option 3: Lean (1 FTE, 20+ weeks) = Minimal Cost
```
Weeks 1-6:   Phase 1
Weeks 7-12:  Phase 2
Weeks 13-18: Phase 3
Weeks 19-24: Phase 4
Result: Full roadmap in 24 weeks, Internal time only
```

---

## Conclusion & Recommendation

### ✅ The PRODUCT_ROADMAP is **STRATEGICALLY SOUND & ACTIONABLE**

**Assessment:**
- Vision is compelling (20,000 places)
- Data sources are real and accessible
- Technical approach is realistic
- Phased execution is sensible
- Impact would be significant

**Optimal Approach:**
1. **Immediately:** Migrate to PostgreSQL, plan Phase 1
2. **Weeks 1-4:** Execute Phase 1 (highest impact)
3. **Weeks 5-8:** Execute Phase 2 (comprehensive reform tracking)
4. **Weeks 9-12:** Execute Phase 3 (credible ML model)
5. **Weeks 13+:** Execute Phase 4 (policymaker dashboards)

**Expected Outcomes After 16 Weeks:**
- 20,000+ searchable places
- 200-500 tracked reforms
- ML model with R² > 0.3-0.4
- Jurisdiction-specific dashboards
- Policymaker decision support tool

**Investment Required:**
- **Time:** 1-2 FTE for 16 weeks, or 3 FTE for 6 weeks
- **Cost:** $60-95K if contracted
- **Infrastructure:** PostgreSQL + Meilisearch + Mapbox GL

**Return on Investment:**
- 10x increase in addressable market (state-level to place-level)
- Competitive moat (most tools are state-only)
- Research partnerships and policy impact
- Strong network effects (more cities → more value)

---

**Status:** READY TO EXECUTE
**Recommendation:** START WITH PHASE 1 (Data Foundation)
**Next Steps:** PostgreSQL migration + Phase 1 planning

