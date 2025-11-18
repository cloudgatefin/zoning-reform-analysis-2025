import { NextRequest, NextResponse } from "next/server";
import { fetchStatePermits } from "@/lib/census-api";
import { transformCensusData, aggregateByState, calculatePercentChange } from "@/lib/census-transforms";

/**
 * GET /api/census/live-permits
 *
 * Fetch REAL Census data and compute reform impact metrics
 * This replaces the static CSV with live data
 *
 * Query params:
 * - startYear: Start year for data (default: 2015)
 * - endYear: End year for data (default: 2024)
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.CENSUS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Census API key not configured" },
      { status: 500 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const startYear = parseInt(searchParams.get("startYear") || "2015", 10);
    const endYear = parseInt(searchParams.get("endYear") || "2024", 10);

    console.log(`Fetching Census data: ${startYear}-${endYear}`);

    // Fetch raw Census data
    const rawData = await fetchStatePermits(apiKey, { startYear, endYear });

    console.log(`Received ${rawData.length} rows from Census API`);

    // Transform to usable format
    const processedData = transformCensusData(rawData);

    console.log(`Processed ${processedData.length} permit records`);

    // Group by state
    const stateData = new Map<string, typeof processedData>();
    processedData.forEach((d) => {
      const existing = stateData.get(d.state);
      if (existing) {
        existing.push(d);
      } else {
        stateData.set(d.state, [d]);
      }
    });

    // Calculate metrics for each state
    const metrics = Array.from(stateData.entries()).map(([stateCode, permits]) => {
      permits.sort((a, b) => a.date.getTime() - b.date.getTime());

      const totalPermits = permits.reduce((sum, p) => sum + p.permits, 0);
      const avgPermits = totalPermits / permits.length;

      // Split into first half and second half for trend
      const midPoint = Math.floor(permits.length / 2);
      const firstHalf = permits.slice(0, midPoint);
      const secondHalf = permits.slice(midPoint);

      const firstHalfAvg = firstHalf.reduce((sum, p) => sum + p.permits, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, p) => sum + p.permits, 0) / secondHalf.length;

      const percentChange = calculatePercentChange(firstHalfAvg, secondHalfAvg);

      return {
        state: stateCode,
        jurisdiction: permits[0].stateName,
        totalPermits,
        avgMonthlyPermits: avgPermits,
        firstHalfAvg,
        secondHalfAvg,
        percentChange,
        dataPoints: permits.length,
        dateRange: {
          start: permits[0].date.toISOString(),
          end: permits[permits.length - 1].date.toISOString(),
        },
      };
    });

    return NextResponse.json({
      success: true,
      source: "census_api_live",
      dateRange: { startYear, endYear },
      statesCount: metrics.length,
      totalDataPoints: processedData.length,
      data: metrics,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching live Census data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch live Census data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
