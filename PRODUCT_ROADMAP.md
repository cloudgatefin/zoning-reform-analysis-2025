# Zoning Reform Analysis Dashboard - Product Roadmap

**Version:** 1.0
**Date:** 2025-11-19
**Author:** Product Strategy Review

---

## Executive Summary

The Zoning Reform Analysis Dashboard has a strong foundation with state-level analysis, ML predictions, and multiple causal inference methods. However, to become the **definitive tool for ALL U.S. policymakers**, it must dramatically expand place-level (city) coverage and deliver actionable insights at the jurisdictional level where zoning decisions are made.

### Current State
- 53 states with baseline metrics
- 30 cities manually catalogued
- ML model R² = -10.98 (needs improvement)
- 6 reform states with detailed analysis

### Vision State
- **20,000+ places** with building permit data
- **500+ cities** with reform tracking
- ML model R² > 0.6 with city-level training
- **Every policymaker** can find their jurisdiction

---

## Strategic Opportunities

### The Census BPS Place-Level Data Goldmine

The Census Bureau Building Permits Survey (BPS) at `https://www2.census.gov/econ/bps/Place/` provides:

- **Geographic Coverage**: ~20,000 permit-issuing places (cities, towns, townships, CDPs)
- **Temporal Coverage**: 1980-2024 (45+ years)
- **Granularity**: Monthly permits by structure type (1-unit, 2-unit, 3-4 unit, 5+ unit)
- **Update Frequency**: Monthly with 1-2 month lag

**Data Files Available:**
```
Place/
├── Annual Place Data (1980-2024)
│   ├── pl{year}a.txt - Annual totals by place
│   └── co{year}a.txt - Annual totals by county
├── Monthly Place Data
│   ├── {year}/{month}/pl{yy}{mm}.txt
│   └── Complete monthly history
├── Documentation
│   ├── record_layout*.txt
│   └── place_county_codes.txt
└── Historical Archives
```

**Why This Matters:**
1. **Policy relevance**: Zoning is LOCAL - state data masks variation
2. **ML training data**: 20,000+ samples vs. current 30
3. **User engagement**: Policymakers search for THEIR city
4. **Competitive moat**: Most tools only offer state-level

---

## Roadmap Phases

## Phase 1: Place-Level Data Foundation (Weeks 1-3)
**Theme: "Make Every City Searchable"**

### 1.1 Census BPS Place Data Pipeline
**Priority: CRITICAL | Effort: HIGH | Impact: TRANSFORMATIVE**

**Objective**: Ingest and process all ~20,000 places from Census BPS

**Implementation:**
```python
# New scripts needed:
scripts/
├── 20_fetch_place_permits_bulk.py    # Download all place-level data
├── 21_parse_place_data_format.py     # Parse Census fixed-width format
├── 22_build_place_metrics.py         # Compute growth rates, MF share
├── 23_geocode_places.py              # Add lat/lon for mapping
└── 24_match_reforms_to_places.py     # Link reforms to Census place codes
```

**Data Structure:**
```csv
place_fips,place_name,state_fips,state_name,year,month,permits_1unit,permits_2unit,permits_3to4unit,permits_5plus,total_permits,lat,lon
0100124,Abbeville city,01,Alabama,2024,01,5,0,0,12,17,31.5717,-85.2505
```

**Success Metrics:**
- 20,000+ places with permit time series
- 10+ years of monthly data per place
- Geocoded for map visualization
- Searchable by name, state, FIPS

### 1.2 Place Search & Discovery
**Priority: HIGH | Effort: MEDIUM | Impact: HIGH**

**Objective**: Let any policymaker find their jurisdiction instantly

**New Components:**
```typescript
// app/components/dashboard/
PlaceSearch.tsx           // Autocomplete search by name
PlaceExplorer.tsx         // Browse by state → county → place
PlaceComparison.tsx       // Compare multiple places
PlaceDetailPanel.tsx      // Deep dive on selected place
```

**Features:**
- Fuzzy search with autocomplete
- Filter by state, population, permit volume
- "Near me" geolocation feature
- Recently viewed places
- Bookmark favorite jurisdictions

### 1.3 Place-Level Map Visualization
**Priority: HIGH | Effort: HIGH | Impact: HIGH**

**Objective**: Interactive map showing all places, not just states

**Implementation:**
- Zoom levels: National → State → County → Place
- Point markers for places (clustered at high zoom)
- Color by: permit growth, reform status, WRLURI
- Click to view place detail panel
- Compare mode: select multiple places

**Technical Requirements:**
- Mapbox GL or Leaflet (not just D3 choropleth)
- Vector tiles for performance
- Progressive loading by viewport

---

## Phase 2: Expanded Reform Tracking (Weeks 4-6)
**Theme: "Comprehensive Reform Intelligence"**

### 2.1 Reform Catalog Expansion
**Priority: HIGH | Effort: HIGH | Impact: HIGH**

**Current**: 30 cities with reforms
**Target**: 500+ cities with any zoning reform since 2010

**Data Sources to Integrate:**
1. **YIMBY Action Reform Tracker** - Comprehensive state/local reforms
2. **Urban Institute HIRP** - Housing policy database
3. **Terner Center Policy Updates** - California-focused
4. **State legislation databases** - ADU/SB-9 implementations
5. **Municipal code changes** - Scraped from city websites
6. **News/press releases** - Reform announcements

**Reform Types to Track:**
| Category | Subtypes |
|----------|----------|
| **Housing Type Legalization** | ADU, DADU, lot splits, duplexes/triplexes, missing middle |
| **Density Increases** | Upzoning, FAR increases, height limit increases |
| **Parking Reform** | Parking minimum elimination, reduction, transit exemptions |
| **Approval Streamlining** | By-right approvals, reduced review timelines |
| **Affordability** | Inclusionary zoning, density bonuses, linkage fees |
| **Comprehensive Plans** | Form-based codes, transit-oriented development |

**Enhanced Data Model:**
```csv
place_fips,reform_name,reform_type,reform_subtype,effective_date,
adoption_date,source_url,legislative_reference,coverage_area,
estimated_parcels_affected,baseline_density,new_max_density
```

### 2.2 Reform Impact Calculator
**Priority: MEDIUM | Effort: MEDIUM | Impact: HIGH**

**Objective**: Estimate potential housing production from proposed reforms

**Features:**
- Input: City characteristics + proposed reform parameters
- Output: Predicted permit increase with confidence interval
- Comparison to similar cities that implemented reforms
- Sensitivity analysis (optimistic/pessimistic scenarios)

**Use Case**: "If we eliminate parking minimums city-wide, how many additional permits should we expect?"

### 2.3 Reform Adoption Timeline
**Priority: MEDIUM | Effort: LOW | Impact: MEDIUM**

**Objective**: Track reform spread across the country

**Features:**
- Animated timeline showing reform adoption waves
- Filter by reform type
- Regional clustering analysis
- "Neighboring reforms" indicator (reform proximity)

---

## Phase 3: ML Model Enhancement (Weeks 7-9)
**Theme: "Credible Predictions"**

### 3.1 City-Level Model Training
**Priority: CRITICAL | Effort: HIGH | Impact: HIGH**

**Current Problem**: 6 training samples → R² = -10.98
**Solution**: 500+ city-level reforms → R² > 0.6 expected

**Enhanced Feature Set:**
```python
features = {
    # Demographics (Census ACS)
    'population': int,
    'population_growth_5yr': float,
    'median_household_income': int,
    'pct_renters': float,
    'median_age': float,

    # Housing Market (Zillow, Redfin)
    'median_home_value': int,
    'home_value_growth_5yr': float,
    'rental_vacancy_rate': float,
    'median_rent': int,

    # Economic (BLS, Census)
    'unemployment_rate': float,
    'job_growth_5yr': float,
    'median_commute_time': int,

    # Regulatory (WRLURI, custom)
    'wrluri_score': float,  # Wharton Land Use Regulatory Index
    'baseline_permit_growth': float,
    'mf_share': float,

    # Reform Context
    'reform_type': categorical,
    'reform_comprehensiveness': int,  # 1-5 scale
    'years_since_reform': float,
    'neighboring_reforms_count': int
}
```

**Model Architecture:**
- Algorithm: Gradient Boosting (XGBoost/LightGBM)
- Cross-validation: K-fold with geographic stratification
- Target: Percent change in permits (pre vs. post reform)
- Uncertainty: Conformal prediction intervals

### 3.2 Causal Inference Integration
**Priority: HIGH | Effort: HIGH | Impact: HIGH**

**Three Complementary Methods:**

1. **Difference-in-Differences (DiD)**
   - Dashboard component: `DiDAnalysisPanel.tsx`
   - Show parallel trends assumption test
   - Treatment effect with confidence intervals
   - Control group characteristics

2. **Synthetic Control Method (SCM)**
   - Dashboard component: `SyntheticControlPanel.tsx`
   - Donor pool weights visualization
   - Pre-treatment fit quality
   - Placebo tests

3. **Event Study**
   - Dashboard component: `EventStudyChart.tsx`
   - Dynamic treatment effects over time
   - Pre-trend validation
   - Long-term effect decay

### 3.3 Scenario Modeling
**Priority: MEDIUM | Effort: MEDIUM | Impact: HIGH**

**Objective**: "What if" analysis for policymakers

**Features:**
- Select any city without reform
- Choose reform type to simulate
- View predicted impact with uncertainty
- Compare to actual outcomes in similar cities
- Download scenario report

---

## Phase 4: Policymaker Experience (Weeks 10-12)
**Theme: "Insights to Action"**

### 4.1 Jurisdiction Dashboard
**Priority: HIGH | Effort: HIGH | Impact: HIGH**

**Objective**: Dedicated view for each jurisdiction

**URL Structure**: `/place/{state}/{place-name}` or `/place/{fips}`

**Page Sections:**
1. **Overview Card**
   - Key metrics (permits, growth, density)
   - Reform status badge
   - Comparison to state/national

2. **Permit Trends**
   - Historical time series
   - Forecast with confidence bands
   - Event markers (reforms, COVID, etc.)

3. **Reform Analysis** (if applicable)
   - Pre/post comparison
   - DiD treatment effect
   - Similar city comparison

4. **Peer Comparison**
   - Auto-selected comparable cities
   - Key metric differences
   - "What could we achieve" projection

5. **Policy Recommendations**
   - Reforms common in peer cities
   - Expected impact ranges
   - Implementation resources

### 4.2 Custom Report Builder
**Priority: MEDIUM | Effort: HIGH | Impact: HIGH**

**Objective**: Generate professional reports for council presentations

**Report Types:**
- **Reform Impact Report**: Before/after analysis
- **Peer Comparison Report**: How we compare
- **Policy Options Report**: What reforms to consider
- **Annual Housing Report**: Year-over-year trends

**Features:**
- Select metrics to include
- Add custom commentary
- Brand with jurisdiction logo
- Export as PDF/PowerPoint
- Schedule automated monthly reports

### 4.3 Notification System
**Priority: LOW | Effort: MEDIUM | Impact: MEDIUM**

**Objective**: Keep policymakers informed

**Notifications:**
- New data available for your jurisdiction
- Nearby city adopted reform
- Your peer cities updated
- Monthly trend summary

### 4.4 Methodology Transparency
**Priority: HIGH | Effort: LOW | Impact: HIGH**

**Objective**: Build trust with research-quality documentation

**New Pages:**
- `/about/methodology` - Detailed methods explanation
- `/about/data-sources` - All sources with citations
- `/about/limitations` - Honest caveats
- `/about/faq` - Common questions

---

## Phase 5: Advanced Analytics (Weeks 13-16)
**Theme: "Research-Grade Insights"**

### 5.1 Spillover Effects Analysis
**Priority: MEDIUM | Effort: HIGH | Impact: MEDIUM**

**Objective**: Measure cross-jurisdictional impacts

**Questions Answered:**
- Do neighboring city reforms affect our permits?
- Is there displacement to unreformed areas?
- Regional vs. local effects

### 5.2 Subgroup Analysis
**Priority: MEDIUM | Effort: MEDIUM | Impact: MEDIUM**

**Objective**: Heterogeneous effects by city type

**Subgroups:**
- High vs. low regulation (WRLURI)
- Coastal vs. interior
- Large vs. small cities
- High vs. low growth markets
- Blue vs. red states

### 5.3 Long-term Effect Tracking
**Priority: MEDIUM | Effort: LOW | Impact: MEDIUM**

**Objective**: Track reform effects over multiple years

**Features:**
- 1/2/3/5 year post-reform comparisons
- Effect decay or acceleration
- Time-to-full-effect estimates

### 5.4 Academic API
**Priority: LOW | Effort: MEDIUM | Impact: MEDIUM**

**Objective**: Enable research community

**Features:**
- Public API with documentation
- Bulk data downloads
- Citation guidelines
- Research use cases

---

## Phase 6: Engagement & Growth (Weeks 17-20)
**Theme: "Network Effects"**

### 6.1 City Profiles & Verification
**Priority: MEDIUM | Effort: MEDIUM | Impact: HIGH**

**Objective**: Official jurisdiction participation

**Features:**
- City staff can claim/verify profile
- Add local context and commentary
- Upload supporting documents
- Respond to methodology questions

### 6.2 Reform Submission Portal
**Priority: MEDIUM | Effort: MEDIUM | Impact: HIGH**

**Objective**: Crowdsource reform tracking

**Features:**
- Submit new reform with evidence
- Community review/verification
- Attribution to submitter
- Status tracking

### 6.3 Comparison Embeds
**Priority: LOW | Effort: LOW | Impact: MEDIUM**

**Objective**: Viral distribution

**Features:**
- Embeddable charts for city websites
- Social sharing cards
- Link to full analysis

### 6.4 Newsletter & Alerts
**Priority: LOW | Effort: LOW | Impact: MEDIUM**

**Objective**: Regular engagement

**Content:**
- Monthly reform roundup
- Interesting findings spotlight
- Data update notifications
- Research highlights

---

## Technical Architecture Evolution

### Current Architecture
```
[Python Scripts] → [CSV Files] → [Next.js API] → [React Dashboard]
```

### Target Architecture (Phase 1-3)
```
[Census API] → [ETL Pipeline] → [PostgreSQL] → [API Layer] → [Dashboard]
                                      ↓
                              [ML Training Pipeline]
```

### Recommended Technology Stack

**Database**: PostgreSQL with PostGIS
- Handle 20,000+ places with geospatial
- Complex queries for peer matching
- Time-series optimization

**ETL**: Apache Airflow or Dagster
- Scheduled Census data pulls
- Incremental updates
- Data quality monitoring

**API**: GraphQL with DataLoader
- Flexible queries for complex dashboards
- Batching for performance
- Strong typing with codegen

**Maps**: Mapbox GL JS
- Vector tiles for performance
- Custom styling
- Progressive loading

**ML**: MLflow + scikit-learn/XGBoost
- Experiment tracking
- Model versioning
- Prediction serving

---

## Success Metrics

### Phase 1 (Foundation)
| Metric | Current | Target |
|--------|---------|--------|
| Places with data | 30 | 20,000+ |
| Search autocomplete latency | N/A | < 100ms |
| Place detail load time | N/A | < 1s |

### Phase 2 (Reform Tracking)
| Metric | Current | Target |
|--------|---------|--------|
| Cities with reforms tracked | 30 | 500+ |
| Reform types tracked | 4 | 10+ |
| Data source citations | ~5 | 20+ |

### Phase 3 (ML Enhancement)
| Metric | Current | Target |
|--------|---------|--------|
| Training samples | 6 | 500+ |
| Model R² | -10.98 | > 0.6 |
| Prediction confidence | N/A | 80% interval |

### Phase 4 (Policymaker Experience)
| Metric | Target |
|--------|--------|
| Report generation time | < 5s |
| Custom report downloads | 100/month |
| Return visitors | 40%+ |

### Overall (6-Month Goals)
| Metric | Target |
|--------|--------|
| Unique jurisdictions viewed | 5,000+ |
| Policymaker registrations | 500+ |
| Reports generated | 1,000+ |
| Academic citations | 10+ |

---

## Risk Mitigation

### Data Quality Risks
| Risk | Mitigation |
|------|------------|
| Census data gaps | Interpolation + transparent flagging |
| Reform data accuracy | Multiple source verification |
| Outdated information | Monthly update pipeline |

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Map performance at scale | Vector tiles + clustering |
| ML model accuracy | Conformal prediction + caveats |
| API cost at scale | Caching + rate limiting |

### Adoption Risks
| Risk | Mitigation |
|------|------------|
| Policymaker trust | Methodology transparency |
| Data misinterpretation | Clear visualizations + guides |
| Scope creep | Phased roadmap + MVP focus |

---

## Quick Wins (Next 30 Days)

### Week 1-2: Place Data Foundation
1. **Download Census BPS Place data** (2015-2024)
   - Parse fixed-width format
   - Load into structured CSV/database
   - ~20,000 places with monthly permits

2. **Add place search to dashboard**
   - Autocomplete component
   - Filter by state
   - Link to place detail

3. **Create place detail panel**
   - Basic permit time series
   - Growth rate calculation
   - State comparison

### Week 3-4: Reform Expansion
1. **Expand reform catalog to 100+ cities**
   - Research recent ADU/upzoning reforms
   - Add YIMBY Action tracked reforms
   - Verify effective dates

2. **Retrain ML model with city data**
   - Use 100+ city samples
   - Expect R² > 0.3
   - Document feature importances

3. **Add peer comparison feature**
   - Auto-select similar cities
   - Side-by-side metrics
   - "What could we achieve" framing

---

## Resource Requirements

### Engineering (6 months)
- **Backend/Data**: 1 FTE - ETL pipeline, database, API
- **Frontend**: 1 FTE - Dashboard, visualizations, UX
- **ML/Analytics**: 0.5 FTE - Model improvement, causal inference

### Data (ongoing)
- Census API access (free)
- Zillow API (free tier available)
- Geographic data (free from Census)
- Reform research (manual curation)

### Infrastructure
- Database hosting: $50-200/month
- Map tiles: $50-100/month
- Hosting (Vercel Pro): $20/month

### Total Estimate: $10-20K for 6-month MVP

---

## Competitive Positioning

### Unique Value Propositions

1. **Place-Level Granularity**
   - Most tools: State-level only
   - Our tool: 20,000+ places searchable

2. **Causal Inference**
   - Most tools: Simple before/after
   - Our tool: DiD, SCM, Event Study

3. **Forward-Looking**
   - Most tools: Historical only
   - Our tool: Forecasts + scenario modeling

4. **Policymaker-Focused**
   - Most tools: Research audience
   - Our tool: Actionable insights for officials

### Target Users

1. **City/County Planning Staff** - Evaluate reform options
2. **City Council Members** - Evidence for policy decisions
3. **State Legislators** - Track statewide impacts
4. **Housing Researchers** - Academic analysis
5. **Advocacy Organizations** - Support policy campaigns
6. **Developers** - Understand regulatory environment

---

## Conclusion

This roadmap transforms the Zoning Reform Analysis Dashboard from a solid state-level tool into the **definitive national platform** for zoning reform intelligence. By leveraging the Census BPS Place-level data (20,000+ jurisdictions), expanding reform tracking (500+ cities), and delivering policymaker-focused insights, the tool becomes indispensable for anyone making housing policy decisions in the United States.

### Key Priorities:
1. **Place data integration** - Foundation for everything else
2. **Reform catalog expansion** - More training data, more relevance
3. **ML model improvement** - Credible predictions
4. **Policymaker experience** - Actionable insights

### Next Steps:
1. Download and parse Census BPS Place data
2. Implement place search and detail panel
3. Expand reform catalog to 100+ cities
4. Retrain ML model with city-level data

The path to becoming the essential tool for ALL U.S. policymakers starts with making every jurisdiction findable and analyzable.

---

**Document Status:** APPROVED FOR IMPLEMENTATION
**Review Schedule:** Bi-weekly roadmap reviews
**Contact:** Product Team

