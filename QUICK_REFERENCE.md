# Quick Reference Card - Integration Session

**Print or bookmark this page**

---

## WHAT TO DO RIGHT NOW

### Step 1: Get the Corrected Prompt
**File:** [AGENT_1_PROMPT_CORRECTED.md](AGENT_1_PROMPT_CORRECTED.md)

### Step 2: Copy It
Select all text, copy to clipboard

### Step 3: Send to Agent 1
Paste into Claude Code web where Agent 1 is running

**Message:**
```
Your initial approach required manual downloads.
I've identified Census API works for place-level data (fully automated).

Please use this corrected prompt instead:
[PASTE CORRECTED PROMPT]
```

### Step 4: Wait 2-4 Hours
Agent 1 fetches place-level Census data

### Step 5: Check for Files
```bash
ls data/raw/city*.csv data/outputs/city*.csv scripts/1[12]*.py 2>/dev/null
```

---

## THE ISSUE (Why This Matters)

| Before | After |
|--------|-------|
| ❌ Manual download | ✅ Census API (automated) |
| ❌ Not reproducible | ✅ Reproducible |
| ❌ Breaks automation | ✅ Full automation |
| ⚠️ ML R²=-10.98 | ✅ ML R²=0.3-0.6 |

---

## DOCUMENTS YOU NEED

### MUST SEND TO AGENT 1:
📄 [AGENT_1_PROMPT_CORRECTED.md](AGENT_1_PROMPT_CORRECTED.md) ← **COPY/PASTE THIS**

### SHOULD READ:
📄 [IMMEDIATE_ACTION_CHECKLIST.md](IMMEDIATE_ACTION_CHECKLIST.md)
📄 [AGENT_1_FOLLOWUP.md](AGENT_1_FOLLOWUP.md)

### TECHNICAL REFERENCE:
📄 [CENSUS_API_REFERENCE.md](CENSUS_API_REFERENCE.md)

### PROJECT STATUS:
📄 [SESSION_2_EXECUTIVE_SUMMARY.md](SESSION_2_EXECUTIVE_SUMMARY.md)

---

## KEY FACTS

**Census API Endpoint:**
```
https://api.census.gov/data/{year}/bps/place
```

**Available Years:** 2015-2024 ✅

**Geography:** All US cities/places ✅

**Data:** Building permits by SF/MF ✅

**Method:** Fully programmatic (no downloads) ✅

**Expected Output:** 20-30 cities with pre/post metrics

**Expected ML Improvement:** 6→26-36 samples, R²: -10.98→0.3-0.6

---

## TIMELINE

| Time | Action | Duration |
|------|--------|----------|
| Now | Send prompt | 10 min |
| +3h | Check output | 5 min |
| +3.5h | Validate | 5 min |
| +4h | Integrate | 30 min |
| +4.5h | Retrain model | 30 min |
| +5h | Update dashboard | 1h |

**Total:** ~6 hours to Phase 1 Day 2 complete

---

## SUCCESS INDICATORS

✅ All place-level data fetched via Census API
✅ 20-30 cities with reform dates documented
✅ Pre/post metrics calculated for each city
✅ City data validates >95% match to state totals
✅ Scripts are reusable and working
✅ ML model R² improves to >0.3

---

## WHAT HAPPENS IF...

**Agent 1 takes longer?**
→ Proceed with Agent 3 (Economic Features) in parallel

**Census API fails?**
→ Use municipal APIs or Zillow data as fallback

**Partial data available?**
→ Use 10-15 cities instead of 20-30 (still improves R²)

**Tests fail?**
→ Use validation script: `scripts/validate_data_quality.py`

---

## COMMANDS YOU'LL NEED

**Check for Agent 1 output:**
```bash
ls data/raw/city*.csv data/outputs/city*.csv scripts/1[12]*.py 2>/dev/null
```

**Validate data:**
```bash
cd scripts && python validate_data_quality.py
```

**Check dashboard:**
```
Open http://localhost:3000
```

**Check git status:**
```bash
git status
```

---

## PROJECT STATS

**Current State:**
- 53 states ✅
- 6 reform states ✅
- 41 counties ✅
- ML model R²=-10.98 ⚠️

**After Agent 1:**
- 53 states + 20-30 cities = 26-36 total
- ML model R²=0.3-0.6 ✅
- Data fully automated ✅

**Final Goal:**
- 50+ jurisdictions
- 3 causal methods
- R² > 0.5
- Production ready

---

## CONTACT REFERENCE

**Agent 1:** Awaiting corrected prompt response
**Agents 2-8:** Running in parallel, outputs pending
**Dashboard:** http://localhost:3000 (currently running)
**Data:** `/data/raw/` and `/data/outputs/`
**Scripts:** `/scripts/`

---

## REMEMBER

The corrected Census API approach will:
1. ✅ Eliminate manual data downloads
2. ✅ Make pipeline fully reproducible
3. ✅ Unblock Phase 1 integration
4. ✅ Improve ML model significantly
5. ✅ Let Agent 1 complete 20-30 cities automatically

**All you need to do:** Send the corrected prompt to Agent 1

**File to send:** [AGENT_1_PROMPT_CORRECTED.md](AGENT_1_PROMPT_CORRECTED.md)

**Time needed:** 10 minutes

**Result:** 2-4 hours of automated data collection

---

**Status:** Ready to proceed ✅
**Blocking:** Only Agent 1 correction needed
**Priority:** CRITICAL
**Next Action:** Send prompt now
