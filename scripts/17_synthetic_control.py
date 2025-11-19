"""
Synthetic Control Method for Zoning Reform Analysis

Implements the Abadie et al. (2010) synthetic control method to estimate
causal effects of zoning reforms. Creates a weighted combination of control
states that matches pre-treatment trends, then compares post-treatment outcomes.

Methodology:
- Optimization: minimize ||Y_treated_pre - Σ(w_j * Y_j_pre)||²
- Constraints: weights ≥ 0, Σw_j = 1
- Statistical inference via placebo tests and bootstrap

References:
Abadie, A., Diamond, A., & Hainmueller, J. (2010). Synthetic control methods
for comparative case studies. Journal of the American Statistical Association.
"""

import os
import sys
import pandas as pd
import numpy as np
import cvxpy as cp
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
from scipy import stats

# Configuration
TIMESERIES_CSV = "visualizations/data/reform_timeseries.csv"
METRICS_CSV = "visualizations/data/reform_impact_metrics.csv"
OUTPUT_DIR = "data/outputs"
VIZ_DIR = "visualizations"
DOCS_DIR = "docs"

# Create directories
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(VIZ_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)


class SyntheticControl:
    """
    Implements the Synthetic Control Method for a single treated unit.
    """

    def __init__(self, treated_state, treatment_date, donor_states,
                 data, pre_buffer_months=12):
        """
        Initialize synthetic control analysis.

        Parameters:
        -----------
        treated_state : str
            Name of the treated state
        treatment_date : pd.Timestamp
            Date when treatment began
        donor_states : list
            List of potential donor (control) states
        data : pd.DataFrame
            Panel data with columns: jurisdiction, date, permits
        pre_buffer_months : int
            Months before treatment to exclude from pre-period
        """
        self.treated_state = treated_state
        self.treatment_date = pd.to_datetime(treatment_date)
        self.donor_states = donor_states
        self.data = data.copy()
        self.pre_buffer_months = pre_buffer_months

        # Convert date column
        self.data['date'] = pd.to_datetime(self.data['date'])

        # Define time periods
        self.define_periods()

        # Prepare matrices
        self.prepare_data()

        # Optimize weights
        self.weights = None
        self.rmspe_pre = None
        self.rmspe_post = None

    def define_periods(self):
        """Define pre-treatment and post-treatment periods."""
        # Pre-treatment: all data before treatment minus buffer
        self.pre_end = self.treatment_date - pd.DateOffset(months=self.pre_buffer_months)

        # Get earliest date in data
        self.pre_start = self.data['date'].min()

        # Post-treatment: starts after treatment
        self.post_start = self.treatment_date
        self.post_end = self.data['date'].max()

        print(f"\n{self.treated_state}:")
        print(f"  Pre-period: {self.pre_start.date()} to {self.pre_end.date()}")
        print(f"  Treatment: {self.treatment_date.date()}")
        print(f"  Post-period: {self.post_start.date()} to {self.post_end.date()}")

    def prepare_data(self):
        """Prepare outcome matrices for treated and donor units."""
        # Filter pre-treatment period
        pre_data = self.data[
            (self.data['date'] >= self.pre_start) &
            (self.data['date'] <= self.pre_end)
        ]

        # Get treated unit pre-treatment outcomes
        treated_pre = pre_data[
            pre_data['jurisdiction'] == self.treated_state
        ].sort_values('date')

        if len(treated_pre) == 0:
            raise ValueError(f"No pre-treatment data for {self.treated_state}")

        self.Y1_pre = treated_pre['permits'].values
        self.pre_dates = treated_pre['date'].values

        # Get donor pool pre-treatment outcomes (matrix: time × donors)
        donor_data_list = []
        valid_donors = []

        for donor in self.donor_states:
            donor_pre = pre_data[
                pre_data['jurisdiction'] == donor
            ].sort_values('date')

            # Check if donor has complete pre-treatment data
            if len(donor_pre) == len(self.Y1_pre):
                donor_data_list.append(donor_pre['permits'].values)
                valid_donors.append(donor)

        if len(valid_donors) == 0:
            raise ValueError("No valid donors with complete pre-treatment data")

        self.Y0_pre = np.column_stack(donor_data_list)
        self.valid_donors = valid_donors

        print(f"  Donor pool: {len(self.valid_donors)} states")
        print(f"  Pre-treatment periods: {len(self.Y1_pre)}")

        # Prepare full time series for plotting
        self.prepare_full_series()

    def prepare_full_series(self):
        """Prepare full time series for treated and donor units."""
        # Get all dates
        all_dates = sorted(self.data['date'].unique())

        # Treated unit
        treated_full = self.data[
            self.data['jurisdiction'] == self.treated_state
        ].sort_values('date')
        self.Y1_full = treated_full['permits'].values
        self.full_dates = treated_full['date'].values

        # Donor pool (matrix: time × donors)
        donor_full_list = []
        for donor in self.valid_donors:
            donor_full = self.data[
                self.data['jurisdiction'] == donor
            ].sort_values('date')
            donor_full_list.append(donor_full['permits'].values)

        self.Y0_full = np.column_stack(donor_full_list)

    def optimize_weights(self, method='quadratic'):
        """
        Find optimal weights to minimize pre-treatment fit error.

        Uses quadratic programming to solve:
        minimize ||Y1_pre - Y0_pre @ w||²
        subject to: w ≥ 0, sum(w) = 1

        Parameters:
        -----------
        method : str
            Optimization method ('quadratic' for QP)

        Returns:
        --------
        weights : np.array
            Optimal weights for donor units
        """
        n_donors = self.Y0_pre.shape[1]

        # Define optimization variables
        w = cp.Variable(n_donors)

        # Objective: minimize sum of squared errors
        objective = cp.Minimize(cp.sum_squares(self.Y1_pre - self.Y0_pre @ w))

        # Constraints: non-negative weights, sum to 1
        constraints = [
            w >= 0,
            cp.sum(w) == 1
        ]

        # Solve optimization problem
        problem = cp.Problem(objective, constraints)

        # Try multiple solvers
        solvers_to_try = [cp.OSQP, cp.SCS, cp.CLARABEL]
        solved = False

        for solver in solvers_to_try:
            try:
                problem.solve(solver=solver, verbose=False)
                if problem.status in ['optimal', 'optimal_inaccurate']:
                    solved = True
                    break
            except Exception as e:
                # Solver failed, try next one
                continue

        if not solved:
            print(f"  Warning: Optimization failed with all solvers. Status = {problem.status}")
            # Use equal weights as fallback
            self.weights = np.ones(n_donors) / n_donors
            print(f"  Using equal weights as fallback")
        else:
            self.weights = w.value
            if self.weights is None:
                self.weights = np.ones(n_donors) / n_donors
                print(f"  Warning: Weights are None, using equal weights")

        # Calculate fit quality (RMSPE - Root Mean Squared Prediction Error)
        synthetic_pre = self.Y0_pre @ self.weights
        self.rmspe_pre = np.sqrt(np.mean((self.Y1_pre - synthetic_pre) ** 2))

        # Normalize by mean of treated to get relative RMSPE
        self.rmspe_pre_normalized = self.rmspe_pre / np.mean(self.Y1_pre)

        print(f"  Pre-treatment RMSPE: {self.rmspe_pre:.2f}")
        print(f"  Normalized RMSPE: {self.rmspe_pre_normalized:.4f}")

        # Show top contributors
        top_idx = np.argsort(self.weights)[-5:][::-1]
        print(f"  Top donor states:")
        for idx in top_idx:
            if self.weights[idx] > 0.01:  # Show only if weight > 1%
                print(f"    {self.valid_donors[idx]}: {self.weights[idx]:.3f}")

        return self.weights

    def compute_effects(self):
        """
        Compute treatment effects (gaps) in post-treatment period.

        Returns:
        --------
        results : dict
            Contains actual, synthetic, and gap time series
        """
        if self.weights is None:
            raise ValueError("Must optimize weights first")

        # Compute synthetic control for full time series
        synthetic_full = self.Y0_full @ self.weights

        # Compute gaps (treatment effects)
        gaps = self.Y1_full - synthetic_full

        # Identify post-treatment period
        post_mask = self.full_dates >= self.post_start

        # Calculate average treatment effect
        att = np.mean(gaps[post_mask])

        # Calculate post-treatment RMSPE
        self.rmspe_post = np.sqrt(np.mean(gaps[post_mask] ** 2))

        print(f"  Average Treatment Effect: {att:.2f}")
        print(f"  Post-treatment RMSPE: {self.rmspe_post:.2f}")

        self.results = {
            'dates': self.full_dates,
            'actual': self.Y1_full,
            'synthetic': synthetic_full,
            'gap': gaps,
            'att': att,
            'pre_rmspe': self.rmspe_pre,
            'post_rmspe': self.rmspe_post,
            'pre_rmspe_normalized': self.rmspe_pre_normalized
        }

        return self.results

    def placebo_test(self, donor_state):
        """
        Run placebo test on a donor state.

        Applies synthetic control method to a donor state (falsely treating
        it as if it received treatment) to assess whether the estimated
        effect for the treated state is unusual.

        Parameters:
        -----------
        donor_state : str
            Name of donor state to test

        Returns:
        --------
        placebo_results : dict
            Contains gap and RMSPE for placebo test
        """
        # Create new donor pool excluding this donor
        placebo_donors = [d for d in self.valid_donors if d != donor_state]

        if len(placebo_donors) == 0:
            return None

        # Get data for placebo treated unit
        pre_data = self.data[
            (self.data['date'] >= self.pre_start) &
            (self.data['date'] <= self.pre_end)
        ]

        placebo_treated_pre = pre_data[
            pre_data['jurisdiction'] == donor_state
        ].sort_values('date')

        if len(placebo_treated_pre) != len(self.Y1_pre):
            return None

        Y1_placebo_pre = placebo_treated_pre['permits'].values

        # Get placebo donor pool
        donor_data_list = []
        for donor in placebo_donors:
            donor_pre = pre_data[
                pre_data['jurisdiction'] == donor
            ].sort_values('date')

            if len(donor_pre) == len(self.Y1_pre):
                donor_data_list.append(donor_pre['permits'].values)

        if len(donor_data_list) == 0:
            return None

        Y0_placebo_pre = np.column_stack(donor_data_list)

        # Optimize weights for placebo
        n_donors = Y0_placebo_pre.shape[1]
        w = cp.Variable(n_donors)
        objective = cp.Minimize(cp.sum_squares(Y1_placebo_pre - Y0_placebo_pre @ w))
        constraints = [w >= 0, cp.sum(w) == 1]
        problem = cp.Problem(objective, constraints)

        # Try multiple solvers
        solvers_to_try = [cp.OSQP, cp.SCS, cp.CLARABEL]
        solved = False

        for solver in solvers_to_try:
            try:
                problem.solve(solver=solver, verbose=False)
                if problem.status in ['optimal', 'optimal_inaccurate']:
                    solved = True
                    break
            except Exception as e:
                # Solver failed, try next one
                continue

        if not solved or w.value is None:
            # Use equal weights as fallback
            weights_placebo = np.ones(n_donors) / n_donors
        else:
            weights_placebo = w.value

        # Calculate pre-treatment fit
        synthetic_placebo_pre = Y0_placebo_pre @ weights_placebo
        rmspe_placebo_pre = np.sqrt(np.mean((Y1_placebo_pre - synthetic_placebo_pre) ** 2))
        rmspe_placebo_pre_norm = rmspe_placebo_pre / np.mean(Y1_placebo_pre)

        # Get full time series for placebo
        placebo_full = self.data[
            self.data['jurisdiction'] == donor_state
        ].sort_values('date')
        Y1_placebo_full = placebo_full['permits'].values

        # Get donor pool full time series
        donor_full_list = []
        for donor in placebo_donors:
            donor_full = self.data[
                self.data['jurisdiction'] == donor
            ].sort_values('date')
            if len(donor_full) == len(Y1_placebo_full):
                donor_full_list.append(donor_full['permits'].values)

        if len(donor_full_list) == 0:
            return None

        Y0_placebo_full = np.column_stack(donor_full_list)

        # Compute placebo gaps
        synthetic_placebo_full = Y0_placebo_full @ weights_placebo
        gaps_placebo = Y1_placebo_full - synthetic_placebo_full

        # Post-treatment gaps
        post_mask = self.full_dates >= self.post_start
        att_placebo = np.mean(gaps_placebo[post_mask])
        rmspe_placebo_post = np.sqrt(np.mean(gaps_placebo[post_mask] ** 2))

        return {
            'state': donor_state,
            'gaps': gaps_placebo,
            'att': att_placebo,
            'pre_rmspe': rmspe_placebo_pre,
            'pre_rmspe_normalized': rmspe_placebo_pre_norm,
            'post_rmspe': rmspe_placebo_post
        }


def run_placebo_tests(sc, max_placebos=None):
    """
    Run placebo tests on all donor states.

    Parameters:
    -----------
    sc : SyntheticControl
        Fitted synthetic control object
    max_placebos : int, optional
        Maximum number of placebo tests to run

    Returns:
    --------
    placebo_results : list
        List of placebo test results
    """
    print(f"\nRunning placebo tests for {sc.treated_state}...")

    donors_to_test = sc.valid_donors.copy()
    if max_placebos and len(donors_to_test) > max_placebos:
        donors_to_test = donors_to_test[:max_placebos]

    placebo_results = []
    for donor in donors_to_test:
        result = sc.placebo_test(donor)
        if result is not None:
            placebo_results.append(result)
            print(f"  Placebo: {donor} - ATT: {result['att']:.2f}, "
                  f"Pre-RMSPE: {result['pre_rmspe_normalized']:.4f}")

    return placebo_results


def compute_p_value(sc, placebo_results, rmspe_threshold=2.0):
    """
    Compute p-value from placebo distribution.

    Uses the distribution of post/pre RMSPE ratios from placebo tests.
    States with poor pre-treatment fit are excluded.

    Parameters:
    -----------
    sc : SyntheticControl
        Fitted synthetic control object
    placebo_results : list
        Results from placebo tests
    rmspe_threshold : float
        Maximum pre-treatment RMSPE ratio to include in inference

    Returns:
    --------
    p_value : float
        One-sided p-value
    """
    # Calculate RMSPE ratio for treated unit
    treated_ratio = sc.rmspe_post / sc.rmspe_pre

    # Calculate ratios for placebos, excluding poor pre-fits
    placebo_ratios = []
    for placebo in placebo_results:
        # Filter out placebos with poor pre-treatment fit
        if placebo['pre_rmspe_normalized'] <= rmspe_threshold:
            ratio = placebo['post_rmspe'] / placebo['pre_rmspe']
            placebo_ratios.append(ratio)

    if len(placebo_ratios) == 0:
        return np.nan

    # P-value: proportion of placebos with ratio >= treated ratio
    p_value = np.mean([r >= treated_ratio for r in placebo_ratios])

    print(f"\nInference for {sc.treated_state}:")
    print(f"  Treated RMSPE ratio (post/pre): {treated_ratio:.3f}")
    print(f"  Valid placebos: {len(placebo_ratios)}")
    print(f"  P-value: {p_value:.4f}")

    return p_value


def plot_synthetic_control(sc, reform_name, output_path):
    """
    Create visualization of actual vs synthetic time series.

    Parameters:
    -----------
    sc : SyntheticControl
        Fitted synthetic control object
    reform_name : str
        Name of the reform for plot title
    output_path : str
        Path to save the plot
    """
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))

    # Panel A: Time series
    dates = pd.to_datetime(sc.results['dates'])

    ax1.plot(dates, sc.results['actual'], 'o-', linewidth=2,
             label=f'{sc.treated_state} (Actual)', color='#2563eb', markersize=4)
    ax1.plot(dates, sc.results['synthetic'], 's--', linewidth=2,
             label=f'Synthetic {sc.treated_state}', color='#dc2626', markersize=4)

    # Add vertical line at treatment
    ax1.axvline(sc.treatment_date, color='gray', linestyle=':', linewidth=2,
                alpha=0.7, label='Reform Date')

    # Add shaded pre-treatment period
    ax1.axvspan(dates.min(), sc.pre_end, alpha=0.1, color='green',
                label='Pre-treatment (fitting)')

    ax1.set_xlabel('Date', fontsize=12)
    ax1.set_ylabel('Building Permits', fontsize=12)
    ax1.set_title(f'Synthetic Control: {sc.treated_state} - {reform_name}',
                  fontsize=14, fontweight='bold')
    ax1.legend(loc='best', fontsize=10)
    ax1.grid(True, alpha=0.3)
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')

    # Panel B: Gap (treatment effect)
    ax2.plot(dates, sc.results['gap'], 'o-', linewidth=2,
             color='#059669', markersize=4)
    ax2.axhline(0, color='black', linestyle='-', linewidth=1)
    ax2.axvline(sc.treatment_date, color='gray', linestyle=':', linewidth=2, alpha=0.7)

    # Shade post-treatment period
    ax2.axvspan(sc.post_start, dates.max(), alpha=0.1, color='blue',
                label='Post-treatment')

    # Add ATT annotation
    post_mask = dates >= sc.post_start
    att = sc.results['att']
    ax2.text(0.02, 0.95, f'Average Treatment Effect: {att:.0f} permits/month',
             transform=ax2.transAxes, fontsize=11, verticalalignment='top',
             bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

    ax2.set_xlabel('Date', fontsize=12)
    ax2.set_ylabel('Gap (Actual - Synthetic)', fontsize=12)
    ax2.set_title('Treatment Effect Over Time', fontsize=14, fontweight='bold')
    ax2.legend(loc='best', fontsize=10)
    ax2.grid(True, alpha=0.3)
    ax2.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
    plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"  Saved plot: {output_path}")
    plt.close()


def plot_placebo_tests(sc, placebo_results, reform_name, output_path):
    """
    Create visualization of placebo test distribution.

    Parameters:
    -----------
    sc : SyntheticControl
        Fitted synthetic control object
    placebo_results : list
        Results from placebo tests
    reform_name : str
        Name of the reform for plot title
    output_path : str
        Path to save the plot
    """
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))

    dates = pd.to_datetime(sc.results['dates'])

    # Plot all placebo gaps in gray
    for placebo in placebo_results:
        ax.plot(dates, placebo['gaps'], '-', linewidth=1,
                color='gray', alpha=0.3)

    # Plot treated state gap in bold
    ax.plot(dates, sc.results['gap'], '-', linewidth=3,
            color='#2563eb', label=f'{sc.treated_state} (Treated)', zorder=10)

    ax.axhline(0, color='black', linestyle='-', linewidth=1)
    ax.axvline(sc.treatment_date, color='red', linestyle=':',
               linewidth=2, alpha=0.7, label='Reform Date')

    ax.set_xlabel('Date', fontsize=12)
    ax.set_ylabel('Gap (Actual - Synthetic)', fontsize=12)
    ax.set_title(f'Placebo Tests: {sc.treated_state} - {reform_name}\n' +
                 f'Gray lines = {len(placebo_results)} placebo states',
                 fontsize=14, fontweight='bold')
    ax.legend(loc='best', fontsize=11)
    ax.grid(True, alpha=0.3)
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
    plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"  Saved placebo plot: {output_path}")
    plt.close()


def plot_rmspe_distribution(sc, placebo_results, reform_name, output_path):
    """
    Create visualization of RMSPE ratio distribution.

    Parameters:
    -----------
    sc : SyntheticControl
        Fitted synthetic control object
    placebo_results : list
        Results from placebo tests
    reform_name : str
        Name of the reform for plot title
    output_path : str
        Path to save the plot
    """
    # Calculate RMSPE ratios
    treated_ratio = sc.rmspe_post / sc.rmspe_pre

    placebo_ratios = []
    placebo_states = []
    for placebo in placebo_results:
        ratio = placebo['post_rmspe'] / placebo['pre_rmspe']
        placebo_ratios.append(ratio)
        placebo_states.append(placebo['state'])

    # Create plot
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))

    # Bar chart of RMSPE ratios
    colors = ['#dc2626' if r >= treated_ratio else '#9ca3af' for r in placebo_ratios]
    bars = ax.bar(range(len(placebo_ratios)), sorted(placebo_ratios, reverse=True),
                   color=colors, alpha=0.7)

    # Highlight treated state
    treated_pos = len([r for r in placebo_ratios if r > treated_ratio])
    ax.bar(treated_pos, treated_ratio, color='#2563eb', alpha=0.9,
           label=f'{sc.treated_state} (Treated)')

    ax.axhline(treated_ratio, color='#2563eb', linestyle='--',
               linewidth=2, alpha=0.5)

    ax.set_xlabel('State (ranked by RMSPE ratio)', fontsize=12)
    ax.set_ylabel('Post/Pre RMSPE Ratio', fontsize=12)
    ax.set_title(f'RMSPE Ratio Distribution: {sc.treated_state} - {reform_name}\n' +
                 f'Higher ratio = larger post-treatment deviation',
                 fontsize=14, fontweight='bold')
    ax.legend(loc='best', fontsize=11)
    ax.grid(True, alpha=0.3, axis='y')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"  Saved RMSPE distribution: {output_path}")
    plt.close()


def main():
    """
    Main execution function for synthetic control analysis.
    """
    print("=" * 70)
    print("SYNTHETIC CONTROL METHOD - ZONING REFORM ANALYSIS")
    print("=" * 70)

    # Load data
    print("\nLoading data...")
    timeseries = pd.read_csv(TIMESERIES_CSV)
    metrics = pd.read_csv(METRICS_CSV)

    print(f"  Timeseries data: {len(timeseries)} rows")
    print(f"  Reform metadata: {len(metrics)} reforms")

    # Get all states
    all_states = timeseries['jurisdiction'].unique()
    print(f"  Total states in data: {len(all_states)}")

    # Get reform states and their treatment dates
    reform_states = {}
    for row in metrics.itertuples(index=False):
        reform_states[row.jurisdiction] = {
            'date': pd.to_datetime(row.effective_date),
            'reform_name': row.reform_name,
            'reform_type': row.reform_type
        }

    print(f"  Reform states: {list(reform_states.keys())}")

    # Results storage
    all_results = []

    # Run synthetic control for each reform state
    for state, info in reform_states.items():
        print("\n" + "=" * 70)
        print(f"ANALYZING: {state} - {info['reform_name']}")
        print("=" * 70)

        # Define donor pool (all states except treated)
        donor_states = [s for s in all_states if s != state]

        # Create synthetic control
        sc = SyntheticControl(
            treated_state=state,
            treatment_date=info['date'],
            donor_states=donor_states,
            data=timeseries,
            pre_buffer_months=12
        )

        # Optimize weights
        sc.optimize_weights()

        # Compute effects
        results = sc.compute_effects()

        # Run placebo tests
        placebo_results = run_placebo_tests(sc, max_placebos=None)

        # Compute p-value
        p_value = compute_p_value(sc, placebo_results, rmspe_threshold=2.0)

        # Store results
        all_results.append({
            'state': state,
            'reform': info['reform_name'],
            'reform_type': info['reform_type'],
            'treatment_date': info['date'].date(),
            'actual_effect': results['att'],
            'synthetic_effect': 0,  # By definition
            'gap': results['att'],
            'pre_rmspe': results['pre_rmspe'],
            'pre_rmspe_normalized': results['pre_rmspe_normalized'],
            'post_rmspe': results['post_rmspe'],
            'rmspe_ratio': results['post_rmspe'] / results['pre_rmspe'],
            'p_value': p_value,
            'n_donors': len(sc.valid_donors),
            'n_placebos': len(placebo_results)
        })

        # Create visualizations
        viz_base = f"synthetic_control_{state.lower().replace(' ', '_')}"

        plot_synthetic_control(
            sc, info['reform_name'],
            os.path.join(VIZ_DIR, f"{viz_base}_timeseries.png")
        )

        plot_placebo_tests(
            sc, placebo_results, info['reform_name'],
            os.path.join(VIZ_DIR, f"{viz_base}_placebos.png")
        )

        plot_rmspe_distribution(
            sc, placebo_results, info['reform_name'],
            os.path.join(VIZ_DIR, f"{viz_base}_rmspe.png")
        )

    # Save results
    results_df = pd.DataFrame(all_results)
    results_path = os.path.join(OUTPUT_DIR, "synthetic_control_results.csv")
    results_df.to_csv(results_path, index=False)
    print(f"\n✅ Saved results: {results_path}")

    # Print summary table
    print("\n" + "=" * 70)
    print("SUMMARY OF RESULTS")
    print("=" * 70)
    print(results_df.to_string(index=False))

    # Compare with DiD if available
    print("\n" + "=" * 70)
    print("COMPARISON WITH DIFFERENCE-IN-DIFFERENCES")
    print("=" * 70)

    for row in results_df.itertuples(index=False):
        # Get DiD estimate from metrics
        did_row = metrics[metrics['jurisdiction'] == row.state].iloc[0]
        did_effect = did_row['absolute_change']

        sc_effect = row.actual_effect
        diff = abs(sc_effect - did_effect)
        pct_diff = (diff / abs(did_effect)) * 100 if did_effect != 0 else np.nan

        print(f"\n{row.state}:")
        print(f"  DiD estimate: {did_effect:.2f}")
        print(f"  Synthetic Control estimate: {sc_effect:.2f}")
        print(f"  Absolute difference: {diff:.2f}")
        print(f"  Percent difference: {pct_diff:.2f}%")

        if pct_diff < 5:
            print(f"  ✅ Estimates are consistent (within 5%)")
        elif pct_diff < 10:
            print(f"  ⚠️  Estimates differ moderately (5-10%)")
        else:
            print(f"  ❌ Estimates differ substantially (>10%)")

    print("\n" + "=" * 70)
    print("ANALYSIS COMPLETE")
    print("=" * 70)
    print(f"\nOutputs saved to:")
    print(f"  - {results_path}")
    print(f"  - {VIZ_DIR}/synthetic_control_*.png")

    return results_df


if __name__ == "__main__":
    main()
