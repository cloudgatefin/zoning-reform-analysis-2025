import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Zoning Reform Analysis - Evidence-Based Housing Policy Intelligence",
  description: "Analyze 24,535+ U.S. places. Track 502 cities with zoning reforms. Predict policy impact with research-grade causal inference. Make evidence-based housing policy decisions.",
  openGraph: {
    title: "Zoning Reform Analysis - Evidence-Based Housing Policy Intelligence",
    description: "The definitive platform for zoning reform intelligence. Analyze 24,535+ places, track 502 reform cities, and predict policy impact.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var prefs = JSON.parse(localStorage.getItem('zoning-theme-preference') || '{}');
                  var theme = prefs.theme || 'system';
                  var resolved = theme;
                  if (theme === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(resolved);
                  if (prefs.highContrast) {
                    document.documentElement.classList.add('high-contrast');
                  }
                  if (prefs.accentColor) {
                    document.documentElement.setAttribute('data-accent', prefs.accentColor);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
