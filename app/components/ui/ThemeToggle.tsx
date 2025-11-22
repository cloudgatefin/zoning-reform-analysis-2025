"use client";

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeContext } from '@/context/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggle({ showLabel = false, size = 'md' }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-9 h-9' : 'w-10 h-10'} rounded-lg bg-bg-secondary border border-border-default`} />
    );
  }

  return <ThemeToggleContent showLabel={showLabel} size={size} />;
}

function ThemeToggleContent({ showLabel, size }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme, theme } = useThemeContext();

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className={iconSizes[size || 'md']} />;
    }
    return resolvedTheme === 'dark' ? (
      <Moon className={iconSizes[size || 'md']} />
    ) : (
      <Sun className={iconSizes[size || 'md']} />
    );
  };

  const getLabel = () => {
    if (theme === 'system') return 'System';
    return resolvedTheme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size || 'md']}
        rounded-lg
        bg-bg-secondary dark:bg-bg-card
        hover:bg-border-default dark:hover:bg-border-hover
        border border-border-default
        text-text-primary
        transition-all duration-200
        flex items-center gap-2
        focus:outline-none focus:ring-2 focus:ring-accent-current focus:ring-offset-2
        focus:ring-offset-bg-primary
      `}
      title={`Toggle theme (Alt+T) - Currently: ${getLabel()}`}
      aria-label={`Toggle theme. Currently ${getLabel()} mode`}
    >
      {getIcon()}
      {showLabel && (
        <span className="text-sm font-medium">{getLabel()}</span>
      )}
    </button>
  );
}
