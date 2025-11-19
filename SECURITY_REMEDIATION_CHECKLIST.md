# Security Remediation Checklist

## CRITICAL ISSUES (Fix within 24-48 hours)

### 1. XSS Vulnerability in ChoroplethMap Component
- [ ] File: `/app/components/visualizations/ChoroplethMap.tsx`
- [ ] Issue: Lines 164-178 and 185-198 use `.html()` with unsanitized template literals
- [ ] Action: Replace with safe DOM manipulation or sanitization
- [ ] Steps:
  - [ ] Install DOMPurify: `npm install dompurify && npm install --save-dev @types/dompurify`
  - [ ] Import in component: `import DOMPurify from 'dompurify'`
  - [ ] Replace: `tooltip.html(htmlString)` with `tooltip.html(DOMPurify.sanitize(htmlString))`
  - [ ] Test with malicious payload: `<img src=x onerror=alert('XSS')>`
  - [ ] Verify tooltip still displays correctly

### 2. Input Validation for Year Parameters
- [ ] File: `/app/app/api/census/permits/route.ts` (lines 24-29)
- [ ] File: `/app/app/api/census/live-permits/route.ts` (lines 27-28)
- [ ] Issue: No bounds checking or validation on year parameters
- [ ] Action: Add validation function
- [ ] Steps:
  - [ ] Create validation utility function with MIN_YEAR and MAX_YEAR constants
  - [ ] Validate both startYear and endYear parameters
  - [ ] Ensure startYear <= endYear
  - [ ] Return 400 error with descriptive message for invalid inputs
  - [ ] Test with: `?startYear=2500&endYear=1990` and `?startYear=abc`

### 3. Fix CSV Parsing in Baseline and Metrics Routes
- [ ] File: `/app/app/api/states/baseline/route.ts` (lines 22-32)
- [ ] File: `/app/app/api/reforms/metrics/route.ts` (lines 23-33)
- [ ] Issue: Naive split(",") doesn't handle quoted fields
- [ ] Action: Use csv-parse library
- [ ] Steps:
  - [ ] Import: `import { parse } from "csv-parse/sync"`
  - [ ] Replace manual split logic with `parse(csvContent, { columns: true, ... })`
  - [ ] Copy the configuration from `/app/app/api/counties/[state_fips]/route.ts`
  - [ ] Test with CSV containing quoted fields with commas

---

## HIGH PRIORITY ISSUES (Fix within 1-2 weeks)

### 4. Add Security Headers Configuration
- [ ] File: `/app/next.config.ts`
- [ ] Issue: No security headers configured
- [ ] Action: Add headers configuration
- [ ] Steps:
  - [ ] Copy the `headers()` configuration from SECURITY_AUDIT_REPORT.md
  - [ ] Adjust CSP for your specific CDN needs
  - [ ] Test headers using https://securityheaders.com
  - [ ] Verify no "unsafe" warnings

### 5. Refactor Path Traversal Pattern
- [ ] Files to update:
  - [ ] `/app/app/api/states/baseline/route.ts`
  - [ ] `/app/app/api/reforms/metrics/route.ts`
  - [ ] `/app/app/api/counties/[state_fips]/route.ts`
  - [ ] `/app/app/api/predictions/route.ts`
- [ ] Issue: Use of ".." for directory traversal
- [ ] Action: Use environment variable for data directory
- [ ] Steps:
  - [ ] Create `.env.local` with: `DATA_DIRECTORY=../data`
  - [ ] In each route, read from: `process.env.DATA_DIRECTORY`
  - [ ] Validate resolved path is within allowed directory
  - [ ] Test that data loads correctly

### 6. Add State FIPS Validation
- [ ] File: `/app/app/api/counties/[state_fips]/route.ts` (line 11)
- [ ] Issue: No validation of state_fips parameter
- [ ] Action: Add regex validation
- [ ] Steps:
  - [ ] Create: `const STATE_FIPS_PATTERN = /^0[1-9]|[1-5]\d|6[0-9]|7[0-2]$/`
  - [ ] Add validation check before using parameter
  - [ ] Return 400 error for invalid FIPS codes
  - [ ] Test with valid: "06", "12", "36" and invalid: "99", "00", "abc"

### 7. Sanitize Error Messages
- [ ] Files to update:
  - [ ] `/app/app/api/census/permits/route.ts`
  - [ ] `/app/app/api/census/live-permits/route.ts`
  - [ ] `/app/app/api/counties/[state_fips]/route.ts`
  - [ ] `/app/app/api/predictions/route.ts`
  - [ ] `/app/app/api/states/baseline/route.ts`
  - [ ] `/app/app/api/reforms/metrics/route.ts`
- [ ] Issue: Error messages reveal internal paths
- [ ] Action: Only show detailed errors in development
- [ ] Steps:
  - [ ] Check: `const isDevelopment = process.env.NODE_ENV === 'development'`
  - [ ] Only include error details if isDevelopment is true
  - [ ] Always log full error to server logs for debugging
  - [ ] Return generic message in production

---

## MEDIUM PRIORITY ISSUES (Fix within 2-4 weeks)

### 8. Add StateCode Validation
- [ ] File: `/app/lib/census-api.ts` (function `fetchStatePermitsByState`)
- [ ] Issue: No validation of stateCode parameter
- [ ] Action: Add FIPS code whitelist
- [ ] Steps:
  - [ ] Create VALID_STATE_FIPS Set with all US state codes
  - [ ] Validate before using in URL
  - [ ] Throw error if invalid
  - [ ] Update callers to handle error

### 9. Fix CSV Injection in Export
- [ ] File: `/app/components/dashboard/DataExport.tsx` (lines 14-23)
- [ ] Issue: Formula injection via CSV (e.g., "=SUM(1+1)")
- [ ] Action: Escape formula characters
- [ ] Steps:
  - [ ] Add check: if value starts with `=`, `+`, `-`, or `@`, prefix with single quote
  - [ ] Also handle quote escaping: `"` becomes `""`
  - [ ] Test with injection payload: `=1+1` in jurisdiction name
  - [ ] Verify Excel doesn't execute formula

### 10. Use Next.js Router for Navigation
- [ ] File: `/app/app/live/page.tsx` (line 103)
- [ ] Issue: Direct `window.location.href` assignment
- [ ] Action: Use Next.js router
- [ ] Steps:
  - [ ] Import: `import { useRouter } from 'next/navigation'`
  - [ ] Create handler: `const handleSwitch = () => router.push('/')`
  - [ ] Update callback: `onSwitch={handleSwitch}`
  - [ ] Test navigation works

---

## RECOMMENDED ENHANCEMENTS (Future)

### 11. Implement Rate Limiting
- [ ] Consider using: `ratelimit` package or Vercel middleware
- [ ] Limit Census API calls per IP/session
- [ ] Prevent brute force attacks

### 12. Add CSRF Protection
- [ ] If adding state-changing operations in future
- [ ] Implement CSRF tokens for form submissions
- [ ] Use SameSite cookie policy

### 13. Add Request Logging
- [ ] Log all API requests for security monitoring
- [ ] Track failed authentication attempts
- [ ] Monitor for suspicious patterns

### 14. CORS Configuration
- [ ] Restrict cross-origin requests if needed
- [ ] Use: `next-cors` package
- [ ] Only allow trusted origins

---

## Testing Checklist

### Security Testing
- [ ] Test XSS payload in all text fields
- [ ] Test path traversal: `../../../etc/passwd`
- [ ] Test integer overflow: `?startYear=9999999999`
- [ ] Test CSV injection: `=cmd|'/c calc'`
- [ ] Test invalid FIPS codes: `?state_fips=999`

### Functional Testing
- [ ] Dashboard loads and displays data correctly
- [ ] Filters work after validation changes
- [ ] CSV export produces valid file
- [ ] Map tooltips display correctly
- [ ] All API endpoints return 200 for valid requests

### Regression Testing
- [ ] Run full test suite: `npm run test`
- [ ] Lint check: `npm run lint`
- [ ] Build check: `npm run build`

---

## Deployment Checklist

Before deploying to production:
- [ ] All CRITICAL issues fixed and tested
- [ ] Security headers verified
- [ ] Environment variables configured
- [ ] .env.local NOT committed to git (verify .gitignore)
- [ ] npm audit shows no vulnerabilities
- [ ] All tests passing
- [ ] Security headers validated on https://securityheaders.com
- [ ] CSP validated on https://csp-evaluator.withgoogle.com

---

## References
- Full audit report: `SECURITY_AUDIT_REPORT.md`
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security: https://nextjs.org/docs/advanced-features/security-headers
- Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

---

**Last Updated:** November 19, 2025
**Status:** All items pending
