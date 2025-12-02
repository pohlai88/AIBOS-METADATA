"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Lock, Globe, Shield } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  UserAvatar,
  RoleBadge,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@aibos/ui";

/**
 * Profile Settings Page
 * 
 * From GRCD-ADMIN-FRONTEND.md:
 * - Personal info editor
 * - Locale/timezone preferences
 * - Password change form
 * - Access Story Bar (user-facing)
 */

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// Mock user data
const mockUser = {
  id: "1",
  displayName: "John Doe",
  email: "john@acme.com",
  avatarUrl: null,
  role: "org_admin" as const,
  locale: "en-US",
  timezone: "Asia/Kuala_Lumpur",
  permissions: ["manage_users", "manage_payments", "view_audit_log"],
  memberships: [
    { tenantName: "Acme Corp", role: "org_admin" as const },
    { tenantName: "Beta Inc", role: "member" as const },
  ],
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">My Profile</h1>
        <p className="text-text-muted">Manage your account settings and preferences.</p>
      </div>

      {/* Access Story Bar - User-facing 🔒 Silent Killer */}
      <Card className="border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary-600" />
            <div>
              <div className="font-medium text-text">Your Access</div>
              <div className="text-sm text-text-muted">
                {mockUser.memberships.length} organization
                {mockUser.memberships.length > 1 ? "s" : ""} •{" "}
                {mockUser.permissions.length} permissions
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {mockUser.memberships.map((m) => (
              <Badge key={m.tenantName} variant="default">
                {m.tenantName}: <RoleBadge role={m.role} />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Globe className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="preferences">
          <PreferencesForm />
        </TabsContent>
        <TabsContent value="security">
          <SecurityForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: mockUser.displayName,
      email: mockUser.email,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setIsSaved(false);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      console.log("Saving profile:", data);
      setIsSaved(true);
      reset(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isSaved && (
            <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
              Profile saved successfully!
            </div>
          )}

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <UserAvatar
              name={mockUser.displayName}
              avatarUrl={mockUser.avatarUrl}
              size="lg"
            />
            <div>
              <Button type="button" variant="outline" size="sm">
                Change Avatar
              </Button>
              <p className="mt-1 text-xs text-text-muted">
                JPG, PNG. Max 2MB.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                {...register("displayName")}
                error={errors.displayName?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={!isDirty}
          >
            Reset
          </Button>
          <Button type="submit" disabled={!isDirty || isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function PreferencesForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [locale, setLocale] = useState(mockUser.locale);
  const [timezone, setTimezone] = useState(mockUser.timezone);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      console.log("Saving preferences:", { locale, timezone });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your experience.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="locale">Language & Region</Label>
          <select
            id="locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="ms-MY">Bahasa Malaysia</option>
            <option value="zh-CN">中文 (简体)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="Asia/Kuala_Lumpur">Malaysia (GMT+8)</option>
            <option value="Asia/Singapore">Singapore (GMT+8)</option>
            <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
            <option value="America/New_York">New York (EST)</option>
            <option value="Europe/London">London (GMT)</option>
          </select>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t border-border pt-6">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
}

function SecurityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setIsSuccess(false);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      console.log("Changing password");
      setIsSuccess(true);
      reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuccess && (
            <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
              Password changed successfully!
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              error={errors.currentPassword?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              error={errors.newPassword?.message}
            />
            <p className="text-xs text-text-subtle">
              At least 8 characters with uppercase, lowercase, and number.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t border-border pt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

