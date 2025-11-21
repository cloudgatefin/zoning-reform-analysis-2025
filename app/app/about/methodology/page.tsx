import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Methodology | Zoning Reform Analysis",
  description: "Detailed explanation of our analysis methods, metrics computation, and ML model for predicting zoning reform impacts",
}

export default function MethodologyPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          How We Analyze Zoning Reform Impact
        </h1>
        <p className="text-[var(--text-muted)]">
          This page explains the methods behind every number on this platform.
          We believe transparency is essential for policymakers to trust our
          analysis and use it responsibly.
        </p>
        <p className="text-[var(--text-muted)] mt-3">
          <strong className="text-[var(--text-primary)]">Our goal:</strong> Rigorously estimate how zoning reforms affect housing
          production, without overstating certainty or hiding limitations.
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">On This Page</h2>
        <ul className="space-y-1 text-sm">
          <li><a href="#data-pipeline" className="text-[var(--accent-blue)] hover:underline">1. Data Pipeline</a></li>
          <li><a href="#place-metrics" className="text-[var(--accent-blue)] hover:underline">2. Place-Level Metrics</a></li>
          <li><a href="#ml-model" className="text-[var(--accent-blue)] hover:underline">3. ML Model</a></li>
          <li><a href="#assumptions" className="text-[var(--accent-blue)] hover:underline">4. Assumptions & Validation</a></li>
          <li><a href="#phase4" className="text-[var(--accent-blue)] hover:underline">5. Next Steps: Phase 4 Methods</a></li>
        </ul>
      </div>

      {/* Section 1: Data Pipeline */}
      <section id="data-pipeline" className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          1. Data Pipeline
        </h2>
        <h3 className="text-md font-semibold text-[var(--text-primary)]">
          From Census Data to Place Metrics
        </h3>

        <div className="space-y-3 text-sm text-[var(--text-muted)]">
          <p>
            We use the <strong className="text-[var(--text-primary)]">Census Building Permits Survey</strong>, which provides monthly place-level data on housing permits issued across the United States.
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-[var(--text-primary)]">Data collection:</strong> 20,000+ places since 1980</li>
            <li><strong className="text-[var(--text-primary)]">Data processing:</strong> Fix errors, handle missing months</li>
            <li><strong className="text-[var(--text-primary)]">Permit aggregation:</strong> Monthly → annual → 5-year rates</li>
          </ul>
        </div>

        {/* Data flow diagram */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4 overflow-x-auto">
          <pre className="text-xs text-[var(--text-muted)] font-mono">
{`Census Raw Data → Parse → Clean → Aggregate → Metrics CSV
     ↓              ↓        ↓          ↓           ↓
  pl{year}a.txt   Fixed    Missing    Annual    place_metrics.csv
                  width    months     totals    (24,535 places)`}
          </pre>
        </div>
      </section>

      {/* Section 2: Place-Level Metrics */}
      <section id="place-metrics" className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          2. Place-Level Metrics
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          We compute the following metrics for each place in our database:
        </p>

        <div className="space-y-6">
          {/* Metric A */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">A) Recent Permits (2024)</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li><strong>Definition:</strong> Single-family + multi-family permits in 2024</li>
              <li><strong>Calculation:</strong> Sum of all permits issued</li>
              <li><strong>Limitations:</strong> Some places don&apos;t report monthly</li>
              <li><strong>Data Quality:</strong> Flagged if &lt;12 months reported</li>
            </ul>
          </div>

          {/* Metric B */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">B) Growth Rate (5-year)</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li><strong>Definition:</strong> (Permits 2020-2024 average) / (Permits 2015-2019 average)</li>
              <li><strong>Calculation:</strong> Simple ratio with error handling</li>
              <li><strong>Limitations:</strong> Annual variation can be large</li>
              <li><strong>Confidence:</strong> Higher in larger places</li>
            </ul>
          </div>

          {/* Metric C */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">C) Multi-Family Share (Recent)</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li><strong>Definition:</strong> MF permits / Total permits (2020-2024)</li>
              <li><strong>Calculation:</strong> Sum of 2-4 unit + 5+ unit / total</li>
              <li><strong>Limitations:</strong> Varies by development cycle</li>
              <li><strong>Significance:</strong> Indicates dense housing production</li>
            </ul>
          </div>

          {/* Metric D */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">D) National Ranking</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li><strong>Definition:</strong> Percentile of growth rate among all places</li>
              <li><strong>Calculation:</strong> (Number of places with lower growth) / Total places</li>
              <li><strong>Limitations:</strong> Can be unstable for similar growth rates</li>
              <li><strong>Usefulness:</strong> Helps compare to peers</li>
            </ul>
          </div>

          {/* Metric E */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">E) State Ranking</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li><strong>Definition:</strong> Percentile within state only</li>
              <li><strong>Calculation:</strong> Same as national, filtered by state</li>
              <li><strong>Limitations:</strong> States vary greatly in number of places</li>
              <li><strong>Usefulness:</strong> Better comparison to local peers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3: ML Model */}
      <section id="ml-model" className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          3. ML Model: Predicting Housing Impact
        </h2>

        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
          <h4 className="font-semibold text-[var(--text-primary)] mb-3">Current Model Status</h4>
          <ul className="text-sm text-[var(--text-muted)] space-y-1">
            <li><strong>Algorithm:</strong> Random Forest Regressor</li>
            <li><strong>Target:</strong> Percent change in permits post-reform</li>
            <li><strong>Training Data:</strong> 502 cities with documented reforms</li>
            <li><strong>Features:</strong> 7 economic + regulatory variables</li>
            <li><strong>Performance:</strong> R² = 0.2-0.4 (estimated)</li>
            <li><strong>Validation:</strong> 5-fold cross-validation</li>
          </ul>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-3">Inputs to Model</h4>
            <ol className="text-sm text-[var(--text-muted)] space-y-1 list-decimal pl-4">
              <li>City characteristics (population, density, growth rate)</li>
              <li>Market conditions (median home value, rental vacancy)</li>
              <li>Baseline regulations (WRLURI score)</li>
              <li>Reform characteristics (type, comprehensiveness)</li>
            </ol>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-3">Output from Model</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Predicted permit increase (percentage)</li>
              <li>Prediction interval (80% confidence band)</li>
              <li>Feature importance (what drives the prediction)</li>
              <li>Similar cities (which were most similar)</li>
            </ul>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
          <h4 className="font-semibold text-[var(--text-primary)] mb-3">Why We Use Random Forest</h4>
          <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
            <li><strong>Non-linear relationships:</strong> Reforms affect different cities differently</li>
            <li><strong>Built-in feature importance:</strong> Transparency about what matters</li>
            <li><strong>Robust to outliers:</strong> Handles unusual cities well</li>
            <li><strong>Easy to update:</strong> Can retrain as we get more reform data</li>
          </ul>
        </div>

        <div className="bg-[var(--warning-orange)] bg-opacity-10 border border-[var(--warning-orange)] rounded-lg p-4">
          <h4 className="font-semibold text-[var(--warning-orange)] mb-2">Current Limitations</h4>
          <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
            <li>Only trained on 502 cities (small sample)</li>
            <li>Effects are heterogeneous (varies by city type)</li>
            <li>Doesn&apos;t account for COVID or other shocks</li>
            <li>Causal inference coming in Phase 4</li>
          </ul>
        </div>
      </section>

      {/* Section 4: Assumptions & Validation */}
      <section id="assumptions" className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          4. Assumptions & Validation
        </h2>

        <h3 className="text-md font-semibold text-[var(--text-primary)]">Key Assumptions</h3>

        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">1. Census permits data is accurate</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li><strong>Validation:</strong> Cross-check with state data where available</li>
              <li><strong>Known issues:</strong> Some places miss reporting months</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">2. Zoning reform dates are correct</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li><strong>Validation:</strong> Verify with city ordinances when possible</li>
              <li><strong>Known issues:</strong> May not capture effective date vs. adoption date</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">3. No major confounders besides those in model</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li><strong>Validation:</strong> Robustness checks with/without each variable</li>
              <li><strong>Known issues:</strong> COVID, inflation can affect permits independently</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">4. Effects are constant across similar cities</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li><strong>Validation:</strong> Test predictions on held-out cities</li>
              <li><strong>Known issues:</strong> Local context matters (land supply, cost of living)</li>
            </ul>
          </div>
        </div>

        <h3 className="text-md font-semibold text-[var(--text-primary)] mt-6">Validation Approach</h3>
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
          <ul className="text-sm text-[var(--text-muted)] space-y-2">
            <li>• Train on 400 cities, test on 102 cities (80/20 split)</li>
            <li>• Repeat 5 times (5-fold cross-validation)</li>
            <li>• Check predictions against actual outcomes</li>
            <li>• Examine error distribution for systematic bias</li>
          </ul>
        </div>

        <h3 className="text-md font-semibold text-[var(--text-primary)] mt-6">Uncertainty Quantification</h3>
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
          <ul className="text-sm text-[var(--text-muted)] space-y-2">
            <li>• For each prediction, provide 80% confidence interval</li>
            <li>• Wider intervals for less certain predictions</li>
            <li>• Conservative estimates (prefer under-predicting over over-predicting)</li>
          </ul>
        </div>
      </section>

      {/* Section 5: Phase 4 Methods */}
      <section id="phase4" className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          5. Next Steps: Phase 4 Methods
        </h2>

        <div className="bg-[var(--accent-blue)] bg-opacity-10 border border-[var(--accent-blue)] rounded-lg p-4">
          <h4 className="font-semibold text-[var(--accent-blue)] mb-2">Coming in Phase 4: Causal Inference Methods</h4>
          <p className="text-sm text-[var(--text-muted)]">
            <strong>Current limitation:</strong> Our model predicts effects but doesn&apos;t prove causation.
            Phase 4 will add rigorous causal methods.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">1. Difference-in-Differences (DiD)</h4>
            <p className="text-sm text-[var(--text-muted)]">
              Compare cities with reforms to similar cities without reforms,
              before and after reform adoption. Control for common trends.
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">2. Synthetic Control Method (SCM)</h4>
            <p className="text-sm text-[var(--text-muted)]">
              Create synthetic &quot;twin&quot; city from combination of peers without
              reform. Compare to actual reformed city.
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">3. Event Study Design</h4>
            <p className="text-sm text-[var(--text-muted)]">
              Track permit changes starting 4 years before reform, through
              4 years after. Test pre-trends, measure dynamic effects.
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)] mt-4">
          These methods will make us confident saying: <strong className="text-[var(--text-primary)]">&quot;Reform CAUSED the increase&quot;</strong> not just &quot;they&apos;re correlated.&quot;
        </p>
      </section>

      {/* Footer links */}
      <div className="border-t border-[var(--border-default)] pt-6 mt-8">
        <p className="text-sm text-[var(--text-muted)]">
          For more details, see our{" "}
          <Link href="/about/data-sources" className="text-[var(--accent-blue)] hover:underline">
            Data Sources
          </Link>{" "}
          and{" "}
          <Link href="/about/limitations" className="text-[var(--accent-blue)] hover:underline">
            Limitations
          </Link>{" "}
          pages.
        </p>
      </div>
    </div>
  )
}
