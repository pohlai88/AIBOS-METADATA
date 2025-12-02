"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@aibos/ui";
import { Users, CreditCard, FileText, TrendingUp, Loader2 } from "lucide-react";

// Wired to real API
import { useCurrentUser, useUsers } from "@/lib/hooks";

/**
 * Dashboard Home Page
 *
 * WIRED TO REAL API:
 * - GET /me - Current user info
 * - GET /users - User count for stats
 */

export default function DashboardPage() {
  // Real API calls
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: usersData, isLoading: usersLoading } = useUsers();

  const isLoading = userLoading || usersLoading;

  // Calculate stats from real data
  const totalUsers = usersData?.total || 0;
  const adminCount =
    usersData?.users?.filter(
      (u) => u.role === "org_admin" || u.role === "platform_admin"
    ).length || 0;
  const memberCount = totalUsers - adminCount;

  const stats = [
    {
      title: "Total Users",
      value: isLoading ? "..." : totalUsers.toString(),
      description: isLoading
        ? "Loading..."
        : `${adminCount} admins, ${memberCount} members`,
      icon: Users,
      trend: "+2 this month",
    },
    {
      title: "Payment Requests",
      value: "12",
      description: "5 pending approval",
      icon: CreditCard,
      trend: "+8 this month",
    },
    {
      title: "Audit Events",
      value: "156",
      description: "Last 30 days",
      icon: FileText,
      trend: "Normal activity",
    },
  ];

  // Get user's display name
  const displayName = currentUser?.displayName || "User";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-text-muted">
          {userLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </span>
          ) : (
            `Welcome back, ${firstName}! Here's what's happening.`
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-text-muted">{stat.description}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-success">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              href="/admin/users"
              icon={Users}
              title="Invite User"
              description="Add team members"
            />
            <QuickAction
              href="/payments/new"
              icon={CreditCard}
              title="New Payment"
              description="Create request"
            />
            <QuickAction
              href="/admin/audit"
              icon={FileText}
              title="View Audit Log"
              description="See all activity"
            />
            <QuickAction
              href="/settings/profile"
              icon={TrendingUp}
              title="My Profile"
              description="Update settings"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-background-muted"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <div className="font-medium text-text">{title}</div>
        <div className="text-xs text-text-muted">{description}</div>
      </div>
    </a>
  );
}
