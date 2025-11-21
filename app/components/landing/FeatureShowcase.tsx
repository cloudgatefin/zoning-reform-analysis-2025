import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function FeatureShowcase() {
  const features = [
    {
      title: 'Search 24,535 Places',
      description: 'Instant search by city name or state. Fuzzy matching finds exactly what you\'re looking for.',
      image: '/screenshots/place-search.png',
      fallbackBg: 'from-blue-100 to-blue-200',
      cta: 'Try It',
      href: '/dashboard',
    },
    {
      title: 'Interactive Map',
      description: 'Explore all 24,535 places on a color-coded map. Zoom to your region. Click for details.',
      image: '/screenshots/interactive-map.png',
      fallbackBg: 'from-green-100 to-green-200',
      cta: 'Explore Map',
      href: '/dashboard',
    },
    {
      title: 'Predict Reform Impact',
      description: 'Model housing permit increases from zoning reforms. See outcomes from similar cities.',
      image: '/screenshots/calculator.png',
      fallbackBg: 'from-purple-100 to-purple-200',
      cta: 'Try Calculator',
      href: '/dashboard',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to analyze zoning reforms and make evidence-based decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Image placeholder */}
              <div className={`h-48 bg-gradient-to-br ${feature.fallbackBg} flex items-center justify-center`}>
                <div className="text-center text-gray-600">
                  <div className="text-sm">Screenshot</div>
                  <div className="text-xs opacity-75">{feature.title}</div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link
                  href={feature.href}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  {feature.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
