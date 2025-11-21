import { Search, TrendingUp, BarChart2, Sliders, FileText, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Search,
      title: 'Search Your City',
      description: 'Find your jurisdiction in 24,535+ searchable places. Instant results.',
    },
    {
      number: 2,
      icon: TrendingUp,
      title: 'Explore Trends',
      description: 'View 10 years of permit data. See your growth rate vs. peers.',
    },
    {
      number: 3,
      icon: BarChart2,
      title: 'Analyze Reforms',
      description: 'See how 502 other cities affected housing with zoning reforms.',
    },
    {
      number: 4,
      icon: Sliders,
      title: 'Model Scenarios',
      description: 'Predict impact of reforms. Test different policies before adopting.',
    },
    {
      number: 5,
      icon: FileText,
      title: 'Generate Report',
      description: 'Export custom PDF/PowerPoint for city council presentations.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From search to presentation in five simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop: Horizontal flow */}
          <div className="hidden lg:flex items-start justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start flex-1">
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 px-2">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-gray-400 mt-5 mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Mobile/Tablet: Vertical flow */}
          <div className="lg:hidden space-y-8">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
