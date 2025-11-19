#!/usr/bin/env python3
"""
Fetch city-level building permit data from Census Bureau Building Permits Survey (BPS) API
Fully automated - no manual downloads required

This script programmatically fetches place-level building permit data for all US cities
from 2015-2024 using the Census API.

Usage:
    export CENSUS_API_KEY="your_key_here"
    python scripts/11_fetch_city_permits_api.py

Output:
    data/raw/census_bps_place_all_years.csv
"""

import requests
import pandas as pd
import time
import os
import sys
from typing import List, Dict, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Census API configuration
CENSUS_API_KEY = os.environ.get('CENSUS_API_KEY', '')
BASE_URL = "https://api.census.gov/data"
RATE_LIMIT_DELAY = 0.5  # seconds between requests (Census limit: 120 calls/min)
MAX_RETRIES = 3
RETRY_BACKOFF = 2  # exponential backoff multiplier

# All US states and territories FIPS codes
STATE_FIPS = {
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
    '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming'
}

YEARS = list(range(2015, 2025))  # 2015-2024


def fetch_place_permits_for_state_year(
    year: int,
    state_fips: str,
    state_name: str
) -> Optional[List[List]]:
    """
    Fetch place-level building permit data for a single state and year.

    Args:
        year: Year to fetch data for
        state_fips: Two-digit state FIPS code
        state_name: State name for logging

    Returns:
        List of rows (as lists) or None if request failed
    """
    url = f"{BASE_URL}/{year}/bps/place"
    params = {
        'get': 'NAME,PERMITTOTAL_1UNIT,PERMITTOTAL_2UNIT,PERMITTOTAL_34UNIT,PERMITTOTAL_5UNIT',
        'for': 'place:*',
        'in': f'state:{state_fips}',
    }

    if CENSUS_API_KEY:
        params['key'] = CENSUS_API_KEY

    for attempt in range(MAX_RETRIES):
        try:
            logger.debug(f"Fetching {state_name} ({state_fips}) for {year}, attempt {attempt + 1}")
            response = requests.get(url, params=params, timeout=30)

            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 1:  # First row is headers
                    logger.info(f"✓ {year} {state_name}: {len(data) - 1} places fetched")
                    return data
                else:
                    logger.warning(f"✗ {year} {state_name}: No data returned")
                    return None

            elif response.status_code == 204:  # No content
                logger.warning(f"✗ {year} {state_name}: No data available (204)")
                return None

            elif response.status_code == 404:
                logger.warning(f"✗ {year} {state_name}: Endpoint not found (404) - may not exist for this year")
                return None

            else:
                logger.warning(
                    f"Attempt {attempt + 1}/{MAX_RETRIES} failed for {year} {state_name}: "
                    f"HTTP {response.status_code} - {response.text[:200]}"
                )

        except requests.exceptions.RequestException as e:
            logger.warning(
                f"Attempt {attempt + 1}/{MAX_RETRIES} failed for {year} {state_name}: {str(e)}"
            )

        # Exponential backoff before retry
        if attempt < MAX_RETRIES - 1:
            backoff_time = RETRY_BACKOFF ** attempt
            time.sleep(backoff_time)

    logger.error(f"✗✗✗ Failed to fetch {year} {state_name} after {MAX_RETRIES} attempts")
    return None


def parse_permit_value(value: str) -> Optional[int]:
    """
    Parse permit value from API response, handling null/missing values.

    Args:
        value: String value from API

    Returns:
        Integer value or None if invalid
    """
    if value is None or value == '' or value == 'null' or value == 'N/A':
        return None
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return None


def process_api_response(
    data: List[List],
    year: int,
    state_fips: str,
    state_name: str
) -> List[Dict]:
    """
    Process raw API response into structured records.

    Args:
        data: Raw API response (list of lists)
        year: Year of data
        state_fips: State FIPS code
        state_name: State name

    Returns:
        List of dictionaries with processed data
    """
    if not data or len(data) < 2:
        return []

    headers = data[0]
    rows = data[1:]

    records = []
    for row in rows:
        try:
            # Parse permit values
            sf_permits = parse_permit_value(row[1])  # PERMITTOTAL_1UNIT
            unit_2 = parse_permit_value(row[2])      # PERMITTOTAL_2UNIT
            unit_34 = parse_permit_value(row[3])     # PERMITTOTAL_34UNIT
            unit_5plus = parse_permit_value(row[4])  # PERMITTOTAL_5UNIT

            # Calculate multifamily (2+ units) and total
            mf_components = [v for v in [unit_2, unit_34, unit_5plus] if v is not None]
            mf_permits = sum(mf_components) if mf_components else None

            sf_val = sf_permits if sf_permits is not None else 0
            mf_val = mf_permits if mf_permits is not None else 0
            total_permits = sf_val + mf_val if (sf_permits is not None or mf_permits is not None) else None

            record = {
                'year': year,
                'place_fips': row[-1],  # Last column is place FIPS
                'state_fips': state_fips,
                'place_name': row[0],
                'state_name': state_name,
                'sf_permits': sf_permits,
                'mf_permits': mf_permits,
                'other_permits': None,  # Not available in this API version
                'total_permits': total_permits,
                'unit_2': unit_2,
                'unit_34': unit_34,
                'unit_5plus': unit_5plus
            }
            records.append(record)

        except (IndexError, ValueError) as e:
            logger.warning(f"Error processing row: {row}, error: {e}")
            continue

    return records


def main():
    """Main execution function."""
    if not CENSUS_API_KEY:
        logger.warning(
            "WARNING: CENSUS_API_KEY not set. Requests may be rate-limited more aggressively. "
            "Set the environment variable for better performance."
        )

    logger.info("=" * 80)
    logger.info("CENSUS BUILDING PERMITS API COLLECTOR")
    logger.info("Fetching place-level data for all US cities, 2015-2024")
    logger.info("=" * 80)

    all_records = []
    total_requests = len(YEARS) * len(STATE_FIPS)
    completed_requests = 0
    failed_requests = 0

    start_time = time.time()

    for year in YEARS:
        logger.info(f"\n{'=' * 60}")
        logger.info(f"YEAR {year}")
        logger.info(f"{'=' * 60}")

        year_records = []

        for state_fips, state_name in STATE_FIPS.items():
            # Fetch data with rate limiting
            data = fetch_place_permits_for_state_year(year, state_fips, state_name)

            if data:
                records = process_api_response(data, year, state_fips, state_name)
                year_records.extend(records)
                completed_requests += 1
            else:
                failed_requests += 1

            # Rate limiting
            time.sleep(RATE_LIMIT_DELAY)

        logger.info(f"Year {year} complete: {len(year_records)} total place records")
        all_records.extend(year_records)

    elapsed_time = time.time() - start_time

    # Create DataFrame and save
    logger.info("\n" + "=" * 80)
    logger.info("PROCESSING COMPLETE")
    logger.info("=" * 80)
    logger.info(f"Total requests: {total_requests}")
    logger.info(f"Successful: {completed_requests}")
    logger.info(f"Failed: {failed_requests}")
    logger.info(f"Total place records: {len(all_records)}")
    logger.info(f"Elapsed time: {elapsed_time:.1f} seconds")

    if not all_records:
        logger.error("ERROR: No data collected. Check API key and network connection.")
        sys.exit(1)

    df = pd.DataFrame(all_records)

    # Reorder columns for clarity
    column_order = [
        'year', 'place_fips', 'place_name', 'state_fips', 'state_name',
        'sf_permits', 'mf_permits', 'other_permits', 'total_permits',
        'unit_2', 'unit_34', 'unit_5plus'
    ]
    df = df[column_order]

    # Save to CSV
    output_path = 'data/raw/census_bps_place_all_years.csv'
    df.to_csv(output_path, index=False)
    logger.info(f"\n✓ Data saved to: {output_path}")

    # Summary statistics
    logger.info("\n" + "=" * 80)
    logger.info("SUMMARY STATISTICS")
    logger.info("=" * 80)
    logger.info(f"Years covered: {df['year'].min()} - {df['year'].max()}")
    logger.info(f"Unique places: {df['place_fips'].nunique()}")
    logger.info(f"Unique states: {df['state_fips'].nunique()}")
    logger.info(f"\nRecords by year:")
    for year, count in df.groupby('year').size().items():
        logger.info(f"  {year}: {count:,} places")

    logger.info(f"\nTotal permits collected:")
    total_sf = df['sf_permits'].sum()
    total_mf = df['mf_permits'].sum()
    total_all = df['total_permits'].sum()
    logger.info(f"  Single-family: {total_sf:,.0f}")
    logger.info(f"  Multi-family: {total_mf:,.0f}")
    logger.info(f"  Total: {total_all:,.0f}")

    logger.info("\n" + "=" * 80)
    logger.info("SUCCESS: City-level permit data collection complete!")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()
