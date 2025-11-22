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
      { label: 'Settings', href: '/settings' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Newsletter', href: '/newsletter' },
    ],
  };

  return (
    <footer className="bg-bg-secondary dark:bg-bg-card text-text-secondary py-16">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo and description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-6 w-6 text-accent-current" />
              <span className="font-bold text-text-primary">Zoning Reform</span>
            </Link>
            <p className="text-sm text-text-muted">
              The definitive platform for zoning reform intelligence and housing policy analysis.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-text-primary mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-text-primary transition-colors"
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
        <div className="border-t border-border-default pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Zoning Reform Analysis. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/privacy" className="hover:text-text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
