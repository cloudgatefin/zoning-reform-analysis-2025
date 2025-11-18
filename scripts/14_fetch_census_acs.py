"""
Fetch Census ACS (American Community Survey) demographic data for all 50 states
Source: Census Bureau ACS 5-Year Estimates
Features: Median household income, homeownership rate, population density,
          urbanization level, rental vacancy rate, median rent, housing units per capita
Output: data/processed/census_demographic_data.csv
"""

import os
import pandas as pd
import requests
import numpy as np
from time import sleep

# Census API endpoint (ACS 5-Year Estimates)
# Note: Census API doesn't require a key for small-scale queries, but may be rate-limited
CENSUS_BASE_URL = "https://api.census.gov/data"

OUTPUT_FILE = "data/processed/census_demographic_data.csv"

# State FIPS codes
STATE_FIPS = {
    '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas', '06': 'California',
    '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware', '11': 'District of Columbia',
    '12': 'Florida', '13': 'Georgia', '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois',
    '18': 'Indiana', '19': 'Iowa', '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana',
    '23': 'Maine', '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
    '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska', '32': 'Nevada',
    '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico', '36': 'New York',
    '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio', '40': 'Oklahoma', '41': 'Oregon',
    '42': 'Pennsylvania', '44': 'Rhode Island', '45': 'South Carolina', '46': 'South Dakota',
    '47': 'Tennessee', '48': 'Texas', '49': 'Utah', '50': 'Vermont', '51': 'Virginia',
    '53': 'Washington', '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming'
}

# ACS Variable codes
# See: https://api.census.gov/data/2022/acs/acs5/variables.html
ACS_VARIABLES = {
    'B19013_001E': 'median_household_income',  # Median household income
    'B25064_001E': 'median_rent',  # Median gross rent
    'B25003_002E': 'owner_occupied_units',  # Owner-occupied housing units
    'B25003_001E': 'total_occupied_units',  # Total occupied housing units
    'B25002_003E': 'rental_vacancy',  # Rental vacancy
    'B25004_001E': 'total_vacancy',  # Total vacancy for rate calculation
    'B01003_001E': 'total_population',  # Total population
    'B25001_001E': 'total_housing_units',  # Total housing units
}


def fetch_acs_data_for_year(year, variables):
    """Fetch ACS data for a specific year"""
    var_string = ','.join(variables.keys())
    url = f"{CENSUS_BASE_URL}/{year}/acs/acs5"

    params = {
        'get': f"NAME,{var_string}",
        'for': 'state:*'
    }

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        # Convert to DataFrame
        df = pd.DataFrame(data[1:], columns=data[0])

        # Rename columns
        for var_code, var_name in variables.items():
            if var_code in df.columns:
                df[var_name] = pd.to_numeric(df[var_code], errors='coerce')
                df = df.drop(columns=[var_code])

        df['year'] = year
        df['state_fips'] = df['state']
        df['state_name'] = df['NAME']

        return df

    except Exception as e:
        print(f"  ⚠️ Error fetching {year} data: {e}")
        return pd.DataFrame()


def calculate_derived_metrics(df):
    """Calculate derived metrics from raw ACS variables"""
    # Homeownership rate
    df['homeownership_rate'] = (
        df['owner_occupied_units'] / df['total_occupied_units'] * 100
    ).round(2)

    # Rental vacancy rate
    df['rental_vacancy_rate'] = (
        df['rental_vacancy'] / df['total_vacancy'] * 100
    ).fillna(0).round(2)

    # Population density (per square mile) - we'll compute this separately from land area
    # For now, we'll use population as-is and calculate density in the compiler

    # Housing units per capita
    df['housing_units_per_capita'] = (
        df['total_housing_units'] / df['total_population']
    ).round(4)

    # Urbanization level - we'll fetch this separately from census urban/rural data
    # For now, we'll use population density as a proxy

    return df


def fetch_census_urban_data():
    """
    Fetch urbanization data (% urban population) for states
    This uses a different Census endpoint for urban/rural classification
    Note: This is approximate and may need manual adjustment
    """
    # For simplicity, we'll use 2020 Census urban/rural data
    # In a production system, you would query the actual urban/rural tables

    # Approximate urbanization levels based on 2020 Census data
    # Source: https://www.census.gov/programs-surveys/geography/guidance/geo-areas/urban-rural.html
    urbanization_data = {
        'California': 95.0, 'New Jersey': 94.7, 'Nevada': 94.2, 'Massachusetts': 92.0,
        'Rhode Island': 90.9, 'Florida': 91.2, 'New York': 87.9, 'Illinois': 88.5,
        'Connecticut': 88.0, 'Maryland': 87.2, 'Arizona': 89.8, 'Utah': 90.6,
        'Colorado': 86.2, 'Hawaii': 91.9, 'Texas': 84.7, 'Washington': 84.1,
        'Delaware': 83.3, 'Oregon': 81.0, 'Pennsylvania': 78.7, 'Michigan': 74.6,
        'Ohio': 77.9, 'Georgia': 75.1, 'Virginia': 75.5, 'North Carolina': 66.1,
        'Minnesota': 73.3, 'Indiana': 72.4, 'Wisconsin': 70.2, 'Tennessee': 66.4,
        'Missouri': 70.4, 'Louisiana': 73.2, 'South Carolina': 66.3, 'New Mexico': 77.4,
        'Alabama': 59.0, 'Kentucky': 58.4, 'Oklahoma': 66.2, 'Kansas': 74.2,
        'Nebraska': 73.1, 'Iowa': 64.0, 'Arkansas': 56.2, 'Idaho': 70.6,
        'New Hampshire': 60.3, 'Alaska': 66.0, 'West Virginia': 48.7, 'Mississippi': 49.4,
        'South Dakota': 56.7, 'North Dakota': 59.9, 'Montana': 55.9, 'Wyoming': 64.7,
        'Vermont': 38.9, 'Maine': 38.7
    }

    return pd.DataFrame([
        {'state_name': state, 'urbanization_pct': pct}
        for state, pct in urbanization_data.items()
    ])


def fetch_state_land_area():
    """
    Fetch state land area data to calculate population density
    Using approximate 2020 Census land area in square miles
    """
    land_area_sq_mi = {
        'Alabama': 50645, 'Alaska': 570641, 'Arizona': 113594, 'Arkansas': 52035,
        'California': 155779, 'Colorado': 103642, 'Connecticut': 4842, 'Delaware': 1949,
        'Florida': 53625, 'Georgia': 57513, 'Hawaii': 6423, 'Idaho': 82643,
        'Illinois': 55519, 'Indiana': 35826, 'Iowa': 55857, 'Kansas': 81759,
        'Kentucky': 39486, 'Louisiana': 43204, 'Maine': 30843, 'Maryland': 9707,
        'Massachusetts': 7800, 'Michigan': 56539, 'Minnesota': 79627, 'Mississippi': 46923,
        'Missouri': 68742, 'Montana': 145546, 'Nebraska': 76824, 'Nevada': 109781,
        'New Hampshire': 8953, 'New Jersey': 7354, 'New Mexico': 121298, 'New York': 47126,
        'North Carolina': 48618, 'North Dakota': 69001, 'Ohio': 40861, 'Oklahoma': 68595,
        'Oregon': 95988, 'Pennsylvania': 44743, 'Rhode Island': 1034, 'South Carolina': 30061,
        'South Dakota': 75811, 'Tennessee': 41235, 'Texas': 261232, 'Utah': 82170,
        'Vermont': 9217, 'Virginia': 39490, 'Washington': 66456, 'West Virginia': 24038,
        'Wisconsin': 54158, 'Wyoming': 97093
    }

    return pd.DataFrame([
        {'state_name': state, 'land_area_sq_mi': area}
        for state, area in land_area_sq_mi.items()
    ])


def fetch_census_fallback_data():
    """
    Fallback: Use publicly available Census demographic data
    Based on ACS 5-Year Estimates and Census Bureau publications
    """
    print("Using fallback Census demographic data from public sources...")

    # Create comprehensive state demographic data
    state_data = []

    state_demographics = {
        'Alabama': {'income': 56929, 'rent': 850, 'homeowner': 69.3, 'vacancy': 11.2, 'pop': 5074296, 'housing': 2317678, 'urban': 59.0},
        'Alaska': {'income': 84356, 'rent': 1285, 'homeowner': 64.6, 'vacancy': 9.8, 'pop': 733583, 'housing': 318582, 'urban': 66.0},
        'Arizona': {'income': 72581, 'rent': 1320, 'homeowner': 63.9, 'vacancy': 9.5, 'pop': 7359197, 'housing': 3212528},
        'Arkansas': {'income': 52528, 'rent': 830, 'homeowner': 66.9, 'vacancy': 11.8, 'pop': 3045637, 'housing': 1427096},
        'California': {'income': 84097, 'rent': 1880, 'homeowner': 54.9, 'vacancy': 4.8, 'pop': 39029342, 'housing': 14450174},
        'Colorado': {'income': 84954, 'rent': 1530, 'homeowner': 65.4, 'vacancy': 6.2, 'pop': 5839926, 'housing': 2541880},
        'Connecticut': {'income': 83771, 'rent': 1385, 'homeowner': 66.3, 'vacancy': 7.5, 'pop': 3626205, 'housing': 1542774},
        'Delaware': {'income': 72724, 'rent': 1295, 'homeowner': 71.2, 'vacancy': 9.1, 'pop': 1018396, 'housing': 464152},
        'Florida': {'income': 63062, 'rent': 1495, 'homeowner': 66.2, 'vacancy': 12.5, 'pop': 22244823, 'housing': 10553733},
        'Georgia': {'income': 71355, 'rent': 1295, 'homeowner': 64.3, 'vacancy': 10.2, 'pop': 10912876, 'housing': 4564012},
        'Hawaii': {'income': 88005, 'rent': 1820, 'homeowner': 59.3, 'vacancy': 7.8, 'pop': 1440196, 'housing': 560123},
        'Idaho': {'income': 65301, 'rent': 1095, 'homeowner': 70.4, 'vacancy': 6.9, 'pop': 1939033, 'housing': 794947},
        'Illinois': {'income': 72205, 'rent': 1230, 'homeowner': 65.4, 'vacancy': 8.7, 'pop': 12582032, 'housing': 5347251},
        'Indiana': {'income': 62743, 'rent': 975, 'homeowner': 69.6, 'vacancy': 9.5, 'pop': 6833037, 'housing': 2964691},
        'Iowa': {'income': 65429, 'rent': 905, 'homeowner': 71.3, 'vacancy': 8.2, 'pop': 3200517, 'housing': 1396852},
        'Kansas': {'income': 66425, 'rent': 945, 'homeowner': 66.7, 'vacancy': 9.1, 'pop': 2937150, 'housing': 1270754},
        'Kentucky': {'income': 58291, 'rent': 895, 'homeowner': 67.3, 'vacancy': 11.2, 'pop': 4512310, 'housing': 2016367},
        'Louisiana': {'income': 54622, 'rent': 980, 'homeowner': 67.2, 'vacancy': 12.8, 'pop': 4590241, 'housing': 2029993},
        'Maine': {'income': 63944, 'rent': 1095, 'homeowner': 72.8, 'vacancy': 13.5, 'pop': 1385340, 'housing': 740844},
        'Maryland': {'income': 90203, 'rent': 1630, 'homeowner': 67.2, 'vacancy': 7.8, 'pop': 6177224, 'housing': 2517365},
        'Massachusetts': {'income': 89026, 'rent': 1635, 'homeowner': 62.5, 'vacancy': 6.1, 'pop': 7029917, 'housing': 2964694},
        'Michigan': {'income': 63498, 'rent': 1035, 'homeowner': 72.4, 'vacancy': 11.5, 'pop': 10034113, 'housing': 4627863},
        'Minnesota': {'income': 77720, 'rent': 1195, 'homeowner': 71.2, 'vacancy': 6.8, 'pop': 5717184, 'housing': 2476685},
        'Mississippi': {'income': 49111, 'rent': 840, 'homeowner': 68.7, 'vacancy': 13.2, 'pop': 2940057, 'housing': 1339449},
        'Missouri': {'income': 61043, 'rent': 975, 'homeowner': 67.1, 'vacancy': 10.5, 'pop': 6177957, 'housing': 2793611},
        'Montana': {'income': 60560, 'rent': 975, 'homeowner': 68.4, 'vacancy': 10.2, 'pop': 1122867, 'housing': 549026},
        'Nebraska': {'income': 66817, 'rent': 945, 'homeowner': 67.1, 'vacancy': 7.8, 'pop': 1967923, 'housing': 843396},
        'Nevada': {'income': 68950, 'rent': 1355, 'homeowner': 58.1, 'vacancy': 10.8, 'pop': 3177772, 'housing': 1314245},
        'New Hampshire': {'income': 83449, 'rent': 1365, 'homeowner': 71.6, 'vacancy': 7.2, 'pop': 1395231, 'housing': 648456},
        'New Jersey': {'income': 89703, 'rent': 1540, 'homeowner': 64.7, 'vacancy': 6.8, 'pop': 9261699, 'housing': 3649329},
        'New Mexico': {'income': 54449, 'rent': 975, 'homeowner': 68.1, 'vacancy': 11.5, 'pop': 2113344, 'housing': 950691},
        'New York': {'income': 74314, 'rent': 1545, 'homeowner': 53.9, 'vacancy': 7.2, 'pop': 19835913, 'housing': 8450034},
        'North Carolina': {'income': 63472, 'rent': 1145, 'homeowner': 65.3, 'vacancy': 10.8, 'pop': 10698973, 'housing': 4745422},
        'North Dakota': {'income': 68882, 'rent': 920, 'homeowner': 63.8, 'vacancy': 8.5, 'pop': 779094, 'housing': 369006},
        'Ohio': {'income': 62262, 'rent': 985, 'homeowner': 67.7, 'vacancy': 10.2, 'pop': 11799448, 'housing': 5283227},
        'Oklahoma': {'income': 58208, 'rent': 925, 'homeowner': 66.8, 'vacancy': 10.5, 'pop': 4019800, 'housing': 1763713},
        'Oregon': {'income': 70084, 'rent': 1295, 'homeowner': 62.9, 'vacancy': 6.8, 'pop': 4240137, 'housing': 1807406},
        'Pennsylvania': {'income': 68957, 'rent': 1145, 'homeowner': 69.6, 'vacancy': 9.5, 'pop': 13002700, 'housing': 5747710},
        'Rhode Island': {'income': 74008, 'rent': 1310, 'homeowner': 61.5, 'vacancy': 7.8, 'pop': 1093734, 'housing': 481991},
        'South Carolina': {'income': 61382, 'rent': 1145, 'homeowner': 70.4, 'vacancy': 13.2, 'pop': 5282634, 'housing': 2431165},
        'South Dakota': {'income': 63920, 'rent': 875, 'homeowner': 68.2, 'vacancy': 8.8, 'pop': 909824, 'housing': 397883},
        'Tennessee': {'income': 61929, 'rent': 1095, 'homeowner': 67.2, 'vacancy': 11.5, 'pop': 7051339, 'housing': 3133883},
        'Texas': {'income': 67321, 'rent': 1245, 'homeowner': 62.6, 'vacancy': 9.8, 'pop': 30029572, 'housing': 11914429},
        'Utah': {'income': 79133, 'rent': 1315, 'homeowner': 71.5, 'vacancy': 5.2, 'pop': 3380800, 'housing': 1185708},
        'Vermont': {'income': 67674, 'rent': 1245, 'homeowner': 71.4, 'vacancy': 13.8, 'pop': 647064, 'housing': 342337},
        'Virginia': {'income': 80268, 'rent': 1485, 'homeowner': 67.1, 'vacancy': 8.2, 'pop': 8683619, 'housing': 3574345},
        'Washington': {'income': 82400, 'rent': 1495, 'homeowner': 63.6, 'vacancy': 6.5, 'pop': 7785786, 'housing': 3221042},
        'West Virginia': {'income': 51615, 'rent': 795, 'homeowner': 73.4, 'vacancy': 14.2, 'pop': 1775156, 'housing': 881917},
        'Wisconsin': {'income': 67125, 'rent': 1035, 'homeowner': 68.4, 'vacancy': 8.5, 'pop': 5895908, 'housing': 2706290},
        'Wyoming': {'income': 68002, 'rent': 975, 'homeowner': 69.8, 'vacancy': 10.2, 'pop': 576851, 'housing': 274159},
    }

    # Get urbanization and land area data
    urban_dict = {row['state_name']: row['urbanization_pct']
                  for _, row in fetch_census_urban_data().iterrows()}
    area_dict = {row['state_name']: row['land_area_sq_mi']
                 for _, row in fetch_state_land_area().iterrows()}

    for state_name, data in state_demographics.items():
        land_area = area_dict.get(state_name, 1)
        urbanization = urban_dict.get(state_name, data.get('urban', 50.0))

        state_data.append({
            'state_name': state_name,
            'state_fips': '',  # Not needed for our analysis
            'median_household_income_2024': round(data['income'] * 1.08, 0),  # Adjust to 2024 dollars
            'median_rent_2024': round(data['rent'] * 1.08, 0),
            'homeownership_rate': round(data['homeowner'], 2),
            'rental_vacancy_rate': round(data['vacancy'], 2),
            'population_density': round(data['pop'] / land_area, 2),
            'urbanization_pct': urbanization,
            'housing_units_per_capita': round(data['housing'] / data['pop'], 4),
            'total_population': data['pop'],
            'total_housing_units': data['housing'],
        })

    df = pd.DataFrame(state_data)
    return df


def main():
    """Main execution"""
    print("Fetching Census ACS demographic data...")

    # Try to fetch from API first
    years_to_fetch = [2019, 2022]  # 2019 (pre-pandemic baseline) and 2022 (latest stable)

    all_data = []

    for year in years_to_fetch:
        print(f"\nFetching {year} ACS data...")
        df = fetch_acs_data_for_year(year, ACS_VARIABLES)

        if not df.empty:
            df = calculate_derived_metrics(df)
            all_data.append(df)
            print(f"  ✅ Fetched data for {len(df)} states")
            sleep(1)  # Be nice to the API

    if not all_data:
        print("❌ No data fetched from API, using fallback data...")
        final_df = fetch_census_fallback_data()

        # Select final columns
        output_columns = [
            'state_name',
            'state_fips',
            'median_household_income_2024',
            'median_rent_2024',
            'homeownership_rate',
            'rental_vacancy_rate',
            'population_density',
            'urbanization_pct',
            'housing_units_per_capita',
            'total_population',
            'total_housing_units',
        ]

        final_df = final_df[output_columns].copy()

        # Save to CSV
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        final_df.to_csv(OUTPUT_FILE, index=False)

        print(f"\n✅ Saved Census ACS data → {OUTPUT_FILE}")
        print(f"\nSample data (first 5 states):")
        print(final_df[['state_name', 'median_household_income_2024', 'homeownership_rate', 'urbanization_pct']].head())
        print(f"\nSummary statistics:")
        print(f"  States with data: {len(final_df)}")
        print(f"  Avg median income (2024$): ${final_df['median_household_income_2024'].mean():,.0f}")
        print(f"  Avg homeownership rate: {final_df['homeownership_rate'].mean():.1f}%")
        print(f"  Avg urbanization: {final_df['urbanization_pct'].mean():.1f}%")
        return

    # Combine years and calculate averages
    combined = pd.concat(all_data, ignore_index=True)

    # Use latest year as primary, but fill gaps with earlier years
    latest_year = max(years_to_fetch)
    state_data = combined[combined['year'] == latest_year].copy()

    # If any states missing, fill from earlier year
    if len(state_data) < 50:
        earlier_data = combined[combined['year'] != latest_year]
        missing_states = set(earlier_data['state_name']) - set(state_data['state_name'])
        state_data = pd.concat([
            state_data,
            earlier_data[earlier_data['state_name'].isin(missing_states)]
        ], ignore_index=True)

    # Add urbanization data
    urban_df = fetch_census_urban_data()
    state_data = state_data.merge(urban_df, on='state_name', how='left')

    # Add land area and calculate population density
    area_df = fetch_state_land_area()
    state_data = state_data.merge(area_df, on='state_name', how='left')

    state_data['population_density'] = (
        state_data['total_population'] / state_data['land_area_sq_mi']
    ).round(2)

    # Adjust income for inflation to 2024 dollars
    # Simple CPI adjustment: 2019 -> 2024 ~15%, 2022 -> 2024 ~8%
    inflation_adj = {2019: 1.15, 2022: 1.08}
    state_data['median_household_income_2024'] = (
        state_data['median_household_income'] * state_data['year'].map(inflation_adj)
    ).round(0)

    state_data['median_rent_2024'] = (
        state_data['median_rent'] * state_data['year'].map(inflation_adj)
    ).round(0)

    # Select final columns
    output_columns = [
        'state_name',
        'state_fips',
        'median_household_income_2024',
        'median_rent_2024',
        'homeownership_rate',
        'rental_vacancy_rate',
        'population_density',
        'urbanization_pct',
        'housing_units_per_capita',
        'total_population',
        'total_housing_units',
    ]

    final_df = state_data[output_columns].copy()

    # Ensure District of Columbia is excluded (we want 50 states only)
    final_df = final_df[final_df['state_name'] != 'District of Columbia']

    # Save to CSV
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    final_df.to_csv(OUTPUT_FILE, index=False)

    print(f"\n✅ Saved Census ACS data → {OUTPUT_FILE}")
    print(f"\nSample data (first 5 states):")
    print(final_df[['state_name', 'median_household_income_2024', 'homeownership_rate', 'urbanization_pct']].head())
    print(f"\nSummary statistics:")
    print(f"  States with data: {len(final_df)}")
    print(f"  Avg median income (2024$): ${final_df['median_household_income_2024'].mean():,.0f}")
    print(f"  Avg homeownership rate: {final_df['homeownership_rate'].mean():.1f}%")
    print(f"  Avg urbanization: {final_df['urbanization_pct'].mean():.1f}%")


if __name__ == "__main__":
    main()
