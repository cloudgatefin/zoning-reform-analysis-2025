#!/usr/bin/env python3
"""
Compute pre/post reform metrics for cities with zoning reforms

This script analyzes building permit data before and after zoning reforms
to measure their impact on housing production.

Usage:
    python scripts/12_compute_city_metrics.py

Inputs:
    - data/raw/city_reforms.csv (reform dates and details)
    - data/raw/census_bps_place_all_years.csv (permit data)

Output:
    - data/outputs/city_reforms_with_metrics.csv (pre/post analysis)
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants
PRE_PERIOD_MONTHS = 24
POST_PERIOD_MONTHS = 24
MIN_MONTHS_REQUIRED = 12  # Minimum months of data to compute metrics


def load_data():
    """Load reform and permit datasets."""
    logger.info("Loading datasets...")

    try:
        reforms_df = pd.read_csv('data/raw/city_reforms.csv')
        logger.info(f"✓ Loaded {len(reforms_df)} reforms")
    except FileNotFoundError:
        logger.error("ERROR: data/raw/city_reforms.csv not found")
        sys.exit(1)

    try:
        permits_df = pd.read_csv('data/raw/census_bps_place_all_years.csv')
        logger.info(f"✓ Loaded {len(permits_df)} permit records")
    except FileNotFoundError:
        logger.error("ERROR: data/raw/census_bps_place_all_years.csv not found")
        logger.warning("Please run scripts/11_fetch_city_permits_api.py first")
        sys.exit(1)

    # Convert effective_date to datetime
    reforms_df['effective_date'] = pd.to_datetime(reforms_df['effective_date'])

    # Ensure place_fips is string with leading zeros
    reforms_df['place_fips'] = reforms_df['place_fips'].astype(str).str.zfill(7)
    permits_df['place_fips'] = permits_df['place_fips'].astype(str).str.zfill(7)

    return reforms_df, permits_df


def get_annual_data_for_period(permits_df, place_fips, start_year, end_year):
    """
    Get annual permit data for a specific place and year range.

    Since Census BPS data is annual, we extract years within the period.

    Args:
        permits_df: DataFrame with permit data
        place_fips: Place FIPS code
        start_year: Start year (inclusive)
        end_year: End year (inclusive)

    Returns:
        DataFrame with filtered data
    """
    mask = (
        (permits_df['place_fips'] == place_fips) &
        (permits_df['year'] >= start_year) &
        (permits_df['year'] <= end_year)
    )
    return permits_df[mask].copy()


def compute_period_metrics(period_data):
    """
    Compute average metrics for a period (pre or post).

    Args:
        period_data: DataFrame with permit data for the period

    Returns:
        Dictionary with computed metrics
    """
    if len(period_data) == 0:
        return {
            'mean_sf': None,
            'mean_mf': None,
            'mean_total': None,
            'months_available': 0,
            'years_available': 0
        }

    # Since data is annual, compute mean across years
    metrics = {
        'mean_sf': period_data['sf_permits'].mean() if period_data['sf_permits'].notna().any() else None,
        'mean_mf': period_data['mf_permits'].mean() if period_data['mf_permits'].notna().any() else None,
        'mean_total': period_data['total_permits'].mean() if period_data['total_permits'].notna().any() else None,
        'months_available': len(period_data) * 12,  # Annual data = 12 months per year
        'years_available': len(period_data)
    }

    return metrics


def assess_data_quality(pre_metrics, post_metrics, reform_date):
    """
    Assess data quality and generate quality flags.

    Args:
        pre_metrics: Pre-period metrics dict
        post_metrics: Post-period metrics dict
        reform_date: Date of reform

    Returns:
        String describing data quality
    """
    issues = []

    # Check pre-period
    if pre_metrics['years_available'] == 0:
        issues.append("no_pre_data")
    elif pre_metrics['years_available'] < 2:
        issues.append("limited_pre_data")

    # Check post-period
    if post_metrics['years_available'] == 0:
        issues.append("no_post_data")
    elif post_metrics['years_available'] < 2:
        issues.append("limited_post_data")

    # Check for recent reforms with limited post data
    years_since_reform = (datetime.now() - reform_date).days / 365.25
    if years_since_reform < 2:
        issues.append("recent_reform")

    # Check for missing values
    if pre_metrics['mean_total'] is None:
        issues.append("missing_pre_values")
    if post_metrics['mean_total'] is None:
        issues.append("missing_post_values")

    if not issues:
        return "complete"
    else:
        return ";".join(issues)


def compute_city_reform_metrics(reform_row, permits_df):
    """
    Compute pre/post metrics for a single city reform.

    Args:
        reform_row: Series with reform information
        permits_df: DataFrame with all permit data

    Returns:
        Dictionary with computed metrics and metadata
    """
    place_fips = reform_row['place_fips']
    city_name = reform_row['city_name']
    reform_date = reform_row['effective_date']

    logger.info(f"Computing metrics for {city_name} (reform: {reform_date.strftime('%Y-%m-%d')})")

    # Calculate pre-period: 24 months before reform
    pre_start_date = reform_date - relativedelta(months=PRE_PERIOD_MONTHS)
    pre_end_date = reform_date - timedelta(days=1)

    # Calculate post-period: 24 months after reform
    post_start_date = reform_date
    post_end_date = reform_date + relativedelta(months=POST_PERIOD_MONTHS)

    # Convert to years for annual data
    pre_start_year = pre_start_date.year
    pre_end_year = pre_end_date.year

    post_start_year = post_start_date.year
    post_end_year = min(post_end_date.year, 2024)  # Don't go beyond 2024

    # Get data for each period
    pre_data = get_annual_data_for_period(permits_df, place_fips, pre_start_year, pre_end_year)
    post_data = get_annual_data_for_period(permits_df, place_fips, post_start_year, post_end_year)

    # Compute metrics
    pre_metrics = compute_period_metrics(pre_data)
    post_metrics = compute_period_metrics(post_data)

    # Calculate changes
    abs_change = None
    pct_change = None
    mf_share_pre = None
    mf_share_post = None
    mf_share_change = None

    if pre_metrics['mean_total'] is not None and post_metrics['mean_total'] is not None:
        abs_change = post_metrics['mean_total'] - pre_metrics['mean_total']
        if pre_metrics['mean_total'] > 0:
            pct_change = (abs_change / pre_metrics['mean_total']) * 100

    if pre_metrics['mean_total'] is not None and pre_metrics['mean_mf'] is not None:
        if pre_metrics['mean_total'] > 0:
            mf_share_pre = (pre_metrics['mean_mf'] / pre_metrics['mean_total']) * 100

    if post_metrics['mean_total'] is not None and post_metrics['mean_mf'] is not None:
        if post_metrics['mean_total'] > 0:
            mf_share_post = (post_metrics['mean_mf'] / post_metrics['mean_total']) * 100

    if mf_share_pre is not None and mf_share_post is not None:
        mf_share_change = mf_share_post - mf_share_pre

    # Assess data quality
    data_quality = assess_data_quality(pre_metrics, post_metrics, reform_date)

    # Compile results
    result = {
        'place_fips': reform_row['place_fips'],
        'city_name': reform_row['city_name'],
        'state_fips': reform_row['state_fips'],
        'state_name': reform_row['state_name'],
        'reform_name': reform_row['reform_name'],
        'reform_type': reform_row['reform_type'],
        'effective_date': reform_row['effective_date'].strftime('%Y-%m-%d'),
        'baseline_wrluri': reform_row['baseline_wrluri'],

        # Pre-period metrics
        'pre_mean_sf': pre_metrics['mean_sf'],
        'pre_mean_mf': pre_metrics['mean_mf'],
        'pre_mean_total': pre_metrics['mean_total'],
        'pre_years': pre_metrics['years_available'],

        # Post-period metrics
        'post_mean_sf': post_metrics['mean_sf'],
        'post_mean_mf': post_metrics['mean_mf'],
        'post_mean_total': post_metrics['mean_total'],
        'post_years': post_metrics['years_available'],

        # Change metrics
        'abs_change': abs_change,
        'pct_change': pct_change,
        'mf_share_pre': mf_share_pre,
        'mf_share_post': mf_share_post,
        'mf_share_change': mf_share_change,

        # Data quality
        'data_quality': data_quality
    }

    # Log summary
    if abs_change is not None:
        logger.info(
            f"  → Pre: {pre_metrics['mean_total']:.1f} permits/yr "
            f"({pre_metrics['years_available']} yrs) | "
            f"Post: {post_metrics['mean_total']:.1f} permits/yr "
            f"({post_metrics['years_available']} yrs) | "
            f"Change: {pct_change:+.1f}%"
        )
    else:
        logger.warning(f"  → Insufficient data: {data_quality}")

    return result


def validate_against_state_totals(permits_df):
    """
    Validate place-level data against state-level totals.

    Args:
        permits_df: DataFrame with place-level permit data

    Returns:
        Validation report as string
    """
    logger.info("\n" + "=" * 80)
    logger.info("VALIDATION: Checking place-level vs state-level totals")
    logger.info("=" * 80)

    try:
        # Try to load state-level data if available
        state_df = pd.read_csv('data/raw/state_permits_monthly_comprehensive.csv')

        # Aggregate annual state totals from monthly data
        state_df['year'] = pd.to_datetime(state_df['month']).dt.year
        state_annual = state_df.groupby(['state', 'year'])['permits'].sum().reset_index()
        state_annual.rename(columns={'permits': 'state_total'}, inplace=True)

        # Aggregate place-level to state level
        place_state_totals = permits_df.groupby(['state_name', 'year'])['total_permits'].sum().reset_index()
        place_state_totals.rename(columns={'state_name': 'state', 'total_permits': 'place_total'}, inplace=True)

        # Merge and compare
        comparison = pd.merge(state_annual, place_state_totals, on=['state', 'year'], how='left')
        comparison['coverage_pct'] = (comparison['place_total'] / comparison['state_total']) * 100
        comparison = comparison.fillna(0)

        overall_coverage = comparison['place_total'].sum() / comparison['state_total'].sum() * 100

        logger.info(f"\nOverall coverage: {overall_coverage:.1f}%")
        logger.info(f"Average coverage: {comparison['coverage_pct'].mean():.1f}%")

        if overall_coverage >= 95:
            logger.info("✓ VALIDATION PASSED: Place-level data covers >95% of state totals")
        else:
            logger.warning(f"⚠ VALIDATION WARNING: Coverage is {overall_coverage:.1f}% (<95%)")

        return f"coverage_{overall_coverage:.1f}pct"

    except FileNotFoundError:
        logger.warning("State-level data not found, skipping validation")
        return "validation_skipped"


def main():
    """Main execution function."""
    logger.info("=" * 80)
    logger.info("CITY-LEVEL REFORM METRICS CALCULATOR")
    logger.info("Computing pre/post reform impacts on building permits")
    logger.info("=" * 80)

    # Load data
    reforms_df, permits_df = load_data()

    # Compute metrics for each reform
    logger.info(f"\nProcessing {len(reforms_df)} city reforms...")
    logger.info("=" * 80)

    results = []
    for idx, reform_row in reforms_df.iterrows():
        try:
            result = compute_city_reform_metrics(reform_row, permits_df)
            results.append(result)
        except Exception as e:
            logger.error(f"Error processing {reform_row['city_name']}: {str(e)}")
            continue

    # Create results DataFrame
    results_df = pd.DataFrame(results)

    # Save results
    output_path = 'data/outputs/city_reforms_with_metrics.csv'
    results_df.to_csv(output_path, index=False)
    logger.info(f"\n✓ Results saved to: {output_path}")

    # Validation
    validation_result = validate_against_state_totals(permits_df)

    # Summary statistics
    logger.info("\n" + "=" * 80)
    logger.info("SUMMARY STATISTICS")
    logger.info("=" * 80)

    complete_data = results_df[results_df['data_quality'] == 'complete']
    logger.info(f"Total reforms analyzed: {len(results_df)}")
    logger.info(f"Reforms with complete data: {len(complete_data)}")

    if len(complete_data) > 0:
        logger.info(f"\nPermit changes (complete data only):")
        logger.info(f"  Mean % change: {complete_data['pct_change'].mean():.1f}%")
        logger.info(f"  Median % change: {complete_data['pct_change'].median():.1f}%")
        logger.info(f"  Positive changes: {(complete_data['pct_change'] > 0).sum()}")
        logger.info(f"  Negative changes: {(complete_data['pct_change'] < 0).sum()}")

        logger.info(f"\nMulti-family share changes:")
        logger.info(f"  Mean MF share before: {complete_data['mf_share_pre'].mean():.1f}%")
        logger.info(f"  Mean MF share after: {complete_data['mf_share_post'].mean():.1f}%")
        logger.info(f"  Mean MF share change: {complete_data['mf_share_change'].mean():.1f} pp")

    # Data quality breakdown
    logger.info(f"\nData quality breakdown:")
    quality_counts = results_df['data_quality'].value_counts()
    for quality, count in quality_counts.items():
        logger.info(f"  {quality}: {count}")

    logger.info("\n" + "=" * 80)
    logger.info("SUCCESS: City reform metrics computation complete!")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()
