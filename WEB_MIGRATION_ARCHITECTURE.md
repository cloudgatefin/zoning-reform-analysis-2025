# Web Migration Architecture Plan

## Executive Summary

This document outlines the migration from the current vanilla HTML/CSS/JS prototype to a modern framework-based application with real-time Census API integration.

---

## 1. Framework Choice: **Next.js 14+ (App Router)**

### Rationale:
- **Data-first**: Next.js excels at data-heavy dashboards with Server Components
- **API Integration**: Built-in API routes for proxying Census API calls securely
- **Performance**: Automatic code splitting, image optimization, built-in caching
- **Developer Experience**: TypeScript support, Fast Refresh, excellent tooling
- **Deployment**: Easy deployment to Vercel, Netlify, or self-hosted
- **SEO**: SSR/SSG capabilities if dashboard becomes public-facing

### Alternative Considered:
- **Vite + React**: Faster dev server but requires manual API setup and more boilerplate
- **Verdict**: Next.js provides more out-of-the-box for this use case

---

## 2. Component Structure & Hierarchy

```
app/
├── layout.tsx                 # Root layout with design system provider
├── page.tsx                   # Main dashboard page
├── api/
│   ├── census/
│   │   ├── permits/route.ts   # Proxy to Census API (secure key handling)
│   │   └── timeseries/route.ts
│   └── reforms/
│       └── metrics/route.ts   # Serve computed metrics
│
components/
├── dashboard/
│   ├── DashboardHeader.tsx    # Title, download button, data source pill
│   ├── FilterControls.tsx     # Jurisdiction select, type filter, clear button
│   ├── SummaryCards.tsx       # 3-card grid (reforms, avg %, date range)
│   ├── PercentChangeChart.tsx # Bar chart (Chart.js wrapper)
│   ├── ReformsTable.tsx       # Sortable table with filters
│   ├── ReformMap.tsx          # D3 choropleth map with tooltips
│   ├── StateDetail.tsx        # State detail panel
│   └── StateTrendChart.tsx    # Line chart for selected state
│
├── ui/                        # Design system primitives
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Select.tsx
│   ├── Table.tsx
│   └── Tooltip.tsx
│
lib/
├── census-api.ts              # Census API client functions
├── data-transforms.ts         # Data normalization, aggregation
├── hooks/
│   ├── useReformMetrics.ts    # SWR/React Query for metrics
│   ├── useTimeseries.ts       # SWR/React Query for timeseries
│   └── useFilters.ts          # Filter state management
│
styles/
├── globals.css                # Tailwind imports + CSS variables
└── design-tokens.css          # Extracted color/spacing tokens
```

---

## 3. Design System Tokens

### Colors (Dark Theme)
```css
:root {
  /* Backgrounds */
  --bg-primary: #020617;        /* slate-950 */
  --bg-card: #020617;
  --bg-card-soft: #020617;

  /* Borders */
  --border-default: #1f2937;    /* gray-800 */
  --border-hover: #374151;      /* gray-700 */

  /* Text */
  --text-primary: #e5e7eb;      /* gray-200 */
  --text-muted: #9ca3af;        /* gray-400 */

  /* Accent Colors */
  --accent-blue: #2563eb;       /* blue-600 */
  --positive-green: #22c55e;    /* green-500 */
  --negative-red: #ef4444;      /* red-500 */
  --warning-orange: #f97316;    /* orange-500 */
}
```

### Typography
```css
--font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
--font-size-xs: 11px;
--font-size-sm: 12px;
--font-size-base: 13px;
--font-size-md: 14px;
--font-size-lg: 18px;
```

### Spacing
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
```

### Border Radius
```css
--radius-sm: 8px;
--radius-md: 10px;
--radius-lg: 14px;
```

### Recommendation: Use Tailwind CSS + CSS Variables
- Configure Tailwind to use these tokens
- Maintain CSS variables for complex calculations
- Best of both worlds: utility classes + theming

---

## 4. Page Layout Architecture

### Responsive Grid System

```
┌─────────────────────────────────────────┐
│ Header (title, download, data source)  │
├─────────────────────────────────────────┤
│ Filter Controls (sticky on scroll)     │
├─────────────────────────────────────────┤
│ Summary Cards (3-col grid)             │
├───────────────────┬─────────────────────┤
│ Bar Chart         │ Reforms Table       │
│ (1.1fr)           │ (1.3fr)            │
├───────────────────┴─────────────────────┤
│ Reform Map        │ State Detail        │
│ (1.4fr)           │ (1.1fr)            │
└───────────────────┴─────────────────────┘
```

**Breakpoints:**
- Mobile (<640px): Single column, stacked
- Tablet (640-900px): 1-2 column hybrid
- Desktop (900px+): 2-column grid as shown

---

## 5. Data Architecture & Census API Integration

### Current Python Pipeline (KEEP & ENHANCE):

```
scripts/01_collect_permits.py  → Real Census API calls with fallback
scripts/02_code_reforms.py     → Manual reform catalog (could move to DB)
scripts/03_compute_metrics.py  → Pre/post analysis
```

### Migration Strategy for Data:

**Option A: Hybrid (RECOMMENDED)**
- Keep Python scripts for batch processing/backfill
- Add Next.js API routes for real-time data
- Use SWR/React Query for client-side caching

**Option B: Full JavaScript**
- Rewrite Python scripts in Node.js
- Use API routes exclusively
- More maintenance overhead

### Census API Integration Plan:

```typescript
// lib/census-api.ts
export async function fetchStatePermits(apiKey: string) {
  const response = await fetch(
    'https://api.census.gov/data/timeseries/bps/permits?' +
    'get=time,areaname,state,value,unit,areatype&for=state:*' +
    `&key=${apiKey}`,
    { next: { revalidate: 86400 } } // Cache for 24h
  );
  return response.json();
}

// app/api/census/permits/route.ts
export async function GET() {
  const apiKey = process.env.CENSUS_API_KEY;
  const data = await fetchStatePermits(apiKey);
  return Response.json(data);
}
```

**Environment Variables:**
```env
CENSUS_API_KEY=your_key_here
```

---

## 6. Migration Strategy

### Phase 1: Scaffolding + Design System (Week 1)
1. Initialize Next.js 14+ with App Router
   ```bash
   npx create-next-app@latest zoning-dashboard --typescript --tailwind --app
   ```
2. Set up folder structure
3. Extract design tokens to CSS variables + Tailwind config
4. Create UI primitives (Button, Card, Select, Table, Tooltip)
5. Set up Census API proxy routes with real API key

### Phase 2: Core Components (Week 2)
1. Migrate DashboardHeader
2. Migrate FilterControls with React state
3. Migrate SummaryCards
4. Set up SWR/React Query for data fetching

### Phase 3: Visualizations (Week 2-3)
1. Migrate PercentChangeChart (Chart.js in React)
2. Migrate ReformsTable with sorting/filtering
3. Migrate ReformMap (D3 in React, refs + useEffect)
4. Migrate StateDetail + StateTrendChart

### Phase 4: Data Integration (Week 3)
1. Test real Census API calls via proxy routes
2. Integrate Python-generated metrics as fallback
3. Add error boundaries and loading states
4. Add data refresh controls

### Phase 5: Polish & Deploy (Week 4)
1. Responsive testing on mobile/tablet
2. Performance optimization (bundle analysis)
3. Add download CSV functionality
4. Deploy to Vercel or Netlify
5. Documentation

---

## 7. File Placement Strategy

### Recommended Structure:
```
/
├── app/                    # Next.js app (new framework code)
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│
├── components/             # React components (new)
├── lib/                    # Utils, hooks (new)
├── styles/                 # CSS (new)
├── public/                 # Static assets
│   └── map/
│       └── states-10m.json
│
├── scripts/                # Python data pipeline (KEEP)
│   ├── 01_collect_permits.py
│   ├── 02_code_reforms.py
│   └── 03_compute_metrics.py
│
├── data/                   # Generated data (KEEP)
│   ├── raw/
│   └── outputs/
│
├── visualizations/         # Old prototype (KEEP AS REFERENCE)
│   ├── index.html          # Archive during migration
│   ├── js/main.js
│   └── data/
│
├── .env.local              # Secrets (Census API key)
├── package.json
└── README.md
```

**Key Decisions:**
- ✅ Keep `visualizations/` folder as reference during migration
- ✅ Keep Python `scripts/` for data pipeline
- ✅ Create new `app/` folder for Next.js
- ✅ Once migration complete, `visualizations/` can be archived

---

## 8. Priority for First Implementation

### RECOMMENDED: Start with Scaffolding + Design System

**Why?**
1. Establishes foundation for all other work
2. Validates design tokens work in new framework
3. Sets up build pipeline and development workflow
4. Creates UI primitives that all components need
5. Enables parallel development of components

### Initial Tasks (in order):

1. **Initialize Next.js project**
   ```bash
   cd /home/user/zoning-reform-analysis-2025
   npx create-next-app@latest app --typescript --tailwind --app
   # Or create app/ folder manually with Next.js structure
   ```

2. **Extract design system**
   - Copy CSS variables from `visualizations/index.html`
   - Create Tailwind config with custom colors
   - Build Card, Button, Select components

3. **Set up Census API proxy**
   - Create `app/api/census/permits/route.ts`
   - Test with real Census API key
   - Add error handling

4. **Migrate first component (DashboardHeader)**
   - Proves the design system works
   - Simple component with no complex interactions
   - Sets pattern for other components

---

## 9. Key Technical Decisions

### State Management
- **Local state**: `useState` for simple filters
- **Server state**: SWR or React Query for API data
- **Global state**: React Context if needed (likely not)

### Data Fetching
- **Server Components** for initial data (SSR)
- **Client Components** for interactive charts/maps
- **SWR** for client-side data fetching with caching

### Visualization Libraries
- **Chart.js**: Keep for bar/line charts (proven, works well)
- **D3.js**: Keep for map (flexible, powerful)
- **Alternative**: Consider Recharts or Visx for more "React-native" approach

### TypeScript
- Use TypeScript for type safety
- Define interfaces for Reform, Metrics, TimeseriesData
- Helps catch Census API schema changes

---

## 10. Real Census Data Integration

### Current State:
Your Python script **already** integrates with Census API! 🎉

File: `scripts/01_collect_permits.py` lines 26-77

**What it does:**
- Fetches from `api.census.gov/data/timeseries/bps/permits`
- Handles API key from `.env`
- Falls back to local CSV if API unavailable
- Filters to 2015-2024
- Outputs to `data/raw/permit_data_2015_2024.parquet`

### Enhancement Strategy:

1. **Keep Python pipeline for batch processing**
   - Run weekly/monthly to build historical dataset
   - Store in Parquet for efficiency

2. **Add Next.js API route for live data**
   - Real-time queries for specific states/time periods
   - Use Next.js caching to avoid rate limits

3. **Hybrid approach**
   - Load historical from pre-computed files (fast)
   - Option to refresh specific state from API (live)

### Census API Key Setup:
```bash
# Create .env.local
CENSUS_API_KEY=your_census_api_key_here

# Get free key at: https://api.census.gov/data/key_signup.html
```

---

## 11. Testing Strategy

### Unit Tests
- Vitest for utils/transforms
- React Testing Library for components

### Integration Tests
- Test Census API proxy routes
- Test data transformations match Python output

### E2E Tests
- Playwright for critical user flows
- Test filters, map interactions, data download

---

## Next Steps

1. **Share this plan with Claude VS Code**
2. **Confirm approach** (or suggest modifications)
3. **Set up Census API key** in `.env.local`
4. **Begin Phase 1: Scaffolding**
5. **Share design system file** for token extraction

---

## Questions for Stakeholder

1. Do you have a Census API key already? (Free at https://api.census.gov/data/key_signup.html)
2. Any preference on deployment platform? (Vercel, Netlify, AWS, self-hosted)
3. Should the dashboard be public or require authentication?
4. Any additional data sources beyond Census BPS?
5. Timeline constraints for launch?

---

**Document Version:** 1.0
**Last Updated:** 2025-11-18
**Author:** Claude (Anthropic)
