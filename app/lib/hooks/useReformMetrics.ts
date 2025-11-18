"use client";

import useSWR from "swr";
import { ReformMetric } from "../types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Hook to fetch reform metrics data
 * Uses SWR for caching and revalidation
 */
export function useReformMetrics() {
  const { data, error, isLoading } = useSWR("/api/reforms/metrics", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    metrics: (data?.data as ReformMetric[]) || [],
    isLoading,
    isError: error,
  };
}
