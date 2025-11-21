"use client";

import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';

export interface ThemePreferences {
  theme: Theme;
  accentColor: AccentColor;
  highContrast: boolean;
}

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  accentColor: AccentColor;
  highContrast: boolean;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  setHighContrast: (enabled: boolean) => void;
  toggleTheme: () => void;
}

// Default values for SSR/static generation
const defaultContextValue: ThemeContextType = {
  theme: 'system',
  resolvedTheme: 'light',
  accentColor: 'blue',
  highContrast: false,
  setTheme: () => {},
  setAccentColor: () => {},
  setHighContrast: () => {},
  toggleTheme: () => {},
};

export const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

export function useThemeContext() {
  return useContext(ThemeContext);
}
