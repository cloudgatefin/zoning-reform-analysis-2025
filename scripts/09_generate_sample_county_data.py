"""
Generate sample county-level permit data for demonstration purposes.
In production, this would use real Census Bureau county data.

For now, we'll create realistic sample data based on state-level patterns
distributed across counties proportionally by population.
"""

import pandas as pd
import numpy as np
import os

# Create output directory
os.makedirs('data/outputs', exist_ok=True)

# County names for major states (top counties by population)
SAMPLE_COUNTIES = {
    '06': [  # California
        ('001', 'Alameda', 1.67),
        ('013', 'Contra Costa', 1.15),
        ('037', 'Los Angeles', 10.04),
        ('059', 'Orange', 3.19),
        ('065', 'Riverside', 2.47),
        ('067', 'Sacramento', 1.55),
        ('071', 'San Bernardino', 2.18),
        ('073', 'San Diego', 3.30),
        ('075', 'San Francisco', 0.87),
        ('081', 'San Mateo', 0.77),
        ('085', 'Santa Clara', 1.93),
    ],
    '48': [  # Texas
        ('029', 'Bexar', 2.01),
        ('085', 'Collin', 1.06),
        ('113', 'Dallas', 2.61),
        ('121', 'Denton', 0.94),
        ('141', 'El Paso', 0.87),
        ('157', 'Fort Bend', 0.82),
        ('201', 'Harris', 4.73),
        ('215', 'Hidalgo', 0.87),
        ('439', 'Tarrant', 2.11),
        ('453', 'Travis', 1.27),
    ],
    '12': [  # Florida
        ('011', 'Broward', 1.94),
        ('031', 'Duval', 0.99),
        ('057', 'Hillsborough', 1.46),
        ('086', 'Miami-Dade', 2.72),
        ('095', 'Orange', 1.43),
        ('099', 'Palm Beach', 1.50),
        ('103', 'Pinellas', 0.96),
    ],
    '04': [  # Arizona
        ('013', 'Maricopa', 4.49),
        ('019', 'Pima', 1.04),
    ],
    '37': [  # North Carolina (reform state)
        ('025', 'Cabarrus', 0.22),
        ('067', 'Forsyth', 0.38),
        ('081', 'Guilford', 0.54),
        ('119', 'Mecklenburg', 1.11),
        ('129', 'New Hanover', 0.23),
        ('135', 'Orange', 0.15),
        ('183', 'Wake', 1.11),
    ],
    '27': [  # Minnesota (reform state)
        ('003', 'Anoka', 0.36),
        ('037', 'Dakota', 0.44),
        ('053', 'Hennepin', 1.28),
        ('123', 'Ramsey', 0.55),
    ],
}

def generate_county_data():
    """Generate sample county-level data based on state patterns"""

    # Load state-level data
    state_data = pd.read_csv('../data/raw/state_permits_monthly_comprehensive.csv', dtype={'state_fips': str})
    state_data['state_fips'] = state_data['state_fips'].str.zfill(2)

    records = []

    for state_fips, counties in SAMPLE_COUNTIES.items():
        # Get state-level monthly data
        state_monthly = state_data[state_data['state_fips'] == state_fips].copy()

        if state_monthly.empty:
            print(f"No state data for FIPS {state_fips}, skipping...")
            continue

        # Calculate total population weight for this state's counties
        total_pop = sum([c[2] for c in counties])

        for county_fips, county_name, population_millions in counties:
            # Proportion of state's permits going to this county
            county_share = population_millions / total_pop

            # Apply county share with some random variation
            for _, month_row in state_monthly.iterrows():
                variation = np.random.uniform(0.85, 1.15)  # +/- 15% variation

                sf_permits = int(month_row['sf_permits'] * county_share * variation)
                mf_permits = int(month_row['mf_permits'] * county_share * variation)

                records.append({
                    'date': month_row['date'],
                    'year': month_row['year'],
                    'month': month_row['month'],
                    'state_fips': state_fips,
                    'county_fips': county_fips,
                    'fips': f"{state_fips}{county_fips}",
                    'county_name': county_name,
                    'sf_permits': sf_permits,
                    'mf_permits': mf_permits,
                    'total_permits': sf_permits + mf_permits,
                })

    # Create DataFrame
    df = pd.DataFrame(records)

    # Save to CSV
    output_path = '../data/outputs/county_permits_monthly.csv'
    df.to_csv(output_path, index=False)

    print("=" * 60)
    print("County-Level Permit Data Generated")
    print("=" * 60)
    print(f"Total records: {len(df):,}")
    print(f"Unique counties: {df['fips'].nunique()}")
    print(f"States covered: {df['state_fips'].nunique()}")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"\nOutput: {output_path}")
    print("=" * 60)

    # Show summary by county
    county_summary = df.groupby(['state_fips', 'county_fips', 'county_name']).agg({
        'total_permits': 'sum',
        'sf_permits': 'sum',
        'mf_permits': 'sum',
    }).reset_index()

    county_summary['mf_share'] = (county_summary['mf_permits'] / county_summary['total_permits'] * 100).round(1)
    county_summary = county_summary.sort_values('total_permits', ascending=False)

    print("\nTop 15 Counties by Total Permits (2015-2024):")
    print(county_summary[['county_name', 'state_fips', 'total_permits', 'mf_share']].head(15).to_string(index=False))

    return df

if __name__ == "__main__":
    generate_county_data()
