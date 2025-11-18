"""
Data Quality Validation Suite
Validates all CSV files in data pipeline before agent integration
"""

import pandas as pd
import os
from datetime import datetime

def validate_file_exists(filepath, description):
    """Check if file exists"""
    exists = os.path.exists(filepath)
    status = "[OK]" if exists else "[FAIL]"
    size = os.path.getsize(filepath) / 1024 if exists else 0
    print(f"  {status} {description}: {filepath} ({size:.1f} KB)")
    return exists

def validate_comprehensive_metrics():
    """Validate comprehensive_reform_metrics.csv"""
    print("\n" + "="*60)
    print("1. Comprehensive Reform Metrics")
    print("="*60)

    filepath = '../data/outputs/comprehensive_reform_metrics.csv'
    if not validate_file_exists(filepath, "Reform metrics file"):
        return False

    df = pd.read_csv(filepath, dtype={'state_fips': str})

    # Check record count
    print(f"  Records: {len(df)}")
    print(f"  Expected: 6 reform states")

    # Check required columns
    required_cols = ['state_fips', 'jurisdiction', 'reform_type', 'effective_date',
                     'pre_mean_total', 'post_mean_total', 'abs_change', 'pct_change']
    missing_cols = set(required_cols) - set(df.columns)

    if missing_cols:
        print(f"  [FAIL] Missing columns: {missing_cols}")
        return False
    else:
        print(f"  [OK] All required columns present")

    # Check FIPS format
    invalid_fips = df[df['state_fips'].str.len() != 2]
    if len(invalid_fips) > 0:
        print(f"  [FAIL] Invalid FIPS codes: {invalid_fips['state_fips'].tolist()}")
        return False
    else:
        print(f"  [OK] All FIPS codes properly formatted (2 digits)")

    # Check for nulls in critical fields
    null_counts = df[required_cols].isnull().sum()
    if null_counts.sum() > 0:
        print(f"  [FAIL] Null values found:")
        print(null_counts[null_counts > 0])
        return False
    else:
        print(f"  [OK] No null values in required fields")

    # Check numeric ranges
    print(f"  Percent change range: {df['pct_change'].min():.2f}% to {df['pct_change'].max():.2f}%")

    # Display summary
    print("\n  Reform States:")
    for _, row in df.iterrows():
        print(f"    {row['jurisdiction']:20s} {row['pct_change']:+7.2f}%")

    return True

def validate_baseline_metrics():
    """Validate all_states_baseline_metrics.csv"""
    print("\n" + "="*60)
    print("2. All States Baseline Metrics")
    print("="*60)

    filepath = '../data/outputs/all_states_baseline_metrics.csv'
    if not validate_file_exists(filepath, "Baseline metrics file"):
        return False

    df = pd.read_csv(filepath, dtype={'state_fips': str})

    print(f"  Records: {len(df)}")
    print(f"  Expected: 50-53 states/territories")

    # Check required columns
    required_cols = ['state_fips', 'state_name', 'total_permits_2015_2024',
                     'growth_rate_pct', 'mf_share_pct']
    missing_cols = set(required_cols) - set(df.columns)

    if missing_cols:
        print(f"  [FAIL] Missing columns: {missing_cols}")
        return False
    else:
        print(f"  [OK] All required columns present")

    # Check FIPS format
    df['state_fips'] = df['state_fips'].str.zfill(2)
    invalid_fips = df[df['state_fips'].str.len() != 2]
    if len(invalid_fips) > 0:
        print(f"  [FAIL] Invalid FIPS codes: {invalid_fips['state_fips'].tolist()}")
        return False
    else:
        print(f"  [OK] All FIPS codes properly formatted")

    # Check for nulls
    null_counts = df[required_cols].isnull().sum()
    if null_counts.sum() > 0:
        print(f"  [FAIL] Null values found:")
        print(null_counts[null_counts > 0])
        return False
    else:
        print(f"  [OK] No null values in required fields")

    # Display top/bottom growth states
    print("\n  Top 5 Growth States:")
    top_5 = df.nlargest(5, 'growth_rate_pct')[['state_name', 'growth_rate_pct']]
    for _, row in top_5.iterrows():
        print(f"    {row['state_name']:20s} {row['growth_rate_pct']:+7.2f}%")

    print("\n  Bottom 5 Growth States:")
    bottom_5 = df.nsmallest(5, 'growth_rate_pct')[['state_name', 'growth_rate_pct']]
    for _, row in bottom_5.iterrows():
        print(f"    {row['state_name']:20s} {row['growth_rate_pct']:+7.2f}%")

    return True

def validate_county_data():
    """Validate county_permits_monthly.csv"""
    print("\n" + "="*60)
    print("3. County Permits Monthly")
    print("="*60)

    filepath = '../data/outputs/county_permits_monthly.csv'
    if not validate_file_exists(filepath, "County data file"):
        return False

    df = pd.read_csv(filepath, dtype={'state_fips': str, 'county_fips': str})

    print(f"  Records: {len(df)}")

    # Check unique counties
    unique_counties = df.groupby(['state_fips', 'county_name']).size()
    print(f"  Unique counties: {len(unique_counties)}")

    # Check states with county data
    states_with_counties = df['state_fips'].unique()
    print(f"  States with county data: {len(states_with_counties)}")
    print(f"    FIPS: {sorted(states_with_counties)}")

    # Check date range
    df['date'] = pd.to_datetime(df['date'])
    print(f"  Date range: {df['date'].min()} to {df['date'].max()}")

    # Records per county
    records_per_county = df.groupby(['state_fips', 'county_name']).size()
    print(f"  Records per county: {records_per_county.min()} to {records_per_county.max()}")

    return True

def validate_predictions():
    """Validate reform_predictions.csv"""
    print("\n" + "="*60)
    print("4. Reform Predictions")
    print("="*60)

    filepath = '../data/outputs/reform_predictions.csv'
    if not validate_file_exists(filepath, "Predictions file"):
        return False

    df = pd.read_csv(filepath, dtype={'state_fips': str})

    print(f"  Records: {len(df)}")

    # Check required columns
    required_cols = ['state_fips', 'state_name', 'predicted_impact',
                     'reform_potential', 'wrluri']
    missing_cols = set(required_cols) - set(df.columns)

    if missing_cols:
        print(f"  [FAIL] Missing columns: {missing_cols}")
        return False
    else:
        print(f"  [OK] All required columns present")

    # Check prediction ranges
    print(f"  Predicted impact range: {df['predicted_impact'].min():.2f}% to {df['predicted_impact'].max():.2f}%")

    # Reform potential categories
    potential_dist = df['reform_potential'].value_counts()
    print(f"\n  Reform Potential Distribution:")
    for category, count in potential_dist.items():
        print(f"    {category:15s} {count:3d}")

    # Top 5 predictions
    print("\n  Top 5 Predicted Impacts:")
    top_5 = df.nlargest(5, 'predicted_impact')[['state_name', 'predicted_impact', 'reform_potential']]
    for _, row in top_5.iterrows():
        print(f"    {row['state_name']:20s} {row['predicted_impact']:+7.2f}%  ({row['reform_potential']})")

    return True

def validate_raw_permits():
    """Validate state_permits_monthly_comprehensive.csv"""
    print("\n" + "="*60)
    print("5. Raw Permits Data (Comprehensive)")
    print("="*60)

    filepath = '../data/raw/state_permits_monthly_comprehensive.csv'
    if not validate_file_exists(filepath, "Raw permits file"):
        return False

    df = pd.read_csv(filepath, dtype={'state_fips': str})

    print(f"  Records: {len(df)}")
    print(f"  Expected: ~8,000+ (53 states × 10 years × 12 months)")

    # Check unique states
    unique_states = df['state_fips'].nunique()
    print(f"  Unique states: {unique_states}")

    # Check date range
    df['date'] = pd.to_datetime(df['date'])
    print(f"  Date range: {df['date'].min()} to {df['date'].max()}")

    # Check for gaps in monthly data
    states_checked = 0
    gap_issues = []

    for state_fips in df['state_fips'].unique()[:5]:  # Check first 5 states
        state_data = df[df['state_fips'] == state_fips].sort_values('date')
        date_diffs = state_data['date'].diff()
        gaps = date_diffs[date_diffs > pd.Timedelta(days=31)]

        if len(gaps) > 0:
            gap_issues.append(state_fips)
        states_checked += 1

    if gap_issues:
        print(f"  [WARN] Date gaps found in states: {gap_issues}")
    else:
        print(f"  [OK] No date gaps in sampled states")

    # Check permit totals
    print(f"\n  Permit Statistics:")
    print(f"    Total permits (SF): {df['sf_permits'].sum():,.0f}")
    print(f"    Total permits (MF): {df['mf_permits'].sum():,.0f}")
    print(f"    Total permits (All): {df['total_permits'].sum():,.0f}")

    return True

def generate_validation_report():
    """Generate comprehensive validation report"""
    print("\n" + "="*60)
    print("DATA QUALITY VALIDATION REPORT")
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    results = {
        "Comprehensive Reform Metrics": validate_comprehensive_metrics(),
        "All States Baseline Metrics": validate_baseline_metrics(),
        "County Permits Monthly": validate_county_data(),
        "Reform Predictions": validate_predictions(),
        "Raw Permits Data": validate_raw_permits(),
    }

    print("\n" + "="*60)
    print("VALIDATION SUMMARY")
    print("="*60)

    passed = sum(results.values())
    total = len(results)

    for name, result in results.items():
        status = "[PASS]" if result else "[FAIL]"
        print(f"  {status} - {name}")

    print(f"\n  Overall: {passed}/{total} checks passed")

    if passed == total:
        print("\n  SUCCESS: All validation checks passed! Data is ready for integration.")
        return True
    else:
        print("\n  WARNING: Some validation checks failed. Review issues above.")
        return False

if __name__ == "__main__":
    success = generate_validation_report()
    exit(0 if success else 1)
