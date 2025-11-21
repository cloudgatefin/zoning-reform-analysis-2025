"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, MapPin, FileText, BarChart3, Loader2 } from "lucide-react";
import { useSearch, SearchItem, SearchResult } from "@/lib/hooks/useSearch";

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  place: <MapPin className="w-4 h-4" />,
  reform: <BarChart3 className="w-4 h-4" />,
  page: <FileText className="w-4 h-4" />,
  report: <FileText className="w-4 h-4" />,
};

const typeLabels: Record<string, string> = {
  place: "Places",
  reform: "Reforms",
  page: "Pages",
  report: "Reports",
};

export function GlobalSearch({ className = "", placeholder = "Search places, reforms, pages..." }: GlobalSearchProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    results,
    groupedResults,
    isSearching,
    searchHistory,
    search,
    addToHistory,
    clearHistory,
    clearSearch,
  } = useSearch();

  // Flatten results for keyboard navigation
  const flatResults = results;

  // Handle keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }

      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation in results
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && flatResults[selectedIndex]) {
            handleSelect(flatResults[selectedIndex].item);
          }
          break;
      }
    },
    [isOpen, flatResults, selectedIndex]
  );

  // Handle selection
  const handleSelect = useCallback(
    (item: SearchItem) => {
      addToHistory(query);
      clearSearch();
      setIsOpen(false);
      setSelectedIndex(-1);
      router.push(item.href);
    },
    [query, addToHistory, clearSearch, router]
  );

  // Handle input change with debounce
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      search(value);
      setSelectedIndex(-1);
    },
    [search]
  );

  // Handle history item click
  const handleHistoryClick = useCallback(
    (historyItem: string) => {
      search(historyItem);
      inputRef.current?.focus();
    },
    [search]
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)]
                   rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent
                   transition-all"
          aria-label="Search"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-autocomplete="list"
        />

        {/* Keyboard shortcut hint */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={() => {
                clearSearch();
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-[var(--border-default)] rounded transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3 h-3 text-[var(--text-muted)]" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs
                        text-[var(--text-muted)] bg-[var(--border-default)] rounded">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          id="search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-primary)] border border-[var(--border-default)]
                   rounded-[var(--radius-md)] shadow-lg max-h-96 overflow-y-auto z-50"
          role="listbox"
        >
          {/* Loading state */}
          {isSearching && (
            <div className="flex items-center gap-2 p-4 text-[var(--text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </div>
          )}

          {/* Results */}
          {!isSearching && results.length > 0 && (
            <div className="py-2">
              {Object.entries(groupedResults).map(([type, typeResults]) => {
                if (typeResults.length === 0) return null;

                return (
                  <div key={type}>
                    <div className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {typeLabels[type]}
                    </div>
                    {typeResults.map((result) => {
                      const globalIndex = flatResults.findIndex(
                        (r) => r.item.id === result.item.id
                      );
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={result.item.id}
                          onClick={() => handleSelect(result.item)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                                   ${isSelected ? "bg-[var(--border-default)]" : "hover:bg-[var(--border-default)]"}`}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <span className="text-[var(--text-muted)]">
                            {typeIcons[result.item.type]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[var(--text-primary)] truncate">
                              {result.item.name}
                            </div>
                            {result.item.description && (
                              <div className="text-xs text-[var(--text-muted)] truncate">
                                {result.item.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* No results */}
          {!isSearching && query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-[var(--text-muted)]">
              No results found for "{query}"
            </div>
          )}

          {/* Search history */}
          {!isSearching && query.length < 2 && searchHistory.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Recent Searches
                </span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors"
                >
                  Clear
                </button>
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--border-default)] transition-colors"
                >
                  <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-primary)]">{item}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isSearching && query.length < 2 && searchHistory.length === 0 && (
            <div className="p-4 text-center text-[var(--text-muted)]">
              Type to search places, reforms, and pages
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
