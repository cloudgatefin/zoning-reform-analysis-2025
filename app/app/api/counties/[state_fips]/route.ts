import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { parse } from "csv-parse/sync";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ state_fips: string }> }
) {
  try {
    const { state_fips } = await params;

    const csvPath = path.join(
      process.cwd(),
      "..",
      "data",
      "outputs",
      "county_permits_monthly.csv"
    );

    const fileContent = await fs.readFile(csvPath, "utf-8");

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Filter by state FIPS
    const stateRecords = records.filter((r: any) => r.state_fips === state_fips);

    if (stateRecords.length === 0) {
      return NextResponse.json(
        { success: false, error: `No county data found for state ${state_fips}` },
        { status: 404 }
      );
    }

    // Group by county and aggregate
    const countyMap = new Map<string, any>();

    stateRecords.forEach((record: any) => {
      const fips = record.fips;

      if (!countyMap.has(fips)) {
        countyMap.set(fips, {
          fips,
          state_fips: record.state_fips,
          county_fips: record.county_fips,
          county_name: record.county_name,
          total_permits: 0,
          sf_permits: 0,
          mf_permits: 0,
          months: [],
        });
      }

      const county = countyMap.get(fips);
      county.total_permits += parseInt(record.total_permits || 0);
      county.sf_permits += parseInt(record.sf_permits || 0);
      county.mf_permits += parseInt(record.mf_permits || 0);
      county.months.push({
        date: record.date,
        total: parseInt(record.total_permits || 0),
        sf: parseInt(record.sf_permits || 0),
        mf: parseInt(record.mf_permits || 0),
      });
    });

    const counties = Array.from(countyMap.values()).map(c => ({
      ...c,
      avg_monthly: Math.round(c.total_permits / c.months.length),
      mf_share_pct: ((c.mf_permits / c.total_permits) * 100).toFixed(1),
    }));

    // Sort by total permits descending
    counties.sort((a, b) => b.total_permits - a.total_permits);

    return NextResponse.json({
      success: true,
      state_fips,
      county_count: counties.length,
      data: counties,
    });
  } catch (error) {
    console.error("Error loading county data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load county data" },
      { status: 500 }
    );
  }
}
