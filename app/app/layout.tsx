import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import MobileNavigation from "../components/mobile/MobileNavigation";

export const metadata: Metadata = {
  title: "Zoning Reform Analysis - Evidence-Based Housing Policy Intelligence",
  description: "Analyze 24,535+ U.S. places. Track 502 cities with zoning reforms. Predict policy impact with research-grade causal inference. Make evidence-based housing policy decisions.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zoning Reform",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Zoning Reform Analysis - Evidence-Based Housing Policy Intelligence",
    description: "The definitive platform for zoning reform intelligence. Analyze 24,535+ places, track 502 reform cities, and predict policy impact.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#2563eb",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased pb-bottom-nav">
        {children}
        <MobileNavigation />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(function(registration) {
                      console.log('SW registered:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('SW registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
