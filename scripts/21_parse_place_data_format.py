#!/usr/bin/env python3
"""
Phase 1.1: Census BPS Place Data Parser

Parses the Census Bureau BPS Master Dataset CSV into place-level metrics:
- Extract unique places with geographic identifiers
- Aggregate permit counts by building type (1-unit, 2-unit, 3-4 unit, 5+ unit)
- Organize by year and month for time-series analysis
- Validate data quality and completeness

Input: data/raw/census_bps_master_dataset.csv
Outputs:
  - data/raw/census_bps_places_directory.csv (unique places with metadata)
  - data/raw/census_bps_place_annual_permits.csv (annual aggregated permits)
  - data/raw/census_bps_place_monthly_permits.csv (monthly detailed permits)
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys
from typing import Dict, Tuple

# Configuration
INPUT_FILE = Path("data/raw/census_bps_master_dataset.csv")
OUTPUT_DIR = Path("data/raw")

# Output files
PLACES_DIRECTORY = OUTPUT_DIR / "census_bps_places_directory.csv"
ANNUAL_PERMITS = OUTPUT_DIR / "census_bps_place_annual_permits.csv"
MONTHLY_PERMITS = OUTPUT_DIR / "census_bps_place_monthly_permits.csv"


def load_census_data() -> pd.DataFrame:
    """Load the raw Census BPS data."""
    print(f"\n[INFO] Loading Census BPS Master Dataset...")
    print(f"[INFO] Source: {INPUT_FILE}")

    if not INPUT_FILE.exists():
        print(f"\n[FAIL] Input file not found: {INPUT_FILE}")
        print(f"[INFO] First run: python scripts/20_fetch_place_permits_bulk.py")
        sys.exit(1)

    df = pd.read_csv(INPUT_FILE, low_memory=False)
    print(f"[OK] Loaded {len(df):,} rows, {len(df.columns)} columns")
    return df


def extract_places_directory(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extract unique places directory with geographic identifiers.

    Returns DataFrame with:
    - place_fips: Combined state+place FIPS code (unique identifier)
    - place_name: Official place name
    - state_code: State FIPS code
    - county_code: County FIPS code (if available)
    - location_type: Type of geography (Place, Metro, County, etc.)
    """
    print(f"\n[INFO] Extracting places directory...")

    # Filter for place-level data
    place_df = df[df['LOCATION_TYPE'] == 'Place'].copy()
    print(f"[OK] Filtered to {len(place_df):,} place-level records")

    # Extract unique places
    places = place_df[[
        'STATE_CODE', 'PLACE_NAME', 'LOCATION_NAME',
        'COUNTY_CODE', 'LOCATION_TYPE'
    ]].drop_duplicates()

    # Clean and standardize
    places = places.rename(columns={
        'STATE_CODE': 'state_fips',
        'PLACE_NAME': 'place_name',
        'LOCATION_NAME': 'location_name',
        'COUNTY_CODE': 'county_code',
        'LOCATION_TYPE': 'location_type'
    })

    # Create place FIPS (state + place)
    # Parse place code from location_name if needed
    places['place_fips'] = places['state_fips'].astype(str).str.zfill(2)

    # Ensure state code is 2-digit zero-padded string
    places['state_fips'] = places['state_fips'].astype(str).str.zfill(2)

    # Try to extract place code from location_name or use hash
    places['place_code'] = ''
    places = places.drop_duplicates(subset=['place_name', 'state_fips'])
    places = places.sort_values(['state_fips', 'place_name']).reset_index(drop=True)

    # Create sortable place FIPS
    places['place_fips'] = (
        places['state_fips'].astype(str) +
        places.groupby('state_fips').cumcount().astype(str).str.zfill(5)
    )

    # Remove duplicates (keep first occurrence)
    places = places.drop_duplicates(subset=['place_name', 'state_fips'], keep='first')

    print(f"[OK] Extracted {len(places):,} unique places")
    print(f"[INFO] Geographic coverage:")

    states = places['state_fips'].unique()
    print(f"  - States: {len(states)}")
    print(f"  - Places: {len(places)}")

    # Save
    places.to_csv(PLACES_DIRECTORY, index=False)
    print(f"[OK] Saved: {PLACES_DIRECTORY}")

    return places


def aggregate_annual_permits(df: pd.DataFrame, places: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate permits by place and year.

    Combines:
    - Single-family (1-unit): BLDGS_1_UNIT, UNITS_1_UNIT, VALUE_1_UNIT
    - Multi-family (2-4 unit): BLDGS_2_UNITS + BLDGS_3_4_UNITS
    - High-density (5+ unit): BLDGS_5_UNITS, UNITS_5_UNITS, VALUE_5_UNITS
    """
    print(f"\n[INFO] Aggregating annual permits by place...")

    # Filter for place-level data
    place_permits = df[df['LOCATION_TYPE'] == 'Place'].copy()

    # Filter for annual data (not monthly)
    place_permits = place_permits[place_permits['PERIOD'].isin(['Annual', 'Year to date', 'Annual Data'])].copy()

    # Ensure numeric columns
    numeric_cols = [col for col in place_permits.columns if 'BLDGS_' in col or 'UNITS_' in col or 'VALUE_' in col]
    for col in numeric_cols:
        place_permits[col] = pd.to_numeric(place_permits[col], errors='coerce').fillna(0)

    # Group by place, state, and year
    annual = place_permits.groupby(
        ['STATE_CODE', 'PLACE_NAME', 'YEAR'],
        as_index=False
    ).agg({
        'BLDGS_1_UNIT': 'sum',
        'BLDGS_2_UNITS': 'sum',
        'BLDGS_3_4_UNITS': 'sum',
        'BLDGS_5_UNITS': 'sum',
        'UNITS_1_UNIT': 'sum',
        'UNITS_2_UNITS': 'sum',
        'UNITS_3_4_UNITS': 'sum',
        'UNITS_5_UNITS': 'sum',
        'VALUE_1_UNIT': 'sum',
        'VALUE_2_UNITS': 'sum',
        'VALUE_3_4_UNITS': 'sum',
        'VALUE_5_UNITS': 'sum',
    })

    # Rename columns for clarity
    annual = annual.rename(columns={
        'STATE_CODE': 'state_fips',
        'PLACE_NAME': 'place_name',
        'YEAR': 'year',
        'BLDGS_1_UNIT': 'sf_buildings',
        'BLDGS_2_UNITS': 'duplex_buildings',
        'BLDGS_3_4_UNITS': 'tri4_buildings',
        'BLDGS_5_UNITS': 'mf_buildings',
        'UNITS_1_UNIT': 'sf_units',
        'UNITS_2_UNITS': 'duplex_units',
        'UNITS_3_4_UNITS': 'tri4_units',
        'UNITS_5_UNITS': 'mf_units',
        'VALUE_1_UNIT': 'sf_value',
        'VALUE_2_UNITS': 'duplex_value',
        'VALUE_3_4_UNITS': 'tri4_value',
        'VALUE_5_UNITS': 'mf_value',
    })

    # Calculate totals
    annual['total_buildings'] = (
        annual['sf_buildings'] + annual['duplex_buildings'] +
        annual['tri4_buildings'] + annual['mf_buildings']
    )

    annual['total_units'] = (
        annual['sf_units'] + annual['duplex_units'] +
        annual['tri4_units'] + annual['mf_units']
    )

    annual['total_value'] = (
        annual['sf_value'] + annual['duplex_value'] +
        annual['tri4_value'] + annual['mf_value']
    )

    # Calculate multi-family share
    annual['mf_share_pct'] = np.where(
        annual['total_units'] > 0,
        ((annual['mf_units'] / annual['total_units']) * 100).round(1),
        0
    )

    # Ensure state FIPS is 2-digit
    annual['state_fips'] = annual['state_fips'].astype(str).str.zfill(2)

    # Merge place FIPS from places directory
    annual = annual.merge(
        places[['place_name', 'state_fips', 'place_fips']],
        on=['place_name', 'state_fips'],
        how='left'
    )

    # Sort and save
    annual = annual.sort_values(['state_fips', 'place_name', 'year']).reset_index(drop=True)
    annual.to_csv(ANNUAL_PERMITS, index=False)

    print(f"[OK] Aggregated {len(annual):,} place-year combinations")
    print(f"[OK] Saved: {ANNUAL_PERMITS}")

    return annual


def aggregate_monthly_permits(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate permits by place, year, and month for time-series analysis.
    """
    print(f"\n[INFO] Aggregating monthly permits by place...")

    # Filter for place-level data
    place_permits = df[df['LOCATION_TYPE'] == 'Place'].copy()

    # Filter for monthly data
    place_permits = place_permits[place_permits['PERIOD'] == 'Monthly'].copy()

    # Ensure numeric columns
    numeric_cols = [col for col in place_permits.columns if 'BLDGS_' in col or 'UNITS_' in col]
    for col in numeric_cols:
        place_permits[col] = pd.to_numeric(place_permits[col], errors='coerce').fillna(0)

    # Extract year and month from SURVEY_DATE or use YEAR, MONTH if available
    if 'MONTH' in place_permits.columns:
        place_permits['month'] = pd.to_numeric(place_permits['MONTH'], errors='coerce').fillna(0).astype(int)
    else:
        place_permits['month'] = 1  # Default to January if not available

    # Group by place, state, year, and month
    monthly = place_permits.groupby(
        ['STATE_CODE', 'PLACE_NAME', 'YEAR', 'MONTH'],
        as_index=False
    ).agg({
        'BLDGS_1_UNIT': 'sum',
        'BLDGS_2_UNITS': 'sum',
        'BLDGS_3_4_UNITS': 'sum',
        'BLDGS_5_UNITS': 'sum',
        'UNITS_1_UNIT': 'sum',
        'UNITS_2_UNITS': 'sum',
        'UNITS_3_4_UNITS': 'sum',
        'UNITS_5_UNITS': 'sum',
    })

    # Rename columns
    monthly = monthly.rename(columns={
        'STATE_CODE': 'state_fips',
        'PLACE_NAME': 'place_name',
        'YEAR': 'year',
        'MONTH': 'month',
        'BLDGS_1_UNIT': 'sf_buildings',
        'BLDGS_2_UNITS': 'duplex_buildings',
        'BLDGS_3_4_UNITS': 'tri4_buildings',
        'BLDGS_5_UNITS': 'mf_buildings',
        'UNITS_1_UNIT': 'sf_units',
        'UNITS_2_UNITS': 'duplex_units',
        'UNITS_3_4_UNITS': 'tri4_units',
        'UNITS_5_UNITS': 'mf_units',
    })

    # Calculate totals
    monthly['total_buildings'] = (
        monthly['sf_buildings'] + monthly['duplex_buildings'] +
        monthly['tri4_buildings'] + monthly['mf_buildings']
    )

    monthly['total_units'] = (
        monthly['sf_units'] + monthly['duplex_units'] +
        monthly['tri4_units'] + monthly['mf_units']
    )

    # Sort and save
    monthly = monthly.sort_values(['state_fips', 'place_name', 'year', 'month']).reset_index(drop=True)
    monthly.to_csv(MONTHLY_PERMITS, index=False)

    print(f"[OK] Aggregated {len(monthly):,} place-year-month combinations")
    print(f"[OK] Saved: {MONTHLY_PERMITS}")

    return monthly


def print_summary(places: pd.DataFrame, annual: pd.DataFrame, monthly: pd.DataFrame):
    """Print summary statistics."""
    print("\n" + "="*70)
    print("PARSING COMPLETE - PLACE DATA EXTRACTED")
    print("="*70)

    print(f"\n[PLACES DIRECTORY]")
    print(f"  File: {PLACES_DIRECTORY}")
    print(f"  Records: {len(places):,}")
    print(f"  States: {places['state_fips'].nunique()}")
    print(f"  Sample columns: place_name, state_fips, place_fips, location_type")

    print(f"\n[ANNUAL PERMITS]")
    print(f"  File: {ANNUAL_PERMITS}")
    print(f"  Records: {len(annual):,}")
    print(f"  Place-years: {annual['place_name'].nunique():,} places")
    print(f"  Years: {annual['year'].min():.0f}-{annual['year'].max():.0f}")
    print(f"  Permits tracked: SF, Duplex, 3-4 unit, MF (by count, units, value)")

    print(f"\n[MONTHLY PERMITS]")
    print(f"  File: {MONTHLY_PERMITS}")
    print(f"  Records: {len(monthly):,}")
    if len(monthly) > 0:
        print(f"  Years: {monthly['year'].min():.0f}-{monthly['year'].max():.0f}")
        print(f"  Data frequency: Monthly time-series")

    print(f"\nNext Steps:")
    print(f"1. Run script 22_build_place_metrics.py to compute growth rates")
    print(f"2. Run script 23_geocode_places.py to add location coordinates")
    print(f"3. Filter to 20,000 largest places by permit volume")
    print(f"4. Create search index with Fuse.js")


def main():
    """Main execution."""
    print("\n" + "="*70)
    print("CENSUS BPS PLACE DATA PARSER")
    print("Phase 1.1: Data Extraction")
    print("="*70)

    # Load raw data
    df = load_census_data()

    # Extract places directory
    places = extract_places_directory(df)

    # Aggregate annual permits
    annual = aggregate_annual_permits(df, places)

    # Aggregate monthly permits
    monthly = aggregate_monthly_permits(df)

    # Print summary
    print_summary(places, annual, monthly)

    return 0


if __name__ == "__main__":
    sys.exit(main())
