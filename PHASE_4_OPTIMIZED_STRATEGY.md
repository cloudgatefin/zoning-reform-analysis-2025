# Phase 4: Optimized Parallel Agent Strategy

**Phase:** 4 (Causal Inference & Scenario Modeling)
**Timeline:** 4-5 weeks (all agents in parallel)
**Status:** Ready to plan and execute
**Agents:** 3 independent agents (no conflicts)

---

## Phase 4 Mission

Add research-grade causal inference methods and predictive scenario modeling to transform from "correlation" to "causation" in zoning reform analysis.

**Result after Phase 4:**
- ✅ Defensible causal claims ("This reform CAUSED X% increase")
- ✅ Scenario predictions ("If we adopt Y reform, expect Z permits")
- ✅ Multiple causal inference methods (DiD, SCM, Event Study)
- ✅ Policymaker confidence in findings
- ✅ Research-grade analytical platform

---

## Three Phase 4 Agents (Parallel Execution)

### Agent 12: Difference-in-Differences (DiD) Analysis
**Duration:** 25-30 hours
**What it builds:**
- Backend Python scripts for DiD calculation
- API endpoints for DiD results
- Dashboard panels showing:
  - Treatment vs. control group comparison
  - Parallel trends assumption test
  - Treatment effect estimate
  - Confidence intervals
  - Control group characteristics

**Why DiD first:**
- Most intuitive causal method
- Foundation for other methods
- Easiest to implement and explain
- Shows immediate value

**Key deliverables:**
- `scripts/31_compute_did_analysis.py` - Core DiD calculation
- `app/lib/did-utils.ts` - Utility functions
- `app/components/visualizations/DiDAnalysisPanel.tsx` - UI component
- `app/app/api/causal-analysis/did/route.ts` - API endpoint

---

### Agent 13: Scenario Modeling System
**Duration:** 30-40 hours
**What it builds:**
- UI for policymakers to select reforms and cities
- Prediction system based on ML model
- Uncertainty quantification (optimistic/realistic/pessimistic scenarios)
- Comparison to historical examples
- Report generation for scenarios

**Why important:**
- Answers core policymaker question: "What if we adopt this reform?"
- Turns analysis into actionable predictions
- Enables "try before you buy" approach to policy

**Key deliverables:**
- `app/components/ScenarioBuilder.tsx` - Main UI
- `app/lib/scenario-utils.ts` - Calculation logic
- `app/app/scenario/page.tsx` - Scenario page
- `app/app/api/scenarios/predict/route.ts` - Prediction API
- Enhanced ML model integration

---

### Agent 14: Synthetic Control Method (SCM) + Event Study
**Duration:** 35-40 hours
**What it builds:**
- SCM analysis showing city compared to synthetic peer
- Donor pool visualization
- Pre/post treatment comparison
- Event Study visualization
  - Dynamic treatment effects over time
  - Pre-trend validation
  - Confidence bands

**Why these methods:**
- SCM: Single case study approach (perfect for "your city")
- Event Study: Shows when effects take hold
- Together: Complete causal toolkit

**Key deliverables:**
- `scripts/32_synthetic_control.py` - SCM computation
- `scripts/33_event_study.py` - Event study analysis
- `app/components/visualizations/SyntheticControlPanel.tsx`
- `app/components/visualizations/EventStudyChart.tsx`
- `app/app/api/causal-analysis/scm/route.ts`
- `app/app/api/causal-analysis/event-study/route.ts`

---

## Parallel Execution Strategy

### Why These 3 Can Run in Parallel
```
Agent 12 (DiD)      → Python scripts + API + UI component
Agent 13 (Scenarios) → React UI + prediction logic
Agent 14 (SCM/ES)    → Python scripts + visualizations

File separation:
- Agent 12: scripts/31_*, app/lib/did-*, components/DiD*
- Agent 13: app/scenario/*, app/lib/scenario-*, ScenarioBuilder*
- Agent 14: scripts/32_*, scripts/33_*, SCM*, EventStudy*

No overlaps → No conflicts → True parallelization ✅
```

### Timeline
```
Week 1:  Agents 12, 13, 14 start simultaneously
Week 2:  DiD mostly complete, Scenarios mid-way, SCM/ES starting
Week 3:  Scenarios complete, DiD polish, SCM/ES development
Week 4:  All agents testing, integration
Week 5:  Final deployment, Phase 4 complete

Elapsed: 4-5 weeks (all parallel)
vs. Sequential: 10-12 weeks
Savings: 5-7 weeks ⏱️
```

---

## Implementation Approach

### Three Execution Options

#### Option A: Conservative (Recommended for First-Time)
1. Create Agent 12 prompt only (DiD)
2. Execute Agent 12 (2-3 weeks)
3. Test DiD implementation
4. Then create Agents 13-14
5. Execute Agents 13-14 in parallel (4-5 weeks)
6. Total: 6-8 weeks

**Pros:** Lower risk, proven approach, can iterate
**Cons:** Slower than parallel

---

#### Option B: Aggressive (Recommended for Speed)
1. Create all 3 agent prompts immediately (3 hours)
2. Execute all 3 agents in parallel (Day 1)
3. Agents work simultaneously (4-5 weeks)
4. Merge all to main when complete
5. Total: 4-5 weeks

**Pros:** Fastest possible (parallel execution)
**Cons:** Need to handle any conflicts (unlikely but possible)

---

#### Option C: Balanced (Recommended Overall) ⭐
1. Create Agent 12 + 13 prompts (2 hours)
2. Execute Agents 12 + 13 in parallel (Day 1)
3. After 1 week, create Agent 14 prompt
4. Add Agent 14 to parallel execution
5. All complete in ~4-5 weeks

**Pros:** Gets Agents 12-13 working quickly, adds Agent 14 when confident
**Cons:** Slightly more planning overhead

---

## Phase 4 Architecture

### Data Flow

```
User selects reform + city
        ↓
ScenarioBuilder UI (Agent 13)
        ↓
Prediction API (Agent 13)
        ↓
ML Model v3 (already built Phase 2)
        ↓
Scenario results with uncertainty bounds
        ↓
Compare to DiD results (Agent 12)
        ↓
Compare to similar cities (SCM from Agent 14)
        ↓
Event Study timeline (Agent 14)
        ↓
User sees: "If you adopt ADU reform, expect X% permits (range: Y-Z)"
```

### Integration Points

**Agent 12 (DiD) Integrates With:**
- Existing reform database (502 cities)
- Place metrics data
- Historical permit data
- API to return treatment effects

**Agent 13 (Scenarios) Integrates With:**
- ML model v3 (from Phase 2)
- Place metrics
- Reform database
- UI for user input

**Agent 14 (SCM/Event Study) Integrates With:**
- Reform database
- Historical permits
- Python analysis backend

---

## Success Criteria for Phase 4

### Agent 12 (DiD) Success
- ✅ DiD calculations accurate
- ✅ API returns treatment effects with confidence intervals
- ✅ UI shows parallel trends test results
- ✅ Dashboard panel responsive
- ✅ No TypeScript errors

### Agent 13 (Scenarios) Success
- ✅ UI allows selecting city + reform
- ✅ Predictions generated with uncertainty bounds
- ✅ Shows optimistic/realistic/pessimistic scenarios
- ✅ Comparisons to similar cities working
- ✅ Mobile responsive
- ✅ No errors

### Agent 14 (SCM/Event Study) Success
- ✅ SCM analysis computing correctly
- ✅ Event Study showing dynamic effects
- ✅ Visualizations clear and informative
- ✅ All confidence intervals calculated
- ✅ Pre-trend validation working

### Overall Phase 4
- ✅ All 3 agents deployed
- ✅ Build passes
- ✅ No merge conflicts
- ✅ Causal analysis working
- ✅ Scenario predictions live
- ✅ Platform ready for Phase 5

---

## Next Steps (Recommended Sequence)

### Immediate (Next 2 hours)
```
1. Decide: Conservative, Balanced, or Aggressive approach?
2. Create Agent 12 prompt (DiD Analysis) - 60 min
3. Create Agent 13 prompt (Scenario Modeling) - 60 min
4. (Optional) Create Agent 14 prompt - 60 min
```

### Short Term (Next 4-5 weeks)
```
1. Launch agents in chosen configuration
2. Monitor progress
3. Test features as they're completed
4. Provide guidance if agents ask questions
5. Merge to main when all agents done
```

### Medium Term (After Phase 4)
```
1. Test causal analysis thoroughly
2. Get feedback from policymakers
3. Document causal interpretation guidelines
4. Plan Phase 5 (Custom Report Builder)
```

---

## What's Required for Phase 4 Agents

### Dependencies Needed
```
✅ scikit-learn (for DiD, already have)
✅ pandas (for data processing, already have)
✅ numpy (for calculations, already have)
📦 statsmodels (for DiD statistical tests - need to add)
📦 synth (for synthetic control - need to add)
✅ React components (Agent 13 UI)
✅ Recharts (for visualizations)
```

### Data Available
```
✅ 502 cities with reforms (Phase 2)
✅ Place metrics (24,535 places)
✅ ML model v3 (Phase 2)
✅ Historical permit data (2015-2024)
✅ Economic characteristics (census data)
```

### Infrastructure
```
✅ API routes ready
✅ Database configured
✅ Frontend ready
✅ Build pipeline working
```

---

## Risk Mitigation

### Potential Issues & Solutions

**Issue:** "Python dependencies missing"
**Solution:** Add to package.json early, pip install in scripts

**Issue:** "DiD calculations slow"
**Solution:** Optimize with vectorized numpy operations, cache results

**Issue:** "Scenario predictions unreliable"
**Solution:** Use ensemble of predictions, add confidence intervals, compare to historical

**Issue:** "SCM donor pool empty"
**Solution:** Use fallback to KNN matching, select alternate control group

**Issue:** "Merge conflicts"
**Solution:** Unlikely (different files), but resolves easily if needed

---

## Commit Strategy

### Agent 12 Completion
```
Commit: "Agent 12: Implement Difference-in-Differences causal analysis"
- DiD calculation scripts
- API endpoints
- Dashboard panel
- Tests and documentation
```

### Agent 13 Completion
```
Commit: "Agent 13: Build scenario modeling and prediction system"
- Scenario builder UI
- Prediction logic
- Report generation
- Integration with ML model
```

### Agent 14 Completion
```
Commit: "Agent 14: Add Synthetic Control Method and Event Study analysis"
- SCM calculation scripts
- Event Study implementation
- Visualizations
- API endpoints
```

### Final Integration
```
Commit: "Phase 4 Complete: Causal inference and scenario modeling deployed"
- Merge all agent work
- Documentation updates
- Ready for Phase 5
```

---

## Timeline Estimate

### Conservative Path (Sequential)
- Agent 12: Weeks 1-2 (DiD foundation)
- Agents 13-14: Weeks 3-6 (parallel after DiD)
- Total: 6-8 weeks

### Balanced Path (Recommended) ⭐
- Agents 12-13: Weeks 1-4 (parallel)
- Agent 14: Weeks 3-5 (parallel, starts after 1 week)
- Total: 4-5 weeks

### Aggressive Path (Fastest)
- All 3 agents: Weeks 1-5 (all parallel from start)
- Total: 4-5 weeks

---

## Decision Point

### What Path Will You Choose?

```
Conservative: Slow but safe, proven approach
Balanced:     Good balance of speed and control ⭐ RECOMMENDED
Aggressive:   Fastest, requires confidence in agents
```

**Recommendation:** Balanced approach
- Execute Agents 12-13 immediately in parallel
- Add Agent 14 after 1 week once 12-13 are underway
- Results in 4-5 weeks to Phase 4 completion

---

## After Phase 4

### What You'll Have
✅ Research-grade causal inference (3 methods)
✅ Defensible policy impact claims
✅ Scenario predictions for policymakers
✅ Confidence intervals and uncertainty quantification
✅ Complete analytical platform
✅ Ready for Phase 5 (Custom Report Builder)

### Phase 5 Goals
- Custom report generation (PDF/PowerPoint)
- Branding options
- Executive summaries
- Visual report templates
- Scheduled report generation

---

## Ready to Proceed?

**Next action:**
1. Read this document ✓
2. Decide on execution approach (Conservative/Balanced/Aggressive)
3. Notify when ready to create Phase 4 agent prompts
4. I'll create detailed prompts for your chosen approach
5. You launch agents and monitor
6. Phase 4 complete in 4-5 weeks

---

**Status:** Phase 4 strategy ready
**Next:** Create agent prompts based on your chosen approach
**Timeline:** 4-5 weeks to Phase 4 completion

