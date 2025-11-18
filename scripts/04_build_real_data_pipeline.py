#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Complete Pipeline: Download and Process Real Census BPS Data
"""

import os
import pandas as pd
import requests
from io import StringIO
import time

def download_and_parse_year(year):
    """
    Download and parse a single year of BPS data from Census
    Format: tab-delimited TXT files
    """

    url = f"https://www2.census.gov/econ/bps/State/st{year % 100:02d}a.txt"

    print(f"Downloading {year} from {url}...")

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        # Parse tab-delimited data
        df = pd.read_csv(StringIO(response.text), sep='\t')

        # Parse the first row to understand structure
        # Census format: Date, State FIPS, Region, Division, State Name, then data columns

        # Clean column names
        df.columns = [col.strip() for col in df.columns]

        print(f"  Columns: {list(df.columns[:10])}")
        print(f"  Rows: {len(df)}")

        return df

    except Exception as e:
        print(f"  ERROR: {e}")
        return None

def process_year_data(df, year):
    """
    Extract permit data from a year's BPS data
    """

    records = []

    for _, row in df.iterrows():
        try:
            # Get state info
            survey_date = str(row.iloc[0])  # First column is date (YYYYMM)
            state_fips = str(row.iloc[1]).zfill(2)
            state_name = str(row.iloc[4]).strip()

            # Parse date
            if len(survey_date) != 6:
                continue

            month_code = int(survey_date[4:6])

            # Skip annual totals (99)
            if month_code == 99:
                continue

            # Extract permit units
            # Columns are: Date, FIPS, Region, Division, Name,
            # then for each unit type: Buildings, Units, Value

            # Position indices (based on typical BPS format):
            # 1-unit units: column 6
            # 2-units units: column 9
            # 3-4 units units: column 12
            # 5+ units units: column 15

            one_unit = int(row.iloc[6]) if len(row) > 6 and pd.notna(row.iloc[6]) else 0
            two_units = int(row.iloc[9]) if len(row) > 9 and pd.notna(row.iloc[9]) else 0
            three_four = int(row.iloc[12]) if len(row) > 12 and pd.notna(row.iloc[12]) else 0
            five_plus = int(row.iloc[15]) if len(row) > 15 and pd.notna(row.iloc[15]) else 0

            sf_permits = one_unit
            mf_permits = two_units + three_four + five_plus
            total_permits = sf_permits + mf_permits

            records.append({
                'state_fips': state_fips,
                'state_name': state_name,
                'year': year,
                'month': month_code,
                'date': f"{year}-{month_code:02d}-01",
                'sf_permits': sf_permits,
                'mf_permits': mf_permits,
                'total_permits': total_permits,
                'adu_permits': 0  # Not separately tracked by Census
            })

        except Exception as e:
            continue

    return records

def build_complete_dataset():
    """
    Download and process all years 2015-2024
    """

    print("BUILDING REAL CENSUS DATA PIPELINE")
    print("=" * 60)

    all_records = []

    for year in range(2015, 2025):
        df = download_and_parse_year(year)

        if df is not None:
            year_records = process_year_data(df, year)
            all_records.extend(year_records)
            print(f"  Extracted {len(year_records)} monthly records")

        time.sleep(0.5)  # Rate limiting

    # Combine into DataFrame
    final_df = pd.DataFrame(all_records)

    print("\n" + "=" * 60)
    print(f"TOTAL RECORDS: {len(final_df)}")
    print(f"States: {final_df['state_name'].nunique()}")
    print(f"Date range: {final_df['date'].min()} to {final_df['date'].max()}")

    # Save
    os.makedirs('data/raw', exist_ok=True)
    output_path = 'data/raw/state_permits_monthly_comprehensive.csv'

    final_df.to_csv(output_path, index=False)
    print(f"\nSaved: {output_path}")

    # Summary by state
    print("\n" + "=" * 60)
    print("TOP 10 STATES BY TOTAL PERMITS")
    print("=" * 60)

    state_totals = final_df.groupby('state_name')['total_permits'].sum().sort_values(ascending=False)
    for state, total in state_totals.head(10).items():
        print(f"  {state:20s}: {total:>12,.0f}")

    # Reform states
    print("\n" + "=" * 60)
    print("REFORM STATES")
    print("=" * 60)

    reform_states = ['California', 'Oregon', 'Minnesota', 'Virginia', 'North Carolina', 'Montana']

    for state in reform_states:
        state_data = final_df[final_df['state_name'] == state]

        if len(state_data) > 0:
            total = state_data['total_permits'].sum()
            monthly_avg = state_data['total_permits'].mean()
            months = len(state_data)

            print(f"  {state:20s}: {total:>10,.0f} total | {monthly_avg:>8,.0f}/month | {months:>3} months")

    return final_df

if __name__ == "__main__":
    build_complete_dataset()
