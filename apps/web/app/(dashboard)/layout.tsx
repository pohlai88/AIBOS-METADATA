"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  Settings,
  FileText,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  cn,
  Button,
  UserAvatar,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@aibos/ui";
import { DemoModeToggle } from "@/components/DemoModeToggle";

/**
 * Dashboard Layout
 * 
 * Protected routes with:
 * - Top navigation (logo, tenant switcher, user menu)
 * - Side navigation (context-aware menu items)
 */

// Navigation items per section
const adminNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Organization",
    href: "/admin/organization",
    icon: Building2,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Audit Log",
    href: "/admin/audit",
    icon: FileText,
  },
];

const appNavItems = [
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
];

const settingsNavItems = [
  {
    title: "My Profile",
    href: "/settings/profile",
    icon: Settings,
  },
];

// Mock user data - replace with actual auth context
const mockUser = {
  name: "John Doe",
  email: "john@acme.com",
  avatarUrl: null,
  role: "org_admin" as const,
};

// Mock tenant data
const mockTenants = [
  { id: "1", name: "Acme Corp" },
  { id: "2", name: "Beta Inc" },
];

const mockCurrentTenant = mockTenants[0];

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  isActive: boolean;
}

function NavLink({ href, icon: Icon, title, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary-600 text-white"
          : "text-text-muted hover:bg-background-muted hover:text-text"
      )}
    >
      <Icon className="h-4 w-4" />
      {title}
    </Link>
  );
}

function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full w-64 flex-col border-r border-border bg-background", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gradient">AI-BOS</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Admin Section */}
        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Administration
          </h3>
          <div className="space-y-1">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
              />
            ))}
          </div>
        </div>

        {/* Apps Section */}
        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Applications
          </h3>
          <div className="space-y-1">
            {appNavItems.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
              />
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Settings
          </h3>
          <div className="space-y-1">
            {settingsNavItems.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}

function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-text-muted hover:bg-background-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Tenant Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <Building2 className="h-4 w-4 text-text-muted" />
            <span className="font-medium">{mockCurrentTenant.name}</span>
            <ChevronDown className="h-4 w-4 text-text-muted" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {mockTenants.map((tenant) => (
            <DropdownMenuItem key={tenant.id}>
              <Building2 className="mr-2 h-4 w-4" />
              {tenant.name}
              {tenant.id === mockCurrentTenant.id && (
                <span className="ml-auto text-xs text-text-muted">Current</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <UserAvatar name={mockUser.name} avatarUrl={mockUser.avatarUrl} size="sm" />
            <span className="hidden font-medium md:inline">{mockUser.name}</span>
            <ChevronDown className="h-4 w-4 text-text-muted" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{mockUser.name}</span>
              <span className="text-xs font-normal text-text-muted">{mockUser.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings/profile">
              <Settings className="mr-2 h-4 w-4" />
              My Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-danger">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background-subtle">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col">
            <Sidebar />
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-text-muted hover:bg-background-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Demo Mode Toggle */}
      <DemoModeToggle />
    </div>
  );
}

