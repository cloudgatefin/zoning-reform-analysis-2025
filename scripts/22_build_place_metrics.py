#!/usr/bin/env python3
"""
Phase 1.1: Place-Level Metrics Computation

Computes key metrics for each place:
- Permit growth rates (YoY, 5-year, 10-year)
- Multi-family housing share (trends)
- Volatility (permit variability)
- Recent activity (2023-2024)
- Ranking and percentile comparisons

Inputs:
  - data/raw/census_bps_places_directory.csv
  - data/raw/census_bps_place_annual_permits.csv

Outputs:
  - data/outputs/place_metrics_comprehensive.csv (20K+ places with growth, MF share, rankings)
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys
from typing import Dict, List

# Configuration
PLACES_DIR = Path("data/raw/census_bps_places_directory.csv")
ANNUAL_PERMITS = Path("data/raw/census_bps_place_annual_permits.csv")
OUTPUT_FILE = Path("data/outputs/place_metrics_comprehensive.csv")


def load_data() -> tuple:
    """Load input files."""
    print(f"\n[INFO] Loading place data...")

    if not PLACES_DIR.exists() or not ANNUAL_PERMITS.exists():
        print(f"\n[FAIL] Input files not found")
        print(f"[INFO] First run these scripts:")
        print(f"  1. python scripts/20_fetch_place_permits_bulk.py")
        print(f"  2. python scripts/21_parse_place_data_format.py")
        sys.exit(1)

    places = pd.read_csv(PLACES_DIR, dtype={'state_fips': str})
    annual = pd.read_csv(ANNUAL_PERMITS, dtype={'state_fips': str})

    print(f"[OK] Places: {len(places):,}")
    print(f"[OK] Annual permits: {len(annual):,} records")

    return places, annual


def compute_growth_metrics(annual: pd.DataFrame) -> pd.DataFrame:
    """
    Compute growth metrics for each place.

    Metrics:
    - growth_rate_2yr: YoY growth over last 2 years
    - growth_rate_5yr: CAGR over 5 years
    - growth_rate_10yr: CAGR over 10 years
    - recent_permits_2024: Most recent year total
    - recent_permits_2023: Prior year total
    """
    print(f"\n[INFO] Computing growth metrics...")

    metrics = []

    for (state_fips, place_name), group in annual.groupby(['state_fips', 'place_name']):
        group = group.sort_values('year')

        year_min = group['year'].min()
        year_max = group['year'].max()
        years_available = year_max - year_min + 1

        record = {
            'state_fips': state_fips,
            'place_name': place_name,
            'years_available': years_available,
            'first_year': int(year_min),
            'last_year': int(year_max),
            'growth_rate_2yr': np.nan,
            'growth_rate_5yr': np.nan,
            'growth_rate_10yr': np.nan,
            'recent_units_2024': 0,
            'recent_units_2023': 0,
            'prior_units_2022': 0,
            'total_units_all': group['total_units'].sum(),
            'avg_annual_units': 0,
            'volatility_cv': 0,  # Coefficient of variation
        }

        # 2-year growth (most recent 2 years)
        if len(group) >= 2:
            recent = group.tail(2)
            units_prev = recent.iloc[0]['total_units']
            units_curr = recent.iloc[1]['total_units']

            if units_prev > 0:
                record['growth_rate_2yr'] = ((units_curr - units_prev) / units_prev) * 100

        # 5-year growth
        if len(group) >= 5:
            five_yr = group.tail(5)
            units_yr1 = five_yr.iloc[0]['total_units']
            units_yr5 = five_yr.iloc[-1]['total_units']

            if units_yr1 > 0:
                cagr = (((units_yr5 / units_yr1) ** (1/4)) - 1) * 100
                record['growth_rate_5yr'] = cagr

        # 10-year growth
        if len(group) >= 10:
            ten_yr = group.tail(10)
            units_yr1 = ten_yr.iloc[0]['total_units']
            units_yr10 = ten_yr.iloc[-1]['total_units']

            if units_yr1 > 0:
                cagr = (((units_yr10 / units_yr1) ** (1/9)) - 1) * 100
                record['growth_rate_10yr'] = cagr

        # Recent years
        recent_data = group[group['year'] >= 2022].sort_values('year')
        if len(recent_data) > 0:
            for idx, row in recent_data.iterrows():
                if row['year'] == 2024:
                    record['recent_units_2024'] = int(row['total_units'])
                elif row['year'] == 2023:
                    record['recent_units_2023'] = int(row['total_units'])
                elif row['year'] == 2022:
                    record['prior_units_2022'] = int(row['total_units'])

        # Average annual
        if len(group) > 0:
            record['avg_annual_units'] = int(group['total_units'].mean())

        # Volatility (coefficient of variation)
        units_series = group['total_units']
        if len(units_series) > 1 and units_series.mean() > 0:
            cv = (units_series.std() / units_series.mean()) * 100
            record['volatility_cv'] = cv

        metrics.append(record)

    metrics_df = pd.DataFrame(metrics)

    # Fill NaN growth rates with 0
    for col in ['growth_rate_2yr', 'growth_rate_5yr', 'growth_rate_10yr']:
        metrics_df[col] = metrics_df[col].fillna(0)

    print(f"[OK] Computed metrics for {len(metrics_df):,} places")

    return metrics_df


def compute_multifamily_metrics(annual: pd.DataFrame) -> pd.DataFrame:
    """
    Compute multi-family housing metrics.

    Metrics:
    - mf_share_recent: MF % of units (2023-2024)
    - mf_share_all_time: MF % of all units ever permitted
    - mf_growth_trend: MF growth vs overall growth
    - single_family_pct: SF % for comparison
    """
    print(f"\n[INFO] Computing multi-family metrics...")

    mf_metrics = []

    for (state_fips, place_name), group in annual.groupby(['state_fips', 'place_name']):
        group = group.sort_values('year')

        record = {
            'state_fips': state_fips,
            'place_name': place_name,
            'mf_share_all_time': 0,
            'mf_share_recent': 0,
            'sf_share_all_time': 0,
            'mf_units_total': 0,
            'sf_units_total': 0,
            'mf_trend': 'stable',  # increasing, decreasing, stable
        }

        # All-time MF share
        if group['total_units'].sum() > 0:
            mf_total = group['mf_units'].sum()
            sf_total = group['sf_units'].sum()
            record['mf_units_total'] = int(mf_total)
            record['sf_units_total'] = int(sf_total)
            record['mf_share_all_time'] = ((mf_total / group['total_units'].sum()) * 100)
            record['sf_share_all_time'] = ((sf_total / group['total_units'].sum()) * 100)

        # Recent MF share (last 3 years if available)
        recent = group[group['year'] >= (group['year'].max() - 2)]
        if len(recent) > 0 and recent['total_units'].sum() > 0:
            mf_recent = recent['mf_units'].sum()
            record['mf_share_recent'] = ((mf_recent / recent['total_units'].sum()) * 100)

        # Trend (compare first half vs second half of data)
        if len(group) >= 4:
            mid = len(group) // 2
            first_half = group.iloc[:mid]
            second_half = group.iloc[mid:]

            mf_share_1 = (first_half['mf_units'].sum() / first_half['total_units'].sum() * 100) if first_half['total_units'].sum() > 0 else 0
            mf_share_2 = (second_half['mf_units'].sum() / second_half['total_units'].sum() * 100) if second_half['total_units'].sum() > 0 else 0

            if mf_share_2 > mf_share_1 + 5:
                record['mf_trend'] = 'increasing'
            elif mf_share_2 < mf_share_1 - 5:
                record['mf_trend'] = 'decreasing'
            else:
                record['mf_trend'] = 'stable'

        mf_metrics.append(record)

    mf_df = pd.DataFrame(mf_metrics)
    print(f"[OK] Computed MF metrics for {len(mf_df):,} places")

    return mf_df


def compute_rankings(growth_df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute percentile rankings by state and nationally.

    Percentiles based on:
    - recent_units_2024: Total permits last year
    - growth_rate_5yr: 5-year CAGR
    - avg_annual_units: Average annual permits
    """
    print(f"\n[INFO] Computing rankings and percentiles...")

    # National rankings
    growth_df['rank_permits_national'] = growth_df['recent_units_2024'].rank(pct=True) * 100
    growth_df['rank_growth_national'] = growth_df['growth_rate_5yr'].rank(pct=True) * 100

    # State rankings
    growth_df['rank_permits_state'] = (
        growth_df.groupby('state_fips')['recent_units_2024'].rank(pct=True) * 100
    )

    growth_df['rank_growth_state'] = (
        growth_df.groupby('state_fips')['growth_rate_5yr'].rank(pct=True) * 100
    )

    print(f"[OK] Computed rankings")

    return growth_df


def identify_key_markets(df: pd.DataFrame) -> List[str]:
    """Identify top 50 places by recent permit activity."""
    top_places = df.nlargest(50, 'recent_units_2024')['place_name'].tolist()
    return top_places


def merge_all_metrics(growth_df: pd.DataFrame, mf_df: pd.DataFrame, places: pd.DataFrame) -> pd.DataFrame:
    """Merge all metrics together."""
    print(f"\n[INFO] Merging all metrics...")

    # Merge growth and MF metrics
    merged = growth_df.merge(
        mf_df[['state_fips', 'place_name', 'mf_share_all_time', 'mf_share_recent',
                'sf_share_all_time', 'mf_units_total', 'sf_units_total', 'mf_trend']],
        on=['state_fips', 'place_name']
    )

    # Merge with place directory
    merged = merged.merge(
        places[['state_fips', 'place_name', 'place_fips', 'location_type']],
        on=['state_fips', 'place_name'],
        how='left'
    )

    # Reorder columns logically
    columns = [
        'place_fips', 'place_name', 'state_fips', 'location_type',
        'recent_units_2024', 'recent_units_2023', 'prior_units_2022',
        'growth_rate_2yr', 'growth_rate_5yr', 'growth_rate_10yr',
        'avg_annual_units', 'volatility_cv',
        'mf_share_recent', 'mf_share_all_time', 'sf_share_all_time',
        'mf_units_total', 'sf_units_total', 'mf_trend',
        'total_units_all', 'years_available', 'first_year', 'last_year',
        'rank_permits_national', 'rank_growth_national',
        'rank_permits_state', 'rank_growth_state'
    ]

    merged = merged[[col for col in columns if col in merged.columns]]
    merged = merged.sort_values('recent_units_2024', ascending=False).reset_index(drop=True)

    print(f"[OK] Merged metrics: {len(merged):,} places")

    return merged


def print_summary(df: pd.DataFrame):
    """Print summary statistics."""
    print("\n" + "="*70)
    print("METRICS COMPUTATION COMPLETE")
    print("="*70)

    print(f"\nOutput: {OUTPUT_FILE}")
    print(f"Total Places: {len(df):,}")

    # Top 10 markets
    print(f"\nTop 10 Markets (2024 Permits):")
    for idx, row in df.head(10).iterrows():
        print(f"  {idx+1:2d}. {row['place_name']:30s} {row['state_fips']:2s}  "
              f"{int(row['recent_units_2024']):6,} units  "
              f"MF: {row['mf_share_recent']:5.1f}%")

    print(f"\nFastest Growing (5-year):")
    fast_growing = df[df['growth_rate_5yr'] > 0].nlargest(10, 'growth_rate_5yr')
    for idx, row in fast_growing.iterrows():
        print(f"  {row['place_name']:30s} {row['state_fips']:2s}  "
              f"+{row['growth_rate_5yr']:6.1f}% growth  "
              f"{int(row['recent_units_2024']):6,} units")

    print(f"\nMost Multi-Family Focus:")
    mf_focus = df.nlargest(10, 'mf_share_recent')
    for idx, row in mf_focus.iterrows():
        print(f"  {row['place_name']:30s} {row['state_fips']:2s}  "
              f"MF: {row['mf_share_recent']:5.1f}%  "
              f"{int(row['recent_units_2024']):6,} units")

    print(f"\nData Quality:")
    print(f"  - Places with 2024 data: {(df['recent_units_2024'] > 0).sum():,}")
    print(f"  - Average years of data: {df['years_available'].mean():.1f}")
    print(f"  - Avg annual permits: {df['avg_annual_units'].mean():.0f}")

    print(f"\nNext Steps:")
    print(f"1. Run script 23_geocode_places.py to add coordinates")
    print(f"2. Create search index with Fuse.js")
    print(f"3. Build place explorer component")
    print(f"4. Deploy dashboard with searchable places")


def main():
    """Main execution."""
    print("\n" + "="*70)
    print("PLACE METRICS COMPUTATION")
    print("Phase 1.1: Growth & Affordability Metrics")
    print("="*70)

    # Setup output directory
    Path("data/outputs").mkdir(parents=True, exist_ok=True)

    # Load data
    places, annual = load_data()

    # Compute metrics
    growth_df = compute_growth_metrics(annual)
    mf_df = compute_multifamily_metrics(annual)

    # Add rankings
    growth_df = compute_rankings(growth_df)

    # Merge all metrics
    merged = merge_all_metrics(growth_df, mf_df, places)

    # Save
    merged.to_csv(OUTPUT_FILE, index=False)
    print(f"\n[OK] Saved: {OUTPUT_FILE}")

    # Summary
    print_summary(merged)

    return 0


if __name__ == "__main__":
    sys.exit(main())
