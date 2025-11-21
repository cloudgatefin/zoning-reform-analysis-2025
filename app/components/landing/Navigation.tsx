"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BarChart3, Settings } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      isScrolled
        ? 'bg-bg-primary/95 dark:bg-bg-primary/95 backdrop-blur-sm shadow-md'
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto max-w-7xl px-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-accent-current" />
            <span className="font-bold text-xl text-text-primary">Zoning Reform Analysis</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-text-muted hover:text-accent-current transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-2">
              <ThemeToggle size="sm" />
              <Link
                href="/settings"
                className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
                title="Settings"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
            <Link
              href="/dashboard"
              className="bg-accent-current hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-opacity"
            >
              Explore Dashboard
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              className="p-2 text-text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
          <div className="md:hidden bg-bg-card border-t border-border-default py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-3 px-4 text-text-muted hover:text-accent-current hover:bg-bg-secondary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/settings"
              className="block py-3 px-4 text-text-muted hover:text-accent-current hover:bg-bg-secondary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <div className="px-4 pt-3">
              <Link
                href="/dashboard"
                className="block text-center bg-accent-current hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
