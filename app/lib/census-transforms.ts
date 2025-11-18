/**
 * Transform Census API data into usable format
 */

import { CensusPermitData } from "./census-api";

export interface ProcessedPermitData {
  state: string;
  stateName: string;
  year: number;
  month: number;
  date: Date;
  permits: number;
}

/**
 * State FIPS code to name mapping
 */
export const STATE_FIPS_TO_NAME: Record<string, string> = {
  "01": "Alabama",
  "02": "Alaska",
  "04": "Arizona",
  "05": "Arkansas",
  "06": "California",
  "08": "Colorado",
  "09": "Connecticut",
  "10": "Delaware",
  "11": "District of Columbia",
  "12": "Florida",
  "13": "Georgia",
  "15": "Hawaii",
  "16": "Idaho",
  "17": "Illinois",
  "18": "Indiana",
  "19": "Iowa",
  "20": "Kansas",
  "21": "Kentucky",
  "22": "Louisiana",
  "23": "Maine",
  "24": "Maryland",
  "25": "Massachusetts",
  "26": "Michigan",
  "27": "Minnesota",
  "28": "Mississippi",
  "29": "Missouri",
  "30": "Montana",
  "31": "Nebraska",
  "32": "Nevada",
  "33": "New Hampshire",
  "34": "New Jersey",
  "35": "New Mexico",
  "36": "New York",
  "37": "North Carolina",
  "38": "North Dakota",
  "39": "Ohio",
  "40": "Oklahoma",
  "41": "Oregon",
  "42": "Pennsylvania",
  "44": "Rhode Island",
  "45": "South Carolina",
  "46": "South Dakota",
  "47": "Tennessee",
  "48": "Texas",
  "49": "Utah",
  "50": "Vermont",
  "51": "Virginia",
  "53": "Washington",
  "54": "West Virginia",
  "55": "Wisconsin",
  "56": "Wyoming",
  "72": "Puerto Rico",
};

/**
 * Parse Census time format (YYYYMM) to Date
 */
export function parseCensusTime(time: string): { year: number; month: number; date: Date } | null {
  if (!time || time.length !== 6) return null;

  const year = parseInt(time.substring(0, 4), 10);
  const month = parseInt(time.substring(4, 6), 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return null;

  const date = new Date(year, month - 1, 1);

  return { year, month, date };
}

/**
 * Transform Census API response to processed format
 */
export function transformCensusData(data: CensusPermitData[]): ProcessedPermitData[] {
  return data
    .map((row) => {
      const timeInfo = parseCensusTime(row.time);
      if (!timeInfo) return null;

      const permits = parseInt(row.value, 10);
      if (isNaN(permits)) return null;

      const stateName = STATE_FIPS_TO_NAME[row.state] || row.areaname || "Unknown";

      return {
        state: row.state,
        stateName,
        year: timeInfo.year,
        month: timeInfo.month,
        date: timeInfo.date,
        permits,
      };
    })
    .filter((d): d is ProcessedPermitData => d !== null);
}

/**
 * Aggregate permits by state and time period
 */
export function aggregateByState(
  data: ProcessedPermitData[],
  startDate: Date,
  endDate: Date
): Map<string, { stateName: string; totalPermits: number; avgMonthly: number; count: number }> {
  const stateMap = new Map<string, { stateName: string; permits: number[]; }>();

  data.forEach((d) => {
    if (d.date >= startDate && d.date <= endDate) {
      const existing = stateMap.get(d.state);
      if (existing) {
        existing.permits.push(d.permits);
      } else {
        stateMap.set(d.state, {
          stateName: d.stateName,
          permits: [d.permits],
        });
      }
    }
  });

  const result = new Map();
  stateMap.forEach((value, key) => {
    const totalPermits = value.permits.reduce((sum, p) => sum + p, 0);
    const avgMonthly = totalPermits / value.permits.length;
    result.set(key, {
      stateName: value.stateName,
      totalPermits,
      avgMonthly,
      count: value.permits.length,
    });
  });

  return result;
}

/**
 * Calculate percent change between two periods
 */
export function calculatePercentChange(before: number, after: number): number {
  if (before === 0) return after > 0 ? 100 : 0;
  return ((after - before) / before) * 100;
}
