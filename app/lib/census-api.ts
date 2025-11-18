/**
 * Census API client functions for fetching building permit data
 */

const CENSUS_API_BASE = "https://api.census.gov/data/timeseries/bps/permits";

export interface CensusPermitData {
  time: string;
  areaname: string;
  state: string;
  value: string;
  unit: string;
  areatype: string;
}

/**
 * Fetch state-level building permits data from Census API
 */
export async function fetchStatePermits(
  apiKey: string,
  options?: {
    startYear?: number;
    endYear?: number;
  }
): Promise<CensusPermitData[]> {
  const params = new URLSearchParams({
    get: "time,areaname,state,value,unit,areatype",
    "for": "state:*",
    key: apiKey,
  });

  // Add time filter if provided
  if (options?.startYear && options?.endYear) {
    params.append("time", `from ${options.startYear} to ${options.endYear}`);
  }

  const url = `${CENSUS_API_BASE}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Census API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // First row is headers, skip it
    const [headers, ...rows] = data;

    // Map to typed objects
    return rows.map((row: string[]) => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index];
      });
      return obj as CensusPermitData;
    });
  } catch (error) {
    console.error("Failed to fetch Census data:", error);
    throw error;
  }
}

/**
 * Fetch permits for a specific state
 */
export async function fetchStatePermitsByState(
  apiKey: string,
  stateCode: string,
  options?: {
    startYear?: number;
    endYear?: number;
  }
): Promise<CensusPermitData[]> {
  const params = new URLSearchParams({
    get: "time,areaname,state,value,unit,areatype",
    "for": `state:${stateCode}`,
    key: apiKey,
  });

  if (options?.startYear && options?.endYear) {
    params.append("time", `from ${options.startYear} to ${options.endYear}`);
  }

  const url = `${CENSUS_API_BASE}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Census API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const [headers, ...rows] = data;

    return rows.map((row: string[]) => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index];
      });
      return obj as CensusPermitData;
    });
  } catch (error) {
    console.error("Failed to fetch state Census data:", error);
    throw error;
  }
}
