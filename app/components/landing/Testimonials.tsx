import { Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      title: 'Planning Director, Portland, OR',
      quote: 'This tool gave us the evidence we needed to support our ADU reform. Council loved the data showing results from similar cities.',
      initials: 'SJ',
    },
    {
      name: 'Michael Chen',
      title: 'City Council Member, Austin, TX',
      quote: 'I used the causal analysis to understand the real impact of parking reform. Much more convincing than just showing trends.',
      initials: 'MC',
    },
    {
      name: 'Dr. Lisa Martinez',
      title: 'Housing Researcher, UC Berkeley',
      quote: 'Finally, a tool that uses rigorous causal inference methods at place-level scale. This is research-grade.',
      initials: 'LM',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Policymakers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how planning professionals use our platform to make better decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm"
            >
              <Quote className="h-8 w-8 text-blue-200 mb-4" />
              <p className="text-gray-700 italic mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">{testimonial.initials}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
