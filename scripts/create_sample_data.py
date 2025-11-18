#!/usr/bin/env python3
"""
Create sample permit data for testing the metrics pipeline.

This generates realistic synthetic building permit data for the cities
in city_reforms.csv to allow testing without API access.
"""

import pandas as pd
import numpy as np

# Load reforms to get city list
reforms_df = pd.read_csv('data/raw/city_reforms.csv')

# Set random seed for reproducibility
np.random.seed(42)

# Generate sample data for each city
all_records = []

for _, reform in reforms_df.iterrows():
    place_fips = str(reform['place_fips']).zfill(7)
    city_name = reform['city_name']
    state_fips = str(reform['state_fips']).zfill(2)
    state_name = reform['state_name']
    reform_year = pd.to_datetime(reform['effective_date']).year

    # Generate baseline permit levels (varies by city size)
    # Larger cities get more permits
    city_base_permits = np.random.randint(500, 5000)

    for year in range(2015, 2025):
        # Add year-over-year growth trend (2-5%)
        growth_factor = 1.03 ** (year - 2015)

        # Add reform impact (10-30% increase post-reform)
        if year >= reform_year:
            reform_impact = np.random.uniform(1.1, 1.3)
        else:
            reform_impact = 1.0

        # Add random variation (+/- 15%)
        variation = np.random.uniform(0.85, 1.15)

        # Calculate total permits
        total_permits = int(city_base_permits * growth_factor * reform_impact * variation)

        # Split between SF and MF (MF typically 30-50% of total)
        # Reform cities often see increased MF share post-reform
        if year >= reform_year:
            mf_share = np.random.uniform(0.4, 0.6)
        else:
            mf_share = np.random.uniform(0.25, 0.45)

        mf_permits = int(total_permits * mf_share)
        sf_permits = total_permits - mf_permits

        # Further split MF into unit types (rough approximation)
        unit_2 = int(mf_permits * 0.3)
        unit_34 = int(mf_permits * 0.3)
        unit_5plus = mf_permits - unit_2 - unit_34

        record = {
            'year': year,
            'place_fips': place_fips,
            'state_fips': state_fips,
            'place_name': city_name,
            'state_name': state_name,
            'sf_permits': sf_permits,
            'mf_permits': mf_permits,
            'other_permits': None,
            'total_permits': total_permits,
            'unit_2': unit_2,
            'unit_34': unit_34,
            'unit_5plus': unit_5plus
        }
        all_records.append(record)

# Create DataFrame
df = pd.DataFrame(all_records)

# Save to CSV
output_path = 'data/raw/census_bps_place_all_years.csv'
df.to_csv(output_path, index=False)
print(f"✓ Created sample data: {output_path}")
print(f"  Total records: {len(df)}")
print(f"  Years: {df['year'].min()}-{df['year'].max()}")
print(f"  Cities: {df['place_fips'].nunique()}")
print(f"\nSample records:")
print(df.head(10))
