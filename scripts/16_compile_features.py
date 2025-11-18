"""
Compile comprehensive feature dataset from all data sources
Merges: Zillow housing data, Census ACS demographics, BLS unemployment, political data
Includes: Feature engineering, normalization, and missing data handling
Output: data/outputs/state_features_comprehensive.csv
"""

import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

# Input files
ZILLOW_FILE = "data/processed/zillow_state_prices.csv"
CENSUS_FILE = "data/processed/census_demographic_data.csv"
UNEMPLOYMENT_FILE = "data/processed/unemployment_political_data.csv"
REFORM_METRICS_FILE = "visualizations/data/reform_impact_metrics.csv"

# Output file
OUTPUT_FILE = "data/outputs/state_features_comprehensive.csv"


def load_and_merge_data():
    """Load all data sources and merge on state name"""

    print("Loading data files...")

    # Load Zillow data
    try:
        zillow_df = pd.read_csv(ZILLOW_FILE)
        print(f"  ✅ Loaded Zillow data: {len(zillow_df)} rows")
    except FileNotFoundError:
        print(f"  ⚠️ Zillow file not found: {ZILLOW_FILE}")
        zillow_df = pd.DataFrame()

    # Load Census data
    try:
        census_df = pd.read_csv(CENSUS_FILE)
        # Rename state_name to state for consistency
        census_df = census_df.rename(columns={'state_name': 'state'})
        print(f"  ✅ Loaded Census data: {len(census_df)} rows")
    except FileNotFoundError:
        print(f"  ⚠️ Census file not found: {CENSUS_FILE}")
        census_df = pd.DataFrame()

    # Load unemployment/political data
    try:
        unemployment_df = pd.read_csv(UNEMPLOYMENT_FILE)
        unemployment_df = unemployment_df.rename(columns={'state_name': 'state'})
        print(f"  ✅ Loaded unemployment/political data: {len(unemployment_df)} rows")
    except FileNotFoundError:
        print(f"  ⚠️ Unemployment file not found: {UNEMPLOYMENT_FILE}")
        unemployment_df = pd.DataFrame()

    # Load reform metrics to get state-level permit changes
    try:
        reform_df = pd.read_csv(REFORM_METRICS_FILE)
        # Aggregate by state (jurisdiction is state name)
        state_reform = reform_df.groupby('jurisdiction').agg({
            'percent_change': 'mean',
            'absolute_change': 'mean',
            'pre_mean_permits': 'mean',
            'post_mean_permits': 'mean'
        }).reset_index()
        state_reform = state_reform.rename(columns={'jurisdiction': 'state'})
        print(f"  ✅ Loaded reform metrics: {len(state_reform)} states")
    except FileNotFoundError:
        print(f"  ⚠️ Reform metrics file not found: {REFORM_METRICS_FILE}")
        state_reform = pd.DataFrame()

    # Start with Zillow as base (all 50 states)
    if zillow_df.empty:
        print("❌ No Zillow data available")
        return pd.DataFrame()

    merged = zillow_df.copy()

    # Merge Census data
    if not census_df.empty:
        merged = merged.merge(census_df, on='state', how='left')

    # Merge unemployment/political data
    if not unemployment_df.empty:
        merged = merged.merge(unemployment_df, on='state', how='left')

    # Merge reform metrics (if available)
    if not state_reform.empty:
        merged = merged.merge(state_reform, on='state', how='left', suffixes=('', '_reform'))

    print(f"\n✅ Merged dataset: {len(merged)} states, {len(merged.columns)} columns")

    return merged


def engineer_features(df):
    """Create derived features and handle missing data"""

    print("\nEngineering features...")

    # Create additional derived features
    if 'zhvi_2024' in df.columns and 'median_household_income_2024' in df.columns:
        df['price_to_income_ratio'] = (
            df['zhvi_2024'] / df['median_household_income_2024']
        ).round(2)

    if 'median_rent_2024' in df.columns and 'median_household_income_2024' in df.columns:
        df['rent_burden'] = (
            df['median_rent_2024'] * 12 / df['median_household_income_2024'] * 100
        ).round(2)

    if 'total_housing_units' in df.columns and 'total_population' in df.columns:
        df['housing_supply_index'] = (
            df['total_housing_units'] / df['total_population'] * 1000
        ).round(2)

    # Housing affordability index (lower = less affordable)
    if 'median_household_income_2024' in df.columns and 'zhvi_2024' in df.columns:
        df['affordability_index'] = (
            df['median_household_income_2024'] / df['zhvi_2024'] * 100
        ).round(2)

    # Economic growth indicator (inverse of unemployment change)
    if 'unemployment_change_2015_2024' in df.columns:
        df['economic_growth_indicator'] = -df['unemployment_change_2015_2024']

    # Political lean (numeric): convert category to numeric score
    if 'political_lean_score' in df.columns:
        # Already numeric, but let's ensure it's properly scaled
        pass

    # Create permit growth rate if available
    if 'pre_mean_permits' in df.columns and 'post_mean_permits' in df.columns:
        df['permit_growth_rate'] = (
            (df['post_mean_permits'] - df['pre_mean_permits']) / df['pre_mean_permits'] * 100
        ).round(2)

    print(f"  ✅ Created derived features")

    return df


def handle_missing_data(df):
    """Handle missing values through imputation and forward-fill"""

    print("\nHandling missing data...")

    # Count missing values before
    missing_before = df.isnull().sum().sum()

    # For numeric columns, use median imputation
    numeric_cols = df.select_dtypes(include=[np.number]).columns

    for col in numeric_cols:
        if df[col].isnull().any():
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"  • Imputed {col} with median: {median_val:.2f}")

    # For categorical columns, use mode
    categorical_cols = df.select_dtypes(include=['object']).columns

    for col in categorical_cols:
        if df[col].isnull().any():
            mode_val = df[col].mode()[0] if not df[col].mode().empty else 'Unknown'
            df[col] = df[col].fillna(mode_val)
            print(f"  • Imputed {col} with mode: {mode_val}")

    missing_after = df.isnull().sum().sum()
    print(f"  ✅ Missing values: {missing_before} → {missing_after}")

    return df


def normalize_features(df):
    """Standardize continuous features (z-score normalization)"""

    print("\nNormalizing features...")

    # Identify features to normalize (exclude identifiers and categorical)
    exclude_cols = ['state', 'state_abbrev', 'state_fips', 'political_category']

    # Get numeric columns for normalization
    numeric_cols = [
        col for col in df.select_dtypes(include=[np.number]).columns
        if col not in exclude_cols
    ]

    # Create normalized versions
    scaler = StandardScaler()

    for col in numeric_cols:
        if df[col].notna().any():
            normalized_col = f"{col}_normalized"
            # Reshape for sklearn
            values = df[col].values.reshape(-1, 1)
            df[normalized_col] = scaler.fit_transform(values)
            df[normalized_col] = df[normalized_col].round(4)

    print(f"  ✅ Normalized {len(numeric_cols)} features")

    return df


def select_final_features(df):
    """Select and order final feature columns"""

    # Define the core features we want for ML
    core_features = [
        # Identifiers
        'state',
        'state_abbrev',

        # Housing prices (Zillow)
        'zhvi_2024',
        'zhvi_cagr',
        'zhvi_volatility',

        # Demographics (Census)
        'median_household_income_2024',
        'population_density',
        'homeownership_rate',
        'urbanization_pct',
        'median_rent_2024',
        'rental_vacancy_rate',
        'housing_units_per_capita',

        # Economic (BLS)
        'unemployment_rate_2024',
        'unemployment_change_2015_2024',

        # Political
        'political_lean_score',

        # Derived features
        'price_to_income_ratio',
        'rent_burden',
        'affordability_index',
        'housing_supply_index',
        'economic_growth_indicator',

        # Reform impact (if available)
        'percent_change',
        'pre_mean_permits',
        'post_mean_permits',
        'permit_growth_rate',
    ]

    # Add normalized versions
    normalized_cols = [col for col in df.columns if col.endswith('_normalized')]

    # Select only columns that exist
    existing_features = [col for col in core_features if col in df.columns]
    final_cols = existing_features + normalized_cols

    return df[final_cols]


def main():
    """Main execution"""
    print("=" * 60)
    print("COMPILING COMPREHENSIVE STATE FEATURES")
    print("=" * 60)

    # Load and merge all data sources
    df = load_and_merge_data()

    if df.empty:
        print("\n❌ No data to process")
        return

    # Engineer features
    df = engineer_features(df)

    # Handle missing data
    df = handle_missing_data(df)

    # Normalize features
    df = normalize_features(df)

    # Select final features
    df_final = select_final_features(df)

    # Save to CSV
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    df_final.to_csv(OUTPUT_FILE, index=False)

    print(f"\n{'=' * 60}")
    print(f"✅ SAVED COMPREHENSIVE FEATURES → {OUTPUT_FILE}")
    print(f"{'=' * 60}")

    print(f"\nDataset summary:")
    print(f"  • States: {len(df_final)}")
    print(f"  • Features: {len(df_final.columns)}")
    print(f"  • Complete data: {df_final.notna().all(axis=1).sum()}/{len(df_final)} states")

    print(f"\nSample data (first 5 states):")
    display_cols = ['state', 'zhvi_2024', 'median_household_income_2024',
                    'unemployment_rate_2024', 'political_lean_score']
    display_cols = [col for col in display_cols if col in df_final.columns]
    print(df_final[display_cols].head())

    print(f"\nFeature list:")
    for i, col in enumerate(df_final.columns, 1):
        print(f"  {i:2d}. {col}")

    print(f"\n✅ Ready for ML model training!")


if __name__ == "__main__":
    main()
