"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button, Input, Label } from "@aibos/ui";
import { useLogin } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI-BOS LOGIN - BOXED GLASS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Design Principles:
 * - Single primary color (blue) + neutral grays
 * - 8-point grid spacing (8, 16, 24, 32, 48, 64, 96)
 * - Clean typography hierarchy
 * - One subtle effect: glass card with gradient glow
 * - Maximum harmony through restraint
 */

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const resetSuccess = searchParams.get("reset") === "success";
  const invitedSuccess = searchParams.get("invited") === "success";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate({ email: data.email, password: data.password });
  };

  return (
    <div className="min-h-dvh flex flex-col bg-gray-950">
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto flex-1 flex flex-col px-4 py-16 lg:py-24 max-w-6xl">
          
          {/* Logo - Simple, Clean */}
          <div className="text-center mb-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold text-white hover:opacity-80 transition-opacity"
            >
              {/* Simple SVG Logo - No effects */}
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
              >
                <rect width="32" height="32" rx="8" className="fill-primary-500" />
                <path
                  d="M16 6L22 14H18V20L12 12H16V6Z"
                  fill="white"
                  fillRule="evenodd"
                />
              </svg>
              <span>AI-BOS</span>
            </Link>
          </div>

          {/* Heading Section - Proper Hierarchy */}
          <div className="text-center mb-8 max-w-xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-800 py-1.5 pl-1.5 pr-3 text-sm font-medium text-gray-300 mb-6">
              <span className="inline-flex items-center justify-center rounded-full bg-primary-500 px-2 py-0.5 text-xs font-semibold text-white">
                Secure
              </span>
              <span>Enterprise-grade security</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome back
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-400 leading-relaxed">
              Sign in to your account to continue managing your data and insights.
            </p>
          </div>

          {/* Form Card - Glass Effect (Single Effect) */}
          <div className="relative mx-auto w-full max-w-md mt-8">
            {/* Gradient Blur - Subtle, Behind Card */}
            <div 
              className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl"
              style={{
                background: "linear-gradient(135deg, oklch(0.55 0.20 250) 0%, oklch(0.50 0.15 250) 100%)"
              }}
            />

            {/* Glass Container */}
            <div className="relative rounded-2xl bg-gray-900/50 p-1.5 ring-1 ring-white/10 backdrop-blur-sm">
              {/* Inner Card */}
              <div className="rounded-xl bg-gray-950 p-8 lg:p-10">
                
                {/* Alerts */}
                {(resetSuccess || invitedSuccess) && (
                  <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 mb-6">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm text-emerald-400">
                      {resetSuccess ? "Password reset successfully." : "Account created successfully."}
                    </p>
                  </div>
                )}

                {loginMutation.error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 mb-6">
                    <p className="text-sm text-red-400">
                      {loginMutation.error instanceof Error
                        ? loginMutation.error.message
                        : "Login failed. Please check your credentials."}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      className={cn(
                        "h-12 w-full rounded-lg",
                        "bg-gray-900 border-gray-800",
                        "text-white placeholder:text-gray-500",
                        "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
                        "transition-colors"
                      )}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                        Password
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className={cn(
                          "h-12 w-full rounded-lg pr-12",
                          "bg-gray-900 border-gray-800",
                          "text-white placeholder:text-gray-500",
                          "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
                          "transition-colors"
                        )}
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-400">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className={cn(
                      "w-full h-12 rounded-lg",
                      "bg-white text-gray-900 font-semibold",
                      "hover:bg-gray-100",
                      "focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-950",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "transition-all"
                    )}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-8">
                  Don&apos;t have an account?{" "}
                  <span className="text-gray-400">Contact your administrator</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
