"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  BarChart3,
  Settings,
  Clock,
  Info,
  FileText,
  HelpCircle,
  Database,
  AlertTriangle,
  Map,
  ChevronRight,
  ChevronDown,
  Zap,
  TrendingUp,
} from "lucide-react";

interface SiteMapNode {
  id: string;
  name: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  children?: SiteMapNode[];
  badge?: string;
}

const siteStructure: SiteMapNode[] = [
  {
    id: "home",
    name: "Home",
    href: "/",
    icon: <Home className="w-4 h-4" />,
    description: "Landing page with overview",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/dashboard",
    icon: <BarChart3 className="w-4 h-4" />,
    description: "Main analytics and visualizations",
    badge: "Main",
    children: [
      {
        id: "choropleth",
        name: "State Map",
        href: "/dashboard#map",
        icon: <Map className="w-4 h-4" />,
        description: "Interactive US choropleth map",
      },
      {
        id: "reforms-table",
        name: "Reforms Table",
        href: "/dashboard#reforms",
        icon: <FileText className="w-4 h-4" />,
        description: "Sortable data table",
      },
    ],
  },
  {
    id: "scenario",
    name: "Scenario Builder",
    href: "/scenario",
    icon: <Settings className="w-4 h-4" />,
    description: "Model hypothetical reform scenarios",
    children: [
      {
        id: "predict",
        name: "Predictions",
        href: "/scenario#predictions",
        icon: <TrendingUp className="w-4 h-4" />,
        description: "ML-based forecasts",
      },
    ],
  },
  {
    id: "timeline",
    name: "Reform Timeline",
    href: "/timeline",
    icon: <Clock className="w-4 h-4" />,
    description: "Chronological view of reforms",
  },
  {
    id: "live",
    name: "Live Data",
    href: "/live",
    icon: <Zap className="w-4 h-4" />,
    description: "Real-time Census API data",
    badge: "Live",
  },
  {
    id: "about",
    name: "About",
    href: "/about",
    icon: <Info className="w-4 h-4" />,
    description: "Project information",
    children: [
      {
        id: "methodology",
        name: "Methodology",
        href: "/about/methodology",
        icon: <FileText className="w-4 h-4" />,
        description: "Research approach",
      },
      {
        id: "data-sources",
        name: "Data Sources",
        href: "/about/data-sources",
        icon: <Database className="w-4 h-4" />,
        description: "Where data comes from",
      },
      {
        id: "limitations",
        name: "Limitations",
        href: "/about/limitations",
        icon: <AlertTriangle className="w-4 h-4" />,
        description: "Known constraints",
      },
      {
        id: "faq",
        name: "FAQ",
        href: "/about/faq",
        icon: <HelpCircle className="w-4 h-4" />,
        description: "Common questions",
      },
    ],
  },
];

interface SiteMapNodeProps {
  node: SiteMapNode;
  level: number;
  isMobile?: boolean;
}

function SiteMapNodeItem({ node, level, isMobile = false }: SiteMapNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;

  if (isMobile) {
    return (
      <div className="border-b border-[var(--border-default)] last:border-b-0">
        <div className="flex items-center">
          <Link
            href={node.href}
            className={`flex-1 flex items-center gap-3 p-3 hover:bg-[var(--border-default)] transition-colors
                     ${level > 0 ? "pl-" + (level * 4 + 3) : ""}`}
          >
            <span className="text-[var(--accent-blue)]">{node.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-primary)] font-medium">{node.name}</span>
                {node.badge && (
                  <span className="px-1.5 py-0.5 text-xs bg-[var(--accent-blue)] text-white rounded">
                    {node.badge}
                  </span>
                )}
              </div>
              {node.description && (
                <p className="text-xs text-[var(--text-muted)]">{node.description}</p>
              )}
            </div>
          </Link>
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => (
              <SiteMapNodeItem key={child.id} node={child} level={level + 1} isMobile />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop tree view
  return (
    <div className={`${level > 0 ? "ml-6 border-l border-[var(--border-default)] pl-4" : ""}`}>
      <Link
        href={node.href}
        className="group flex items-start gap-3 p-3 rounded-[var(--radius-md)] hover:bg-[var(--border-default)] transition-colors"
      >
        <span className="text-[var(--accent-blue)] mt-0.5">{node.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-blue)] transition-colors">
              {node.name}
            </span>
            {node.badge && (
              <span className="px-1.5 py-0.5 text-xs bg-[var(--accent-blue)] text-white rounded">
                {node.badge}
              </span>
            )}
          </div>
          {node.description && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{node.description}</p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
      </Link>
      {hasChildren && (
        <div className="mt-1 space-y-1">
          {node.children!.map((child) => (
            <SiteMapNodeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteMapVisual() {
  const totalPages = siteStructure.reduce((acc, node) => {
    return acc + 1 + (node.children?.length || 0);
  }, 0);

  return (
    <div>
      {/* Stats */}
      <div className="flex items-center gap-4 mb-6 text-sm text-[var(--text-muted)]">
        <span>
          <strong className="text-[var(--text-primary)]">{totalPages}</strong> pages
        </span>
        <span>
          <strong className="text-[var(--text-primary)]">{siteStructure.length}</strong> sections
        </span>
      </div>

      {/* Desktop Tree View */}
      <div className="hidden md:block space-y-2">
        {siteStructure.map((node) => (
          <SiteMapNodeItem key={node.id} node={node} level={0} />
        ))}
      </div>

      {/* Mobile Accordion View */}
      <div className="md:hidden bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-md)] overflow-hidden">
        {siteStructure.map((node) => (
          <SiteMapNodeItem key={node.id} node={node} level={0} isMobile />
        ))}
      </div>
    </div>
  );
}

export default SiteMapVisual;
