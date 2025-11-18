"""
Build predictive ML model for housing permit changes using comprehensive features
Compares baseline model (4 features) vs enhanced model (10+ features)
Models: Linear Regression, Ridge, Lasso, Random Forest with cross-validation
Output: Model comparison, feature importance, R² scores
"""

import os
import pandas as pd
import numpy as np
import warnings
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import cross_val_score, KFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import matplotlib.pyplot as plt

warnings.filterwarnings('ignore')

# Input/Output files
INPUT_FILE = "data/outputs/state_features_comprehensive.csv"
OUTPUT_MODEL_COMPARISON = "data/outputs/model_comparison.csv"
OUTPUT_FEATURE_IMPORTANCE = "data/outputs/feature_importance.csv"
OUTPUT_PREDICTIONS = "data/outputs/model_predictions.csv"

# Random state for reproducibility
RANDOM_STATE = 42


def load_data():
    """Load comprehensive feature dataset"""
    print("Loading feature dataset...")

    if not os.path.exists(INPUT_FILE):
        print(f"❌ Feature file not found: {INPUT_FILE}")
        print("Please run scripts 13-16 first to generate features.")
        return None

    df = pd.read_csv(INPUT_FILE)
    print(f"  ✅ Loaded {len(df)} states with {len(df.columns)} features")

    return df


def prepare_baseline_model_data(df):
    """
    Prepare baseline model with only 4 features as mentioned in requirements:
    - WRLURI (using urbanization as proxy)
    - Growth rate (using ZHVI CAGR)
    - MF share (using rental vacancy rate as proxy)
    - Avg permits (using pre_mean_permits)
    """

    # Define baseline features (limited set)
    baseline_features = [
        'zhvi_cagr',  # Growth rate proxy
        'urbanization_pct',  # WRLURI proxy
        'rental_vacancy_rate',  # MF share proxy
        'pre_mean_permits',  # Average permits
    ]

    # Check which features are available
    available_features = [f for f in baseline_features if f in df.columns]

    if len(available_features) < 3:
        print(f"  ⚠️ Insufficient baseline features. Available: {available_features}")
        return None, None, None

    # Target variable
    target = 'percent_change'

    if target not in df.columns:
        print(f"  ⚠️ Target variable '{target}' not found")
        return None, None, None

    # Filter to states with complete data
    df_baseline = df[available_features + [target]].dropna()

    if len(df_baseline) < 10:
        print(f"  ⚠️ Insufficient data after filtering: {len(df_baseline)} states")
        return None, None, None

    X = df_baseline[available_features]
    y = df_baseline[target]

    print(f"  ✅ Baseline model: {len(df_baseline)} states, {len(available_features)} features")

    return X, y, available_features


def prepare_enhanced_model_data(df):
    """
    Prepare enhanced model with 10+ economic/demographic features
    """

    # Define enhanced features
    enhanced_features = [
        # Housing market
        'zhvi_2024',
        'zhvi_cagr',
        'zhvi_volatility',

        # Demographics
        'median_household_income_2024',
        'population_density',
        'homeownership_rate',
        'urbanization_pct',

        # Economic
        'unemployment_rate_2024',
        'unemployment_change_2015_2024',

        # Political
        'political_lean_score',

        # Housing supply
        'median_rent_2024',
        'rental_vacancy_rate',
        'housing_units_per_capita',

        # Derived features
        'price_to_income_ratio',
        'rent_burden',
        'affordability_index',
        'housing_supply_index',
        'economic_growth_indicator',

        # Baseline features
        'pre_mean_permits',
    ]

    # Check which features are available
    available_features = [f for f in enhanced_features if f in df.columns]

    print(f"  • Available enhanced features: {len(available_features)}/{len(enhanced_features)}")

    # Target variable
    target = 'percent_change'

    if target not in df.columns:
        print(f"  ⚠️ Target variable '{target}' not found")
        return None, None, None

    # Filter to states with complete data
    df_enhanced = df[available_features + [target]].dropna()

    if len(df_enhanced) < 10:
        print(f"  ⚠️ Insufficient data after filtering: {len(df_enhanced)} states")
        # Try with fewer features (drop those with most missing values)
        for feature in available_features[:]:
            if df[feature].isnull().sum() > len(df) * 0.3:  # More than 30% missing
                available_features.remove(feature)

        df_enhanced = df[available_features + [target]].dropna()

    X = df_enhanced[available_features]
    y = df_enhanced[target]

    print(f"  ✅ Enhanced model: {len(df_enhanced)} states, {len(available_features)} features")

    return X, y, available_features


def train_and_evaluate_models(X, y, feature_names, model_type="Enhanced"):
    """
    Train multiple ML models with cross-validation
    Returns: dict with model results
    """

    print(f"\nTraining {model_type} models...")

    # Define models to train
    models = {
        'Linear Regression': LinearRegression(),
        'Ridge Regression': Ridge(alpha=1.0, random_state=RANDOM_STATE),
        'Lasso Regression': Lasso(alpha=0.1, random_state=RANDOM_STATE),
        'Random Forest': RandomForestRegressor(
            n_estimators=100,
            max_depth=5,
            random_state=RANDOM_STATE
        ),
        'Gradient Boosting': GradientBoostingRegressor(
            n_estimators=100,
            max_depth=3,
            random_state=RANDOM_STATE
        )
    }

    # Cross-validation setup
    cv = KFold(n_splits=min(5, len(X)), shuffle=True, random_state=RANDOM_STATE)

    results = []

    for model_name, model in models.items():
        try:
            # Cross-validation R² scores
            cv_scores = cross_val_score(model, X, y, cv=cv, scoring='r2')

            # Train on full dataset for feature importance
            model.fit(X, y)
            y_pred = model.predict(X)

            # Calculate metrics
            r2 = r2_score(y, y_pred)
            rmse = np.sqrt(mean_squared_error(y, y_pred))
            mae = mean_absolute_error(y, y_pred)

            # Get feature importance (if available)
            if hasattr(model, 'feature_importances_'):
                feature_importance = model.feature_importances_
            elif hasattr(model, 'coef_'):
                feature_importance = np.abs(model.coef_)
            else:
                feature_importance = None

            results.append({
                'model_type': model_type,
                'model_name': model_name,
                'r2_score': round(r2, 4),
                'r2_cv_mean': round(cv_scores.mean(), 4),
                'r2_cv_std': round(cv_scores.std(), 4),
                'rmse': round(rmse, 2),
                'mae': round(mae, 2),
                'n_features': len(feature_names),
                'n_samples': len(X),
                'feature_importance': feature_importance,
                'feature_names': feature_names,
                'model_object': model,
                'predictions': y_pred
            })

            print(f"  • {model_name:20s}: R² = {r2:6.4f}, CV R² = {cv_scores.mean():6.4f} ± {cv_scores.std():5.4f}")

        except Exception as e:
            print(f"  ✗ {model_name}: Error - {str(e)}")

    return results


def extract_feature_importance(model_results):
    """Extract and rank feature importance across models"""

    importance_data = []

    for result in model_results:
        if result['feature_importance'] is not None:
            for feature, importance in zip(result['feature_names'], result['feature_importance']):
                importance_data.append({
                    'model_type': result['model_type'],
                    'model_name': result['model_name'],
                    'feature': feature,
                    'importance': importance
                })

    if not importance_data:
        return pd.DataFrame()

    df_importance = pd.DataFrame(importance_data)

    # Aggregate importance across models
    agg_importance = df_importance.groupby('feature')['importance'].agg(['mean', 'std', 'count']).reset_index()
    agg_importance = agg_importance.sort_values('mean', ascending=False)
    agg_importance.columns = ['feature', 'avg_importance', 'std_importance', 'n_models']
    agg_importance['avg_importance'] = agg_importance['avg_importance'].round(4)
    agg_importance['std_importance'] = agg_importance['std_importance'].round(4)

    return agg_importance


def generate_comparison_report(baseline_results, enhanced_results):
    """Generate comparison report between baseline and enhanced models"""

    print("\n" + "=" * 70)
    print("MODEL COMPARISON REPORT")
    print("=" * 70)

    # Find best models
    baseline_best = max(baseline_results, key=lambda x: x['r2_score'])
    enhanced_best = max(enhanced_results, key=lambda x: x['r2_score'])

    print("\n📊 BASELINE MODEL (4 features)")
    print(f"  Best: {baseline_best['model_name']}")
    print(f"  R² Score: {baseline_best['r2_score']:.4f}")
    print(f"  CV R² Score: {baseline_best['r2_cv_mean']:.4f} ± {baseline_best['r2_cv_std']:.4f}")
    print(f"  RMSE: {baseline_best['rmse']:.2f}")
    print(f"  MAE: {baseline_best['mae']:.2f}")

    print("\n📊 ENHANCED MODEL (10+ features)")
    print(f"  Best: {enhanced_best['model_name']}")
    print(f"  R² Score: {enhanced_best['r2_score']:.4f}")
    print(f"  CV R² Score: {enhanced_best['r2_cv_mean']:.4f} ± {enhanced_best['r2_cv_std']:.4f}")
    print(f"  RMSE: {enhanced_best['rmse']:.2f}")
    print(f"  MAE: {enhanced_best['mae']:.2f}")

    # Calculate improvement
    r2_improvement = enhanced_best['r2_score'] - baseline_best['r2_score']
    rmse_improvement = baseline_best['rmse'] - enhanced_best['rmse']

    print(f"\n📈 IMPROVEMENT")
    print(f"  R² Improvement: {r2_improvement:+.4f} ({r2_improvement/abs(baseline_best['r2_score'])*100:+.1f}%)")
    print(f"  RMSE Improvement: {rmse_improvement:+.2f}")

    # Success criteria check
    print(f"\n✓ SUCCESS CRITERIA")
    if enhanced_best['r2_score'] > 0.4:
        print(f"  ✅ R² > 0.4: {enhanced_best['r2_score']:.4f} (PASS)")
    else:
        print(f"  ⚠️ R² > 0.4: {enhanced_best['r2_score']:.4f} (Need improvement)")

    if r2_improvement > 0:
        print(f"  ✅ Improvement over baseline: {r2_improvement:+.4f} (PASS)")
    else:
        print(f"  ⚠️ Improvement over baseline: {r2_improvement:+.4f} (Need tuning)")

    print("=" * 70)


def save_results(baseline_results, enhanced_results, feature_importance):
    """Save all results to CSV files"""

    print("\nSaving results...")

    # Save model comparison
    all_results = baseline_results + enhanced_results
    comparison_df = pd.DataFrame([
        {
            'model_type': r['model_type'],
            'model_name': r['model_name'],
            'r2_score': r['r2_score'],
            'r2_cv_mean': r['r2_cv_mean'],
            'r2_cv_std': r['r2_cv_std'],
            'rmse': r['rmse'],
            'mae': r['mae'],
            'n_features': r['n_features'],
            'n_samples': r['n_samples']
        }
        for r in all_results
    ])

    os.makedirs(os.path.dirname(OUTPUT_MODEL_COMPARISON), exist_ok=True)
    comparison_df.to_csv(OUTPUT_MODEL_COMPARISON, index=False)
    print(f"  ✅ Saved model comparison → {OUTPUT_MODEL_COMPARISON}")

    # Save feature importance
    if not feature_importance.empty:
        feature_importance.to_csv(OUTPUT_FEATURE_IMPORTANCE, index=False)
        print(f"  ✅ Saved feature importance → {OUTPUT_FEATURE_IMPORTANCE}")


def main():
    """Main execution"""

    print("=" * 70)
    print("PREDICTIVE MODEL TRAINING")
    print("=" * 70)

    # Load data
    df = load_data()
    if df is None:
        return

    # Prepare baseline model data (4 features)
    print("\n📋 Preparing baseline model data...")
    X_baseline, y_baseline, baseline_features = prepare_baseline_model_data(df)

    # Prepare enhanced model data (10+ features)
    print("\n📋 Preparing enhanced model data...")
    X_enhanced, y_enhanced, enhanced_features = prepare_enhanced_model_data(df)

    if X_baseline is None or X_enhanced is None:
        print("\n❌ Cannot proceed without data. Please check feature files.")
        return

    # Train baseline models
    baseline_results = train_and_evaluate_models(X_baseline, y_baseline, baseline_features, "Baseline")

    # Train enhanced models
    enhanced_results = train_and_evaluate_models(X_enhanced, y_enhanced, enhanced_features, "Enhanced")

    # Extract feature importance
    all_results = baseline_results + enhanced_results
    feature_importance = extract_feature_importance(all_results)

    if not feature_importance.empty:
        print("\n📊 TOP 10 MOST IMPORTANT FEATURES:")
        print(feature_importance.head(10).to_string(index=False))

    # Generate comparison report
    generate_comparison_report(baseline_results, enhanced_results)

    # Save results
    save_results(baseline_results, enhanced_results, feature_importance)

    print("\n✅ Model training complete!")


if __name__ == "__main__":
    main()
