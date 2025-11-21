"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calculator,
  Clock,
  Info,
  Settings
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function BottomNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      href: '/scenario',
      label: 'Scenario',
      icon: <Calculator className="w-5 h-5" />
    },
    {
      href: '/timeline',
      label: 'Timeline',
      icon: <Clock className="w-5 h-5" />
    },
    {
      href: '/about',
      label: 'About',
      icon: <Info className="w-5 h-5" />
    },
    {
      href: '/about/faq',
      label: 'FAQ',
      icon: <Settings className="w-5 h-5" />
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-inset-bottom"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center
                min-w-[48px] min-h-[48px] px-2 py-1
                rounded-lg transition-colors
                touch-target
                ${active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
                }
              `}
              aria-current={active ? 'page' : undefined}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium truncate max-w-[60px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
