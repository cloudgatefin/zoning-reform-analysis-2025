"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  Clock,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Bookmark,
  BarChart3,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import { useBookmarks, Bookmark as BookmarkType } from "@/lib/hooks/useBookmarks";
import { useRecentViews, RecentView } from "@/lib/hooks/useRecentViews";

interface QuickAccessProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Popular searches (static for now, could be dynamic)
const popularSearches = [
  { name: "California", href: "/dashboard?state=CA", type: "state" as const },
  { name: "Minneapolis", href: "/dashboard?city=Minneapolis", type: "city" as const },
  { name: "Oregon", href: "/dashboard?state=OR", type: "state" as const },
  { name: "Austin", href: "/dashboard?city=Austin", type: "city" as const },
  { name: "Montana", href: "/dashboard?state=MT", type: "state" as const },
];

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function QuickAccess({ className = "", collapsed = false, onToggleCollapse }: QuickAccessProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    popular: true,
    recent: true,
    bookmarks: true,
    tools: true,
  });

  const { bookmarks, removeBookmark, clearBookmarks } = useBookmarks();
  const { recentViews, clearRecentViews, getRecentViews } = useRecentViews();

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (collapsed) {
    return (
      <div className={`flex flex-col items-center py-4 gap-4 ${className}`}>
        <button
          onClick={onToggleCollapse}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)] rounded-[var(--radius-sm)] transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-blue)] hover:bg-[var(--border-default)] rounded-[var(--radius-sm)] transition-colors"
            title="Dashboard"
          >
            <BarChart3 className="w-4 h-4" />
          </Link>
          <Link
            href="/scenario"
            className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-blue)] hover:bg-[var(--border-default)] rounded-[var(--radius-sm)] transition-colors"
            title="Scenario Builder"
          >
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <aside className={`space-y-4 ${className}`} aria-label="Quick access">
      {/* Popular Searches */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
        <button
          onClick={() => toggleSection("popular")}
          className="w-full flex items-center justify-between p-3 hover:bg-[var(--border-default)] transition-colors rounded-t-[var(--radius-md)]"
          aria-expanded={expandedSections.popular}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--positive-green)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Popular</span>
          </div>
          {expandedSections.popular ? (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>
        {expandedSections.popular && (
          <div className="px-3 pb-3 space-y-1">
            {popularSearches.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-[var(--text-muted)]
                         hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]
                         rounded-[var(--radius-sm)] transition-colors"
              >
                <span className="text-xs text-[var(--text-muted)]">#{index + 1}</span>
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Views */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
        <button
          onClick={() => toggleSection("recent")}
          className="w-full flex items-center justify-between p-3 hover:bg-[var(--border-default)] transition-colors rounded-t-[var(--radius-md)]"
          aria-expanded={expandedSections.recent}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--accent-blue)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Recent</span>
            {recentViews.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-[var(--border-default)] text-[var(--text-muted)] rounded">
                {recentViews.length}
              </span>
            )}
          </div>
          {expandedSections.recent ? (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>
        {expandedSections.recent && (
          <div className="px-3 pb-3">
            {getRecentViews(5).length > 0 ? (
              <>
                <div className="space-y-1">
                  {getRecentViews(5).map((item: RecentView) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center justify-between px-2 py-1.5 text-sm
                               text-[var(--text-muted)] hover:text-[var(--text-primary)]
                               hover:bg-[var(--border-default)] rounded-[var(--radius-sm)] transition-colors"
                    >
                      <span className="truncate">{item.name}</span>
                      <span className="text-xs text-[var(--text-muted)] ml-2 shrink-0">
                        {formatRelativeTime(item.viewedAt)}
                      </span>
                    </Link>
                  ))}
                </div>
                <button
                  onClick={clearRecentViews}
                  className="mt-2 text-xs text-[var(--text-muted)] hover:text-[var(--negative-red)] transition-colors"
                >
                  Clear history
                </button>
              </>
            ) : (
              <p className="text-xs text-[var(--text-muted)] px-2">No recent views</p>
            )}
          </div>
        )}
      </div>

      {/* Bookmarks */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
        <button
          onClick={() => toggleSection("bookmarks")}
          className="w-full flex items-center justify-between p-3 hover:bg-[var(--border-default)] transition-colors rounded-t-[var(--radius-md)]"
          aria-expanded={expandedSections.bookmarks}
        >
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[var(--warning-orange)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Bookmarks</span>
            {bookmarks.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-[var(--border-default)] text-[var(--text-muted)] rounded">
                {bookmarks.length}
              </span>
            )}
          </div>
          {expandedSections.bookmarks ? (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>
        {expandedSections.bookmarks && (
          <div className="px-3 pb-3">
            {bookmarks.length > 0 ? (
              <>
                <div className="space-y-1">
                  {bookmarks.map((item: BookmarkType) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-2 py-1.5 text-sm
                               hover:bg-[var(--border-default)] rounded-[var(--radius-sm)] transition-colors group"
                    >
                      <Link
                        href={item.href}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] truncate flex-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeBookmark(item.id)}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--negative-red)]
                                 opacity-0 group-hover:opacity-100 transition-all"
                        aria-label={`Remove ${item.name} from bookmarks`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={clearBookmarks}
                  className="mt-2 text-xs text-[var(--text-muted)] hover:text-[var(--negative-red)] transition-colors"
                >
                  Clear all
                </button>
              </>
            ) : (
              <p className="text-xs text-[var(--text-muted)] px-2">No bookmarks yet</p>
            )}
          </div>
        )}
      </div>

      {/* Quick Tools */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
        <button
          onClick={() => toggleSection("tools")}
          className="w-full flex items-center justify-between p-3 hover:bg-[var(--border-default)] transition-colors rounded-t-[var(--radius-md)]"
          aria-expanded={expandedSections.tools}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[var(--accent-blue)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Quick Tools</span>
          </div>
          {expandedSections.tools ? (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>
        {expandedSections.tools && (
          <div className="px-3 pb-3 space-y-1">
            <Link
              href="/scenario"
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-[var(--text-muted)]
                       hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]
                       rounded-[var(--radius-sm)] transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Scenario Builder
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-[var(--text-muted)]
                       hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]
                       rounded-[var(--radius-sm)] transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Compare Mode
            </Link>
            <Link
              href="/about/methodology"
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-[var(--text-muted)]
                       hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]
                       rounded-[var(--radius-sm)] transition-colors"
            >
              <FileText className="w-4 h-4" />
              Reports
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

export default QuickAccess;
