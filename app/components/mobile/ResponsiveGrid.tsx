"use client";

import { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ResponsiveGrid({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-5 lg:gap-6',
    lg: 'gap-5 sm:gap-6 lg:gap-8',
    xl: 'gap-6 sm:gap-8 lg:gap-10'
  };

  const getColClasses = () => {
    const { mobile = 1, tablet = 2, desktop = 3 } = cols;
    return `grid-cols-${mobile} sm:grid-cols-${tablet} lg:grid-cols-${desktop}`;
  };

  return (
    <div
      className={`
        grid
        ${getColClasses()}
        ${gapClasses[gap]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Predefined grid layouts for common use cases
export function CardGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 ${className}`}>
      {children}
    </div>
  );
}

export function StatsGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function TwoColumnLayout({
  sidebar,
  main,
  className = ''
}: {
  sidebar: ReactNode;
  main: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col lg:flex-row gap-4 lg:gap-6 ${className}`}>
      <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
        {sidebar}
      </aside>
      <main className="flex-1 min-w-0">
        {main}
      </main>
    </div>
  );
}
