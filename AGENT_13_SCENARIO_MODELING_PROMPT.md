# Agent 13: Scenario Modeling & Prediction System

**Phase:** 4
**Agent:** 13
**Duration:** 30-40 hours
**Execution:** Parallel with Agent 12 (Agent 14 joins later)
**Goal:** Answer the core policymaker question: "What if we adopt this reform?"

---

## Mission

Build an interactive scenario modeling system that lets policymakers:

1. **Select a city** they're interested in
2. **Choose reform(s)** they're considering
3. **Get predictions:** "If you adopt ADU zoning, expect X% more permits"
4. **See scenarios:** Best-case, realistic-case, worst-case outcomes
5. **Compare to similar cities:** "Here's what happened in similar places"
6. **Download report:** PDF summary of scenarios

---

## What to Build

### 1. Scenario Builder UI Component

**File:** `app/components/ScenarioBuilder.tsx`

Interactive form component with:

**Section 1: Select Your City**
- Dropdown search (24,535 places)
- Shows: City, State, Current permits/year, Region
- Must select one city

**Section 2: Select Reform(s)**
- Checkboxes for 7 reform types:
  - [ ] ADU (Accessory Dwelling Units)
  - [ ] Upzoning
  - [ ] Zoning Modernization
  - [ ] Parking Requirements
  - [ ] Fee Reduction
  - [ ] Streamlined Permitting
  - [ ] Mixed-Use Development
- Can select 1-3 reforms
- Shows: Brief description, # of cities that adopted, average effect

**Section 3: Prediction Parameters**
- Slider: "Time horizon" (1-10 years)
- Dropdown: "Growth assumption" (slow, baseline, fast)
- Checkbox: "Account for economic conditions"

**Section 4: Submit**
- "Generate Scenarios" button
- Shows loading spinner while computing

### 2. Prediction Engine

**File:** `app/lib/scenario-utils.ts`

```typescript
interface Scenario {
  id: 'optimistic' | 'realistic' | 'pessimistic'
  name: string
  description: string
  predicted_permit_increase_pct: number
  predicted_annual_permits: number
  confidence: number
  explanation: string
  key_drivers: string[]
  comparison_to_similar: string
}

interface ScenarioResult {
  selected_city: string
  selected_reforms: string[]
  time_horizon_years: number
  baseline_annual_permits: number
  scenarios: Scenario[]
  comparable_cities: ComparableCity[]
  key_findings: string[]
  caveats: string[]
}

export async function predictScenarios(params: {
  city_fips: string
  reform_types: string[]
  time_horizon: number
  growth_assumption: 'slow' | 'baseline' | 'fast'
}): Promise<ScenarioResult>

// Get 3-5 cities most similar to target
export function getComparableCities(
  city_fips: string,
  reform_types: string[],
  limit: number = 5
): ComparableCity[]

// Estimate confidence in prediction
export function estimateConfidence(
  reform_type: string,
  years_since_reform: number,
  n_similar_cities: number
): number // 0-100%
```

### Prediction Logic

For each scenario (optimistic/realistic/pessimistic):

1. **Load baseline:** Current annual permits in selected city
2. **Get comparable cities:** Similar places that adopted same reform(s)
3. **Compute historical effect:**
   - Average permit increase in comparable cities post-reform
   - Extract trend: Was effect immediate or gradual?
   - Calculate: How many years to reach full effect?
4. **Adjust for local conditions:**
   - Economic growth rate in selected city vs. comparable cities
   - Population trends
   - Land availability
5. **Generate scenarios:**
   - **Optimistic:** Historical effect + 50% upside (growth faster than comparables)
   - **Realistic:** Historical effect × local adjustment factor
   - **Pessimistic:** Historical effect - 50% (implementation challenges, lower demand)
6. **Confidence intervals:**
   - Higher confidence if many comparable cities + consistent effects
   - Lower confidence if few comparable cities + inconsistent effects
7. **Time path:**
   - Model effect ramp-up (typically 0% in year 1 → peak by year 3-5)
   - Account for time_horizon parameter

### 3. Scenario Display Component

**File:** `app/app/scenario/page.tsx`

Full-page scenario display showing:

**Header Section:**
```
Selected City: [City Name], [State]
Current Annual Permits: [X]
Selected Reforms: [Reform 1], [Reform 2]
Time Horizon: [X] years
```

**Main Prediction Section (3 columns):**

| Optimistic | Realistic | Pessimistic |
|---|---|---|
| **+X% (±Y%)** | **+X% (±Y%)** | **+X% (±Y%)** |
| {description} | {description} | {description} |
| **Projected annual permits:** | **Projected annual permits:** | **Projected annual permits:** |
| ~{number} permits/yr | ~{number} permits/yr | ~{number} permits/yr |
| **Confidence:** {X}% | **Confidence:** {X}% | **Confidence:** {X}% |
| {explanation} | {explanation} | {explanation} |

**Comparable Cities Section:**

"Here's what happened in similar places that adopted these reforms:"

```
| City, State | Adopted | Years Since | Permit Increase | Current Permits |
|---|---|---|---|---|
| [City1] | 2019 | 5 | +15.2% | 250 |
| [City2] | 2020 | 4 | +9.8% | 180 |
| ... (3-5 cities)
```

**Time Path Chart:**

- X-axis: Years (0 to time_horizon)
- Y-axis: Cumulative permit increase (%)
- 3 lines: Optimistic, Realistic, Pessimistic
- Shaded area between optimistic/pessimistic
- Use Recharts line chart

**Key Findings:**

Bullet points:
- Key drivers of prediction (economic growth, reform stringency, etc.)
- Comparison to national averages
- Typical timeline to full effect

**Caveats & Limitations:**

Expandable section:
- "These are predictions based on [N] similar cities"
- "Actual outcomes depend on implementation quality"
- "Economic conditions may change"
- "Link to /about/limitations for more details"

**Actions:**

- "Download Scenario Report (PDF)" button
- "Compare Different Reforms" button (goes back to builder)
- "Share Results" button (generates shareable URL)

### 4. API Endpoint for Predictions

**File:** `app/app/api/scenarios/predict/route.ts`

```typescript
// POST /api/scenarios/predict
// Request:
// {
//   city_fips: string
//   reform_types: string[]
//   time_horizon: number (1-10)
//   growth_assumption: 'slow' | 'baseline' | 'fast'
// }

// Response:
// {
//   selected_city: string
//   scenarios: [
//     {
//       id: 'realistic',
//       predicted_permit_increase_pct: 12.3,
//       predicted_annual_permits: 285,
//       confidence: 0.78,
//       ...
//     }
//   ],
//   comparable_cities: [...],
//   key_findings: [...]
// }

export async function POST(request: Request) {
  const body = await request.json()
  const result = await predictScenarios(body)
  return Response.json(result)
}
```

### 5. Report Generation

**File:** `app/lib/report-generator.ts`

Generate PDF report with:

- Title page (city name, date)
- Executive summary (1 page)
- Scenario table with predictions
- Time path chart
- Comparable cities table
- Methodology (1 page)
- Caveats and limitations

Use library: `jspdf` + `html2canvas` for PDF generation

```typescript
export async function generateScenarioReport(
  result: ScenarioResult,
  format: 'pdf' | 'html'
): Promise<Blob>
```

### 6. Integration with Dashboard

Add new page/tab:
- **Page:** `/scenario` (accessible from main nav and dashboard)
- **Entry point:** "Scenario Builder" link in dashboard footer or sidebar
- **Analytics:** Track which reforms users explore

---

## Data Sources

### What You'll Use

1. **Place metrics** (Phase 1):
   - Historical permit counts (2015-2024)
   - Economic characteristics (growth rate, population, etc.)
   - Region, county, state

2. **Reform database** (Phase 2):
   - 502 cities with reform adoption dates
   - Reform types
   - Reform descriptions

3. **ML model v3** (Phase 2):
   - Already trained model for predictions
   - Available as Python pickle in `data/outputs/`

4. **DiD results** (Agent 12, this phase):
   - Treatment effects for each reform
   - Will use these for validation/comparison
   - Shows "historical average effect"

---

## Technical Implementation

### Comparable Cities Algorithm

```python
def find_comparable_cities(target_city_fips, reform_types, target_adopted_years):
    # 1. Find all cities that adopted same reforms
    adopted_cities = reforms_db[
        reforms_db['reform_type'].isin(reform_types)
    ]['city_fips'].unique()

    # 2. Calculate adoption dates in target city
    target_adopted_dates = {rt: year for rt, year in target_adopted_years}

    # 3. For each adopted city, calculate post-reform period
    comparable = []
    for city_fips in adopted_cities:
        adoption_year = get_adoption_year(city_fips, reform_types)
        # Get permits for that city
        permits_pre = get_permits(city_fips, adoption_year-3, adoption_year)
        permits_post = get_permits(city_fips, adoption_year+1, adoption_year+4)
        effect = calculate_effect(permits_pre, permits_post)
        comparable.append({
            'city_fips': city_fips,
            'effect_pct': effect,
            'years_since_reform': current_year - adoption_year,
            'similarity_score': calculate_similarity(target_city_fips, city_fips)
        })

    # 4. Return top 5 by similarity
    return sorted(comparable, key=lambda x: x['similarity_score'], reverse=True)[:5]
```

### Scenario Generation

```python
def generate_scenarios(
    city_fips,
    reform_types,
    time_horizon,
    growth_assumption
):
    # 1. Get baseline
    baseline_permits = get_current_permits(city_fips)

    # 2. Get comparable cities
    comparable = find_comparable_cities(city_fips, reform_types)

    # 3. Extract historical effect
    historical_effects = [c['effect_pct'] for c in comparable]
    mean_effect = statistics.mean(historical_effects)
    std_effect = statistics.stdev(historical_effects)

    # 4. Adjust for local conditions
    local_growth = get_economic_growth(city_fips)
    comparable_growth = statistics.mean([get_economic_growth(c['city_fips']) for c in comparable])
    adjustment_factor = local_growth / comparable_growth

    # 5. Generate scenarios
    scenarios = {
        'optimistic': mean_effect * 1.5 * adjustment_factor,
        'realistic': mean_effect * 1.0 * adjustment_factor,
        'pessimistic': mean_effect * 0.5 * adjustment_factor,
    }

    # 6. Apply time path
    for scenario in scenarios:
        # Effect ramps up over 3 years
        ramp_factor = min(time_horizon, 3) / 3
        scenarios[scenario] *= ramp_factor

    # 7. Calculate confidence
    confidence = calculate_confidence(
        n_comparable=len(comparable),
        effect_consistency=1 - (std_effect / mean_effect),
        years_of_data=time_horizon
    )

    return scenarios, confidence
```

---

## Files You'll Create/Modify

### New Files
- `app/components/ScenarioBuilder.tsx` (300+ lines)
- `app/lib/scenario-utils.ts` (400+ lines)
- `app/lib/report-generator.ts` (200+ lines)
- `app/app/scenario/page.tsx` (150+ lines)
- `app/app/api/scenarios/predict/route.ts` (100+ lines)

### Modified Files
- `app/app/layout.tsx` - Add "Scenario" link to navigation
- `app/app/dashboard/page.tsx` - Add "Scenario Builder" call-to-action
- `app/package.json` - Add jspdf dependency

---

## Dependencies

May need to add:
```bash
npm install jspdf html2canvas
```

Already have:
- `recharts` (for charts)
- `react-hook-form` (for forms)
- `lucide-react` (for icons)

---

## Success Criteria

### Functionality
- ✅ Form captures city selection
- ✅ Form captures reform selections
- ✅ API endpoint computes predictions
- ✅ Scenarios generate with realistic numbers
- ✅ Comparable cities identified and displayed
- ✅ PDF report generates successfully

### UI/UX
- ✅ Component responsive (mobile/tablet/desktop)
- ✅ Scenario cards clearly formatted
- ✅ Charts render correctly
- ✅ Interactive elements (buttons, dropdowns) work
- ✅ Loading states shown during prediction
- ✅ Error messages user-friendly

### Analytics
- ✅ Predictions make sense (effect sizes reasonable)
- ✅ Confidence intervals reasonable
- ✅ Comparable cities actually similar to target
- ✅ Time paths logical
- ✅ Scenarios in right order (optimistic > realistic > pessimistic)

### Integration
- ✅ Builds with Phase 3 and Agent 12 work
- ✅ Matches dashboard design
- ✅ No TypeScript errors
- ✅ Accessible from main navigation
- ✅ Links to methodology pages work

---

## Execution Plan

### Day 1-2: Setup & Architecture
- Understand Phase 1-2 data structure
- Load place metrics, reform database
- Verify ML model availability
- Create util functions for data access

### Day 3-5: Comparable Cities Algorithm
- Implement city matching logic
- Test with sample cities
- Validate outputs (actually similar?)
- Optimize performance

### Day 6-8: Scenario Generation
- Implement scenario calculation
- Handle edge cases (single reform, new reform, etc.)
- Calculate confidence intervals
- Generate test predictions

### Day 9: API Implementation
- Build API endpoint
- Test with real requests
- Add error handling
- Cache predictions if needed

### Day 10-11: UI Components
- Build ScenarioBuilder form
- Build ScenarioResult display
- Integrate charts
- Add comparable cities table

### Day 12-13: Report Generation
- PDF report generation
- HTML fallback
- Styling and branding
- Test with multiple scenarios

### Day 14: Integration & Testing
- Add to main navigation
- Test full flow (select → predict → display → download)
- Responsive design verification
- No console errors

### Day 15: Documentation & Deployment
- Code comments
- API documentation
- Commit to git
- Ready for merge

---

## Questions You Might Ask

**Q: "What if user selects city with no comparable cities that adopted reform?"**
A: Show message: "No other cities have adopted this reform yet. Check back soon, or explore similar reforms." Fallback to general national trends.

**Q: "How do we calculate 'similarity'?"**
A: Mahalanobis distance on: region, size category (population), economic growth rate, baseline permit rate.

**Q: "Should we show uncertainty in predictions?"**
A: Yes. Show confidence level (0-100%). Lower if few comparable cities. Include confidence intervals in time path chart.

**Q: "Can users compare multiple reforms simultaneously?"**
A: For MVP, allow 1-3 reforms. Future enhancement: interaction effects.

**Q: "Should predictions update as economic conditions change?"**
A: Yes. Use "growth_assumption" parameter to adjust. Realistic = current trends. Slow = recession scenario. Fast = boom scenario.

**Q: "How far back do we go for historical effects?"**
A: Use data from 3 years pre-reform to current. But weight recent years more (last 2 years = 50% of weight).

---

## Integration with Other Agents

**Agent 12 (DiD)** provides:
- Historical causal estimates for validation
- Treatment effect confidence intervals
- You'll use these in comparable cities lookup

**Agent 14 (Synthetic Control)** provides:
- Alternative causal estimates for validation
- Event study showing time path
- You can use event study as comparison

**You (Agent 13)** provide scenario predictions to:
- Dashboard as new tab/section
- Policymakers as decision support tool
- Research foundation for Agent 14's event study validation

---

## Success = Actionable Predictions

When you're done, policymakers can say:

> "If we adopt ADU zoning in our city, our analysis predicts we'll see roughly 12% more housing permits within 5 years, with a realistic range of 9-15%. This prediction is based on what happened in 23 similar cities that adopted the same reform."

**That's the goal. Make predictions policymakers can act on.**

---

## Ready to Start?

You have:
- ✅ Data files in repo
- ✅ Architecture documented
- ✅ Components specified
- ✅ Algorithm pseudocode written
- ✅ Integration path clear

**Start with:** Load data and implement comparable cities algorithm. Test with a few sample cities. Then build the UI.

---

🤖 **Start building Agent 13: Scenario Modeling**
Copy this entire prompt into Claude Code Web and paste into chat.
Press Enter to begin.

---
