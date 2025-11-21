import { Building2, Landmark, Microscope } from 'lucide-react';

export default function TargetUsers() {
  const users = [
    {
      icon: Building2,
      title: 'City Planning Staff',
      quote: 'Evaluate reform options. Show council what worked in other cities.',
      benefits: [
        'Reform impact analysis',
        'Peer city comparisons',
        'Custom reports for council',
      ],
    },
    {
      icon: Landmark,
      title: 'City Council Members',
      quote: 'Make informed policy decisions. See evidence of what works.',
      benefits: [
        'Clear, actionable insights',
        'Evidence-based arguments',
        'Downloadable presentations',
      ],
    },
    {
      icon: Microscope,
      title: 'Researchers & Advocates',
      quote: 'Conduct rigorous analysis. Support policy campaigns with data.',
      benefits: [
        'Research-grade methods',
        'API & bulk data access',
        'Academic documentation',
      ],
    },
  ];

  return (
    <section id="users" className="py-20 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built for Housing Policymakers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you&apos;re planning, legislating, or advocating, we have the tools you need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {users.map((user) => (
            <div
              key={user.title}
              className="bg-gray-50 rounded-xl p-8 border border-gray-200"
            >
              <user.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">{user.title}</h3>
              <p className="text-gray-600 italic mb-6">&ldquo;{user.quote}&rdquo;</p>
              <ul className="space-y-2">
                {user.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
