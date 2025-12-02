"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button, Input, Label } from "@aibos/ui";
import { useAcceptInvite } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Boxed Glass Accept Invite Page
 *
 * Glassmorphism design with gradient blur background
 */

const acceptInviteSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const acceptInviteMutation = useAcceptInvite();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
  });

  const onSubmit = async (data: AcceptInviteFormData) => {
    if (!token) return;
    acceptInviteMutation.mutate({
      token,
      password: data.password,
      name: data.name,
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full min-w-80 flex-col bg-background">
      <main className="flex max-w-full flex-auto flex-col">
        <div className="relative container mx-auto min-h-dvh overflow-hidden px-4 py-16 lg:px-8 lg:py-24 xl:max-w-6xl">
          {/* Logo */}
          <div className="mb-12 text-center animate-fade-in">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-xl font-bold text-text hover:opacity-75"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 transition-transform group-hover:scale-105">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span>AI-BOS</span>
            </Link>
          </div>

          {/* No Token Error */}
          {!token ? (
            <div className="mx-auto max-w-md text-center animate-fade-in">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
                <AlertTriangle className="h-8 w-8 text-danger" />
              </div>
              <h1 className="mb-4 text-3xl font-black text-text">
                Invalid Link
              </h1>
              <p className="text-text-muted mb-8">
                This invitation link is invalid or has expired. Please contact
                your administrator for a new invitation.
              </p>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="h-12 px-8 rounded-full font-semibold"
                >
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : acceptInviteMutation.isSuccess ? (
            /* Success State */
            <div className="mx-auto max-w-md text-center animate-fade-in">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h1 className="mb-4 text-3xl font-black text-text">
                Welcome aboard!
              </h1>
              <p className="text-text-muted mb-8">
                Your account has been created successfully. You can now sign in
                and start exploring.
              </p>
              <Link href="/login?invited=success">
                <Button
                  className={cn(
                    "h-12 px-8 rounded-full font-semibold",
                    "bg-text text-background hover:bg-text/90",
                    "dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  )}
                >
                  Sign in to continue
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mx-auto max-w-3xl text-center animate-fade-in">
                <div className="mb-5 flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background-muted py-1.5 pr-3 pl-1.5 text-sm font-medium text-text-muted">
                    <span className="inline-flex items-center justify-center rounded-full bg-success px-2 py-1 text-xs leading-none font-medium text-white">
                      Invited
                    </span>
                    <span>You&apos;ve been invited to join</span>
                  </div>
                </div>
                <h1 className="mb-4 text-4xl font-black text-text">
                  Join thousands of happy users
                </h1>
                <h2 className="text-lg/relaxed font-medium text-text-muted">
                  Create your account in seconds and discover why teams love our
                  platform. Get started with all the tools you need to succeed.
                </h2>
              </div>

              {/* Form - Glass Effect */}
              <div className="relative mx-auto mt-16 max-w-lg animate-fade-in-up">
                {/* Gradient Blur Background */}
                <div className="absolute inset-0 -inset-x-6 rounded-3xl bg-gradient-to-b from-primary-300 via-success to-primary-700 opacity-15 blur-xl" />

                {/* Glass Container */}
                <div className="relative rounded-2xl bg-background/40 p-2.5 ring-1 ring-border/50 backdrop-blur-sm">
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="rounded-xl bg-background p-6 lg:p-10"
                  >
                    <div className="flex flex-col gap-5">
                      {/* Error Alert */}
                      {acceptInviteMutation.error && (
                        <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
                          {acceptInviteMutation.error instanceof Error
                            ? acceptInviteMutation.error.message
                            : "Failed to accept invitation. The link may have expired."}
                        </div>
                      )}

                      {/* Name Field */}
                      <div className="space-y-1">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          autoComplete="name"
                          className="h-11 bg-background-subtle border-border-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25"
                          {...register("name")}
                        />
                        {errors.name?.message && (
                          <p className="text-sm text-danger">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-1">
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="h-11 bg-background-subtle border-border-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 pr-11"
                            {...register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.password?.message ? (
                          <p className="text-sm text-danger">
                            {errors.password.message}
                          </p>
                        ) : (
                          <p className="text-xs text-text-subtle">
                            Min 8 characters with uppercase, lowercase, and
                            number.
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-sm font-medium"
                        >
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="h-11 bg-background-subtle border-border-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 pr-11"
                            {...register("confirmPassword")}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword?.message && (
                          <p className="text-sm text-danger">
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      {/* Terms Checkbox */}
                      <div className="flex flex-wrap items-center gap-1">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="h-4 w-4 rounded border-border-muted text-primary-500 focus:ring-2 focus:ring-primary-500/25"
                          />
                          <span className="ml-2 text-sm text-text-muted">
                            I agree with
                          </span>
                        </label>
                        <a
                          href="#"
                          className="text-sm font-medium text-text-muted hover:text-text"
                        >
                          terms and conditions
                        </a>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={
                            acceptInviteMutation.isPending || !agreedToTerms
                          }
                          className={cn(
                            "w-full h-12 rounded-full text-base font-semibold",
                            "bg-text text-background hover:bg-text/90",
                            "dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",
                            "focus:ring-2 focus:ring-primary-500/50",
                            "transition-all duration-200",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                        >
                          {acceptInviteMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            "Sign up"
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Features */}
              <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-text-muted animate-fade-in [animation-delay:400ms]">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary-500" />
                  <span>Real-time collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-success" />
                  <span>Enterprise security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-info" />
                  <span>AI-powered insights</span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
