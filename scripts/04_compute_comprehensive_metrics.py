#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Compute Pre/Post Reform Metrics with Statistical Controls
Following research framework methodology
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Reform database (from your research framework)
REFORMS = [
    {
        'jurisdiction': 'California',
        'state_fips': '06',
        'reform_name': 'SB9 Lot Splits + ADU Package',
        'reform_type': 'State Preemption',
        'effective_date': '2022-01-01',
        'baseline_wrluri': 1.89
    },
    {
        'jurisdiction': 'Oregon',
        'state_fips': '41',
        'reform_name': 'HB2001 Middle Housing',
        'reform_type': 'Density Upzoning',
        'effective_date': '2021-08-01',
        'baseline_wrluri': 1.42
    },
    {
        'jurisdiction': 'Minnesota',
        'state_fips': '27',
        'reform_name': '2040 Plan - SF Zoning Ban',
        'reform_type': 'Single-Family Ban',
        'effective_date': '2020-01-01',
        'baseline_wrluri': 1.38
    },
    {
        'jurisdiction': 'Virginia',
        'state_fips': '51',
        'reform_name': 'Statewide ADU Reform',
        'reform_type': 'ADU Legalization',
        'effective_date': '2021-07-01',
        'baseline_wrluri': 1.25
    },
    {
        'jurisdiction': 'North Carolina',
        'state_fips': '37',
        'reform_name': 'Raleigh Missing Middle',
        'reform_type': 'Density Upzoning',
        'effective_date': '2021-06-01',
        'baseline_wrluri': 1.12
    },
    {
        'jurisdiction': 'Montana',
        'state_fips': '30',
        'reform_name': 'HB3-2023 Housing Package',
        'reform_type': 'State Preemption',
        'effective_date': '2023-07-01',
        'baseline_wrluri': 0.92
    }
]

def load_permit_data():
    """Load comprehensive permit data"""
    df = pd.read_csv('data/raw/state_permits_monthly_comprehensive.csv', dtype={'state_fips': str})
    df['date'] = pd.to_datetime(df['date'])
    # Ensure FIPS codes have leading zeros (2 digits)
    df['state_fips'] = df['state_fips'].str.zfill(2)
    return df

def compute_pre_post_metrics(reform, permits_df):
    """
    Compute metrics following research framework:
    - Pre-period: 24 months before reform
    - Lag: 12 months (supply response time)
    - Post-period: 24 months after lag
    """

    effective_date = pd.to_datetime(reform['effective_date'])
    state_fips = reform['state_fips']

    # Filter to jurisdiction
    state_permits = permits_df[permits_df['state_fips'] == state_fips].copy()
    state_permits = state_permits.sort_values('date')

    # Define periods (from research framework)
    pre_start = effective_date - timedelta(days=730)   # 24 months before
    pre_end = effective_date - timedelta(days=30)      # End 1 month before reform
    post_start = effective_date + timedelta(days=365)  # 12 month lag
    post_end = effective_date + timedelta(days=1095)   # 24 months after lag (36 total)

    # Pre-period data
    pre_data = state_permits[
        (state_permits['date'] >= pre_start) &
        (state_permits['date'] <= pre_end)
    ]

    # Post-period data
    post_data = state_permits[
        (state_permits['date'] >= post_start) &
        (state_permits['date'] <= post_end)
    ]

    # Calculate means
    pre_sf = pre_data['sf_permits'].mean()
    pre_mf = pre_data['mf_permits'].mean()
    pre_adu = pre_data['adu_permits'].mean()
    pre_total = pre_data['total_permits'].mean()

    post_sf = post_data['sf_permits'].mean()
    post_mf = post_data['mf_permits'].mean()
    post_adu = post_data['adu_permits'].mean()
    post_total = post_data['total_permits'].mean()

    # Calculate changes
    abs_change = post_total - pre_total
    pct_change = ((post_total / pre_total) - 1) * 100 if pre_total > 0 else np.nan

    # MF share change
    pre_mf_share = (pre_mf / pre_total) * 100 if pre_total > 0 else 0
    post_mf_share = (post_mf / post_total) * 100 if post_total > 0 else 0
    mf_share_change = post_mf_share - pre_mf_share

    # ADU share change
    pre_adu_share = (pre_adu / pre_total) * 100 if pre_total > 0 else 0
    post_adu_share = (post_adu / post_total) * 100 if post_total > 0 else 0
    adu_share_change = post_adu_share - pre_adu_share

    return {
        'jurisdiction': reform['jurisdiction'],
        'state_fips': reform['state_fips'],
        'reform_name': reform['reform_name'],
        'reform_type': reform['reform_type'],
        'effective_date': reform['effective_date'],
        'baseline_wrluri': reform['baseline_wrluri'],

        # Pre-period metrics
        'pre_mean_sf': pre_sf,
        'pre_mean_mf': pre_mf,
        'pre_mean_adu': pre_adu,
        'pre_mean_total': pre_total,
        'pre_mf_share': pre_mf_share,
        'pre_adu_share': pre_adu_share,

        # Post-period metrics
        'post_mean_sf': post_sf,
        'post_mean_mf': post_mf,
        'post_mean_adu': post_adu,
        'post_mean_total': post_total,
        'post_mf_share': post_mf_share,
        'post_adu_share': post_adu_share,

        # Changes
        'abs_change': abs_change,
        'pct_change': pct_change,
        'mf_share_change': mf_share_change,
        'adu_share_change': adu_share_change,

        # Data quality
        'pre_months': len(pre_data),
        'post_months': len(post_data),
        'status': 'ok' if len(pre_data) >= 12 and len(post_data) >= 12 else 'insufficient_data'
    }

def compute_all_metrics():
    """Compute metrics for all reforms"""

    print("Loading permit data...")
    permits = load_permit_data()

    print(f"Loaded {len(permits)} permit records")
    print(f"Date range: {permits['date'].min()} to {permits['date'].max()}")

    results = []

    print("\nComputing metrics for each reform...")
    for reform in REFORMS:
        print(f"  - {reform['jurisdiction']}: {reform['reform_name']}")
        try:
            metrics = compute_pre_post_metrics(reform, permits)
            results.append(metrics)
        except Exception as e:
            print(f"    ERROR: {e}")

    # Convert to DataFrame
    df = pd.DataFrame(results)

    # Save
    import os
    os.makedirs('data/outputs', exist_ok=True)

    output_path = 'data/outputs/comprehensive_reform_metrics.csv'
    df.to_csv(output_path, index=False)

    print(f"\nSaved {len(df)} reform metrics to: {output_path}")

    # Print summary
    print("\n" + "="*60)
    print("REFORM IMPACT SUMMARY")
    print("="*60)

    for _, row in df.iterrows():
        print(f"\n{row['jurisdiction']} - {row['reform_type']}")
        print(f"  Pre: {row['pre_mean_total']:.0f} permits/month")
        print(f"  Post: {row['post_mean_total']:.0f} permits/month")
        print(f"  Change: {row['abs_change']:+.0f} ({row['pct_change']:+.2f}%)")
        print(f"  MF Share Change: {row['mf_share_change']:+.2f}%")
        print(f"  ADU Share Change: {row['adu_share_change']:+.2f}%")
        print(f"  WRLURI Baseline: {row['baseline_wrluri']}")

    return df

if __name__ == "__main__":
    compute_all_metrics()
