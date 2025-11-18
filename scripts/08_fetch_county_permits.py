"""
Fetch county-level building permit data from U.S. Census Bureau.
County data is available from the Building Permits Survey (BPS).
"""

import pandas as pd
import requests
from io import StringIO
import time
import os

# Create output directory
os.makedirs('data/outputs', exist_ok=True)

def download_county_data(year):
    """
    Download county-level annual permit data from Census Bureau.
    File format: https://www2.census.gov/econ/bps/County/co{year}a.txt
    """
    url = f"https://www2.census.gov/econ/bps/County/co{year}a.txt"

    print(f"Fetching county data for {year}...")

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        # Parse the fixed-width format file
        # Skip header rows (first 4 lines)
        df = pd.read_csv(StringIO(response.text), skiprows=4, header=None, low_memory=False)

        # County files have different format than state files
        # Columns: Survey Date, FIPS State Code, FIPS County Code, Region, Division,
        # 1-unit, 2-units, 3-4 units, 5+ units, etc.

        records = []
        for _, row in df.iterrows():
            try:
                # Skip empty rows
                if pd.isna(row.iloc[0]):
                    continue

                # Extract FIPS codes
                state_fips = str(row.iloc[1]).strip().zfill(2) if pd.notna(row.iloc[1]) else None
                county_fips = str(row.iloc[2]).strip().zfill(3) if pd.notna(row.iloc[2]) else None

                if not state_fips or not county_fips:
                    continue

                # Parse permit counts (1-unit is column 5, 2-units is 6, 3-4 is 7, 5+ is 8)
                sf_units = int(row.iloc[5]) if pd.notna(row.iloc[5]) and str(row.iloc[5]).strip() != '' else 0
                units_2 = int(row.iloc[6]) if pd.notna(row.iloc[6]) and str(row.iloc[6]).strip() != '' else 0
                units_3_4 = int(row.iloc[7]) if pd.notna(row.iloc[7]) and str(row.iloc[7]).strip() != '' else 0
                units_5plus = int(row.iloc[8]) if pd.notna(row.iloc[8]) and str(row.iloc[8]).strip() != '' else 0

                # Multi-family = 2-units + 3-4 units + 5+ units
                mf_units = units_2 + units_3_4 + units_5plus

                records.append({
                    'year': year,
                    'state_fips': state_fips,
                    'county_fips': county_fips,
                    'fips': f"{state_fips}{county_fips}",
                    'sf_annual': sf_units,
                    'mf_annual': mf_units,
                    'total_annual': sf_units + mf_units,
                })
            except Exception as e:
                # Skip problematic rows
                continue

        if records:
            year_df = pd.DataFrame(records)
            print(f"  -> Parsed {len(year_df)} counties for {year}")
            return year_df
        else:
            print(f"  -> No valid records for {year}")
            return pd.DataFrame()

    except requests.exceptions.RequestException as e:
        print(f"  -> Error fetching {year}: {e}")
        return pd.DataFrame()
    except Exception as e:
        print(f"  -> Error parsing {year}: {e}")
        return pd.DataFrame()

def main():
    """Download county data for recent years (2020-2024)"""

    print("=" * 60)
    print("Downloading County-Level Building Permit Data")
    print("=" * 60)

    # Focus on recent years for county drill-down (2020-2024)
    years = range(2020, 2025)

    all_data = []

    for year in years:
        year_data = download_county_data(year)
        if not year_data.empty:
            all_data.append(year_data)
        time.sleep(0.5)  # Be respectful to Census servers

    if all_data:
        # Combine all years
        combined = pd.concat(all_data, ignore_index=True)

        # Save to CSV
        output_path = 'data/outputs/county_permits_annual.csv'
        combined.to_csv(output_path, index=False)

        print("\n" + "=" * 60)
        print(f"SUCCESS: Saved {len(combined)} county-year records")
        print(f"Output: {output_path}")
        print(f"Years: {combined['year'].min()} - {combined['year'].max()}")
        print(f"Unique counties: {combined['fips'].nunique()}")
        print("=" * 60)

        # Show top counties by total permits
        county_totals = combined.groupby('fips').agg({
            'total_annual': 'sum',
            'state_fips': 'first',
            'county_fips': 'first'
        }).reset_index()

        county_totals = county_totals.sort_values('total_annual', ascending=False)

        print("\nTop 10 Counties by Total Permits (2020-2024):")
        for i, row in county_totals.head(10).iterrows():
            print(f"  {row['fips']}: {row['total_annual']:,} permits")
    else:
        print("\nNo data retrieved. Check Census Bureau website for availability.")

if __name__ == "__main__":
    main()
