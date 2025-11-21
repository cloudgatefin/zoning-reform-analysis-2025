import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    Product: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Scenario Builder', href: '/scenario' },
      { label: 'Timeline', href: '/timeline' },
      { label: 'Site Map', href: '/sitemap' },
    ],
    Learn: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Methodology', href: '/about/methodology' },
      { label: 'Data Sources', href: '/about/data-sources' },
      { label: 'FAQ', href: '/about/faq' },
    ],
    Resources: [
      { label: 'API Documentation', href: '/docs/api' },
      { label: 'Data Download', href: '/data/download' },
      { label: 'Case Studies', href: '/resources/case-studies' },
      { label: 'Limitations', href: '/about/limitations' },
    ],
    Connect: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Twitter', href: 'https://twitter.com' },
      { label: 'Newsletter', href: '/newsletter' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo and description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-white">Zoning Reform</span>
            </Link>
            <p className="text-sm text-gray-400">
              The definitive platform for zoning reform intelligence and housing policy analysis.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Zoning Reform Analysis. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
