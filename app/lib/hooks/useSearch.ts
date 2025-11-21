"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Fuse from "fuse.js";

export interface SearchItem {
  id: string;
  name: string;
  type: "place" | "reform" | "page" | "report";
  description?: string;
  href: string;
  keywords?: string[];
}

export interface SearchResult {
  item: SearchItem;
  score: number;
}

const HISTORY_KEY = "zoning-reform-search-history";
const MAX_HISTORY = 5;

// Static searchable items for pages and reports
const staticItems: SearchItem[] = [
  // Pages
  { id: "dashboard", name: "Dashboard", type: "page", href: "/dashboard", description: "Main analytics dashboard", keywords: ["analytics", "charts", "data"] },
  { id: "scenario", name: "Scenario Builder", type: "page", href: "/scenario", description: "Model reform scenarios", keywords: ["predict", "model", "forecast"] },
  { id: "timeline", name: "Reform Timeline", type: "page", href: "/timeline", description: "Historical reform timeline", keywords: ["history", "events", "chronology"] },
  { id: "methodology", name: "Methodology", type: "page", href: "/about/methodology", description: "Research methodology", keywords: ["methods", "approach", "analysis"] },
  { id: "data-sources", name: "Data Sources", type: "page", href: "/about/data-sources", description: "Data sources used", keywords: ["census", "api", "datasets"] },
  { id: "limitations", name: "Limitations", type: "page", href: "/about/limitations", description: "Study limitations", keywords: ["caveats", "constraints"] },
  { id: "faq", name: "FAQ", type: "page", href: "/about/faq", description: "Frequently asked questions", keywords: ["help", "questions", "answers"] },
  { id: "sitemap", name: "Site Map", type: "page", href: "/sitemap", description: "Site navigation map", keywords: ["navigation", "pages", "structure"] },

  // Reform types
  { id: "adus", name: "ADU Legalization", type: "reform", href: "/dashboard?reform=ADU", description: "Accessory Dwelling Units", keywords: ["accessory", "dwelling", "granny flat"] },
  { id: "upzoning", name: "Upzoning", type: "reform", href: "/dashboard?reform=Upzoning", description: "Increased density allowances", keywords: ["density", "height", "zoning"] },
  { id: "parking", name: "Parking Reform", type: "reform", href: "/dashboard?reform=Parking", description: "Reduced parking requirements", keywords: ["parking", "minimums", "transit"] },
  { id: "streamlining", name: "Permit Streamlining", type: "reform", href: "/dashboard?reform=Streamlining", description: "Faster permit approvals", keywords: ["permits", "approval", "process"] },
];

export function useSearch(dynamicItems: SearchItem[] = []) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  }, []);

  // Save search history to localStorage
  const saveHistory = useCallback((newHistory: string[]) => {
    setSearchHistory(newHistory);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  }, []);

  // Combine static and dynamic items
  const allItems = useMemo(() => {
    return [...staticItems, ...dynamicItems];
  }, [dynamicItems]);

  // Initialize Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(allItems, {
      keys: [
        { name: "name", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "keywords", weight: 0.2 },
        { name: "type", weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [allItems]);

  // Perform search
  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);

      if (!searchQuery || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        const fuseResults = fuse.search(searchQuery);
        const mappedResults: SearchResult[] = fuseResults.map((r) => ({
          item: r.item,
          score: r.score || 0,
        }));

        setResults(mappedResults.slice(0, 20));
        setIsSearching(false);
      });
    },
    [fuse]
  );

  // Add to search history
  const addToHistory = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      const newHistory = [
        searchQuery,
        ...searchHistory.filter((h) => h !== searchQuery),
      ].slice(0, MAX_HISTORY);

      saveHistory(newHistory);
    },
    [searchHistory, saveHistory]
  );

  // Clear search history
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      place: [],
      reform: [],
      page: [],
      report: [],
    };

    results.forEach((result) => {
      if (groups[result.item.type]) {
        groups[result.item.type].push(result);
      }
    });

    return groups;
  }, [results]);

  return {
    query,
    results,
    groupedResults,
    isSearching,
    searchHistory,
    search,
    addToHistory,
    clearHistory,
    clearSearch,
  };
}

export default useSearch;
