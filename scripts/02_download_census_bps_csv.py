#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Download Real Census Building Permits Survey Data
From Census.gov public CSV/Excel files
"""

import os
import pandas as pd
import requests
from io import BytesIO
import time

# Census Bureau publishes BPS data as Excel files on their website
# https://www.census.gov/construction/bps/stateannual.html

def download_annual_state_permits():
    """
    Download annual state-level building permits from Census
    File: stateannual.xls (1980-2023)
    """

    print("Downloading Census Building Permits Survey - State Annual Data")
    print("=" * 60)

    url = "https://www2.census.gov/econ/bps/State/stateannual.txt"

    print(f"URL: {url}")

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        print(f"SUCCESS! Downloaded {len(response.content)} bytes")

        # Save raw file
        os.makedirs('data/raw', exist_ok=True)
        raw_path = 'data/raw/census_bps_state_annual.txt'

        with open(raw_path, 'wb') as f:
            f.write(response.content)

        print(f"Saved to: {raw_path}")

        # Parse the text file
        # Format is typically tab or comma delimited
        print("\nParsing data...")

        # Try reading as CSV
        try:
            df = pd.read_csv(BytesIO(response.content), sep='\t', encoding='latin1')
            print(f"Parsed {len(df)} rows, {len(df.columns)} columns")
            print(f"Columns: {list(df.columns)[:10]}")
            print(f"\nFirst few rows:")
            print(df.head())

            return df

        except Exception as e:
            print(f"Tab-delimited parsing failed: {e}")

            # Try comma-delimited
            try:
                df = pd.read_csv(BytesIO(response.content), encoding='latin1')
                print(f"Parsed {len(df)} rows (comma-delimited)")
                return df
            except Exception as e2:
                print(f"Comma-delimited also failed: {e2}")
                return None

    except requests.exceptions.RequestException as e:
        print(f"ERROR downloading: {e}")
        return None

def download_monthly_state_permits():
    """
    Download monthly state-level building permits
    """

    print("\n\nDownloading Monthly State Permits")
    print("=" * 60)

    # Monthly data is typically in separate files by year
    base_url = "https://www2.census.gov/econ/bps/State"

    all_data = []

    for year in range(2015, 2025):
        url = f"{base_url}/st{year:02d}a.txt"
        print(f"\nFetching {year}: {url}")

        try:
            response = requests.get(url, timeout=30)

            if response.status_code == 200:
                print(f"  SUCCESS! {len(response.content)} bytes")

                # Parse
                try:
                    df = pd.read_csv(BytesIO(response.content), sep='\t', encoding='latin1')
                    df['year'] = year
                    all_data.append(df)
                    print(f"  Parsed {len(df)} rows")

                except Exception as e:
                    print(f"  Parse error: {e}")

            else:
                print(f"  404 - File not found for {year}")

            time.sleep(0.5)  # Rate limiting

        except Exception as e:
            print(f"  ERROR: {e}")

    if all_data:
        combined = pd.concat(all_data, ignore_index=True)
        print(f"\n\nCombined monthly data: {len(combined)} rows")
        return combined
    else:
        return None

def try_alternative_sources():
    """
    Try alternative Census data sources
    """

    print("\n\nTrying Alternative Data Sources")
    print("=" * 60)

    sources = [
        # State annual permits (main source)
        ("State Annual TXT", "https://www2.census.gov/econ/bps/State/stateannual.txt"),

        # State annual Excel
        ("State Annual XLS", "https://www2.census.gov/econ/bps/State/stateannual.xls"),

        # Alternative format
        ("State Annual CSV", "https://www.census.gov/construction/bps/txt/stateannual.txt"),

        # HUD SOCDS
        ("HUD SOCDS Permits", "https://www.huduser.gov/portal/datasets/socds.html"),
    ]

    for name, url in sources:
        print(f"\nTrying: {name}")
        print(f"  URL: {url}")

        try:
            response = requests.get(url, timeout=20, allow_redirects=True)
            print(f"  Status: {response.status_code}")
            print(f"  Content-Type: {response.headers.get('content-type', 'unknown')}")
            print(f"  Size: {len(response.content)} bytes")

            if response.status_code == 200:
                content_preview = response.content[:500].decode('latin1', errors='ignore')
                print(f"  Preview: {content_preview[:200]}")

                # Save successful response
                ext = url.split('.')[-1]
                save_path = f'data/raw/census_download_{name.replace(" ", "_").lower()}.{ext}'

                with open(save_path, 'wb') as f:
                    f.write(response.content)

                print(f"  SAVED: {save_path}")

        except Exception as e:
            print(f"  ERROR: {e}")

def main():
    """
    Main download pipeline
    """

    print("CENSUS BUILDING PERMITS SURVEY - DATA DOWNLOAD")
    print("=" * 60)
    print()

    os.makedirs('data/raw', exist_ok=True)

    # Try to download annual state data
    annual_df = download_annual_state_permits()

    if annual_df is not None:
        csv_path = 'data/raw/census_bps_state_annual_processed.csv'
        annual_df.to_csv(csv_path, index=False)
        print(f"\nSaved processed data: {csv_path}")

    # Try monthly data
    monthly_df = download_monthly_state_permits()

    if monthly_df is not None:
        csv_path = 'data/raw/census_bps_state_monthly_processed.csv'
        monthly_df.to_csv(csv_path, index=False)
        print(f"\nSaved monthly data: {csv_path}")

    # Try all alternative sources
    try_alternative_sources()

    print("\n\n" + "=" * 60)
    print("DOWNLOAD COMPLETE")
    print("=" * 60)
    print("\nCheck data/raw/ for downloaded files")

if __name__ == "__main__":
    main()
