# Agent 12: Difference-in-Differences (DiD) Causal Analysis

**Phase:** 4
**Agent:** 12
**Duration:** 25-30 hours
**Execution:** Parallel with Agent 13 (Agent 14 joins later)
**Goal:** Add research-grade causal inference showing reform IMPACT, not just correlation

---

## Mission

Transform the platform from showing "correlation" (cities with reform X had Y% more permits) to showing "causation" (reform X CAUSED Y% permit increase).

Use Difference-in-Differences (DiD) methodology to compare:
- **Treatment group:** Cities that adopted reform X in year Y
- **Control group:** Similar cities that did NOT adopt reform X
- **Effect:** Permit increase attributable to the reform itself

---

## What to Build

### Backend: DiD Calculation Engine

**File:** `scripts/31_compute_did_analysis.py`

This script will:

1. **Load data:**
   - Place metrics (24,535 places with 2015-2024 permit data)
   - Reform adoption database (502 reform cities)
   - Economic characteristics (from Census)

2. **For each reform type (7 types):**
   - Identify all cities that adopted reform
   - Group by adoption year (2015-2024)
   - For each adoption year:
     - **Treatment group:** Cities that adopted reform in year Y (must have 3+ data points before and after)
     - **Control group:** Similar cities (matched on pre-treatment trends, economics, size) that never adopted
     - **Parallel trends test:** Verify treatment and control had same trends BEFORE reform
     - **DiD calculation:**
       ```
       DiD_Effect = (Treated_Post - Treated_Pre) - (Control_Post - Control_Pre)
       ```
     - **Confidence intervals:** 95% CI around effect size
     - **Statistical test:** Is effect significantly different from 0?

3. **Store results:**
   - JSON with DiD estimates for each reform type × year combination
   - Include: point estimate, lower CI, upper CI, p-value, n_treated, n_control
   - Cache for fast API responses

4. **Output file:** `data/outputs/did_analysis_results.json`

**Key considerations:**
- Minimum 3 years pre-treatment and 3 years post-treatment data
- Control group matched on pre-treatment characteristics
- Robust standard errors for inference
- Handle multiple adoption years for same reform type

### Utility Functions

**File:** `app/lib/did-utils.ts`

```typescript
interface DiDResult {
  reform_type: string
  adoption_year: number
  treatment_effect: number  // % change in permits
  lower_ci_95: number
  upper_ci_95: number
  p_value: number
  n_treated: number
  n_control: number
  parallel_trends_p_value: number
  interpretation: string
}

interface DiDAnalysis {
  reform_type: string
  results_by_year: DiDResult[]
  average_effect: number
  statistical_summary: string
}

// Load pre-computed DiD results
export async function loadDidResults(): Promise<DiDAnalysis[]>

// Get DiD estimate for specific reform and year
export function getDidEstimate(
  reform_type: string,
  adoption_year: number
): DiDResult | null

// Format DiD result for display
export function formatDidResult(result: DiDResult): string

// Interpret statistical significance
export function interpretSignificance(p_value: number): string
```

### API Endpoint

**File:** `app/app/api/causal-analysis/did/route.ts`

```typescript
// GET /api/causal-analysis/did
// Returns all DiD results

// GET /api/causal-analysis/did?reform_type=ADU&adoption_year=2020
// Returns DiD for specific reform and year

export async function GET(request: Request) {
  // Query parameters:
  // - reform_type (optional): Filter to specific reform
  // - adoption_year (optional): Filter to specific year
  // - state (optional): Filter by state

  // Return:
  // {
  //   results: DiDResult[],
  //   summary: {
  //     total_reforms_analyzed: number,
  //     reforms_with_significant_effect: number,
  //     average_treatment_effect: number,
  //     confidence: string
  //   }
  // }
}
```

### Dashboard Component

**File:** `app/components/visualizations/DiDAnalysisPanel.tsx`

This component displays DiD results with:

**1. Overview Section:**
- Title: "Causal Impact of Zoning Reforms (Difference-in-Differences Analysis)"
- Subtitle: "These numbers show what reform CAUSED, not just correlation"
- Key findings (3-4 bullet points)

**2. Reform Type Selector:**
- Dropdown: All 7 reform types + "Compare All"
- Shows only reforms with significant DiD effects first

**3. DiD Results Table:**
```
| Reform Type | Adoption Year | Treatment Effect | 95% CI | P-value | N_Treated | N_Control | Interpretation |
|---|---|---|---|---|---|---|---|
| ADU | 2019 | +12.3% | [+8.1%, +16.5%] | 0.001 | 23 | 87 | Significant ✓ |
| ...
```

**4. Visualization:**
- **Chart type:** Forest plot (horizontal lines with confidence intervals)
- X-axis: Treatment effect percentage (-5% to +30%)
- Each reform type as a row
- Point estimate as dot, confidence interval as line
- Color: Green if significant (p<0.05), Gray if not significant

**5. Parallel Trends Assumption:**
- Table showing pre-treatment trends match p-value for each reform
- Alert if p < 0.10 (parallel trends may be violated)
- Explanation: "We tested if treatment and control groups had same trends BEFORE reform adoption"

**6. Methodology Section (Expandable):**
- Brief explanation of DiD
- When to trust DiD results
- Limitations of DiD approach
- Link to `/about/methodology#did` for full technical details

**7. Export Button:**
- "Download DiD Results (CSV)"
- Downloads table of all DiD estimates with confidence intervals

### Integration with Existing Dashboard

**Add to:** `app/app/dashboard/page.tsx`

- Add new tab: "Causal Analysis" (next to existing tabs)
- In Causal Analysis tab: Import and display `<DiDAnalysisPanel />`
- Ensure styling matches existing dashboard design

---

## Technical Implementation Details

### DiD Calculation Steps (Python)

```python
# Pseudocode for DiD calculation
def compute_did_for_reform(reform_type, adoption_year):
    # 1. Load data
    places = load_place_metrics()
    reforms = load_reform_database()

    # 2. Identify treatment group
    treated_places = reforms[reforms['reform_type'] == reform_type
                              & reforms['adoption_year'] == adoption_year]['place_fips']

    # 3. Identify control group
    control_places = identify_controls(
        treated_places=treated_places,
        match_on=['pre_treatment_trend', 'region', 'size_category', 'economic_growth']
    )

    # 4. Verify parallel trends
    pre_trend_treated = compute_trend(places[treated_places], year_range=[adoption_year-3, adoption_year-1])
    pre_trend_control = compute_trend(places[control_places], year_range=[adoption_year-3, adoption_year-1])
    parallel_trends_pval = statistical_test(pre_trend_treated == pre_trend_control)

    # 5. Compute DiD
    treated_pre = mean(places[treated_places][adoption_year-3:adoption_year])
    treated_post = mean(places[treated_places][adoption_year+1:adoption_year+4])
    control_pre = mean(places[control_places][adoption_year-3:adoption_year])
    control_post = mean(places[control_places][adoption_year+1:adoption_year+4])

    did_effect = (treated_post - treated_pre) - (control_post - control_pre)

    # 6. Confidence intervals
    ci = bootstrap_ci(did_effect, n_bootstrap=1000)

    # 7. Statistical test
    p_value = significance_test(did_effect, ci)

    return DiDResult(...)
```

### Data Structure

**Input data requirements:**
- Place metrics file with annual permit counts (2015-2024)
- Reform database with reform type, adoption year, state, city
- Census data for matching characteristics

**Output data structure:**
```json
{
  "reform_analyses": [
    {
      "reform_type": "ADU",
      "results": [
        {
          "adoption_year": 2019,
          "treatment_effect_percent": 12.3,
          "lower_ci_95": 8.1,
          "upper_ci_95": 16.5,
          "p_value": 0.001,
          "n_treated": 23,
          "n_control": 87,
          "parallel_trends_p_value": 0.45,
          "significance": "significant"
        }
      ]
    }
  ]
}
```

---

## Success Criteria

### Code Quality
- ✅ Python script runs without errors
- ✅ DiD calculations mathematically correct
- ✅ Results match econometric literature standards
- ✅ Code well-commented and documented

### API Functionality
- ✅ API endpoint returns correct JSON
- ✅ Filters work (reform type, adoption year, state)
- ✅ Response time < 1 second
- ✅ No TypeScript errors

### UI/UX
- ✅ Component renders without errors
- ✅ Forest plot visualization correct
- ✅ All interactive elements work (dropdown, table sorting)
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Matches dashboard design system
- ✅ No console errors

### Analytics
- ✅ DiD results make sense (effect sizes reasonable)
- ✅ Confidence intervals computed correctly
- ✅ P-values align with intuition
- ✅ Parallel trends assumption validated

### Documentation
- ✅ Code comments explain DiD methodology
- ✅ Component comments explain display logic
- ✅ README section on DiD analysis added
- ✅ Link to full methodology working

### Integration
- ✅ Builds successfully with Phase 3 work
- ✅ Dashboard tab added and functional
- ✅ Styling consistent with existing design
- ✅ No conflicts with other components

---

## Questions You Might Have

**Q: "What if not enough cities adopted a reform?"**
A: Filter them out. Only show DiD results where n_treated >= 5 and n_control >= 10.

**Q: "How do we match control groups?"**
A: Use Mahalanobis distance matching on pre-treatment characteristics (region, size, economic growth).

**Q: "What if parallel trends assumption is violated?"**
A: Show warning in UI. Explain that DiD results may be unreliable. Consider synthetic control (Agent 14) as robustness check.

**Q: "Can we show effects over time (not just pre/post)?"**
A: That's the event study analysis (Agent 14 will do this). For now, keep DiD simple (average post vs pre).

**Q: "How do we handle reforms adopted by many cities same year?"**
A: That's ideal for DiD - more treatment units = better statistical power. Use all of them.

**Q: "What if cities adopted multiple reforms?"**
A: Good question. For now, analyze each reform separately. Future: interaction analysis.

---

## Execution Plan

### Day 1-2: Data Preparation
- Load place metrics and reform database
- Validate data quality
- Create treated/control groupings
- Output to intermediate files for testing

### Day 3-5: DiD Calculation
- Implement control group matching
- Compute parallel trends tests
- Calculate DiD effects with confidence intervals
- Generate results JSON file

### Day 6-7: Testing & Validation
- Verify results make sense
- Compare to literature benchmarks
- Test edge cases (small n, single reform, etc.)
- Optimize performance if needed

### Day 8: API Implementation
- Create API endpoint
- Test with different query parameters
- Add error handling
- Document API

### Day 9-10: Frontend Component
- Build DiD results panel component
- Implement forest plot visualization
- Add filters and interactive elements
- Test responsiveness

### Day 11: Integration & Testing
- Add tab to dashboard
- Verify styling matches
- Run full build test
- Test with real data

### Day 12: Documentation & Deployment
- Add code comments
- Write README section
- Commit to git
- Ready for next agent

---

## Files You'll Create/Modify

### New Files
- `scripts/31_compute_did_analysis.py` (300+ lines)
- `app/lib/did-utils.ts` (150+ lines)
- `app/app/api/causal-analysis/did/route.ts` (100+ lines)
- `app/components/visualizations/DiDAnalysisPanel.tsx` (400+ lines)
- `data/outputs/did_analysis_results.json` (generated)

### Modified Files
- `app/app/dashboard/page.tsx` - Add "Causal Analysis" tab with DiD component
- `README.md` - Add section on DiD analysis

---

## Important Notes

1. **Parallel with Agent 13:** This agent runs in parallel with Agent 13 (Scenario Modeling). They don't interact, so work independently.

2. **Data availability:** All data files (place metrics, reforms, Census data) are already in the repo from Phase 1-2. You won't need to download anything.

3. **Dependencies:** You'll need:
   - `scikit-learn` (already have)
   - `pandas` (already have)
   - `numpy` (already have)
   - `statsmodels` (may need to add: `pip install statsmodels`)

4. **Git branching:**
   - Create branch: `claude/implement-did-analysis-<id>`
   - Commit frequently
   - Push to origin
   - Will be merged after testing

5. **Reference materials:**
   - Existing Phase 2 dashboard code
   - Existing API routes for structure
   - Phase 3 landing page for UI patterns

---

## Integration with Other Phase 4 Agents

**Agent 12 (you)** builds the causal analysis foundation.

**Agent 13** (Scenario Modeling) will:
- Use your DiD results as validation
- Compare scenario predictions to historical DiD effects
- Show "if you adopt this reform, expect X (based on similar cities)"

**Agent 14** (Synthetic Control + Event Study) will:
- Provide alternative causal estimates
- Show effect size over time (vs. your simple pre/post)
- Validate your DiD results

---

## Ready to Start?

You have everything you need:
- ✅ Data files in place
- ✅ Architecture documented
- ✅ Component specs written
- ✅ Integration path clear
- ✅ Success criteria defined

**Start with:** Data preparation and DiD calculation script. Get the Python working first, then build the frontend.

---

## Success = Research-Grade Causal Inference

When you're done, the platform will be able to show policymakers:

> "Our analysis shows that ADU zoning reforms CAUSED a 12.3% increase in residential building permits within 2-3 years of adoption [95% CI: 8.1%-16.5%, p=0.001]. This estimate is based on comparing 23 reform cities to 87 similar non-reform cities using Difference-in-Differences methodology."

**That's the goal. Let's build it.**

---

🤖 **Start building Agent 12: DiD Analysis**
Copy this entire prompt into Claude Code Web and paste into chat.
Press Enter to begin.

---
