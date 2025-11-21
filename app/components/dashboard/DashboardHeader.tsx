"use client";

import React from "react";
import Link from "next/link";
import { DataExport } from "./DataExport";
import { ReformMetric } from "@/lib/types";
import { BarChart3, Calculator, Home, Info, Map } from "lucide-react";
import { Container, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

interface DashboardHeaderProps {
  data?: ReformMetric[];
}

export function DashboardHeader({ data = [] }: DashboardHeaderProps) {
  return (
    <Container maxWidth="lg" className="py-6">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
            <Home className="w-5 h-5" />
            <span className="text-sm">Home</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link href="/scenario" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
            <Calculator className="w-5 h-5" />
            <span className="text-sm">Scenario Builder</span>
          </Link>
          <Link href="/timeline" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
            <Map className="w-5 h-5" />
            <span className="text-sm">Timeline</span>
          </Link>
          <Link href="/about/methodology" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
            <Info className="w-5 h-5" />
            <span className="text-sm">Methodology</span>
          </Link>
        </div>
      </nav>

      {/* Header Card */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle level="h2" className="text-3xl mb-2">Zoning Reform Dashboard</CardTitle>
              <p className="text-gray-600 font-medium">
                Analysis of zoning reform impact on housing permits across U.S. states
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Real Census Data (2015-2024) • Research-Grade Causal Analysis
              </p>
            </div>
            <div className="flex-shrink-0">
              <DataExport data={data} />
            </div>
          </div>
        </CardHeader>
      </Card>
    </Container>
  );
}
