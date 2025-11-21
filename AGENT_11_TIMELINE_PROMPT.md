# Agent 11: Build Reform Adoption Timeline Component

**Phase:** 3 (Weeks 2-3)
**Duration:** 6-8 hours
**Dependencies:** None (can run immediately)
**Parallel With:** Agents 9, 10

---

## Mission

Build an interactive, animated timeline component that visualizes the spread of zoning reforms across the U.S. This creates social proof ("reforms are happening everywhere") and helps policymakers understand reform trends.

**Success:** Interactive timeline component deployed showing 502 reforms chronologically with filtering by type and region.

---

## What to Build

### Component Overview

An interactive timeline that shows:
1. **Temporal view:** Reforms ordered by adoption date (2015-2024)
2. **Geographic spread:** Where reforms are concentrated (visual clustering)
3. **Reform types:** Filter by reform category (ADU, parking, density, etc.)
4. **Regional patterns:** Show which regions are leading

### Core Features

```
1. Timeline Visualization
   - Horizontal or vertical timeline (responsive)
   - Each reform shown as a dot/point
   - Dot color = reform type (color-coded)
   - Dot size = estimated impact (optional)
   - Click on dot = show reform details

2. Filtering
   - Filter by reform type (dropdown or multi-select)
   - Filter by region/state (multi-select)
   - Filter by date range (slider)
   - "Reset filters" button

3. Reform Details Popup
   - Reform name, city, state
   - Adoption date and effective date
   - Reform type and description
   - Impact estimate (if available)
   - Source link

4. Statistics
   - Total reforms in view
   - Breakdown by type
   - Geographic distribution
   - Trend indicator (accelerating/decelerating)

5. Animation (Optional but nice)
   - Timeline plays from 2015 → 2024
   - Reforms appear as time progresses
   - Shows momentum visually
   - Play/pause controls
```

---

## Technical Requirements

### Technology Stack
- **Framework:** React 18 with TypeScript
- **Charting:** Recharts (for timeline) or custom SVG
- **Visualization:** D3.js (optional, for geographic clustering)
- **Data:** CSV of 502 reforms with dates and types

### File Structure
```
app/
├── components/
│   └── visualizations/
│       ├── ReformTimeline.tsx (main component)
│       ├── useTimelineData.ts (data hook)
│       └── timelineTypes.ts (TypeScript types)
├── lib/
│   └── timelineUtils.ts (helper functions)
└── public/
    └── data/
        └── reforms_timeline.json (processed reform data)
```

---

## Data Structure

### Input Data (CSV or JSON)

```json
[
  {
    "id": "ca_adu_2016",
    "city": "San Francisco",
    "state": "California",
    "state_code": "CA",
    "reform_name": "ADU Legalization",
    "reform_type": "Housing Type Legalization",
    "reform_subtype": "ADU",
    "adoption_date": "2016-01-01",
    "effective_date": "2016-03-01",
    "year": 2016,
    "description": "Legalized Accessory Dwelling Units city-wide",
    "source": "SF Planning Department",
    "source_url": "https://example.com",
    "region": "West Coast",
    "estimated_impact_low": 1.05,
    "estimated_impact_high": 1.20
  },
  ...
]
```

### Processing Steps
1. Load from `data/raw/city_reforms_expanded.csv` (already exists from Phase 2)
2. Filter to include only date > 2010 (timeline starts 2015)
3. Map reform types to colors
4. Map states to regions
5. Export as `reforms_timeline.json`

---

## Component Design

### Main Component Structure (ReformTimeline.tsx)

```typescript
interface Reform {
  id: string
  city: string
  state: string
  reform_name: string
  reform_type: string
  adoption_date: string
  effective_date: string
  year: number
  region: string
  estimated_impact_low?: number
}

interface TimelineProps {
  reforms: Reform[]
  onReformClick?: (reform: Reform) => void
}

export function ReformTimeline({ reforms, onReformClick }: TimelineProps) {
  // State for filtering
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [dateRange, setDateRange] = useState([2015, 2024])
  const [isAnimating, setIsAnimating] = useState(false)

  // Filter reforms based on selections
  const filteredReforms = reforms.filter(r => {
    const inTypeFilter = selectedTypes.length === 0 ||
                         selectedTypes.includes(r.reform_type)
    const inRegionFilter = selectedRegions.length === 0 ||
                           selectedRegions.includes(r.region)
    const inDateRange = r.year >= dateRange[0] && r.year <= dateRange[1]
    return inTypeFilter && inRegionFilter && inDateRange
  })

  // Render timeline
  return (
    <div className="w-full p-8 bg-white rounded-lg shadow">
      {/* Title and description */}
      <h2 className="text-3xl font-bold mb-4">Reform Adoption Timeline</h2>
      <p className="text-gray-600 mb-6">
        Track how zoning reforms are spreading across the United States
      </p>

      {/* Filters */}
      <FilterPanel
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        selectedRegions={selectedRegions}
        setSelectedRegions={setSelectedRegions}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      {/* Statistics */}
      <StatisticsPanel
        totalReforms={filteredReforms.length}
        byType={groupByType(filteredReforms)}
        byRegion={groupByRegion(filteredReforms)}
      />

      {/* Timeline visualization */}
      <TimelineVisualization
        reforms={filteredReforms}
        onReformClick={onReformClick}
        isAnimating={isAnimating}
      />

      {/* Animation controls (optional) */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isAnimating ? "Pause" : "Play"} Timeline
        </button>
        <button
          onClick={() => {
            setSelectedTypes([])
            setSelectedRegions([])
            setDateRange([2015, 2024])
          }}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}
```

### Sub-Components

#### 1. FilterPanel Component
```typescript
// Allow users to filter by:
// - Reform type (multi-select dropdown)
// - Region (multi-select chips)
// - Date range (slider)

Features:
- Dropdown showing all unique reform types
- Chips for regions (West Coast, Midwest, etc.)
- Slider for year range (2015-2024)
- Real-time filtering (updates on selection)
```

#### 2. StatisticsPanel Component
```typescript
// Show summary statistics
// - "502 reforms since 2015"
// - "62 cities with ADU legalization"
// - "Reforms accelerating: +28% YoY"
// - Regional breakdown (West leading)

Visual:
- Large number for total count
- Smaller numbers for breakdown
- Trend indicator (arrow up/down)
```

#### 3. TimelineVisualization Component
```typescript
// Main timeline display

Two layout options (user selectable):

Option A: Horizontal Timeline (Recharts)
- X-axis: Year (2015-2024)
- Y-axis: Stacked by region or type
- Points: Each reform as a dot
- Hover: Show reform details
- Click: Open detail popup

Option B: Vertical Timeline (Custom SVG)
- Left side: Year labels
- Right side: Reforms stacked chronologically
- Color: By reform type
- Click to expand

Recommendation: Start with Option A (simpler with Recharts)
```

#### 4. ReformDetailPopup Component
```typescript
// Shows when user clicks on a reform
// Displays:
// - Reform name, city, state
// - Adoption date and effective date
// - Reform type and subtype
// - Brief description
// - Estimated impact (if available)
// - Source link
// - "View city details" link

Layout:
- Card popup (centered on screen)
- Close button (X in corner)
- Responsive (fits on mobile)
```

---

## Visualization Approach (Recommended)

### Use Recharts for Timeline
```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

// Transform data for Recharts
const chartData = [
  {
    year: 2015,
    ADU: 5,
    Parking: 2,
    Density: 1,
  },
  {
    year: 2016,
    ADU: 8,
    Parking: 4,
    Density: 2,
  },
  // ... through 2024
]

// Render stacked bar chart
<BarChart data={chartData}>
  <XAxis dataKey="year" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="ADU" stackId="a" fill="#3B82F6" />
  <Bar dataKey="Parking" stackId="a" fill="#10B981" />
  <Bar dataKey="Density" stackId="a" fill="#F59E0B" />
</BarChart>
```

**Why Recharts:**
- Simple to implement
- Built-in tooltips and legends
- Responsive
- Good performance
- Can stack by type or region

---

## Color Coding by Reform Type

```
Reform Type          Color
──────────────────────────────
ADU Legalization     #3B82F6 (Blue)
Parking Reform       #10B981 (Green)
Density Increase     #F59E0B (Orange)
Lot Splits           #8B5CF6 (Purple)
Missing Middle       #EC4899 (Pink)
Streamlining         #06B6D4 (Cyan)
Affordability        #F97316 (Deep Orange)
Comprehensive        #6366F1 (Indigo)
Other                #6B7280 (Gray)
```

---

## Regional Grouping

```
Regions (for filtering):
- West Coast: CA, OR, WA
- Mountain: CO, UT, NV, ID, WY, MT
- Midwest: IL, OH, MI, IN, MN, MO, WI, IA, KS, NE, SD, ND
- South: TX, FL, GA, NC, VA, MD, DE, SC, TN, AR, LA, MS, AL, KY, WV, OK
- Northeast: MA, CT, RI, VT, NH, ME, NY, NJ, PA
- Other: AK, HI

Recommendation: Start with just West Coast vs. Rest of Country
Then expand if needed
```

---

## Data Preparation

### Step 1: Load Existing Reform Data
```bash
# Load from Phase 2 output
data/raw/city_reforms_expanded.csv (already has 502 cities)

Columns needed:
- city_name
- state
- reform_type
- reform_subtype
- reform_year (or adoption_date)
- source_url (for linking)
```

### Step 2: Transform to Timeline Format
```python
# Script: scripts/28_prepare_timeline_data.py

import pandas as pd

reforms = pd.read_csv('data/raw/city_reforms_expanded.csv')

# Add region mapping
region_map = {
    'CA': 'West Coast', 'OR': 'West Coast', 'WA': 'West Coast',
    # ... etc
}
reforms['region'] = reforms['state'].map(region_map)

# Add year (if not present)
reforms['year'] = pd.to_datetime(reforms['reform_year']).dt.year

# Select relevant columns
timeline_data = reforms[[
    'city_name', 'state', 'reform_type', 'reform_subtype',
    'reform_year', 'region', 'source_url'
]]

# Export as JSON
timeline_data.to_json('public/data/reforms_timeline.json', orient='records')
```

### Step 3: Verify Data
- 502 reforms loaded
- All have dates (2010+, focus on 2015+)
- All have reform types
- All have state/region
- No missing critical fields

---

## Implementation Checklist

### Data Preparation
- [ ] Load reforms from Phase 2 CSV
- [ ] Add region mapping
- [ ] Extract year from date
- [ ] Export as JSON to `public/data/reforms_timeline.json`
- [ ] Verify all 502 reforms present

### React Component
- [ ] Create ReformTimeline.tsx
- [ ] Implement FilterPanel (type, region, date)
- [ ] Implement StatisticsPanel
- [ ] Implement TimelineVisualization (Recharts)
- [ ] Implement ReformDetailPopup
- [ ] Implement useTimelineData hook

### Integration
- [ ] Create `/timeline` route (or add to `/explore`)
- [ ] Add navigation link from landing page
- [ ] Add to dashboard if relevant
- [ ] Responsive design verified

### Testing
- [ ] Filters work correctly
- [ ] Clicking reforms opens popup
- [ ] Statistics update when filters change
- [ ] Mobile responsive
- [ ] No console errors

---

## UI Mockup (Rough Layout)

```
╔════════════════════════════════════════════════════════════════╗
║  Reform Adoption Timeline                                      ║
║  Track how zoning reforms are spreading across the U.S.       ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Filters: [Reform Type ▼] [Region ▼] [Years: 2015 ←→ 2024]  ║
║  [Reset Filters]                                              ║
║                                                                ║
├────────────────────────────────────────────────────────────────┤
║                                                                ║
║  502 Reforms Since 2015                                        ║
║  ┌─────────────────┬──────────────┬──────────────┐            ║
║  │ ADU: 156        │ Parking: 98  │ Density: 74  │  ...       ║
║  └─────────────────┴──────────────┴──────────────┘            ║
║                                                                ║
│  West Coast Leading: 234 reforms (46%)                         ║
║                                                                ║
├────────────────────────────────────────────────────────────────┤
║                                                                ║
║  Timeline (Stacked Bar Chart)                                  ║
║                                                                ║
║      50 │                                       ██             ║
║         │                                    ██                ║
║      40 │                                 ██                   ║
║         │                              ██                      ║
║      30 │                           ██                         ║
║         │  ██                     ██                           ║
║      20 │  ██                  ██                              ║
║         │  ██               ██                                 ║
║      10 │  ██            ██                                    ║
║         │  ██         ██                                       ║
║       0 │__██__██__██__██__██__██__██__██__██__██_____         ║
║         └─────────────────────────────────────────────        ║
║           2015 2016 2017 2018 2019 2020 2021 2022 2023 2024   ║
║                                                                ║
║  Legend: [● ADU] [● Parking] [● Density] [● Lot Splits] ...  ║
║                                                                ║
│  [Play Timeline] [Reset Filters]                              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Optional Enhancements (If Time Allows)

### 1. Animated Timeline Playback
```
- "Play" button runs timeline from 2015 → 2024
- Reforms appear sequentially (one per second or per month)
- Creates sense of momentum and acceleration
- Play/Pause/Reset controls
```

### 2. Geographic Map View
```
- Switch between timeline and map view
- Show 502 reform cities on map
- Color by reform type
- Click to see details
- Zoom to region to see concentration
```

### 3. Trend Analysis
```
- Show acceleration/deceleration by type
- "ADU reforms growing 25% YoY"
- Regional spread indicator
- "Moving from coast inland"
```

### 4. Downloadable Data
```
- "Export as CSV" button
- Export filtered reforms
- Include all details (dates, sources, descriptions)
```

---

## Testing Checklist

### Functionality
- [ ] Filters work (type, region, date)
- [ ] Statistics update when filtering
- [ ] Click on bar/point shows popup
- [ ] Popup has all required information
- [ ] Reset filters button works
- [ ] Play timeline animation works (if added)

### Data
- [ ] All 502 reforms loaded
- [ ] Dates are correct
- [ ] Types mapped to colors correctly
- [ ] Regions assigned properly
- [ ] No missing data points

### Responsive
- [ ] Desktop (1920px): Timeline optimal width
- [ ] Tablet (768px): Chart responsive
- [ ] Mobile (375px): Stacked/scrollable
- [ ] Touch-friendly filters
- [ ] Readable labels at all sizes

### Visual Quality
- [ ] Colors distinct and colorblind-friendly
- [ ] Chart readable (no overlapping labels)
- [ ] Animations smooth (if added)
- [ ] Legend clear
- [ ] Hover tooltips helpful

---

## Deployment

### Build & Deploy
```bash
npm run build  # Verify no TypeScript errors
git add .
git commit -m "Agent 11: Build reform adoption timeline component"
git push origin main
# Deploy to Vercel or hosting
```

### Verification
- [ ] `/timeline` (or relevant route) accessible
- [ ] Data loads and displays
- [ ] Filters functional
- [ ] Mobile responsive
- [ ] No console errors

---

## Success Criteria

✅ Timeline component built and deployed
✅ All 502 reforms displayed with dates
✅ Filters work (type, region, date)
✅ Statistics panel shows key insights
✅ Reform details popup functional
✅ Mobile responsive design
✅ Visually appealing and intuitive
✅ Demonstrates reform momentum/acceleration

---

## Timeline
- **Week 1-2:** Data preparation, component structure
- **Week 3:** Implementation, styling, testing
- **Ready by:** End of Week 3

---

**Status:** Ready to build
**Duration:** 6-8 hours
**Start:** Immediately (parallel with Agents 9, 10)

