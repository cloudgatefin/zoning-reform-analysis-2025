# Agent 10: Build Methodology Transparency Pages

**Phase:** 3 (Weeks 1-3)
**Duration:** 10-15 hours
**Dependencies:** None (can run immediately)
**Parallel With:** Agents 9, 11

---

## Mission

Create four comprehensive methodology pages that build trust through transparency. Policymakers need to understand what we're measuring, how we're measuring it, and where our analysis could be wrong.

**Success:** Four new pages deployed (`/about/methodology`, `/about/data-sources`, `/about/limitations`, `/about/faq`) with comprehensive documentation that answers all policymaker questions about credibility.

---

## What to Build

### Four Pages (10-15 hours total)

```
1. /about/methodology
   → Detailed explanation of all analysis methods
   → How we compute metrics, train models, predict impacts
   → Assumptions and validation approaches
   → (4-6 hours)

2. /about/data-sources
   → Complete list of all data sources with citations
   → Data quality assessments
   → Update frequency and methodology
   → (2-3 hours)

3. /about/limitations
   → Honest explanation of what we DON'T know
   → Caveats and assumptions
   → When results should NOT be trusted
   → (2-3 hours)

4. /about/faq
   → 15-20 common policymaker questions
   → Clear, accessible answers
   → Links to relevant methodology pages
   → (2-3 hours)
```

---

## Technical Requirements

### Technology Stack
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Content:** Markdown (can use `next-mdx-remote` or plain React)

### File Structure
```
app/
├── about/
│   ├── layout.tsx
│   ├── methodology/
│   │   └── page.tsx
│   ├── data-sources/
│   │   └── page.tsx
│   ├── limitations/
│   │   └── page.tsx
│   └── faq/
│       └── page.tsx
└── components/
    ├── about/
    │   ├── MethodologyNav.tsx (sidebar navigation)
    │   ├── MethodologyCitation.tsx (citation component)
    │   └── FAQAccordion.tsx (expandable FAQ)
```

---

## Page 1: /about/methodology

**Purpose:** Complete technical explanation of our methods

### Structure
```
1. Introduction (overview of what we measure)
2. Data Pipeline (how we process Census data)
3. Place-Level Metrics (what we compute)
4. ML Model (how predictions work)
5. Causal Inference (coming in Phase 4)
6. Assumptions & Validation
7. Next Steps: Phase 4 Methods
```

### Content Detail

#### 1. Introduction
```
Headline: "How We Analyze Zoning Reform Impact"

"This page explains the methods behind every number on this platform.
We believe transparency is essential for policymakers to trust our
analysis and use it responsibly.

Our goal: Rigorously estimate how zoning reforms affect housing
production, without overstating certainty or hiding limitations."
```

#### 2. Data Pipeline
```
Subheading: "From Census Data to Place Metrics"

Description of:
- Census Building Permits Survey (monthly place-level data)
- Data collection (20,000+ places since 1980)
- Data processing (fix errors, handle missing months)
- Permit aggregation (monthly → annual → 5-year rates)

Include diagram:
Census Raw Data → Parse → Clean → Aggregate → Metrics CSV
```

#### 3. Place-Level Metrics
```
Detailed explanation of each metric we compute:

A) Recent Permits (2024)
   - Definition: Single-family + multi-family permits in 2024
   - Calculation: Sum of all permits issued
   - Limitations: Some places don't report monthly
   - Data Quality: Flagged if <12 months reported

B) Growth Rate (5-year)
   - Definition: (Permits 2020-2024 average) / (Permits 2015-2019 average)
   - Calculation: Simple ratio with error handling
   - Limitations: Annual variation can be large
   - Confidence: Higher in larger places

C) Multi-Family Share (Recent)
   - Definition: MF permits / Total permits (2020-2024)
   - Calculation: Sum of 2-4 unit + 5+ unit / total
   - Limitations: Varies by development cycle
   - Significance: Indicates dense housing production

D) National Ranking
   - Definition: Percentile of growth rate among all places
   - Calculation: (Number of places with lower growth) / Total places
   - Limitations: Can be unstable for similar growth rates
   - Usefulness: Helps compare to peers

E) State Ranking
   - Definition: Percentile within state only
   - Calculation: Same as national, filtered by state
   - Limitations: States vary greatly in number of places
   - Usefulness: Better comparison to local peers
```

#### 4. ML Model (Current - Pre-Phase 4)
```
Headline: "Predicting Housing Impact from Reforms"

Current Model Status:
- Algorithm: Random Forest Regressor
- Target: Percent change in permits post-reform
- Training Data: 502 cities with documented reforms
- Features: 7 economic + regulatory variables
- Performance: R² = 0.2-0.4 (estimated)
- Validation: 5-fold cross-validation

Inputs to Model:
1. City characteristics (population, density, growth rate)
2. Market conditions (median home value, rental vacancy)
3. Baseline regulations (WRLURI score)
4. Reform characteristics (type, comprehensiveness)

Output from Model:
- Predicted permit increase (percentage)
- Prediction interval (80% confidence band)
- Feature importance (what drives the prediction)
- Similar cities (which were most similar)

Limitations:
- Only trained on 502 cities (small sample)
- Effects are heterogeneous (varies by city type)
- Doesn't account for COVID or other shocks
- Causal inference coming Phase 4

Why We Use Random Forest:
- Non-linear relationships (reforms affect different cities differently)
- Built-in feature importance (transparency)
- Robust to outliers
- Easy to update as we get more reform data

Next Phase:
"In Phase 4, we'll add more rigorous causal inference methods
(Difference-in-Differences, Synthetic Control, Event Study) that
don't rely on prediction but on comparing treated vs. control cities."
```

#### 5. Assumptions & Validation
```
Key Assumptions:
1. Census permits data is accurate
   - Validation: Cross-check with state data where available
   - Known issues: Some places miss reporting months

2. Zoning reform dates are correct
   - Validation: Verify with city ordinances when possible
   - Known issues: May not capture effective date vs. adoption date

3. No major confounders besides those in model
   - Validation: Robustness checks with/without each variable
   - Known issues: COVID, inflation can affect permits independently

4. Effects are constant across similar cities
   - Validation: Test predictions on held-out cities
   - Known issues: Local context matters (land supply, cost of living)

Validation Approach:
- Train on 400 cities, test on 102 cities (80/20 split)
- Repeat 5 times (5-fold cross-validation)
- Check predictions against actual outcomes
- Examine error distribution

Cross-Validation Results:
- Mean Absolute Error: ~X%
- Root Mean Squared Error: ~Y%
- Outliers: Identified and documented

Uncertainty Quantification:
- For each prediction, provide 80% confidence interval
- Wider intervals for less certain predictions
- Conservative estimates (prefer under-predicting)
```

#### 6. Next Steps: Phase 4 Methods
```
Coming in Phase 4: Causal Inference Methods

Current limitation: Our model predicts effects but doesn't prove causation

Phase 4 will add:

1. Difference-in-Differences (DiD)
   "Compare cities with reforms to similar cities without reforms,
   before and after reform adoption. Control for common trends."

2. Synthetic Control Method (SCM)
   "Create synthetic 'twin' city from combination of peers without
   reform. Compare to actual reformed city."

3. Event Study Design
   "Track permit changes starting 4 years before reform, through
   4 years after. Test pre-trends, measure dynamic effects."

These methods make us confident saying: "Reform CAUSED the increase"
not just "they're correlated"
```

---

## Page 2: /about/data-sources

**Purpose:** Complete reference of where data comes from

### Structure
```
1. Overview (what data we use)
2. Building Permits Data (Census BPS)
3. Economic Data (ACS, BLS)
4. Reform Data (YIMBY, state databases, research)
5. Geographic Data (Census, OpenStreetMap)
6. Geocoding (Nominatim)
7. Update Frequency & Quality
```

### Content Detail

#### 1. Overview
```
"We use only publicly available, high-quality data sources.
Everything is cited and can be downloaded by you."

Data Categories:
- Housing permits (Census, monthly/annual)
- Economics (Census, Bureau of Labor Statistics)
- Zoning reforms (Manual research + databases)
- Geography (Census, OpenStreetMap)
```

#### 2. Building Permits Data - Census BPS
```
Source: U.S. Census Bureau Building Permits Survey
URL: https://www2.census.gov/econ/bps/Place/
Coverage: ~20,000 places, 1980-2024 (monthly)
Frequency: Monthly with 1-2 month lag
Quality: High (official government data)
Limitations:
  - Some places don't report consistently
  - Very small places may have sparse data
  - Includes only permits (not actual construction)

What We Use:
  - pl{year}a.txt files (annual totals by place)
  - Breakdown by unit type (1-unit, 2-unit, 3-4 unit, 5+ unit)
  - 2015-2024 data (10 years)

How We Process It:
  - Download annual files from Census FTP
  - Parse fixed-width format
  - Map place FIPS codes to place names
  - Aggregate by year and unit type
  - Flag missing or inconsistent months

Citation:
"U.S. Census Bureau. (2024). Building Permits Survey - Place Data.
Retrieved from https://www2.census.gov/econ/bps/Place/"
```

#### 3. Economic Data - Census ACS & BLS
```
Source 1: Census American Community Survey
URL: https://data.census.gov/
Coverage: All Census tracts and places, annual
Variables: Population, income, employment, housing
Quality: High (sampled survey, high response rate)
Update Frequency: Annual (usually released in fall)

Source 2: Bureau of Labor Statistics
URL: https://www.bls.gov/
Coverage: Metropolitan areas and states
Variables: Unemployment rate, job growth
Quality: High (official employment data)
Update Frequency: Monthly

How We Use It:
  - Merge with place permits data by geography
  - Use for model features (income, employment, growth)
  - Calculate peer city comparisons

Citation:
"U.S. Census Bureau. (2024). American Community Survey.
Retrieved from https://data.census.gov/"

"Bureau of Labor Statistics. (2024). Local Area Unemployment Statistics.
Retrieved from https://www.bls.gov/"
```

#### 4. Reform Data - Collected Sources
```
Primary Sources:
1. YIMBY Action Reform Tracker
   URL: https://www.sightline.org/ (or actual source)
   Coverage: State-level zoning reforms
   Quality: Actively maintained, cited sources
   How used: 30% of our 502 cities

2. State Legislative Databases
   URLs: Vary by state (e.g., CA: leginfo.legislature.ca.gov)
   Coverage: State-level zoning legislation
   Quality: Official source, sometimes incomplete
   How used: State reform tracking

3. Academic Research
   Papers on: ADU legalization, density bonus, parking reform
   Sources: Journal of Planning Education and Research, etc.
   How used: Document reform impacts (for Phase 4)

4. News & Press Releases
   Sources: Local news, city announcements
   Quality: Varies, requires verification
   How used: Identify recent reforms

5. Municipal Code Research
   Method: Search city websites for ordinances
   Quality: Authoritative but time-consuming
   Coverage: ~20% of reforms verified with actual ordinances

Data Quality Process:
  - Cross-reference reforms across multiple sources
  - Verify dates with official city sources when possible
  - Mark confidence level (high/medium/low)
  - Document sources for each reform

Limitations:
  - Smaller/rural reforms likely undercounted
  - Recent reforms (2024) may not be catalogued yet
  - Effective date vs. adoption date can differ
  - Some reforms are informal (guidelines, not ordinances)

Citation Format for Reforms:
"Reform name. [City, State]. Effective date. Source: [Website/Document]"
```

#### 5. Geographic Data
```
Source 1: Census Geographic Data
URL: https://www.census.gov/geographies/
Coverage: State, county, place boundaries and codes
Quality: Official, regularly updated
How used: Map data, geographic matching

Source 2: OpenStreetMap
URL: https://www.openstreetmap.org/
Coverage: Global, community-maintained
Quality: Good for visualization, less precise for analysis
How used: Base map layer for visualization

Source 3: Nominatim (OSM Geocoding)
URL: https://nominatim.org/
Service: Free geocoding
How used: Convert place names to latitude/longitude
Quality: 96.7% success rate (documented in Phase 1)

Citation:
"OpenStreetMap contributors. (2024). OpenStreetMap.
Retrieved from https://www.openstreetmap.org"
```

#### 6. Update Frequency & Quality
```
Update Schedule:

Monthly:
  - Census Building Permits Survey (1-2 month lag)
  - BLS employment data

Quarterly:
  - ACS rolling estimates (Census)
  - Media monitoring for new reforms

Annually:
  - Full ACS release (October)
  - Review and update reform database
  - Retrain ML models

Data Quality Monitoring:
  - Flag places with missing months
  - Alert if unexpected permit swings
  - Monitor for data entry errors
  - Cross-validate with news reports

Quality Levels:
  - 🟢 High: Official government data (Census, BLS)
  - 🟡 Medium: Academic sources, multiple news reports
  - 🔴 Low: Single news source, unverified dates

How to Report Issues:
  "Found an error? Contact us at [email]. We appreciate corrections."
```

---

## Page 3: /about/limitations

**Purpose:** Honest about what we DON'T know

### Structure
```
1. Introduction
2. Data Limitations
3. Model Limitations
4. Causation Challenges (before Phase 4)
5. Generalization Limits
6. When NOT to Use This Tool
7. What We're Doing to Improve
```

### Content Detail

#### 1. Introduction
```
Headline: "What This Tool Can't Do (Yet)"

"We believe you should know the limits of our analysis before using
it to make decisions. This page explains what we DON'T know and why.

Better to say 'we're unsure' than to give you false confidence in
our estimates."
```

#### 2. Data Limitations
```
A) Geographic Coverage
   - We have 24,535 places, but only 502 with documented reforms
   - Rural places likely under-represented
   - Some states have better data than others
   - Impact: Our reforms database may be biased toward urban, high-growth areas

B) Temporal Coverage
   - We have Census permits 1980-2024
   - But many reforms are very recent (2020-2024)
   - Post-reform periods are short
   - Impact: Can't measure long-term effects yet

C) Measurement Error
   - Some places don't report permits consistently
   - Definition of "permits" varies slightly by place
   - Economic data is sampled (confidence intervals apply)
   - Impact: Margins of error on estimates

D) Confounding Factors
   - Zoning reforms often happen during population booms
   - Can't separate reform effect from market conditions
   - COVID, inflation, interest rates affect all permits
   - Impact: May overestimate or underestimate reform effects

E) Missing Context
   - We don't know local land supply constraints
   - Don't measure actual construction vs. permits
   - Can't assess political factors in adoption
   - Impact: May not predict outcomes in your specific city
```

#### 3. Model Limitations
```
Current ML Model (Pre-Phase 4):

A) Small Training Sample
   - Only 502 cities with documented reforms
   - Traditional models need 1000+ samples for high accuracy
   - Impact: Predictions have wide uncertainty bands

B) Heterogeneous Effects
   - Reforms work differently in different cities
   - ADU reform in CA ≠ ADU reform in rural Iowa
   - Market conditions matter (supply, demand, cost)
   - Impact: Our average prediction may not fit YOUR city

C) Historical Data Only
   - Model learned from 502 past reforms
   - Your city's context might be different
   - New reform types not yet in data
   - Impact: Can't predict unprecedented reforms

D) No Causation (Yet)
   - Current model: "Cities with reforms have X% more permits"
   - Could be correlation, not causation
   - Reforms might have been adopted because permits were rising
   - Impact: Can't claim reform CAUSED the increase

E) Unstable at Extremes
   - Very small towns (<1,000 people): unreliable
   - Very hot markets (SF, NYC): model underfitted
   - Very cold markets (declining cities): sparse data
   - Impact: Use predictions more cautiously for extremes
```

#### 4. Causation Challenges (Before Phase 4)
```
The Fundamental Problem: Causality is Hard

Current approach: "These 502 cities had reforms. They got X% more
permits. So you might too."

The issue: Did the reform cause the permits, or was it correlation?

Example:
- City A: Adopted ADU reform in 2019, got 50% more permits
- Why? Because:
  a) ADU reform enabled new housing? (REFORM caused increase)
  b) Population was booming anyway? (COINCIDENCE)
  c) Tech company moved in, need more housing? (OTHER FACTOR)

Solution coming Phase 4:
- Compare cities WITH reform (treatment group)
- To similar cities WITHOUT reform (control group)
- Use methods like DiD, SCM, Event Study
- Isolate causal effect from other factors

For now:
- Use our predictions as a starting point
- Consider them "optimistic scenarios"
- Pair with expert judgment from your planning team
- Focus on similar cities' experiences (case studies)
```

#### 5. Generalization Limits
```
Our analysis works best for:
✓ Mid-size cities (50,000-500,000 people)
✓ Coastal and high-growth regions
✓ Cities with pre-existing housing shortages
✓ Cities similar to those in our 502-city dataset

Our analysis is uncertain for:
✗ Small towns (<10,000)
✗ Rapidly shrinking cities
✗ Rural areas with abundant land
✗ Unique markets (e.g., company towns)
✗ Unusual reform combinations (no parallel case)

Recommendation:
"If your city is NOT in our confident range, supplement this tool
with local expertise. Talk to nearby cities that adopted similar
reforms."
```

#### 6. When NOT to Use This Tool
```
Don't use for:

1. Zoning code writing
   → This tool analyzes impact, not code design
   → Use model ordinances and legal guidance

2. Parking requirement calculation
   → While we track parking reforms, this isn't parking design
   → Use ITE guidelines or local expertise

3. Affordable housing policy
   → We measure permits, not affordability
   → AH policy requires different analysis

4. Environmental impact
   → This tool focuses on quantity, not environmental effects
   → Environmental review required separately

5. Fiscal impact
   → We don't model tax revenue or costs
   → Use fiscal impact models

6. Non-zoning housing policy
   → Subsidies, lending, maintenance require different tools
   → Zoning is one lever, not the only one
```

#### 7. What We're Doing to Improve
```
Phase 4: Causal Inference
- Add DiD, SCM, Event Study
- More rigorous impact estimates
- Timeline: Q1 2026

Ongoing: Expand Reform Database
- Add more cities with zoning reforms
- Better documentation of reform details
- Improve data quality

Future: Additional Features
- Scenario planning (what if we combine reforms?)
- Subgroup analysis (what works in cities like us?)
- Long-term effect tracking (does impact persist?)
- Academic API (for research community)

How You Can Help:
- Submit reform data for your city
- Provide feedback on predictions
- Share actual outcomes
- Suggest improvements
```

---

## Page 4: /about/faq

**Purpose:** Answer 15-20 common policymaker questions

### Structure
Accordion component with categories:
```
1. About the Tool (3-4 Qs)
2. Data Quality (3-4 Qs)
3. Using the Platform (4-5 Qs)
4. Interpreting Results (3-4 Qs)
5. Reforms & Predictions (4-5 Qs)
6. Technical Details (2-3 Qs)
```

### Questions & Answers

**Category 1: About the Tool**

Q1: "What is this platform and who built it?"
A: "The Zoning Reform Analysis Dashboard is an open-source tool that
helps policymakers analyze how zoning reforms affect housing production.
It was built by [Your Name/Organization] using Census data and academic
methods. We believe housing policy should be evidence-based and
transparent."

Q2: "Why would I use this instead of [other tool]?"
A: "Other tools focus on state-level analysis. We analyze 24,535+ places
so you can find YOUR jurisdiction. We also use research-grade causal
inference methods coming in Phase 4. And it's free with no paywalls."

Q3: "Who should use this tool?"
A: "City planning staff evaluating reforms, city council members voting
on housing policy, state legislators tracking state trends, researchers
studying zoning, and housing advocates supporting policy campaigns."

Q4: "Is this tool available for my jurisdiction?"
A: "We have data for 24,535 U.S. places (cities, towns, CDPs). Search
by name to see if your jurisdiction is included. Even if not listed
separately, you can explore your county or region."

**Category 2: Data Quality**

Q5: "How recent is the permit data?"
A: "Census Building Permits Survey is released monthly with a 1-2 month
lag. So in November, you can see September data. We update our platform
monthly."

Q6: "Is Census permit data accurate?"
A: "Yes, Census data is high-quality government statistics. However,
some small places report inconsistently. We flag these issues. Permits
are what's issued, not what's actually built."

Q7: "How complete is your reforms database?"
A: "We've documented 502 cities with zoning reforms. This is likely
incomplete - there are probably more. We continue adding reforms as we
identify them. Submit your city's reform if it's missing."

Q8: "Why is economic data from 5 years ago?"
A: "Census American Community Survey releases annual data with a 1-year
lag. So 2024 data comes out in late 2025. Older data is fine for
characteristics like median income (don't change quickly)."

**Category 3: Using the Platform**

Q9: "How do I search for my city?"
A: "Use the Search feature at /explore. Start typing your city name.
If it's in Census data, it will appear. Results include current permits,
growth rate, state/national rank."

Q10: "What does 'Growth Rate (5-year)' mean?"
A: "Average permits 2020-2024 divided by average permits 2015-2019.
So if 2.0x, you doubled permits in the recent period vs. the previous
5 years. 0.5x means you're at half the historical rate."

Q11: "How do I use the calculator?"
A: "Go to /calculator. Select a reform type, then your city. The tool
predicts how many additional permits you might expect. Remember: this
is a starting point, not a guarantee."

Q12: "Can I download data for my analysis?"
A: "Yes, we plan to offer bulk data downloads. For now, you can
screenshot charts or request data directly. Email: [contact]"

**Category 4: Interpreting Results**

Q13: "Why is my city's prediction so uncertain?"
A: "Reforms work differently in different cities. The wider the band,
the more uncertain. Use this to plan scenarios: optimistic, realistic,
pessimistic. Pick the scenario that fits your expectations."

Q14: "My city is really different from the comparables. Should I trust
the prediction?"
A: "No, not completely. If your city is unique (tiny town, shrinking,
unusual market), our average prediction probably doesn't fit. Use this
as a starting point. Supplement with local expertise."

Q15: "The calculator says X% increase, but we had Y% after reform. Why
the difference?"
A: "Multiple reasons: (1) We're predicting average, your city is unique,
(2) Other factors besides reform affected permits (economy, regulations),
(3) Time since reform is short, effects grow over time. Good feedback -
share it!"

**Category 5: Reforms & Predictions**

Q16: "What reform types do you track?"
A: "ADU legalization, parking minimum elimination, height/density limits,
upzoning, lot splits, duplex legalization, and others. We're continuously
expanding. Submit your reform type if it's missing."

Q17: "Can you predict combined reforms (e.g., ADU + parking)??"
A: "Not yet. Current tool predicts individual reforms. Phase 4 will add
scenario modeling for combined reforms. For now, use the single-reform
predictions as building blocks."

Q18: "How long does it take to see reform effects?"
A: "Effects vary. Some reforms show up immediately in permits. Others
take 2-3 years as developers understand new opportunities. Very few show
effects after 5+ years."

Q19: "We adopted a reform but didn't get more permits. What went wrong?"
A: "Many possible reasons: (1) Zoning wasn't actually the bottleneck
(cost, land supply, local opposition), (2) Too soon (effects need 1-3
years), (3) Implementation barriers (hard to build, parking still required),
(4) Market conditions changed. This is normal. Case studies help."

**Category 6: Technical Details**

Q20: "What's the R² of your model?"
A: "About 0.2-0.4 (estimated). Not great, but better than random guessing.
Means model explains 20-40% of variation in permit increases. Remaining
variation is due to local factors we can't measure."

Q21: "How do you handle seasonality?"
A: "We use annual aggregates, so seasonal variation averages out. Permits
are counted by year issued, not by season. Some cities have boom/bust
cycles, which our yearly data smooths."

Q22: "Do you use machine learning?"
A: "Yes, Random Forest regression. Non-parametric, finds non-linear
patterns, provides feature importance. In Phase 4, we'll add more rigorous
causal methods (DiD, SCM) alongside ML."

---

## Implementation Checklist

### Page Layout & Navigation
- [ ] Create `/about` layout with sidebar navigation
- [ ] Sidebar shows: Methodology, Data Sources, Limitations, FAQ
- [ ] Active page highlighted in sidebar
- [ ] Breadcrumb navigation (About > Methodology)
- [ ] Mobile: Hamburger menu for sidebar

### Methodology Page
- [ ] Six main sections with clear headings
- [ ] Code blocks for data flow diagrams (ASCII or visual)
- [ ] Tables for metrics explanation
- [ ] Linked sections (Table of Contents at top)
- [ ] Links to Data Sources page where relevant
- [ ] Links to Phase 4 methods explanation

### Data Sources Page
- [ ] Seven source categories
- [ ] Each source has: URL, coverage, frequency, quality level
- [ ] Color-coded quality indicators (green/yellow/red)
- [ ] Update frequency clearly stated
- [ ] Citations in standard academic format
- [ ] Link to submit corrections

### Limitations Page
- [ ] Seven sections covering different limitation types
- [ ] Honest assessment without jargon
- [ ] Examples (e.g., "ADU reform in CA ≠ rural Iowa")
- [ ] Clear "do's and don'ts"
- [ ] Roadmap of improvements (Phase 4, etc.)
- [ ] Link to submit feedback

### FAQ Page
- [ ] 20-22 questions organized in 6 categories
- [ ] Accordion component (click to expand)
- [ ] Search functionality (find Q by keyword)
- [ ] Links between related Qs
- [ ] Links to relevant pages (Methodology, Data Sources)
- [ ] "More questions?" → Contact form

### All Pages
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Code syntax highlighting for any technical sections
- [ ] Images/diagrams where helpful (but keep text-heavy)
- [ ] Page metadata (title, description)
- [ ] Print-friendly CSS
- [ ] External links open in new tabs

---

## Design Guidelines

### Color Scheme
- Primary text: #1F2937 (dark gray)
- Secondary text: #6B7280 (medium gray)
- Links: #2563EB (blue)
- Accent: #10B981 (green for "yes", #EF4444 for "no")
- Background: #F9FAFB (light gray)
- Code background: #F3F4F6 (slightly darker gray)

### Typography
- Headings: Bold, 24-36px
- Body: Regular, 14-16px
- Code: Monospace, 13-14px
- Line-height: 1.6-1.8 (readable)

### Layout
- Max-width: 900px for content
- Sidebar: 250-300px on desktop, hidden on mobile
- Padding: 40px around content
- Section spacing: 60px vertical

---

## Testing Checklist

### Functionality
- [ ] All links work (internal and external)
- [ ] Sidebar navigation highlights active page
- [ ] FAQ accordion expands/collapses
- [ ] FAQ search filters questions
- [ ] No broken images or code blocks
- [ ] External links open in new tabs

### Content
- [ ] All spelling and grammar correct
- [ ] No jargon without explanation
- [ ] Numbers and citations accurate
- [ ] Links to relevant pages work
- [ ] Email contact is valid

### Responsive Design
- [ ] Desktop (1920px): Layout optimal
- [ ] Tablet (768px): Sidebar becomes menu
- [ ] Mobile (375px): Single-column layout
- [ ] Code blocks don't overflow
- [ ] Text remains readable at all sizes

### SEO & Metadata
- [ ] Page titles set: "Methodology | Zoning Reform Analysis"
- [ ] Meta descriptions written (60-160 chars)
- [ ] Headings are proper H1/H2/H3 hierarchy
- [ ] Links have descriptive anchor text
- [ ] No orphaned pages (linked from main nav)

---

## Deployment

### Deploy to Production
```bash
npm run build  # Verify no TypeScript errors
git add .
git commit -m "Agent 10: Build methodology transparency pages"
git push origin main
# Deploy to hosting
```

### Verification
- [ ] All 4 pages accessible at `/about/*`
- [ ] Navigation works
- [ ] Content displays correctly
- [ ] Mobile responsive verified
- [ ] Links to other pages functional

---

## Success Criteria

✅ Four methodology pages deployed
✅ Comprehensive, honest documentation
✅ Accessible to non-technical policymakers
✅ Builds trust through transparency
✅ Links integrated with landing page
✅ All technical details explained clearly
✅ FAQ answers 90% of common questions
✅ Ready for policymaker reference

---

## Timeline
- **Week 1-2:** Write all content
- **Week 3:** Design, implement, test
- **Ready by:** End of Week 3

---

**Status:** Ready to build
**Duration:** 10-15 hours
**Start:** Immediately (parallel with Agents 9, 11)

