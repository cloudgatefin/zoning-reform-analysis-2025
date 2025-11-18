import { NextRequest, NextResponse } from "next/server";
import { fetchStatePermits } from "@/lib/census-api";

/**
 * GET /api/census/permits
 * Proxy route for Census Building Permits API
 *
 * Query params:
 * - startYear: number (optional)
 * - endYear: number (optional)
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
    const startYear = searchParams.get("startYear");
    const endYear = searchParams.get("endYear");

    const options = {
      startYear: startYear ? parseInt(startYear, 10) : undefined,
      endYear: endYear ? parseInt(endYear, 10) : undefined,
    };

    const data = await fetchStatePermits(apiKey, options);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("Error fetching Census permits:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Census data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
