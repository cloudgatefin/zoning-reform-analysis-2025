# Phase 3: Parallel Agents Execution Guide

**Phase:** 3 (Landing Page & Methodology)
**Duration:** 3 weeks (Weeks 1-3)
**Execution Style:** 3 agents in parallel (no conflicts)
**Timeline:** ~50-55 hours of actual development

---

## Quick Summary

You have **3 independent agents** that can run simultaneously starting immediately:

| Agent | Task | Hours | Weeks | Start |
|-------|------|-------|-------|-------|
| **Agent 9** | Landing Page | 20-30 | 2-3 | Now |
| **Agent 10** | Methodology Pages | 10-15 | 2-3 | Now |
| **Agent 11** | Timeline Component | 6-8 | 2-3 | Now |

**Total elapsed time:** 3 weeks (all running in parallel)
**Total effort:** ~55 hours (divided across 3 agents)
**Cost:** $0 (all development in Claude Code)

---

## Why These Can Run in Parallel

### File Separation (No Conflicts)

**Agent 9 (Landing Page)** Creates:
```
app/page.tsx (NEW landing page)
app/dashboard/page.tsx (OLD dashboard moved)
app/components/landing/ (10 new components)
```

**Agent 10 (Methodology)** Creates:
```
app/about/layout.tsx
app/about/methodology/page.tsx
app/about/data-sources/page.tsx
app/about/limitations/page.tsx
app/about/faq/page.tsx
app/components/about/ (helper components)
```

**Agent 11 (Timeline)** Creates:
```
app/components/visualizations/ReformTimeline.tsx
app/lib/timelineUtils.ts
scripts/28_prepare_timeline_data.py
public/data/reforms_timeline.json
```

**No overlaps** = No conflicts = Can run truly in parallel

---

## How to Execute (Step by Step)

### Prerequisites
1. **Open 3 browser tabs** with Claude Code Web
2. **Clone the repo** in each tab (or share one clone across tabs)
3. **GitHub credentials ready** (for git push)
4. **Have this guide visible** for reference

### Execution Timeline

```
TIME     AGENT 9              AGENT 10             AGENT 11
────────────────────────────────────────────────────────────────
0:00     START                START                START
         Landing Page         Methodology          Timeline

0:15     Design page          Write content        Data prep
         Create components    Plan structure       Create component

1:00     Implementing         Writing FAQ          Building filters
         hero, nav            Data sources page    Timeline viz

2:00     UVP section          Limitations          Stats panel
         Feature showcase     Complete draft       Detail popup

2:30     Styling              Review & links       Testing
         Responsive           Format content       Responsive

3:00     Testing              Deploy               Deploy
         Deploy               ✓ DONE               ✓ DONE

3:15     ✓ DONE
```

**Key Point:** Each agent works independently. Timeline is approximate - actual speed varies.

---

## Agent 9: Landing Page Execution

### What This Agent Does
Builds the public-facing landing page with competitive positioning.

### Copy-Paste Instructions
```
1. Open Claude Code Web in Browser Tab 1
2. Clone/navigate to: c:\Users\bakay\zoning-reform-analysis-2025\
3. Open file: AGENT_9_LANDING_PAGE_PROMPT.md
4. Select ALL (Ctrl+A)
5. Copy (Ctrl+C)
6. Go to Claude Code Web chat
7. Paste (Ctrl+V)
8. Press Enter
9. Follow agent's step-by-step instructions
10. Agent will build landing page, test, and commit
```

### Expected Output
- `app/page.tsx` - New landing page
- `app/dashboard/` - Old dashboard moved
- `app/components/landing/` - 10 new components
- Git commit with all changes
- Landing page deployed and working

### Success Indicators
- Landing page loads at `/`
- All 10 sections render correctly
- Responsive on mobile/tablet/desktop
- No TypeScript errors
- CTAs route correctly
- Agent commits to git

### Questions Agent Might Ask
- "Should dashboard move to `/dashboard` or `/explore`?"
- "Use real testimonials or representative ones?"
- "Got any logo/branding assets?"
- Answer these briefly, agent continues.

---

## Agent 10: Methodology Execution

### What This Agent Does
Builds 4 comprehensive methodology pages with transparent documentation.

### Copy-Paste Instructions
```
1. Open Claude Code Web in Browser Tab 2
2. Same repository
3. Open file: AGENT_10_METHODOLOGY_PROMPT.md
4. Select ALL, Copy
5. Paste into Claude Code chat
6. Press Enter
7. Follow instructions (write content, build pages, deploy)
8. Agent will create all 4 pages and commit
```

### Expected Output
- `/about/methodology` - Technical methods explanation
- `/about/data-sources` - Complete source citations
- `/about/limitations` - Honest caveats
- `/about/faq` - 20-22 common questions answered
- Git commit with all changes

### Success Indicators
- All 4 pages accessible at `/about/*`
- Sidebar navigation works
- FAQ accordion functional
- Links between pages work
- Mobile responsive
- No orphaned content
- Agent commits to git

### Questions Agent Might Ask
- "How detailed should technical sections be?" → Answer: Accessible to planning staff, not just PhDs
- "Add video explanations?" → Answer: No, keep it text/diagrams only for now
- "How many FAQs?" → Answer: 20-22 per spec

---

## Agent 11: Timeline Execution

### What This Agent Does
Builds interactive reform adoption timeline showing when/where reforms are spreading.

### Copy-Paste Instructions
```
1. Open Claude Code Web in Browser Tab 3
2. Same repository
3. Open file: AGENT_11_TIMELINE_PROMPT.md
4. Select ALL, Copy
5. Paste into Claude Code chat
6. Press Enter
7. Follow instructions (data prep, component build, testing)
8. Agent will create component and commit
```

### Expected Output
- `app/components/visualizations/ReformTimeline.tsx`
- `app/lib/timelineUtils.ts`
- `scripts/28_prepare_timeline_data.py` (data preparation)
- `public/data/reforms_timeline.json` (processed reform data)
- Git commit with all changes
- Timeline accessible and interactive

### Success Indicators
- Timeline component loads
- All 502 reforms displayed
- Filters work (type, region, date)
- Statistics update when filtering
- Reform detail popup functional
- Animated bar chart displays correctly
- Mobile responsive
- Agent commits to git

### Questions Agent Might Ask
- "Horizontal or vertical timeline?" → Answer: Horizontal with Recharts (simpler)
- "Include animation?" → Answer: Yes if time, but not required for MVP
- "Add map view?" → Answer: No, just timeline for now. Map is separate feature.

---

## Daily Check-In Schedule

### End of Day 1 (After ~4 hours)
**Agent 9 Status:** Should have page structure, components started
**Agent 10 Status:** Should have outline written, starting page build
**Agent 11 Status:** Should have data prepared, component started

**Check:** Pull latest code from all agents
```bash
git pull origin main
```
No conflicts should occur.

### End of Day 2 (After ~8 hours total)
**Agent 9 Status:** Components largely complete, styling underway
**Agent 10 Status:** 3-4 pages written, starting formatting
**Agent 11 Status:** Core component built, filtering working

**Check:**
```bash
npm run build  # Should succeed with no errors
git log --oneline -5  # Should see commits from all agents
```

### End of Day 3 (After ~12 hours total)
**Agent 9 Status:** Testing, responsive design verified
**Agent 10 Status:** All content complete, formatting done
**Agent 11 Status:** Testing, animations added (if time)

**Check:**
```bash
npm run build  # Final build check
git status    # Should be clean
```

### End of Week 3 (Phase 3 Complete)
**All Agents:** Complete and deployed

**Final Check:**
```bash
# Verify all agents' work is integrated
npm run build
npm run dev
# Test at localhost:3000
```

**Manual Testing:**
- [ ] Landing page loads at `/`
- [ ] Navigation links work
- [ ] Methodology pages accessible
- [ ] Timeline component interactive
- [ ] All responsive on mobile
- [ ] No console errors

---

## Handling Conflicts (Unlikely But Possible)

### If Git Conflicts Occur
```bash
# Pull latest from all agents
git pull origin main

# If conflicts (e.g., package.json), resolve:
# 1. Open conflicted file
# 2. Keep both versions if possible (e.g., dependencies)
# 3. Run: npm install
# 4. Commit resolved files
git add .
git commit -m "Resolve merge conflicts from parallel agent work"
git push origin main
```

### If Package.json Has Conflicts
All agents should use existing dependencies. If Agent 10 or 11 add packages:
```
If needed dependencies:
- lucide-react (for icons)
- recharts (for timeline)
- react-hook-form (optional for forms)

Should already be installed, but if not:
npm install [package-name]
```

### If a Build Fails
```bash
# Check TypeScript errors
npm run build 2>&1 | head -50

# Common issues:
# - Import paths incorrect (should be relative)
# - Missing component exports
# - Type mismatches

# Fix in agent's work, commit, push
git add .
git commit -m "Fix TypeScript errors from Agent X"
git push origin main
```

---

## Success Metrics (End of Phase 3)

### Agent 9 (Landing Page)
- ✅ Page deployed at `/`
- ✅ All 10 sections working
- ✅ Responsive design verified
- ✅ CTAs functional
- ✅ No TypeScript errors
- ✅ Build succeeds
- ✅ Committed to git

### Agent 10 (Methodology)
- ✅ 4 pages at `/about/*`
- ✅ Navigation functional
- ✅ FAQ searchable/expandable
- ✅ All links work
- ✅ Mobile responsive
- ✅ Comprehensive documentation
- ✅ Committed to git

### Agent 11 (Timeline)
- ✅ Component interactive
- ✅ All 502 reforms displayed
- ✅ Filters functional
- ✅ Statistics accurate
- ✅ Mobile responsive
- ✅ No console errors
- ✅ Committed to git

### Overall Phase 3
- ✅ All 3 agents complete
- ✅ No merge conflicts
- ✅ Build passes
- ✅ All pages load correctly
- ✅ Team can view public landing page
- ✅ Ready for Phase 4 (Causal Inference)

---

## Next Steps After Phase 3

### Week 3 Wrap-Up
1. All agents commit final code
2. Final build test
3. Manual testing of all features
4. Get feedback from early users/policymakers

### Phase 4 Preparation
Once Phase 3 agents are done:
1. Create 3 new Phase 4 agents:
   - Agent 12: Causal Inference (DiD)
   - Agent 13: Scenario Modeling
   - Agent 14: Additional Causal Methods (SCM, Event Study)
2. These will run Weeks 4-8

### Preparation for Phase 4
- Phase 3 landing page will drive traffic to platform
- Methodology pages give credibility
- Phase 4 agents will add advanced features
- Timeline demonstrates reform momentum

---

## Troubleshooting

### "Agent says 'file not found'"
→ Make sure both tabs are in same repository directory

### "Git push fails"
→ Make sure git credentials are configured
→ Run: `git config user.name` and `git config user.email`

### "npm install hangs"
→ Kill with Ctrl+C, try again
→ Clear cache: `npm cache clean --force`
→ Then: `npm install`

### "Build has TypeScript errors"
→ Agent should fix, but if persistent:
→ Run `npm run build 2>&1 | head -100` to see errors
→ Share with agent for fixing

### "One agent is slow"
→ Can continue with other agents
→ Slow agent can catch up later
→ No blocking dependencies

---

## Time Estimates (May Vary)

**Best Case (Experienced Dev):**
- Agent 9: 15 hours
- Agent 10: 8 hours
- Agent 11: 5 hours
- Total: 28 hours (less than 1 week)

**Typical Case:**
- Agent 9: 20-25 hours
- Agent 10: 10-12 hours
- Agent 11: 6-8 hours
- Total: 40-45 hours (1-2 weeks)

**Worst Case (Many Iterations):**
- Agent 9: 30 hours
- Agent 10: 15 hours
- Agent 11: 8 hours
- Total: 55 hours (2-3 weeks)

**Plan for typical case: 2-3 weeks of Part-time work**

---

## Important Notes

### Agent Independence
- Agents don't talk to each other
- They can't see each other's progress
- But they work on different files (no conflicts)
- This is intentional - allows true parallelization

### Git Commits
- Each agent will commit when done with major sections
- You'll see multiple commits in git log
- All commits go to `main` branch
- Monitor commits to track progress

### Build Verification
- After each agent completes, run: `npm run build`
- Should succeed with no errors
- If errors, share with agent for fixing

### Feedback Loop
- If you notice issues, tell agent directly
- Agents can iterate within same session
- Or create new agent to fix issues

---

## How to Monitor Progress

### Check Git Log
```bash
git log --oneline -20
# Should see commits like:
# - "Agent 9: Build landing page sections"
# - "Agent 10: Add methodology pages"
# - "Agent 11: Implement timeline component"
```

### Check Build Status
```bash
npm run build
# Should show: "Compiled successfully"
# or if errors, what they are
```

### Visual Inspection
```bash
npm run dev
# Visit http://localhost:3000
# Check landing page, methodology pages, timeline
# Test on mobile (DevTools)
```

### Git Status
```bash
git status
# Should show: "nothing to commit, working tree clean"
# (after agents commit their work)
```

---

## Checklist Before Starting

- [ ] 3 Claude Code Web browser tabs open
- [ ] Repository cloned in working directory
- [ ] GitHub credentials configured (git config)
- [ ] Have AGENT_9, AGENT_10, AGENT_11 prompts open
- [ ] Have this guide visible for reference
- [ ] npm installed (`npm --version` shows version)
- [ ] Ready to copy/paste prompts

---

## Start Execution

### To Begin Phase 3 Now:

**1. Open Tab 1** → Copy AGENT_9_LANDING_PAGE_PROMPT.md → Paste → Start
**2. Open Tab 2** → Copy AGENT_10_METHODOLOGY_PROMPT.md → Paste → Start
**3. Open Tab 3** → Copy AGENT_11_TIMELINE_PROMPT.md → Paste → Start

All three agents begin simultaneously. Estimated completion: 2-3 weeks.

---

**Phase 3 Start:** Today
**Phase 3 Duration:** 2-3 weeks (parallel)
**Phase 3 Success:** Landing page + Methodology + Timeline deployed
**Phase 4 Start:** After Phase 3 complete
**Phase 4 Duration:** 4-5 weeks (parallel causal inference + scenarios)

Let's build! 🚀

