#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Generate realistic sample Census permit data for testing
"""

import os
import pandas as pd
import random

def generate_comprehensive_sample():
    """Generate realistic state-level monthly permit data (2015-2024)"""

    states = {
        '06': 'California',
        '48': 'Texas',
        '12': 'Florida',
        '36': 'New York',
        '51': 'Virginia',
        '41': 'Oregon',
        '27': 'Minnesota',
        '37': 'North Carolina',
        '04': 'Arizona',
        '53': 'Washington',
        '08': 'Colorado',
        '30': 'Montana'
    }

    base_permits = {
        '06': 9500,   # California
        '48': 12000,  # Texas
        '12': 9000,   # Florida
        '36': 4000,   # New York
        '51': 3000,   # Virginia
        '41': 2200,   # Oregon
        '27': 1800,   # Minnesota
        '37': 3500,   # North Carolina
        '04': 4500,   # Arizona
        '53': 3200,   # Washington
        '08': 2800,   # Colorado
        '30': 800     # Montana
    }

    data = []

    print("Generating sample permit data...")

    for year in range(2015, 2025):
        for month in range(1, 13):
            for fips, name in states.items():
                # Base permits for this state
                base = base_permits[fips]

                # Seasonal variation (summer peak)
                seasonal = 1 + 0.25 * ((month - 6.5) / 6)

                # Growth trend (2% annual)
                growth = (1.02) ** (year - 2015)

                # Random noise
                noise = random.uniform(0.85, 1.15)

                total = int(base * seasonal * growth * noise)

                # Split into SF and MF
                sf = int(total * random.uniform(0.65, 0.75))
                mf = total - sf

                data.append({
                    'state_fips': fips,  # Keep as string with leading zeros
                    'state_name': name,
                    'year': year,
                    'month': month,
                    'date': f"{year}-{month:02d}-01",
                    'sf_permits': sf,
                    'mf_permits': mf,
                    'total_permits': total,
                    'adu_permits': int(total * random.uniform(0.02, 0.08))  # 2-8% ADUs
                })

    df = pd.DataFrame(data)

    # Save
    os.makedirs('data/raw', exist_ok=True)

    csv_path = 'data/raw/state_permits_monthly_comprehensive.csv'

    df.to_csv(csv_path, index=False)

    print(f"Generated {len(df)} permit records")
    print(f"Saved CSV: {csv_path}")

    # Print summary
    print("\nSummary by State:")
    summary = df.groupby('state_name')['total_permits'].agg(['sum', 'mean'])
    print(summary)

    return df

if __name__ == "__main__":
    generate_comprehensive_sample()
