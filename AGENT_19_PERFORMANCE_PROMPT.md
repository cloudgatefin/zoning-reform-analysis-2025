# Agent 19: Performance & Analytics Optimization

**Objective:** Make the app fast and understand how users interact with it
**Timeline:** 10-12 hours
**Status:** Ready to launch
**Budget:** $25-35 API cost

---

## Deliverables

### 1. Performance Optimization
- Code splitting (lazy load pages)
- Image optimization and compression
- Minify and defer CSS/JS
- Implement proper caching headers
- Lazy load charts/tables on scroll
- Optimize API query payloads

**Target Metrics:**
- Page load: < 2 seconds
- API response: < 500ms
- Largest Contentful Paint: < 1.5s
- Cumulative Layout Shift: < 0.1

### 2. Analytics Implementation
- Page view tracking (where users go)
- User interaction tracking (what they click)
- Error tracking (what breaks)
- Heatmaps (where users focus)
- Funnels (where users drop off)
- Session tracking (how long they use)

**Track:**
- Page views (which pages visited)
- Button clicks (which features used)
- Filter changes (what they search for)
- Downloads/exports (data extraction patterns)
- Errors (what breaks for users)

### 3. Database Query Optimization
- Optimize API endpoints
- Add pagination to large datasets
- Cache frequently-accessed data
- Index important fields
- Reduce data transfer size

### 4. Admin Analytics Dashboard
- Metrics overview page (private, admin only)
- Total users and active sessions
- Most popular places/reforms
- Common user flows
- Error logs with frequency
- Performance metrics
- Usage trends (daily/weekly/monthly)

**Pages:**
- `/admin/analytics` - Main dashboard
- `/admin/analytics/usage` - Usage patterns
- `/admin/analytics/errors` - Error logs
- `/admin/analytics/performance` - Load times

### 5. Monitoring & Alerts
- Alert if page load > 3 seconds
- Monitor API response times
- Track error rates
- Email/alert on critical errors
- Daily summary report

---

## Technical Requirements

### Libraries
- `next-analytics` or `plausible` for privacy-respecting analytics
- `sentry` for error tracking
- Implement custom event tracking

### Implementation
```
NEW:
  app/lib/analytics.ts - Analytics utilities
  app/lib/performance.ts - Performance tracking
  app/components/admin/AnalyticsDashboard.tsx
  app/app/admin/analytics/page.tsx
  app/middleware.ts - Add timing headers

MODIFIED:
  app/app/layout.tsx - Add analytics
  API routes - Add timing/logging
  All pages - Add tracking events
```

### Quality Criteria
✅ Page load < 2 seconds (Core Web Vitals)
✅ Analytics accurate and privacy-respecting
✅ No performance degradation from tracking
✅ Errors tracked and logged
✅ Analytics secure (admin only)
✅ No user data stored unnecessarily

---

## Success Definition

After completion:
1. ✅ App loads fast (< 2s)
2. ✅ Analytics dashboard shows real usage
3. ✅ Can identify most popular features
4. ✅ Can see where users drop off
5. ✅ Errors are tracked and visible
6. ✅ Performance is measurable

---

## Metrics to Track

**Core Web Vitals:**
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

**Custom Metrics:**
- API response times
- Filter application speed
- Chart rendering time
- Search response time

**User Behavior:**
- Most viewed pages
- Most searched places/reforms
- Most used filters
- Most exported data types
- Common user flows

**Errors:**
- JavaScript errors
- API failures
- Failed exports
- Failed searches

---

## Implementation Priority

1. Add analytics tracking (highest value)
2. Create admin dashboard (insight)
3. Optimize page load (speed)
4. Optimize API queries (responsiveness)
5. Error tracking (reliability)
6. Monitoring/alerts (stability)

---

## When Done, Commit With

```
Agent 19: Performance & Analytics Optimization

- Implemented comprehensive analytics tracking
- Created admin analytics dashboard
- Optimized page load time (< 2s target)
- Added error tracking with Sentry
- Optimized API queries and caching
- Added performance monitoring
- Implemented privacy-respecting analytics

Build: ✅ Zero errors
Performance: ✅ LCP < 1.5s, Page load < 2s
Analytics: ✅ Tracking live and accurate
```

---

**Ready to make the app fast and measurable!** ⚡

