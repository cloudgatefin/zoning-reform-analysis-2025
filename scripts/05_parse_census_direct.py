#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Direct Census BPS Data Parser
Fetches TXT files and parses them correctly
"""

import pandas as pd
import requests
from io import StringIO
import time
import os

def fetch_and_parse_year(year):
    """
    Fetch and parse Census BPS data for one year
    URL pattern: https://www2.census.gov/econ/bps/State/st2015a.txt
    """

    url = f"https://www2.census.gov/econ/bps/State/st{year}a.txt"

    print(f"Fetching {year}: {url}")

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        # Parse tab-delimited
        df = pd.read_csv(StringIO(response.text), sep='\t', low_memory=False)

        print(f"  Downloaded {len(df)} rows")

        return df, year

    except Exception as e:
        print(f"  ERROR: {e}")
        return None, year

def extract_permits_from_row(row):
    """
    Extract permit data from a Census BPS row
    Returns dict with state info and permits
    """

    try:
        # First column is survey date (YYYYMM)
        survey_date = str(row.iloc[0]).strip()

        if len(survey_date) != 6 or not survey_date.isdigit():
            return None

        year = int(survey_date[:4])
        month = int(survey_date[4:6])

        # Skip annual totals (month == 99)
        if month == 99:
            return None

        # Second column is state FIPS
        state_fips = str(row.iloc[1]).strip().zfill(2)

        # Fifth column is state name
        state_name = str(row.iloc[4]).strip()

        # Permit units by structure type:
        # Column 6: 1-unit (single-family)
        # Column 9: 2-units
        # Column 12: 3-4 units
        # Column 15: 5+ units (multifamily)

        sf_permits = int(row.iloc[6]) if pd.notna(row.iloc[6]) and str(row.iloc[6]).replace('.', '').isdigit() else 0
        two_units = int(row.iloc[9]) if pd.notna(row.iloc[9]) and str(row.iloc[9]).replace('.', '').isdigit() else 0
        three_four = int(row.iloc[12]) if pd.notna(row.iloc[12]) and str(row.iloc[12]).replace('.', '').isdigit() else 0
        five_plus = int(row.iloc[15]) if pd.notna(row.iloc[15]) and str(row.iloc[15]).replace('.', '').isdigit() else 0

        mf_permits = two_units + three_four + five_plus
        total_permits = sf_permits + mf_permits

        return {
            'state_fips': state_fips,
            'state_name': state_name,
            'year': year,
            'month': month,
            'date': f"{year}-{month:02d}-01",
            'sf_permits': sf_permits,
            'mf_permits': mf_permits,
            'total_permits': total_permits,
            'adu_permits': 0  # Not tracked separately
        }

    except Exception as e:
        return None

def build_dataset():
    """
    Build complete dataset from Census BPS 2015-2024
    """

    print("BUILDING REAL CENSUS BPS DATASET")
    print("=" * 60)
    print()

    all_records = []

    for year in range(2015, 2025):
        df, _ = fetch_and_parse_year(year)

        if df is not None:
            year_count = 0

            for _, row in df.iterrows():
                record = extract_permits_from_row(row)

                if record:
                    all_records.append(record)
                    year_count += 1

            print(f"  Extracted {year_count} monthly records")

        time.sleep(0.5)  # Rate limiting

    # Convert to DataFrame
    final_df = pd.DataFrame(all_records)

    print("\n" + "=" * 60)
    print("DATASET SUMMARY")
    print("=" * 60)
    print(f"Total records: {len(final_df)}")

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
        print("TOP 10 STATES BY TOTAL PERMITS")
        print("=" * 60)

        state_totals = final_df.groupby('state_name')['total_permits'].sum().sort_values(ascending=False)
        for i, (state, total) in enumerate(state_totals.head(10).items(), 1):
            print(f"  {i:2d}. {state:20s}: {total:>12,.0f}")

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
    build_dataset()
