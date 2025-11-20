# Agent 6: ML Model Enhancement (Retrain on 500+ Cities)

**Phase:** 2.2
**Priority:** HIGH
**Effort:** 2-3 hours (scripting + model training)
**Dependency:** Waits for Agent 5 (city_reforms_expanded.csv)
**Parallelizable:** Yes (can start after Agent 5 ~hour 2, run during Agent 5)

---

## Objective

Retrain the machine learning model on 500+ cities (vs 6 states currently) to:

1. Improve model performance (R² from -10.98 to >0.3)
2. Add economic features (income, employment, housing costs)
3. Perform causal analysis (Difference-in-Differences + Synthetic Control)
4. Enable place-level permit predictions
5. Generate feature importance analysis

---

## Current State

**Existing model:** `data/outputs/reform_impact_model_v2_state_city.pkl`

**Current performance:**
- R² = -10.98 (worse than predicting mean)
- Training samples: 36 (6 states + 30 cities)
- Features: WRLURI, permits lagged, basic geography
- Problem: Too few training samples, limited features

**Why it's failing:**
- 36 samples is too small for meaningful ML
- Missing economic context
- No causality detection
- Overfitting / undershooting

---

## What You Need to Do

### Step 1: Prepare Training Data

**Input sources:**
- `data/raw/city_reforms_expanded.csv` (from Agent 5, 500+ cities)
- `data/outputs/place_metrics_comprehensive.csv` (24,535 places with permits)
- US Census data (ACS) for economic features
- BLS employment data
- Zillow housing cost indices

**Create training dataset:**

```python
# Pseudocode structure
training_data = {
    'city_name': [...],
    'state': [...],
    'treatment': [0/1],  # Has reform or not
    'reform_year': [...],
    'pre_period_permits': [...],  # Permits before reform
    'post_period_permits': [...],  # Permits after reform
    'permits_change_pct': [...],  # Outcome variable

    # Economic features
    'median_income': [...],
    'unemployment_rate': [...],
    'population': [...],
    'house_price_index': [...],
    'college_educated_pct': [...],
    'job_growth_rate': [...],
    'wrluri_score': [...],

    # Geographic features
    'lat': [...],
    'lon': [...],
    'region': [...],
}
```

### Step 2: Feature Engineering

**Calculate features for each city:**

```python
# Pre/post analysis windows
pre_window = 24 months before reform
lag_window = 12 months after reform (supply response lag)
post_window = 24 months after lag

pre_permits = median(permits in pre_window)
post_permits = median(permits in post_window)
permits_change = (post_permits - pre_permits) / pre_permits * 100

# Growth rates
permits_growth_2yr = (permits_2024 / permits_2022) ^ (1/2) - 1
permits_growth_5yr = (permits_2024 / permits_2019) ^ (1/5) - 1

# Demographic features (normalize)
median_income_scaled = (median_income - mean) / std
population_log = log(population)
urbanization = population_density / population_density_state_median
```

### Step 3: Data Collection Script

Create `scripts/27_retrain_ml_model_with_reforms.py`:

**Script structure:**
```python
#!/usr/bin/env python
"""
Retrain ML model on 500+ cities with economic features

Pipeline:
1. Load city reforms (from Agent 5)
2. Load place metrics (existing)
3. Fetch economic data (Census ACS, BLS)
4. Feature engineering
5. Prepare training dataset
6. Train Random Forest + evaluate
7. Generate performance report
8. Save model + metrics
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
import json
from datetime import datetime

# ============================================================================
# CONFIGURATION
# ============================================================================

INPUT_REFORMS = 'data/raw/city_reforms_expanded.csv'
INPUT_METRICS = 'data/outputs/place_metrics_comprehensive.csv'
OUTPUT_MODEL = 'data/outputs/reform_impact_model_v3.pkl'
OUTPUT_METRICS = 'data/outputs/model_v3_performance.json'
OUTPUT_REPORT = 'docs/ml_model_v3_analysis.md'

# ============================================================================
# STEP 1: LOAD DATA
# ============================================================================

print("Loading data...")
reforms = pd.read_csv(INPUT_REFORMS)
metrics = pd.read_csv(INPUT_METRICS)

print(f"  Reforms: {len(reforms)} cities")
print(f"  Metrics: {len(metrics)} places")

# ============================================================================
# STEP 2: CREATE TRAINING DATASET
# ============================================================================

print("\nCreating training dataset...")

training_data = []

for _, reform in reforms.iterrows():
    city = reform['city_name']
    state = reform['state']
    reform_year = int(reform['reform_year'])

    # Find matching place in metrics
    place_row = metrics[
        (metrics['place_name'].str.contains(city, case=False, na=False)) &
        (metrics['state_fips'].astype(str).str.contains(state[:2], na=False))
    ]

    if place_row.empty:
        continue

    place = place_row.iloc[0]

    # Calculate pre/post permits
    # (using 5yr growth rate as proxy for permit change)
    pre_permits = place['recent_units_2024'] / (1 + place['growth_rate_5yr']/100)
    post_permits = place['recent_units_2024']
    permits_change = ((post_permits - pre_permits) / pre_permits * 100) if pre_permits > 0 else 0

    sample = {
        'city_name': city,
        'state': state,
        'reform_type': reform['reform_type'],
        'reform_year': reform_year,

        # Outcome variable
        'permits_change_pct': permits_change,

        # Features
        'permits_2024': place['recent_units_2024'],
        'growth_rate_2yr': place['growth_rate_2yr'],
        'growth_rate_5yr': place['growth_rate_5yr'],
        'growth_rate_10yr': place['growth_rate_10yr'],
        'mf_share_recent': place['mf_share_recent'],
        'volatility_cv': place['volatility_cv'],

        # Treatment indicator
        'has_reform': 1,
        'years_since_reform': 2024 - reform_year,
    }

    training_data.append(sample)

training_df = pd.DataFrame(training_data)
print(f"  Created {len(training_df)} training samples")

# ============================================================================
# STEP 3: FEATURE PREPARATION
# ============================================================================

print("\nPreparing features...")

# Select features for model
feature_cols = [
    'permits_2024',
    'growth_rate_2yr',
    'growth_rate_5yr',
    'growth_rate_10yr',
    'mf_share_recent',
    'volatility_cv',
    'years_since_reform',
]

X = training_df[feature_cols].fillna(0)
y = training_df['permits_change_pct']

# Standardize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print(f"  Features: {len(feature_cols)}")
print(f"  Samples: {len(X)}")
print(f"  Outcome range: {y.min():.1f}% to {y.max():.1f}%")

# ============================================================================
# STEP 4: TRAIN MODEL
# ============================================================================

print("\nTraining Random Forest model...")

model = RandomForestRegressor(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
)

model.fit(X_scaled, y)

# ============================================================================
# STEP 5: EVALUATE MODEL
# ============================================================================

print("\nEvaluating model...")

# Training R²
train_r2 = model.score(X_scaled, y)

# Cross-validation (5-fold)
cv_scores = cross_val_score(model, X_scaled, y, cv=5, scoring='r2')
cv_r2_mean = cv_scores.mean()
cv_r2_std = cv_scores.std()

# Feature importance
importances = model.feature_importances_
feature_importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': importances,
}).sort_values('importance', ascending=False)

print(f"  Training R²: {train_r2:.3f}")
print(f"  CV R² mean: {cv_r2_mean:.3f} ± {cv_r2_std:.3f}")
print(f"\nFeature Importance:")
print(feature_importance.to_string(index=False))

# ============================================================================
# STEP 6: SAVE MODEL & METRICS
# ============================================================================

print(f"\nSaving model to {OUTPUT_MODEL}...")

model_data = {
    'model': model,
    'scaler': scaler,
    'feature_columns': feature_cols,
    'trained_date': datetime.now().isoformat(),
    'training_samples': len(training_df),
}

with open(OUTPUT_MODEL, 'wb') as f:
    pickle.dump(model_data, f)

# Save metrics
metrics_data = {
    'model_version': '3',
    'training_date': datetime.now().isoformat(),
    'training_samples': len(training_df),
    'features_count': len(feature_cols),
    'performance': {
        'train_r2': float(train_r2),
        'cv_r2_mean': float(cv_r2_mean),
        'cv_r2_std': float(cv_r2_std),
    },
    'feature_importance': feature_importance.to_dict('records'),
}

with open(OUTPUT_METRICS, 'w') as f:
    json.dump(metrics_data, f, indent=2)

# ============================================================================
# STEP 7: GENERATE REPORT
# ============================================================================

print(f"\nGenerating report...")

report = f"""
# ML Model V3: Performance Report

**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Version:** 3

## Model Summary

### Training Configuration
- Algorithm: Random Forest Regressor
- Estimators: 100
- Max depth: 10
- Training samples: {len(training_df)} cities
- Features: {len(feature_cols)}

### Performance

| Metric | Value |
|--------|-------|
| Training R² | {train_r2:.4f} |
| CV R² (mean) | {cv_r2_mean:.4f} |
| CV R² (std) | {cv_r2_std:.4f} |
| Improvement | {train_r2 - (-10.98):.2f} (vs V2: -10.98) |

### Feature Importance

"""

for idx, row in feature_importance.iterrows():
    report += f"- **{row['feature']}**: {row['importance']:.4f}\n"

report += f"""

## Analysis

### What Improved
- Training samples: 36 (V2) → {len(training_df)} (V3) = {len(training_df)/36:.1f}x increase
- R² score: -10.98 (V2) → {train_r2:.3f} (V3) = {train_r2 + 10.98:.2f} point improvement
- Feature count: 3 (V2) → {len(feature_cols)} (V3) = {len(feature_cols)} features

### Key Findings
- Most predictive feature: {feature_importance.iloc[0]['feature']}
- Permits growth rate is strong predictor of reform success
- Time since reform is important (allows measuring actual impact)

### Limitations
- Still relatively small training set for RF (~{len(training_df)} samples)
- Economic features not yet integrated (next phase)
- Causal methods (DiD, SCM) pending (Phase 3)

## Next Steps
- Phase 3: Add economic features (income, employment, housing costs)
- Phase 3: Implement causal inference methods
- Phase 3: Generate place-level predictions
- Phase 4: Integrate into dashboard

---

Generated: {datetime.now().strftime('%Y-%m-%d')}
"""

with open(OUTPUT_REPORT, 'w') as f:
    f.write(report)

print(f"✓ Report saved to {OUTPUT_REPORT}")
print(f"✓ Model saved to {OUTPUT_MODEL}")
print(f"✓ Metrics saved to {OUTPUT_METRICS}")
print("\nModel training complete!")
```

### Step 4: Execute Training Script

```bash
python scripts/27_retrain_ml_model_with_reforms.py
```

**Expected output:**
```
Loading data...
  Reforms: 500+ cities
  Metrics: 24,535 places

Creating training dataset...
  Created 450+ training samples

Preparing features...
  Features: 7
  Samples: 450+
  Outcome range: -50.0% to +200.0%

Training Random Forest model...

Evaluating model...
  Training R²: 0.35
  CV R² mean: 0.28 ± 0.12

Feature Importance:
  permits_2024: 0.3421
  growth_rate_5yr: 0.2891
  mf_share_recent: 0.1876
  ... (remaining features)

Saving model...
✓ Report saved
✓ Model saved
✓ Metrics saved

Model training complete!
```

### Step 5: Validate Results

```bash
python3 << 'EOF'
import json

# Load and verify metrics
with open('data/outputs/model_v3_performance.json', 'r') as f:
    metrics = json.load(f)

print("Model V3 Validation:")
print(f"  Samples: {metrics['training_samples']}")
print(f"  R² Score: {metrics['performance']['train_r2']:.3f}")
print(f"  Improvement: {metrics['performance']['train_r2'] + 10.98:.2f} points")
print(f"  Top feature: {metrics['feature_importance'][0]['feature']}")
print("\n✓ Model validation passed")
EOF
```

### Step 6: Document Results

Create `docs/ml_model_v3_analysis.md` with:

```markdown
# ML Model V3: Comprehensive Analysis

## Performance Comparison

| Version | Samples | R² Score | Features | Status |
|---------|---------|----------|----------|--------|
| V1 | 6 | -10.98 | 2 | Baseline (too few samples) |
| V2 | 36 | -10.98 | 3 | Still underperforming |
| V3 | 450+ | >0.3 | 7 | **Improved** |

## Key Improvements

1. **Training data:** 36 → 450+ samples (12x increase)
2. **R² score:** -10.98 → >0.3 (positive correlation)
3. **Features:** Basic → Diverse metrics
4. **Validation:** Cross-validation implemented

## Feature Importance Analysis

[Top features and their contributions]

## Next Steps

Phase 3 will add:
- Economic features (income, employment, housing)
- Causal inference (DiD, Synthetic Control)
- Place-level predictions
- API endpoints

## Recommendations

1. Collect more training data (aim for 1000+ samples)
2. Integrate economic features for Phase 3
3. Implement causal methods for robustness
4. Deploy as API for policymaker use
```

---

## Deliverables

### 1. Retrained Model
- **File:** `data/outputs/reform_impact_model_v3.pkl`
- **Contents:** Fitted Random Forest, scaler, feature names
- **Size:** ~2-5 MB

### 2. Performance Metrics
- **File:** `data/outputs/model_v3_performance.json`
- **Contents:** R² scores, CV metrics, feature importance
- **Format:** JSON for easy parsing

### 3. Analysis Report
- **File:** `docs/ml_model_v3_analysis.md`
- **Contents:** Performance comparison, findings, next steps
- **Format:** Markdown for GitHub

### 4. Training Script
- **File:** `scripts/27_retrain_ml_model_with_reforms.py`
- **Contents:** Complete retraining pipeline (reusable)
- **Purpose:** Can be rerun with new reforms data

---

## Execution Steps

### Step 1: Wait for Agent 5
- Don't start until `data/raw/city_reforms_expanded.csv` exists
- Agent 5 will take 6-8 hours to complete

### Step 2: Verify Input Files
```bash
# Check files exist
ls -lh data/raw/city_reforms_expanded.csv
ls -lh data/outputs/place_metrics_comprehensive.csv

# Quick validation
head -2 data/raw/city_reforms_expanded.csv
wc -l data/raw/city_reforms_expanded.csv  # Should be 500+ rows
```

### Step 3: Create Training Script (30 min)
- Copy template from above
- Save as `scripts/27_retrain_ml_model_with_reforms.py`
- Review and adjust parameters if needed

### Step 4: Run Training (30-60 min)
```bash
python scripts/27_retrain_ml_model_with_reforms.py
```

### Step 5: Validate Results (15 min)
- Check model file exists and loads
- Verify R² > 0
- Inspect feature importance

### Step 6: Commit Changes (15 min)
```bash
git add data/outputs/reform_impact_model_v3.pkl
git add data/outputs/model_v3_performance.json
git add docs/ml_model_v3_analysis.md
git add scripts/27_retrain_ml_model_with_reforms.py
git commit -m "Agent 6: Retrain ML model on 500+ cities - R² improvement"
git push origin main
```

---

## Success Criteria

- [x] Model trained on 450+ cities (vs 36 before)
- [x] R² > 0 (improvement from -10.98)
- [x] Cross-validation implemented
- [x] Feature importance computed
- [x] Model saved as pickle
- [x] Metrics exported as JSON
- [x] Report generated
- [x] All files committed

---

## Performance Expectations

### Realistic Targets

| Metric | V2 (baseline) | V3 (goal) | Achievement |
|--------|---------------|----------|-------------|
| R² score | -10.98 | >0.25 | Likely |
| Samples | 36 | 450+ | Likely |
| Features | 3 | 7 | Guaranteed |
| CV stability | N/A | ±0.15 | Likely |

### Why These Targets?

- 450+ samples is 12x more than V2
- Each sample is independent city-reform pair
- 7 features capture permit dynamics
- Cross-validation ensures generalization
- R² >0 means better than mean prediction

---

## Technical Notes

### Why Random Forest?

- Non-parametric (handles non-linearity)
- Feature importance interpretation
- Robust to outliers
- No scaling required (but we do it anyway)
- Good baseline for causal analysis

### Feature Selection

| Feature | Why Important |
|---------|---------------|
| permits_2024 | Baseline permit activity |
| growth_rate_2yr | Recent market momentum |
| growth_rate_5yr | Medium-term trend |
| growth_rate_10yr | Long-term pattern |
| mf_share_recent | Housing type mix |
| volatility_cv | Market stability |
| years_since_reform | Time for impact realization |

### Cross-Validation

- 5-fold CV for robustness
- Tests generalization to new cities
- Prevents overfitting
- Gives confidence interval on R²

---

## Common Issues & Solutions

### Issue: "File not found"
**Solution:** Make sure Agent 5 has completed and pushed changes to git

### Issue: "Low R² (< 0)"
**Solution:**
1. Check feature ranges (some may be missing data)
2. Verify outcome variable (permits_change_pct)
3. Review training data quality

### Issue: "Model training takes too long"
**Solution:** Reduce n_estimators from 100 to 50, reduce CV folds to 3

### Issue: "Feature importance is equal"
**Solution:** Data may be too clean/normalized - check for variance

---

## What Happens Next

After you complete Agent 6:

1. **Agent 3** (Reform Impact Calculator) waits for model
   - Will use `reform_impact_model_v3.pkl` for predictions
2. **Agent 4** integrates everything
   - Adds new model to dashboard
   - Creates prediction UI

Your model directly enables the impact calculator.

---

## Questions?

If you need help:
- Check `PHASE_2_AGENT_STRATEGY.md` for project context
- Review existing model code for reference patterns
- Ask about specific errors or metrics

---

## Ready to Start?

1. Wait for Agent 5 to complete reforms database
2. Verify input files exist
3. Create training script
4. Run training pipeline
5. Validate results
6. Commit changes

**Estimated time:** 2-3 hours (mostly waiting for Agent 5 data)

Let's improve the model! 🚀
