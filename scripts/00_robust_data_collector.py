#!/usr/bin/env python3
"""
ROBUST Census & HUD Data Collector
Multiple fallback strategies for reliable permit data
"""

import os
import sys
import pandas as pd
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

CENSUS_API_KEY = os.getenv('CENSUS_API_KEY')
OUTPUT_DIR = "data/raw"

def ensure_dirs():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

def method_1_hud_socds():
    """
    Method 1: HUD SOCDS Place-level Data
    Most reliable source for historical permit data
    """
    print("📊 Attempting Method 1: HUD SOCDS...")

    # HUD SOCDS provides CSV downloads
    # Unfortunately no public API, but they have downloadable datasets

    urls = {
        'annual': 'https://www.huduser.gov/portal/datasets/socds/permits/getdata.jsp',
        # We'll use a direct download approach
    }

    print("  ⚠️  HUD SOCDS requires manual download from:")
    print("  https://www.huduser.gov/portal/datasets/socds.html")
    print("  Please download 'Building Permits' CSV and place in data/raw/")

    return None

def method_2_census_acs():
    """
    Method 2: Census ACS (American Community Survey)
    Has housing unit data but not permits
    """
    print("\n📊 Attempting Method 2: Census ACS Housing Data...")

    endpoint = "https://api.census.gov/data/2022/acs/acs5"

    # Get housing units by state
    params = {
        'get': 'NAME,B25001_001E',  # Total housing units
        'for': 'state:*',
        'key': CENSUS_API_KEY
    }

    try:
        response = requests.get(endpoint, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        df = pd.DataFrame(data[1:], columns=data[0])

        print(f"  ✅ Retrieved ACS data for {len(df)} states")
        df.to_csv(f"{OUTPUT_DIR}/acs_housing_units_2022.csv", index=False)

        return df

    except Exception as e:
        print(f"  ❌ ACS failed: {e}")
        return None

def method_3_fred_api():
    """
    Method 3: Federal Reserve Economic Data (FRED)
    Has housing starts data (alternative to permits)
    """
    print("\n📊 Attempting Method 3: FRED Housing Starts...")

    # Example series: HOUST (Housing Starts: Total)
    # Free API key from https://fred.stlouisfed.org/docs/api/api_key.html

    fred_key = os.getenv('FRED_API_KEY', None)

    if not fred_key:
        print("  ⚠️  No FRED_API_KEY found in .env")
        print("  Get free key: https://fred.stlouisfed.org/docs/api/api_key.html")
        return None

    endpoint = "https://api.stlouisfed.org/fred/series/observations"

    params = {
        'series_id': 'HOUST',
        'api_key': fred_key,
        'file_type': 'json',
        'observation_start': '2015-01-01',
        'observation_end': '2024-12-31'
    }

    try:
        response = requests.get(endpoint, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        df = pd.DataFrame(data['observations'])

        print(f"  ✅ Retrieved FRED data: {len(df)} observations")
        df.to_csv(f"{OUTPUT_DIR}/fred_housing_starts.csv", index=False)

        return df

    except Exception as e:
        print(f"  ❌ FRED failed: {e}")
        return None

def method_4_manual_csv():
    """
    Method 4: Use manually curated CSV
    Backup option using your existing data
    """
    print("\n📊 Attempting Method 4: Manual CSV...")

    csv_path = f"{OUTPUT_DIR}/state_permits_monthly.csv"

    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        print(f"  ✅ Loaded manual CSV: {len(df)} rows")
        return df
    else:
        print(f"  ❌ Manual CSV not found at {csv_path}")
        return None

def create_robust_dataset():
    """
    Try all methods in sequence and combine results
    """
    ensure_dirs()

    datasets = {}

    # Try all methods
    datasets['hud'] = method_1_hud_socds()
    datasets['acs'] = method_2_census_acs()
    datasets['fred'] = method_3_fred_api()
    datasets['manual'] = method_4_manual_csv()

    # Use the best available data
    if datasets['manual'] is not None:
        print("\n✅ Using manual CSV as primary data source")
        primary = datasets['manual']
    elif datasets['acs'] is not None:
        print("\n✅ Using ACS housing units as fallback")
        primary = datasets['acs']
    else:
        print("\n❌ No data sources available!")
        print("\nRECOMMENDED ACTIONS:")
        print("1. Download HUD SOCDS data: https://www.huduser.gov/portal/datasets/socds.html")
        print("2. Or create manual CSV with state-level monthly permits")
        return None

    # Save combined dataset
    output_path = f"{OUTPUT_DIR}/comprehensive_permit_data.parquet"
    primary.to_parquet(output_path)
    print(f"\n💾 Saved comprehensive dataset: {output_path}")

    return primary

def generate_sample_data():
    """
    Generate realistic sample data for testing
    Based on actual Census patterns
    """
    print("\n🎲 Generating sample data for testing...")

    states = {
        '06': 'California',
        '48': 'Texas',
        '12': 'Florida',
        '36': 'New York',
        '51': 'Virginia',
        '41': 'Oregon',
        '27': 'Minnesota',
        '37': 'North Carolina'
    }

    data = []

    for year in range(2015, 2025):
        for month in range(1, 13):
            for fips, name in states.items():
                # Simulate realistic permit patterns
                base_permits = {
                    '06': 9000,  # California
                    '48': 11000, # Texas
                    '12': 8500,  # Florida
                    '36': 3500,  # New York
                    '51': 2800,  # Virginia
                    '41': 2000,  # Oregon
                    '27': 1500,  # Minnesota
                    '37': 3200   # North Carolina
                }[fips]

                # Add seasonal variation
                seasonal_factor = 1 + 0.2 * (month - 6.5) / 6

                # Add growth trend
                growth_rate = 0.02  # 2% annual growth
                growth_factor = (1 + growth_rate) ** (year - 2015)

                # Add some noise
                import random
                noise = random.uniform(0.9, 1.1)

                permits = int(base_permits * seasonal_factor * growth_factor * noise)

                data.append({
                    'state_fips': fips,
                    'state_name': name,
                    'year': year,
                    'month': month,
                    'date': f"{year}-{month:02d}-01",
                    'sf_permits': int(permits * 0.7),
                    'mf_permits': int(permits * 0.3),
                    'total_permits': permits
                })

    df = pd.DataFrame(data)

    # Save
    sample_path = f"{OUTPUT_DIR}/sample_permit_data.csv"
    df.to_csv(sample_path, index=False)

    parquet_path = f"{OUTPUT_DIR}/sample_permit_data.parquet"
    df.to_parquet(parquet_path)

    print(f"  ✅ Generated {len(df)} sample records")
    print(f"  💾 Saved to: {sample_path}")
    print(f"  💾 Saved to: {parquet_path}")

    return df

if __name__ == "__main__":
    print("=" * 60)
    print("ROBUST CENSUS & HUD DATA COLLECTOR")
    print("=" * 60)

    # Try to get real data
    real_data = create_robust_dataset()

    # If no real data, generate sample
    if real_data is None:
        print("\n⚠️  No real data available. Generating sample data...")
        generate_sample_data()
        print("\n✅ Sample data ready for testing visualizations")
        print("   Replace with real data when available")
