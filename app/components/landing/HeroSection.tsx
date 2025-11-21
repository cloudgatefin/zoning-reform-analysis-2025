import Link from 'next/link';
import { ArrowRight, MapPin, TrendingUp, BarChart2 } from 'lucide-react';
import { Button, Container, Card, CardContent } from '@/components/ui';

export default function HeroSection() {
  const stats = [
    { value: '24,535', label: 'Searchable U.S. Places', icon: MapPin },
    { value: '502', label: 'Cities with Reforms Tracked', icon: TrendingUp },
    { value: '3', label: 'Causal Analysis Methods', icon: BarChart2 },
  ];

  return (
    <section className="pt-20 pb-16 bg-gradient-to-b from-blue-50 via-blue-25 to-white">
      <Container maxWidth="lg">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            The Definitive Zoning Reform Intelligence Platform
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Analyze 24,535+ U.S. places. Track 502 cities with zoning reforms.
            Predict policy impact with research-grade causal inference.
            Make evidence-based housing policy decisions.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Search Your City
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn How It Works
              </Button>
            </a>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <Card key={stat.label} variant="elevated">
                <CardContent className="pt-6">
                  <stat.icon className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
