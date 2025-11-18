#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Use Real Census Annual State Data
Convert to monthly estimates with seasonal patterns
"""

import pandas as pd
import numpy as np
import requests
from io import StringIO
import os

# Seasonal adjustment factors (typical construction seasonality)
# Based on empirical construction patterns: higher in summer, lower in winter
MONTHLY_FACTORS = {
    1: 0.75,   # January - winter low
    2: 0.80,   # February
    3: 0.95,   # March - spring start
    4: 1.05,   # April
    5: 1.15,   # May - peak season
    6: 1.20,   # June
    7: 1.20,   # July
    8: 1.15,   # August
    9: 1.05,   # September
    10: 0.95,  # October
    11: 0.85,  # November
    12: 0.90   # December
}

def download_annual_data(year):
    """
    Download annual state-level BPS data for a year
    """

    url = f"https://www2.census.gov/econ/bps/State/st{year}a.txt"

    print(f"Downloading {year}...")

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        # File is comma-separated, skip first 3 rows (2 header rows + 1 blank)
        df = pd.read_csv(StringIO(response.text), skiprows=3, header=None, low_memory=False)
        return df

    except Exception as e:
        print(f"  ERROR: {e}")
        return None

def parse_annual_row(row):
    """
    Extract annual totals from BPS row
    Returns dict with state and annual permit counts
    """

    try:
        survey_date = str(row.iloc[0]).strip()

        if len(survey_date) != 6:
            return None

        year = int(survey_date[:4])
        month = int(survey_date[4:6])

        # We WANT annual totals (month == 99)
        if month != 99:
            return None

        state_fips = str(row.iloc[1]).strip().zfill(2)
        state_name = str(row.iloc[4]).strip()

        # Extract annual units
        sf_units = int(float(row.iloc[6])) if pd.notna(row.iloc[6]) else 0
        two_units = int(float(row.iloc[9])) if pd.notna(row.iloc[9]) else 0
        three_four = int(float(row.iloc[12])) if pd.notna(row.iloc[12]) else 0
        five_plus = int(float(row.iloc[15])) if pd.notna(row.iloc[15]) else 0

        mf_units = two_units + three_four + five_plus
        total_units = sf_units + mf_units

        return {
            'state_fips': state_fips,
            'state_name': state_name,
            'year': year,
            'sf_annual': sf_units,
            'mf_annual': mf_units,
            'total_annual': total_units
        }

    except Exception as e:
        return None

def distribute_annual_to_monthly(annual_record):
    """
    Distribute annual totals to monthly estimates using seasonal factors
    """

    monthly_records = []

    # Calculate normalization factor (sum of monthly factors = 12.0)
    factor_sum = sum(MONTHLY_FACTORS.values())

    for month in range(1, 13):
        # Seasonal factor for this month
        factor = MONTHLY_FACTORS[month] / (factor_sum / 12.0)

        # Distribute annual total
        sf_monthly = int(annual_record['sf_annual'] * factor / 12.0)
        mf_monthly = int(annual_record['mf_annual'] * factor / 12.0)
        total_monthly = sf_monthly + mf_monthly

        monthly_records.append({
            'state_fips': annual_record['state_fips'],
            'state_name': annual_record['state_name'],
            'year': annual_record['year'],
            'month': month,
            'date': f"{annual_record['year']}-{month:02d}-01",
            'sf_permits': sf_monthly,
            'mf_permits': mf_monthly,
            'total_permits': total_monthly,
            'adu_permits': 0,  # Not separately tracked
            'data_source': 'census_annual_distributed'
        })

    return monthly_records

def build_comprehensive_dataset():
    """
    Build complete monthly dataset from annual Census data
    """

    print("BUILDING DATASET FROM REAL CENSUS ANNUAL DATA")
    print("=" * 60)
    print()

    all_annual = []

    # Download annual data for each year
    for year in range(2015, 2025):
        df = download_annual_data(year)

        if df is not None:
            year_count = 0

            for _, row in df.iterrows():
                record = parse_annual_row(row)

                if record:
                    all_annual.append(record)
                    year_count += 1

            print(f"  Extracted {year_count} state records for {year}")

    # Convert annual to monthly estimates
    print("\nConverting to monthly estimates...")

    all_monthly = []

    for annual_rec in all_annual:
        monthly_recs = distribute_annual_to_monthly(annual_rec)
        all_monthly.extend(monthly_recs)

    # Convert to DataFrame
    final_df = pd.DataFrame(all_monthly)

    print("\n" + "=" * 60)
    print("DATASET SUMMARY")
    print("=" * 60)
    print(f"Total monthly records: {len(final_df)}")

    if len(final_df) > 0:
        print(f"States: {final_df['state_name'].nunique()}")
        print(f"Date range: {final_df['date'].min()} to {final_df['date'].max()}")

        # Save
        os.makedirs('data/raw', exist_ok=True)
        output_path = 'data/raw/state_permits_monthly_comprehensive.csv'

        final_df.to_csv(output_path, index=False)
        print(f"\nSaved: {output_path}")

        # Summary stats
        print("\n" + "=" * 60)
        print("TOP 10 STATES BY TOTAL PERMITS (2015-2024)")
        print("=" * 60)

        state_totals = final_df.groupby('state_name')['total_permits'].sum().sort_values(ascending=False)
        for i, (state, total) in enumerate(state_totals.head(10).items(), 1):
            avg_monthly = total / len(final_df[final_df['state_name'] == state])
            print(f"  {i:2d}. {state:25s}: {total:>12,.0f} total | {avg_monthly:>8,.0f}/month")

        # Reform states
        print("\n" + "=" * 60)
        print("REFORM STATES")
        print("=" * 60)

        reform_states = ['California', 'Oregon', 'Minnesota', 'Virginia', 'North Carolina', 'Montana']

        for state in reform_states:
            state_data = final_df[final_df['state_name'] == state]

            if len(state_data) > 0:
                total = state_data['total_permits'].sum()
                avg = state_data['total_permits'].mean()
                months = len(state_data)

                print(f"  {state:20s}: {total:>10,.0f} total | {avg:>8,.0f}/mo | {months:>3} months")

    return final_df

if __name__ == "__main__":
    build_comprehensive_dataset()
