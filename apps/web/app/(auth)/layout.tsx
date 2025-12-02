import type { ReactNode } from "react";

/**
 * Auth Layout
 * 
 * Public routes: /auth/login, /auth/forgot-password, /auth/reset-password
 * Centered card layout with branding
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-subtle p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-success/5 blur-3xl" />
      </div>

      {/* Logo / Branding */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-text">
          <span className="text-gradient">AI-BOS</span>
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Business Operations Suite
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-text-subtle">
        © {new Date().getFullYear()} AI-BOS Platform. All rights reserved.
      </p>
    </div>
  );
}

