"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Mail } from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  UserAvatar,
  RoleBadge,
  StatusBadge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@aibos/ui";

/**
 * User Directory Page
 *
 * From GRCD-ADMIN-FRONTEND.md:
 * - Job-based lanes: All | Active | Admins | Inactive
 * - User table with status/role badges
 * - Invite user modal
 * - Action menu per user
 */

import { DEMO_USERS, isDemoMode } from "@/lib/demo-data";
import { EmptyState, SearchEmpty } from "@/components/EmptyStates";

// User role type
type UserRole = "platform_admin" | "org_admin" | "member" | "viewer";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  avatarUrl: string | null;
  joinedAt: string;
  lastActive: string | null;
  title?: string;
  bio?: string;
};

// Use demo data if in demo mode, otherwise empty
const getMockUsers = (): User[] => {
  if (isDemoMode()) {
    return DEMO_USERS.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      avatarUrl: u.avatarUrl,
      joinedAt: u.joinedAt,
      lastActive: u.lastActive,
      title: u.title,
      bio: u.bio,
    }));
  }
  return []; // Empty by default - show beautiful empty state
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const mockUsers = getMockUsers();
  const hasUsers = mockUsers.length > 0;

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeUsers = filteredUsers.filter((u) => u.status === "active");
  const adminUsers = filteredUsers.filter(
    (u) => u.role === "org_admin" || u.role === "platform_admin"
  );
  const inactiveUsers = filteredUsers.filter(
    (u) => u.status === "inactive" || u.status === "invited"
  );

  // Show empty state if no users at all
  if (!hasUsers) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Users</h1>
            <p className="text-text-muted">
              Manage your organization&apos;s team members.
            </p>
          </div>
        </div>
        <EmptyState
          variant="users"
          onAction={() => setInviteDialogOpen(true)}
        />
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <InviteUserDialog onClose={() => setInviteDialogOpen(false)} />
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Users</h1>
          <p className="text-text-muted">
            Manage your organization&apos;s team members.
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <InviteUserDialog onClose={() => setInviteDialogOpen(false)} />
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs with User Lanes */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All{" "}
            <Badge variant="default" className="ml-2">
              {filteredUsers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active{" "}
            <Badge variant="active" className="ml-2">
              {activeUsers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="admins">
            Admins{" "}
            <Badge variant="org_admin" className="ml-2">
              {adminUsers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive{" "}
            <Badge variant="inactive" className="ml-2">
              {inactiveUsers.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <UserTable
            users={filteredUsers}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
          />
        </TabsContent>
        <TabsContent value="active">
          <UserTable users={activeUsers} />
        </TabsContent>
        <TabsContent value="admins">
          <UserTable users={adminUsers} />
        </TabsContent>
        <TabsContent value="inactive">
          <UserTable users={inactiveUsers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserTable({
  users,
  searchQuery,
  onClearSearch,
}: {
  users: User[];
  searchQuery?: string;
  onClearSearch?: () => void;
}) {
  if (users.length === 0 && searchQuery) {
    return (
      <Card>
        <SearchEmpty
          searchQuery={searchQuery}
          onClear={onClearSearch || (() => {})}
        />
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mb-4 text-6xl">👥</div>
          <h3 className="mb-2 font-medium text-text">
            No users in this category
          </h3>
          <p className="text-sm text-text-muted">
            Users will appear here as they join your organization.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-sm text-text-muted">
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Last Active</th>
              <th className="p-4 font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border last:border-0 hover:bg-background-subtle transition-colors"
              >
                <td className="p-4">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="flex items-center gap-3"
                  >
                    <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
                    <div>
                      <div className="font-medium text-text hover:text-primary-600">
                        {user.name}
                      </div>
                      <div className="text-sm text-text-muted">
                        {user.email}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="p-4">
                  <RoleBadge role={user.role} showTooltip />
                </td>
                <td className="p-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="p-4 text-sm text-text-muted">
                  {user.lastActive
                    ? new Date(user.lastActive).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === "active" ? (
                        <DropdownMenuItem className="text-danger">
                          Deactivate User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-success">
                          Reactivate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function InviteUserDialog({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const handleInvite = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Inviting:", { email, role });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Invite User
        </DialogTitle>
        <DialogDescription>
          Send an invitation to join your organization.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email Address</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invite-role">Role</Label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-raised transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="member">Member</option>
            <option value="org_admin">Organization Admin</option>
            <option value="viewer">Viewer (Read-only)</option>
          </select>
          <p className="text-xs text-text-muted">
            {role === "member" && "Can create and manage their own requests."}
            {role === "org_admin" &&
              "Can manage all users and organization settings."}
            {role === "viewer" && "Can only view data, cannot make changes."}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleInvite} disabled={!email || isLoading}>
          {isLoading ? "Sending..." : "Send Invitation"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
