# Phase 2: Parallel Agent Strategy

**Date:** 2025-11-20
**Phase:** 2 (Expand Reforms & Enhance ML)
**Timeline:** 2-3 weeks
**Execution:** 3 parallel agents + 1 sequential integration agent
**Cost:** $0 (free tools only)

---

## Overview

Phase 2 has three main objectives:

1. **Expand reforms database** from 30 to 500+ cities with documented zoning reforms
2. **Retrain ML model** on 500+ cities with better features and causal analysis
3. **Build reform impact calculator** to predict permit increases from reforms

These can be executed in parallel with zero file conflicts.

---

## Phase 2 Agent Structure

### Execution Strategy

```
PARALLEL PHASE (Run simultaneously)
├── Agent 1: Expand Reforms Database (30 → 500+ cities)
│   └── Time: 6-8 hours (research-heavy)
├── Agent 2: ML Model Enhancement (Retrain on 500+ cities)
│   └── Time: 2-3 hours (scripting + training)
└── Agent 3: Reform Impact Calculator (UI + predictive component)
    └── Time: 2-3 hours (React component + calculations)

SEQUENTIAL PHASE (After parallel agents complete)
└── Agent 4: Integration & Validation
    └── Time: 1-2 hours (testing, deployment, docs)

Total timeline: ~8-10 hours work + 1-2 hours integration
```

### Why This Works

| Agent | Independence | Conflicts | Can Parallel |
|-------|--------------|-----------|--------------|
| Agent 1 | High | Creates CSV only | Yes ✓ |
| Agent 2 | Medium | Uses CSV from Agent 1 | Yes ✓ (creates its own output) |
| Agent 3 | High | Creates React component | Yes ✓ |
| Agent 4 | Depends on 1-3 | Integrates all outputs | No (sequential) |

---

## Agent 1: Expand Reforms Database

**Focus:** Research & document 470+ more cities with zoning reforms

**Input Files:**
- `data/raw/city_reforms.csv` (30 cities, baseline)
- External research sources (web, papers, news)

**Output Files:**
- `data/raw/city_reforms_expanded.csv` (500+ cities)
- `docs/city_reforms_sources.md` (research documentation)

**Deliverables:**
- 470+ new cities with reforms documented
- Reform types, years, impact categories
- Source documentation for each reform
- Data quality validation

**Time:** 6-8 hours (research-intensive)

**Skills Needed:** Research, data validation, documentation

---

## Agent 2: ML Model Enhancement

**Focus:** Retrain ML model on 500+ cities with economic features

**Input Files:**
- `data/raw/city_reforms_expanded.csv` (from Agent 1)
- `data/outputs/place_metrics_comprehensive.csv` (existing)
- Census ACS economic data (to fetch or estimate)
- Zillow housing data (optional enhancement)

**Output Files:**
- `data/outputs/reform_impact_model_v3.pkl` (retrained model)
- `scripts/27_retrain_ml_model_with_reforms.py` (retraining script)
- `docs/ml_model_v3_performance.md` (performance report)

**Deliverables:**
- Retrained Random Forest on 500+ cities
- Economic features integrated (income, employment, housing prices)
- Model validation & performance metrics
- Feature importance analysis
- Causal methods comparison (DiD, SCM)

**Time:** 2-3 hours

**Skills Needed:** Python, scikit-learn, machine learning, statistical analysis

---

## Agent 3: Reform Impact Calculator

**Focus:** Build UI component to predict permit impact from reforms

**Input Files:**
- `data/outputs/reform_impact_model_v3.pkl` (from Agent 2)
- `data/outputs/place_metrics_comprehensive.csv` (existing)
- `data/raw/city_reforms_expanded.csv` (from Agent 1)

**Output Files:**
- `app/components/visualizations/ReformImpactCalculator.tsx` (NEW)
- `app/lib/reform-impact-utils.ts` (utilities, NEW)
- `app/app/api/reforms/predict/route.ts` (API endpoint, NEW)

**Deliverables:**
- Interactive calculator component
- Permit increase prediction
- Sensitivity analysis controls
- Comparison to similar cities
- Visualization of predicted impacts

**Time:** 2-3 hours

**Skills Needed:** React, TypeScript, UI/UX, visualization

---

## Agent 4: Integration & Deployment

**Focus:** Integrate all Agent 1-3 outputs and prepare for production

**Input Files:**
- All outputs from Agents 1-3
- `package.json` (existing)
- Deployment configuration

**Output Files:**
- Updated `app/app/page.tsx` (dashboard integration)
- Test suite for new components
- Deployment documentation

**Deliverables:**
- All Phase 2 components integrated
- Tests passing
- Documentation complete
- Ready for production deployment

**Time:** 1-2 hours

**Skills Needed:** Integration, testing, documentation

---

## File Dependency Map

```
Agent 1 creates:
  data/raw/city_reforms_expanded.csv (500+ cities)
  docs/city_reforms_sources.md

Agent 2 uses:
  ✓ city_reforms_expanded.csv (from Agent 1)
  ✓ place_metrics_comprehensive.csv (existing)
  → Creates: reform_impact_model_v3.pkl

Agent 3 uses:
  ✓ reform_impact_model_v3.pkl (from Agent 2)
  ✓ place_metrics_comprehensive.csv (existing)
  ✓ city_reforms_expanded.csv (from Agent 1)
  → Creates: ReformImpactCalculator.tsx

Agent 4 integrates:
  ✓ All outputs from Agents 1-3
  ✓ Existing dashboard components
  → Deploys to production
```

### No File Conflicts ✓

- Agent 1: Creates new CSV file (no overwrites)
- Agent 2: Creates new Python script & pickle file (no overwrites)
- Agent 3: Creates new React component & API route (no overwrites)
- Agent 4: Modifies only main dashboard page (sequential, safe)

---

## Parallel Execution Timeline

```
Hour 0:00 ──────────────────────────────────────────── Hour 8:00
│
├─ Agent 1 ████████ Expand reforms (6-8 hours)
│           ├─ Research 470+ cities
│           ├─ Document reforms
│           └─ Validate data
│
├─ Agent 2 ███████ Retrain ML (2-3 hours, after hour 1)
│           ├─ Fetch economic data
│           ├─ Retrain model
│           └─ Generate report
│
├─ Agent 3 ███████ Build calculator (2-3 hours)
│           ├─ Create React component
│           ├─ Add API route
│           └─ Integrate predictions
│
└─ Agent 4       ██ Integration (1-2 hours, after Agents 1-3)
                 ├─ Test all components
                 ├─ Update dashboard
                 └─ Deploy

Total elapsed time: ~10 hours (parallel) + 2 hours (sequential)
```

---

## Agent Prompts Location

Each agent has a self-contained prompt file ready to copy/paste:

- **AGENT_5_EXPAND_REFORMS_PROMPT.md** - Expand 30 → 500+ cities
- **AGENT_6_ML_ENHANCEMENT_PROMPT.md** - Retrain model with 500+ cities
- **AGENT_7_REFORM_CALCULATOR_PROMPT.md** - Build impact calculator UI
- **AGENT_8_PHASE_2_INTEGRATION_PROMPT.md** - Final integration & deployment

---

## Success Criteria

### Phase 2.1 (Agent 1)
- [ ] 500+ cities with reforms documented
- [ ] Reform types and years recorded
- [ ] Sources documented for each reform
- [ ] Data quality validated
- [ ] CSV file created with correct schema

### Phase 2.2 (Agent 2)
- [ ] Model retrained on 500+ cities
- [ ] Economic features integrated
- [ ] Model performance improved (R² > 0.3)
- [ ] Feature importance analysis provided
- [ ] Cross-validation results documented

### Phase 2.3 (Agent 3)
- [ ] Calculator component working
- [ ] Predictions displayed correctly
- [ ] Sensitivity analysis working
- [ ] Responsive design
- [ ] No console errors

### Phase 2 Integration (Agent 4)
- [ ] All components integrated
- [ ] Tests passing
- [ ] Dashboard updated
- [ ] Deployment ready
- [ ] Documentation complete

---

## How to Execute

### Setup (Before Starting Agents)

1. Verify Phase 1 is complete
2. Check data files exist:
   - `data/outputs/place_metrics_comprehensive.csv`
   - `data/raw/city_reforms.csv`
3. Have 3 Claude Code Web sessions ready
4. Clone this repository locally

### Start Agents

1. **Start Agent 1** (Research intensive, can run longest)
   - Open Claude Code Web session 1
   - Copy AGENT_5_EXPAND_REFORMS_PROMPT.md content
   - Paste into chat
   - Follow agent's instructions

2. **Start Agent 2** (After Agent 1 starts, 1-2 hours in)
   - Open Claude Code Web session 2
   - Copy AGENT_6_ML_ENHANCEMENT_PROMPT.md content
   - Paste into chat
   - Wait for Agent 1 to produce city_reforms_expanded.csv

3. **Start Agent 3** (Immediately, no dependencies)
   - Open Claude Code Web session 3
   - Copy AGENT_7_REFORM_CALCULATOR_PROMPT.md content
   - Paste into chat
   - Follow agent's instructions

4. **Start Agent 4** (After Agents 1-3 complete)
   - After all outputs ready
   - Copy AGENT_8_PHASE_2_INTEGRATION_PROMPT.md content
   - Run integration & deployment steps

---

## Cost & Timeline Analysis

| Phase | Agent | Time | Cost | Benefit |
|-------|-------|------|------|---------|
| 2.1 | Expand Reforms | 6-8 hrs | $0 | 5x more cities (30→500+) |
| 2.2 | ML Enhancement | 2-3 hrs | $0 | Better model (R²: -10.98 → >0.3) |
| 2.3 | Calculator | 2-3 hrs | $0 | Actionable predictions |
| 2.4 | Integration | 1-2 hrs | $0 | Production ready |
| **Total** | **4 agents** | **~10 hrs parallel** | **$0** | **500+ cities + better predictions** |

**Alternative (Sequential):** 20+ hours of work
**This (Parallel):** ~10 hours elapsed time (agents working simultaneously)

---

## What You Get After Phase 2

### ✅ Deliverables

- 500+ cities with documented zoning reforms
- Retrained ML model with economic features
- Reform impact calculator (interactive)
- All integrated on main dashboard
- Production-ready code
- Complete documentation

### ✅ Impact

- **Coverage:** 500+ cities (vs 30 before)
- **Model:** R² > 0.3 (vs -10.98 before)
- **Usability:** Policymakers can predict reform impact
- **Features:** Economic context + causal methods
- **Cost:** $0 (fully bootstrapped)

---

## Next After Phase 2

**Phase 3: Advanced Analytics** (3-4 weeks)
- Economic feature integration (full)
- Causal inference deep dive
- Synthetic control method
- Place-level forecasting
- API for third-party use

---

## Questions?

See individual agent prompts for detailed instructions:
- AGENT_5_EXPAND_REFORMS_PROMPT.md
- AGENT_6_ML_ENHANCEMENT_PROMPT.md
- AGENT_7_REFORM_CALCULATOR_PROMPT.md
- AGENT_8_PHASE_2_INTEGRATION_PROMPT.md

---

**Ready to accelerate Phase 2?**

Create 3 Claude Code Web sessions and start the agents in parallel.

Expected completion: ~10 hours elapsed (with 3 agents working simultaneously)
