# Phase 1.2: Parallel Agent Prompts for Place Search MVP

**Created:** 2025-11-20
**Scope:** Complete place search and detail system
**Budget:** $0 (free tools only)
**Execution:** 3 parallel agents + 1 integration agent
**Total Timeline:** ~3-4 hours

---

## Overview

Build a searchable place explorer allowing users to find any of 24,535+ US places from Census data, view metrics and permit history, and see linked zoning reforms.

**Result:** Full Phase 1.2 MVP with:
- 24,535 searchable places with Fuse.js
- Detail panels with growth metrics and charts
- 100+ cities with documented zoning reforms
- Complete integration and deployment

---

## Agent Prompts (Copy/Paste Ready)

### AGENT 1: Place Search Component

**File:** `AGENT_1_PLACE_SEARCH_PROMPT.md`

**Quick Summary:**
- Build PlaceSearch.tsx with Fuse.js fuzzy search
- Create search API route
- Convert place metrics CSV to JSON search index
- Integrate into dashboard
- **Time:** ~30 minutes
- **No dependencies:** Can start immediately

**Quick Start:**
1. Open: `AGENT_1_PLACE_SEARCH_PROMPT.md`
2. Copy entire content
3. Paste into Claude Code Web session
4. Follow instructions

---

### AGENT 2: Place Detail Panel

**File:** `AGENT_2_PLACE_DETAIL_PROMPT.md`

**Quick Summary:**
- Build PlaceDetailPanel.tsx with metrics and charts
- Create API routes for place details and permit history
- Display 2024 permits, 5-year growth, MF share, rankings
- Show 10-year permit history with stacked bar chart
- Integrate into dashboard
- **Time:** ~50 minutes
- **Depends on:** Agent 1 (needs place_fips from search)

**Quick Start:**
1. Open: `AGENT_2_PLACE_DETAIL_PROMPT.md`
2. Copy entire content
3. Paste into Claude Code Web session
4. Follow instructions

---

### AGENT 3: Expand Reforms Database

**File:** `AGENT_3_EXPAND_REFORMS_PROMPT.md`

**Quick Summary:**
- Research 70+ additional cities with zoning reforms
- Expand city_reforms.csv from 30 to 100+ cities
- Create API route for linked reforms
- Document all sources
- **Time:** ~2-3 hours
- **No dependencies:** Can run in parallel with Agents 1-2

**Quick Start:**
1. Open: `AGENT_3_EXPAND_REFORMS_PROMPT.md`
2. Copy entire content
3. Paste into Claude Code Web session
4. Follow research instructions

---

### AGENT 4: Integration & Deployment

**File:** `AGENT_4_INTEGRATION_PROMPT.md`

**Quick Summary:**
- Integrate outputs from Agents 1-3
- Test all components together
- Deploy to Vercel
- Create documentation
- **Time:** ~80 minutes
- **Depends on:** All agents 1-3 must complete first

**Quick Start (Run AFTER Agents 1-3):**
1. Open: `AGENT_4_INTEGRATION_PROMPT.md`
2. Copy entire content
3. Paste into Claude Code Web session
4. Follow integration steps

---

## Execution Timeline

### Parallel Phase (All at Once) - ~3 hours

Start these 3 agents simultaneously in separate Claude Code Web sessions:

```
Time  Agent 1 (30 min)      Agent 2 (50 min)      Agent 3 (2-3 hr)
────────────────────────────────────────────────────────────────
0:00  Start                 Start                 Start
      PlaceSearch           PlaceDetailPanel      Expand reforms
      Fuse.js search        Metrics/charts        Research 70 cities

0:30  Agent 1 done ✓
      Wait for Agent 2

0:50  Agent 1+2 done ✓
      Ready for Agent 4
      (but Agent 3 still running)

1:00  Idle waiting          Idle waiting          Still researching...

2:00  Idle waiting          Idle waiting          Still researching...

2:30  Idle waiting          Idle waiting          Idle waiting...

3:00  All done ✓            Agent 4 can start → Integration
```

### Sequential Phase (After Agents 1-3) - ~80 minutes

Once all 3 agents complete:

```
Time  Agent 4 (Integration)
──────────────────────────
0:00  Start
      Verify all files exist
      Test integration
      Build and test locally

0:30  Deploy to Vercel
      Test production

1:20  Documentation
      Create reports
      Commit and push

Total time for Phase 1.2: ~3.5-4 hours
```

---

## Parallel Execution Strategy

### Why Parallel?

- **Agent 1** (PlaceSearch): 30 min, no dependencies
- **Agent 2** (PlaceDetailPanel): 50 min, needs place metrics CSV (exists from Phase 1.1)
- **Agent 3** (Expand reforms): 2-3 hours, no code dependencies, just research

Agents 1 and 2 can run in parallel. Agent 3 can run simultaneously since it's research-based and doesn't conflict.

### Setup 3 Parallel Sessions

1. **Session 1 (Agent 1):**
   - Environment: Claude Code Web
   - Task: Build PlaceSearch
   - Estimated completion: +30 min

2. **Session 2 (Agent 2):**
   - Environment: Claude Code Web
   - Task: Build PlaceDetailPanel
   - Estimated completion: +50 min

3. **Session 3 (Agent 3):**
   - Environment: Claude Code Web
   - Task: Expand reforms database
   - Estimated completion: +2-3 hours

4. **Session 4 (Agent 4, START AFTER 1-3):**
   - Environment: Claude Code Web
   - Task: Integration and deployment
   - Estimated completion: +80 min

---

## File Dependencies & Conflicts

### No Conflicts Between Agents

**Agent 1 creates:**
- `app/components/ui/PlaceSearch.tsx`
- `app/app/api/places/search/route.ts`
- `public/data/places.json`

**Agent 2 creates:**
- `app/components/visualizations/PlaceDetailPanel.tsx`
- `app/app/api/places/[fips]/route.ts`
- `app/app/api/places/[fips]/permits/route.ts`

**Agent 3 creates:**
- `data/raw/city_reforms_expanded.csv`
- `app/app/api/places/[fips]/reforms/route.ts`
- `scripts/24_expand_city_reforms.py`

**Agent 4 modifies:**
- `app/app/page.tsx` (INTEGRATES all above)
- Creates test suite
- Deploys to Vercel

✅ **No file conflicts** - each agent works on distinct files

---

## Data & File Locations

### Required Input Files (Exist from Phase 1.1)

```
data/outputs/place_metrics_comprehensive.csv      ← Scripts 20-22 output
  Contains: 24,535 places with growth metrics

data/raw/census_bps_place_annual_permits.csv      ← Script 21 output
  Contains: 812,961 annual permit records

data/raw/city_reforms.csv                         ← Existing file
  Contains: 30 cities with reforms (Agent 3 expands to 100+)
```

### Output Files (Created by Agents)

**Agent 1:**
- `public/data/places.json` - Search index for Fuse.js

**Agent 2:**
- None (creates components and API routes only)

**Agent 3:**
- `data/raw/city_reforms_expanded.csv` - 100+ cities

**Agent 4:**
- Test suite
- Documentation
- Deployed to Vercel

---

## Pre-Execution Checklist

Before starting agents, verify:

- [ ] Phase 1.1 scripts (20-22) completed successfully
- [ ] Files exist:
  - [ ] `data/outputs/place_metrics_comprehensive.csv`
  - [ ] `data/raw/census_bps_place_annual_permits.csv`
  - [ ] `data/raw/city_reforms.csv`
- [ ] Have 3 separate Claude Code Web sessions ready
- [ ] Vercel account set up (for Agent 4)
- [ ] Git repo is clean (no uncommitted changes)

---

## Execution Commands

### Agent 1 Quick Commands

```bash
npm run dev              # Test locally
npm run build           # Build test
```

### Agent 2 Quick Commands

```bash
npm run dev             # Test with PlaceSearch
npm run build
```

### Agent 3 Quick Commands

```bash
python scripts/24_expand_city_reforms.py
wc -l data/raw/city_reforms_expanded.csv
```

### Agent 4 Quick Commands

```bash
python scripts/25_test_phase_1_2.py      # Test
npm run build                             # Build
npm run dev                               # Test locally
vercel --prod                             # Deploy
```

---

## Cost Analysis

| Component | Cost | Why |
|-----------|------|-----|
| Fuse.js search | $0 | Open source, client-side |
| Leaflet maps | $0 | Open source, free OSM tiles |
| CSV storage | $0 | Git version-controlled |
| API routes | $0 | Next.js built-in |
| Vercel hosting | $0 | Free tier (Hobby plan) |
| **Total Year 1** | **$0** | Fully bootstrapped |

Alternative approach would cost $1,800-3,200/year (PostgreSQL + Meilisearch + Mapbox)

---

## Success Metrics

After all agents complete, you should have:

- [ ] 24,535 searchable places
- [ ] <50ms search response time
- [ ] Detail panel showing metrics for any place
- [ ] 10-year permit history charts
- [ ] 100+ cities with documented reforms
- [ ] Fully responsive dashboard
- [ ] Zero console errors
- [ ] Deployed on Vercel
- [ ] Production URL working
- [ ] All tests passing

---

## Common Issues & Solutions

### Issue: "places.json not found"
**Solution:** Agent 1 creates this file from place_metrics_comprehensive.csv
- Check: `public/data/places.json` exists
- Size should be ~8-10 MB

### Issue: "Place metrics CSV not found"
**Solution:** Required from Phase 1.1 (Script 22 output)
- File: `data/outputs/place_metrics_comprehensive.csv`
- Should exist from Phase 1.1 already

### Issue: "Component imports fail"
**Solution:** Make sure index files export components
- Check: `app/components/ui/index.ts` exports PlaceSearch
- Check: `app/components/visualizations/index.ts` exports PlaceDetailPanel

### Issue: "API returns 404"
**Solution:** Verify CSV files are readable
- Check: File exists and is readable
- Check: FIPS code matches exactly (string type)

### Issue: "Build fails"
**Solution:** Check TypeScript errors
- Run: `npm run build 2>&1 | head -50`
- Fix any type errors shown

---

## Commit Strategy

**After each agent completes:**

Agent 1:
```bash
git add app/components/ui/PlaceSearch.tsx app/app/api/places/search/
git commit -m "Agent 1: Add PlaceSearch with Fuse.js"
```

Agent 2:
```bash
git add app/components/visualizations/PlaceDetailPanel.tsx app/app/api/places/
git commit -m "Agent 2: Add PlaceDetailPanel with metrics"
```

Agent 3:
```bash
git add data/raw/city_reforms_expanded.csv scripts/24_expand_city_reforms.py
git commit -m "Agent 3: Expand reforms database to 100+ cities"
```

Agent 4:
```bash
git add .
git commit -m "Agent 4: Complete Phase 1.2 MVP integration and deployment"
git push origin main
```

---

## Phase 1.2 Components Overview

After all agents complete, you'll have:

### **PlaceSearch (Agent 1)**
```
┌─ Search Input ──────────────────────┐
│ Search 24,535+ places...            │
├─────────────────────────────────────┤
│ ▼ Los Angeles, CA - 10,488 units   │
│   +28.1% growth, 69.9% MF           │
│ ▼ Austin, TX - 9,444 units          │
│   +45.2% growth, 81.5% MF           │
│ ▼ Brooklyn, NY - 10,063 units       │
│   +15.3% growth, 98.4% MF           │
└─────────────────────────────────────┘
```

### **PlaceDetailPanel (Agent 2)**
```
┌─ Los Angeles, CA ─────────────────────┐
├───────────────────────────────────────┤
│ 2024 Permits: 10,488 │ Growth: +28.1% │
│ MF Share: 69.9%      │ Rank: Top 5%   │
├───────────────────────────────────────┤
│ Permit History (10 Years)              │
│ 2024: ████ 10,488 units               │
│ 2023: ███ 10,063 units                │
│ 2022: ██ 8,500 units                  │
│ ...                                    │
├───────────────────────────────────────┤
│ Zoning Reforms (Agent 3)               │
│ • SB 9: ADU Legalization (2021)       │
│ • Transit Zoning (2021)               │
│ • Height Limit Increase (2023)        │
└───────────────────────────────────────┘
```

### **Expanded Reforms (Agent 3)**
```
100+ cities with documented reforms:
- Austin, TX: Affordability zoning
- Portland, OR: ADU legalization
- Seattle, WA: Upzoning
- San Francisco, CA: ADU + parking reduction
- Denver, CO: Zoning modernization
... 95+ more cities
```

---

## Next Steps After Phase 1.2

Once Phase 1.2 MVP is deployed:

**Phase 2 (Future):**
- Map visualization with Leaflet (show place locations)
- Comparative analytics (place vs national)
- ML predictions (reform impact)
- Advanced filtering and sorting
- Data export functionality

**Phase 3 (Future):**
- Research expansion (200+ cities with reforms)
- Economic feature integration
- Causal inference analysis
- Place-level dashboards

---

## Document Map

**Agent Prompts (Ready to copy/paste):**
- `AGENT_1_PLACE_SEARCH_PROMPT.md` - PlaceSearch component
- `AGENT_2_PLACE_DETAIL_PROMPT.md` - PlaceDetailPanel component
- `AGENT_3_EXPAND_REFORMS_PROMPT.md` - Reforms database expansion
- `AGENT_4_INTEGRATION_PROMPT.md` - Integration & deployment

**Supporting Documentation:**
- `PHASE_1_1_SCRIPTS_GUIDE.md` - Phase 1.1 data pipeline (background)
- `PHASE_1_1_QUICK_START.md` - How to run Phase 1.1
- `PHASE_1_1_SESSION_SUMMARY.md` - Phase 1.1 overview

---

## FAQ

**Q: Can I run agents in different order?**
A: No. Agents 1-3 can run in parallel, but Agent 4 must run after 1-3 complete.

**Q: What if one agent fails?**
A: Fix in that agent's session, don't move to next agents until fixed. Agent 4 depends on all 1-3 succeeding.

**Q: Can I edit agent prompts?**
A: Yes. They're templates. Customize for your specific needs if desired.

**Q: What if Phase 1.1 isn't complete?**
A: Agent 1 can still run (uses Script 22 output). Agents 2-3 also work. Agent 4 depends on all Phase 1.1 data.

**Q: Will Script 23 (geocoding) blocking Phase 1.2?**
A: No. Phase 1.2 doesn't depend on Script 23 output (no mapping yet). Script 23 can continue running in background.

---

## Summary

| Aspect | Details |
|--------|---------|
| **Agents** | 4 (3 parallel + 1 sequential) |
| **Time per agent** | 30 min (A1), 50 min (A2), 2-3 hr (A3), 80 min (A4) |
| **Total timeline** | 3-4 hours (parallel) + 80 min integration |
| **Files created** | ~12 new files, 3 modified |
| **Data size** | 24,535 places, 150+ reforms |
| **Cost** | $0 (free tools) |
| **Result** | Complete Phase 1.2 MVP on Vercel |

---

**Ready to start?**

1. Copy `AGENT_1_PLACE_SEARCH_PROMPT.md`
2. Open Claude Code Web
3. Paste prompt
4. Follow instructions
5. Repeat with Agents 2-3 in parallel sessions
6. Run Agent 4 after 1-3 complete

---

**Status:** All prompts ready
**Created:** 2025-11-20
**For Phase:** 1.2 MVP (Place Search Explorer)
