"use client";

import Link from 'next/link';
import { ArrowLeft, Palette, Settings as SettingsIcon } from 'lucide-react';
import PreferencePanel from '@/components/settings/PreferencePanel';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-primary border-b border-border-default">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-accent-current" />
              <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="bg-bg-card rounded-lg border border-border-default p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-default">
            <Palette className="h-6 w-6 text-accent-current" />
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Appearance</h2>
              <p className="text-sm text-text-muted">Customize how the app looks and feels</p>
            </div>
          </div>

          <PreferencePanel />
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-bg-card rounded-lg border border-border-default p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Preview</h3>
          <div className="space-y-4">
            {/* Sample Card */}
            <div className="p-4 rounded-lg bg-bg-secondary border border-border-default">
              <h4 className="font-medium text-text-primary">Sample Card</h4>
              <p className="text-sm text-text-muted mt-1">
                This is how content will appear with your current theme settings.
              </p>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1.5 text-sm font-medium rounded-md bg-accent-current text-white hover:opacity-90 transition-opacity">
                  Primary Action
                </button>
                <button className="px-3 py-1.5 text-sm font-medium rounded-md border border-border-default text-text-primary hover:bg-bg-secondary transition-colors">
                  Secondary
                </button>
              </div>
            </div>

            {/* Sample Status Indicators */}
            <div className="flex flex-wrap gap-3">
              <span className="px-2 py-1 text-xs font-medium rounded bg-positive-green/20 text-positive-green">
                Success
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded bg-warning-orange/20 text-warning-orange">
                Warning
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded bg-negative-red/20 text-negative-red">
                Error
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded bg-accent-current/20 text-accent-current">
                Info
              </span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-8 bg-bg-card rounded-lg border border-border-default p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Keyboard Shortcuts</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Toggle theme</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-bg-secondary border border-border-default rounded">
                Alt + T
              </kbd>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
