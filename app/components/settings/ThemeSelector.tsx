"use client";

import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useThemeContext, Theme } from '@/context/ThemeContext';

const themeOptions: { value: Theme; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Classic light theme',
    icon: <Sun className="h-5 w-5" />,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes',
    icon: <Moon className="h-5 w-5" />,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Match OS preference',
    icon: <Monitor className="h-5 w-5" />,
  },
];

export default function ThemeSelector() {
  const { theme, setTheme, resolvedTheme } = useThemeContext();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Theme</h3>
        <p className="text-sm text-text-muted">Choose your preferred appearance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${theme === option.value
                ? 'border-accent-current bg-accent-current/10'
                : 'border-border-default hover:border-border-hover bg-bg-card'
              }
            `}
          >
            {theme === option.value && (
              <div className="absolute top-2 right-2">
                <Check className="h-4 w-4 text-accent-current" />
              </div>
            )}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`${theme === option.value ? 'text-accent-current' : 'text-text-muted'}`}>
                {option.icon}
              </div>
              <div>
                <div className="font-medium text-text-primary">{option.label}</div>
                <div className="text-xs text-text-muted">{option.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {theme === 'system' && (
        <p className="text-xs text-text-muted">
          Currently using: {resolvedTheme === 'dark' ? 'Dark' : 'Light'} (based on your system settings)
        </p>
      )}
    </div>
  );
}
