"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Activity,
  ShieldCheck,
  Zap,
  ChevronRight,
  Box,
  Lock,
  Search,
  Sparkles,
  Database,
  GitBranch,
  Target,
} from "lucide-react";

/**
 * AIBOS Metadata Studio - Landing Page
 *
 * This page showcases ALL Tailwind CSS v4 features:
 * ✨ 3D transforms (rotate-x-*, perspective-*)
 * ✨ Container queries (@container, @sm:, @md:)
 * ✨ Advanced gradients (bg-conic-*, bg-radial-*, /oklch)
 * ✨ @starting-style transitions
 * ✨ not-* variant
 * ✨ Glassmorphism utilities
 * ✨ Custom variants (hocus:, data-active:)
 * ✨ Dynamic utilities (grid-cols-*, space-*)
 * ✨ Inset shadows
 * ✨ Field sizing
 * ✨ And much more!
 *
 * Reference: https://tailwindcss.com/blog/tailwindcss-v4
 */

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-bg text-fg relative overflow-hidden">
      {/* ============================================ */}
      {/* ANIMATED BACKGROUND WITH ADVANCED GRADIENTS */}
      {/* ============================================ */}
      <div className="fixed inset-0 -z-10">
        {/* Conic gradient (NEW v4 feature!) */}
        <div className="absolute top-0 left-0 w-full h-full bg-conic-[from_0deg_at_50%_50%]/oklch from-primary/10 via-success/10 to-primary/10 animate-[spin_20s_linear_infinite]" />

        {/* Radial gradients with different positions (NEW v4!) */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-radial-[at_30%_30%] from-metadata-lineage/20 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-radial-[at_70%_70%] from-finance-revenue/20 to-transparent blur-3xl" />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
      </div>

      {/* ============================================ */}
      {/* HERO SECTION WITH 3D TRANSFORMS            */}
      {/* ============================================ */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-24">
        {/* 3D Card with perspective (NEW v4!) */}
        <div className="perspective-distant w-full max-w-7xl">
          <div className="@container">
            <div className="grid @lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="space-y-8 animate-fade-in">
                {/* Badge with glassmorphism */}
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-gradient-metadata">
                    Powered by Tailwind CSS v4
                  </span>
                </div>

                {/* Main heading with gradient text */}
                <h1 className="text-5xl @lg:text-6xl font-black leading-[1.1] tracking-tight">
                  <span className="text-gradient-finance">
                    Central Nervous System
                  </span>
                  <br />
                  <span className="text-fg">for Business Terminology</span>
                </h1>

                <p className="text-xl text-fg-muted leading-relaxed max-w-2xl">
                  A lightweight metadata management platform following
                  OpenMetadata standards. Enforce controlled vocabulary, track
                  lineage, and maintain governance across your entire
                  organization.
                </p>

                {/* CTA buttons with custom states */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/metadata/glossary"
                    className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl 
                             bg-primary text-white font-semibold 
                             shadow-floating hocus:shadow-overlay hocus:scale-105
                             transition-all duration-fast ease-standard
                             relative overflow-hidden"
                  >
                    <span className="relative z-10">Explore Glossary</span>
                    <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />

                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-linear-45/oklch from-primary to-primary-hover opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  <Link
                    href="/metadata/sdk"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl 
                             glass border-2 border-border font-semibold 
                             hocus:border-primary hocus:shadow-floating
                             transition-all duration-fast ease-standard"
                  >
                    <span>View SDK</span>
                    <Box className="w-5 h-5" />
                  </Link>
                </div>

                {/* Stats with container queries */}
                <div className="@container pt-8">
                  <div className="grid @sm:grid-cols-3 gap-6">
                    {[
                      { label: "Approved Terms", value: "150+" },
                      { label: "Domains", value: "3" },
                      { label: "SDK Version", value: "v1.0" },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="relative group"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div
                          className="glass p-4 rounded-lg border border-border 
                                      group-hocus:border-primary group-hocus:shadow-raised
                                      transition-all duration-normal"
                        >
                          <div className="text-3xl font-bold text-primary">
                            {stat.value}
                          </div>
                          <div className="text-sm text-fg-muted">
                            {stat.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: 3D Visual */}
              <div className="relative perspective-normal">
                <div className="card-3d glass p-8 rounded-3xl border border-border shadow-overlay">
                  <div className="card-3d-content space-y-6">
                    {/* Code preview with syntax highlighting */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-metadata-glossary">
                          controlled-vocabulary.ts
                        </span>
                        <span className="metadata-badge metadata-badge-glossary">
                          TypeScript
                        </span>
                      </div>

                      <div className="glass-strong p-6 rounded-xl font-mono text-sm space-y-2 border border-border overflow-x-auto">
                        <div className="text-metadata-lineage">
                          <span className="text-fg-subtle">// </span>
                          <span>Approved Finance Terms</span>
                        </div>
                        <div>
                          <span className="text-metadata-quality">
                            export const
                          </span>
                          <span className="text-fg">
                            {" "}
                            APPROVED_FINANCE_TERMS = {"{"}
                          </span>
                        </div>
                        <div className="pl-4">
                          <span className="text-finance-revenue">revenue</span>
                          <span className="text-fg">: </span>
                          <span className="text-warning">
                            &apos;revenue&apos;
                          </span>
                          <span className="text-fg">,</span>
                        </div>
                        <div className="pl-4">
                          <span className="text-finance-expense">expense</span>
                          <span className="text-fg">: </span>
                          <span className="text-warning">
                            &apos;expense&apos;
                          </span>
                          <span className="text-fg">,</span>
                        </div>
                        <div className="pl-4">
                          <span className="text-finance-asset">asset</span>
                          <span className="text-fg">: </span>
                          <span className="text-warning">
                            &apos;asset&apos;
                          </span>
                          <span className="text-fg">,</span>
                        </div>
                        <div>
                          <span className="text-fg">{"}"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status indicators */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs text-fg-muted">
                          Type-safe & Validated
                        </span>
                      </div>
                      <div className="text-xs font-mono text-fg-subtle">
                        v1.0.0
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -right-4 -top-4 glass px-3 py-2 rounded-lg border border-border shadow-floating animate-pulse-glow">
                  <ShieldCheck className="w-5 h-5 text-success" />
                </div>
                <div className="absolute -left-4 -bottom-4 glass px-3 py-2 rounded-lg border border-border shadow-floating animate-pulse-glow animation-delay-2000">
                  <Zap className="w-5 h-5 text-warning" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES GRID WITH CONTAINER QUERIES       */}
      {/* ============================================ */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-transparent to-bg-subtle/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-fg">
              Design System <span className="text-gradient">Superpowers</span>
            </h2>
            <p className="text-xl text-fg-muted max-w-2xl mx-auto">
              Built with Tailwind CSS v4 - leveraging all the latest features
            </p>
          </div>

          {/* Grid with container queries */}
          <div className="grid @container gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Cpu,
                title: "3D Transforms",
                description:
                  "Perspective, rotate-x/y/z, and scale-z utilities for stunning 3D effects",
                color: "primary",
                demo: "rotate-x-12 hover:rotate-x-0",
              },
              {
                icon: Target,
                title: "Container Queries",
                description:
                  "Responsive design based on container size, not just viewport",
                color: "metadata-lineage",
                demo: "@sm:scale-105",
              },
              {
                icon: Sparkles,
                title: "Advanced Gradients",
                description:
                  "Conic, radial, and linear gradients with OKLCH interpolation",
                color: "success",
                demo: "bg-conic-[from_45deg]",
              },
              {
                icon: Zap,
                title: "CSS-First Config",
                description:
                  "@theme directive for dynamic utilities without JavaScript",
                color: "warning",
                demo: "text-gradient",
              },
              {
                icon: Activity,
                title: "Custom Variants",
                description:
                  "hocus:, data-active:, tier-1:, and more custom state modifiers",
                color: "metadata-quality",
                demo: "hocus:shadow-overlay",
              },
              {
                icon: Database,
                title: "Glassmorphism",
                description:
                  "Built-in glass utilities with backdrop-blur and color-mix()",
                color: "metadata-kpi",
                demo: "glass",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="@container group relative"
                data-active={activeFeature === i}
                onMouseEnter={() => setActiveFeature(i)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <div
                  className={`
                  glass p-8 rounded-2xl border border-border
                  transition-all duration-normal ease-standard
                  hocus:border-${feature.color} hocus:shadow-floating hocus:scale-[1.02]
                  data-active:shadow-overlay
                  ${feature.demo}
                `}
                >
                  {/* Icon */}
                  <div
                    className={`
                    inline-flex p-4 rounded-xl mb-6
                    bg-${feature.color}/10 text-${feature.color}
                    group-hover:scale-110 group-hover:rotate-3
                    transition-transform duration-normal
                  `}
                  >
                    <feature.icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3 text-fg">
                    {feature.title}
                  </h3>
                  <p className="text-fg-muted text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Demo badge */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <code className="text-xs font-mono text-metadata-glossary">
                      {feature.demo}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* QUICK NAVIGATION WITH INSET SHADOWS        */}
      {/* ============================================ */}
      <section className="relative px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            🚀 <span className="text-gradient-metadata">Quick Navigation</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Glossary Card */}
            <Link
              href="/metadata/glossary"
              className="group relative p-8 rounded-2xl border border-border
                       bg-gradient-to-br from-bg-subtle to-bg
                       hover:shadow-overlay hover:scale-[1.02] hover:border-metadata-glossary
                       transition-all duration-fast ease-standard
                       overflow-hidden"
            >
              {/* Inset shadow (NEW v4!) */}
              <div className="absolute inset-0 inset-shadow-[0_2px_8px_rgba(0,0,0,0.05)]" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="p-4 rounded-xl bg-metadata-glossary/10 text-metadata-glossary
                                group-hover:scale-110 group-hover:rotate-6
                                transition-transform duration-normal"
                  >
                    <Search className="w-8 h-8" />
                  </div>
                  <ChevronRight className="w-6 h-6 text-fg-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-2xl font-semibold mb-3 text-fg">
                  Business Glossary
                </h3>
                <p className="text-fg-muted mb-6">
                  Browse approved business terms across Finance, HR, and
                  Operations domains
                </p>

                <div className="flex items-center gap-2">
                  <span className="metadata-badge metadata-badge-glossary">
                    150+ Terms
                  </span>
                  <span className="text-xs font-mono text-metadata-glossary">
                    /metadata/glossary →
                  </span>
                </div>
              </div>
            </Link>

            {/* SDK Card */}
            <Link
              href="/metadata/sdk"
              className="group relative p-8 rounded-2xl border border-border
                       bg-gradient-to-br from-bg-subtle to-bg
                       hover:shadow-overlay hover:scale-[1.02] hover:border-primary
                       transition-all duration-fast ease-standard
                       overflow-hidden"
            >
              {/* Inset shadow (NEW v4!) */}
              <div className="absolute inset-0 inset-shadow-[0_2px_8px_rgba(0,0,0,0.05)]" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="p-4 rounded-xl bg-primary/10 text-primary
                                group-hover:scale-110 group-hover:-rotate-6
                                transition-transform duration-normal"
                  >
                    <Box className="w-8 h-8" />
                  </div>
                  <ChevronRight className="w-6 h-6 text-fg-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-2xl font-semibold mb-3 text-fg">
                  SDK Documentation
                </h3>
                <p className="text-fg-muted mb-6">
                  Versioned SDK for controlled vocabulary with OpenMetadata
                  compatibility
                </p>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                    v1.0.0
                  </span>
                  <span className="text-xs font-mono text-primary">
                    /metadata/sdk →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Tip with field-sizing (NEW v4!) */}
          <div className="mt-8 p-6 rounded-xl glass border border-border">
            <p className="text-sm text-fg-muted text-center">
              💡 <strong>Pro Tip:</strong> You can also navigate directly by
              typing URLs like{" "}
              <code className="px-2 py-1 rounded-md bg-bg-muted font-mono text-xs text-primary">
                localhost:3000/metadata/glossary
              </code>
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER WITH GRADIENT                       */}
      {/* ============================================ */}
      <footer className="relative px-6 py-12 border-t border-border bg-bg-subtle/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GitBranch className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-fg">
                  AIBOS Metadata Studio
                </div>
                <div className="text-xs text-fg-muted">
                  Powered by AIBOS Platform Team
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-fg-muted">
              <span>Following OpenMetadata Standards</span>
              <span className="hidden md:inline">•</span>
              <span>Built with Tailwind CSS v4</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
