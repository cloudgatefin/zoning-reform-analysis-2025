# Immediate Action Checklist - Integration Session

**Date:** 2025-11-18
**Time:** Now (Session 2 - Integration Start)
**Priority:** CRITICAL - Send Agent 1 corrected prompt

---

## YOUR CHECKLIST (Do These Now)

### ☐ STEP 1: Understand the Issue (5 minutes)
- [ ] Read: [AGENT_1_FOLLOWUP.md](AGENT_1_FOLLOWUP.md)
  - Explains why Agent 1 needs correction
  - Shows Census API works
  - Why manual downloads break automation

**Key Takeaway:** Agent 1 said "manual download required" but Census API supports place-level queries → no manual needed

---

### ☐ STEP 2: Review Technical Solution (5 minutes)
- [ ] Read: [CENSUS_API_REFERENCE.md](CENSUS_API_REFERENCE.md)
  - Confirms Census API endpoint works
  - Provides sample Python code
  - Shows state FIPS codes and error handling

**Key Takeaway:** API endpoint `https://api.census.gov/data/{year}/bps/place` supports place-level queries for all states, 2015-2024

---

### ☐ STEP 3: Copy Corrected Prompt (2 minutes)
- [ ] Open: [AGENT_1_PROMPT_CORRECTED.md](AGENT_1_PROMPT_CORRECTED.md)
- [ ] Select all text (Ctrl+A)
- [ ] Copy (Ctrl+C)

**Keep this in clipboard for next step**

---

### ☐ STEP 4: Send to Agent 1 (3 minutes)
- [ ] Go to Claude Code web where Agent 1 is running
- [ ] Send message to Agent 1 with this format:

```
Your initial response required manual Census downloads, which breaks
automation and reproducibility. I've identified the working Census API
approach for place-level data that's fully automated.

Please discard the previous approach and complete the task using the
corrected prompt below. This uses Census Bureau BPS API endpoints to
fetch all place-level permit data programmatically (no manual downloads),
identifies 20-30 reform cities, and calculates pre/post metrics.

This is critical path for improving our ML model from 6 to 26-36 training
samples, expected to improve R² from -10.98 to 0.3-0.6.

Here is the corrected prompt:

[PASTE THE ENTIRE CONTENT FROM AGENT_1_PROMPT_CORRECTED.md HERE]
```

---

### ☐ STEP 5: Set Timer for Follow-up (1 minute)
- [ ] Agent 1 runtime: 2-4 hours expected
- [ ] Set reminder to check output in 3 hours
- [ ] Files to look for:
  - `scripts/11_fetch_city_permits_api.py`
  - `scripts/12_compute_city_metrics.py`
  - `data/raw/census_bps_place_all_years.csv`
  - `data/raw/city_reforms.csv`
  - `data/outputs/city_reforms_with_metrics.csv`

---

## AFTER AGENT 1 COMPLETES (In ~3-4 hours)

### ☐ Check for Output Files
```bash
# Run this command to see if Agent 1 completed
ls -lh data/raw/city*.csv data/outputs/city*.csv scripts/1[12]*.py 2>/dev/null
```

If files appear, proceed to Step 6.

---

### ☐ STEP 6: Run Validation (5 minutes)
```bash
cd scripts
python validate_data_quality.py
```

Expected result: 6/6 checks pass (added city validation)

---

### ☐ STEP 7: Integration (1-2 hours)
Once Agent 1 data validated:
1. Merge city data with state data
2. Retrain ML model
3. Expected: R² improves to 0.3-0.6
4. Update dashboard for city display

---

## REFERENCE DOCUMENTS

**For Understanding:**
- [AGENT_1_FOLLOWUP.md](AGENT_1_FOLLOWUP.md) - Detailed explanation of problem & solution
- [CENSUS_API_REFERENCE.md](CENSUS_API_REFERENCE.md) - Technical API details with code examples

**For Agent 1:**
- [AGENT_1_PROMPT_CORRECTED.md](AGENT_1_PROMPT_CORRECTED.md) - **COPY/PASTE THIS TO AGENT 1**

**For Status:**
- [AGENT_COORDINATION_STATUS.md](AGENT_COORDINATION_STATUS.md) - Status of all 8 agents
- [INTEGRATION_SESSION_SUMMARY.md](INTEGRATION_SESSION_SUMMARY.md) - What happened in this session

**For Context:**
- [AGENT_OUTPUT_INVENTORY.md](AGENT_OUTPUT_INVENTORY.md) - Current state (Day 1)
- [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md) - 21-day roadmap
- [DAY_1_COMPLETE.md](DAY_1_COMPLETE.md) - Day 1 summary

---

## SUCCESS CRITERIA

Agent 1 successful if output has:
✅ All place-level Census data fetched via API (no manual downloads)
✅ 20-30 cities documented with reform dates
✅ Pre/post metrics calculated for each city
✅ City data validates >95% match to state-level totals
✅ Scripts are reusable and well-documented
✅ All files in correct locations (data/raw/, data/outputs/, scripts/)

---

## Key Timeline

| Time | Action | Duration |
|------|--------|----------|
| Now | Send corrected prompt to Agent 1 | 10 min |
| +3h | Check for Agent 1 output | 5 min |
| +3.5h | Run validation on city data | 5 min |
| +4h | Begin integration (merge data) | 30 min |
| +4.5h | Retrain ML model | 30 min |
| +5h | Update dashboard | 1 hour |
| +6h | Phase 1 Day 2 complete | - |

---

## Current Status

**Dashboard:** ✅ Running at http://localhost:3000
**Data Pipeline:** ✅ All scripts working
**Model:** ⚠️ Needs city data (R²=-10.98)
**Agents:** 8 running in parallel, Agent 1 needs correction

---

## What You're Accomplishing

By sending this corrected prompt, you're:
1. **Fixing Agent 1 approach** - Automated Census API instead of manual download
2. **Ensuring reproducibility** - Scripts can re-run anytime with new data
3. **Improving ML model** - 6→26-36 training samples
4. **Accelerating timeline** - No manual data entry delays
5. **Following best practices** - Fully automated data pipeline

---

## Common Questions

**Q: Why can't we just manually download the data?**
A: Manual downloads break reproducibility. If data changes or someone re-runs the project, they'd have to manually download again. The API approach means the entire pipeline is automated and repeatable.

**Q: How long does Agent 1 take?**
A: 2-4 hours. Mostly API calls looping through 50 states × 10 years (500 API calls). Rate limiting adds delay but ensures stability.

**Q: What if Census API is down?**
A: We have fallbacks documented in INTEGRATION_PLAN.md. But Census API is very reliable (government infrastructure).

**Q: Do I need a Census API key?**
A: Yes, but it's free. Get at: https://api.census.gov/data/key_signup.html

**Q: What if Agent 1 still refuses?**
A: Escalate with technical details from CENSUS_API_REFERENCE.md showing it works.

---

## MAIN ACTION RIGHT NOW

**Copy [AGENT_1_PROMPT_CORRECTED.md](AGENT_1_PROMPT_CORRECTED.md) → Send to Agent 1 in Claude Code web**

That's it. Everything else flows from that.

---

**Time Estimate:** 10 minutes to send, 2-4 hours for Agent 1, then 1-2 hours for integration
**Blocking:** Nothing - start now
**Priority:** CRITICAL
**Next Review:** In 3-4 hours when checking for Agent 1 output

Go send that prompt! 🚀
