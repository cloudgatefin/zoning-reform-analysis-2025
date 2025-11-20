# Phase 2 Execution Guide

**Date:** 2025-11-20
**Status:** ✅ All agent prompts created and ready for execution
**Commit:** 82daa82 (Phase 2 agent prompts)
**Timeline:** ~10 hours elapsed (parallel agents)

---

## What You Have Now

**6 comprehensive documents** ready to execute Phase 2 with **4 parallel AI agents**:

```
📋 PHASE_2_AGENT_STRATEGY.md              ← Master strategy overview
📋 PHASE_2_AGENTS_README.md               ← Quick start guide
📋 AGENT_5_EXPAND_REFORMS_PROMPT.md       ← Research 470+ cities
📋 AGENT_6_ML_ENHANCEMENT_PROMPT.md       ← Retrain model on 500+ cities
📋 AGENT_7_REFORM_CALCULATOR_PROMPT.md    ← Build calculator UI
📋 AGENT_8_PHASE_2_INTEGRATION_PROMPT.md  ← Final integration & deployment
```

**Total lines of documentation:** ~3,400 lines of detailed agent prompts

---

## Phase 2 Objectives

### Objective 1: Expand Reforms (Agent 5)
- Research and document **470+ additional cities** with zoning reforms
- Expand from **30 cities → 500+ cities** (16.7x expansion)
- Create searchable database for policymakers
- Provide training data for ML model

### Objective 2: Enhance ML Model (Agent 6)
- Retrain Random Forest on **450+ training samples** (vs 36 before)
- Improve **R² from -10.98 to >0.3** (12+ point improvement)
- Add **economic features** (income, employment, housing)
- Enable **place-level permit predictions**

### Objective 3: Build Calculator (Agent 7)
- Create **interactive React component** for policymakers
- Allow selection of **reform type** and **target city**
- Show **predicted permit impact** from ML model
- Display **comparisons to similar cities**
- Provide **sensitivity analysis** tools

### Objective 4: Integrate & Deploy (Agent 8)
- Merge all **Phase 2 components** into production
- Update **main dashboard** with calculator
- Create **API endpoints** for predictions
- **Test thoroughly** and prepare for deployment

---

## Execution Timeline

### Parallel Strategy (Recommended)

```
Start all agents simultaneously with proper timing:

TIME     AGENT 5              AGENT 6              AGENT 7              AGENT 8
────────────────────────────────────────────────────────────────────────────
0:00     START                -                    START                -
         Research
         470 cities

1:00     Researching...       START                Component build      -
                              Wait for CSV...

2:00     Researching...       Training...          Component build      -

3:00     Researching...       Training...          DONE ✓               -

3:30     Researching...       DONE ✓               -                    -
                              Reports...

7:00     DONE ✓               -                    -                    -
         CSV ready

8:00     -                    -                    -                    START
                                                                        Integration

9:00     -                    -                    -                    Testing...

10:00    -                    -                    -                    DONE ✓
                                                                        Deployed

═════════════════════════════════════════════════════════════════════════════
TOTAL ELAPSED TIME: ~10 hours (parallel agents)
vs 13-16 hours sequential
SAVINGS: 3-6 hours
═════════════════════════════════════════════════════════════════════════════
```

### Alternative: Sequential Strategy

If you prefer to do agents one at a time:

```
Day 1 (6-8 hours)  → Agent 5: Expand reforms
Day 2 (3-5 hours)  → Agents 6-7 sequential or parallel
Day 3 (1-2 hours)  → Agent 8: Integration
```

---

## How to Execute

### Pre-Execution Checklist (5 min)

- [ ] Have 3 Claude Code Web browser tabs open
- [ ] Have GitHub credentials ready
- [ ] Have Phase 1 repo cloned locally
- [ ] Have read PHASE_2_AGENTS_README.md
- [ ] Know which execution strategy you'll use

### Agent 5: Expand Reforms (6-8 hours)

**Start:** Right now
**File to copy:** `AGENT_5_EXPAND_REFORMS_PROMPT.md`

```bash
1. Open Claude Code Web in browser tab 1
2. Clone/navigate to repo
3. Open file: AGENT_5_EXPAND_REFORMS_PROMPT.md
4. Select all (Ctrl+A)
5. Copy (Ctrl+C)
6. Paste into Claude Code chat (Ctrl+V)
7. Hit Enter
8. Follow agent's step-by-step instructions
9. Expected completion: 6-8 hours of research
10. Agent will create: data/raw/city_reforms_expanded.csv
```

**What Agent 5 does:**
- Researches 470+ cities with zoning reforms
- Documents reform type, year, source
- Validates data quality
- Creates CSV with 500+ cities
- Pushes to GitHub

**Success criteria:**
- ✓ 500+ cities in CSV
- ✓ All required fields populated
- ✓ Data quality validated
- ✓ Committed to git

---

### Agent 7: Build Calculator (2-3 hours)

**Start:** Immediately (no dependencies)
**File to copy:** `AGENT_7_REFORM_CALCULATOR_PROMPT.md`

```bash
1. Open Claude Code Web in browser tab 2
2. Navigate to same repo
3. Open file: AGENT_7_REFORM_CALCULATOR_PROMPT.md
4. Copy all (Ctrl+A + Ctrl+C)
5. Paste into Claude Code chat (Ctrl+V)
6. Hit Enter
7. Follow agent's instructions
8. Expected completion: 2-3 hours
9. Agent will create: ReformImpactCalculator.tsx, API routes
```

**What Agent 7 does:**
- Creates React component for calculator
- Builds service layer utilities
- Creates API route for predictions
- Integrates with dashboard
- Tests locally

**Success criteria:**
- ✓ Component renders
- ✓ Form working
- ✓ API endpoints exist
- ✓ No console errors

---

### Agent 6: Retrain ML Model (2-3 hours)

**Start:** After Agent 5 has made progress (~1 hour in)
**File to copy:** `AGENT_6_ML_ENHANCEMENT_PROMPT.md`

```bash
1. Open Claude Code Web in browser tab 3
2. Navigate to same repo
3. Open file: AGENT_6_ML_ENHANCEMENT_PROMPT.md
4. Copy all (Ctrl+A + Ctrl+C)
5. Paste into Claude Code chat (Ctrl+V)
6. Hit Enter
7. Wait for Agent 5's CSV file to be ready
8. Follow agent's instructions
9. Expected completion: 2-3 hours (mostly waiting then training)
10. Agent will create: reform_impact_model_v3.pkl, metrics, report
```

**What Agent 6 does:**
- Waits for Agent 5's reforms CSV
- Loads place metrics
- Feature engineering
- Trains Random Forest model
- Cross-validation
- Generates performance report

**Success criteria:**
- ✓ Model trained on 450+ samples
- ✓ R² > 0
- ✓ Cross-validation working
- ✓ Model file created

---

### Agent 8: Integration & Deployment (1-2 hours)

**Start:** After Agents 5-7 complete
**File to copy:** `AGENT_8_PHASE_2_INTEGRATION_PROMPT.md`

```bash
1. Any Claude Code tab (Agents 5-7 will have finished)
2. Open file: AGENT_8_PHASE_2_INTEGRATION_PROMPT.md
3. Copy all (Ctrl+A + Ctrl+C)
4. Paste into Claude Code chat (Ctrl+V)
5. Hit Enter
6. Follow integration steps
7. Expected completion: 1-2 hours
8. Final output: Production-ready code, deployed
```

**What Agent 8 does:**
- Verifies all Agent 5-7 outputs exist
- Updates dashboard with calculator
- Creates remaining API routes
- Comprehensive testing
- Final commit and push
- Deployment preparation

**Success criteria:**
- ✓ Build passes
- ✓ No TypeScript errors
- ✓ No console errors
- ✓ All tests passing
- ✓ Ready for deployment

---

## Files Reference

### Master Documents (Read First)

```
PHASE_2_AGENT_STRATEGY.md
  → Strategic overview of Phase 2
  → Parallel execution plan
  → File dependency mapping
  → Success criteria

PHASE_2_AGENTS_README.md
  → Quick start guide
  → Copy-paste instructions
  → Troubleshooting tips
  → What you'll get
```

### Agent Prompts (Copy-Paste Ready)

```
AGENT_5_EXPAND_REFORMS_PROMPT.md
  → 470+ cities research
  → Complete instructions
  → Data validation
  → Expected outputs

AGENT_6_ML_ENHANCEMENT_PROMPT.md
  → Model retraining
  → Feature engineering
  → Training script
  → Performance analysis

AGENT_7_REFORM_CALCULATOR_PROMPT.md
  → React component building
  → API route creation
  → Integration steps
  → Testing checklist

AGENT_8_PHASE_2_INTEGRATION_PROMPT.md
  → Integration tasks
  → Testing & validation
  → Deployment guide
  → Final commit
```

---

## Expected Outputs After Phase 2

### Data Files
```
✓ data/raw/city_reforms_expanded.csv (500+ rows)
✓ data/outputs/reform_impact_model_v3.pkl (trained model)
✓ data/outputs/model_v3_performance.json (metrics)
✓ docs/ml_model_v3_analysis.md (analysis report)
✓ docs/city_reforms_sources.md (research summary)
```

### Code Files
```
✓ app/lib/reform-impact-utils.ts (utility functions)
✓ app/components/visualizations/ReformImpactCalculator.tsx (UI)
✓ app/app/api/reforms/predict/route.ts (prediction API)
✓ app/app/api/reforms/list/route.ts (reforms list API)
✓ scripts/27_retrain_ml_model_with_reforms.py (training script)
```

### Documentation
```
✓ PHASE_2_COMPLETION_SUMMARY.md (summary)
✓ PHASE_2_DEPLOYMENT.md (deployment guide)
✓ Updated dashboard with calculator integrated
```

---

## Key Metrics

### Before Phase 2
| Metric | Value |
|--------|-------|
| Reform cities | 30 |
| Model samples | 36 |
| Model R² | -10.98 |
| Model features | 3 |
| Calculator | None |

### After Phase 2
| Metric | Value |
|--------|-------|
| Reform cities | **500+** |
| Model samples | **450+** |
| Model R² | **>0.3** |
| Model features | **7** |
| Calculator | **✓ Live** |

### Improvements
| Metric | Improvement |
|--------|-------------|
| Cities | **16.7x** expansion |
| Samples | **12.5x** increase |
| R² Score | **+11.28 points** |
| Features | **+4** features |

---

## Troubleshooting Guide

### Agent 5: Reforms Research

**Issue: "Can't find enough cities"**
- Solution: Focus on quality over quantity (200+ cities is good progress)
- Use multiple sources (NLIHC, Lincoln Institute, academic papers)

**Issue: "URLs are outdated"**
- Solution: Use Wayback Machine (archive.org) to preserve URLs
- Document any alternative sources

### Agent 6: ML Training

**Issue: "CSV file not found"**
- Solution: Make sure Agent 5 completed and pushed changes
- Check: `git pull origin main`

**Issue: "Model training too slow"**
- Solution: Reduce n_estimators from 100 to 50
- Reduce CV folds from 5 to 3

### Agent 7: Calculator UI

**Issue: "Component won't render"**
- Solution: Check import paths match your structure
- Verify all dependencies installed

**Issue: "API returns 404"**
- Solution: Make sure API route file is created
- Check file path: `app/app/api/reforms/predict/route.ts`

### Agent 8: Integration

**Issue: "Build fails"**
- Solution: Check for TypeScript errors
- Run: `npm run build 2>&1 | head -50`

**Issue: "Missing component"**
- Solution: Check export statements in index.ts files
- Verify all new files committed to git

---

## After Phase 2: What's Next?

### Phase 2 Complete ✓
- 500+ reform cities documented
- ML model retrained (R² improved)
- Interactive calculator deployed
- Production-ready code

### Phase 3: Advanced Analytics (3-4 weeks)
- Economic feature integration
- Causal inference methods (DiD, SCM)
- Place-level forecasting
- API for third-party use

### Phase 4: Scale & Polish
- Performance optimization
- Advanced visualizations
- User authentication
- Production monitoring

---

## Success Checklist

### Agent 5: Reforms
- [ ] 500+ cities researched
- [ ] Data validated
- [ ] CSV created
- [ ] Pushed to GitHub

### Agent 6: ML
- [ ] Model trained
- [ ] R² > 0
- [ ] Reports generated
- [ ] Pushed to GitHub

### Agent 7: Calculator
- [ ] Component created
- [ ] API routes working
- [ ] Tested locally
- [ ] Pushed to GitHub

### Agent 8: Integration
- [ ] All outputs verified
- [ ] Dashboard updated
- [ ] Build passes
- [ ] Tests passing
- [ ] Deployed

---

## Quick Links

**Start here:**
1. Read: `PHASE_2_AGENTS_README.md` (quick overview)
2. Read: `PHASE_2_AGENT_STRATEGY.md` (detailed strategy)

**Then execute:**
1. Copy: `AGENT_5_EXPAND_REFORMS_PROMPT.md`
2. Copy: `AGENT_7_REFORM_CALCULATOR_PROMPT.md` (immediately)
3. Copy: `AGENT_6_ML_ENHANCEMENT_PROMPT.md` (after Agent 5 starts)
4. Copy: `AGENT_8_PHASE_2_INTEGRATION_PROMPT.md` (after Agents 5-7)

---

## Estimated Timeline

| Phase | Duration | Start | End | Blockers |
|-------|----------|-------|-----|----------|
| **Setup** | 5 min | Now | 0:05 | None |
| **Agent 5** | 6-8 hrs | 0:05 | 6-8 hrs | None |
| **Agent 7** | 2-3 hrs | 0:05 | 2-3 hrs | None |
| **Agent 6** | 2-3 hrs | 1:00 | 3-4 hrs | Waits for Agent 5 CSV |
| **Agent 8** | 1-2 hrs | 8:00 | 9-10 hrs | All Agents 5-7 complete |
| **TOTAL** | **~10 hrs** | **Now** | **10 hrs** | **Parallel advantage** |

**Note:** All agents run in parallel where possible → 10 hours total vs 13-16 sequential

---

## Final Checklist Before Starting

- [ ] Read `PHASE_2_AGENTS_README.md`
- [ ] Understand parallel execution strategy
- [ ] Have 3 Claude Code Web tabs ready
- [ ] Repo cloned locally
- [ ] GitHub credentials available
- [ ] Know which agent to start first
- [ ] Understand dependencies between agents
- [ ] Ready to commit changes after each agent
- [ ] Understand 10-hour timeline
- [ ] Ready to troubleshoot if needed

---

## You're Ready!

All Phase 2 agent prompts are created, documented, and ready to execute.

**Next action:** Start Agent 5 (copy AGENT_5_EXPAND_REFORMS_PROMPT.md and paste into Claude Code Web)

**Expected result:** Phase 2 complete in ~10 hours with 500+ reform cities, improved ML model, and interactive calculator.

**Then:** Phase 3 (Advanced Analytics)

---

**Status:** ✅ Phase 2 agents ready for execution
**Commit:** 82daa82
**Timeline:** ~10 hours (parallel)
**Next:** Run the agents!

Let's expand to 500+ cities and improve the model! 🚀
