"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button, Badge } from "@aibos/ui";
import { isDemoMode, enableDemoMode, disableDemoMode } from "@/lib/demo-data";

/**
 * Demo Mode Toggle
 * 
 * Allows users to experience the full system with realistic data
 * Steve Jobs: "Show, don't tell"
 */
export function DemoModeToggle() {
  const [isDemo, setIsDemo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDemo(isDemoMode());
  }, []);

  const toggleDemo = () => {
    if (isDemo) {
      disableDemoMode();
      setIsDemo(false);
      window.location.reload(); // Reload to clear demo data
    } else {
      enableDemoMode();
      setIsDemo(true);
      window.location.reload(); // Reload to load demo data
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={toggleDemo}
        variant={isDemo ? "default" : "outline"}
        className="gap-2 shadow-overlay"
      >
        <Sparkles className="h-4 w-4" />
        {isDemo ? (
          <>
            Demo Mode <Badge variant="completed" className="ml-1">ON</Badge>
          </>
        ) : (
          "Try Demo"
        )}
      </Button>
      
      {isDemo && (
        <div className="mt-2 max-w-xs rounded-lg border border-primary-200 bg-primary-50 p-3 text-xs text-primary-900 shadow-floating dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-100">
          <strong>Demo Mode Active</strong>
          <p className="mt-1">
            You&apos;re viewing realistic data from Acme Corporation. All actions are simulated.
          </p>
        </div>
      )}
    </div>
  );
}

