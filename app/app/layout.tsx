import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Zoning Reform Dashboard",
  description: "Analysis of zoning reform impact on housing permits across U.S. states",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
