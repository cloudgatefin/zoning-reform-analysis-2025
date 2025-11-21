"use client";

import { useState, useEffect, useCallback } from "react";

export interface Bookmark {
  id: string;
  name: string;
  type: "state" | "city" | "county";
  href: string;
  addedAt: string;
}

const STORAGE_KEY = "zoning-reform-bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error("Failed to save bookmarks:", error);
      }
    }
  }, [bookmarks, isLoaded]);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, "addedAt">) => {
    setBookmarks((prev) => {
      // Don't add duplicates
      if (prev.some((b) => b.id === bookmark.id)) {
        return prev;
      }
      return [
        ...prev,
        {
          ...bookmark,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isBookmarked = useCallback(
    (id: string) => {
      return bookmarks.some((b) => b.id === id);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (bookmark: Omit<Bookmark, "addedAt">) => {
      if (isBookmarked(bookmark.id)) {
        removeBookmark(bookmark.id);
      } else {
        addBookmark(bookmark);
      }
    },
    [isBookmarked, removeBookmark, addBookmark]
  );

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    clearBookmarks,
    isLoaded,
  };
}

export default useBookmarks;
