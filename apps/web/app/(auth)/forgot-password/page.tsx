"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Mail, Zap } from "lucide-react";
import { Button, Input, Label } from "@aibos/ui";
import { useForgotPassword } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Boxed Glass Forgot Password Page
 */

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmittedEmail(data.email);
    forgotPasswordMutation.mutate({ email: data.email });
  };

  const isSuccess = forgotPasswordMutation.isSuccess;
  const isLoading = forgotPasswordMutation.isPending;
  const error = forgotPasswordMutation.error;

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

          {isSuccess ? (
            /* Success State */
            <div className="mx-auto max-w-md text-center animate-fade-in">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Mail className="h-8 w-8 text-success" />
              </div>
              <h1 className="mb-4 text-3xl font-black text-text">
                Check your email
              </h1>
              <p className="text-text-muted mb-4">
                We sent a password reset link to{" "}
                <span className="font-medium text-text">
                  {submittedEmail || getValues("email")}
                </span>
              </p>
              <p className="text-sm text-text-subtle mb-8">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => forgotPasswordMutation.reset()}
                  className="font-medium text-primary-500 hover:text-primary-400"
                >
                  try again
                </button>
              </p>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="h-12 px-8 rounded-full font-semibold"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mx-auto max-w-3xl text-center animate-fade-in">
                <h1 className="mb-4 text-4xl font-black text-text">
                  Forgot password?
                </h1>
                <h2 className="text-lg/relaxed font-medium text-text-muted">
                  No worries, we&apos;ll send you reset instructions.
                </h2>
              </div>

              {/* Form - Glass Effect */}
              <div className="relative mx-auto mt-16 max-w-md animate-fade-in-up">
                {/* Gradient Blur Background */}
                <div className="absolute inset-0 -inset-x-6 rounded-3xl bg-gradient-to-b from-primary-300 via-info to-primary-700 opacity-15 blur-xl" />

                {/* Glass Container */}
                <div className="relative rounded-2xl bg-background/40 p-2.5 ring-1 ring-border/50 backdrop-blur-sm">
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="rounded-xl bg-background p-6 lg:p-10"
                  >
                    <div className="flex flex-col gap-5">
                      {/* Error Alert */}
                      {error && (
                        <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
                          {error instanceof Error
                            ? error.message
                            : "Something went wrong"}
                        </div>
                      )}

                      {/* Email Field */}
                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          autoComplete="email"
                          className="h-11 bg-background-subtle border-border-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25"
                          {...register("email")}
                        />
                        {errors.email?.message && (
                          <p className="text-sm text-danger">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className={cn(
                            "w-full h-12 rounded-full text-base font-semibold",
                            "bg-text text-background hover:bg-text/90",
                            "dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",
                            "focus:ring-2 focus:ring-primary-500/50",
                            "transition-all duration-200"
                          )}
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            "Reset password"
                          )}
                        </Button>
                      </div>

                      {/* Back Link */}
                      <div className="text-center">
                        <Link
                          href="/login"
                          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to login
                        </Link>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
