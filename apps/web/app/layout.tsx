import type { Metadata } from "next";
import "./globals.css"; // Safe mode - always loads first (fallback)
import "@aibos/ui/design/globals.css"; // Full design system - loads if available (enhancement)

export const metadata: Metadata = {
  title: "AI-BOS Platform",
  description: "AI-BOS Platform",
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
