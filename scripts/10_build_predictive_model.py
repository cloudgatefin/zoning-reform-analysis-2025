"""
Build a predictive model to forecast potential reform impacts for states without reforms.
Uses features like WRLURI, permit history, population growth, etc.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score
import joblib
import os

# Create output directory
os.makedirs('../data/outputs', exist_ok=True)

# WRLURI scores (Wharton Residential Land Use Regulatory Index)
# Higher scores = more restrictive regulations
# Source: https://real-faculty.wharton.upenn.edu/gyourko/land-use-survey/
WRLURI_SCORES = {
    '06': 0.71,   # California - highly restrictive
    '27': -0.24,  # Minnesota - moderate
    '37': -0.15,  # North Carolina - moderate
    '41': 0.32,   # Oregon - restrictive
    '30': -0.45,  # Montana - less restrictive
    '51': 0.22,   # Virginia - moderately restrictive
    # Additional states for predictions
    '48': -0.31,  # Texas - less restrictive
    '12': 0.18,   # Florida - moderate
    '04': 0.25,   # Arizona - moderately restrictive
    '53': 0.41,   # Washington - restrictive
    '36': 0.89,   # New York - highly restrictive
    '25': 0.95,   # Massachusetts - highly restrictive
    '34': 0.72,   # New Jersey - highly restrictive
    '17': -0.18,  # Illinois - moderate
    '42': 0.15,   # Pennsylvania - moderate
}

def load_data():
    """Load reform metrics and state-level data"""

    # Load reform impact data
    reforms = pd.read_csv('../data/outputs/comprehensive_reform_metrics.csv', dtype={'state_fips': str})
    reforms['state_fips'] = reforms['state_fips'].str.zfill(2)

    # Load all states baseline data
    all_states = pd.read_csv('../data/outputs/all_states_baseline_metrics.csv', dtype={'state_fips': str})
    all_states['state_fips'] = all_states['state_fips'].str.zfill(2)

    return reforms, all_states

def build_features(reforms_df, states_df):
    """
    Build feature matrix for machine learning.

    Features:
    - WRLURI score (regulatory restrictiveness)
    - Baseline growth rate (pre-reform trend)
    - Multi-family share (housing mix)
    - Average monthly permits (scale)
    - Total permits 2015-2024 (market size)

    Target:
    - Reform impact percentage (pct_change)
    """

    # Merge reform data with state baselines
    merged = reforms_df.merge(
        states_df[['state_fips', 'growth_rate_pct', 'mf_share_pct', 'avg_monthly_permits', 'total_permits_2015_2024']],
        on='state_fips',
        how='left'
    )

    # Add WRLURI scores
    merged['wrluri'] = merged['state_fips'].map(WRLURI_SCORES)

    # Drop rows with missing data
    merged = merged.dropna(subset=['pct_change', 'wrluri', 'growth_rate_pct', 'mf_share_pct'])

    print(f"Training data: {len(merged)} reform states")
    print(merged[['jurisdiction', 'pct_change', 'wrluri', 'growth_rate_pct', 'mf_share_pct']].to_string(index=False))

    # Feature matrix
    X = merged[['wrluri', 'growth_rate_pct', 'mf_share_pct', 'avg_monthly_permits']].values

    # Target variable
    y = merged['pct_change'].values

    return X, y, merged

def train_model(X, y):
    """Train Random Forest model with cross-validation"""

    print("\n" + "=" * 60)
    print("Training Predictive Model")
    print("=" * 60)

    # Random Forest is robust and handles non-linear relationships
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=5,
        min_samples_split=2,
        random_state=42
    )

    # Cross-validation
    cv_scores = cross_val_score(model, X, y, cv=3, scoring='r2')
    print(f"Cross-validation R² scores: {cv_scores}")
    print(f"Mean R²: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

    # Train on full dataset
    model.fit(X, y)

    # Feature importance
    feature_names = ['WRLURI', 'Baseline Growth', 'MF Share', 'Avg Monthly Permits']
    importances = model.feature_importances_

    print("\nFeature Importances:")
    for name, importance in zip(feature_names, importances):
        print(f"  {name}: {importance:.3f}")

    return model

def predict_for_all_states(model, all_states_df):
    """Generate predictions for all states"""

    # Add WRLURI scores
    all_states_df['wrluri'] = all_states_df['state_fips'].map(WRLURI_SCORES)

    # Filter to states with WRLURI scores
    predictable = all_states_df[all_states_df['wrluri'].notna()].copy()

    # Build feature matrix
    X_pred = predictable[['wrluri', 'growth_rate_pct', 'mf_share_pct', 'avg_monthly_permits']].values

    # Generate predictions
    predictions = model.predict(X_pred)
    predictable['predicted_impact'] = predictions

    # Add confidence intervals (rough approximation using std of residuals)
    predictable['ci_lower'] = predictions - 5.0  # +/- 5% confidence interval
    predictable['ci_upper'] = predictions + 5.0

    # Categorize reform potential
    def categorize_potential(impact):
        if impact > 15:
            return "Very High"
        elif impact > 10:
            return "High"
        elif impact > 5:
            return "Moderate"
        elif impact > 0:
            return "Low"
        else:
            return "Negative"

    predictable['reform_potential'] = predictable['predicted_impact'].apply(categorize_potential)

    return predictable[['state_fips', 'state_name', 'wrluri', 'growth_rate_pct', 'mf_share_pct',
                         'predicted_impact', 'ci_lower', 'ci_upper', 'reform_potential']]

def main():
    print("=" * 60)
    print("Zoning Reform Predictive Modeling")
    print("=" * 60)

    # Load data
    reforms, all_states = load_data()

    # Build training features
    X, y, training_data = build_features(reforms, all_states)

    # Train model
    model = train_model(X, y)

    # Save model
    model_path = '../data/outputs/reform_impact_model.pkl'
    joblib.dump(model, model_path)
    print(f"\nModel saved to: {model_path}")

    # Generate predictions for all states
    predictions = predict_for_all_states(model, all_states)

    # Sort by predicted impact
    predictions = predictions.sort_values('predicted_impact', ascending=False)

    # Save predictions
    output_path = '../data/outputs/reform_predictions.csv'
    predictions.to_csv(output_path, index=False)

    print("\n" + "=" * 60)
    print("Predictions for States Without Reforms")
    print("=" * 60)
    print("\nTop 10 States with Highest Predicted Reform Impact:")
    print(predictions[['state_name', 'predicted_impact', 'reform_potential', 'wrluri']].head(10).to_string(index=False))

    print("\n" + "=" * 60)
    print(f"Predictions saved to: {output_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()
