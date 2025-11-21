import { MapPin, TrendingUp, LineChart, Users } from 'lucide-react';

export default function UniqueValuePropositions() {
  const propositions = [
    {
      icon: MapPin,
      headline: 'Place-Level Granularity',
      typical: 'State-level data only, missing local variation',
      ours: '24,535+ places searchable. Your specific jurisdiction analyzed.',
    },
    {
      icon: LineChart,
      headline: 'Causal Inference Methods',
      typical: 'Simple before/after comparisons',
      ours: 'DiD, Synthetic Control, Event Study. Real causal impacts.',
    },
    {
      icon: TrendingUp,
      headline: 'Forward-Looking Analysis',
      typical: 'Historical data only',
      ours: 'ML forecasts + scenario modeling. Predict reform impact.',
    },
    {
      icon: Users,
      headline: 'Policymaker-Focused',
      typical: 'Built for researchers',
      ours: 'Designed for council presentations & policy decisions.',
    },
  ];

  const comparisonRows = [
    { feature: 'Geographic Coverage', typical: 'State-only', ours: '24,535 places' },
    { feature: 'Reform Cities Tracked', typical: '0-30', ours: '502 cities' },
    { feature: 'Analysis Methods', typical: 'Descriptive', ours: 'DiD, SCM, Event Study' },
    { feature: 'Predictions', typical: 'None', ours: 'ML + Scenarios' },
    { feature: 'Report Export', typical: 'Manual', ours: 'Automated PDF/PPT' },
    { feature: 'Cost', typical: '$600-2000/year', ours: 'Free' },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built specifically for housing policymakers who need actionable insights, not just data.
          </p>
        </div>

        {/* Four Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {propositions.map((prop) => (
            <div
              key={prop.headline}
              className="bg-gray-50 rounded-xl p-6 border border-gray-200"
            >
              <prop.icon className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-4">{prop.headline}</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Most tools:</span>
                  <p className="text-sm text-gray-600">{prop.typical}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase">Us:</span>
                  <p className="text-sm text-gray-900 font-medium">{prop.ours}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-gray-100 font-semibold text-gray-900 rounded-tl-lg">
                  Feature
                </th>
                <th className="text-left p-4 bg-gray-100 font-semibold text-gray-600">
                  Typical Tools
                </th>
                <th className="text-left p-4 bg-blue-600 font-semibold text-white rounded-tr-lg">
                  Our Platform
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, index) => (
                <tr
                  key={row.feature}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                  <td className="p-4 text-gray-600">{row.typical}</td>
                  <td className="p-4 bg-blue-50 text-blue-900 font-medium">{row.ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
