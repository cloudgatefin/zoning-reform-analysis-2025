"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Theme, AccentColor, ThemePreferences } from '@/context/ThemeContext';

const STORAGE_KEY = 'zoning-theme-preference';

const defaultPreferences: ThemePreferences = {
  theme: 'system',
  accentColor: 'blue',
  highContrast: false,
};

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadPreferences(): ThemePreferences {
  if (typeof window === 'undefined') return defaultPreferences;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load theme preferences:', e);
  }
  return defaultPreferences;
}

function savePreferences(prefs: ThemePreferences): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save theme preferences:', e);
  }
}

export function useTheme() {
  const [preferences, setPreferences] = useState<ThemePreferences>(defaultPreferences);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
    setMounted(true);
  }, []);

  // Resolve theme based on preference
  useEffect(() => {
    if (!mounted) return;

    const resolved = preferences.theme === 'system'
      ? getSystemTheme()
      : preferences.theme;
    setResolvedTheme(resolved);

    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

    // Apply high contrast
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply accent color
    root.setAttribute('data-accent', preferences.accentColor);
  }, [preferences, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (preferences.theme === 'system') {
        setResolvedTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [preferences.theme]);

  const setTheme = useCallback((theme: Theme) => {
    setPreferences(prev => {
      const next = { ...prev, theme };
      savePreferences(next);
      return next;
    });
  }, []);

  const setAccentColor = useCallback((accentColor: AccentColor) => {
    setPreferences(prev => {
      const next = { ...prev, accentColor };
      savePreferences(next);
      return next;
    });
  }, []);

  const setHighContrast = useCallback((highContrast: boolean) => {
    setPreferences(prev => {
      const next = { ...prev, highContrast };
      savePreferences(next);
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferences(prev => {
      const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light';
      const next = { ...prev, theme: nextTheme as Theme };
      savePreferences(next);
      return next;
    });
  }, [resolvedTheme]);

  return {
    theme: preferences.theme,
    resolvedTheme,
    accentColor: preferences.accentColor,
    highContrast: preferences.highContrast,
    setTheme,
    setAccentColor,
    setHighContrast,
    toggleTheme,
    mounted,
  };
}
