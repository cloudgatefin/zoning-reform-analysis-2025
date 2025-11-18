import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/**
 * GET /api/states/baseline
 * Serve baseline metrics for ALL U.S. states (not just reform states)
 */
export async function GET() {
  try {
    const metricsPath = path.join(
      process.cwd(),
      "..",
      "data",
      "outputs",
      "all_states_baseline_metrics.csv"
    );

    const csvContent = await readFile(metricsPath, "utf-8");

    // Parse CSV to JSON
    const lines = csvContent.trim().split("\n");
    const headers = lines[0].split(",");

    const data = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim() || null;
      });
      return obj;
    });

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      source: "census_baseline_all_states",
    });
  } catch (error) {
    console.error("Error reading baseline metrics:", error);
    return NextResponse.json(
      {
        error: "Failed to load baseline metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
