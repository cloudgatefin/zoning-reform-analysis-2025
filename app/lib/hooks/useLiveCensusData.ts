"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface LiveCensusMetric {
  state: string;
  jurisdiction: string;
  totalPermits: number;
  avgMonthlyPermits: number;
  firstHalfAvg: number;
  secondHalfAvg: number;
  percentChange: number;
  dataPoints: number;
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Hook to fetch LIVE Census permit data
 * This bypasses the CSV and fetches directly from Census API
 */
export function useLiveCensusData(startYear: number = 2015, endYear: number = 2024) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/census/live-permits?startYear=${startYear}&endYear=${endYear}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Cache for 1 hour (3600000 ms)
      dedupingInterval: 3600000,
    }
  );

  return {
    metrics: (data?.data as LiveCensusMetric[]) || [],
    metadata: {
      source: data?.source,
      statesCount: data?.statesCount,
      totalDataPoints: data?.totalDataPoints,
      fetchedAt: data?.fetchedAt,
    },
    isLoading,
    isError: error,
    refresh: mutate, // Call this to force refresh from API
  };
}
