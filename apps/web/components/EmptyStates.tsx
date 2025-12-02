/**
 * Empty States - Steve Jobs Philosophy
 * 
 * "Design is not just what it looks like and feels like.
 *  Design is how it works." - Steve Jobs
 * 
 * Empty states are NOT placeholders.
 * They are opportunities to:
 * 1. Educate users about the feature
 * 2. Guide them to take meaningful action
 * 3. Show the vision of what's possible
 */

import { Button } from "@aibos/ui";
import {
  Users,
  CreditCard,
  Shield,
  Building2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface EmptyStateProps {
  variant: "users" | "payments" | "organization" | "audit";
  onAction?: () => void;
}

export function EmptyState({ variant, onAction }: EmptyStateProps) {
  const states = {
    users: {
      icon: Users,
      gradient: "from-sky-500 to-blue-600",
      title: "Build Your Team",
      subtitle: "Great things are never done by one person",
      description:
        "Invite your team members to collaborate on payments, approvals, and financial operations. Each member gets role-based access tailored to their responsibilities.",
      action: "Invite Your First Team Member",
      features: [
        "Role-based access control",
        "Secure invite system",
        "Activity tracking",
      ],
    },
    payments: {
      icon: CreditCard,
      gradient: "from-emerald-500 to-teal-600",
      title: "Streamline Your Payments",
      subtitle: "From request to disbursement, all in one place",
      description:
        "Create payment requests with full audit trails. Route through approval chains. Track disbursements and upload payment slips - all with complete traceability.",
      action: "Create Your First Payment Request",
      features: [
        "Multi-level approvals",
        "Full audit trail",
        "Document attachments",
      ],
    },
    organization: {
      icon: Building2,
      gradient: "from-purple-500 to-pink-600",
      title: "Set Up Your Organization",
      subtitle: "Make it your own",
      description:
        "Customize your organization profile, upload your logo, and configure settings. This is your digital headquarters.",
      action: "Complete Organization Setup",
      features: [
        "Custom branding",
        "Multi-tenant support",
        "Compliance ready",
      ],
    },
    audit: {
      icon: Shield,
      gradient: "from-amber-500 to-orange-600",
      title: "Complete Visibility",
      subtitle: "Every action, tracked and traceable",
      description:
        "Once your team starts working, you'll see a complete audit trail here. Every user action, every approval, every change - all tracked with trace IDs for compliance.",
      action: "Learn About Audit Trails",
      features: [
        "Immutable logs",
        "Trace ID tracking",
        "Compliance exports",
      ],
    },
  };

  const state = states[variant];
  const Icon = state.icon;

  return (
    <div className="flex min-h-[500px] items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        {/* Animated Icon */}
        <div className="relative mx-auto mb-8 h-32 w-32">
          {/* Gradient background glow */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${state.gradient} opacity-20 blur-2xl animate-pulse-glow`}
          />
          {/* Icon container */}
          <div
            className={`relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${state.gradient} shadow-floating`}
          >
            <Icon className="h-16 w-16 text-white" />
          </div>
          {/* Sparkle indicator */}
          <div className="absolute -right-2 -top-2 rounded-full bg-white p-2 shadow-floating dark:bg-background">
            <Sparkles className="h-4 w-4 text-warning animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <h2 className="mb-2 text-3xl font-bold text-text">{state.title}</h2>
        <p className="mb-4 text-lg font-medium text-primary-600">
          {state.subtitle}
        </p>
        <p className="mb-8 text-base leading-relaxed text-text-muted">
          {state.description}
        </p>

        {/* Features */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          {state.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-full bg-background-muted px-4 py-2 text-sm font-medium text-text"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-success" />
              {feature}
            </div>
          ))}
        </div>

        {/* CTA */}
        {onAction && (
          <Button onClick={onAction} size="lg" className="gap-2">
            {state.action}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Search Empty State
 * When filters return no results
 */
interface SearchEmptyProps {
  searchQuery: string;
  onClear: () => void;
}

export function SearchEmpty({ searchQuery, onClear }: SearchEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-background-muted p-6">
        <div className="text-6xl">🔍</div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text">
        No results for &quot;{searchQuery}&quot;
      </h3>
      <p className="mb-6 max-w-sm text-sm text-text-muted">
        We couldn&apos;t find anything matching your search. Try adjusting your
        filters or search terms.
      </p>
      <Button onClick={onClear} variant="outline">
        Clear Search
      </Button>
    </div>
  );
}

/**
 * Loading State with Personality
 */
export function LoadingState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-4 h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-background-muted" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
      <p className="text-sm font-medium text-text-muted">
        {message || "Loading your data..."}
      </p>
    </div>
  );
}

