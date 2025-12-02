"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Building2 } from "lucide-react";
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
} from "@aibos/ui";

/**
 * Organization Settings Page
 * 
 * From GRCD-ADMIN-FRONTEND.md:
 * - Organization profile editor
 * - Logo upload
 * - Last updated by display
 */

const organizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  contactEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

// Mock data - replace with API call
const mockOrganization = {
  id: "1",
  name: "Acme Corporation",
  slug: "acme-corp",
  contactEmail: "admin@acme.com",
  website: "https://acme.com",
  address: "123 Business St, Tech City, TC 12345",
  logoUrl: null,
  updatedAt: new Date().toISOString(),
  updatedBy: {
    name: "John Doe",
    email: "john@acme.com",
  },
};

export default function OrganizationSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: mockOrganization.name,
      slug: mockOrganization.slug,
      contactEmail: mockOrganization.contactEmail,
      website: mockOrganization.website,
      address: mockOrganization.address,
    },
  });

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true);
    setIsSaved(false);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Saving organization:", data);
      setIsSaved(true);
      reset(data); // Reset form state to new values
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Organization Settings</h1>
        <p className="text-text-muted">Manage your organization&apos;s profile and settings.</p>
      </div>

      {/* Organization Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Profile
            </CardTitle>
            <CardDescription>
              Basic information about your organization.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Message */}
            {isSaved && (
              <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
                Organization settings saved successfully!
              </div>
            )}

            {/* Logo Upload Placeholder */}
            <div className="space-y-2">
              <Label>Organization Logo</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border bg-background-muted">
                  <Building2 className="h-8 w-8 text-text-subtle" />
                </div>
                <div>
                  <Button type="button" variant="outline" size="sm">
                    Upload Logo
                  </Button>
                  <p className="mt-1 text-xs text-text-muted">
                    PNG, JPG up to 2MB. Recommended: 200×200px
                  </p>
                </div>
              </div>
            </div>

            {/* Name & Slug */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  placeholder="Acme Corporation"
                  {...register("name")}
                  error={errors.name?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  placeholder="acme-corp"
                  {...register("slug")}
                  error={errors.slug?.message}
                />
                <p className="text-xs text-text-subtle">
                  app.aibos.com/<span className="font-medium">{mockOrganization.slug}</span>
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="admin@company.com"
                  {...register("contactEmail")}
                  error={errors.contactEmail?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://company.com"
                  {...register("website")}
                  error={errors.website?.message}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Business St, City, Country"
                {...register("address")}
                error={errors.address?.message}
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-border pt-6">
            {/* Last Updated Info */}
            <div className="text-sm text-text-muted">
              Last updated by{" "}
              <span className="font-medium text-text">{mockOrganization.updatedBy.name}</span>
              {" · "}
              {new Date(mockOrganization.updatedAt).toLocaleDateString()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={!isDirty || isLoading}
              >
                Reset
              </Button>
              <Button type="submit" disabled={!isDirty || isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

