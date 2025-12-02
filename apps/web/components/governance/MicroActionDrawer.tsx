/**
 * MicroActionDrawer - Phase 3
 *
 * "Silent Killer" pattern: Tiny actions, zero friction.
 * Instead of modals or full pages, quick actions slide in from the side.
 *
 * Philosophy: "Every click should feel like magic, not work."
 */

"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@aibos/ui";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import * as Portal from "@radix-ui/react-portal";

export interface MicroActionDrawerProps {
  /**
   * Drawer open state
   */
  open: boolean;

  /**
   * Callback when drawer should close
   */
  onClose: () => void;

  /**
   * Drawer title
   */
  title: string;

  /**
   * Drawer content
   */
  children: ReactNode;

  /**
   * Footer actions (e.g., Submit, Cancel buttons)
   */
  footer?: ReactNode;

  /**
   * Size of the drawer
   */
  size?: "sm" | "md" | "lg";

  /**
   * Custom className
   */
  className?: string;
}

const sizeClasses = {
  sm: "w-[360px]",
  md: "w-[480px]",
  lg: "w-[600px]",
};

export function MicroActionDrawer({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className,
}: MicroActionDrawerProps) {
  return (
    <Portal.Root>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full transform bg-bg-base shadow-2xl transition-transform",
          sizeClasses[size],
          open ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-base px-6 py-4">
          <h2 className="text-lg font-semibold text-text-base">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ height: "calc(100% - 140px)" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-border-base bg-bg-subtle px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </Portal.Root>
  );
}

/**
 * Hook to manage drawer state
 */
export function useMicroActionDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}

