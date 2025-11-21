import { NextRequest, NextResponse } from 'next/server';
import { ScenarioResult } from '@/lib/scenario-utils';

export async function POST(request: NextRequest) {
  try {
    const result: ScenarioResult = await request.json();

    // Generate HTML report
    const html = generateHTMLReport(result);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="scenario-report-${result.selected_city.place_name.replace(/\s+/g, '-')}.html"`
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Report generation failed' },
      { status: 500 }
    );
  }
}

function generateHTMLReport(result: ScenarioResult): string {
  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const realisticScenario = result.scenarios.find(s => s.id === 'realistic')!;
  const optimisticScenario = result.scenarios.find(s => s.id === 'optimistic')!;
  const pessimisticScenario = result.scenarios.find(s => s.id === 'pessimistic')!;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scenario Report - ${result.selected_city.place_name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    h1 { font-size: 28px; margin-bottom: 8px; }
    h2 { font-size: 20px; margin: 24px 0 12px; color: #374151; }
    h3 { font-size: 16px; margin: 16px 0 8px; color: #4b5563; }
    .subtitle { color: #6b7280; font-size: 14px; }
    .meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 24px 0;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .meta-item { }
    .meta-label { font-size: 12px; color: #6b7280; }
    .meta-value { font-weight: 600; }
    .scenarios {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    .scenario-card {
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .scenario-card.realistic {
      border-color: #2563eb;
      background: #eff6ff;
    }
    .scenario-name { font-weight: 600; margin-bottom: 8px; }
    .scenario-value {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .optimistic .scenario-value { color: #16a34a; }
    .realistic .scenario-value { color: #2563eb; }
    .pessimistic .scenario-value { color: #f97316; }
    .scenario-permits { font-size: 14px; color: #6b7280; }
    .scenario-confidence { font-size: 12px; color: #9ca3af; margin-top: 8px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 14px;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th { font-weight: 600; color: #6b7280; }
    .positive { color: #16a34a; }
    .negative { color: #ef4444; }
    ul { padding-left: 20px; margin: 12px 0; }
    li { margin: 8px 0; }
    .caveats {
      margin-top: 32px;
      padding: 16px;
      background: #fef3c7;
      border-radius: 8px;
      font-size: 14px;
    }
    .caveats h3 { margin-top: 0; color: #92400e; }
    .caveats ul { color: #78350f; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
    @media print {
      body { padding: 20px; }
      .scenarios { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Scenario Modeling Report</h1>
    <p class="subtitle">${result.selected_city.place_name}, ${result.selected_city.state_name}</p>
    <p class="subtitle">Generated ${now}</p>
  </div>

  <h2>Executive Summary</h2>
  <p>
    If ${result.selected_city.place_name} adopts ${result.selected_reforms.join(' and ')} reforms,
    our analysis predicts a <strong>${realisticScenario.predicted_permit_increase_pct}%</strong> increase
    in annual housing permits within ${result.time_horizon_years} years (realistic scenario).
    This would increase annual permits from ${result.baseline_annual_permits.toLocaleString()} to
    approximately ${realisticScenario.predicted_annual_permits.toLocaleString()}.
  </p>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Current Annual Permits</div>
      <div class="meta-value">${result.baseline_annual_permits.toLocaleString()}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Selected Reforms</div>
      <div class="meta-value">${result.selected_reforms.join(', ')}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Time Horizon</div>
      <div class="meta-value">${result.time_horizon_years} years</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Growth Assumption</div>
      <div class="meta-value">${result.growth_assumption.charAt(0).toUpperCase() + result.growth_assumption.slice(1)}</div>
    </div>
  </div>

  <h2>Scenario Predictions</h2>
  <div class="scenarios">
    <div class="scenario-card optimistic">
      <div class="scenario-name">Optimistic</div>
      <div class="scenario-value">+${optimisticScenario.predicted_permit_increase_pct}%</div>
      <div class="scenario-permits">~${optimisticScenario.predicted_annual_permits.toLocaleString()} permits/yr</div>
      <div class="scenario-confidence">Confidence: ${optimisticScenario.confidence}%</div>
    </div>
    <div class="scenario-card realistic">
      <div class="scenario-name">Realistic</div>
      <div class="scenario-value">+${realisticScenario.predicted_permit_increase_pct}%</div>
      <div class="scenario-permits">~${realisticScenario.predicted_annual_permits.toLocaleString()} permits/yr</div>
      <div class="scenario-confidence">Confidence: ${realisticScenario.confidence}%</div>
    </div>
    <div class="scenario-card pessimistic">
      <div class="scenario-name">Pessimistic</div>
      <div class="scenario-value">+${pessimisticScenario.predicted_permit_increase_pct}%</div>
      <div class="scenario-permits">~${pessimisticScenario.predicted_annual_permits.toLocaleString()} permits/yr</div>
      <div class="scenario-confidence">Confidence: ${pessimisticScenario.confidence}%</div>
    </div>
  </div>

  ${result.comparable_cities.length > 0 ? `
  <h2>Comparable Cities</h2>
  <p>These similar cities adopted comparable reforms:</p>
  <table>
    <thead>
      <tr>
        <th>City</th>
        <th>Reform</th>
        <th>Year</th>
        <th>Permit Change</th>
        <th>Current Permits</th>
      </tr>
    </thead>
    <tbody>
      ${result.comparable_cities.map(city => `
      <tr>
        <td>${city.place_name}, ${city.state_name}</td>
        <td>${city.reform_type}</td>
        <td>${city.adoption_year}</td>
        <td class="${city.permit_increase_pct >= 0 ? 'positive' : 'negative'}">
          ${city.permit_increase_pct >= 0 ? '+' : ''}${city.permit_increase_pct.toFixed(1)}%
        </td>
        <td>${city.current_annual_permits.toLocaleString()}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <h2>Key Findings</h2>
  <ul>
    ${result.key_findings.map(finding => `<li>${finding}</li>`).join('')}
  </ul>

  <div class="caveats">
    <h3>Caveats & Limitations</h3>
    <ul>
      ${result.caveats.map(caveat => `<li>${caveat}</li>`).join('')}
    </ul>
  </div>

  <div class="footer">
    <p>Generated by Zoning Reform Analysis Dashboard</p>
    <p>For methodology details, visit our documentation</p>
  </div>
</body>
</html>
  `.trim();
}
