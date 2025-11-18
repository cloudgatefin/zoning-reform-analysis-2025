"""
Fetch city-level building permit data and compute reform impact metrics.

This script:
1. Reads city reforms catalog from data/inputs/city_reforms_catalog.csv
2. Loads Census Building Permit Survey data from downloaded CSV files
3. Computes pre/post metrics (24 months pre, 12 month buffer, 24 months post)
4. Outputs: data/outputs/city_reform_metrics.csv

Note: Census place-level BPS data is NOT available via API. You must download the
CSV files manually from: https://www.census.gov/construction/bps/

Download instructions:
1. Go to https://www.census.gov/construction/bps/
2. Click "Historical Data" or "Place Data"
3. Download monthly place-level permit files for 2015-2024
4. Save as: data/raw/bps_place_YYYY.csv (one file per year) OR
   Save as: data/raw/bps_place_all.csv (combined file)
"""

import os
import sys
import pandas as pd
import numpy as np
from glob import glob

# File paths
REFORMS_CSV = "data/inputs/city_reforms_catalog.csv"
OUT_CSV = "data/outputs/city_reform_metrics.csv"
RAW_DIR = "data/raw"

# Windows: 24 months pre, 12-month buffer, 24 months post
PRE_MONTHS = 24
BUFFER_MONTHS = 12
POST_MONTHS = 24

def ensure_dirs():
    """Create necessary directories."""
    os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
    os.makedirs(RAW_DIR, exist_ok=True)

def load_place_permits():
    """
    Load place-level permit data from Census CSV files.

    Expected file formats:
    - data/raw/bps_place_all.csv (combined file), OR
    - data/raw/bps_place_YYYY.csv (annual files 2015-2024)

    Returns:
        DataFrame with columns: place_fips, month, permits
    """
    # Try combined file first
    combined_file = os.path.join(RAW_DIR, "bps_place_all.csv")
    if os.path.exists(combined_file):
        print(f"📂 Loading combined file: {combined_file}")
        df = pd.read_csv(combined_file, low_memory=False)
        return normalize_bps_data(df)

    # Try annual files
    annual_files = sorted(glob(os.path.join(RAW_DIR, "bps_place_*.csv")))
    if annual_files:
        print(f"📂 Loading {len(annual_files)} annual files...")
        dfs = []
        for f in annual_files:
            print(f"  - {os.path.basename(f)}")
            df = pd.read_csv(f, low_memory=False)
            dfs.append(df)
        combined = pd.concat(dfs, ignore_index=True)
        return normalize_bps_data(combined)

    # No data found
    return None

def normalize_bps_data(df):
    """
    Normalize Census BPS place data to standard format.

    Expected input columns (flexible):
    - State/state_fips/STATE: State FIPS code
    - Place/place_fips/PLACE: Place FIPS code
    - Date/date/YYYMM/survey_date: Date in various formats
    - Units/units/value/permits: Permit count

    Returns:
        DataFrame with columns: place_fips, month, permits
    """
    # Normalize column names
    df.columns = [c.strip().lower() for c in df.columns]

    print(f"  Input columns: {', '.join(df.columns[:20])}" + ("..." if len(df.columns) > 20 else ""))

    # Identify place FIPS column
    place_col = None
    for col in ['place_fips', 'place', 'placefips', 'place_code', 'geoid']:
        if col in df.columns:
            place_col = col
            break

    if not place_col:
        # Try to construct from state + place
        if 'state' in df.columns and 'place' in df.columns:
            df['place_fips'] = (df['state'].astype(str).str.zfill(2) +
                                df['place'].astype(str).str.zfill(5))
            place_col = 'place_fips'
        else:
            raise ValueError("Cannot identify place FIPS column")

    # Identify date column
    date_col = None
    for col in ['date', 'survey_date', 'month', 'period', 'yyymm']:
        if col in df.columns:
            date_col = col
            break

    if not date_col:
        raise ValueError("Cannot identify date column")

    # Identify units/permits column
    units_col = None
    for col in ['units', 'permits', 'value', 'bldgs', 'total_units', 'tot', '1unit']:
        if col in df.columns:
            units_col = col
            break

    if not units_col:
        raise ValueError("Cannot identify units/permits column")

    # Extract relevant columns
    result = pd.DataFrame({
        'place_fips': df[place_col].astype(str).str.zfill(7),
        'date_raw': df[date_col],
        'permits': pd.to_numeric(df[units_col], errors='coerce')
    })

    # Parse dates (handle multiple formats)
    # Try YYYY-MM-DD first
    result['month'] = pd.to_datetime(result['date_raw'], errors='coerce')

    # Try YYYYMM format
    if result['month'].isna().sum() > len(result) * 0.5:
        result['month'] = pd.to_datetime(result['date_raw'].astype(str), format='%Y%m', errors='coerce')

    # Try other formats
    if result['month'].isna().sum() > len(result) * 0.5:
        result['month'] = pd.to_datetime(result['date_raw'], format='%Y%m', errors='coerce')

    # Convert to month start
    result['month'] = result['month'].dt.to_period('M').dt.to_timestamp()

    # Filter to 2015-2024
    result = result[(result['month'] >= '2015-01-01') &
                    (result['month'] <= '2024-12-31')].copy()

    # Remove nulls
    result = result.dropna(subset=['place_fips', 'month', 'permits'])

    # Group by place and month (sum if multiple entries)
    result = (result.groupby(['place_fips', 'month'], as_index=False)['permits']
              .sum())

    print(f"  Normalized to {len(result)} rows covering {result['place_fips'].nunique()} places")

    return result[['place_fips', 'month', 'permits']]

def compute_reform_metrics(permits_df, effective_date):
    """
    Compute pre/post reform metrics.

    Args:
        permits_df: DataFrame with columns [month, permits]
        effective_date: Reform effective date (datetime or string)

    Returns:
        Dict with metric results
    """
    effective_date = pd.to_datetime(effective_date)

    # Ensure full monthly index
    permits_df = permits_df.set_index('month')
    full_index = pd.date_range(permits_df.index.min(), permits_df.index.max(), freq='MS')
    permits_df = permits_df.reindex(full_index).rename_axis('month').reset_index()
    permits_df['permits'] = permits_df['permits'].astype(float)

    # Define windows
    pre_end = effective_date - pd.offsets.MonthBegin(BUFFER_MONTHS + 1)
    pre_start = pre_end - pd.offsets.MonthBegin(PRE_MONTHS - 1)
    post_start = effective_date + pd.offsets.MonthBegin(BUFFER_MONTHS)
    post_end = post_start + pd.offsets.MonthBegin(POST_MONTHS - 1)

    # Extract window data
    permits_df = permits_df.set_index('month')

    try:
        pre = permits_df.loc[pre_start:pre_end]['permits']
        post = permits_df.loc[post_start:post_end]['permits']
    except KeyError:
        return {
            'status': 'insufficient_window',
            'pre_mean': None,
            'post_mean': None,
            'absolute_change': None,
            'percent_change': None
        }

    pre_mean = pre.mean() if len(pre) > 0 else np.nan
    post_mean = post.mean() if len(post) > 0 else np.nan

    if pd.isna(pre_mean) or pd.isna(post_mean):
        return {
            'status': 'insufficient_window',
            'pre_start': pre_start.date() if not pd.isna(pre_mean) else None,
            'pre_end': pre_end.date() if not pd.isna(pre_mean) else None,
            'post_start': post_start.date() if not pd.isna(post_mean) else None,
            'post_end': post_end.date() if not pd.isna(post_mean) else None,
            'pre_mean': None,
            'post_mean': None,
            'absolute_change': None,
            'percent_change': None
        }

    delta = post_mean - pre_mean
    pct = (delta / pre_mean * 100.0) if pre_mean > 0 else np.nan

    return {
        'status': 'ok',
        'pre_start': pre_start.date(),
        'pre_end': pre_end.date(),
        'post_start': post_start.date(),
        'post_end': post_end.date(),
        'pre_mean': round(pre_mean, 2),
        'post_mean': round(post_mean, 2),
        'absolute_change': round(delta, 2),
        'percent_change': round(pct, 2)
    }

def main():
    ensure_dirs()

    # Load place-level permits data
    print("=" * 70)
    print("STEP 1: Load Census Building Permit Survey place-level data")
    print("=" * 70)

    permits_all = load_place_permits()

    if permits_all is None:
        print(f"""
❌ No Census BPS place-level data found!

Census place-level permit data is NOT available via API. You must download
CSV files manually from: https://www.census.gov/construction/bps/

DOWNLOAD INSTRUCTIONS:
1. Visit: https://www.census.gov/construction/bps/
2. Look for "Place Data" or "Historical Data" section
3. Download monthly place-level permit files for years 2015-2024
4. Save files as:
   Option A: Single combined file → {RAW_DIR}/bps_place_all.csv
   Option B: Annual files → {RAW_DIR}/bps_place_2015.csv, bps_place_2016.csv, etc.

File format should include columns for:
- Place FIPS code (7 digits: 2-digit state + 5-digit place)
- Date/Month (YYYY-MM or YYYYMM format)
- Units/Permits (number of housing units authorized)

Once files are downloaded, rerun this script.
""")
        sys.exit(1)

    # Load reforms
    print("\n" + "=" * 70)
    print("STEP 2: Load city reforms catalog")
    print("=" * 70)

    if not os.path.exists(REFORMS_CSV):
        print(f"❌ Error: {REFORMS_CSV} not found")
        sys.exit(1)

    reforms = pd.read_csv(REFORMS_CSV)
    reforms.columns = [c.strip().lower() for c in reforms.columns]

    required = {'city_name', 'state_fips', 'place_fips', 'reform_name',
                'reform_type', 'effective_date'}
    missing = required - set(reforms.columns)
    if missing:
        print(f"❌ Error: Missing required columns: {missing}")
        sys.exit(1)

    # Parse dates and format FIPS
    reforms['effective_date'] = pd.to_datetime(reforms['effective_date'])
    reforms['place_fips'] = reforms['place_fips'].astype(str).str.zfill(7)

    print(f"✅ Loaded {len(reforms)} city reforms")

    # Process each reform
    print("\n" + "=" * 70)
    print("STEP 3: Compute pre/post metrics for each reform")
    print("=" * 70)

    results = []

    for idx, row in reforms.iterrows():
        city = row['city_name']
        place_fips = row['place_fips']

        print(f"\n[{idx+1}/{len(reforms)}] {city} (FIPS: {place_fips})")

        # Filter permits for this place
        place_permits = permits_all[permits_all['place_fips'] == place_fips].copy()

        if len(place_permits) == 0:
            print(f"  ⚠️  No permit data found for place FIPS {place_fips}")
            results.append({
                'city_name': city,
                'state_fips': row['state_fips'],
                'place_fips': place_fips,
                'reform_name': row['reform_name'],
                'reform_type': row['reform_type'],
                'effective_date': row['effective_date'].date(),
                'status': 'no_permit_data',
                'pre_window_months': PRE_MONTHS,
                'buffer_months': BUFFER_MONTHS,
                'post_window_months': POST_MONTHS,
            })
            continue

        print(f"  ✓ Found {len(place_permits)} months of permit data")
        print(f"    Date range: {place_permits['month'].min().date()} to {place_permits['month'].max().date()}")

        # Compute metrics
        metrics = compute_reform_metrics(place_permits[['month', 'permits']],
                                         row['effective_date'])

        result = {
            'city_name': city,
            'state_fips': row['state_fips'],
            'place_fips': place_fips,
            'reform_name': row['reform_name'],
            'reform_type': row['reform_type'],
            'effective_date': row['effective_date'].date(),
            'pre_window_months': PRE_MONTHS,
            'buffer_months': BUFFER_MONTHS,
            'post_window_months': POST_MONTHS,
        }
        result.update(metrics)
        results.append(result)

        if result['status'] == 'ok':
            print(f"  ✅ Metrics computed: {result['percent_change']:+.2f}% change")
        else:
            print(f"  ⚠️  Status: {result['status']}")

    # Save results
    print("\n" + "=" * 70)
    print("STEP 4: Save results")
    print("=" * 70)

    out_df = pd.DataFrame(results)
    out_df.to_csv(OUT_CSV, index=False)

    print(f"✅ Saved metrics → {OUT_CSV}")
    print(f"\n📈 Summary:")
    print(out_df['status'].value_counts().to_string())

    # Show successful metrics
    success = out_df[out_df['status'] == 'ok']
    if len(success) > 0:
        print(f"\n🎯 Successfully computed metrics for {len(success)} cities:")
        display_cols = ['city_name', 'reform_type', 'percent_change']
        print(success[display_cols].to_string(index=False))
    else:
        print("\n⚠️  No successful metrics computed. Check data availability.")

if __name__ == "__main__":
    main()
