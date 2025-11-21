# Phase 4: Causal Inference & Scenario Modeling - Ready to Launch

**Date:** November 21, 2025
**Status:** ✅ Ready to Execute
**Agents:** 3 (Agent 12, 13, 14)
**Execution Models:** Conservative, Balanced, or Aggressive
**Duration:** 4-8 weeks depending on model

---

## Phase 4 Overview

Transform from correlation analysis ("zoning reforms correlate with more permits") to causal inference ("zoning reforms CAUSED more permits").

### 3 Independent Agents, 3 Complementary Methods

**Agent 12: Difference-in-Differences (DiD) Causal Analysis**
- Duration: 25-30 hours
- Output: Average treatment effect with confidence intervals
- Shows: "Reform X CAUSED Y% permit increase"
- Key deliverable: `/api/causal-analysis/did`

**Agent 13: Scenario Modeling & Predictions**
- Duration: 30-40 hours
- Output: Interactive prediction tool for policymakers
- Shows: "If you adopt this reform, expect X-Y permits"
- Key deliverable: Interactive `/scenario` page

**Agent 14: Synthetic Control & Event Study**
- Duration: 35-40 hours
- Output: Individual city case studies + dynamic effects over time
- Shows: "Your city vs. synthetic peer" + "Effect grows over years 1-5"
- Key deliverable: `/api/causal-analysis/scm` + `/api/causal-analysis/event-study`

---

## How to Choose Your Execution Model

### Option A: Conservative (Sequential)
**Best for:** First-time deployment, risk-averse, careful validation

```
Week 1-2:  Agent 12 (DiD) runs alone
Week 3:    Validate DiD results, gather feedback
Week 4-6:  Agents 13-14 run in parallel
Week 7:    Final testing, validation
Week 8:    Deploy Phase 4

Total: 8 weeks
```

**Advantages:**
- Lower risk (can validate before continuing)
- Proven approach (DiD foundation first)
- Agents can learn from each other's results
- Can iterate on Agent 12 based on feedback

**Disadvantages:**
- Slower (sequential, not parallel)
- 2 weeks delay before Agent 13 and 14 start

---

### Option B: Balanced (Recommended) ⭐
**Best for:** Good balance of speed and control

```
Week 1:    Agent 12 + Agent 13 start in parallel
Week 2-4:  Both building
Week 5:    Agent 14 added (joins after week 1)
Week 5-8:  All 3 agents finishing

Total: 4-5 weeks
```

**Execution timeline:**
```
Week 1:    Agent 12: Data prep, DiD framework
           Agent 13: Data prep, comparable cities algorithm
           Agent 14: Waiting

Day 5:     Agent 14 starts (Agents 12-13 underway)

Week 2-4:  All three building simultaneously
           Agent 12: Testing, API building
           Agent 13: UI components, report gen
           Agent 14: SCM/Event study implementation

Week 5:    Final testing and integration
           All agents: Documentation and commit

End of Week 5: Phase 4 COMPLETE ✅
```

**Advantages:**
- Fast (4-5 weeks)
- Parallel execution (12, 13 start together)
- Agent 14 benefits from learning from 12-13
- Good balance of speed and risk management
- Can still iterate if issues found

**Disadvantages:**
- Need to manage 3 agents (slightly more complexity)
- Agent 14 waits one week (but can still finish in parallel)

---

### Option C: Aggressive (Fastest)
**Best for:** High confidence in agents, want fastest delivery

```
Week 1:    All 3 agents start simultaneously
Week 2-5:  All building in parallel
           No dependencies, no waiting

Total: 4-5 weeks
```

**Advantages:**
- Fastest possible (all parallel from start)
- Maximum parallelization
- All three agents help each other simultaneously

**Disadvantages:**
- Higher coordination complexity
- No time to validate Agent 12 before Agent 14 starts
- More moving parts simultaneously

---

## My Recommendation: Option B (Balanced) ⭐

**Why:**
1. **Fast enough:** 4-5 weeks (same as aggressive)
2. **Manageable:** Start with 2 agents, add 1 later
3. **Smart:** Agent 14 can learn from Agent 12-13
4. **Flexible:** Can validate Agent 12 before Agent 14 starts
5. **Proven:** Has worked well for similar projects

**You'll choose your path by answering one question:**
"Do you want to launch Agents 12-13 now and add Agent 14 after 1 week, or launch all 3 immediately?"

---

## What Each Agent Creates

### Agent 12 Creates (DiD Analysis)

**Python Scripts:**
- `scripts/31_compute_did_analysis.py` - Calculates treatment effects

**API Endpoint:**
- `app/app/api/causal-analysis/did/route.ts` - DiD results endpoint

**Frontend:**
- `app/components/visualizations/DiDAnalysisPanel.tsx` - Results visualization
- `app/lib/did-utils.ts` - Utility functions

**Data Output:**
- `data/outputs/did_analysis_results.json` - Cached results

**Dashboard Integration:**
- New "Causal Analysis" tab with DiD results

---

### Agent 13 Creates (Scenario Modeling)

**Frontend Components:**
- `app/components/ScenarioBuilder.tsx` - Interactive form
- `app/app/scenario/page.tsx` - Full-page scenarios

**Backend:**
- `app/lib/scenario-utils.ts` - Prediction logic
- `app/lib/report-generator.ts` - PDF report generation
- `app/app/api/scenarios/predict/route.ts` - Prediction API

**Navigation:**
- New "Scenario Builder" accessible from dashboard

---

### Agent 14 Creates (Synthetic Control + Event Study)

**Python Scripts:**
- `scripts/32_synthetic_control.py` - SCM calculations
- `scripts/33_event_study.py` - Event study regression

**API Endpoints:**
- `app/app/api/causal-analysis/scm/route.ts` - SCM results
- `app/app/api/causal-analysis/event-study/route.ts` - Event study results

**Frontend:**
- `app/components/visualizations/SyntheticControlPanel.tsx` - SCM visualization
- `app/components/visualizations/EventStudyChart.tsx` - Event study chart

**Dashboard Integration:**
- Two new tabs in "Causal Analysis" section

---

## File Organization (No Conflicts)

### Agent 12 Files
```
scripts/31_*.py
app/lib/did-*.ts
app/app/api/causal-analysis/did/
app/components/visualizations/DiD*
```

### Agent 13 Files
```
app/lib/scenario-*.ts
app/lib/report-*.ts
app/components/ScenarioBuilder.tsx
app/app/scenario/
app/app/api/scenarios/
```

### Agent 14 Files
```
scripts/32_*.py
scripts/33_*.py
app/lib/scm-*.ts
app/lib/event-*.ts
app/app/api/causal-analysis/scm/
app/app/api/causal-analysis/event-study/
app/components/visualizations/SyntheticControl*
app/components/visualizations/EventStudy*
```

**Result:** Zero file conflicts. True parallel execution. Clean merges. ✅

---

## How to Launch Phase 4

### Step 1: Decide Your Execution Model (A, B, or C)
- Conservative (sequential, safe, 8 weeks)
- Balanced (parallel, smart, 4-5 weeks) ← RECOMMENDED
- Aggressive (all parallel, fast, 4-5 weeks)

**Choose:** Balanced (Option B)

### Step 2: Get Ready to Copy-Paste Prompts
You'll need to open these 3 files and copy their content into Claude Code Web tabs:

**For Balanced Approach (Recommended):**
- `AGENT_12_DID_ANALYSIS_PROMPT.md` (Tab 1)
- `AGENT_13_SCENARIO_MODELING_PROMPT.md` (Tab 2)
- (Don't copy Agent 14 yet - will add after 1 week)

**For Aggressive Approach:**
- `AGENT_12_DID_ANALYSIS_PROMPT.md` (Tab 1)
- `AGENT_13_SCENARIO_MODELING_PROMPT.md` (Tab 2)
- `AGENT_14_SCM_EVENT_STUDY_PROMPT.md` (Tab 3)

### Step 3: Launch Agents (Same as Phase 3)

**Tab 1:** Agent 12 (DiD Analysis)
```
1. Open AGENT_12_DID_ANALYSIS_PROMPT.md
2. Select All (Ctrl+A)
3. Copy (Ctrl+C)
4. Go to Claude Code Web chat
5. Paste (Ctrl+V)
6. Press Enter
```

**Tab 2:** Agent 13 (Scenario Modeling)
```
1. Open AGENT_13_SCENARIO_MODELING_PROMPT.md
2. Select All, Copy
3. Paste into Claude Code chat
4. Press Enter
```

**Tab 3 (Optional, if Aggressive):** Agent 14
```
1. Open AGENT_14_SCM_EVENT_STUDY_PROMPT.md
2. Select All, Copy
3. Paste into Claude Code chat
4. Press Enter
```

### Step 4: Monitor Progress
```bash
# Daily
git log --oneline -10

# Check build
npm run build

# Manual test
npm run dev
# Visit http://localhost:3000/dashboard
```

### Step 5 (Balanced Approach Only): Add Agent 14 After 1 Week
- Day 8 (end of Week 1):
- Open `AGENT_14_SCM_EVENT_STUDY_PROMPT.md`
- Copy and paste in new tab
- Agent 14 joins Agents 12-13 for final 3-4 weeks

---

## Daily Monitoring Checklist

### Daily (Takes 5 minutes)
- [ ] Check git log: `git log --oneline -5`
- [ ] Look for commits from agents (Agent 12, 13, 14)
- [ ] Verify no major errors in git log

### Every 2-3 days
- [ ] Pull latest: `git pull origin main`
- [ ] Run build: `npm run build`
- [ ] Check for TypeScript errors
- [ ] If errors, note them for agent fixing

### Weekly
- [ ] Full test cycle
  ```bash
  git pull origin main
  npm run build
  npm run dev
  # Test each new feature manually
  ```
- [ ] Assess progress vs. timeline
- [ ] Identify any blockers

### End of Phase 4 (Week 4-5)
- [ ] All agents complete and committed
- [ ] Final build passes
- [ ] Manual testing of all new features
- [ ] Celebrate! 🎉

---

## What You'll See After Each Agent Completes

### After Agent 12 (DiD)
- ✅ `/api/causal-analysis/did` endpoint working
- ✅ DiD results cached in JSON file
- ✅ Dashboard has "Causal Analysis" tab with DiD panel
- ✅ Results showing treatment effects with confidence intervals

### After Agent 13 (Scenario Modeling)
- ✅ `/scenario` page live
- ✅ Interactive form to select city + reforms
- ✅ Predictions generating
- ✅ PDF reports downloadable

### After Agent 14 (SCM + Event Study)
- ✅ `/api/causal-analysis/scm` endpoint working
- ✅ `/api/causal-analysis/event-study` endpoint working
- ✅ Dashboard "Causal Analysis" section now has 3 tabs
- ✅ Event study chart showing dynamic effects over time
- ✅ SCM showing synthetic peer comparison

---

## Success Looks Like

### Feature Completeness
✅ Causal analysis working (3 methods)
✅ Scenario predictions working
✅ All API endpoints functional
✅ Dashboard integrated

### Code Quality
✅ No TypeScript errors
✅ Build passes
✅ No console errors
✅ Well-commented code

### User Experience
✅ Features responsive (mobile/tablet/desktop)
✅ Intuitive navigation
✅ Clear visualizations
✅ Reports generate successfully

### Analytics
✅ Results make sense
✅ Confidence intervals correct
✅ Multiple methods show consistent effects
✅ Policymakers can act on findings

---

## Timeline Summary

### Balanced Approach (Recommended)
```
Nov 21:       You decide to launch Phase 4
Nov 21-22:    You copy/paste Agent 12 & 13 prompts (15 min)
Nov 22:       Agents 12-13 start work
Nov 24:       Agent 14 joins after agents 12-13 underway
Nov 22-Dec 2: All agents building (4-5 weeks)
Dec 2:        Phase 4 COMPLETE ✅
             All causal inference methods live
             Policymakers can make data-driven decisions
```

---

## Next Steps After Phase 4

### Celebrate Phase 4 Complete ✅
You now have:
- ✅ Research-grade causal inference (3 methods)
- ✅ Dynamic treatment effects over time
- ✅ Interactive scenario predictions
- ✅ Synthetic control individual case studies
- ✅ Platform that shows CAUSATION, not just correlation

### Plan Phase 5 (Custom Report Builder)
After Phase 4 agents finish, I'll create Agent 15 for Phase 5:
- Custom PDF report generation
- Branding/templating
- Scheduled reports
- Email delivery

Timeline: 2-3 weeks (single agent)

---

## Questions Before You Launch?

**Q: "Can I do Conservative instead of Balanced?"**
A: Yes. Slower (8 weeks vs. 4-5), but lower risk. Your choice.

**Q: "Can I do Aggressive instead of Balanced?"**
A: Yes. Same speed (4-5 weeks), all parallel from start. Higher complexity.

**Q: "What if an agent asks for clarification?"**
A: Answer in the chat immediately. Agent will continue.

**Q: "What if build fails?"**
A: Run `npm run build 2>&1 | head -50` to see errors. Share with agent.

**Q: "Can I monitor agents' progress?"**
A: Yes. Check git log daily. Pull latest code. Test locally.

**Q: "Can I give feedback on Agent 12 before Agent 14 starts?"**
A: Yes (with Balanced approach). Agent 14 will benefit from your feedback.

---

## Ready to Launch Phase 4?

You have:
- ✅ 3 comprehensive agent prompts created
- ✅ File structure planned (zero conflicts)
- ✅ Execution models documented (A, B, C)
- ✅ Daily monitoring checklist ready
- ✅ Success criteria clear
- ✅ Everything you need to succeed

### Your Decision Point

**Which execution model will you choose?**

- [ ] **Conservative (Option A):** Sequential, safe, 8 weeks
- [ ] **Balanced (Option B):** Parallel, smart, 4-5 weeks ← RECOMMENDED
- [ ] **Aggressive (Option C):** All parallel, fast, 4-5 weeks

Once you decide:
1. Notify which option you're choosing
2. You'll copy-paste agent prompts (2 or 3 depending on option)
3. I'll be available to help if agents ask questions
4. Phase 4 will execute over next 4-5 weeks

---

**Phase 4 Status:** Ready to Launch ✅
**Decision Needed:** Which execution model (A, B, or C)?
**Estimated Timeline:** 4-5 weeks (Balanced) or 4-5 weeks (Aggressive) or 8 weeks (Conservative)
**Next Action:** Tell me your choice, then copy-paste prompts

---

Let's build research-grade causal inference! 🚀

---
