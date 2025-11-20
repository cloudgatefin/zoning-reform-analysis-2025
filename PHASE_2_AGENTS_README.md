# Phase 2 Agents - Quick Start Guide

**Date:** 2025-11-20
**Phase:** 2 (Expand Reforms & Enhance ML)
**Status:** Ready for parallel execution
**Timeline:** ~10 hours elapsed (3 agents working simultaneously)

---

## Executive Summary

You have **4 self-contained agent prompts** ready to run in parallel on Claude Code Web. Each agent handles one part of Phase 2:

| Agent | Task | Time | Dependencies |
|-------|------|------|--------------|
| **Agent 5** | Expand reforms 30→500+ cities | 6-8 hrs | None |
| **Agent 6** | Retrain ML model on 500+ cities | 2-3 hrs | Waits for Agent 5 |
| **Agent 7** | Build reform impact calculator UI | 2-3 hrs | None |
| **Agent 8** | Integrate & deploy to production | 1-2 hrs | Waits for Agents 5-7 |

**Total elapsed time:** ~10 hours (agents 5-7 run in parallel)

---

## What You'll Get

### After Agent 5 (Reforms Database)
- 500+ cities with documented zoning reforms
- CSV file ready for ML training
- Research documentation

### After Agent 6 (ML Enhancement)
- Retrained model on 500+ cities
- Performance improved: R² from -10.98 to >0.3
- Feature importance analysis

### After Agent 7 (Calculator UI)
- Interactive component for policymakers
- Reform selection interface
- Permit increase predictions
- Comparison to similar cities

### After Agent 8 (Integration)
- All components working together
- Production-ready deployment
- Full documentation

---

## Quick Start (Copy-Paste Ready)

### Setup (5 minutes)

1. Have 3 Claude Code Web browser tabs ready
2. Know your GitHub credentials (for git push)
3. Have Phase 1 repo cloned locally

### Execute Agents in Parallel

**Timeline visualization:**
```
Hour 0:00 ────────────────────────────────────────── Hour 10:00
│
├─ Agent 5 ████████ Expand reforms (6-8 hours)
│           ├─ Research 470+ cities
│           ├─ Validate data
│           └─ Create CSV
│
├─ Agent 6 ███████ ML Enhancement (2-3 hours after Agent 5 starts)
│           ├─ Wait for reforms CSV
│           ├─ Retrain model
│           └─ Generate report
│
├─ Agent 7 ███████ Calculator (2-3 hours, immediately)
│           ├─ Create React component
│           ├─ Add API routes
│           └─ Test locally
│
└─ Agent 8       ██ Integration (1-2 hours, after Agents 5-7)
                 ├─ Merge all changes
                 ├─ Final testing
                 └─ Deploy
```

### Step-by-Step Execution

**Step 1: Start Agent 5 (Right now)**
```
1. Open Claude Code Web in browser tab 1
2. Clone/navigate to repo
3. Open file: AGENT_5_EXPAND_REFORMS_PROMPT.md
4. Copy entire file content
5. Paste into Claude Code chat
6. Follow agent's instructions
Time: 6-8 hours
```

**Step 2: Start Agent 7 (Immediately, no dependencies)**
```
1. Open Claude Code Web in browser tab 2
2. Navigate to same repo
3. Open file: AGENT_7_REFORM_CALCULATOR_PROMPT.md
4. Copy entire file content
5. Paste into Claude Code chat
6. Follow agent's instructions
Time: 2-3 hours
Note: Agent 7 can start immediately, integrates model from Agent 6 later
```

**Step 3: Start Agent 6 (After ~hour 1, when Agent 5 has made progress)**
```
1. Open Claude Code Web in browser tab 3
2. Navigate to same repo
3. Open file: AGENT_6_ML_ENHANCEMENT_PROMPT.md
4. Copy entire file content
5. Paste into Claude Code chat
6. Follow agent's instructions
Time: 2-3 hours (waiting for Agent 5 CSV)
```

**Step 4: Start Agent 8 (After Agents 5-7 all complete)**
```
1. In any Claude Code tab (agents 5-7 will have finished)
2. Open file: AGENT_8_PHASE_2_INTEGRATION_PROMPT.md
3. Copy entire file content
4. Paste into Claude Code chat
5. Follow integration steps
Time: 1-2 hours
```

---

## File Locations

All agent prompts are in the root directory:

```
PHASE_2_AGENT_STRATEGY.md              ← Overview (read first)
AGENT_5_EXPAND_REFORMS_PROMPT.md       ← Research 470+ cities
AGENT_6_ML_ENHANCEMENT_PROMPT.md       ← Retrain model
AGENT_7_REFORM_CALCULATOR_PROMPT.md    ← Build calculator UI
AGENT_8_PHASE_2_INTEGRATION_PROMPT.md  ← Final integration

Supporting docs:
PHASE_2_AGENTS_README.md               ← This file
```

---

## What Each Agent Does

### Agent 5: Expand Reforms Database (6-8 hours)

**Research Task:** Find and document 470+ additional cities with zoning reforms

**Process:**
1. Research zoning reforms by state
2. Collect city, reform type, year, description
3. Find reliable sources
4. Validate data quality
5. Create CSV with 500+ cities

**Output:**
- `data/raw/city_reforms_expanded.csv` (500+ rows)
- `docs/city_reforms_sources.md` (research summary)

**Skills:** Research, data entry, source verification

**Why important:** Provides 12x more training data for ML model

---

### Agent 6: ML Model Enhancement (2-3 hours)

**Training Task:** Retrain random forest on 500+ cities with better features

**Process:**
1. Wait for Agent 5's reforms CSV
2. Load reforms + place metrics
3. Feature engineering
4. Train Random Forest model
5. Cross-validation
6. Generate performance report

**Output:**
- `data/outputs/reform_impact_model_v3.pkl` (trained model)
- `data/outputs/model_v3_performance.json` (metrics)
- `docs/ml_model_v3_analysis.md` (analysis)
- `scripts/27_retrain_ml_model_with_reforms.py` (script)

**Skills:** Python, scikit-learn, machine learning

**Why important:** Improves R² from -10.98 to >0.3

---

### Agent 7: Reform Impact Calculator (2-3 hours)

**UI Development:** Build interactive component for policymakers

**Process:**
1. Create service layer (`reform-impact-utils.ts`)
2. Create API routes for predictions
3. Build React component with form
4. Integrate with dashboard
5. Test locally

**Output:**
- `app/lib/reform-impact-utils.ts` (utilities)
- `app/app/api/reforms/predict/route.ts` (API)
- `app/components/visualizations/ReformImpactCalculator.tsx` (UI)

**Skills:** React, TypeScript, UI/UX

**Why important:** Gives policymakers actionable tool

---

### Agent 8: Integration & Deployment (1-2 hours)

**Integration Task:** Merge all Phase 2 outputs into production

**Process:**
1. Verify all Agent 5-7 outputs exist
2. Update dashboard with new component
3. Create API routes
4. Run comprehensive testing
5. Build & test locally
6. Final commit & push

**Output:**
- Updated `app/app/page.tsx` (dashboard)
- API routes for reforms
- `PHASE_2_COMPLETION_SUMMARY.md` (summary)
- Production-ready code

**Skills:** Integration, testing, deployment

**Why important:** Gets everything into production

---

## Success Metrics

### Agent 5: Reforms Expansion
- [x] 500+ cities documented
- [x] Data quality validated
- [x] CSV properly formatted

### Agent 6: ML Enhancement
- [x] Model trained on 450+ samples
- [x] R² > 0 (improvement from -10.98)
- [x] Cross-validation working

### Agent 7: Calculator
- [x] Component renders
- [x] Form working
- [x] Predictions displaying

### Agent 8: Integration
- [x] Build passes
- [x] No console errors
- [x] Tests passing
- [x] Ready to deploy

---

## Key Statistics After Phase 2

| Metric | Before Phase 2 | After Phase 2 | Improvement |
|--------|----------------|---------------|-------------|
| Reforms cities | 30 | 500+ | **16.7x** |
| Model R² | -10.98 | >0.3 | **+11.28 points** |
| Training samples | 36 | 450+ | **12.5x** |
| Model features | 3 | 7 | **+4 features** |
| ML predictions | None | Live | **New capability** |

---

## Parallel Execution Benefits

**Why parallel agents save time:**

- Agent 5 research (6-8 hours) can happen while Agents 6-7 work
- Agent 7 UI can be built while Agent 6 trains model
- Only Agent 8 (1-2 hours) must wait for all others
- **Total elapsed time:** ~10 hours (vs 13-16 hours sequential)

**Savings:** 3-6 hours!

---

## Dependencies & Order

```
Agent 5 (Reforms)
    ↓
Agent 6 (ML) needs Agent 5's CSV
    ↓
Agent 8 (Integration) needs Agents 5-7 output

Agent 7 (Calculator)
    ↓
Agent 8 (Integration) needs Agent 7 code

Agent 7 can start immediately (independent)
Agent 5 can start immediately (no dependencies)
Agent 6 waits for Agent 5 (needs CSV input)
Agent 8 waits for Agents 5-7 (integration only)
```

---

## How to Execute

### Option 1: All at Once (Parallel)

**Best for:** Fastest completion, available time now

```
Start in this order (can overlap):
1. Agent 5 (research) - 6-8 hours
2. Agent 7 (UI) - 2-3 hours (immediate)
3. Agent 6 (ML) - 2-3 hours (after Agent 5 ~hour 1)
4. Agent 8 (Integration) - 1-2 hours (after 5-7)

Total elapsed: ~10 hours
```

### Option 2: Phased (One at a Time)

**Best for:** Limited available time, run in stages

```
Day 1: Agent 5 (6-8 hours of research)
Day 2: Agents 6-7 (parallel, 2-3 hours each)
Day 3: Agent 8 (integration, 1-2 hours)
```

### Option 3: Custom Sequence

**Best for:** Specific priorities

```
High priority → Agent 7 first (UI/features)
Data priority → Agent 5 first (reforms)
ML priority → Agent 6 first (when ready)
```

---

## Copy-Paste Instructions

### For Agent 5:
1. Open `AGENT_5_EXPAND_REFORMS_PROMPT.md`
2. Select all (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)
4. Go to Claude Code Web tab
5. Paste into chat (Ctrl+V or Cmd+V)
6. Hit Enter

### For Agent 6:
1. Wait ~1 hour for Agent 5 to make progress
2. Open `AGENT_6_ML_ENHANCEMENT_PROMPT.md`
3. Select all, copy, paste (same as Agent 5)

### For Agent 7:
1. Open `AGENT_7_REFORM_CALCULATOR_PROMPT.md`
2. Copy and paste immediately (no dependencies)

### For Agent 8:
1. Wait for Agents 5-7 to complete
2. Open `AGENT_8_PHASE_2_INTEGRATION_PROMPT.md`
3. Copy and paste

---

## Estimated Timeline

**Parallel execution (recommended):**

| Time | Agent 5 | Agent 6 | Agent 7 | Agent 8 |
|------|---------|---------|---------|---------|
| 0:00 | Start research | - | Start UI | - |
| 1:00 | Researching... | Start training | Component building | - |
| 2:00 | Researching... | Training... | Component building | - |
| 3:00 | Researching... | Training... | Component building | - |
| 3:30 | - | Reports | Done ✓ | - |
| 4:00 | - | Done ✓ | - | - |
| 7:00 | Done ✓ | - | - | - |
| 8:00 | - | - | - | Start integration |
| 9:00 | - | - | - | Testing... |
| 10:00 | - | - | - | Done ✓ |

**Total: ~10 hours elapsed** (vs 13-16 hours sequential)

---

## Troubleshooting

### "Agent 5 can't find enough cities"
→ See AGENT_5 "Research Tips" section for high-yield sources

### "Agent 6 says model file not found"
→ Make sure Agent 5 completed and pushed to git

### "Agent 7 can't import components"
→ Check that imports match existing file structure

### "Agent 8 build is failing"
→ Check TypeScript errors, verify all files exist

### "One agent is taking longer than expected"
→ Can extend time, can skip that agent and come back

---

## After Phase 2 Complete

You'll have:

✅ **500+ reform cities** (vs 30)
✅ **Improved ML model** (R² > 0 vs -10.98)
✅ **Interactive calculator** (new feature)
✅ **Production-ready code** (ready to deploy)
✅ **Complete documentation** (for future reference)

**Ready for:**
- Phase 3 (Advanced Analytics)
- Public deployment
- Policymaker use

---

## Questions Before Starting?

Read these files in order:

1. **This file** (PHASE_2_AGENTS_README.md) - Overview
2. **PHASE_2_AGENT_STRATEGY.md** - Detailed strategy
3. **AGENT_5_EXPAND_REFORMS_PROMPT.md** - First agent

Then start Agent 5!

---

## Ready to Begin?

**Do this now:**

1. Open 3 Claude Code Web tabs
2. Have GitHub credentials ready
3. Clone repo locally
4. Read AGENT_5_EXPAND_REFORMS_PROMPT.md
5. Copy & paste into Claude Code tab 1
6. **START!**

---

**Expected outcome:** Phase 2 complete in ~10 hours with 3 parallel agents

**Next step:** Phase 3 (Advanced Analytics) in 3-4 weeks

Let's expand to 500+ cities and improve the model! 🚀

---

**Version:** 1.0
**Created:** 2025-11-20
**Status:** Ready for execution
**Support:** See individual agent prompts for detailed guidance
