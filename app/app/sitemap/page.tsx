import React from "react";
import { Metadata } from "next";
import { SiteMapVisual } from "@/components/SiteMapVisual";
import { Map } from "lucide-react";

export const metadata: Metadata = {
  title: "Site Map | Zoning Reform Analysis",
  description: "Navigate all pages and features of the Zoning Reform Analysis platform",
};

export default function SiteMapPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[var(--accent-blue)]/10 rounded-[var(--radius-md)]">
              <Map className="w-6 h-6 text-[var(--accent-blue)]" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Site Map</h1>
          </div>
          <p className="text-[var(--text-muted)] max-w-2xl">
            Explore all pages and features available in the Zoning Reform Analysis platform.
            Click any item to navigate directly to that page.
          </p>
        </div>

        {/* Site Map Visual */}
        <SiteMapVisual />

        {/* Help Section */}
        <div className="mt-12 p-6 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            Need Help Finding Something?
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Use the global search (press <kbd className="px-1.5 py-0.5 bg-[var(--border-default)] rounded text-xs">Cmd+K</kbd> or <kbd className="px-1.5 py-0.5 bg-[var(--border-default)] rounded text-xs">Ctrl+K</kbd>)
            to quickly find any place, reform, or page across the platform.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href="/about/faq"
              className="text-[var(--accent-blue)] hover:underline"
            >
              View FAQ
            </a>
            <span className="text-[var(--text-muted)]">|</span>
            <a
              href="/about/methodology"
              className="text-[var(--accent-blue)] hover:underline"
            >
              Read Methodology
            </a>
            <span className="text-[var(--text-muted)]">|</span>
            <a
              href="/dashboard"
              className="text-[var(--accent-blue)] hover:underline"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
