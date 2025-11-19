import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { parse } from "csv-parse/sync";

export async function GET() {
  try {
    const csvPath = path.join(
      process.cwd(),
      "..",
      "data",
      "outputs",
      "reform_predictions.csv"
    );

    const fileContent = await fs.readFile(csvPath, "utf-8");

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Convert numeric fields
    const predictions = records.map((r: any) => ({
      state_fips: r.state_fips,
      state_name: r.state_name,
      wrluri: parseFloat(r.wrluri),
      growth_rate_pct: parseFloat(r.growth_rate_pct),
      mf_share_pct: parseFloat(r.mf_share_pct),
      predicted_impact: parseFloat(r.predicted_impact),
      ci_lower: parseFloat(r.ci_lower),
      ci_upper: parseFloat(r.ci_upper),
      reform_potential: r.reform_potential,
    }));

    return NextResponse.json({
      success: true,
      data: predictions,
      model_info: {
        version: "v3",
        algorithm: "Random Forest Regressor",
        training_samples: 36,
        features: [
          "WRLURI",
          "Zillow HVI",
          "Median Household Income",
          "Population Density",
          "Unemployment Rate",
          "HVI Log (Natural Log)",
          "Income-HVI Ratio",
          "Urban Score",
          "Population Growth Rate"
        ],
        feature_importance: {
          "baseline_wrluri": 16.33,
          "median_household_income": 14.39,
          "unemployment_rate_2023": 13.84,
          "income_hvi_ratio": 13.24,
          "hvi_2023": 12.66,
          "population_density_per_sqmi": 11.28,
          "hvi_log": 10.45,
          "population_growth_rate_pct": 5.81,
          "urban_score": 2.00
        },
        cross_validation_r2: -0.77,
        description: "Random Forest model trained on 36 jurisdictions (6 states + 30 cities) with 9 economic features including housing values, income, demographics, and labor market indicators. Model V3 represents a significant improvement from V2 (6 samples, R²=-10.98) and provides predictions with economic context.",
        improvement_notes: "Model V3 adds comprehensive economic features from Agent 3 deliverables: Zillow HVI, Census ACS demographics, and BLS unemployment data. Feature importance is more distributed across 9 features vs prior versions dominated by regulatory index."
      },
    });
  } catch (error) {
    console.error("Error loading predictions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load predictions" },
      { status: 500 }
    );
  }
}
