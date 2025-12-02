/**
 * Layout Components - Temporary compatibility wrapper
 * 
 * This provides backward compatibility with old imports.
 */

import type { ReactNode } from "react";

export function CenteredContent({ 
  children, 
  maxWidth = "2xl", 
  padding = 8 
}: { 
  children: ReactNode; 
  maxWidth?: string; 
  padding?: number;
}) {
  const maxWidthClasses = {
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
  };
  
  return (
    <div className={`container mx-auto ${maxWidthClasses[maxWidth as keyof typeof maxWidthClasses] || maxWidthClasses["2xl"]} px-${padding}`}>
      {children}
    </div>
  );
}

export function GridLayout({ 
  children, 
  cols = 2 
}: { 
  children: ReactNode; 
  cols?: number;
}) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
  };
  
  return (
    <div className={`grid gap-6 ${colClasses[cols as keyof typeof colClasses] || colClasses[2]}`}>
      {children}
    </div>
  );
}

