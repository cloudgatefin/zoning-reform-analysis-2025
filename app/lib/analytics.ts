/**
 * Analytics utilities for privacy-respecting user tracking
 * Implements event tracking, page views, and user behavior analysis
 */

// Types for analytics events
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: number;
  sessionId: string;
  pageUrl: string;
}

export interface PageView {
  path: string;
  title: string;
  referrer: string;
  timestamp: number;
  sessionId: string;
  loadTime?: number;
}

export interface UserInteraction {
  type: 'click' | 'filter' | 'download' | 'search' | 'scroll';
  target: string;
  value?: string;
  timestamp: number;
  sessionId: string;
}

export interface ErrorEvent {
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  timestamp: number;
  sessionId: string;
  pageUrl: string;
}

// Analytics storage (in-memory for demo, would use database in production)
class AnalyticsStore {
  private events: AnalyticsEvent[] = [];
  private pageViews: PageView[] = [];
  private interactions: UserInteraction[] = [];
  private errors: ErrorEvent[] = [];
  private sessions: Map<string, { start: number; lastActivity: number; pageViews: number }> = new Map();

  addEvent(event: AnalyticsEvent) {
    this.events.push(event);
    this.updateSession(event.sessionId);
    // Keep last 10000 events in memory
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }
  }

  addPageView(pageView: PageView) {
    this.pageViews.push(pageView);
    this.updateSession(pageView.sessionId, true);
    if (this.pageViews.length > 10000) {
      this.pageViews = this.pageViews.slice(-10000);
    }
  }

  addInteraction(interaction: UserInteraction) {
    this.interactions.push(interaction);
    this.updateSession(interaction.sessionId);
    if (this.interactions.length > 10000) {
      this.interactions = this.interactions.slice(-10000);
    }
  }

  addError(error: ErrorEvent) {
    this.errors.push(error);
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000);
    }
  }

  private updateSession(sessionId: string, isPageView = false) {
    const now = Date.now();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = now;
      if (isPageView) session.pageViews++;
    } else {
      this.sessions.set(sessionId, { start: now, lastActivity: now, pageViews: isPageView ? 1 : 0 });
    }
  }

  getEvents() { return this.events; }
  getPageViews() { return this.pageViews; }
  getInteractions() { return this.interactions; }
  getErrors() { return this.errors; }
  getSessions() { return this.sessions; }

  // Analytics aggregations
  getMetrics() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;
    const oneWeek = 7 * oneDay;

    // Active sessions (last 30 minutes)
    const activeSessions = Array.from(this.sessions.values())
      .filter(s => now - s.lastActivity < 30 * 60 * 1000).length;

    // Page views by time period
    const pageViewsLastHour = this.pageViews.filter(pv => now - pv.timestamp < oneHour).length;
    const pageViewsLastDay = this.pageViews.filter(pv => now - pv.timestamp < oneDay).length;
    const pageViewsLastWeek = this.pageViews.filter(pv => now - pv.timestamp < oneWeek).length;

    // Most popular pages
    const pageCount: Record<string, number> = {};
    this.pageViews.forEach(pv => {
      pageCount[pv.path] = (pageCount[pv.path] || 0) + 1;
    });
    const popularPages = Object.entries(pageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Most common interactions
    const interactionCount: Record<string, number> = {};
    this.interactions.forEach(i => {
      const key = `${i.type}:${i.target}`;
      interactionCount[key] = (interactionCount[key] || 0) + 1;
    });
    const topInteractions = Object.entries(interactionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => {
        const [type, target] = key.split(':');
        return { type, target, count };
      });

    // Error summary
    const errorCount: Record<string, number> = {};
    this.errors.forEach(e => {
      errorCount[e.message] = (errorCount[e.message] || 0) + 1;
    });
    const topErrors = Object.entries(errorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    // Average session duration
    const sessionDurations = Array.from(this.sessions.values())
      .map(s => s.lastActivity - s.start)
      .filter(d => d > 0);
    const avgSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
      : 0;

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      totalPageViews: this.pageViews.length,
      pageViewsLastHour,
      pageViewsLastDay,
      pageViewsLastWeek,
      popularPages,
      topInteractions,
      totalErrors: this.errors.length,
      topErrors,
      avgSessionDuration,
      totalEvents: this.events.length,
    };
  }

  // Get usage patterns
  getUsagePatterns() {
    const hourlyUsage: Record<number, number> = {};
    const dailyUsage: Record<number, number> = {};

    this.pageViews.forEach(pv => {
      const date = new Date(pv.timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
      dailyUsage[day] = (dailyUsage[day] || 0) + 1;
    });

    return { hourlyUsage, dailyUsage };
  }

  // Get filter usage
  getFilterUsage() {
    const filterInteractions = this.interactions.filter(i => i.type === 'filter');
    const filterCount: Record<string, number> = {};

    filterInteractions.forEach(i => {
      const key = i.value || i.target;
      filterCount[key] = (filterCount[key] || 0) + 1;
    });

    return Object.entries(filterCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([filter, count]) => ({ filter, count }));
  }

  // Get download patterns
  getDownloadPatterns() {
    const downloads = this.interactions.filter(i => i.type === 'download');
    const downloadCount: Record<string, number> = {};

    downloads.forEach(d => {
      const key = d.value || d.target;
      downloadCount[key] = (downloadCount[key] || 0) + 1;
    });

    return Object.entries(downloadCount)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));
  }

  // Clear old data
  cleanup(maxAge: number = 30 * 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - maxAge;
    this.events = this.events.filter(e => e.timestamp > cutoff);
    this.pageViews = this.pageViews.filter(pv => pv.timestamp > cutoff);
    this.interactions = this.interactions.filter(i => i.timestamp > cutoff);
    this.errors = this.errors.filter(e => e.timestamp > cutoff);

    // Clean up old sessions
    for (const [id, session] of this.sessions) {
      if (session.lastActivity < cutoff) {
        this.sessions.delete(id);
      }
    }
  }
}

// Singleton instance
export const analyticsStore = new AnalyticsStore();

// Generate session ID (stored in localStorage on client)
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Track page view
export function trackPageView(path: string, title: string, loadTime?: number) {
  if (typeof window === 'undefined') return;

  const pageView: PageView = {
    path,
    title,
    referrer: document.referrer || '',
    timestamp: Date.now(),
    sessionId: getSessionId(),
    loadTime,
  };

  // Send to API
  fetch('/api/analytics/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pageView),
  }).catch(() => {
    // Silent fail - analytics should not break the app
  });
}

// Track custom event
export function trackEvent(name: string, properties?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;

  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    pageUrl: window.location.pathname,
  };

  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch(() => {});
}

// Track user interaction
export function trackInteraction(
  type: UserInteraction['type'],
  target: string,
  value?: string
) {
  if (typeof window === 'undefined') return;

  const interaction: UserInteraction = {
    type,
    target,
    value,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };

  fetch('/api/analytics/interaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(interaction),
  }).catch(() => {});
}

// Track error
export function trackError(error: Error, source?: string) {
  if (typeof window === 'undefined') return;

  const errorEvent: ErrorEvent = {
    message: error.message,
    stack: error.stack,
    source,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    pageUrl: window.location.pathname,
  };

  fetch('/api/analytics/error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorEvent),
  }).catch(() => {});
}

// Helper functions for common tracking scenarios
export const analytics = {
  // Track button click
  buttonClick: (buttonName: string) => {
    trackInteraction('click', buttonName);
    trackEvent('button_click', { button: buttonName });
  },

  // Track filter change
  filterChange: (filterName: string, value: string) => {
    trackInteraction('filter', filterName, value);
    trackEvent('filter_change', { filter: filterName, value });
  },

  // Track search
  search: (query: string, resultsCount: number) => {
    trackInteraction('search', 'search_input', query);
    trackEvent('search', { query, results: resultsCount });
  },

  // Track data export
  dataExport: (format: string, dataType: string) => {
    trackInteraction('download', dataType, format);
    trackEvent('data_export', { format, type: dataType });
  },

  // Track reform selection
  reformSelected: (reformId: string, reformType: string) => {
    trackEvent('reform_selected', { reformId, reformType });
  },

  // Track place selection
  placeSelected: (placeId: string, placeName: string) => {
    trackEvent('place_selected', { placeId, placeName });
  },

  // Track chart interaction
  chartInteraction: (chartName: string, action: string) => {
    trackEvent('chart_interaction', { chart: chartName, action });
  },

  // Track scenario builder usage
  scenarioCreated: (params: Record<string, string | number | boolean>) => {
    trackEvent('scenario_created', params);
  },

  // Track map interaction
  mapInteraction: (action: string, target?: string) => {
    trackEvent('map_interaction', { action, target: target || '' });
  },
};

export default analytics;
