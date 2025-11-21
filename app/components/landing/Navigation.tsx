"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BarChart3 } from 'lucide-react';

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
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto max-w-7xl px-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">Zoning Reform Analysis</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Explore Dashboard
            </Link>
          </div>

          {/* Mobile Menu Button - Touch optimized */}
          <button
            className="md:hidden flex items-center justify-center min-w-[48px] min-h-[48px] p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-target"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-900" />
            ) : (
              <Menu className="h-6 w-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu - Touch optimized */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center min-h-[48px] py-3 px-4 text-gray-600 hover:text-blue-600 active:bg-gray-100 transition-colors touch-target"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="px-4 pt-3 pb-2">
              <Link
                href="/dashboard"
                className="flex items-center justify-center min-h-[48px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
