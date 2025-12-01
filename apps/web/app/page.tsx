import React from "react";
import Link from "next/link";
import {
  Database,
  GitBranch,
  Target,
  Zap,
  Shield,
  ChevronRight,
  Check,
  Star,
  TrendingUp,
  Layers,
  Code2,
  Boxes,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text">
      {/* PREMIUM HERO - Enhanced Depth with 3D Content Wrapper */}
      <section className="relative py-24 md:py-32 overflow-hidden text-center perspective-distant">
        {/* Subtle Background Glow - Refined Mask */}
        <div
          className="absolute inset-0 bg-background-base opacity-90 -z-10"
          style={{
            maskImage:
              "radial-gradient(ellipse at top, transparent 40%, oklch(0 0 0) 90%)",
          }}
        />

        {/* Grid Pattern - Slightly Darker */}
        <div
          className="absolute inset-0 opacity-[0.03] -z-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        {/* 3D Content Wrapper with subtle hover */}
        <div className="card-3d group max-w-4xl mx-auto px-4">
          <div className="card-3d-content">
          {/* Premium Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                          bg-background-muted border border-border shadow-raised
                          transition-all duration-normal hocus:border-primary/50 hocus:shadow-floating
                          mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-text-muted">
              OpenMetadata Compatible
            </span>
          </div>

          {/* Headline with Text Gradient */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span className="text-gradient-metadata">
              The central nervous system
            </span>
            <br />
            <span className="text-text">for business metadata</span>
          </h1>

          {/* Subhead */}
          <p className="text-xl md:text-2xl text-text-muted max-w-3xl mx-auto mb-12 leading-relaxed">
            Unify lineage, quality, and compliance in a single, high-density
            platform.
          </p>

          {/* Premium CTA with Micro-Interaction */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="/metadata/glossary"
              className="group inline-flex items-center justify-center px-8 py-4 
                         bg-primary text-white rounded-xl font-semibold text-lg
                         shadow-floating hocus:shadow-overlay 
                         transition-all duration-normal ease-standard
                         hocus:scale-[1.03] hocus:bg-primary-600"
            >
              <span>Start free trial</span>
              <ChevronRight className="ml-2 w-5 h-5 transition-transform duration-fast group-hover:translate-x-1" />
            </Link>

            <Link
              href="/metadata/sdk"
              className="group inline-flex items-center justify-center px-8 py-4 
                         bg-background-muted text-text rounded-xl font-semibold text-lg
                         border border-border shadow-raised
                         transition-all duration-normal ease-standard
                         hocus:border-primary hocus:shadow-floating hocus:scale-[1.02]"
            >
              <span>View documentation</span>
            </Link>
          </div>

          {/* Stats - High Density */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: "10K+", label: "Entities" },
              { value: "100%", label: "Coverage" },
              { value: "4", label: "Gov Tiers" },
              { value: "<50ms", label: "Response" },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div
                  className="text-3xl md:text-4xl font-bold text-primary mb-1 
                                transition-transform duration-fast group-hover:scale-110"
                >
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-text-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY - Subtle Separator */}
      <section className="py-8 border-y border-border/50 bg-background-subtle">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-xs text-text-subtle mb-6 uppercase tracking-wider">
            Trusted by leading engineering teams
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-40">
            {["Company A", "Company B", "Company C", "Company D"].map(
              (company) => (
                <div
                  key={company}
                  className="text-lg font-bold text-text-muted transition-opacity duration-fast hover:opacity-100"
                >
                  {company}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* FLOATING 3D FEATURE CARDS */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-lg text-text-muted">
              One end-to-end tool to simplify and accelerate your workflow
            </p>
          </div>

          {/* 3D Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: GitBranch,
                title: "Metadata lineage",
                description:
                  "Trace data flow with pixel-perfect precision. Every transform, every source, instantly visualized.",
                color: "metadata-lineage",
                isHighlighted: true, // Premium first card
              },
              {
                icon: Target,
                title: "Data quality checks",
                description:
                  "Run automated governance tiers (Tier 1, Tier 2) directly against production pipelines.",
                color: "metadata-quality",
              },
              {
                icon: Shield,
                title: "Regulatory compliance",
                description:
                  "Map IFRS/MFRS financial domains and Tiers to your datasets for audit readiness.",
                color: "metadata-governance",
              },
              {
                icon: Layers,
                title: "Multi-tier governance",
                description:
                  "Enforce compliance with HITL workflows for Tier 1/2 assets. Automated lineage for all flows.",
                color: "tier-1",
              },
              {
                icon: Database,
                title: "Controlled vocabulary",
                description:
                  "Type-safe, versioned SDK ensures only approved terms are used. Compile-time checks prevent drift.",
                color: "metadata-glossary",
              },
              {
                icon: Boxes,
                title: "SoT packs",
                description:
                  "IFRS/MFRS finance packs built-in. Extend with custom domain standards. Always audit-ready.",
                color: "finance-revenue",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="card-3d group perspective-normal"
              >
                <div
                  className={`card-3d-content h-full p-6 rounded-xl 
                            border border-border bg-background-muted 
                            shadow-raised transition-all duration-normal ease-standard
                            group-hocus:border-${feature.color}/50 
                            group-hocus:shadow-overlay 
                            group-hocus:translate-y-[-2px]
                            ${
                              feature.isHighlighted
                                ? "border-2 border-primary/60 shadow-floating animate-pulse-glow"
                                : ""
                            }`}
                >
                  <feature.icon
                    className={`w-8 h-8 text-${feature.color} mb-4 
                                           transition-transform duration-fast 
                                           group-hover:rotate-3`}
                  />
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-subtle leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Interactive Link */}
                  <div
                    className="flex items-center text-primary text-sm font-medium 
                                  transition-colors duration-fast group-hocus:text-primary-600"
                  >
                    <span>Explore module</span>
                    <ArrowRight className="ml-1 w-4 h-4 transition-transform duration-fast group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM PRODUCT SHOWCASE */}
      <section className="py-20 px-4 bg-background-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full 
                              bg-primary/10 border border-primary/20 mb-6"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  AI-Powered
                </span>
              </div>

              <h2 className="text-4xl font-bold mb-6">
                Review faster, ship sooner
              </h2>
              <p className="text-xl text-text-muted mb-8 leading-relaxed">
                Get high signal AI reviews on every PR to catch critical bugs
                and get suggested fixes, pre-merge.
              </p>

              {/* High-Density List with Subtle Separators & Icon Rings */}
              <ul className="space-y-3 mb-8 divide-y divide-border/30">
                {[
                  "Automatic lineage tracking",
                  "Real-time impact analysis",
                  "Type-safe controlled vocabulary",
                  "HITL approval workflows",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 pt-3 first:pt-0 
                                           group transition-all duration-fast hover:translate-x-1"
                  >
                    {/* Check icon with subtle ring and muted background */}
                    <div className="p-1 rounded-full bg-success/10 border border-success/20 flex-shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-text-muted group-hover:text-text transition-colors duration-fast">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/metadata/glossary"
                className="group inline-flex items-center gap-2 text-primary font-semibold
                           transition-all duration-fast hover:gap-3"
              >
                <span>Learn more</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right: Visual with Floating Badge */}
            <div className="relative">
              <div
                className="aspect-video rounded-2xl border border-border bg-background-muted 
                              shadow-overlay overflow-hidden 
                              transition-all duration-normal hover:shadow-high"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Code2 className="w-16 h-16 text-text-muted opacity-20" />
                </div>
              </div>

              {/* Floating Stats Badge - Premium Depth */}
              <div
                className="absolute -bottom-6 -left-6 px-6 py-4 rounded-xl 
                              bg-background border border-border shadow-floating
                              transition-all duration-normal hover:shadow-overlay hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary border-2 border-background" />
                    <div className="w-8 h-8 rounded-full bg-success border-2 border-background" />
                    <div className="w-8 h-8 rounded-full bg-metadata-lineage border-2 border-background" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">100+ teams</div>
                    <div className="text-text-muted text-xs">using AIBOS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PRICING TIERS */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Pricing tiers</h2>
            <p className="text-lg text-text-muted">
              Scale from individual contributor to enterprise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* TIER 1: Free */}
            <div
              className="p-8 rounded-xl border border-border bg-background-muted shadow-raised
                            transition-all duration-normal hover:shadow-floating"
            >
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <p className="text-text-subtle text-sm mb-6">
                Always free for basic usage
              </p>

              <div className="mb-8">
                <span className="text-4xl font-bold">Free</span>
              </div>

              <button
                className="w-full py-3 border border-border text-text rounded-lg font-medium
                                 transition-all duration-fast hover:bg-background-subtle"
              >
                Sign up
              </button>
            </div>

            {/* TIER 2: Enterprise (PREMIUM - Highlighted) */}
            <div
              className="relative p-8 rounded-xl border-2 border-primary bg-background-muted 
                            shadow-floating overflow-hidden
                            transition-all duration-normal hover:shadow-overlay hover:scale-[1.02]"
            >
              {/* Top Banner */}
              <div
                className="absolute top-0 right-0 px-3 py-1 bg-primary text-white 
                              text-xs font-semibold rounded-bl-lg"
              >
                Recommended
              </div>

              <h3 className="text-xl font-semibold mb-2 text-primary">
                Enterprise
              </h3>
              <p className="text-text-subtle text-sm mb-6">
                Full suite with advanced governance tools
              </p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-primary">$299</span>
                <span className="text-text-muted">/month</span>
              </div>

              <button
                className="w-full py-3 bg-primary text-white rounded-lg font-medium 
                                 shadow-raised transition-all duration-fast 
                                 hover:bg-primary-600 hover:shadow-floating animate-pulse-glow"
              >
                Contact sales
              </button>
            </div>

            {/* TIER 3: Starter */}
            <div
              className="p-8 rounded-xl border border-border bg-background-muted shadow-raised
                            transition-all duration-normal hover:shadow-floating"
            >
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <p className="text-text-subtle text-sm mb-6">
                For small teams and side projects
              </p>

              <div className="mb-8">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-text-muted">/month</span>
              </div>

              <button
                className="w-full py-3 bg-success text-white rounded-lg font-medium
                                 transition-all duration-fast hover:bg-success/90"
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 px-4 bg-background-subtle">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-warning text-warning" />
            ))}
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Validated by production standards
          </h2>
          <p className="text-xl text-text-muted mb-12">
            100% grade on technical correctness, V4 compliance, and production
            readiness
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { metric: "100%", label: "World-class design" },
              { metric: "44%", label: "Code reduction" },
              { metric: "0ms", label: "Runtime overhead" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-8 rounded-2xl border border-border bg-background shadow-raised
                           transition-all duration-normal hover:border-primary hover:shadow-floating hover:scale-105"
              >
                <div className="text-5xl font-bold text-primary mb-2">
                  {item.metric}
                </div>
                <div className="text-text-muted text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Ready to transform your{" "}
            <span className="text-gradient-metadata">metadata</span>?
          </h2>
          <p className="text-2xl text-text-muted mb-12">
            Join the future of data governance
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/metadata/glossary"
              className="group inline-flex items-center gap-2 px-10 py-5 rounded-xl
                         bg-primary text-white font-bold text-lg
                         shadow-overlay transition-all duration-fast ease-standard
                         hocus:bg-primary-600 hocus:shadow-high hocus:scale-[1.02]"
            >
              <span>Get started now</span>
              <ArrowRight className="w-6 h-6 transition-transform duration-fast group-hover:translate-x-1" />
            </Link>

            <Link
              href="/metadata/sdk"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl
                         bg-background-muted text-text font-bold text-lg border border-border
                         shadow-raised transition-all duration-fast ease-standard
                         hocus:bg-background-subtle hocus:border-primary hocus:shadow-floating"
            >
              <span>View documentation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER - High Density & Polish */}
      <footer className="border-t border-border/50 bg-background-subtle px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-8 text-sm">
            <div>
              <div className="text-xl font-bold mb-3">AIBOS</div>
              <p className="text-text-muted text-xs leading-relaxed">
                Lightweight metadata management for business operations
              </p>
            </div>
            <div>
              <div className="font-semibold mb-2 text-xs uppercase tracking-wider text-text-subtle">
                Product
              </div>
              <ul className="space-y-2">
                {["Glossary", "SDK", "Documentation"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-text-muted transition-colors duration-fast hover:text-primary"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2 text-xs uppercase tracking-wider text-text-subtle">
                Company
              </div>
              <ul className="space-y-2">
                {["About", "Blog", "Careers"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-text-muted transition-colors duration-fast hover:text-primary"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2 text-xs uppercase tracking-wider text-text-subtle">
                Resources
              </div>
              <ul className="space-y-2">
                {["Guides", "API Reference", "Status"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-text-muted transition-colors duration-fast hover:text-primary"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/30 text-center text-xs text-text-muted">
            <p>© 2025 AIBOS Metadata Studio. Built with Tailwind CSS v4.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
