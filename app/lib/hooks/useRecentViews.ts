"use client";

import { useState, useEffect, useCallback } from "react";

export interface RecentView {
  id: string;
  name: string;
  type: "state" | "city" | "county" | "page";
  href: string;
  viewedAt: string;
}

const STORAGE_KEY = "zoning-reform-recent-views";
const MAX_RECENT = 10;

export function useRecentViews() {
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentViews(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recent views:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentViews));
      } catch (error) {
        console.error("Failed to save recent views:", error);
      }
    }
  }, [recentViews, isLoaded]);

  const addRecentView = useCallback((view: Omit<RecentView, "viewedAt">) => {
    setRecentViews((prev) => {
      // Remove existing entry if present
      const filtered = prev.filter((v) => v.id !== view.id);

      // Add to beginning with timestamp
      const updated = [
        {
          ...view,
          viewedAt: new Date().toISOString(),
        },
        ...filtered,
      ];

      // Keep only MAX_RECENT items
      return updated.slice(0, MAX_RECENT);
    });
  }, []);

  const clearRecentViews = useCallback(() => {
    setRecentViews([]);
  }, []);

  const getRecentViews = useCallback(
    (limit: number = 5) => {
      return recentViews.slice(0, limit);
    },
    [recentViews]
  );

  return {
    recentViews,
    addRecentView,
    clearRecentViews,
    getRecentViews,
    isLoaded,
  };
}

export default useRecentViews;
