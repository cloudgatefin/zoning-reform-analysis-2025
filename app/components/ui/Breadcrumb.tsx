"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, BarChart3, Map, Info, Clock, FileText, Settings } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const routeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  "": { label: "Home", icon: <Home className="w-4 h-4" /> },
  dashboard: { label: "Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
  scenario: { label: "Scenario Builder", icon: <Settings className="w-4 h-4" /> },
  timeline: { label: "Timeline", icon: <Clock className="w-4 h-4" /> },
  about: { label: "About", icon: <Info className="w-4 h-4" /> },
  methodology: { label: "Methodology", icon: <FileText className="w-4 h-4" /> },
  "data-sources": { label: "Data Sources", icon: <FileText className="w-4 h-4" /> },
  limitations: { label: "Limitations", icon: <FileText className="w-4 h-4" /> },
  faq: { label: "FAQ", icon: <FileText className="w-4 h-4" /> },
  sitemap: { label: "Site Map", icon: <Map className="w-4 h-4" /> },
  live: { label: "Live Data", icon: <BarChart3 className="w-4 h-4" /> },
};

export function Breadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumb on home page
  if (pathname === "/") return null;

  const pathSegments = pathname.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [
    {
      label: "Home",
      href: "/",
      icon: <Home className="w-4 h-4" />,
    },
  ];

  let currentPath = "";
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const config = routeConfig[segment] || {
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      icon: null
    };
    items.push({
      label: config.label,
      href: currentPath,
      icon: config.icon,
    });
  });

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className="flex items-center gap-1 text-sm py-3 px-4 bg-[var(--bg-primary)] border-b border-[var(--border-default)]"
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
              )}

              {isLast ? (
                <span
                  className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium"
                  aria-current="page"
                >
                  {item.icon && <span className="hidden sm:inline">{item.icon}</span>}
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">
                    {item.label.length > 12 ? item.label.slice(0, 12) + "..." : item.label}
                  </span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent-blue)]
                           transition-colors rounded px-1.5 py-0.5 hover:bg-[var(--border-default)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:ring-offset-2
                           focus:ring-offset-[var(--bg-primary)]"
                >
                  {item.icon && <span className="hidden sm:inline">{item.icon}</span>}
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">
                    {index === 0 ? item.icon : (item.label.length > 8 ? item.label.slice(0, 8) + "..." : item.label)}
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
