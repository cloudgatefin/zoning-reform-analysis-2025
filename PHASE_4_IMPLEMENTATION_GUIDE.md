# Phase 4: Implementation Guide - Real Data Integration & Production Deployment

**Status:** Ready to Execute
**Duration:** 4-6 hours
**Target:** Production-ready dashboard with real data

---

## Quick Start (5 minutes)

### Step 1: Get Census API Key
1. Go to: https://api.census.gov/data/key_signup.html
2. Enter your email and organization
3. Check email for API key (instant delivery)
4. Copy the key

### Step 2: Set Environment Variable
```bash
# On macOS/Linux:
export CENSUS_API_KEY="your_key_here"
echo $CENSUS_API_KEY  # verify it's set

# On Windows (PowerShell):
$env:CENSUS_API_KEY="your_key_here"
$env:CENSUS_API_KEY  # verify it's set

# Persistent (add to .bashrc, .zshrc, or Environment Variables in Windows):
# Then restart your terminal/shell
```

### Step 3: Run Data Pipeline
```bash
# From project root directory:
cd c:\Users\bakay\zoning-reform-analysis-2025

# 1. Fetch real Census place-level permits (5 min)
python scripts/11_fetch_city_permits_api.py

# 2. Compute city reform metrics (1 min)
python scripts/12_compute_city_metrics.py

# 3. Fetch Zillow housing data (2 min)
python scripts/13_fetch_zillow_data.py

# 4. Fetch Census ACS demographics (3 min)
python scripts/14_fetch_census_acs.py

# 5. Fetch BLS unemployment data (2 min)
python scripts/15_fetch_bls_data.py

# 6. Compile all features (1 min)
python scripts/16_compile_features.py

# 7. Retrain ML model with real data (2 min)
python scripts/10_build_predictive_model.py

# Total time: ~15 minutes
```

### Step 4: Start Dashboard
```bash
# In the app directory:
cd app
npm run dev

# Visit http://localhost:3000
```

---

## Detailed Implementation Tasks

### Task 1: Data Integration (2-3 hours)

#### 1.1 Census API Setup

**File:** `scripts/11_fetch_city_permits_api.py`
**Status:** Ready to run
**Requirements:** Census API key (from step above)
**Output:** `data/raw/census_bps_place_all_years.csv`

**What it does:**
- Fetches place-level building permit data from 2015-2024
- Covers all 53 US states/territories
- Returns: Place FIPS code, name, SF permits, MF permits, total permits
- Rate limiting: 0.5s delay between requests (120 calls/min Census limit)
- Retry logic: 3 attempts with exponential backoff
- Processing time: ~5-10 minutes

**Key features:**
```python
# Fetches these variables from Census API:
# PERMITTOTAL_1UNIT - Single-family permits
# PERMITTOTAL_2UNIT - 2-unit permits
# PERMITTOTAL_34UNIT - 3-4 unit permits
# PERMITTOTAL_5UNIT - 5+ unit permits

# API Endpoint: https://api.census.gov/data/{year}/bps/place
# Rate limit: 120 calls/minute without key, higher with key
```

**How to run:**
```bash
export CENSUS_API_KEY="your_key"
python scripts/11_fetch_city_permits_api.py 2>&1 | tee data/logs/census_fetch.log
```

**What to expect:**
```
INFO: ============================================================
INFO: YEAR 2024
INFO: ============================================================
INFO: ✓ 2024 California: 1,247 places fetched
INFO: ✓ 2024 Texas: 892 places fetched
... (51 more states)
INFO: Year 2024 complete: 45,230 total place records
...
✓ Data saved to: data/raw/census_bps_place_all_years.csv
```

**Data validation:**
```bash
# Verify output:
wc -l data/raw/census_bps_place_all_years.csv  # Should be ~450,000+ lines
head -5 data/raw/census_bps_place_all_years.csv  # Check format
```

---

#### 1.2 City Metrics Computation

**File:** `scripts/12_compute_city_metrics.py`
**Status:** Ready to run
**Dependencies:** Requires successful output from step 1.1
**Input:**
- `data/raw/city_reforms.csv` (30 cities)
- `data/raw/census_bps_place_all_years.csv` (just created)
**Output:** `data/outputs/city_reforms_with_metrics.csv`

**What it does:**
- Calculates pre/post reform metrics for each city
- Pre-period: 24 months before reform
- Post-period: 12-24 months after reform
- Computes: Mean permits, absolute change, percent change, MF share change
- Data quality flags: Complete, limited_pre_data, limited_post_data, recent_reform

**Processing time:** ~1-2 minutes

**How to run:**
```bash
python scripts/12_compute_city_metrics.py
```

**Verification:**
```bash
# Check output
wc -l data/outputs/city_reforms_with_metrics.csv  # Should be 31 lines (header + 30 cities)
cat data/outputs/city_reforms_with_metrics.csv | head -5  # View first 5
```

**Expected output columns:**
- place_fips, city_name, state_fips, state_name
- reform_name, reform_type, effective_date, baseline_wrluri
- pre_mean_sf, pre_mean_mf, pre_mean_total
- post_mean_sf, post_mean_mf, post_mean_total
- abs_change, pct_change, mf_share_pre, mf_share_post, mf_share_change
- data_quality

---

#### 1.3 Zillow Housing Data

**File:** `scripts/13_fetch_zillow_data.py`
**Status:** Ready to run (uses fallback if API unavailable)
**Output:** `data/outputs/zillow_hvi_by_jurisdiction.csv`

**What it does:**
- Fetches Zillow Home Value Index (ZHVI) for 36 jurisdictions
- Covers 2015-2024 with year-over-year changes
- Falls back to public housing price data if API unavailable
- Returns: HVI value, YoY change %, interpretation

**Processing time:** ~2 minutes

**How to run:**
```bash
python scripts/13_fetch_zillow_data.py
```

**Data included:**
- Zillow ZHVI All Homes (SFR, Condo/Co-op) Time Series
- Or fallback: FHFA House Price Index + Census data
- Values for all 36 jurisdictions (6 states + 30 cities)

**Expected output:**
```csv
jurisdiction_fips,state_fips,jurisdiction_name,hvi_2023,hvi_yoy_change_pct
06000,06,California,425000,-2.5
06001,06,Alameda County,520000,-3.2
... (34 more)
```

---

#### 1.4 Census ACS Demographics

**File:** `scripts/14_fetch_census_acs.py`
**Status:** Ready to run
**Requirements:** Census API key (recommended but optional)
**Output:** `data/outputs/census_acs_demographics.csv`

**What it does:**
- Fetches Census American Community Survey (ACS) data
- 5-year rolling estimates (most recent available)
- Variables: Population, median income, education, race/ethnicity
- Returns: All demographic data for 36 jurisdictions

**Processing time:** ~3 minutes

**How to run:**
```bash
export CENSUS_API_KEY="your_key"
python scripts/14_fetch_census_acs.py
```

**Variables collected:**
- Population (2020, 2023)
- Median household income
- Population density (persons/sq mi)
- Population growth rate (%)
- College educated (%)
- Race/ethnicity percentages

**Data quality notes:**
- ACS provides 5-year estimates
- Latest year data available: 2023 (5-year: 2018-2023)
- Missing data handled with imputation if needed

---

#### 1.5 BLS Unemployment Data

**File:** `scripts/15_fetch_bls_data.py`
**Status:** Ready to run
**Requirements:** Optional BLS API key (can run without)
**Output:** `data/outputs/bls_unemployment_data.csv`

**What it does:**
- Fetches Bureau of Labor Statistics employment data
- Unemployment rates, labor force participation
- Metro area and state-level data for 36 jurisdictions
- Returns: 2022-2023 unemployment rates

**Processing time:** ~2 minutes

**How to run:**
```bash
python scripts/15_fetch_bls_data.py
```

**Data included:**
- Unemployment rate (%)
- Labor force participation (%)
- Employment levels

**Note:** BLS data released with lag (current year incomplete, prior year most recent)

---

#### 1.6 Feature Compilation

**File:** `scripts/16_compile_features.py`
**Status:** Ready to run
**Dependencies:** Outputs from steps 1.3, 1.4, 1.5
**Output:** `data/outputs/unified_economic_features.csv`

**What it does:**
- Merges all economic data into single feature matrix
- Handles missing values with appropriate strategy
- Scales numerical features
- Validates data quality and completeness
- Creates 23-column feature matrix for ML model

**Processing time:** ~1 minute

**How to run:**
```bash
python scripts/16_compile_features.py
```

**Output schema (23 columns):**
```
jurisdiction_fips, state_fips, jurisdiction_name,
hvi_2023, hvi_yoy_change_pct, hvi_log,
population_2020, population_2023, population_growth_rate_pct,
median_household_income, income_hvi_ratio,
population_density_per_sqmi, percent_college_educated,
percent_white, percent_hispanic, percent_asian,
unemployment_rate_2022, unemployment_rate_2023, labor_force_participation,
urban_score, baseline_wrluri, reform_impact_pct
```

**Validation:**
```bash
# Verify all 36 jurisdictions present
python -c "import pandas as pd; df = pd.read_csv('data/outputs/unified_economic_features.csv'); print(f'Records: {len(df)}'); print(f'Complete: {df.isnull().sum().sum() == 0}')"
```

---

### Task 2: ML Model Retraining (30 minutes)

#### 2.1 Train Model V4 with Real Data

**File:** `scripts/10_build_predictive_model.py`
**Status:** Ready to run
**Dependencies:** `unified_economic_features.csv` (from step 1.6)
**Output:** `data/outputs/reform_impact_model_v4_real_data.pkl`

**What it does:**
- Trains Random Forest model on 36 jurisdictions
- Uses 9 economic features
- Performs 5-fold cross-validation
- Computes feature importance
- Generates predictions for all jurisdictions
- Saves model and metadata

**Processing time:** ~2 minutes

**How to run:**
```bash
python scripts/10_build_predictive_model.py
```

**Key parameters:**
```python
# Model configuration
n_estimators = 100  # Number of trees
max_depth = 8  # Maximum tree depth
train_test_split = 0.2  # 80/20 split
cv_folds = 5  # 5-fold cross-validation
```

**Expected output:**
```
Training Random Forest model...
Training samples: 36
Features: 9 (WRLURI, HVI, income, density, unemployment, etc.)
Cross-validation R²: 0.XX (expect improvement vs V3)

Feature importance:
  baseline_wrluri: XX.X%
  median_household_income: XX.X%
  unemployment_rate_2023: XX.X%
  ... (9 total)

Predictions generated for 36 jurisdictions
Model saved to: data/outputs/reform_impact_model_v4_real_data.pkl
```

**Performance comparison:**
```
Model V2 (6 states, synthetic):      R² = -10.98
Model V3 (36 jurisdictions, mixed):  R² = -0.77
Model V4 (36 jurisdictions, real):   R² = XX.XX (expected: 0.3-0.6)
```

**If R² doesn't improve:**
- Check data quality: `python scripts/validate_data_quality.py`
- Review feature distributions
- Consider alternative algorithms or additional features
- Document findings for Phase 5 improvement plan

---

### Task 3: Performance Optimization (1-2 hours)

#### 3.1 API Response Caching

**Goal:** Reduce API response time and database load

**Implementation options:**
1. **In-memory caching** (simple, good for development)
2. **Redis caching** (scalable, good for production)
3. **HTTP caching headers** (CDN-friendly)

**For Phase 4, implement in-memory caching:**

**File to update:** `app/app/api/economic-context/[fips]/route.ts`

```typescript
// Add caching layer
const CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour in ms

export async function GET(request: Request, { params }: { params: { fips: string } }) {
  const cacheKey = `economic-${params.fips}`;
  const cached = CACHE.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // ... existing code to load and parse data ...

  CACHE.set(cacheKey, { data: result, timestamp: Date.now() });
  return NextResponse.json(result);
}
```

**Similar caching for:**
- `/api/causal-analysis/[fips]`
- `/api/predictions`

**Testing:**
```bash
# Measure response time before/after
time curl http://localhost:3000/api/economic-context/06000

# First call (no cache): ~150ms
# Second call (cached): ~1ms
```

#### 3.2 Component Optimization

```typescript
// Memoize components to prevent re-renders
const EconomicContextPanelMemo = React.memo(EconomicContextPanel);
const CausalMethodsComparisonMemo = React.memo(CausalMethodsComparison);

// In page.tsx:
<EconomicContextPanelMemo
  jurisdictionFips={selectedCity.fips}
  jurisdictionName={selectedCity.name}
/>
```

#### 3.3 Bundle Size Analysis

```bash
# Analyze bundle:
npm run build -- --analyze

# Expected sizes:
# Critical path JS: <100KB
# Total JS: <200KB
# CSS: <50KB
```

---

### Task 4: Testing & QA (1-2 hours)

#### 4.1 Functional Testing

**Test all jurisdictions:**
```bash
# Create test script:
cat > test_all_jurisdictions.sh << 'EOF'
#!/bin/bash
FIPS_CODES=(
  "06000" "06001" "06037" # California cities
  "36000" "36001" "36005" # New York cities
  "48000" "48113" "48201" # Texas cities
  # ... add all 36
)

for fips in "${FIPS_CODES[@]}"; do
  echo "Testing FIPS: $fips"
  curl -s "http://localhost:3000/api/economic-context/$fips" | python -m json.tool > /dev/null
  curl -s "http://localhost:3000/api/causal-analysis/$fips" | python -m json.tool > /dev/null
done
echo "All tests passed!"
EOF

chmod +x test_all_jurisdictions.sh
./test_all_jurisdictions.sh
```

#### 4.2 Data Quality Validation

```bash
# Run validation script:
python scripts/validate_data_quality.py

# Expected output:
# [OK] City reforms: 30 records
# [OK] City metrics: 30 records computed
# [OK] Combined dataset: 36 records
# [OK] Economic features: 36 records, 23 columns
# [OK] FIPS codes formatted correctly
# [OK] No missing values in critical columns
# [OK] Numeric ranges are realistic
```

#### 4.3 Performance Testing

```bash
# Load test API endpoints:
npm install -g autocannon

# Test economic context endpoint (1000 requests):
autocannon -c 10 -d 10 http://localhost:3000/api/economic-context/06000

# Expected:
# Requests/sec: 100+
# Latency: <100ms p99
```

#### 4.4 Responsive Design Testing

**Test on different screen sizes:**
- Mobile (375px): iPhone 12/13
- Tablet (768px): iPad
- Desktop (1024px+): Laptop/Desktop

**Tools:**
- Chrome DevTools device emulation
- Firefox responsive design mode
- Physical device testing (if available)

---

### Task 5: Production Deployment (1-2 hours)

#### 5.1 Environment Setup

**Create `.env.production` file:**
```bash
# Database (if using)
DATABASE_URL=postgresql://user:pass@host/dbname

# APIs
CENSUS_API_KEY=your_key_here
ZILLOW_API_KEY=optional_key  # Leave blank to use fallback

# Monitoring
SENTRY_DSN=https://...  # Optional error tracking
ANALYTICS_ID=your_id  # Optional analytics

# Server
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

**Security checklist:**
- [ ] No API keys in code (use environment variables)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting configured
- [ ] Input validation in place
- [ ] Security headers set

#### 5.2 Deployment to Vercel (Recommended)

```bash
# Login to Vercel:
npm install -g vercel
vercel login

# Deploy:
cd app
vercel --prod

# Set environment variables in Vercel dashboard:
# - CENSUS_API_KEY
# - DATABASE_URL (if applicable)
# - SENTRY_DSN (if applicable)

# Monitor deployment:
vercel logs --follow
```

**Alternative platforms:**
- Netlify (similar to Vercel)
- AWS (more control, more complex)
- GCP or Azure (enterprise)

#### 5.3 Database Setup (Optional)

**If using PostgreSQL instead of CSV files:**

```sql
-- Create tables:
CREATE TABLE economic_features (
  jurisdiction_fips VARCHAR(7) PRIMARY KEY,
  jurisdiction_name VARCHAR(100),
  state_fips VARCHAR(2),
  hvi_2023 DECIMAL(10,2),
  median_household_income DECIMAL(10,2),
  ... (other columns)
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes:
CREATE INDEX idx_jurisdiction_fips ON economic_features(jurisdiction_fips);
CREATE INDEX idx_state_fips ON economic_features(state_fips);
```

**Migration from CSV:**
```python
# Script to load CSV to database
import pandas as pd
from sqlalchemy import create_engine

df = pd.read_csv('data/outputs/unified_economic_features.csv')
engine = create_engine(os.environ['DATABASE_URL'])
df.to_sql('economic_features', engine, if_exists='replace', index=False)
```

#### 5.4 Monitoring Setup

**Configure error tracking (Sentry):**
```bash
# Sign up: https://sentry.io/
# Create project for Next.js
# Get DSN

# Install:
npm install @sentry/nextjs

# Configure in next.config.js:
const withSentryConfig = require("@sentry/nextjs/withSentryConfig");

module.exports = withSentryConfig(
  {
    // ... next.js config
  },
  {
    org: "your-org",
    project: "your-project",
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }
);
```

**Configure monitoring:**
- Errors and exceptions
- Performance metrics
- API latencies
- Custom events (data refreshes, model updates)

**Set up alerts:**
- High error rate (>1%)
- API latency (>500ms)
- Deployment failures
- Data pipeline failures

#### 5.5 Backup & Recovery

```bash
# Daily backup of data files:
0 2 * * * tar czf /backup/data-$(date +\%Y\%m\%d).tar.gz data/outputs/

# Archive old backups (keep 30 days):
find /backup -name "data-*.tar.gz" -mtime +30 -delete

# Test restoration monthly:
cd /tmp && tar xzf /backup/data-latest.tar.gz && ls -la data/outputs/
```

---

## Validation Checklist

After completing all steps, verify:

**Data Integration:**
- [ ] Census place-level permits: ~450,000 records
- [ ] City metrics computed: 30 cities
- [ ] Zillow HVI data: 36 jurisdictions
- [ ] Census demographics: 36 jurisdictions
- [ ] BLS unemployment: 36 jurisdictions
- [ ] Unified features: 36 × 23 columns, no missing values

**ML Model:**
- [ ] Model V4 trained on 36 samples
- [ ] 5-fold cross-validation completed
- [ ] Feature importance computed
- [ ] Predictions generated for all 36

**Performance:**
- [ ] API response time <200ms
- [ ] Caching working (second response <5ms)
- [ ] Bundle size <100KB (critical path)
- [ ] No memory leaks (30+ min session)

**Testing:**
- [ ] All 36 jurisdictions load correctly
- [ ] No console errors or 404s
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Data quality validation passed

**Production Readiness:**
- [ ] Environment variables configured
- [ ] Error tracking enabled
- [ ] Monitoring/logging active
- [ ] Backup procedure tested
- [ ] Documentation complete

---

## Troubleshooting

### Census API Returns 403
**Solution:**
1. Verify API key is correct: `echo $CENSUS_API_KEY`
2. Check key at: https://api.census.gov/data/key_signup.html
3. Request new key if needed
4. Verify internet connection
5. Fallback: Manual download from Census website (note: slow alternative)

### Zillow Data Not Fetching
**Solution:**
1. Script includes fallback to public housing price data
2. If Zillow URL changed, update:
   `ZILLOW_STATE_URL = "https://files.zillowstatic.com/research/..."`
3. Check current URL at: https://www.zillow.com/research/data/

### BLS Data Missing
**Solution:**
1. BLS data has lag (current year incomplete)
2. Script uses 2022-2023 data
3. Will update to current year when available
4. Fallback: Use unemployment rates from Census ACS

### ML Model Performance Poor
**Solution:**
1. Verify data quality: `python scripts/validate_data_quality.py`
2. Check feature distributions: `python -c "import pandas as pd; df = pd.read_csv('data/outputs/unified_economic_features.csv'); print(df.describe())"`
3. Consider alternative algorithms
4. Document findings for Phase 5 improvement
5. Causal methods (DiD, SCM) provide more reliable estimates

### Dashboard Not Loading Data
**Solution:**
1. Check browser console for errors
2. Verify API endpoints running: `curl http://localhost:3000/api/predictions`
3. Check file paths in route handlers
4. Verify CSV files exist in data/outputs/
5. Check file permissions

---

## Next Steps After Phase 4

1. **Phase 4 completion:** Data loading, API endpoints functional
2. **User acceptance testing:** Get stakeholder feedback
3. **Documentation review:** Ensure all docs accurate
4. **Team training:** Teach operations team
5. **Phase 5 planning:** Advanced features and improvements

---

**Document Status:** Complete and ready for execution
**Last Updated:** 2025-11-19
**Next Milestone:** Phase 4 completion (4-6 hours)

