import type { Metadata } from "next";
import "../styles/globals.css";

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
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
