import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export default function DataQuality() {
  const dataSources = [
    'Census Bureau Building Permits Survey (20,000+ places)',
    'Census American Community Survey (demographics)',
    'YIMBY Action Reform Tracker (502+ cities)',
    'State legislation databases',
    'Municipal ordinance research',
  ];

  const methods = [
    'Difference-in-Differences (DiD) analysis',
    'Synthetic Control Method (SCM)',
    'Event Study design',
    'Machine learning predictions (XGBoost)',
    'K-fold cross-validation',
  ];

  return (
    <section id="data-quality" className="py-20 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Research-Grade Data & Methods
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built on trusted sources and rigorous analytical methods
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Data Sources */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Trusted Data Sources</h3>
            <ul className="space-y-3">
              {dataSources.map((source) => (
                <li key={source} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{source}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Methods */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Rigorous Methods</h3>
            <ul className="space-y-3">
              {methods.map((method) => (
                <li key={method} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{method}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Transparency Callout */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <p className="text-gray-700 mb-4 max-w-3xl mx-auto">
            <strong>Transparency is our commitment:</strong> All methodology, data sources, and
            limitations are fully documented. Learn how we analyze reform impacts and where we
            can improve.
          </p>
          <Link
            href="/about/methodology"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            Read Our Methodology
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
