import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 bg-blue-600">
      <div className="container mx-auto max-w-7xl px-5 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Make Evidence-Based Housing Policy?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join hundreds of policymakers using data to improve housing outcomes in their communities.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
        >
          Explore Your City Now
          <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="text-blue-200 mt-4 text-sm">
          No registration required. Free to use.
        </p>
      </div>
    </section>
  );
}
