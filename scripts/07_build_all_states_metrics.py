#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Build Comprehensive State Metrics for ALL U.S. States
Includes both reform and non-reform states for complete map coverage
"""

import pandas as pd
import numpy as np
from datetime import datetime

def load_permit_data():
    """Load comprehensive permit data"""
    df = pd.read_csv('data/raw/state_permits_monthly_comprehensive.csv', dtype={'state_fips': str})
    df['date'] = pd.to_datetime(df['date'])
    df['state_fips'] = df['state_fips'].str.zfill(2)
    return df

def compute_state_baseline_metrics(state_fips, state_name, permits_df):
    """
    Compute baseline metrics for a state (2015-2024)
    - Total permits
    - Average monthly permits
    - Growth rate (2015-2019 vs 2020-2024)
    - MF share
    """

    state_data = permits_df[permits_df['state_fips'] == state_fips].copy()

    if len(state_data) == 0:
        return None

    # Overall metrics
    total_permits = state_data['total_permits'].sum()
    avg_monthly = state_data['total_permits'].mean()

    # First half (2015-2019) vs Second half (2020-2024)
    first_half = state_data[state_data['year'] < 2020]
    second_half = state_data[state_data['year'] >= 2020]

    first_half_avg = first_half['total_permits'].mean() if len(first_half) > 0 else 0
    second_half_avg = second_half['total_permits'].mean() if len(second_half) > 0 else 0

    # Growth rate
    growth_rate = ((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0

    # MF share
    total_sf = state_data['sf_permits'].sum()
    total_mf = state_data['mf_permits'].sum()
    mf_share = (total_mf / (total_sf + total_mf) * 100) if (total_sf + total_mf) > 0 else 0

    return {
        'state_fips': state_fips,
        'state_name': state_name,
        'total_permits_2015_2024': int(total_permits),
        'avg_monthly_permits': int(avg_monthly),
        'first_half_avg': int(first_half_avg),
        'second_half_avg': int(second_half_avg),
        'growth_rate_pct': round(growth_rate, 2),
        'mf_share_pct': round(mf_share, 2),
        'data_months': len(state_data)
    }

def build_all_states_metrics():
    """
    Build metrics for ALL states
    """

    print("BUILDING ALL STATES METRICS")
    print("=" * 60)

    # Load data
    permits = load_permit_data()

    # Get unique states from data
    states = permits[['state_fips', 'state_name']].drop_duplicates().sort_values('state_name')

    print(f"Found {len(states)} states/regions in dataset")

    all_metrics = []

    for _, state_row in states.iterrows():
        state_fips = state_row['state_fips']
        state_name = state_row['state_name']

        # Skip aggregated regions (they have non-standard FIPS)
        if not state_fips.isdigit() or len(state_fips) != 2:
            continue

        # Skip numeric region codes > 56 (territories)
        if int(state_fips) > 56:
            continue

        print(f"Processing: {state_name} ({state_fips})")

        metrics = compute_state_baseline_metrics(state_fips, state_name, permits)

        if metrics:
            all_metrics.append(metrics)

    # Convert to DataFrame
    df = pd.DataFrame(all_metrics)

    # Sort by total permits descending
    df = df.sort_values('total_permits_2015_2024', ascending=False)

    # Save
    import os
    os.makedirs('data/outputs', exist_ok=True)

    output_path = 'data/outputs/all_states_baseline_metrics.csv'
    df.to_csv(output_path, index=False)

    print("\n" + "=" * 60)
    print("ALL STATES METRICS SUMMARY")
    print("=" * 60)
    print(f"Total states processed: {len(df)}")
    print(f"\nSaved to: {output_path}")

    # Print top 10 states by total permits
    print("\n" + "=" * 60)
    print("TOP 10 STATES BY TOTAL PERMITS (2015-2024)")
    print("=" * 60)

    for i, row in df.head(10).iterrows():
        print(f"{row['state_name']:25s}: {row['total_permits_2015_2024']:>12,} total | {row['avg_monthly_permits']:>6,}/mo | {row['growth_rate_pct']:>6.1f}% growth")

    # States with highest growth
    print("\n" + "=" * 60)
    print("TOP 10 STATES BY GROWTH RATE")
    print("=" * 60)

    top_growth = df.nlargest(10, 'growth_rate_pct')

    for i, row in top_growth.iterrows():
        print(f"{row['state_name']:25s}: {row['growth_rate_pct']:>6.1f}% growth | {row['first_half_avg']:>6,} -> {row['second_half_avg']:>6,} permits/mo")

    return df

if __name__ == "__main__":
    build_all_states_metrics()
