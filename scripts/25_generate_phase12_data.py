#!/usr/bin/env python3
"""Generate sample data for Phase 1.2 MVP"""

import json
import os
import random
import pandas as pd
from pathlib import Path

# Sample cities with realistic data
SAMPLE_PLACES = [
    # Major cities
    {"place_fips": "0644000", "place_name": "Los Angeles", "state_fips": "06", "state_name": "California", "population": 3898747},
    {"place_fips": "3651000", "place_name": "New York City", "state_fips": "36", "state_name": "New York", "population": 8336817},
    {"place_fips": "1714000", "place_name": "Chicago", "state_fips": "17", "state_name": "Illinois", "population": 2693976},
    {"place_fips": "4835000", "place_name": "Houston", "state_fips": "48", "state_name": "Texas", "population": 2304580},
    {"place_fips": "0404000", "place_name": "Phoenix", "state_fips": "04", "state_name": "Arizona", "population": 1608139},
    {"place_fips": "4260000", "place_name": "Philadelphia", "state_fips": "42", "state_name": "Pennsylvania", "population": 1603797},
    {"place_fips": "4865000", "place_name": "San Antonio", "state_fips": "48", "state_name": "Texas", "population": 1547253},
    {"place_fips": "0666000", "place_name": "San Diego", "state_fips": "06", "state_name": "California", "population": 1386932},
    {"place_fips": "4819000", "place_name": "Dallas", "state_fips": "48", "state_name": "Texas", "population": 1304379},
    {"place_fips": "0668000", "place_name": "San Jose", "state_fips": "06", "state_name": "California", "population": 1013240},
    # Reform cities
    {"place_fips": "4805000", "place_name": "Austin", "state_fips": "48", "state_name": "Texas", "population": 978908},
    {"place_fips": "2743000", "place_name": "Minneapolis", "state_fips": "27", "state_name": "Minnesota", "population": 429954},
    {"place_fips": "4159000", "place_name": "Portland", "state_fips": "41", "state_name": "Oregon", "population": 652503},
    {"place_fips": "5363000", "place_name": "Seattle", "state_fips": "53", "state_name": "Washington", "population": 737015},
    {"place_fips": "0820000", "place_name": "Denver", "state_fips": "08", "state_name": "Colorado", "population": 715522},
    {"place_fips": "0667000", "place_name": "San Francisco", "state_fips": "06", "state_name": "California", "population": 873965},
    {"place_fips": "0606000", "place_name": "Berkeley", "state_fips": "06", "state_name": "California", "population": 124321},
    {"place_fips": "0653000", "place_name": "Oakland", "state_fips": "06", "state_name": "California", "population": 433031},
    {"place_fips": "0664000", "place_name": "Sacramento", "state_fips": "06", "state_name": "California", "population": 524943},
    {"place_fips": "3712000", "place_name": "Charlotte", "state_fips": "37", "state_name": "North Carolina", "population": 879709},
    # More cities
    {"place_fips": "1304000", "place_name": "Atlanta", "state_fips": "13", "state_name": "Georgia", "population": 498715},
    {"place_fips": "2511000", "place_name": "Boston", "state_fips": "25", "state_name": "Massachusetts", "population": 675647},
    {"place_fips": "2255000", "place_name": "New Orleans", "state_fips": "22", "state_name": "Louisiana", "population": 391006},
    {"place_fips": "3755000", "place_name": "Raleigh", "state_fips": "37", "state_name": "North Carolina", "population": 474069},
    {"place_fips": "4752006", "place_name": "Nashville", "state_fips": "47", "state_name": "Tennessee", "population": 689447},
    {"place_fips": "4967000", "place_name": "Salt Lake City", "state_fips": "49", "state_name": "Utah", "population": 199723},
    {"place_fips": "0471000", "place_name": "Tucson", "state_fips": "04", "state_name": "Arizona", "population": 542629},
    {"place_fips": "3535000", "place_name": "Albuquerque", "state_fips": "35", "state_name": "New Mexico", "population": 564559},
    {"place_fips": "0803000", "place_name": "Boulder", "state_fips": "08", "state_name": "Colorado", "population": 105673},
    {"place_fips": "4021000", "place_name": "Eugene", "state_fips": "41", "state_name": "Oregon", "population": 176654},
    # Additional diverse cities
    {"place_fips": "1245000", "place_name": "Miami", "state_fips": "12", "state_name": "Florida", "population": 442241},
    {"place_fips": "2507000", "place_name": "Cambridge", "state_fips": "25", "state_name": "Massachusetts", "population": 118403},
    {"place_fips": "5114000", "place_name": "Alexandria", "state_fips": "51", "state_name": "Virginia", "population": 159467},
    {"place_fips": "2507000", "place_name": "Somerville", "state_fips": "25", "state_name": "Massachusetts", "population": 81360},
    {"place_fips": "5340850", "place_name": "Spokane", "state_fips": "53", "state_name": "Washington", "population": 222081},
    {"place_fips": "0643000", "place_name": "Long Beach", "state_fips": "06", "state_name": "California", "population": 466742},
    {"place_fips": "2622000", "place_name": "Detroit", "state_fips": "26", "state_name": "Michigan", "population": 639111},
    {"place_fips": "2765000", "place_name": "St. Paul", "state_fips": "27", "state_name": "Minnesota", "population": 311527},
    {"place_fips": "0955000", "place_name": "Hartford", "state_fips": "09", "state_name": "Connecticut", "population": 121054},
    {"place_fips": "3431000", "place_name": "Jersey City", "state_fips": "34", "state_name": "New Jersey", "population": 292449},
]

def generate_permits_data(places):
    """Generate permit history for each place"""
    records = []
    years = list(range(2015, 2025))

    for place in places:
        base_sf = random.randint(100, 5000)
        base_mf = random.randint(50, 3000)

        for year in years:
            # Add some randomness and growth trend
            growth = 1 + (year - 2015) * 0.02 + random.uniform(-0.15, 0.15)
            sf = int(base_sf * growth)
            mf = int(base_mf * growth * (1 + random.uniform(-0.3, 0.5)))

            records.append({
                "place_fips": place["place_fips"],
                "year": year,
                "single_family": max(0, sf),
                "multi_family": max(0, mf),
                "total_units": max(0, sf + mf)
            })

    return pd.DataFrame(records)

def generate_place_metrics(places, permits_df):
    """Generate comprehensive metrics for each place"""
    metrics = []

    for place in places:
        place_permits = permits_df[permits_df["place_fips"] == place["place_fips"]]

        if len(place_permits) == 0:
            continue

        # Calculate metrics
        recent = place_permits[place_permits["year"] >= 2020]
        historical = place_permits[place_permits["year"] < 2020]

        recent_total = recent["total_units"].sum()
        recent_sf = recent["single_family"].sum()
        recent_mf = recent["multi_family"].sum()

        units_2024 = place_permits[place_permits["year"] == 2024]["total_units"].sum()
        units_2019 = place_permits[place_permits["year"] == 2019]["total_units"].sum()

        if units_2019 > 0:
            growth_rate = ((units_2024 / units_2019) ** 0.2 - 1) * 100
        else:
            growth_rate = 0

        mf_share = (recent_mf / recent_total * 100) if recent_total > 0 else 0

        metrics.append({
            "place_fips": place["place_fips"],
            "place_name": place["place_name"],
            "state_fips": place["state_fips"],
            "state_name": place["state_name"],
            "population": place["population"],
            "recent_units_2024": int(units_2024),
            "total_units_5yr": int(recent_total),
            "growth_rate_5yr": round(growth_rate, 2),
            "mf_share_recent": round(mf_share, 1),
            "sf_units_5yr": int(recent_sf),
            "mf_units_5yr": int(recent_mf),
        })

    return pd.DataFrame(metrics)

def generate_search_index(metrics_df):
    """Generate search index for PlaceSearch component"""
    places = []

    for _, row in metrics_df.iterrows():
        places.append({
            "place_fips": row["place_fips"],
            "place_name": row["place_name"],
            "state_fips": row["state_fips"],
            "state_name": row["state_name"],
            "recent_units_2024": int(row["recent_units_2024"]),
            "growth_rate_5yr": float(row["growth_rate_5yr"]),
            "mf_share_recent": float(row["mf_share_recent"]),
        })

    return places

def main():
    print("Generating Phase 1.2 sample data...")

    # Create directories
    os.makedirs("data/outputs", exist_ok=True)
    os.makedirs("app/public/data", exist_ok=True)

    # Generate permits
    permits_df = generate_permits_data(SAMPLE_PLACES)
    permits_df.to_csv("data/raw/census_bps_place_annual_permits.csv", index=False)
    print(f"✓ Generated {len(permits_df)} permit records")

    # Generate metrics
    metrics_df = generate_place_metrics(SAMPLE_PLACES, permits_df)
    metrics_df.to_csv("data/outputs/place_metrics_comprehensive.csv", index=False)
    print(f"✓ Generated metrics for {len(metrics_df)} places")

    # Generate search index
    search_index = generate_search_index(metrics_df)
    with open("app/public/data/places.json", "w") as f:
        json.dump(search_index, f)
    print(f"✓ Generated search index with {len(search_index)} places")

    # Expand reforms
    reforms_df = pd.read_csv("data/raw/city_reforms.csv")
    reforms_df.to_csv("data/raw/city_reforms_expanded.csv", index=False)
    print(f"✓ Copied {len(reforms_df)} reforms to expanded file")

    print("\n✓ Phase 1.2 data generation complete!")

if __name__ == "__main__":
    main()
