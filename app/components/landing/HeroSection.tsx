import Link from 'next/link';
import { ArrowRight, MapPin, TrendingUp, BarChart2 } from 'lucide-react';

export default function HeroSection() {
  const stats = [
    { value: '24,535', label: 'Searchable U.S. Places', icon: MapPin },
    { value: '502', label: 'Cities with Reforms Tracked', icon: TrendingUp },
    { value: '3', label: 'Causal Analysis Methods', icon: BarChart2 },
  ];

  return (
    <section className="pt-24 pb-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Definitive Zoning Reform Intelligence Platform
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Analyze 24,535+ U.S. places. Track 502 cities with zoning reforms.
            Predict policy impact with research-grade causal inference.
            Make evidence-based housing policy decisions.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Search Your City
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Learn How It Works
            </a>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
