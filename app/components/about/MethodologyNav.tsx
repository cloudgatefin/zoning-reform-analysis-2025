"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/about/methodology", label: "Methodology" },
  { href: "/about/data-sources", label: "Data Sources" },
  { href: "/about/limitations", label: "Limitations" },
  { href: "/about/faq", label: "FAQ" },
]

export function MethodologyNav() {
  const pathname = usePathname()

  return (
    <nav className="w-full lg:w-64 flex-shrink-0">
      <div className="lg:sticky lg:top-5">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          Documentation
        </h2>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--accent-blue)] text-white font-medium"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-soft)]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
