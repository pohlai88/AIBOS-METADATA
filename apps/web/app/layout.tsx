import type { ReactNode } from "react";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@aibos/ui";
import { initializeSDK } from "../lib/sdk-guard";
import "@aibos/ui/design/globals.css";

// Initialize Controlled Vocabulary SDK on app startup
// This checks version compatibility and prevents deployment mismatches
initializeSDK();

export const metadata: Metadata = {
  title: "AIBOS Metadata Studio",
  description: "Lightweight metadata management for business operations",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultTheme="system">
          {children}
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
