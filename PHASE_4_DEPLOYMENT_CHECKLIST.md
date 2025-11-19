# Phase 4: Production Deployment Checklist

**Target Status:** Production-Ready Dashboard
**Estimated Time:** 4-6 hours
**Scope:** Real data integration, performance optimization, deployment preparation

---

## Phase 4 Tasks & Checklist

### Task 1: Real Data Integration (2-3 hours)

#### 1.1 Zillow API Integration
- [ ] Obtain Zillow API key (if required for API)
- [ ] Review Zillow data licensing terms
- [ ] Update `scripts/13_fetch_zillow_data.py` to use real Zillow API
- [ ] Implement retry logic and rate limiting
- [ ] Add error handling for missing/invalid data
- [ ] Test with sample cities (5-10)
- [ ] Validate output matches expected schema
- [ ] Document API authentication in README
- [ ] Setup scheduled execution (daily/weekly)

**Current Status:** Using synthetic data from Phase 2
**File:** `scripts/13_fetch_zillow_data.py`
**Target Output:** `data/outputs/zillow_hvi_by_jurisdiction.csv` (updated with real data)

#### 1.2 Census API Integration
- [ ] Register for Census API key: https://api.census.gov/data/key_signup.html
- [ ] Verify API key works (test endpoint)
- [ ] Update `scripts/11_fetch_city_permits_api.py` with key
- [ ] Update `scripts/14_fetch_census_acs.py` to use real Census API
- [ ] Test ACS data fetching (2-3 years)
- [ ] Validate data against official Census figures
- [ ] Implement error handling for API failures
- [ ] Add retry logic with exponential backoff
- [ ] Test with all 36 jurisdictions
- [ ] Document rate limiting (120 calls/minute)

**Current Status:** Scripts exist but using synthetic data
**Files:**
- `scripts/11_fetch_city_permits_api.py` (place-level permits)
- `scripts/14_fetch_census_acs.py` (demographics)
**Target Output:**
- `data/raw/census_bps_place_all_years.csv` (real permit data)
- `data/outputs/census_acs_demographics.csv` (real demographics)

#### 1.3 BLS API Integration
- [ ] Obtain BLS API key (if required)
- [ ] Review BLS data series IDs
- [ ] Update `scripts/15_fetch_bls_data.py` to use real BLS API
- [ ] Map jurisdiction FIPS codes to BLS series IDs
- [ ] Implement error handling for missing data
- [ ] Test with 5-10 jurisdictions
- [ ] Validate unemployment rates against published figures
- [ ] Implement caching to avoid API limits

**Current Status:** Synthetic data with realistic ranges
**File:** `scripts/15_fetch_bls_data.py`
**Target Output:** `data/outputs/bls_unemployment_data.csv` (real unemployment data)

#### 1.4 Feature Compilation
- [ ] Update `scripts/16_compile_features.py` to handle real data
- [ ] Test feature merge with real datasets
- [ ] Validate no data loss in merge
- [ ] Check for missing values (implement imputation if needed)
- [ ] Verify feature scaling/normalization
- [ ] Generate updated `unified_economic_features.csv`
- [ ] Document data lineage (sources → features)
- [ ] Create data quality report

**Target Output:** `data/outputs/unified_economic_features.csv` (with real data)

#### 1.5 ML Model Retraining
- [ ] Retrain Model V4 with real economic data
- [ ] Compare performance: V3 (synthetic) vs V4 (real)
- [ ] Evaluate if R² improves with real data
- [ ] Generate feature importance with real data
- [ ] Run cross-validation
- [ ] Create comparison report
- [ ] Deploy new model if performance improves

**Target:** `data/outputs/reform_impact_model_v4_real_data.pkl`

#### 1.6 Data Pipeline Scheduling
- [ ] Setup automated data refresh (daily/weekly)
- [ ] Configure cron jobs or task scheduler
- [ ] Create logging for pipeline runs
- [ ] Setup alerts for API failures
- [ ] Document backup procedures
- [ ] Create disaster recovery plan

---

### Task 2: Performance Optimization (1-2 hours)

#### 2.1 API Response Caching
- [ ] Implement Redis or in-memory cache for API routes
- [ ] Set cache TTL: 1 hour for economic context, 24 hours for causal analysis
- [ ] Add cache invalidation on data updates
- [ ] Monitor cache hit rates
- [ ] Benchmark: response time before/after caching

**Target Files:**
- `app/app/api/economic-context/[fips]/route.ts`
- `app/app/api/causal-analysis/[fips]/route.ts`
- `app/app/api/predictions/route.ts`

#### 2.2 Component Optimization
- [ ] Implement React.memo for EconomicContextPanel
- [ ] Implement React.memo for CausalMethodsComparison
- [ ] Use useMemo for expensive computations
- [ ] Optimize CSV parsing (consider streaming for large files)
- [ ] Lazy load city detail sections
- [ ] Profile component render times

**Target:** <200ms render time for all components

#### 2.3 Bundle Size Optimization
- [ ] Analyze bundle size: `npm run build -- --analyze`
- [ ] Identify large dependencies
- [ ] Consider code splitting for visualization components
- [ ] Tree-shake unused code
- [ ] Compress images and assets
- [ ] Target: <100KB for critical path JS

#### 2.4 Database/Data Loading
- [ ] Consider moving CSV data to SQLite or PostgreSQL
- [ ] Implement indexes on FIPS codes
- [ ] Profile query performance
- [ ] Benchmark: CSV parsing vs database queries
- [ ] If needed, migrate to proper database

---

### Task 3: Testing & Quality Assurance (1-2 hours)

#### 3.1 Unit Tests
- [ ] Write tests for API route handlers (GET /api/economic-context/*)
- [ ] Write tests for API route handlers (GET /api/causal-analysis/*)
- [ ] Write tests for CSV parsing logic
- [ ] Write tests for data formatting/interpretation
- [ ] Achieve >80% code coverage

**Target:** `/app/tests/api/` and `/app/tests/components/`

#### 3.2 Integration Tests
- [ ] Test full data flow: CSV → API → Component
- [ ] Test with real (or realistic) datasets
- [ ] Test error scenarios (missing data, malformed CSV)
- [ ] Test all 36 jurisdictions
- [ ] Performance tests (load, concurrent requests)

**Tool:** Jest or Vitest

#### 3.3 Responsive Design Testing
- [ ] iPhone 12/13/14 (375px width)
- [ ] iPad (768px width)
- [ ] Desktop (1024px+ width)
- [ ] Verify all components render correctly
- [ ] Test touch interactions on mobile
- [ ] Test with browser dev tools (Chrome, Firefox)

**Devices/Tools:**
- Chrome DevTools
- Firefox DevTools
- BrowserStack or similar (real device testing)

#### 3.4 Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

#### 3.5 Data Validation Testing
- [ ] Verify all 36 jurisdictions return data
- [ ] Verify no data loss in transformations
- [ ] Check FIPS code formatting (7 digits, padded)
- [ ] Validate numeric ranges (HVI, income, unemployment)
- [ ] Verify causal analysis results match source files

#### 3.6 Performance Testing
- [ ] Measure API response time for each endpoint
- [ ] Measure component render time
- [ ] Measure page load time with all components
- [ ] Test with slow network (throttle to 3G)
- [ ] Test with large datasets (if applicable)

**Target Metrics:**
- API response: <200ms
- Component render: <500ms
- Page load (with all components): <2s

#### 3.7 Security Testing
- [ ] Verify no XSS vulnerabilities (user input sanitization)
- [ ] Verify no SQL injection (if using database)
- [ ] Check for exposed API keys (environment variables)
- [ ] Validate CORS configuration
- [ ] Implement rate limiting if needed
- [ ] Run security scanner (npm audit, Snyk)

---

### Task 4: Documentation & Knowledge Transfer (1-2 hours)

#### 4.1 User Guide
- [ ] Create user guide for dashboard
- [ ] Document how to click cities for details
- [ ] Explain each data card and metric
- [ ] Explain DiD vs SCM methods
- [ ] Document color coding and indicators
- [ ] Include screenshots/GIFs
- [ ] Add troubleshooting section

**Output:** `docs/USER_GUIDE.md`

#### 4.2 Developer Documentation
- [ ] Document API endpoints (swagger/OpenAPI)
- [ ] Document component props and interfaces
- [ ] Document data pipeline and ETL process
- [ ] Document database schema (if applicable)
- [ ] Provide setup instructions for new developers
- [ ] Document deployment procedures

**Output:**
- `docs/API_DOCUMENTATION.md`
- `docs/DEVELOPER_GUIDE.md`
- `docs/DATA_PIPELINE.md`

#### 4.3 Data Dictionary
- [ ] Document all CSV columns
- [ ] Document all economic indicators
- [ ] Document causal analysis statistics
- [ ] Document data sources
- [ ] Document data collection dates
- [ ] Document known limitations

**Output:** `docs/DATA_DICTIONARY.md`

#### 4.4 Methodology Documentation
- [ ] Document statistical methods
- [ ] Explain DiD identification assumptions
- [ ] Explain SCM matching approach
- [ ] Document feature engineering
- [ ] Document model selection rationale
- [ ] Provide references to research

**Output:** `docs/METHODOLOGY.md`

#### 4.5 Deployment Documentation
- [ ] Document server requirements
- [ ] Document environment setup
- [ ] Document data loading procedures
- [ ] Document monitoring setup
- [ ] Document backup procedures
- [ ] Document scaling considerations

**Output:** `docs/DEPLOYMENT.md`

---

### Task 5: Deployment Preparation (1-2 hours)

#### 5.1 Environment Configuration
- [ ] Create `.env.production` template
- [ ] Document all required environment variables
- [ ] Setup API key rotation policy
- [ ] Configure rate limiting (if needed)
- [ ] Setup CORS for allowed domains
- [ ] Configure error logging/monitoring

**Variables to document:**
- Census API key
- Zillow API credentials (if applicable)
- BLS API credentials (if applicable)
- Database credentials (if applicable)
- Analytics tracking ID
- Error tracking (Sentry) credentials

#### 5.2 Monitoring & Logging
- [ ] Setup error tracking (Sentry or similar)
- [ ] Setup performance monitoring (Vercel Analytics or similar)
- [ ] Setup uptime monitoring
- [ ] Configure log aggregation (CloudWatch, DataDog)
- [ ] Setup alerts for critical errors
- [ ] Create dashboard for system health

**Services:** Sentry, New Relic, or open-source alternatives

#### 5.3 Deployment Platform Setup
- [ ] Choose hosting platform (Vercel, Netlify, AWS, GCP, etc.)
- [ ] Setup staging environment
- [ ] Setup production environment
- [ ] Configure domain/DNS
- [ ] Setup SSL/TLS certificates
- [ ] Configure CDN if applicable

**Recommendation:** Vercel for seamless Next.js deployment

#### 5.4 CI/CD Pipeline
- [ ] Setup GitHub Actions workflow
- [ ] Automate tests on pull requests
- [ ] Automate builds
- [ ] Automate deployments to staging
- [ ] Manual approval for production deployments
- [ ] Document deployment procedures

**Workflow Steps:**
1. PR created → Tests run
2. Tests pass → Build created
3. Build successful → Deploy to staging
4. Manual approval → Deploy to production

#### 5.5 Database Backup & Recovery
- [ ] Setup automated backups (if using database)
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Setup off-site backup storage
- [ ] Create disaster recovery runbook

#### 5.6 Version Management
- [ ] Tag release versions (v1.0.0)
- [ ] Document changelog
- [ ] Create release notes
- [ ] Plan rollback procedures
- [ ] Document version compatibility

---

### Task 6: Post-Deployment Validation (1 hour)

#### 6.1 Smoke Testing
- [ ] Dashboard loads in production
- [ ] All pages render correctly
- [ ] API endpoints respond
- [ ] Economic context data loads for all cities
- [ ] Causal analysis data loads for all cities
- [ ] No console errors
- [ ] No 404/500 errors in monitoring

#### 6.2 Data Validation
- [ ] Real data is being used (not synthetic)
- [ ] Data is up-to-date
- [ ] All 36 jurisdictions have data
- [ ] Causal analysis results are visible
- [ ] Predictions are from v4 model (if upgraded)

#### 6.3 Performance Verification
- [ ] API response time <200ms
- [ ] Page load time <2s
- [ ] No memory leaks
- [ ] Monitoring shows green status
- [ ] No errors in error tracking

#### 6.4 User Acceptance Testing
- [ ] Demonstrate to stakeholders
- [ ] Get feedback on usability
- [ ] Document any issues found
- [ ] Create tickets for improvements
- [ ] Schedule follow-up meetings

---

## Risk Mitigation

### High-Risk Items
1. **API Data Access:** APIs may have rate limits, downtime, or require authentication
   - Mitigation: Implement caching, retry logic, fallback to cached data
2. **Data Quality:** Real data may have gaps, errors, or formatting issues
   - Mitigation: Implement data validation, quality checks, manual review
3. **Model Performance:** ML model may degrade with real data
   - Mitigation: Continuous monitoring, A/B testing, fallback predictions
4. **Breaking Changes:** Updates to dependencies may break functionality
   - Mitigation: Lock dependency versions, thorough testing, staging environment

### Medium-Risk Items
1. **Performance:** Real data may be larger, causing slowdowns
   - Mitigation: Database optimization, caching, code optimization
2. **Security:** API keys may be exposed or data breaches
   - Mitigation: Environment variables, secrets management, security audits
3. **Scalability:** Dashboard may not handle growth
   - Mitigation: Load testing, CDN, database indexing

---

## Success Criteria

### Functional Requirements
- [  ] Dashboard displays city-level economic data for all 36 jurisdictions
- [  ] Causal analysis results visible for DiD and SCM methods
- [  ] All API endpoints functional and returning correct data
- [  ] City selection workflow works end-to-end
- [  ] ML predictions updated with latest model

### Performance Requirements
- [  ] API response time <200ms
- [  ] Page load time <2 seconds
- [  ] Component render time <500ms
- [  ] Bundle size <100KB (critical path)
- [  ] No memory leaks over 30-minute session

### Quality Requirements
- [  ] Test coverage >80%
- [  ] All cross-browser tests pass
- [  ] All responsive design tests pass
- [  ] No critical security vulnerabilities
- [  ] Documentation complete and accurate

### Operational Requirements
- [  ] Automated data refresh working
- [  ] Monitoring and alerting configured
- [  ] Backup procedures tested
- [  ] Disaster recovery plan documented
- [  ] Team trained on operations

---

## Timeline Estimate

| Task | Duration | Parallel? |
|------|----------|-----------|
| Real Data Integration | 2-3 hours | Yes (APIs can run in parallel) |
| Performance Optimization | 1-2 hours | After data integration |
| Testing & QA | 1-2 hours | Parallel with optimization |
| Documentation | 1-2 hours | Parallel with testing |
| Deployment Preparation | 1-2 hours | Parallel with testing |
| Post-Deployment Validation | 1 hour | After deployment |
| **Total** | **4-6 hours** | Estimated 2-3 hours critical path |

### Recommended Timeline
- **Day 1 (2-3 hours):** Real data integration + performance optimization
- **Day 1 (1 hour):** Testing & QA
- **Day 2 (1-2 hours):** Documentation
- **Day 2 (1-2 hours):** Deployment preparation
- **Day 2 (0.5-1 hour):** Post-deployment validation

---

## Resources Needed

### External APIs
- Census Bureau API key
- Zillow API access (if required)
- BLS API access (if required)

### Software/Tools
- Node.js 18+ (for development)
- Git (for version control)
- Testing framework (Jest or Vitest)
- Monitoring service (Sentry, New Relic)
- Hosting platform (Vercel recommended)

### Knowledge/Skills
- Next.js development
- API integration
- Data pipeline management
- Statistical analysis (for validation)
- DevOps/deployment (for production setup)

---

## Contacts & Escalation

### Technical Support
- GitHub Issues: For bug reports and feature requests
- Code Review: Request via GitHub pull request
- API Support: Check respective API documentation

### Data & Methodology
- Census Bureau Help: https://www.census.gov/programs-surveys/acs/guidance/feedback.html
- Zillow Data Issues: Contact Zillow support
- BLS Data Issues: Contact BLS support

---

## Post-Deployment Review (1 week after launch)

Schedule a retrospective meeting to discuss:
1. What went well during deployment
2. What issues were encountered
3. Performance metrics vs targets
4. User feedback and issues
5. Recommendations for improvements
6. Plan for Phase 5 enhancements

---

## Phase 4 Status: PENDING

**Ready to begin Phase 4 upon approval.**
**All prerequisites documented and checklists prepared.**
**Estimated duration: 4-6 hours.**

**Sign-off Required From:**
- [ ] Project Lead
- [ ] Data Owner
- [ ] Operations/DevOps
- [ ] QA Lead

---

**Created:** 2025-11-19
**Next Review:** After Phase 4 completion
**Document Owner:** Technical Lead

