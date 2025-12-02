"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

/**
 * Badge Component
 * 
 * Status variants from GRCD-ADMIN-FRONTEND.md
 * Role variants for user management
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-background-muted text-text",
        // Status variants (Payment Cycle)
        draft: "bg-background-muted text-text-muted",
        review: "bg-info/10 text-info",
        approved: "bg-success/10 text-success",
        awaiting: "bg-warning/10 text-warning",
        completed: "bg-success/20 text-success",
        rejected: "bg-danger/10 text-danger",
        // User status variants
        active: "bg-success/10 text-success",
        inactive: "bg-background-muted text-text-muted",
        invited: "bg-info/10 text-info",
        locked: "bg-danger/10 text-danger",
        // Role variants (from GRCD)
        platform_admin: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
        org_admin: "bg-info/10 text-info",
        member: "bg-success/10 text-success",
        viewer: "bg-background-muted text-text-muted",
        // Tier variants
        tier_1: "bg-tier-1/10 text-tier-1",
        tier_2: "bg-tier-2/10 text-tier-2",
        tier_3: "bg-tier-3/10 text-tier-3",
        tier_4: "bg-tier-4/10 text-tier-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Role badge with tooltip text (from GRCD)
const ROLE_TOOLTIPS: Record<string, string> = {
  platform_admin: "Manages all tenants and global settings.",
  org_admin: "Manages this organization and its users.",
  member: "Works inside this organization's apps.",
  viewer: "Can only view data, not change it.",
};

const ROLE_LABELS: Record<string, string> = {
  platform_admin: "Platform Admin",
  org_admin: "Org Admin",
  member: "Member",
  viewer: "Viewer",
};

interface RoleBadgeProps {
  role: "platform_admin" | "org_admin" | "member" | "viewer";
  showTooltip?: boolean;
}

function RoleBadge({ role, showTooltip = false }: RoleBadgeProps) {
  const badge = (
    <Badge variant={role}>
      {ROLE_LABELS[role] || role}
    </Badge>
  );

  if (showTooltip) {
    return (
      <span title={ROLE_TOOLTIPS[role]} className="cursor-help">
        {badge}
      </span>
    );
  }

  return badge;
}

// Status badge
const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  invited: "Invited",
  locked: "Locked",
  draft: "Draft",
  review: "Under Review",
  approved: "Approved",
  awaiting: "Awaiting Slip",
  completed: "Completed",
  rejected: "Rejected",
};

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const variant = status.toLowerCase().replace(/[^a-z]/g, "_") as BadgeProps["variant"];
  return (
    <Badge variant={variant}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}

export { Badge, badgeVariants, RoleBadge, StatusBadge };

