# Difference-in-Differences (DiD) Methodology

## Executive Summary

This document explains the causal inference methodology used to estimate the impact of state-level zoning reforms on building permits. We employ **Difference-in-Differences (DiD)** estimation, the gold standard for policy evaluation when randomized controlled trials are not feasible.

**Key Finding Framework**: The DiD estimator identifies the causal effect by comparing the change in outcomes (building permits) before and after the reform in treatment states, relative to the change in matched control states that did not implement reforms.

---

## 1. The Causal Inference Challenge

### Why Simple Comparisons Fail

The naive approach—comparing permits before vs. after reform—suffers from **confounding**:

- **National trends**: Housing market cycles affect all states simultaneously
- **Economic shocks**: COVID-19, interest rate changes, recessions
- **Seasonal patterns**: Building permits naturally vary by season
- **State-specific trends**: Some states grow faster regardless of reforms

**Example**: If Virginia's permits increased 5% after reform, is that due to:
- The zoning reform? (✓ what we want to know)
- National housing boom? (✗ confounder)
- Regional migration trends? (✗ confounder)
- Economic recovery post-COVID? (✗ confounder)

### Solution: Difference-in-Differences

DiD addresses confounding by using **control states** that did not reform but experienced the same external shocks. The key insight:

```
Causal Effect = (Treatment After - Treatment Before) - (Control After - Control Before)
                        ↑                                      ↑
                  Observed change                      Counterfactual trend
```

The control group reveals what **would have happened** to treatment states absent the reform.

---

## 2. DiD Estimation Framework

### 2.1 Mathematical Specification

Our DiD regression model:

```
log(Permits_it) = β₀ + β₁·Treat_i + β₂·Post_t + β₃·(Treat_i × Post_t) + X_it + ε_it
```

**Where**:
- `Permits_it` = Monthly building permits for state i at time t
- `Treat_i` = 1 if state implemented reform (treatment group), 0 otherwise
- `Post_t` = 1 if time period is after reform, 0 if before
- `Treat_i × Post_t` = Interaction term (the DiD estimator)
- `X_it` = Time-varying controls (COVID indicator, time trends, month fixed effects)
- `ε_it` = Error term

**Interpretation of Coefficients**:
- `β₁`: Baseline difference between treatment and control states (pre-reform)
- `β₂`: Time trend common to all states (e.g., COVID shock)
- `β₃`: **DiD estimate** — causal effect of reform (our target)
- Controls: Adjust for seasonal patterns and other confounders

### 2.2 Log Transformation

We use `log(permits)` as the outcome for three reasons:

1. **Percentage interpretation**: `β₃` represents proportional change → `100 × (exp(β₃) - 1)` = percent effect
2. **Heteroskedasticity**: Log transformation stabilizes variance (large states vs. small states)
3. **Multiplicative effects**: Reforms likely have percentage effects, not additive

**Example**: If `β₃ = 0.08`, then permits increased by `100 × (e^0.08 - 1) ≈ 8.3%` due to reform.

---

## 3. Control State Selection

### 3.1 Matching Criteria

For each treatment state, we select 2-3 control states based on **pre-reform similarity**:

| Criterion | Weight | Threshold | Rationale |
|-----------|--------|-----------|-----------|
| **Permit levels** | 40% | ±20% | Similar baseline housing production |
| **Growth trajectory** | 30% | Similar slope | Parallel pre-trends required for DiD |
| **WRLURI score** | 20% | ±0.3 | Similar regulatory restrictiveness (Wharton Index) |
| **Regional diversity** | 10% | Different region | Avoid common regional shocks |

### 3.2 Exclusion Criteria

Control states must **NOT**:
- Have implemented major zoning reforms during 2015-2024
- Have pending reform legislation that could bias expectations
- Be geographically adjacent (to avoid spillover effects)

### 3.3 Matching Algorithm

```python
for each control state:
    permit_score = 1 / (1 + |control_permits - treatment_permits| / treatment_permits)
    growth_score = 1 / (1 + 10 × |control_growth - treatment_growth|)
    wrluri_score = 1 / (1 + 5 × |control_wrluri - treatment_wrluri|)
    region_bonus = 1.2 if different_region else 1.0

    total_score = (0.4×permit + 0.3×growth + 0.2×wrluri) × region_bonus

select top 3 controls by score
```

---

## 4. Key Assumptions

### 4.1 Parallel Trends (Critical)

**Assumption**: In the absence of treatment, treatment and control states would have followed parallel trends.

**Why it matters**: If treatment states were already on a different trajectory pre-reform, we'd wrongly attribute that differential to the reform.

**Testing**: We regress pre-reform outcomes on `Treat_i × time`:

```
log(Permits_it) = α₀ + α₁·Treat_i + α₂·time_t + α₃·(Treat_i × time_t) + ε_it

Test: H₀: α₃ = 0  (no differential pre-trends)
```

If `p-value > 0.10`, we **fail to reject** parallel trends → assumption plausible.

**Visual test**: Parallel trends plot shows treatment and control group means over time. Pre-reform lines should be parallel.

### 4.2 No Anticipation Effects

**Assumption**: Treatment states did not change behavior in anticipation of reform.

**Implementation**: We exclude a **12-month buffer period** around the reform date:
- **Pre-period**: Ends 1 month before reform
- **Post-period**: Starts 12 months after reform

This ensures we don't misclassify anticipatory responses (e.g., developers waiting to file permits) as reform effects.

### 4.3 SUTVA (Stable Unit Treatment Value Assumption)

**Assumption**: Control states are not affected by treatment states' reforms (no spillover).

**Justification**: State-level zoning reforms are unlikely to affect other states' permits directly. Minor spillovers possible (e.g., developers relocating), but second-order.

### 4.4 Common Shocks

**Assumption**: Treatment and control states are similarly affected by external shocks (COVID, interest rates, etc.).

**Implementation**:
- Match on regional diversity to avoid region-specific shocks
- Include COVID indicator variable to control for pandemic effects
- Month fixed effects control for seasonal patterns

---

## 5. Statistical Tests

### 5.1 Parallel Trends Test (Pre-Reform)

**Method**: Test for differential time trends between treatment and control in pre-period.

**Specification**:
```
log(Permits_it) = γ₀ + γ₁·Treat_i + γ₂·time_t + γ₃·(Treat_i × time_t) + ε_it
```

**Decision rule**:
- If `p-value(γ₃) > 0.10`: ✅ Parallel trends assumption satisfied
- If `p-value(γ₃) ≤ 0.10`: ⚠️ Differential pre-trends detected → investigate

**Action if failed**:
1. Try different control states with better pre-trend match
2. Use linear state-specific time trends in main DiD model
3. Consider alternative methods (synthetic control)

### 5.2 Placebo Test

**Method**: Run DiD regression on **pre-reform period only** with fake treatment date.

**Logic**: If methodology is sound, we should find NO effect when there was no actual treatment.

**Implementation**:
- Split pre-period in half
- Assign "fake treatment" at midpoint
- Run DiD regression
- Expected result: `β₃ ≈ 0` and `p-value > 0.10`

**Decision rule**:
- If `p-value > 0.10`: ✅ Placebo test passed (no spurious effects)
- If `p-value ≤ 0.10`: ⚠️ Placebo test failed → model may be mis-specified

### 5.3 Robustness Checks

We conduct several robustness checks:

1. **Different time windows**:
   - Baseline: 24 months pre + 24 months post (with 12-month buffer)
   - Alternative: 18 months, 30 months

2. **Alternative control groups**:
   - Top 3 matches (baseline)
   - Top 5 matches
   - All eligible controls

3. **Heteroskedasticity tests**:
   - Breusch-Pagan test for heteroskedasticity
   - Use robust standard errors (HC3) regardless

4. **Clustering**:
   - Baseline: Robust SEs without clustering
   - Alternative: Cluster SEs at state level (if panel is long enough)

---

## 6. Inference and Interpretation

### 6.1 Standard Errors

We use **heteroskedasticity-robust standard errors (HC3)**:
- Accounts for unequal variance across states (large vs. small)
- Conservative inference (Type I error control)
- Does not assume homoskedasticity

### 6.2 Confidence Intervals

95% confidence intervals computed as:
```
CI = β₃ ± 1.96 × SE(β₃)
```

**Interpretation**: We are 95% confident the true causal effect lies in this interval.

### 6.3 Statistical Significance

- `p < 0.01`: *** (highly significant) — very strong evidence of causal effect
- `p < 0.05`: ** (significant) — strong evidence
- `p < 0.10`: * (marginally significant) — moderate evidence
- `p ≥ 0.10`: (not significant) — insufficient evidence

### 6.4 Economic Significance

**Example interpretation**:

> "The DiD estimate is β₃ = 0.08 (SE = 0.03, p = 0.007). This indicates that the zoning reform caused an 8.3% increase in building permits (95% CI: [2.1%, 14.9%]). Given the pre-reform baseline of 10,000 permits/year, this translates to approximately 830 additional housing units per year attributable to the reform."

---

## 7. Limitations and Caveats

### 7.1 External Validity

**Limitation**: Results apply to states that implemented reforms during 2019-2024. May not generalize to:
- Future reforms (different economic context)
- Other states with very different characteristics
- Local (city-level) reforms

### 7.2 Dynamic Effects

**Limitation**: DiD estimates the **average effect** over post-period. Does not capture:
- Time-varying effects (may grow or fade over time)
- Lagged effects (developers may take time to respond)

**Extension**: Event study design can trace out dynamic effects month-by-month.

### 7.3 Mechanism vs. Effect

**Limitation**: DiD identifies the overall causal effect but does not reveal **why** reforms worked (or didn't).

Possible mechanisms:
- Reduced developer costs (parking, ADU approvals)
- Increased feasible lot splits (SB9)
- Reduced NIMBY litigation risks

**Extension**: Mediation analysis, developer surveys, case studies.

### 7.4 Spillover Effects

**Limitation**: If reforms cause developers to relocate from control to treatment states, we may **overestimate** the effect.

**Mitigation**: Use geographically distant controls.

---

## 8. Data Requirements

### 8.1 Treatment Data (Reforms)

Required fields:
- `jurisdiction`: State name
- `reform_name`: Description
- `reform_type`: Category (ADU, parking, upzoning, etc.)
- `effective_date`: When reform took effect (YYYY-MM-DD)

### 8.2 Outcome Data (Building Permits)

Required fields:
- `state`: State name (must match reform jurisdiction)
- `date`: Month (YYYY-MM-01)
- `permits`: Monthly building permits (count)

**Time coverage**: At minimum:
- 24 months before earliest reform
- 24 months after latest reform
- 12-month buffer around each reform

### 8.3 Covariate Data (Optional but Recommended)

For richer controls:
- `unemployment_rate`: Monthly state unemployment
- `mortgage_rate`: 30-year fixed mortgage rate (national)
- `gdp_growth`: State GDP growth (quarterly)
- `population`: Annual state population
- `median_income`: Annual median household income
- `wrluri`: Wharton Residential Land Use Regulatory Index

---

## 9. Implementation Details

### 9.1 Software

- **Language**: Python 3.8+
- **Key libraries**:
  - `pandas`: Data manipulation
  - `statsmodels`: Regression models (OLS with robust SE)
  - `numpy`: Numerical operations
  - `matplotlib`, `seaborn`: Visualizations
  - `scipy`: Statistical tests

### 9.2 Computational Complexity

- **Per reform**: ~0.5 seconds
- **Bottleneck**: Parallel trends plots (matplotlib rendering)
- **Memory**: Minimal (<100 MB for 50 states × 120 months)

### 9.3 Reproducibility

For reproducibility, we:
1. Set random seed for synthetic data generation: `np.random.seed(42)`
2. Version control all scripts and data
3. Log software versions in `requirements.txt`
4. Save all intermediate outputs

---

## 10. References

### Academic Literature

1. **Angrist, J. D., & Pischke, J. S. (2009)**. *Mostly Harmless Econometrics*. Princeton University Press.
   - Chapter 5: Difference-in-Differences
   - Gold standard textbook on DiD methodology

2. **Card, D., & Krueger, A. B. (1994)**. "Minimum Wages and Employment: A Case Study of the Fast-Food Industry in New Jersey and Pennsylvania." *American Economic Review*, 84(4), 772-793.
   - Classic DiD application

3. **Bertrand, M., Duflo, E., & Mullainathan, S. (2004)**. "How Much Should We Trust Differences-In-Differences Estimates?" *Quarterly Journal of Economics*, 119(1), 249-275.
   - Serial correlation and clustering in DiD

4. **Callaway, B., & Sant'Anna, P. H. (2021)**. "Difference-in-Differences with Multiple Time Periods." *Journal of Econometrics*, 225(2), 200-230.
   - Advanced DiD with staggered adoption

### Zoning Reform Literature

5. **Glaeser, E. L., & Ward, B. A. (2009)**. "The Causes and Consequences of Land Use Regulation: Evidence from Greater Boston." *Journal of Urban Economics*, 65(3), 265-278.
   - Zoning restrictions and housing supply

6. **Gyourko, J., Saiz, A., & Summers, A. (2008)**. "A New Measure of the Local Regulatory Environment for Housing Markets: The Wharton Residential Land Use Regulatory Index." *Urban Studies*, 45(3), 693-729.
   - WRLURI development and validation

7. **Been, V., Ellen, I. G., & O'Regan, K. (2019)**. "Supply Skepticism: Housing Supply and Affordability." *Housing Policy Debate*, 29(1), 25-40.
   - Debate on supply-side housing interventions

---

## 11. Glossary

| Term | Definition |
|------|------------|
| **ATT** | Average Treatment Effect on the Treated — the causal effect for states that actually reformed |
| **DiD** | Difference-in-Differences |
| **SUTVA** | Stable Unit Treatment Value Assumption — no spillovers between units |
| **Parallel trends** | Treatment and control groups have same pre-treatment trend |
| **Heteroskedasticity** | Non-constant error variance |
| **Fixed effects** | Controls for time-invariant unobservables (e.g., state dummies) |
| **Robust SE** | Standard errors corrected for heteroskedasticity |
| **Placebo test** | Test on pre-period with fake treatment date to validate methodology |
| **WRLURI** | Wharton Residential Land Use Regulatory Index (higher = more restrictive) |

---

## Appendix A: Event Study Extension

For readers interested in **dynamic treatment effects**, an event study design extends DiD:

```
log(Permits_it) = β₀ + Σₖ δₖ·(Treat_i × Timeₖ) + γₜ + αᵢ + ε_it
```

Where `Timeₖ` are dummies for each month relative to reform (k = -24, ..., -1, 0, 1, ..., +24).

This allows estimating effects month-by-month and visualizing:
- Pre-trends (test parallel trends)
- Immediate effects (month 0-6)
- Medium-term effects (month 7-18)
- Long-term effects (month 19+)

**Implementation**: Replace binary `Post_t` with month-relative dummies in regression.

---

## Appendix B: Synthetic Control Method

An alternative to DiD with multiple controls is the **Synthetic Control Method** (Abadie & Gardeazabal, 2003):

- Construct a **synthetic control** as weighted average of control states
- Weights chosen to match pre-reform characteristics exactly
- Post-reform gap = treatment effect

**Advantages**:
- More flexible matching
- Visual interpretability
- Transparent about data-driven weights

**Disadvantages**:
- Requires longer pre-period for optimization
- More computationally intensive
- Inference more complex (placebo-based)

**When to use**: Single treatment state, long pre-period (>36 months), many potential controls.

---

**Document version**: 1.0
**Date**: November 2025
**Author**: Zoning Reform Analysis Project
**Contact**: [Your contact information]
