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
        features: ["WRLURI", "Baseline Growth", "MF Share", "Avg Monthly Permits"],
        description: "Random Forest model trained on 6 reform states",
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
