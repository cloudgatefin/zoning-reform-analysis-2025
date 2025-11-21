"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  BarChart3,
  LayoutDashboard,
  Calculator,
  Clock,
  Info,
  FileText,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuItems: MenuItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Explore reform data'
    },
    {
      href: '/scenario',
      label: 'Scenario Builder',
      icon: <Calculator className="w-5 h-5" />,
      description: 'Model policy impacts'
    },
    {
      href: '/timeline',
      label: 'Timeline',
      icon: <Clock className="w-5 h-5" />,
      description: 'Reform history'
    },
    {
      href: '/about',
      label: 'About',
      icon: <Info className="w-5 h-5" />,
      description: 'Project overview'
    },
    {
      href: '/about/methodology',
      label: 'Methodology',
      icon: <FileText className="w-5 h-5" />,
      description: 'Research approach'
    },
    {
      href: '/about/faq',
      label: 'FAQ',
      icon: <HelpCircle className="w-5 h-5" />,
      description: 'Common questions'
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          md:hidden flex items-center justify-center
          min-w-[48px] min-h-[48px] p-2
          rounded-lg transition-colors
          hover:bg-gray-100 active:bg-gray-200
          touch-target
        "
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-900" />
        ) : (
          <Menu className="h-6 w-6 text-gray-900" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Menu */}
      <div
        id="mobile-menu"
        className={`
          fixed top-0 right-0 bottom-0 w-[85%] max-w-sm
          bg-white z-50 transform transition-transform duration-300 ease-in-out
          md:hidden overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setIsOpen(false)}
          >
            <BarChart3 className="h-7 w-7 text-blue-600" />
            <span className="font-bold text-lg text-gray-900">Zoning Reform</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="
              flex items-center justify-center
              min-w-[48px] min-h-[48px] p-2
              rounded-lg transition-colors
              hover:bg-gray-100 active:bg-gray-200
              touch-target
            "
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4" aria-label="Main navigation">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3
                      min-h-[56px] px-4 py-3
                      rounded-lg transition-colors
                      touch-target
                      ${active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={active ? 'text-blue-600' : 'text-gray-500'}>
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500">{item.description}</div>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-gray-400'}`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* CTA Button */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/dashboard"
            className="
              block w-full text-center
              bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              text-white font-medium
              px-6 py-4 rounded-lg
              transition-colors
              min-h-[48px]
            "
            onClick={() => setIsOpen(false)}
          >
            Explore Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
