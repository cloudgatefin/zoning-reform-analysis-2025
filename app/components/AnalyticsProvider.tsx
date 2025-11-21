'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, trackError, getSessionId } from '@/lib/analytics';
import { initWebVitals } from '@/lib/performance';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Track page views on route change
  useEffect(() => {
    const start = performance.now();

    // Small delay to ensure page is loaded
    const timer = setTimeout(() => {
      const loadTime = performance.now() - start;
      trackPageView(pathname, document.title, loadTime);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Initialize Web Vitals tracking on mount
  useEffect(() => {
    initWebVitals();

    // Initialize session
    getSessionId();
  }, []);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), event.filename);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
      trackError(error, 'unhandled-promise');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}

export default AnalyticsProvider;
