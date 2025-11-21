import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Data Sources | Zoning Reform Analysis",
  description: "Complete reference of all data sources used in our zoning reform analysis, including Census data, economic indicators, and reform databases",
}

export default function DataSourcesPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Data Sources
        </h1>
        <p className="text-[var(--text-muted)]">
          We use only publicly available, high-quality data sources.
          Everything is cited and can be downloaded by you.
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Overview</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-[var(--positive-green)] rounded-full"></span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">Housing Permits</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Census, monthly/annual</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-[var(--positive-green)] rounded-full"></span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">Economics</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Census, Bureau of Labor Statistics</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-[var(--warning-orange)] rounded-full"></span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">Zoning Reforms</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Manual research + databases</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-[var(--positive-green)] rounded-full"></span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">Geography</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Census, OpenStreetMap</p>
          </div>
        </div>
      </section>

      {/* Building Permits */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Building Permits Data - Census BPS
        </h2>

        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-[var(--text-muted)]">Source:</span>
              <span className="text-[var(--text-primary)] ml-2">U.S. Census Bureau Building Permits Survey</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Coverage:</span>
              <span className="text-[var(--text-primary)] ml-2">~20,000 places, 1980-2024</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Frequency:</span>
              <span className="text-[var(--text-primary)] ml-2">Monthly with 1-2 month lag</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Quality:</span>
              <span className="text-[var(--positive-green)] ml-2">High (official government data)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-default)]">
            <p className="text-sm text-[var(--text-muted)] mb-2">
              <strong className="text-[var(--text-primary)]">URL:</strong>{" "}
              <a
                href="https://www2.census.gov/econ/bps/Place/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-blue)] hover:underline"
              >
                https://www2.census.gov/econ/bps/Place/
              </a>
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-default)]">
            <h4 className="font-semibold text-[var(--text-primary)] text-sm mb-2">What We Use</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>pl{"{year}"}a.txt files (annual totals by place)</li>
              <li>Breakdown by unit type (1-unit, 2-unit, 3-4 unit, 5+ unit)</li>
              <li>2015-2024 data (10 years)</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-[var(--border-default)]">
            <h4 className="font-semibold text-[var(--text-primary)] text-sm mb-2">How We Process It</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Download annual files from Census FTP</li>
              <li>Parse fixed-width format</li>
              <li>Map place FIPS codes to place names</li>
              <li>Aggregate by year and unit type</li>
              <li>Flag missing or inconsistent months</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-[var(--border-default)]">
            <h4 className="font-semibold text-[var(--text-primary)] text-sm mb-2">Limitations</h4>
            <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Some places don&apos;t report consistently</li>
              <li>Very small places may have sparse data</li>
              <li>Includes only permits (not actual construction)</li>
            </ul>
          </div>
        </div>

        <div className="bg-[var(--bg-card-soft)] border border-[var(--border-default)] rounded-lg p-3">
          <p className="text-xs text-[var(--text-muted)] font-mono">
            <strong>Citation:</strong> U.S. Census Bureau. (2024). Building Permits Survey - Place Data.
            Retrieved from https://www2.census.gov/econ/bps/Place/
          </p>
        </div>
      </section>

      {/* Economic Data */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Economic Data - Census ACS & BLS
        </h2>

        <div className="space-y-4">
          {/* ACS */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-[var(--text-primary)]">Census American Community Survey</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-[var(--text-muted)]">Coverage:</span>
                <span className="text-[var(--text-primary)] ml-2">All Census tracts and places</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Frequency:</span>
                <span className="text-[var(--text-primary)] ml-2">Annual</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Variables:</span>
                <span className="text-[var(--text-primary)] ml-2">Population, income, employment, housing</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Quality:</span>
                <span className="text-[var(--positive-green)] ml-2">High</span>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              <strong>URL:</strong>{" "}
              <a href="https://data.census.gov/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] hover:underline">
                https://data.census.gov/
              </a>
            </p>
          </div>

          {/* BLS */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-[var(--text-primary)]">Bureau of Labor Statistics</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-[var(--text-muted)]">Coverage:</span>
                <span className="text-[var(--text-primary)] ml-2">Metropolitan areas and states</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Frequency:</span>
                <span className="text-[var(--text-primary)] ml-2">Monthly</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Variables:</span>
                <span className="text-[var(--text-primary)] ml-2">Unemployment rate, job growth</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Quality:</span>
                <span className="text-[var(--positive-green)] ml-2">High</span>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              <strong>URL:</strong>{" "}
              <a href="https://www.bls.gov/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] hover:underline">
                https://www.bls.gov/
              </a>
            </p>
          </div>
        </div>

        <div className="bg-[var(--bg-card-soft)] border border-[var(--border-default)] rounded-lg p-3">
          <p className="text-xs text-[var(--text-muted)] font-mono">
            <strong>Citations:</strong><br />
            U.S. Census Bureau. (2024). American Community Survey. Retrieved from https://data.census.gov/<br />
            Bureau of Labor Statistics. (2024). Local Area Unemployment Statistics. Retrieved from https://www.bls.gov/
          </p>
        </div>
      </section>

      {/* Reform Data */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Reform Data - Collected Sources
        </h2>

        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-[var(--text-primary)]">Primary Sources</h3>

          <div className="space-y-3 text-sm">
            <div className="border-l-2 border-[var(--accent-blue)] pl-3">
              <strong className="text-[var(--text-primary)]">1. YIMBY Action Reform Tracker</strong>
              <p className="text-[var(--text-muted)]">Coverage: State-level zoning reforms. Actively maintained.</p>
              <p className="text-[var(--text-muted)]">How used: 30% of our 502 cities</p>
            </div>

            <div className="border-l-2 border-[var(--accent-blue)] pl-3">
              <strong className="text-[var(--text-primary)]">2. State Legislative Databases</strong>
              <p className="text-[var(--text-muted)]">Coverage: State-level zoning legislation. Official source.</p>
              <p className="text-[var(--text-muted)]">How used: State reform tracking</p>
            </div>

            <div className="border-l-2 border-[var(--accent-blue)] pl-3">
              <strong className="text-[var(--text-primary)]">3. Academic Research</strong>
              <p className="text-[var(--text-muted)]">Papers on ADU legalization, density bonus, parking reform</p>
              <p className="text-[var(--text-muted)]">How used: Document reform impacts (for Phase 4)</p>
            </div>

            <div className="border-l-2 border-[var(--accent-blue)] pl-3">
              <strong className="text-[var(--text-primary)]">4. News & Press Releases</strong>
              <p className="text-[var(--text-muted)]">Local news, city announcements. Quality varies.</p>
              <p className="text-[var(--text-muted)]">How used: Identify recent reforms</p>
            </div>

            <div className="border-l-2 border-[var(--accent-blue)] pl-3">
              <strong className="text-[var(--text-primary)]">5. Municipal Code Research</strong>
              <p className="text-[var(--text-muted)]">Search city websites for ordinances. Authoritative but time-consuming.</p>
              <p className="text-[var(--text-muted)]">Coverage: ~20% of reforms verified with actual ordinances</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--warning-orange)] bg-opacity-10 border border-[var(--warning-orange)] rounded-lg p-4">
          <h4 className="font-semibold text-[var(--warning-orange)] mb-2">Data Quality Process</h4>
          <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
            <li>Cross-reference reforms across multiple sources</li>
            <li>Verify dates with official city sources when possible</li>
            <li>Mark confidence level (high/medium/low)</li>
            <li>Document sources for each reform</li>
          </ul>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
          <h4 className="font-semibold text-[var(--text-primary)] mb-2">Limitations</h4>
          <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
            <li>Smaller/rural reforms likely undercounted</li>
            <li>Recent reforms (2024) may not be catalogued yet</li>
            <li>Effective date vs. adoption date can differ</li>
            <li>Some reforms are informal (guidelines, not ordinances)</li>
          </ul>
        </div>
      </section>

      {/* Geographic Data */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Geographic Data
        </h2>

        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-[var(--text-primary)]">Census Geographic Data</h3>
            <p className="text-sm text-[var(--text-muted)]">
              State, county, place boundaries and codes. Official, regularly updated.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              <strong>URL:</strong>{" "}
              <a href="https://www.census.gov/geographies/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] hover:underline">
                https://www.census.gov/geographies/
              </a>
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-[var(--text-primary)]">OpenStreetMap</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Global, community-maintained. Good for visualization.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              <strong>URL:</strong>{" "}
              <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] hover:underline">
                https://www.openstreetmap.org/
              </a>
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-[var(--text-primary)]">Nominatim (OSM Geocoding)</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Free geocoding service. Convert place names to latitude/longitude.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              <strong>Quality:</strong> 96.7% success rate (documented in Phase 1)
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              <strong>URL:</strong>{" "}
              <a href="https://nominatim.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] hover:underline">
                https://nominatim.org/
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Update Frequency */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Update Frequency & Quality
        </h2>

        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Update Schedule</h3>

          <div className="space-y-4 text-sm">
            <div>
              <strong className="text-[var(--accent-blue)]">Monthly</strong>
              <ul className="text-[var(--text-muted)] mt-1 list-disc pl-4">
                <li>Census Building Permits Survey (1-2 month lag)</li>
                <li>BLS employment data</li>
              </ul>
            </div>

            <div>
              <strong className="text-[var(--accent-blue)]">Quarterly</strong>
              <ul className="text-[var(--text-muted)] mt-1 list-disc pl-4">
                <li>ACS rolling estimates (Census)</li>
                <li>Media monitoring for new reforms</li>
              </ul>
            </div>

            <div>
              <strong className="text-[var(--accent-blue)]">Annually</strong>
              <ul className="text-[var(--text-muted)] mt-1 list-disc pl-4">
                <li>Full ACS release (October)</li>
                <li>Review and update reform database</li>
                <li>Retrain ML models</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Quality Levels</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[var(--positive-green)] rounded-full"></span>
              <span className="text-[var(--text-primary)]">High:</span>
              <span className="text-[var(--text-muted)]">Official government data (Census, BLS)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[var(--warning-orange)] rounded-full"></span>
              <span className="text-[var(--text-primary)]">Medium:</span>
              <span className="text-[var(--text-muted)]">Academic sources, multiple news reports</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[var(--negative-red)] rounded-full"></span>
              <span className="text-[var(--text-primary)]">Low:</span>
              <span className="text-[var(--text-muted)]">Single news source, unverified dates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-[var(--border-default)] pt-6 mt-8">
        <p className="text-sm text-[var(--text-muted)]">
          Found an error? We appreciate corrections. See our{" "}
          <Link href="/about/limitations" className="text-[var(--accent-blue)] hover:underline">
            Limitations
          </Link>{" "}
          page for known issues.
        </p>
      </div>
    </div>
  )
}
