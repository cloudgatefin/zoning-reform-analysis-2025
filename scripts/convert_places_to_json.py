#!/usr/bin/env python3
"""
Convert place_metrics_comprehensive.csv to JSON for client-side search.
If the CSV doesn't exist, generates sample data for testing.
"""

import json
import os
import random
import csv

def generate_sample_places():
    """Generate sample place data for testing when real data is unavailable."""

    # Sample US cities with realistic data
    cities = [
        # California
        ("0644000", "Los Angeles city", "06"),
        ("0667000", "San Francisco city", "06"),
        ("0664000", "San Diego city", "06"),
        ("0668000", "San Jose city", "06"),
        ("0627000", "Fresno city", "06"),
        ("0653000", "Oakland city", "06"),
        ("0665000", "Sacramento city", "06"),
        ("0603526", "Anaheim city", "06"),
        ("0670000", "Santa Ana city", "06"),
        ("0616000", "Irvine city", "06"),
        # Texas
        ("4835000", "Houston city", "48"),
        ("4865000", "San Antonio city", "48"),
        ("4819000", "Dallas city", "48"),
        ("4804000", "Austin city", "48"),
        ("4827000", "Fort Worth city", "48"),
        ("4824000", "El Paso city", "48"),
        ("4801000", "Arlington city", "48"),
        ("4856000", "Plano city", "48"),
        ("4841464", "Laredo city", "48"),
        ("4845000", "Lubbock city", "48"),
        # New York
        ("3651000", "New York city", "36"),
        ("3611000", "Buffalo city", "36"),
        ("3663000", "Rochester city", "36"),
        ("3687000", "Yonkers city", "36"),
        ("3673000", "Syracuse city", "36"),
        ("3601000", "Albany city", "36"),
        # Florida
        ("1235000", "Jacksonville city", "12"),
        ("1245000", "Miami city", "12"),
        ("1271000", "Tampa city", "12"),
        ("1253000", "Orlando city", "12"),
        ("1270600", "St. Petersburg city", "12"),
        ("1232275", "Hialeah city", "12"),
        ("1257425", "Port St. Lucie city", "12"),
        ("1212875", "Cape Coral city", "12"),
        ("1273000", "Tallahassee city", "12"),
        ("1227400", "Fort Lauderdale city", "12"),
        # Illinois
        ("1714000", "Chicago city", "17"),
        ("1703012", "Aurora city", "17"),
        ("1765000", "Rockford city", "17"),
        ("1738570", "Joliet city", "17"),
        ("1751622", "Naperville city", "17"),
        ("1767886", "Springfield city", "17"),
        ("1757225", "Peoria city", "17"),
        ("1723074", "Elgin city", "17"),
        # Arizona
        ("0455000", "Phoenix city", "04"),
        ("0477000", "Tucson city", "04"),
        ("0446000", "Mesa city", "04"),
        ("0427400", "Gilbert town", "04"),
        ("0407940", "Chandler city", "04"),
        ("0273000", "Scottsdale city", "04"),
        ("0427820", "Glendale city", "04"),
        ("0473000", "Tempe city", "04"),
        # Pennsylvania
        ("4260000", "Philadelphia city", "42"),
        ("4261000", "Pittsburgh city", "42"),
        ("4202000", "Allentown city", "42"),
        ("4224000", "Erie city", "42"),
        ("4263624", "Reading city", "42"),
        ("4269000", "Scranton city", "42"),
        # Ohio
        ("3918000", "Columbus city", "39"),
        ("3916000", "Cleveland city", "39"),
        ("3915000", "Cincinnati city", "39"),
        ("3977000", "Toledo city", "39"),
        ("3901000", "Akron city", "39"),
        ("3921000", "Dayton city", "39"),
        # Georgia
        ("1304000", "Atlanta city", "13"),
        ("1303436", "Augusta-Richmond County", "13"),
        ("1319000", "Columbus city", "13"),
        ("1349000", "Macon-Bibb County", "13"),
        ("1367284", "Savannah city", "13"),
        # North Carolina
        ("3712000", "Charlotte city", "37"),
        ("3755000", "Raleigh city", "37"),
        ("3728000", "Greensboro city", "37"),
        ("3719000", "Durham city", "37"),
        ("3774000", "Winston-Salem city", "37"),
        ("3722920", "Fayetteville city", "37"),
        # Washington
        ("5363000", "Seattle city", "53"),
        ("5367000", "Spokane city", "53"),
        ("5374060", "Tacoma city", "53"),
        ("5375775", "Vancouver city", "53"),
        ("5307380", "Bellevue city", "53"),
        # Colorado
        ("0820000", "Denver city", "08"),
        ("0816000", "Colorado Springs city", "08"),
        ("0804000", "Aurora city", "08"),
        ("0827425", "Fort Collins city", "08"),
        ("0843000", "Lakewood city", "08"),
        # Massachusetts
        ("2507000", "Boston city", "25"),
        ("2567000", "Worcester city", "25"),
        ("2637000", "Springfield city", "25"),
        ("2545000", "Lowell city", "25"),
        ("2511000", "Cambridge city", "25"),
        # Others with reforms
        ("2743000", "Minneapolis city", "27"),
        ("2758000", "St. Paul city", "27"),
        ("5110000", "Richmond city", "51"),
        ("5147672", "Norfolk city", "51"),
        ("5182000", "Virginia Beach city", "51"),
        ("4159000", "Portland city", "41"),
        ("4123850", "Eugene city", "41"),
        ("3065000", "Helena city", "30"),
        ("3006550", "Billings city", "30"),
    ]

    places = []
    for fips, name, state_fips in cities:
        # Generate realistic random metrics
        recent_units = random.randint(50, 15000)
        growth_5yr = round(random.uniform(-15, 35), 1)
        mf_share = round(random.uniform(5, 65), 1)

        places.append({
            "place_fips": fips,
            "place_name": name,
            "state_fips": state_fips,
            "recent_units_2024": recent_units,
            "growth_rate_5yr": growth_5yr,
            "mf_share_recent": mf_share,
            "rank_permits_national": random.randint(1, 500),
            "rank_growth_national": random.randint(1, 500)
        })

    # Sort by permit volume descending
    places.sort(key=lambda x: x["recent_units_2024"], reverse=True)

    return places

def main():
    csv_path = 'data/outputs/place_metrics_comprehensive.csv'
    json_path = 'app/public/data/places.json'

    # Ensure output directory exists
    os.makedirs(os.path.dirname(json_path), exist_ok=True)

    if os.path.exists(csv_path):
        # Read the comprehensive metrics CSV
        search_cols = [
            'place_fips', 'place_name', 'state_fips', 'recent_units_2024',
            'growth_rate_5yr', 'mf_share_recent', 'rank_permits_national',
            'rank_growth_national'
        ]

        places = []
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                place = {}
                for col in search_cols:
                    if col in row:
                        val = row[col]
                        # Convert numeric fields
                        if col in ['recent_units_2024', 'rank_permits_national', 'rank_growth_national']:
                            place[col] = int(float(val)) if val else 0
                        elif col in ['growth_rate_5yr', 'mf_share_recent']:
                            place[col] = float(val) if val else 0.0
                        else:
                            place[col] = val or ''
                places.append(place)
        print(f"Loaded {len(places)} places from CSV")
    else:
        # Generate sample data
        places = generate_sample_places()
        print(f"Generated {len(places)} sample places (CSV not found)")

    # Write to public folder for client access
    with open(json_path, 'w') as f:
        json.dump(places, f)

    print(f"Created search index at {json_path}")
    print(f"File size: {os.path.getsize(json_path) / 1024:.1f} KB")

if __name__ == '__main__':
    main()
