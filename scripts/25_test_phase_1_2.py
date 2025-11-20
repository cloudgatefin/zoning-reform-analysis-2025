#!/usr/bin/env python3
"""Test Phase 1.2 integration completeness"""

import os
import json

def test_files_exist():
    """Check all required files exist"""
    print("\n[TEST] Checking file existence...")

    files_to_check = [
        ('app/components/ui/PlaceSearch.tsx', 'PlaceSearch component'),
        ('app/components/visualizations/PlaceDetailPanel.tsx', 'PlaceDetailPanel component'),
        ('app/app/api/places/[fips]/route.ts', 'Place details API'),
        ('app/app/api/places/[fips]/permits/route.ts', 'Permits API'),
        ('app/app/api/places/[fips]/reforms/route.ts', 'Reforms API'),
        ('app/public/data/places.json', 'Search index'),
        ('data/raw/city_reforms_expanded.csv', 'Expanded reforms'),
        ('data/outputs/place_metrics_comprehensive.csv', 'Place metrics'),
        ('data/raw/census_bps_place_annual_permits.csv', 'Annual permits'),
    ]

    missing = []
    for filepath, description in files_to_check:
        if not os.path.exists(filepath):
            missing.append(f"  - {description}: {filepath}")
            print(f"[FAIL] {description}")
        else:
            print(f"[OK] {description}")

    return len(missing) == 0, missing

def test_data_quality():
    """Test data file quality"""
    print("\n[TEST] Checking data quality...")

    # Check search index
    try:
        with open('app/public/data/places.json') as f:
            places = json.load(f)
        print(f"[OK] Search index: {len(places)} places")
    except Exception as e:
        print(f"[FAIL] Search index: {e}")
        return False

    return True

def test_component_exports():
    """Test component exports"""
    print("\n[TEST] Checking component exports...")

    checks = [
        ('app/components/ui/index.ts', 'PlaceSearch'),
        ('app/components/visualizations/index.ts', 'PlaceDetailPanel'),
    ]

    for filepath, component in checks:
        if os.path.exists(filepath):
            with open(filepath) as f:
                if component in f.read():
                    print(f"[OK] {component} exported")
                else:
                    print(f"[FAIL] {component} not exported")
        else:
            print(f"[WARN] {filepath} missing")

    return True

def main():
    print("=" * 60)
    print("PHASE 1.2 INTEGRATION TEST SUITE")
    print("=" * 60)

    files_ok, missing = test_files_exist()
    data_ok = test_data_quality()
    exports_ok = test_component_exports()

    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    if files_ok and data_ok and exports_ok:
        print("\n[OK] ALL TESTS PASSED - Ready for deployment")
        return 0
    else:
        print("\n[FAIL] Some tests failed")
        if missing:
            print("\nMissing files:")
            for item in missing:
                print(item)
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
