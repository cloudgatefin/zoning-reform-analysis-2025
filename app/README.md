# Zoning Reform Dashboard - Next.js Application

Modern web application for analyzing zoning reform impact on housing permits across U.S. states.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📁 Project Structure

```
app/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with design system
│   ├── page.tsx             # Main dashboard page
│   └── api/                 # API routes
│       ├── census/
│       │   └── permits/     # Census API proxy
│       └── reforms/
│           └── metrics/     # Reform metrics endpoint
│
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   │   └── DashboardHeader.tsx
│   └── ui/                  # Design system primitives
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Select.tsx
│       └── Table.tsx
│
├── lib/
│   ├── census-api.ts        # Census API client
│   └── hooks/               # Custom React hooks (coming soon)
│
├── styles/
│   └── globals.css          # Global styles + design tokens
│
└── public/                  # Static assets
```

## 🎨 Design System

The design system is built with **Tailwind CSS** + **CSS Variables** for maximum flexibility.

### Color Palette (Dark Theme)
- Background: `#020617` (slate-950)
- Card: `#020617`
- Border: `#1f2937` (gray-800)
- Text Primary: `#e5e7eb` (gray-200)
- Text Muted: `#9ca3af` (gray-400)
- Accent Blue: `#2563eb`
- Positive Green: `#22c55e`
- Negative Red: `#ef4444`
- Warning Orange: `#f97316`

### Typography
- Font Stack: system-ui
- Sizes: 11px (xs), 12px (sm), 13px (base), 14px (md), 18px (lg)

### Spacing
- xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 20px

### Border Radius
- sm: 8px, md: 10px, lg: 14px

## 🔌 API Routes

### Census Building Permits
**GET** `/api/census/permits`

Proxy to Census Bureau Building Permits API.

Query Parameters:
- `startYear` (optional): Filter start year
- `endYear` (optional): Filter end year

Example:
```bash
curl http://localhost:3000/api/census/permits?startYear=2020&endYear=2024
```

### Reform Metrics
**GET** `/api/reforms/metrics`

Serves pre-computed reform impact metrics from Python data pipeline.

Example:
```bash
curl http://localhost:3000/api/reforms/metrics
```

## 🔑 Environment Variables

Create `.env.local` with:

```env
CENSUS_API_KEY=your_census_api_key_here
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

Get a free Census API key: https://api.census.gov/data/key_signup.html

## 📊 Data Pipeline Integration

This Next.js app works **alongside** the existing Python data pipeline:

- **Python scripts** (`../scripts/`) handle batch processing of historical data
- **Next.js API routes** provide real-time Census API access
- **Hybrid approach**: Load historical from pre-computed files, option to refresh live

## 🧩 Components

### UI Primitives
- `Card`, `CardHeader`, `CardTitle`, `CardContent` - Container components
- `Button` - Primary, secondary, and ghost variants
- `Select`, `SelectOption` - Dropdown menus
- `Table`, `TableHeader`, `TableBody`, etc. - Data tables

### Dashboard Components
- `DashboardHeader` - Title, description, download button

### Coming Soon
- `FilterControls` - Jurisdiction and type filters
- `SummaryCards` - Key metrics display
- `PercentChangeChart` - Bar chart (Chart.js)
- `ReformsTable` - Sortable data table
- `ReformMap` - D3 choropleth map
- `StateDetail` - State detail panel with trend chart

## 🏗️ Development Roadmap

### ✅ Phase 1: Scaffolding + Design System (COMPLETE)
- Next.js 14+ with App Router
- TypeScript configuration
- Tailwind CSS with design tokens
- UI primitive components
- Census API proxy route
- DashboardHeader component

### 📋 Phase 2: Core Components (Next)
- FilterControls with React state
- SummaryCards with metrics display
- Data fetching setup (SWR/React Query)

### 📊 Phase 3: Visualizations
- Chart.js integration for bar/line charts
- D3.js integration for map
- Interactive tooltips

### 🗺️ Phase 4: Map Migration
- TopoJSON map data
- State choropleth with color scale
- Hover tooltips
- Click interactions

### 🔄 Phase 5: Data Integration
- Real Census API calls
- Python-generated metrics fallback
- Loading states and error boundaries
- Data refresh controls

### 🚢 Phase 6: Polish & Deploy
- Responsive design testing
- Performance optimization
- CSV download functionality
- Deployment (Vercel/Netlify)

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualizations**: Chart.js, D3.js (to be integrated)
- **Data Fetching**: SWR or React Query (to be integrated)
- **API**: Census Bureau Building Permits API

## 📝 Notes

- This app is built **alongside** the existing prototype in `../visualizations/`
- Python data pipeline in `../scripts/` is **preserved** for batch processing
- Once migration is complete, the old prototype can be archived
- Design tokens are extracted from the original prototype for consistency

## 🤝 Contributing

This project follows the architectural plan documented in:
- `WEB_MIGRATION_ARCHITECTURE.md` (on branch `claude/plan-web-migration-01WXrXpSGucqNBqZpyNVBAWn`)
- `VSCODE_CLAUDE_ANSWERS.md`

## 📄 License

ISC
