import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Limitations | Zoning Reform Analysis",
  description: "Honest explanation of what our analysis can and cannot tell you about zoning reform impacts",
}

export default function LimitationsPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          What This Tool Can&apos;t Do (Yet)
        </h1>
        <p className="text-[var(--text-muted)]">
          We believe you should know the limits of our analysis before using
          it to make decisions. This page explains what we DON&apos;T know and why.
        </p>
        <p className="text-[var(--text-muted)] mt-3">
          Better to say &quot;we&apos;re unsure&quot; than to give you false confidence in
          our estimates.
        </p>
      </div>

      {/* Data Limitations */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Data Limitations
        </h2>

        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">A) Geographic Coverage</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>We have 24,535 places, but only 502 with documented reforms</li>
              <li>Rural places likely under-represented</li>
              <li>Some states have better data than others</li>
            </ul>
            <p className="text-sm text-[var(--warning-orange)] mt-2">
              <strong>Impact:</strong> Our reforms database may be biased toward urban, high-growth areas
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">B) Temporal Coverage</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>We have Census permits 1980-2024</li>
              <li>But many reforms are very recent (2020-2024)</li>
              <li>Post-reform periods are short</li>
            </ul>
            <p className="text-sm text-[var(--warning-orange)] mt-2">
              <strong>Impact:</strong> Can&apos;t measure long-term effects yet
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">C) Measurement Error</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Some places don&apos;t report permits consistently</li>
              <li>Definition of &quot;permits&quot; varies slightly by place</li>
              <li>Economic data is sampled (confidence intervals apply)</li>
            </ul>
            <p className="text-sm text-[var(--warning-orange)] mt-2">
              <strong>Impact:</strong> Margins of error on estimates
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">D) Confounding Factors</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Zoning reforms often happen during population booms</li>
              <li>Can&apos;t separate reform effect from market conditions</li>
              <li>COVID, inflation, interest rates affect all permits</li>
            </ul>
            <p className="text-sm text-[var(--warning-orange)] mt-2">
              <strong>Impact:</strong> May overestimate or underestimate reform effects
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">E) Missing Context</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>We don&apos;t know local land supply constraints</li>
              <li>Don&apos;t measure actual construction vs. permits</li>
              <li>Can&apos;t assess political factors in adoption</li>
            </ul>
            <p className="text-sm text-[var(--warning-orange)] mt-2">
              <strong>Impact:</strong> May not predict outcomes in your specific city
            </p>
          </div>
        </div>
      </section>

      {/* Model Limitations */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Model Limitations
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Current ML Model (Pre-Phase 4):
        </p>

        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">A) Small Training Sample</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Only 502 cities with documented reforms</li>
              <li>Traditional models need 1000+ samples for high accuracy</li>
            </ul>
            <p className="text-sm text-[var(--warning-orange)] mt-2">
              <strong>Impact:</strong> Predictions have wide uncertainty bands
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">B) Heterogeneous Effects</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Reforms work differently in different cities</li>
              <li>ADU reform in CA ≠ ADU reform in rural Iowa</li>
              <li>Market conditions matter (supply, demand, cost)</li>
            </ul>
            <p className="text-sm text-[var(--warning-orange)] mt-2">
              <strong>Impact:</strong> Our average prediction may not fit YOUR city
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">C) Historical Data Only</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Model learned from 502 past reforms</li>
              <li>Your city&apos;s context might be different</li>
              <li>New reform types not yet in data</li>
            </ul>
            <p className="text-sm text-[var(--warning-orange)] mt-2">
              <strong>Impact:</strong> Can&apos;t predict unprecedented reforms
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">D) No Causation (Yet)</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Current model: &quot;Cities with reforms have X% more permits&quot;</li>
              <li>Could be correlation, not causation</li>
              <li>Reforms might have been adopted because permits were rising</li>
            </ul>
            <p className="text-sm text-[var(--warning-orange)] mt-2">
              <strong>Impact:</strong> Can&apos;t claim reform CAUSED the increase
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">E) Unstable at Extremes</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Very small towns (&lt;1,000 people): unreliable</li>
              <li>Very hot markets (SF, NYC): model underfitted</li>
              <li>Very cold markets (declining cities): sparse data</li>
            </ul>
            <p className="text-sm text-[var(--warning-orange)] mt-2">
              <strong>Impact:</strong> Use predictions more cautiously for extremes
            </p>
          </div>
        </div>
      </section>

      {/* Causation Challenges */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Causation Challenges (Before Phase 4)
        </h2>

        <div className="bg-[var(--negative-red)] bg-opacity-10 border border-[var(--negative-red)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--negative-red)] mb-2">The Fundamental Problem: Causality is Hard</h3>
          <p className="text-sm text-[var(--text-muted)]">
            <strong>Current approach:</strong> &quot;These 502 cities had reforms. They got X% more
            permits. So you might too.&quot;
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            <strong>The issue:</strong> Did the reform cause the permits, or was it correlation?
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Example:</h3>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            City A: Adopted ADU reform in 2019, got 50% more permits. Why?
          </p>
          <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
            <li><strong>a)</strong> ADU reform enabled new housing? (REFORM caused increase)</li>
            <li><strong>b)</strong> Population was booming anyway? (COINCIDENCE)</li>
            <li><strong>c)</strong> Tech company moved in, need more housing? (OTHER FACTOR)</li>
          </ul>
        </div>

        <div className="bg-[var(--accent-blue)] bg-opacity-10 border border-[var(--accent-blue)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--accent-blue)] mb-2">Solution Coming in Phase 4</h3>
          <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
            <li>Compare cities WITH reform (treatment group)</li>
            <li>To similar cities WITHOUT reform (control group)</li>
            <li>Use methods like DiD, SCM, Event Study</li>
            <li>Isolate causal effect from other factors</li>
          </ul>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">For Now:</h3>
          <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
            <li>Use our predictions as a starting point</li>
            <li>Consider them &quot;optimistic scenarios&quot;</li>
            <li>Pair with expert judgment from your planning team</li>
            <li>Focus on similar cities&apos; experiences (case studies)</li>
          </ul>
        </div>
      </section>

      {/* Generalization Limits */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Generalization Limits
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[var(--positive-green)] bg-opacity-10 border border-[var(--positive-green)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--positive-green)] mb-2">Our analysis works best for:</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li>✓ Mid-size cities (50,000-500,000 people)</li>
              <li>✓ Coastal and high-growth regions</li>
              <li>✓ Cities with pre-existing housing shortages</li>
              <li>✓ Cities similar to those in our 502-city dataset</li>
            </ul>
          </div>

          <div className="bg-[var(--negative-red)] bg-opacity-10 border border-[var(--negative-red)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--negative-red)] mb-2">Our analysis is uncertain for:</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li>✗ Small towns (&lt;10,000)</li>
              <li>✗ Rapidly shrinking cities</li>
              <li>✗ Rural areas with abundant land</li>
              <li>✗ Unique markets (e.g., company towns)</li>
              <li>✗ Unusual reform combinations (no parallel case)</li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)]">
          <strong className="text-[var(--text-primary)]">Recommendation:</strong> If your city is NOT in our confident range, supplement this tool
          with local expertise. Talk to nearby cities that adopted similar reforms.
        </p>
      </section>

      {/* When NOT to Use */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          When NOT to Use This Tool
        </h2>

        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
          <p className="text-sm text-[var(--text-muted)] mb-3">Don&apos;t use for:</p>

          <div className="space-y-3 text-sm">
            <div className="border-l-2 border-[var(--negative-red)] pl-3">
              <strong className="text-[var(--text-primary)]">1. Zoning code writing</strong>
              <p className="text-[var(--text-muted)]">This tool analyzes impact, not code design. Use model ordinances and legal guidance.</p>
            </div>

            <div className="border-l-2 border-[var(--negative-red)] pl-3">
              <strong className="text-[var(--text-primary)]">2. Parking requirement calculation</strong>
              <p className="text-[var(--text-muted)]">While we track parking reforms, this isn&apos;t parking design. Use ITE guidelines or local expertise.</p>
            </div>

            <div className="border-l-2 border-[var(--negative-red)] pl-3">
              <strong className="text-[var(--text-primary)]">3. Affordable housing policy</strong>
              <p className="text-[var(--text-muted)]">We measure permits, not affordability. AH policy requires different analysis.</p>
            </div>

            <div className="border-l-2 border-[var(--negative-red)] pl-3">
              <strong className="text-[var(--text-primary)]">4. Environmental impact</strong>
              <p className="text-[var(--text-muted)]">This tool focuses on quantity, not environmental effects. Environmental review required separately.</p>
            </div>

            <div className="border-l-2 border-[var(--negative-red)] pl-3">
              <strong className="text-[var(--text-primary)]">5. Fiscal impact</strong>
              <p className="text-[var(--text-muted)]">We don&apos;t model tax revenue or costs. Use fiscal impact models.</p>
            </div>

            <div className="border-l-2 border-[var(--negative-red)] pl-3">
              <strong className="text-[var(--text-primary)]">6. Non-zoning housing policy</strong>
              <p className="text-[var(--text-muted)]">Subsidies, lending, maintenance require different tools. Zoning is one lever, not the only one.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We're Doing to Improve */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          What We&apos;re Doing to Improve
        </h2>

        <div className="space-y-4">
          <div className="bg-[var(--accent-blue)] bg-opacity-10 border border-[var(--accent-blue)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--accent-blue)] mb-2">Phase 4: Causal Inference</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Add DiD, SCM, Event Study methods</li>
              <li>More rigorous impact estimates</li>
              <li>Timeline: Q1 2026</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Ongoing: Expand Reform Database</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Add more cities with zoning reforms</li>
              <li>Better documentation of reform details</li>
              <li>Improve data quality</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Future: Additional Features</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Scenario planning (what if we combine reforms?)</li>
              <li>Subgroup analysis (what works in cities like us?)</li>
              <li>Long-term effect tracking (does impact persist?)</li>
              <li>Academic API (for research community)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-[var(--border-default)] pt-6 mt-8">
        <p className="text-sm text-[var(--text-muted)]">
          Have feedback or found an issue? See our{" "}
          <Link href="/about/faq" className="text-[var(--accent-blue)] hover:underline">
            FAQ
          </Link>{" "}
          or check the{" "}
          <Link href="/about/methodology" className="text-[var(--accent-blue)] hover:underline">
            Methodology
          </Link>{" "}
          page for technical details.
        </p>
      </div>
    </div>
  )
}
