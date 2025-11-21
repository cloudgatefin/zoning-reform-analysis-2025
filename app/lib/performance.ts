/**
 * Performance tracking and monitoring utilities
 * Tracks Core Web Vitals, API response times, and component render performance
 */

// Web Vitals types
export interface WebVitalsMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  pageUrl: string;
}

export interface APIPerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  size?: number;
}

export interface ComponentRenderMetric {
  component: string;
  duration: number;
  timestamp: number;
  pageUrl: string;
}

// Performance thresholds (based on Google's Core Web Vitals)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Performance store for metrics
class PerformanceStore {
  private webVitals: WebVitalsMetric[] = [];
  private apiMetrics: APIPerformanceMetric[] = [];
  private componentMetrics: ComponentRenderMetric[] = [];
  private alerts: { message: string; level: 'warning' | 'error'; timestamp: number }[] = [];

  addWebVital(metric: WebVitalsMetric) {
    this.webVitals.push(metric);

    // Check for alerts
    if (metric.rating === 'poor') {
      this.addAlert(`Poor ${metric.name}: ${metric.value.toFixed(2)}`, 'error');
    }

    if (this.webVitals.length > 5000) {
      this.webVitals = this.webVitals.slice(-5000);
    }
  }

  addAPIMetric(metric: APIPerformanceMetric) {
    this.apiMetrics.push(metric);

    // Alert on slow API responses
    if (metric.duration > 3000) {
      this.addAlert(`Slow API: ${metric.endpoint} took ${metric.duration}ms`, 'error');
    } else if (metric.duration > 1000) {
      this.addAlert(`API warning: ${metric.endpoint} took ${metric.duration}ms`, 'warning');
    }

    if (this.apiMetrics.length > 5000) {
      this.apiMetrics = this.apiMetrics.slice(-5000);
    }
  }

  addComponentMetric(metric: ComponentRenderMetric) {
    this.componentMetrics.push(metric);
    if (this.componentMetrics.length > 5000) {
      this.componentMetrics = this.componentMetrics.slice(-5000);
    }
  }

  private addAlert(message: string, level: 'warning' | 'error') {
    this.alerts.push({ message, level, timestamp: Date.now() });
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
  }

  getWebVitals() { return this.webVitals; }
  getAPIMetrics() { return this.apiMetrics; }
  getComponentMetrics() { return this.componentMetrics; }
  getAlerts() { return this.alerts; }

  // Get performance summary
  getSummary() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    // Recent web vitals
    const recentVitals = this.webVitals.filter(v => now - v.timestamp < oneDay);

    // Calculate averages for each metric
    const vitalAverages: Record<string, { avg: number; count: number; goodPct: number }> = {};
    const vitalTypes = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP'] as const;

    for (const type of vitalTypes) {
      const vitals = recentVitals.filter(v => v.name === type);
      if (vitals.length > 0) {
        const sum = vitals.reduce((a, v) => a + v.value, 0);
        const goodCount = vitals.filter(v => v.rating === 'good').length;
        vitalAverages[type] = {
          avg: sum / vitals.length,
          count: vitals.length,
          goodPct: (goodCount / vitals.length) * 100,
        };
      }
    }

    // API performance stats
    const recentAPI = this.apiMetrics.filter(m => now - m.timestamp < oneHour);
    const apiStats = {
      totalRequests: recentAPI.length,
      avgDuration: recentAPI.length > 0
        ? recentAPI.reduce((a, m) => a + m.duration, 0) / recentAPI.length
        : 0,
      slowRequests: recentAPI.filter(m => m.duration > 1000).length,
      errorRequests: recentAPI.filter(m => m.status >= 400).length,
    };

    // Slowest endpoints
    const endpointStats: Record<string, { count: number; totalDuration: number }> = {};
    recentAPI.forEach(m => {
      if (!endpointStats[m.endpoint]) {
        endpointStats[m.endpoint] = { count: 0, totalDuration: 0 };
      }
      endpointStats[m.endpoint].count++;
      endpointStats[m.endpoint].totalDuration += m.duration;
    });

    const slowestEndpoints = Object.entries(endpointStats)
      .map(([endpoint, stats]) => ({
        endpoint,
        avgDuration: stats.totalDuration / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    // Recent alerts
    const recentAlerts = this.alerts
      .filter(a => now - a.timestamp < oneDay)
      .slice(-20);

    return {
      webVitals: vitalAverages,
      apiStats,
      slowestEndpoints,
      recentAlerts,
      totalAPIMetrics: this.apiMetrics.length,
      totalWebVitals: this.webVitals.length,
    };
  }

  // Get API endpoint analysis
  getEndpointAnalysis() {
    const endpointData: Record<string, APIPerformanceMetric[]> = {};

    this.apiMetrics.forEach(m => {
      if (!endpointData[m.endpoint]) {
        endpointData[m.endpoint] = [];
      }
      endpointData[m.endpoint].push(m);
    });

    return Object.entries(endpointData).map(([endpoint, metrics]) => {
      const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
      const count = durations.length;

      return {
        endpoint,
        count,
        avg: durations.reduce((a, b) => a + b, 0) / count,
        min: durations[0],
        max: durations[count - 1],
        p50: durations[Math.floor(count * 0.5)],
        p95: durations[Math.floor(count * 0.95)],
        p99: durations[Math.floor(count * 0.99)],
        errorRate: metrics.filter(m => m.status >= 400).length / count,
      };
    }).sort((a, b) => b.count - a.count);
  }

  cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - maxAge;
    this.webVitals = this.webVitals.filter(v => v.timestamp > cutoff);
    this.apiMetrics = this.apiMetrics.filter(m => m.timestamp > cutoff);
    this.componentMetrics = this.componentMetrics.filter(m => m.timestamp > cutoff);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
  }
}

// Singleton instance
export const performanceStore = new PerformanceStore();

// Track Web Vitals (client-side)
export function trackWebVital(name: WebVitalsMetric['name'], value: number) {
  if (typeof window === 'undefined') return;

  const metric: WebVitalsMetric = {
    name,
    value,
    rating: getRating(name, value),
    timestamp: Date.now(),
    pageUrl: window.location.pathname,
  };

  fetch('/api/analytics/performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'webvital', metric }),
  }).catch(() => {});
}

// Track API call performance (use as wrapper)
export async function trackAPICall<T>(
  endpoint: string,
  method: string,
  fetcher: () => Promise<Response>
): Promise<T> {
  const start = performance.now();

  try {
    const response = await fetcher();
    const duration = performance.now() - start;

    const metric: APIPerformanceMetric = {
      endpoint,
      method,
      duration,
      status: response.status,
      timestamp: Date.now(),
    };

    // Store locally (server-side)
    performanceStore.addAPIMetric(metric);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    const duration = performance.now() - start;

    performanceStore.addAPIMetric({
      endpoint,
      method,
      duration,
      status: 500,
      timestamp: Date.now(),
    });

    throw error;
  }
}

// Measure component render time
export function measureRender(component: string): () => void {
  const start = performance.now();

  return () => {
    const duration = performance.now() - start;

    if (typeof window !== 'undefined') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'component',
          metric: {
            component,
            duration,
            timestamp: Date.now(),
            pageUrl: window.location.pathname,
          },
        }),
      }).catch(() => {});
    }
  };
}

// Initialize Web Vitals tracking
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  // Use PerformanceObserver for Core Web Vitals
  try {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      trackWebVital('LCP', lastEntry.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEntry & { processingStart: number; startTime: number };
        trackWebVital('FID', fidEntry.processingStart - fidEntry.startTime);
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const clsEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
        }
      });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Report CLS on page hide
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        trackWebVital('CLS', clsValue);
      }
    });

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
      if (fcpEntry) {
        trackWebVital('FCP', fcpEntry.startTime);
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });

    // Time to First Byte
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      trackWebVital('TTFB', navEntry.responseStart);
    }

  } catch (e) {
    // PerformanceObserver not supported
    console.warn('Web Vitals tracking not supported');
  }
}

// Performance timing helper for API routes
export function createAPITimer() {
  const start = Date.now();
  return {
    elapsed: () => Date.now() - start,
    addHeader: (headers: Headers) => {
      headers.set('Server-Timing', `total;dur=${Date.now() - start}`);
      headers.set('X-Response-Time', `${Date.now() - start}ms`);
    },
  };
}

// Cache performance helper
export class PerformanceCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; hits: number }>();
  private ttl: number;
  private maxSize: number;

  constructor(ttlMs: number = 60000, maxSize: number = 100) {
    this.ttl = ttlMs;
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data;
  }

  set(key: string, data: T): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldest = [...this.cache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) {
        this.cache.delete(oldest[0]);
      }
    }

    this.cache.set(key, { data, timestamp: Date.now(), hits: 0 });
  }

  getStats() {
    const entries = [...this.cache.values()];
    return {
      size: this.cache.size,
      totalHits: entries.reduce((a, e) => a + e.hits, 0),
      oldestEntry: entries.length > 0
        ? Math.min(...entries.map(e => e.timestamp))
        : null,
    };
  }

  clear(): void {
    this.cache.clear();
  }
}

export default {
  trackWebVital,
  trackAPICall,
  measureRender,
  initWebVitals,
  createAPITimer,
  PerformanceCache,
  store: performanceStore,
};
