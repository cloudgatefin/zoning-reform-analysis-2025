#!/usr/bin/env python
"""
Generate places.json search index from place_metrics_comprehensive.csv

This creates a lightweight JSON file suitable for client-side search with Fuse.js.
Run this after Script 22 (build_place_metrics.py) completes.

Usage:
    python scripts/26_generate_search_index.py
"""

import pandas as pd
import json
import os
from pathlib import Path

# Configuration
INPUT_FILE = 'data/outputs/place_metrics_comprehensive.csv'
OUTPUT_DIR = 'public/data'
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'places.json')

# Columns to include in search index
SEARCH_COLUMNS = [
    'place_fips',
    'place_name',
    'state_fips',
    'recent_units_2024',
    'growth_rate_5yr',
    'mf_share_recent',
    'rank_permits_national',
    'rank_growth_national',
]

def main():
    """Generate search index JSON"""
    print("=" * 70)
    print("Generating places.json search index")
    print("=" * 70)

    # Verify input file exists
    if not os.path.exists(INPUT_FILE):
        print("[X] Input file not found: {}".format(INPUT_FILE))
        return False

    # Try multiple encodings
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
    df = None

    for encoding in encodings:
        try:
            print("\nAttempting to read with encoding: {}".format(encoding))
            df = pd.read_csv(INPUT_FILE, encoding=encoding)
            print("[OK] Successfully read with {}".format(encoding))
            break
        except UnicodeDecodeError:
            continue

    if df is None:
        print("[X] Could not read CSV with any encoding")
        return False

    # Filter to required columns
    print("\nProcessing {} places...".format(len(df)))
    places = df[SEARCH_COLUMNS].copy()

    # Convert to records (list of dicts)
    places_list = places.to_dict('records')

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Write JSON with proper encoding
    print("\nWriting to {}".format(OUTPUT_FILE))
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(places_list, f, ensure_ascii=False)

    # Verify output
    file_size = os.path.getsize(OUTPUT_FILE)
    file_size_mb = file_size / 1024 / 1024

    print("\n[OK] Search index created successfully")
    print("  - Places: {:,}".format(len(places_list)))
    print("  - File size: {:.1f} MB".format(file_size_mb))
    print("  - Location: {}".format(OUTPUT_FILE))

    return True

if __name__ == '__main__':
    success = main()
    if not success:
        exit(1)
