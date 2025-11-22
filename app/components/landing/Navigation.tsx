"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BarChart3, Search } from 'lucide-react';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#data-quality', label: 'Methodology' },
    { href: '#users', label: 'For Whom' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-[var(--bg-primary)]/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto max-w-7xl px-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-[var(--accent-current)]" />
            <span className="font-bold text-xl text-[var(--text-primary)]">Zoning Reform Analysis</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[var(--text-muted)] hover:text-[var(--accent-current)] transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-current)] transition-colors"
                aria-label="Search"
                title="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <ThemeToggle size="sm" />
            </div>
            <Link
              href="/dashboard"
              className="bg-[var(--accent-current)] hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-opacity"
            >
              Explore Dashboard
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              className="p-2 text-[var(--text-primary)]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[var(--bg-card)] border-t border-[var(--border-default)] py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-3 px-4 text-[var(--text-muted)] hover:text-[var(--accent-current)] hover:bg-[var(--bg-secondary)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="px-4 pt-3">
              <Link
                href="/dashboard"
                className="block text-center bg-[var(--accent-current)] hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Search Dropdown */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 bg-[var(--bg-card)] shadow-lg border-t border-[var(--border-default)] p-4">
            <div className="container mx-auto max-w-2xl">
              <GlobalSearch placeholder="Search places, reforms, pages..." />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
