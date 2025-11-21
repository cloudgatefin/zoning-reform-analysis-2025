"use client";

import { Check, RotateCcw } from 'lucide-react';
import { useThemeContext, AccentColor } from '@/context/ThemeContext';
import ThemeSelector from './ThemeSelector';

const accentColors: { value: AccentColor; label: string; lightColor: string; darkColor: string }[] = [
  { value: 'blue', label: 'Blue', lightColor: '#2563eb', darkColor: '#4a9eff' },
  { value: 'green', label: 'Green', lightColor: '#16a34a', darkColor: '#4ade80' },
  { value: 'purple', label: 'Purple', lightColor: '#9333ea', darkColor: '#a78bfa' },
  { value: 'orange', label: 'Orange', lightColor: '#ea580c', darkColor: '#fb923c' },
  { value: 'red', label: 'Red', lightColor: '#dc2626', darkColor: '#f87171' },
  { value: 'indigo', label: 'Indigo', lightColor: '#4f46e5', darkColor: '#818cf8' },
];

export default function PreferencePanel() {
  const {
    accentColor,
    setAccentColor,
    highContrast,
    setHighContrast,
    setTheme,
    resolvedTheme,
  } = useThemeContext();

  const handleReset = () => {
    setTheme('system');
    setAccentColor('blue');
    setHighContrast(false);
  };

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <ThemeSelector />

      {/* Accent Color */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Accent Color</h3>
          <p className="text-sm text-text-muted">Customize your accent color</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {accentColors.map((color) => (
            <button
              key={color.value}
              onClick={() => setAccentColor(color.value)}
              className={`
                relative w-12 h-12 rounded-lg border-2 transition-all
                ${accentColor === color.value
                  ? 'border-text-primary scale-110'
                  : 'border-transparent hover:scale-105'
                }
              `}
              style={{
                backgroundColor: resolvedTheme === 'dark' ? color.darkColor : color.lightColor,
              }}
              title={color.label}
              aria-label={`${color.label} accent color`}
            >
              {accentColor === color.value && (
                <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* High Contrast */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Accessibility</h3>
          <p className="text-sm text-text-muted">Improve readability and accessibility</p>
        </div>

        <label className="flex items-center justify-between p-4 rounded-lg border border-border-default bg-bg-card cursor-pointer hover:bg-bg-secondary transition-colors">
          <div>
            <div className="font-medium text-text-primary">High Contrast Mode</div>
            <div className="text-sm text-text-muted">
              Maximum contrast for better visibility (WCAG AAA)
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border-default rounded-full peer peer-checked:bg-accent-current transition-colors"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
          </div>
        </label>
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t border-border-default">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
