"use client";

import { useState } from "react";
import { Search, Filter, Download, Eye } from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@aibos/ui";
import { EmptyState } from "@/components/EmptyStates";
import { DEMO_AUDIT_EVENTS, isDemoMode } from "@/lib/demo-data";

/**
 * Audit Log Page
 * 
 * From GRCD-ADMIN-FRONTEND.md:
 * - Event log viewer
 * - Technical view toggle
 * - Date range filters
 */

const getMockAuditEvents = () => {
  return isDemoMode() ? DEMO_AUDIT_EVENTS : [];
};

// Keep original mock for reference
const _mockAuditEvents = [
  {
    id: "1",
    traceId: "tr_abc123def456",
    action: "user.invited",
    actorName: "John Doe",
    actorEmail: "john@acme.com",
    targetType: "user",
    targetId: "alice@acme.com",
    description: "Invited user alice@acme.com with role Member",
    timestamp: "2024-12-01T10:30:00Z",
    metadata: { role: "member", email: "alice@acme.com" },
  },
  {
    id: "2",
    traceId: "tr_xyz789ghi012",
    action: "payment.approved",
    actorName: "John Doe",
    actorEmail: "john@acme.com",
    targetType: "payment",
    targetId: "PR-2024-042",
    description: "Approved payment request PR-2024-042",
    timestamp: "2024-12-01T09:15:00Z",
    metadata: { amount: 5000, currency: "MYR" },
  },
  {
    id: "3",
    traceId: "tr_def456abc789",
    action: "organization.updated",
    actorName: "John Doe",
    actorEmail: "john@acme.com",
    targetType: "organization",
    targetId: "acme-corp",
    description: "Updated organization settings",
    timestamp: "2024-11-30T16:45:00Z",
    metadata: { fields: ["name", "address"] },
  },
  {
    id: "4",
    traceId: "tr_ghi012jkl345",
    action: "user.role_changed",
    actorName: "John Doe",
    actorEmail: "john@acme.com",
    targetType: "user",
    targetId: "bob@acme.com",
    description: "Changed role of bob@acme.com from Member to Viewer",
    timestamp: "2024-11-28T14:00:00Z",
    metadata: { oldRole: "member", newRole: "viewer" },
  },
  {
    id: "5",
    traceId: "tr_mno678pqr901",
    action: "user.deactivated",
    actorName: "Jane Smith",
    actorEmail: "jane@acme.com",
    targetType: "user",
    targetId: "charlie@acme.com",
    description: "Deactivated user charlie@acme.com",
    timestamp: "2024-11-25T11:30:00Z",
    metadata: { reason: "Left company" },
  },
];

const ACTION_COLORS: Record<string, string> = {
  "user.invited": "bg-info/10 text-info",
  "user.role_changed": "bg-warning/10 text-warning",
  "user.deactivated": "bg-danger/10 text-danger",
  "payment.approved": "bg-success/10 text-success",
  "payment.rejected": "bg-danger/10 text-danger",
  "organization.updated": "bg-primary-100 text-primary-700",
};

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showTechnical, setShowTechnical] = useState(false);

  const mockAuditEvents = getMockAuditEvents();
  const hasEvents = mockAuditEvents.length > 0;

  // Show empty state if no events
  if (!hasEvents) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Audit Log</h1>
            <p className="text-text-muted">Track all activity in your organization.</p>
          </div>
        </div>
        <EmptyState variant="audit" onAction={() => {}} />
      </div>
    );
  }

  const filteredEvents = mockAuditEvents.filter(
    (event) =>
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Audit Log</h1>
          <p className="text-text-muted">Track all activity in your organization.</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        <Button
          variant={showTechnical ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowTechnical(!showTechnical)}
        >
          <Eye className="h-4 w-4" />
          Technical View
        </Button>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            Showing {filteredEvents.length} events
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredEvents.map((event) => (
              <div key={event.id} className="p-4 hover:bg-background-subtle transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={ACTION_COLORS[event.action] || "bg-background-muted text-text"}>
                        {event.action.replace(".", " › ")}
                      </Badge>
                      <span className="text-sm text-text-muted">
                        by {event.actorName}
                      </span>
                    </div>
                    <p className="text-sm text-text">{event.description}</p>
                    
                    {/* Technical Details */}
                    {showTechnical && (
                      <div className="mt-2 rounded bg-background-muted p-2 text-xs font-mono text-text-muted">
                        <div>trace_id: {event.traceId}</div>
                        <div>target: {event.targetType}/{event.targetId}</div>
                        <div>metadata: {JSON.stringify(event.metadata)}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-text-muted whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-background-muted p-4">
                <Search className="h-8 w-8 text-text-subtle" />
              </div>
              <h3 className="font-medium text-text">No events found</h3>
              <p className="text-sm text-text-muted">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

