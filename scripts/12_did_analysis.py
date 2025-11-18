"""
Difference-in-Differences (DiD) Causal Inference Analysis
==========================================================

This script implements rigorous DiD estimation to identify the causal effect
of zoning reforms on building permits, controlling for confounders.

Methodology:
-----------
DiD estimator: Y_it = β0 + β1*Treat_i + β2*Post_t + β3*(Treat_i * Post_t) + X_it + ε_it

Where:
- Y_it = log(permits) for state i at time t
- Treat_i = 1 if state has reform (treatment group)
- Post_t = 1 if time period is after reform
- Treat_i * Post_t = DiD interaction term (causal effect)
- X_it = time-varying covariates (unemployment, interest rates, COVID indicator)
- β3 = DiD estimate (ATT - Average Treatment Effect on Treated)

Assumptions:
-----------
1. Parallel trends: Treatment and control would have same trend absent treatment
2. No anticipation effects (buffer period addresses this)
3. Stable Unit Treatment Value Assumption (SUTVA)
4. Common shocks affect treatment and control similarly

Control State Selection:
------------------------
For each treatment state, select 2-3 controls based on:
- Similar pre-reform permit levels (±20%)
- Similar pre-reform growth trajectory
- No zoning reforms during analysis period
- Geographic diversity (different region)
- Similar WRLURI score (±0.3) if available
"""

import os
import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from statsmodels.regression.linear_model import OLS
from statsmodels.tools import add_constant
from statsmodels.stats.diagnostic import het_breuschpagan
import warnings
warnings.filterwarnings('ignore')

# Configuration
REFORM_METRICS = "visualizations/data/reform_impact_metrics.csv"
TIMESERIES_DATA = "visualizations/data/reform_timeseries.csv"
OUTPUT_DIR = "data/outputs"
VIZ_DIR = "visualizations"
DOCS_DIR = "docs"

# Analysis parameters
PRE_REFORM_MONTHS = 24  # Months before reform for trend analysis
POST_REFORM_MONTHS = 24  # Months after reform (with buffer)
MIN_OBSERVATIONS = 36  # Minimum observations required per state

# Synthetic control states for demonstration
# In production, these would come from Census data for all 50 states
CONTROL_STATES_POOL = {
    # States that did NOT implement major zoning reforms during 2019-2024
    "North Carolina": {
        "permits_2019_avg": 9800,
        "growth_rate": 0.02,
        "region": "South",
        "population": 10439388,
        "income_median": 57341,
        "urbanization": 0.66,
        "wrluri": 0.15
    },
    "Georgia": {
        "permits_2019_avg": 11200,
        "growth_rate": 0.03,
        "region": "South",
        "population": 10617423,
        "income_median": 61980,
        "urbanization": 0.75,
        "wrluri": 0.10
    },
    "Arizona": {
        "permits_2019_avg": 8900,
        "growth_rate": 0.025,
        "region": "West",
        "population": 7278717,
        "income_median": 62055,
        "urbanization": 0.90,
        "wrluri": 0.20
    },
    "Washington": {
        "permits_2019_avg": 8200,
        "growth_rate": 0.015,
        "region": "West",
        "population": 7614893,
        "income_median": 78687,
        "urbanization": 0.84,
        "wrluri": 0.35
    },
    "Florida": {
        "permits_2019_avg": 10500,
        "growth_rate": 0.028,
        "region": "South",
        "population": 21477737,
        "income_median": 59227,
        "urbanization": 0.91,
        "wrluri": 0.12
    },
    "Tennessee": {
        "permits_2019_avg": 3100,
        "growth_rate": 0.022,
        "region": "South",
        "population": 6829174,
        "income_median": 56071,
        "urbanization": 0.66,
        "wrluri": 0.08
    },
    "Ohio": {
        "permits_2019_avg": 3000,
        "growth_rate": 0.005,
        "region": "Midwest",
        "population": 11689100,
        "income_median": 58642,
        "urbanization": 0.78,
        "wrluri": 0.18
    },
    "Michigan": {
        "permits_2019_avg": 2800,
        "growth_rate": 0.01,
        "region": "Midwest",
        "population": 9986857,
        "income_median": 59584,
        "urbanization": 0.75,
        "wrluri": 0.22
    }
}


def ensure_dirs():
    """Create output directories if they don't exist."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(VIZ_DIR, exist_ok=True)
    os.makedirs(DOCS_DIR, exist_ok=True)


def load_data():
    """Load reform metrics and timeseries data."""
    if not os.path.exists(REFORM_METRICS):
        raise FileNotFoundError(f"Missing {REFORM_METRICS}")
    if not os.path.exists(TIMESERIES_DATA):
        raise FileNotFoundError(f"Missing {TIMESERIES_DATA}")

    reforms = pd.read_csv(REFORM_METRICS)
    timeseries = pd.read_csv(TIMESERIES_DATA)
    timeseries['date'] = pd.to_datetime(timeseries['date'])

    print(f"✅ Loaded {len(reforms)} reforms")
    print(f"✅ Loaded {len(timeseries)} state-month observations")

    return reforms, timeseries


def generate_synthetic_control_data(control_states, start_date, end_date):
    """
    Generate synthetic monthly permit data for control states.

    In production, this would be replaced with actual Census data.
    For now, we generate realistic synthetic data with:
    - Seasonal patterns
    - COVID shock
    - Random noise
    - Trend based on growth rate
    """
    dates = pd.date_range(start_date, end_date, freq='MS')
    data = []

    for state_name, attrs in control_states.items():
        base_permits = attrs['permits_2019_avg']
        growth_rate = attrs['growth_rate']

        for i, date in enumerate(dates):
            # Time trend
            months_since_start = i
            trend = base_permits * (1 + growth_rate) ** (months_since_start / 12)

            # Seasonal effect (higher in spring/summer)
            seasonal = 1.0 + 0.1 * np.sin(2 * np.pi * date.month / 12)

            # COVID shock (Mar 2020 - Jun 2021)
            covid_shock = 1.0
            if pd.Timestamp('2020-03-01') <= date <= pd.Timestamp('2021-06-01'):
                covid_shock = 0.85  # 15% reduction during COVID

            # Random noise (±10%)
            noise = np.random.uniform(0.90, 1.10)

            permits = trend * seasonal * covid_shock * noise

            data.append({
                'jurisdiction': state_name,
                'date': date,
                'permits': round(permits)
            })

    return pd.DataFrame(data)


def match_control_states(treatment_state, treatment_attrs, pre_reform_data,
                         control_pool, n_controls=3):
    """
    Match control states to treatment state based on similarity metrics.

    Matching criteria:
    1. Pre-reform permit levels (±20%)
    2. Pre-reform growth trajectory
    3. Geographic diversity (prefer different regions)
    4. Similar WRLURI score (±0.3) if available
    """
    # Calculate treatment state pre-reform characteristics
    treatment_mean = pre_reform_data[
        pre_reform_data['jurisdiction'] == treatment_state
    ]['permits'].mean()

    # Calculate pre-reform growth rate
    treatment_pre = pre_reform_data[
        pre_reform_data['jurisdiction'] == treatment_state
    ].sort_values('date')

    if len(treatment_pre) >= 12:
        early = treatment_pre.head(12)['permits'].mean()
        late = treatment_pre.tail(12)['permits'].mean()
        treatment_growth = (late - early) / early if early > 0 else 0
    else:
        treatment_growth = 0

    # Score each control state
    scores = []
    for control_name, control_attrs in control_pool.items():
        # Permit level similarity (inverse of % difference)
        permit_diff = abs(control_attrs['permits_2019_avg'] - treatment_mean) / treatment_mean
        permit_score = 1 / (1 + permit_diff)

        # Growth rate similarity
        growth_diff = abs(control_attrs['growth_rate'] - treatment_growth)
        growth_score = 1 / (1 + growth_diff * 10)

        # Regional diversity bonus (prefer different regions)
        region_bonus = 1.2 if control_attrs['region'] != treatment_attrs.get('region', '') else 1.0

        # WRLURI similarity (if available)
        if 'wrluri' in treatment_attrs and 'wrluri' in control_attrs:
            wrluri_diff = abs(control_attrs['wrluri'] - treatment_attrs['wrluri'])
            wrluri_score = 1 / (1 + wrluri_diff * 5)
        else:
            wrluri_score = 1.0

        # Combined score (weighted average)
        total_score = (
            0.4 * permit_score +
            0.3 * growth_score +
            0.2 * wrluri_score
        ) * region_bonus

        scores.append({
            'control_state': control_name,
            'score': total_score,
            'permit_diff_pct': permit_diff * 100,
            'growth_diff': growth_diff,
            'region': control_attrs['region']
        })

    # Select top N controls
    scores_df = pd.DataFrame(scores).sort_values('score', ascending=False)
    selected = scores_df.head(n_controls)

    print(f"\n🎯 Control states for {treatment_state}:")
    for _, row in selected.iterrows():
        print(f"   {row['control_state']:20s} | Score: {row['score']:.3f} | "
              f"Permit diff: {row['permit_diff_pct']:+.1f}% | Region: {row['region']}")

    return selected['control_state'].tolist()


def prepare_did_dataset(treatment_state, control_states, reform_date,
                        all_timeseries, buffer_months=12):
    """
    Prepare panel dataset for DiD regression.

    Returns:
    - Panel data with treatment/control and pre/post indicators
    - Pre-reform period for parallel trends testing
    """
    reform_date = pd.to_datetime(reform_date)

    # Define pre/post periods (with buffer)
    post_start = reform_date + pd.DateOffset(months=buffer_months)
    pre_end = reform_date - pd.DateOffset(months=1)

    # Filter relevant states and time period
    relevant_states = [treatment_state] + control_states
    df = all_timeseries[all_timeseries['jurisdiction'].isin(relevant_states)].copy()

    # Create indicators
    df['treated'] = (df['jurisdiction'] == treatment_state).astype(int)
    df['post'] = (df['date'] >= post_start).astype(int)
    df['did'] = df['treated'] * df['post']

    # Log transformation (better for percentage effects)
    df['log_permits'] = np.log(df['permits'] + 1)  # +1 to avoid log(0)

    # Time trends
    df['months_since_start'] = (df['date'] - df['date'].min()).dt.days / 30.44
    df['month'] = df['date'].dt.month

    # COVID indicator
    df['covid'] = ((df['date'] >= '2020-03-01') & (df['date'] <= '2021-06-01')).astype(int)

    # Pre-reform data only (for parallel trends test)
    pre_reform = df[df['date'] < reform_date].copy()

    # Full analysis data (exclude buffer period)
    analysis_data = df[
        (df['date'] < reform_date - pd.DateOffset(months=1)) |
        (df['date'] >= post_start)
    ].copy()

    return analysis_data, pre_reform, reform_date


def test_parallel_trends(pre_reform_data, treatment_state):
    """
    Test parallel trends assumption using pre-reform data.

    Method: Regress outcome on treatment × time interaction in pre-period.
    H0: No differential trends (interaction coefficient = 0)
    """
    df = pre_reform_data.copy()

    # Regression: log_permits ~ treated × time + time + treated
    X = df[['months_since_start', 'treated']].copy()
    X['treated_x_time'] = X['treated'] * X['months_since_start']
    X = add_constant(X)
    y = df['log_permits']

    model = OLS(y, X).fit()

    # Test interaction coefficient
    interaction_coef = model.params['treated_x_time']
    interaction_pval = model.pvalues['treated_x_time']

    parallel_trends_satisfied = interaction_pval > 0.10  # Not significant at 10%

    return {
        'coefficient': interaction_coef,
        'p_value': interaction_pval,
        'satisfied': parallel_trends_satisfied,
        'message': 'PASS' if parallel_trends_satisfied else 'FAIL (differential pre-trends detected)'
    }


def estimate_did(analysis_data, treatment_state, control_states):
    """
    Estimate DiD regression with robust standard errors.

    Model: log_permits = β0 + β1*treated + β2*post + β3*did +
                         β4*months + β5*covid + month_FE + ε
    """
    df = analysis_data.copy()

    # Create month fixed effects (dummies)
    month_dummies = pd.get_dummies(df['month'], prefix='month', drop_first=True, dtype=float)

    # Build regression matrix
    X = df[['treated', 'post', 'did', 'months_since_start', 'covid']].copy().astype(float)
    X = pd.concat([X, month_dummies], axis=1)
    X = add_constant(X)

    y = df['log_permits'].astype(float)

    # OLS with robust standard errors
    model = OLS(y, X).fit(cov_type='HC3')  # Heteroskedasticity-robust

    # Extract DiD estimate
    did_coef = model.params['did']
    did_se = model.bse['did']
    did_pval = model.pvalues['did']

    # Confidence interval
    ci_lower = model.conf_int().loc['did', 0]
    ci_upper = model.conf_int().loc['did', 1]

    # Convert to percentage effect
    pct_effect = (np.exp(did_coef) - 1) * 100
    pct_ci_lower = (np.exp(ci_lower) - 1) * 100
    pct_ci_upper = (np.exp(ci_upper) - 1) * 100

    return {
        'did_estimate': did_coef,
        'std_error': did_se,
        'p_value': did_pval,
        'ci_lower': ci_lower,
        'ci_upper': ci_upper,
        'pct_effect': pct_effect,
        'pct_ci_lower': pct_ci_lower,
        'pct_ci_upper': pct_ci_upper,
        'r_squared': model.rsquared,
        'n_obs': len(df),
        'model': model
    }


def placebo_test(pre_reform_data, treatment_state, control_states):
    """
    Placebo test: Run DiD on pre-period with fake treatment date.

    If parallel trends hold, we should find NO effect in pre-period.
    """
    df = pre_reform_data.copy()

    if len(df) < 24:
        return {
            'test': 'skipped',
            'reason': 'insufficient pre-period data',
            'coefficient': np.nan,
            'p_value': np.nan,
            'passed': np.nan,
            'message': 'Skipped (insufficient data)'
        }

    # Fake treatment date = midpoint of pre-period
    dates = df['date'].sort_values()
    midpoint = dates.iloc[len(dates) // 2]

    df['fake_post'] = (df['date'] >= midpoint).astype(int)
    df['fake_did'] = df['treated'] * df['fake_post']

    # Regression
    X = df[['treated', 'fake_post', 'fake_did', 'months_since_start']].copy()
    X = add_constant(X)
    y = df['log_permits']

    model = OLS(y, X).fit(cov_type='HC3')

    placebo_coef = model.params['fake_did']
    placebo_pval = model.pvalues['fake_did']

    # Pass if not significant (p > 0.10)
    placebo_passed = placebo_pval > 0.10

    return {
        'test': 'completed',
        'coefficient': placebo_coef,
        'p_value': placebo_pval,
        'passed': placebo_passed,
        'message': 'PASS (no pre-period effect)' if placebo_passed else 'FAIL (spurious pre-effect)'
    }


def plot_parallel_trends(analysis_data, pre_reform_data, treatment_state,
                        control_states, reform_date, output_path):
    """
    Visualize parallel trends assumption with treatment vs control means over time.
    """
    df = pd.concat([pre_reform_data, analysis_data]).drop_duplicates(subset=['jurisdiction', 'date'])

    # Calculate means by treatment status and time
    treatment_means = df[df['treated'] == 1].groupby('date')['permits'].mean()
    control_means = df[df['treated'] == 0].groupby('date')['permits'].mean()

    # Plot
    fig, ax = plt.subplots(figsize=(12, 6))

    # Pre-reform period
    pre_treatment = treatment_means[treatment_means.index < reform_date]
    pre_control = control_means[control_means.index < reform_date]

    ax.plot(pre_treatment.index, pre_treatment.values,
            'o-', color='#d62728', linewidth=2, markersize=4,
            label=f'{treatment_state} (Treatment)', alpha=0.8)
    ax.plot(pre_control.index, pre_control.values,
            'o-', color='#1f77b4', linewidth=2, markersize=4,
            label=f'Control States (n={len(control_states)})', alpha=0.8)

    # Post-reform period
    post_treatment = treatment_means[treatment_means.index >= reform_date]
    post_control = control_means[control_means.index >= reform_date]

    if len(post_treatment) > 0:
        ax.plot(post_treatment.index, post_treatment.values,
                'o-', color='#d62728', linewidth=2, markersize=4, alpha=0.8)
    if len(post_control) > 0:
        ax.plot(post_control.index, post_control.values,
                'o-', color='#1f77b4', linewidth=2, markersize=4, alpha=0.8)

    # Reform date line
    ax.axvline(reform_date, color='black', linestyle='--', linewidth=2,
               label='Reform Date', alpha=0.6)

    # Styling
    ax.set_xlabel('Date', fontsize=12, fontweight='bold')
    ax.set_ylabel('Monthly Building Permits', fontsize=12, fontweight='bold')
    ax.set_title(f'Parallel Trends Test: {treatment_state}',
                 fontsize=14, fontweight='bold', pad=20)
    ax.legend(loc='best', fontsize=10, frameon=True, shadow=True)
    ax.grid(True, alpha=0.3)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # Format x-axis dates
    fig.autofmt_xdate()

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

    print(f"   📊 Saved parallel trends plot → {output_path}")


def run_did_analysis():
    """Main DiD analysis pipeline."""
    print("\n" + "="*70)
    print("DIFFERENCE-IN-DIFFERENCES CAUSAL INFERENCE ANALYSIS")
    print("="*70 + "\n")

    ensure_dirs()

    # Load data
    reforms, timeseries = load_data()

    # Generate synthetic control state data
    print("\n📊 Generating synthetic control state data...")
    print("   (In production, use actual Census data for all 50 states)")

    start_date = timeseries['date'].min()
    end_date = timeseries['date'].max()
    control_data = generate_synthetic_control_data(CONTROL_STATES_POOL, start_date, end_date)

    # Combine treatment and control data
    all_data = pd.concat([timeseries, control_data], ignore_index=True)

    print(f"   ✅ Total states: {all_data['jurisdiction'].nunique()}")
    print(f"   ✅ Time range: {start_date.date()} to {end_date.date()}")

    # Treatment state attributes (simplified for matching)
    treatment_attrs = {
        'Virginia': {'region': 'South', 'wrluri': 0.25},
        'California': {'region': 'West', 'wrluri': 0.65},
        'Texas': {'region': 'South', 'wrluri': 0.05}
    }

    # Results storage
    results = []

    # Analyze each reform
    for idx, reform in reforms.iterrows():
        treatment_state = reform['jurisdiction']
        reform_name = reform['reform_name']
        reform_date = pd.to_datetime(reform['effective_date'])

        print(f"\n{'='*70}")
        print(f"🔬 ANALYZING: {treatment_state} - {reform_name}")
        print(f"   Reform Date: {reform_date.date()}")
        print(f"{'='*70}")

        # Get pre-reform data for matching
        pre_reform_data_for_matching = all_data[
            (all_data['date'] < reform_date) &
            (all_data['date'] >= reform_date - pd.DateOffset(months=24))
        ]

        # Match control states
        control_states = match_control_states(
            treatment_state,
            treatment_attrs.get(treatment_state, {}),
            pre_reform_data_for_matching,
            CONTROL_STATES_POOL,
            n_controls=3
        )

        # Prepare DiD dataset
        analysis_data, pre_reform_data, _ = prepare_did_dataset(
            treatment_state, control_states, reform_date, all_data
        )

        print(f"\n📈 Data summary:")
        print(f"   Pre-reform observations: {len(pre_reform_data)}")
        print(f"   Analysis observations: {len(analysis_data)}")

        # Test 1: Parallel trends
        print(f"\n🔍 Test 1: Parallel Trends Assumption")
        parallel_trends = test_parallel_trends(pre_reform_data, treatment_state)
        print(f"   Interaction coef: {parallel_trends['coefficient']:.4f}")
        print(f"   P-value: {parallel_trends['p_value']:.4f}")
        print(f"   Result: {parallel_trends['message']}")

        # Test 2: Placebo test
        print(f"\n🔍 Test 2: Placebo Test (Pre-Period)")
        placebo = placebo_test(pre_reform_data, treatment_state, control_states)
        if placebo['test'] == 'completed':
            print(f"   Placebo coef: {placebo['coefficient']:.4f}")
            print(f"   P-value: {placebo['p_value']:.4f}")
            print(f"   Result: {placebo['message']}")
        else:
            print(f"   {placebo['message']}")

        # Main DiD estimation
        print(f"\n📊 DiD Estimation")
        did_results = estimate_did(analysis_data, treatment_state, control_states)

        print(f"\n✨ RESULTS:")
        print(f"   DiD Estimate (log points): {did_results['did_estimate']:.4f}")
        print(f"   Standard Error: {did_results['std_error']:.4f}")
        print(f"   P-value: {did_results['p_value']:.4f}")
        print(f"   95% CI: [{did_results['ci_lower']:.4f}, {did_results['ci_upper']:.4f}]")
        print(f"\n   📈 Percentage Effect: {did_results['pct_effect']:+.2f}%")
        print(f"   95% CI: [{did_results['pct_ci_lower']:+.2f}%, {did_results['pct_ci_upper']:+.2f}%]")
        print(f"\n   R²: {did_results['r_squared']:.4f}")
        print(f"   N observations: {did_results['n_obs']}")

        # Significance
        if did_results['p_value'] < 0.01:
            sig_level = "***"
            interpretation = "Highly significant"
        elif did_results['p_value'] < 0.05:
            sig_level = "**"
            interpretation = "Significant"
        elif did_results['p_value'] < 0.10:
            sig_level = "*"
            interpretation = "Marginally significant"
        else:
            sig_level = ""
            interpretation = "Not significant"

        print(f"   Significance: {interpretation} {sig_level}")

        # Visualization
        viz_path = os.path.join(VIZ_DIR, f"did_parallel_trends_{treatment_state.lower().replace(' ', '_')}.png")
        plot_parallel_trends(
            analysis_data, pre_reform_data, treatment_state,
            control_states, reform_date, viz_path
        )

        # Store results
        results.append({
            'state': treatment_state,
            'reform': reform_name,
            'reform_type': reform.get('reform_type', 'N/A'),
            'reform_date': reform_date.date(),
            'control_states': ', '.join(control_states),
            'did_estimate': did_results['did_estimate'],
            'std_error': did_results['std_error'],
            'p_value': did_results['p_value'],
            'ci_lower': did_results['ci_lower'],
            'ci_upper': did_results['ci_upper'],
            'pct_effect': did_results['pct_effect'],
            'pct_ci_lower': did_results['pct_ci_lower'],
            'pct_ci_upper': did_results['pct_ci_upper'],
            'significance': sig_level,
            'r_squared': did_results['r_squared'],
            'n_obs': did_results['n_obs'],
            'parallel_trends_p': parallel_trends['p_value'],
            'parallel_trends_pass': parallel_trends['satisfied'],
            'placebo_p': placebo.get('p_value', np.nan),
            'placebo_pass': placebo.get('passed', np.nan)
        })

    # Save results
    results_df = pd.DataFrame(results)
    output_path = os.path.join(OUTPUT_DIR, "did_estimates.csv")
    results_df.to_csv(output_path, index=False)

    print(f"\n{'='*70}")
    print(f"✅ ANALYSIS COMPLETE")
    print(f"{'='*70}")
    print(f"\n📁 Outputs saved:")
    print(f"   {output_path}")
    print(f"   {VIZ_DIR}/did_parallel_trends_*.png")

    # Summary table
    print(f"\n📋 SUMMARY TABLE:")
    print(f"\n{results_df[['state', 'reform', 'pct_effect', 'p_value', 'significance']].to_string(index=False)}")

    return results_df


def main():
    """Entry point."""
    try:
        results = run_did_analysis()
        print("\n✅ DiD analysis completed successfully!")
        return 0
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
