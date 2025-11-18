#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Process Real Census Building Permits Survey Data
Clean and aggregate for reform analysis
"""

import pandas as pd
import numpy as np
from datetime import datetime

STATE_NAMES = {
    '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas',
    '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware',
    '11': 'District of Columbia', '12': 'Florida', '13': 'Georgia', '15': 'Hawaii',
    '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa',
    '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine',
    '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
    '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska',
    '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
    '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
    '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island',
    '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas',
    '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
    '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming', '72': 'Puerto Rico'
}

def parse_census_date(date_str):
    """
    Parse Census date format: YYYYMM (201599 = Sept 2015)
    99 = annual total, 01-12 = monthly
    """
    year = int(str(date_str)[:4])
    month_code = int(str(date_str)[4:6])

    if month_code == 99:
        # Annual total - assign to December
        month = 12
    else:
        month = month_code

    return f"{year}-{month:02d}-01"

def clean_census_bps_data(raw_csv_path):
    """
    Clean the raw Census BPS state monthly data
    Format:
    Survey Date, State FIPS, Region, Division, State Name,
    1-unit (Bldgs, Units, Value), 2-units (Bldgs, Units, Value),
    3-4 units (Bldgs, Units, Value), 5+ units (Bldgs, Units, Value),
    ... repeated for "rep" columns
    """

    print("Processing Real Census Building Permits Data")
    print("=" * 60)

    # Read with no header, skip first 2 rows
    df = pd.read_csv(raw_csv_path, skiprows=2, header=None)

    print(f"Loaded {len(df)} raw rows")

    clean_data = []

    for _, row in df.iterrows():
        try:
            # Row is already split into columns
            survey_date = str(row[0])
            state_fips = str(row[1]).zfill(2)
            state_name = str(row[4])

            # Check for valid date
            if len(survey_date) != 6:
                continue

            # Column indices (0-based):
            # 0: Date, 1: FIPS, 2: Region, 3: Division, 4: Name
            # 5: 1-unit Bldgs, 6: 1-unit Units, 7: 1-unit Value
            # 8: 2-units Bldgs, 9: 2-units Units, 10: 2-units Value
            # 11: 3-4 units Bldgs, 12: 3-4 units Units, 13: 3-4 units Value
            # 14: 5+ units Bldgs, 15: 5+ units Units, 16: 5+ units Value

            sf_units = int(row[6]) if pd.notna(row[6]) else 0
            two_units = int(row[9]) if pd.notna(row[9]) else 0
            three_four_units = int(row[12]) if pd.notna(row[12]) else 0
            five_plus_units = int(row[15]) if pd.notna(row[15]) else 0

            # Multifamily = 2-units + 3-4 units + 5+ units
            mf_units = two_units + three_four_units + five_plus_units

            # Total
            total_units = sf_units + mf_units

            # Parse date
            year = int(survey_date[:4])
            month_code = int(survey_date[4:6])

            # Skip annual totals (month_code == 99)
            if month_code == 99:
                continue

            date_str = f"{year}-{month_code:02d}-01"

            clean_data.append({
                'state_fips': state_fips,
                'state_name': state_name.strip(),
                'year': year,
                'month': month_code,
                'date': date_str,
                'sf_permits': sf_units,
                'mf_permits': mf_units,
                'total_permits': total_units,
                'adu_permits': 0  # Census doesn't separate ADUs
            })

        except Exception as e:
            # Skip malformed rows
            print(f"  Skipping row: {e}")
            continue

    clean_df = pd.DataFrame(clean_data)

    print(f"Cleaned to {len(clean_df)} monthly records")

    if len(clean_df) > 0:
        print(f"States: {clean_df['state_name'].nunique()}")
        print(f"Date range: {clean_df['date'].min()} to {clean_df['date'].max()}")

    return clean_df

def main():
    """
    Main processing pipeline
    """

    raw_path = 'data/raw/census_bps_state_monthly_processed.csv'
    output_path = 'data/raw/state_permits_monthly_comprehensive.csv'

    print(f"Input: {raw_path}")
    print(f"Output: {output_path}")
    print()

    # Clean the data
    df = clean_census_bps_data(raw_path)

    # Save
    df.to_csv(output_path, index=False)
    print(f"\nSaved clean data: {output_path}")

    # Summary stats
    print("\n" + "=" * 60)
    print("SUMMARY STATISTICS")
    print("=" * 60)

    # Group by state
    state_summary = df.groupby('state_name')['total_permits'].agg([
        ('total', 'sum'),
        ('monthly_avg', 'mean'),
        ('months', 'count')
    ]).sort_values('total', ascending=False)

    print("\nTop 10 States by Total Permits (2015-2024):")
    print(state_summary.head(10))

    # Reform states specifically
    reform_states = ['California', 'Oregon', 'Minnesota', 'Virginia', 'North Carolina', 'Montana']
    print("\n\nReform States:")
    for state in reform_states:
        if state in state_summary.index:
            stats = state_summary.loc[state]
            print(f"  {state:20s}: {stats['total']:>10,.0f} total | {stats['monthly_avg']:>8,.0f}/month | {stats['months']:>3.0f} months")

    return df

if __name__ == "__main__":
    main()
