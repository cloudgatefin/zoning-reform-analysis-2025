import { MethodologyNav } from "@/components/about"

export const metadata = {
  title: "About | Zoning Reform Analysis",
  description: "Learn about our methodology, data sources, and limitations",
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container mx-auto max-w-6xl px-5 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <a href="/" className="text-[var(--accent-blue)] hover:underline">
            Home
          </a>
          <span className="text-[var(--text-muted)] mx-2">/</span>
          <span className="text-[var(--text-muted)]">About</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <MethodologyNav />

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
