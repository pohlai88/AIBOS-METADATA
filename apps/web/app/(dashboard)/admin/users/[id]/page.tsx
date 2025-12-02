"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Clock,
  Calendar,
  Mail,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  UserAvatar,
  RoleBadge,
  StatusBadge,
  Badge,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@aibos/ui";

/**
 * User Detail Page
 * 
 * From GRCD-ADMIN-FRONTEND.md:
 * - User profile with avatar
 * - Access Story Bar (🔒 Silent Killer)
 * - Recent activity timeline
 * - Role change dialog
 * - Deactivation with safety rails
 */

// Mock user data
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@acme.com",
  role: "org_admin" as const,
  status: "active",
  avatarUrl: null,
  joinedAt: "2024-01-15",
  lastActive: "2024-12-01T10:30:00Z",
  invitedBy: "System",
  permissions: ["manage_users", "manage_payments", "view_audit_log", "manage_organization"],
};

// Mock activity
const mockActivity = [
  {
    id: "1",
    action: "Approved payment request #PR-2024-042",
    timestamp: "2024-12-01T10:30:00Z",
    type: "payment",
  },
  {
    id: "2",
    action: "Invited user alice@acme.com",
    timestamp: "2024-11-28T14:15:00Z",
    type: "user",
  },
  {
    id: "3",
    action: "Updated organization settings",
    timestamp: "2024-11-25T09:00:00Z",
    type: "settings",
  },
  {
    id: "4",
    action: "Changed role of Bob Wilson to Viewer",
    timestamp: "2024-11-20T16:45:00Z",
    type: "user",
  },
];

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  // In real app, fetch user by ID
  const user = mockUser;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      {/* User Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-text">{user.name}</h1>
            <div className="flex items-center gap-2 text-text-muted">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <RoleBadge role={user.role} showTooltip />
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreHorizontal className="h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setChangeRoleOpen(true)}>
              <Shield className="mr-2 h-4 w-4" />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-danger"
              onClick={() => setDeactivateOpen(true)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Deactivate User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Access Story Bar - 🔒 Silent Killer Feature */}
      <Card className="border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary-600" />
            <div>
              <div className="font-medium text-text">
                {user.role === "org_admin"
                  ? "Full organization access"
                  : user.role === "member"
                  ? "Standard member access"
                  : "View-only access"}
              </div>
              <div className="text-sm text-text-muted">
                {user.permissions.length} permissions •{" "}
                {user.role === "org_admin"
                  ? "Can manage users, payments, and settings"
                  : user.role === "member"
                  ? "Can create and manage own requests"
                  : "Cannot make changes"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Joined</span>
              <span className="flex items-center gap-2 text-text">
                <Calendar className="h-4 w-4 text-text-muted" />
                {new Date(user.joinedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Last Active</span>
              <span className="flex items-center gap-2 text-text">
                <Clock className="h-4 w-4 text-text-muted" />
                {new Date(user.lastActive).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Invited By</span>
              <span className="text-text">{user.invitedBy}</span>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission) => (
                <Badge key={permission} variant="default">
                  {permission.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockActivity.map((activity, index) => (
              <div
                key={activity.id}
                className="relative flex gap-4 pb-4 last:pb-0"
              >
                {/* Timeline line */}
                {index < mockActivity.length - 1 && (
                  <div className="absolute left-[11px] top-6 h-full w-px bg-border" />
                )}
                {/* Dot */}
                <div className="relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full bg-primary-500" />
                {/* Content */}
                <div className="flex-1">
                  <p className="text-sm text-text">{activity.action}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={changeRoleOpen} onOpenChange={setChangeRoleOpen}>
        <ChangeRoleDialog
          user={user}
          onClose={() => setChangeRoleOpen(false)}
        />
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DeactivateUserDialog
          user={user}
          onClose={() => setDeactivateOpen(false)}
        />
      </Dialog>
    </div>
  );
}

function ChangeRoleDialog({
  user,
  onClose,
}: {
  user: typeof mockUser;
  onClose: () => void;
}) {
  const [newRole, setNewRole] = useState(user.role);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: API call
      await new Promise((r) => setTimeout(r, 1000));
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change Role</DialogTitle>
        <DialogDescription>
          Update the role for {user.name}. This will change their permissions.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Current Role</Label>
          <div>
            <RoleBadge role={user.role} showTooltip />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-role">New Role</Label>
          <select
            id="new-role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as typeof user.role)}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="org_admin">Organization Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={newRole === user.role || isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function DeactivateUserDialog({
  user,
  onClose,
}: {
  user: typeof mockUser;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canDeactivate = confirmText === user.email;

  const handleDeactivate = async () => {
    if (!canDeactivate) return;
    setIsLoading(true);
    try {
      // TODO: API call
      await new Promise((r) => setTimeout(r, 1000));
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-danger">Deactivate User</DialogTitle>
        <DialogDescription>
          This will prevent {user.name} from accessing the organization.
          They can be reactivated later.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Warning for admin */}
        {user.role === "org_admin" && (
          <div className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
            <strong>Warning:</strong> This user is an admin. Make sure another
            admin exists before deactivating.
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reason">Reason (optional)</Label>
          <Input
            id="reason"
            placeholder="e.g., Left the company"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Safety rail: type email to confirm */}
        <div className="space-y-2">
          <Label htmlFor="confirm">
            Type <span className="font-mono font-medium">{user.email}</span> to confirm
          </Label>
          <Input
            id="confirm"
            placeholder={user.email}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeactivate}
          disabled={!canDeactivate || isLoading}
        >
          {isLoading ? "Deactivating..." : "Deactivate User"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

