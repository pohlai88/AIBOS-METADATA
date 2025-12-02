/**
 * ActivityFeed - Phase 4
 *
 * Real-time feed of metadata governance activities.
 * Shows what's happening across the organization.
 *
 * Philosophy: "Transparency builds trust."
 */

"use client";

import { cn } from "@aibos/ui";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CheckCircle,
  XCircle,
  FileText,
  GitBranch,
  Sparkles,
  User,
  Shield,
  Edit,
  Plus,
  Clock,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  type:
    | "field-created"
    | "field-updated"
    | "approval-approved"
    | "approval-rejected"
    | "lineage-added"
    | "ai-suggestion"
    | "compliance-check"
    | "tier-changed";
  actor: {
    name: string;
    initials: string;
    role?: string;
  };
  subject: string; // e.g., field name
  action: string; // Human-readable action
  timestamp: string;
  metadata?: Record<string, string>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

const typeConfig = {
  "field-created": {
    icon: Plus,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  "field-updated": {
    icon: Edit,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  "approval-approved": {
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  "approval-rejected": {
    icon: XCircle,
    color: "text-danger",
    bgColor: "bg-danger/10",
  },
  "lineage-added": {
    icon: GitBranch,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  "ai-suggestion": {
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  "compliance-check": {
    icon: Shield,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  "tier-changed": {
    icon: FileText,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
};

export function ActivityFeed({
  activities,
  maxItems = 10,
  className,
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  if (activities.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border-base bg-bg-subtle p-6 text-center", className)}>
        <Clock className="mx-auto h-12 w-12 text-text-muted mb-3" />
        <p className="text-sm text-text-muted">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {displayedActivities.map((activity, idx) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          isLast={idx === displayedActivities.length - 1}
        />
      ))}
      {activities.length > maxItems && (
        <div className="px-4 py-2 text-center">
          <button className="text-xs text-primary hover:underline">
            View {activities.length - maxItems} more activities
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Activity Item
 */
function ActivityItem({
  activity,
  isLast,
}: {
  activity: ActivityItem;
  isLast: boolean;
}) {
  const config = typeConfig[activity.type];
  const Icon = config.icon;

  return (
    <div className="relative flex gap-3 px-4 py-3 hover:bg-bg-hover">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[30px] top-[44px] h-full w-[2px] bg-border-base" />
      )}

      {/* Icon */}
      <div className={cn("relative z-10 rounded-full p-2", config.bgColor)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-base">
              <span className="font-medium">{activity.actor.name}</span>{" "}
              <span className="text-text-muted">{activity.action}</span>{" "}
              <span className="font-mono font-medium">{activity.subject}</span>
            </p>
            {activity.actor.role && (
              <p className="mt-0.5 text-xs text-text-muted">
                {activity.actor.role}
              </p>
            )}
            {activity.metadata && (
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-[10px]">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <span className="flex-shrink-0 text-xs text-text-muted">
            {activity.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}

