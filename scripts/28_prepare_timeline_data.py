#!/usr/bin/env python3
"""
Agent 11: Prepare timeline data for the Reform Adoption Timeline component.
Transforms city_reforms_expanded.csv into reforms_timeline.json with region mapping.
"""

import pandas as pd
import json
from pathlib import Path

# Region mapping for US states
REGION_MAP = {
    # West Coast
    'CA': 'West Coast', 'OR': 'West Coast', 'WA': 'West Coast',
    # Mountain
    'CO': 'Mountain', 'UT': 'Mountain', 'NV': 'Mountain', 'ID': 'Mountain',
    'WY': 'Mountain', 'MT': 'Mountain', 'AZ': 'Mountain', 'NM': 'Mountain',
    # Midwest
    'IL': 'Midwest', 'OH': 'Midwest', 'MI': 'Midwest', 'IN': 'Midwest',
    'MN': 'Midwest', 'MO': 'Midwest', 'WI': 'Midwest', 'IA': 'Midwest',
    'KS': 'Midwest', 'NE': 'Midwest', 'SD': 'Midwest', 'ND': 'Midwest',
    # South
    'TX': 'South', 'FL': 'South', 'GA': 'South', 'NC': 'South', 'VA': 'South',
    'MD': 'South', 'DE': 'South', 'SC': 'South', 'TN': 'South', 'AR': 'South',
    'LA': 'South', 'MS': 'South', 'AL': 'South', 'KY': 'South', 'WV': 'South',
    'OK': 'South', 'DC': 'South',
    # Northeast
    'MA': 'Northeast', 'CT': 'Northeast', 'RI': 'Northeast', 'VT': 'Northeast',
    'NH': 'Northeast', 'ME': 'Northeast', 'NY': 'Northeast', 'NJ': 'Northeast',
    'PA': 'Northeast',
    # Other
    'AK': 'Other', 'HI': 'Other',
}

# State FIPS to abbreviation mapping
STATE_FIPS_TO_ABBR = {
    '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
    '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
    '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
    '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
    '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
    '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
    '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
    '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
    '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
    '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
    '56': 'WY', '4': 'AZ', '6': 'CA', '8': 'CO',
}

def main():
    # Load reforms data
    input_path = Path('data/raw/city_reforms_expanded.csv')
    output_path = Path('app/public/data/reforms_timeline.json')

    print(f"Loading reforms from {input_path}")
    df = pd.read_csv(input_path)
    print(f"Loaded {len(df)} reforms")

    # Convert state_fips to string and map to abbreviation
    df['state_fips_str'] = df['state_fips'].astype(str).str.zfill(2)
    df['state_code'] = df['state_fips_str'].map(STATE_FIPS_TO_ABBR)

    # Fill missing state codes using state_name
    state_name_to_code = {
        'California': 'CA', 'Oregon': 'OR', 'Washington': 'WA', 'Colorado': 'CO',
        'Utah': 'UT', 'Arizona': 'AZ', 'New Mexico': 'NM', 'Minnesota': 'MN',
        'Texas': 'TX', 'Georgia': 'GA', 'North Carolina': 'NC', 'Tennessee': 'TN',
        'Louisiana': 'LA', 'Massachusetts': 'MA', 'Illinois': 'IL', 'New York': 'NY',
    }
    df['state_code'] = df.apply(
        lambda r: state_name_to_code.get(r['state_name'], r['state_code'])
        if pd.isna(r['state_code']) else r['state_code'],
        axis=1
    )

    # Map to regions
    df['region'] = df['state_code'].map(REGION_MAP).fillna('Other')

    # Parse dates and extract year
    df['effective_date'] = pd.to_datetime(df['effective_date'], errors='coerce')
    df['year'] = df['effective_date'].dt.year

    # Filter to 2010+ (focus on 2015+)
    df = df[df['year'] >= 2010]

    # Create unique ID
    df['id'] = df.apply(
        lambda r: f"{r['state_code'].lower()}_{r['city_name'].lower().replace(' ', '_')}_{r['year']}",
        axis=1
    )

    # Prepare output data
    timeline_data = []
    for _, row in df.iterrows():
        reform = {
            'id': row['id'],
            'city': row['city_name'].replace(' city', '').replace(' City', ''),
            'state': row['state_name'],
            'state_code': row['state_code'] if pd.notna(row['state_code']) else '',
            'reform_name': row['reform_name'],
            'reform_type': row['reform_type'],
            'adoption_date': row['effective_date'].strftime('%Y-%m-%d') if pd.notna(row['effective_date']) else '',
            'year': int(row['year']) if pd.notna(row['year']) else 0,
            'region': row['region'],
            'baseline_wrluri': float(row['baseline_wrluri']) if pd.notna(row['baseline_wrluri']) else None,
        }
        timeline_data.append(reform)

    # Sort by date
    timeline_data.sort(key=lambda x: x['adoption_date'])

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write JSON
    with open(output_path, 'w') as f:
        json.dump(timeline_data, f, indent=2)

    print(f"\nWrote {len(timeline_data)} reforms to {output_path}")

    # Print summary
    print("\n=== Summary ===")
    print(f"Total reforms: {len(timeline_data)}")
    print(f"\nBy reform type:")
    type_counts = {}
    for r in timeline_data:
        t = r['reform_type']
        type_counts[t] = type_counts.get(t, 0) + 1
    for t, c in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f"  {t}: {c}")

    print(f"\nBy region:")
    region_counts = {}
    for r in timeline_data:
        reg = r['region']
        region_counts[reg] = region_counts.get(reg, 0) + 1
    for reg, c in sorted(region_counts.items(), key=lambda x: -x[1]):
        print(f"  {reg}: {c}")

    print(f"\nBy year:")
    year_counts = {}
    for r in timeline_data:
        y = r['year']
        year_counts[y] = year_counts.get(y, 0) + 1
    for y, c in sorted(year_counts.items()):
        print(f"  {y}: {c}")

if __name__ == '__main__':
    main()
