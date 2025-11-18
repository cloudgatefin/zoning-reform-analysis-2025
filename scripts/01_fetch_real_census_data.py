#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Fetch REAL Census Building Permits Survey Data
Using Census API for actual permit statistics
"""

import os
import pandas as pd
import requests
from datetime import datetime
import time

# Census API configuration
CENSUS_API_KEY = os.environ.get('CENSUS_API_KEY', None)
CENSUS_BASE_URL = "https://api.census.gov/data"

# State FIPS codes for our reform states
REFORM_STATES = {
    '06': 'California',
    '41': 'Oregon',
    '27': 'Minnesota',
    '51': 'Virginia',
    '37': 'North Carolina',
    '30': 'Montana',
    # Additional high-growth states for comparison
    '48': 'Texas',
    '12': 'Florida',
    '04': 'Arizona',
    '53': 'Washington',
    '08': 'Colorado',
    '36': 'New York'
}

def fetch_annual_bps_data(year):
    """
    Fetch annual Building Permits Survey data
    Endpoint: /data/{year}/bps/ann
    """

    url = f"{CENSUS_BASE_URL}/{year}/bps/ann"

    params = {
        'get': 'UNITS,UNITS5,UNITSMF,ST_NAME',
        'for': 'state:*'
    }

    if CENSUS_API_KEY:
        params['key'] = CENSUS_API_KEY

    print(f"Fetching {year} annual data from {url}")

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()

        # First row is headers
        headers = data[0]
        rows = data[1:]

        df = pd.DataFrame(rows, columns=headers)
        df['year'] = year

        return df

    except requests.exceptions.RequestException as e:
        print(f"  ERROR fetching {year}: {e}")
        return None

def fetch_monthly_bps_data(year, month):
    """
    Fetch monthly Building Permits Survey data
    Endpoint: /data/timeseries/bps
    """

    url = f"{CENSUS_BASE_URL}/timeseries/bps"

    params = {
        'get': 'UNITS,UNITS5,UNITSMF,ST_NAME',
        'for': 'state:*',
        'time': f'{year}-{month:02d}'
    }

    if CENSUS_API_KEY:
        params['key'] = CENSUS_API_KEY

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        headers = data[0]
        rows = data[1:]

        df = pd.DataFrame(rows, columns=headers)
        df['year'] = year
        df['month'] = month

        return df

    except requests.exceptions.RequestException as e:
        print(f"  ERROR fetching {year}-{month:02d}: {e}")
        return None

def try_all_endpoints():
    """
    Test various Census endpoints to find working data source
    """

    print("=" * 60)
    print("TESTING CENSUS API ENDPOINTS")
    print("=" * 60)

    endpoints_to_test = [
        # Annual BPS
        ("Annual BPS 2023", f"{CENSUS_BASE_URL}/2023/bps/ann", {
            'get': 'UNITS,ST_NAME',
            'for': 'state:06'
        }),
        ("Annual BPS 2022", f"{CENSUS_BASE_URL}/2022/bps/ann", {
            'get': 'UNITS,ST_NAME',
            'for': 'state:06'
        }),
        ("Annual BPS 2021", f"{CENSUS_BASE_URL}/2021/bps/ann", {
            'get': 'UNITS,ST_NAME',
            'for': 'state:06'
        }),

        # Monthly timeseries
        ("Monthly BPS", f"{CENSUS_BASE_URL}/timeseries/bps", {
            'get': 'UNITS,ST_NAME',
            'for': 'state:06',
            'time': '2023-01'
        }),

        # ACS 5-year (fallback)
        ("ACS 5-Year 2022", f"{CENSUS_BASE_URL}/2022/acs/acs5", {
            'get': 'NAME,B25034_001E',
            'for': 'state:06'
        }),
    ]

    for name, url, params in endpoints_to_test:
        if CENSUS_API_KEY:
            params['key'] = CENSUS_API_KEY

        print(f"\nTesting: {name}")
        print(f"  URL: {url}")
        print(f"  Params: {params}")

        try:
            response = requests.get(url, params=params, timeout=15)
            print(f"  Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                print(f"  SUCCESS! Got {len(data)} rows")
                print(f"  Sample: {data[:2]}")
                return (name, url, params, data)
            else:
                print(f"  Response: {response.text[:200]}")

        except Exception as e:
            print(f"  ERROR: {e}")

    return None

def fetch_hud_socds_fallback():
    """
    If Census API fails, use HUD State of the Cities Data Systems
    This provides annual permit data by state
    """

    print("\n" + "=" * 60)
    print("FALLBACK: Using HUD SOCDS Data")
    print("=" * 60)

    # HUD SOCDS provides CSV downloads
    # https://www.huduser.gov/portal/datasets/socds.html

    hud_url = "https://www.huduser.gov/portal/datasets/socds/SOCDS_Export_2024.xlsx"

    print(f"Attempting to fetch from: {hud_url}")

    try:
        # Note: This URL may need to be updated based on HUD's latest data
        df = pd.read_excel(hud_url, sheet_name='Permits')
        print(f"SUCCESS! Downloaded {len(df)} rows from HUD SOCDS")
        return df
    except Exception as e:
        print(f"ERROR: {e}")
        return None

def main():
    """
    Main data collection pipeline
    """

    print("REAL CENSUS DATA COLLECTION")
    print("=" * 60)
    print(f"API Key configured: {CENSUS_API_KEY is not None}")
    print(f"Target states: {len(REFORM_STATES)}")
    print()

    # First, test endpoints to find what works
    result = try_all_endpoints()

    if result:
        name, url, params, sample_data = result
        print(f"\n\nFOUND WORKING ENDPOINT: {name}")
        print(f"You can now fetch data from: {url}")
        print("\nNext steps:")
        print("1. Use this endpoint to fetch historical data (2015-2024)")
        print("2. Process and aggregate by state/month")
        print("3. Generate comprehensive metrics")

        # Save sample response
        os.makedirs('data/raw', exist_ok=True)
        sample_df = pd.DataFrame(sample_data[1:], columns=sample_data[0])
        sample_df.to_csv('data/raw/census_sample_response.csv', index=False)
        print(f"\nSaved sample to: data/raw/census_sample_response.csv")

    else:
        print("\n\nNO WORKING CENSUS ENDPOINTS FOUND")
        print("Attempting HUD SOCDS fallback...")

        hud_data = fetch_hud_socds_fallback()

        if hud_data is not None:
            os.makedirs('data/raw', exist_ok=True)
            hud_data.to_csv('data/raw/hud_socds_permits.csv', index=False)
            print(f"Saved HUD data to: data/raw/hud_socds_permits.csv")
        else:
            print("\nALL DATA SOURCES FAILED")
            print("Please manually download data from:")
            print("1. https://www.census.gov/construction/bps/")
            print("2. https://www.huduser.gov/portal/datasets/socds.html")

if __name__ == "__main__":
    main()
