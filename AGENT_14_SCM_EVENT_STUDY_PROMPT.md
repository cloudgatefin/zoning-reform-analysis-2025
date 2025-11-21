# Agent 14: Synthetic Control Method & Event Study Analysis

**Phase:** 4
**Agent:** 14
**Duration:** 35-40 hours
**Execution:** Joins Agent 12 & 13 after 1 week (Balanced approach) OR starts immediately (Aggressive approach)
**Goal:** Provide alternative causal estimates and show WHEN effects take hold

---

## Mission

Build advanced causal inference methods that:

1. **Synthetic Control Method (SCM):** Compare treated city to synthetic peer constructed from control cities
   - Shows: "Your city vs. what would have happened without reform"
   - Perfect for: Single case study (your city analysis)

2. **Event Study Design:** Show dynamic treatment effects over time
   - Shows: Effect grows from 0% year 1 → peak by year 3-5
   - Perfect for: Understanding implementation timeline

Together, these provide robustness checks and complement Agent 12's DiD analysis.

---

## What to Build

### 1. Synthetic Control Method (SCM) Calculation

**File:** `scripts/32_synthetic_control.py`

Implement SCM to compare:
- **Treated unit:** Single city that adopted reform
- **Donor pool:** All control cities
- **Weights:** Optimize to match pre-treatment trajectory
- **Prediction:** What would treated city look like without reform?
- **Effect:** Actual post-treatment minus synthetic prediction

**Algorithm:**

```python
def synthetic_control_analysis(treated_city_fips, reform_type, adoption_year):
    """
    Synthetic Control Method for single city case study

    Steps:
    1. Extract pre-treatment period (adoption_year - 5 to adoption_year - 1)
    2. Extract post-treatment period (adoption_year to current)
    3. Identify donor pool (cities that never adopted reform + don't violate parallel trends)
    4. Optimize weights for each donor city such that:
       - Weighted sum of donor pre-treatment = treated pre-treatment
       - Weights non-negative
       - Weights sum to 1
    5. Apply same weights to post-treatment donors
    6. Synthetic post-treatment = weighted sum of donor post-treatment
    7. Effect = treated post-treatment - synthetic post-treatment

    Returns:
    - Synthetic city permits (pre and post)
    - Treatment effect size
    - Donor city weights
    - Pre-treatment fit quality
    """

    # 1. Load data
    treated = get_permits(treated_city_fips, adoption_year - 5, current_year)

    # 2. Define periods
    pre_period = range(adoption_year - 5, adoption_year)
    post_period = range(adoption_year, current_year + 1)

    # 3. Get donor pool
    donors = identify_donors(reform_type, treated_city_fips)
    donor_data = {fips: get_permits(fips, adoption_year - 5, current_year)
                  for fips in donors}

    # 4. Optimize weights
    from scipy.optimize import minimize

    def loss(weights):
        # Weighted donor pre-treatment sum
        synthetic_pre = sum(weights[i] * donor_data[fips][pre_period]
                           for i, fips in enumerate(donors))
        # Minimize squared distance
        return np.sum((treated[pre_period] - synthetic_pre) ** 2)

    # Constraints: weights >= 0, sum to 1
    constraints = {
        'type': 'eq',
        'fun': lambda w: np.sum(w) - 1
    }
    bounds = [(0, 1) for _ in donors]

    result = minimize(loss, x0=np.ones(len(donors))/len(donors),
                     bounds=bounds, constraints=constraints)

    optimal_weights = result.x

    # 5. Construct synthetic post-treatment
    synthetic_post = sum(optimal_weights[i] * donor_data[fips][post_period]
                        for i, fips in enumerate(donors))

    # 6. Calculate effects
    treatment_effect = treated[post_period] - synthetic_post

    # 7. Pre-treatment fit
    rmse_fit = np.sqrt(loss(optimal_weights))

    return {
        'treated_permits': treated,
        'synthetic_permits': synthetic_post,
        'treatment_effect': treatment_effect,
        'donor_weights': {donors[i]: w for i, w in enumerate(optimal_weights)},
        'rmse_fit': rmse_fit,
        'donor_pool_size': len(donors),
        'top_donors': top_3_donors(optimal_weights, donors)
    }
```

**Output file:** `data/outputs/scm_analysis_results.json`

```json
{
  "scm_analyses": [
    {
      "treated_city": "Portland, OR",
      "reform_type": "ADU",
      "adoption_year": 2018,
      "treated_permits_pre": [120, 125, 118, 122, 115],
      "synthetic_permits_pre": [118, 124, 117, 121, 116],
      "treated_permits_post": [140, 165, 180, 185],
      "synthetic_permits_post": [123, 128, 131, 135],
      "treatment_effect_post": [17, 37, 49, 50],
      "donor_weights": {
        "Eugene, OR": 0.35,
        "Salem, OR": 0.25,
        "Boulder, CO": 0.40,
        ...
      },
      "rmse_pre_treatment_fit": 2.3,
      "top_donor_cities": ["Boulder, CO", "Eugene, OR", "Salem, OR"],
      "interpretation": "Synthetic Portland would have had 131 permits/yr post-reform; actual was 168. This 37-permit-per-year increase is attributable to ADU reform."
    }
  ]
}
```

### 2. Event Study Implementation

**File:** `scripts/33_event_study.py`

Event study shows dynamic effects over time:

```python
def event_study_analysis(reform_type):
    """
    Event Study: Show how treatment effect evolves over time

    Design:
    - Event = reform adoption
    - Time = years relative to adoption (-5 to +5)
    - Group all cities by adoption year
    - Pool data across years
    - Regress: Permits ~ reform_adoption + time_since_adoption + FE
    - Extract coefficients for each year relative to adoption

    Result: Effect trajectory over time
    """

    # 1. Get all cities that adopted reform_type
    adopted_cities = reforms_db[reforms_db['reform_type'] == reform_type]

    # 2. Prepare panel data for each city
    panel_data = []
    for _, row in adopted_cities.iterrows():
        city_fips = row['place_fips']
        adoption_year = row['adoption_year']
        permits = get_permits(city_fips, adoption_year - 5, adoption_year + 5)

        for year in range(adoption_year - 5, adoption_year + 6):
            panel_data.append({
                'city_fips': city_fips,
                'year': year,
                'permits': permits[year],
                'time_to_event': year - adoption_year,  # -5 to +5
                'treated': 1 if year >= adoption_year else 0
            })

    df = pd.DataFrame(panel_data)

    # 3. Run event study regression
    import statsmodels.api as sm

    # Create indicators for each year relative to event
    for lag in range(-5, 6):
        df[f'lag_{lag}'] = (df['time_to_event'] == lag).astype(int)

    # Regression: Permits ~ lags + city FE
    formula = 'permits ~ ' + ' + '.join([f'lag_{i}' for i in range(-5, 6)])
    # (add city fixed effects)

    model = sm.formula.ols(formula, data=df).fit()

    # 4. Extract coefficients
    event_effects = {}
    for lag in range(-5, 6):
        if f'lag_{lag}' in model.params:
            event_effects[lag] = {
                'coefficient': model.params[f'lag_{lag}'],
                'std_error': model.bse[f'lag_{lag}'],
                'p_value': model.pvalues[f'lag_{lag}']
            }

    return {
        'reform_type': reform_type,
        'n_cities': len(adopted_cities),
        'event_effects': event_effects,
        'model_r_squared': model.rsquared
    }
```

**Output file:** `data/outputs/event_study_results.json`

```json
{
  "event_studies": [
    {
      "reform_type": "ADU",
      "n_cities": 23,
      "event_effects": [
        {"year_relative_to_adoption": -5, "effect": 0, "lower_ci": -2, "upper_ci": 2},
        {"year_relative_to_adoption": -4, "effect": 1, "lower_ci": -1, "upper_ci": 3},
        ...
        {"year_relative_to_adoption": 0, "effect": 2, "lower_ci": 0, "upper_ci": 4},
        {"year_relative_to_adoption": 1, "effect": 8, "lower_ci": 5, "upper_ci": 11},
        {"year_relative_to_adoption": 2, "effect": 14, "lower_ci": 10, "upper_ci": 18},
        {"year_relative_to_adoption": 3, "effect": 16, "lower_ci": 12, "upper_ci": 20},
        {"year_relative_to_adoption": 4, "effect": 17, "lower_ci": 13, "upper_ci": 21},
        {"year_relative_to_adoption": 5, "effect": 17, "lower_ci": 13, "upper_ci": 21}
      ],
      "pre_trend_test_p_value": 0.42,
      "interpretation": "Effect statistically indistinguishable from 0 pre-reform, increases to +17 permits/yr by year 3-5"
    }
  ]
}
```

### 3. API Endpoints

**File:** `app/app/api/causal-analysis/scm/route.ts`

```typescript
// GET /api/causal-analysis/scm?city_fips=XXXXX&reform_type=ADU
export async function GET(request: Request) {
  // Returns: SCM analysis for specific city and reform
  // {
  //   treated_city: string,
  //   synthetic_city: "Synthetic peer constructed from ...",
  //   treatment_effect: number,
  //   donor_weights: { city: weight, ... },
  //   interpretation: string
  // }
}
```

**File:** `app/app/api/causal-analysis/event-study/route.ts`

```typescript
// GET /api/causal-analysis/event-study?reform_type=ADU
export async function GET(request: Request) {
  // Returns: Event study for specific reform type
  // {
  //   reform_type: string,
  //   event_effects: [
  //     { year_relative_to_adoption, effect, lower_ci, upper_ci },
  //     ...
  //   ],
  //   interpretation: string
  // }
}
```

### 4. Dashboard Visualizations

**File:** `app/components/visualizations/SyntheticControlPanel.tsx`

Display SCM results with:

**Section 1: City Selection**
- Dropdown: Select reform type
- Dropdown: Select city (that adopted reform)
- "Load SCM Analysis" button

**Section 2: Visual Comparison**
- **Dual line chart:**
  - X-axis: Year (2015-2024)
  - Y-axis: Permits per year
  - Solid line: Treated city actual permits
  - Dashed line: Synthetic peer permits
  - Vertical line at: Reform adoption year
  - Pre-adoption: Lines should match (if good match)
  - Post-adoption: Gap = treatment effect

**Section 3: Donor Cities**
- Table showing top 5 donor cities and their weights
- Explanation: "These control cities were weighted to match [Treated City]'s pre-reform trajectory"

**Section 4: Pre-Treatment Fit Quality**
- RMSE value
- Visual: Pre-treatment gap (should be small)
- Caveat if fit is poor: "Synthetic match not perfect; results should be interpreted cautiously"

**Section 5: Results Summary**
```
Treatment Effect Summary:
- Pre-reform gap: X permits/yr
- Post-reform gap: Y permits/yr
- Attributable to reform: Y - X permits/yr
- Time period analyzed: [start] to [end]
```

---

**File:** `app/components/visualizations/EventStudyChart.tsx`

Display event study results with:

**Section 1: Event Study Graph**
- **X-axis:** Years relative to reform adoption (-5 to +5)
- **Y-axis:** Treatment effect (permits per year)
- **Points:** Coefficient for each year
- **Error bars:** 95% confidence intervals
- **Pre-trend line:** Years -5 to -1 (should be flat/non-significant)
- **Event line:** Vertical at year 0 (adoption)
- **Post-trend line:** Years 0-5 (shows effect ramp-up)
- **Highlight color:** Green if significant, gray if not

**Section 2: Interpretation**
- Bullet points:
  - "Effect appears in year [X] (first significant year)"
  - "Effect peaks at [Y]% in year [Z]"
  - "Pre-trend test p-value: [p] (parallel trends assumption passes/fails)"
  - Implications for implementation timeline

**Section 3: Comparison to DiD**
- Side-by-side table:
  | Method | Treatment Effect | Confidence |
  | DiD (Agent 12) | X% | High |
  | Event Study (this) | Y% | Medium |
  | Scenario Pred (Agent 13) | Z% | Medium |
  - Explanation: "These three methods show consistent effects, increasing confidence in causal claims"

### 5. Integration with Dashboard

Add two new tabs to "Causal Analysis" section (created by Agent 12):
- **Tab 1:** "DiD Analysis" (Agent 12)
- **Tab 2:** "Synthetic Control" (this agent) ← NEW
- **Tab 3:** "Event Study" (this agent) ← NEW

---

## Data Requirements

### Inputs
- Place metrics (24,535 places, 2015-2024 permits)
- Reform database (502 cities with adoption dates)
- Census/economic data for weighting

### Outputs
- `data/outputs/scm_analysis_results.json`
- `data/outputs/event_study_results.json`
- API routes for accessing results
- Dashboard visualizations

---

## Technical Specifications

### Synthetic Control Optimization

- **Solver:** scipy.optimize.minimize or cvxpy for better large-scale problems
- **Loss function:** Euclidean distance on pre-treatment period
- **Constraints:** Weights non-negative, sum to 1 (convex hull)
- **Convergence:** RMSE < 5% of treated city mean
- **Robustness:** Leave-one-out donor pool robustness

### Event Study Regression

- **Model:** OLS with fixed effects
- **Formula:** Permits ~ YearRelativeToAdoption + CityFE
- **Clustering:** Standard errors clustered at city level
- **Lags:** -5 to +5 years relative to adoption
- **Omitted category:** Year -1 (pre-reform baseline)

### Inference

- **Confidence intervals:** 95% (derived from standard errors)
- **Hypothesis tests:** Two-tailed, alpha = 0.05
- **Multiple comparisons:** Bonferroni correction for event study lags

---

## Files You'll Create/Modify

### New Files
- `scripts/32_synthetic_control.py` (350+ lines)
- `scripts/33_event_study.py` (300+ lines)
- `app/app/api/causal-analysis/scm/route.ts` (100+ lines)
- `app/app/api/causal-analysis/event-study/route.ts` (100+ lines)
- `app/components/visualizations/SyntheticControlPanel.tsx` (400+ lines)
- `app/components/visualizations/EventStudyChart.tsx` (300+ lines)
- `data/outputs/scm_analysis_results.json` (generated)
- `data/outputs/event_study_results.json` (generated)

### Modified Files
- `app/app/dashboard/page.tsx` - Add SCM and Event Study tabs to Causal Analysis section
- `app/package.json` - Add scipy if not present (for optimization)

---

## Dependencies

Python:
```bash
pip install scipy statsmodels
```

npm (all already have):
```bash
npm install recharts react-hook-form lucide-react
```

---

## Success Criteria

### Python Scripts
- ✅ SCM optimization converges successfully
- ✅ Event study regression runs without errors
- ✅ Output JSON files generated with correct structure
- ✅ Results mathematically correct
- ✅ Performance reasonable (< 5 min for all analyses)

### API Endpoints
- ✅ Both endpoints return correct JSON
- ✅ Query parameters filter correctly
- ✅ Error handling for invalid inputs
- ✅ Response time < 2 seconds

### Visualizations
- ✅ SCM dual-line chart renders correctly
- ✅ Event study plot shows error bars
- ✅ Pre-trend test visible and interpretable
- ✅ Comparison table accurate
- ✅ All interactive elements work
- ✅ Responsive design verified

### Integration
- ✅ Tabs added to Causal Analysis section
- ✅ No conflicts with Agent 12 work
- ✅ Build passes with all three agents
- ✅ No TypeScript errors
- ✅ Styling consistent

---

## Execution Plan

### Day 1-2: Data Preparation & SCM Setup
- Load and validate data
- Implement donor pool identification
- Set up optimization framework
- Create test cases

### Day 3-5: SCM Algorithm
- Implement weight optimization
- Handle edge cases (no good donors, etc.)
- Validate on test cities
- Generate SCM results file

### Day 6-7: Event Study Implementation
- Set up regression framework
- Implement fixed effects model
- Calculate inference (CIs, p-values)
- Generate event study results file

### Day 8: Testing & Validation
- Verify SCM synthetic matches reality pre-treatment
- Verify event study pre-trends are flat
- Check results align with DiD estimates
- Optimize performance

### Day 9: API Implementation
- Build both API routes
- Add error handling
- Test with queries
- Caching if needed

### Day 10-11: Visualization Components
- Build SCM panel (dual-line chart, donors, fit quality)
- Build event study chart (with error bars)
- Implement comparison table
- Test responsiveness

### Day 12-13: Integration
- Add tabs to dashboard
- Ensure styling matches
- Full integration test
- No console errors

### Day 14: Documentation & Commit
- Code comments
- README section
- Git commit
- Ready for merge

---

## Questions You Might Ask

**Q: "What if we can't find good donor cities for SCM?"**
A: Show warning. Fall back to pooled event study (average across all cities with reform). Include caveat in interpretation.

**Q: "How do we handle multiple reforms adopted by same city?"**
A: For SCM, match on specific reform. For event study, use only first reform (or separate analyses for each reform).

**Q: "Should SCM be for individual cities or pooled?"**
A: Both. Individual city for case study. Pooled synthetic control (average synthetic across all treated cities) for overall effect.

**Q: "Does event study include cities with multiple adoption dates?"**
A: Yes. Treat each adoption as separate "event" in the panel. Control for multiple treats in regression.

**Q: "How does this compare to Agent 12's DiD?"**
A: Different approaches, similar goals:
- DiD: Average effect across all treated cities
- SCM: Individual city case study (your city vs synthetic peer)
- Event Study: Dynamic effect over time (when does effect appear?)

**Q: "Should we weight by city size?"**
A: For main analyses, unweighted. For sensitivity, show weighted version too (weights = pre-reform permits).

---

## Integration with Other Agents

**Agent 12 (DiD)** provides:
- Average treatment effects for comparison
- Validates your results (should be similar)
- Shows alternative causal estimate

**Agent 13 (Scenarios)** uses:
- Event study time paths for scenario predictions
- SCM results for comparable cities lookup
- Can cite SCM/Event Study as validation

**You (Agent 14)** provide:
- Robustness checks on DiD results
- Time path of effects (when to implement)
- Single city case studies

---

## Success = Multiple Robustness Checks

When complete, policymakers see:

> "We analyzed ADU reform impacts using three complementary methods:
>
> 1. **Difference-in-Differences (DiD):** Average effect across 23 treated cities is +12.3% permits [95% CI: 8.1%-16.5%, p=0.001]
>
> 2. **Event Study:** Effect emerges in year 1-2, peaks at +15% by year 3-5. Pre-trend test confirms parallel trends assumption (p=0.42).
>
> 3. **Synthetic Control (Example: Portland):** Portland's permits would have been ~131/yr without reform; actual was 168/yr, suggesting +37-permit attributable effect.
>
> All three methods show consistent effects, increasing our confidence these reforms CAUSED permit increases."

**That's research-grade causal inference.**

---

## Ready to Start?

You have:
- ✅ All data available
- ✅ Algorithms specified
- ✅ Integration path clear
- ✅ Success criteria defined
- ✅ Execution plan detailed

**Start with:** SCM algorithm - get optimization working on test data. Then event study regression. Then visualizations.

---

🤖 **Start building Agent 14: Synthetic Control & Event Study**
Copy this entire prompt into Claude Code Web and paste into chat.
Press Enter to begin.

---
