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
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-24 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-metadata-lineage/5 -z-10" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] -z-10"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-muted border border-border mb-8 
                          transition-all duration-normal hover:border-primary hover:shadow-raised"
          >
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-text-muted">
              OpenMetadata Compatible
            </span>
          </div>

          {/* Hero title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6">
            The central nervous system
            <br />
            for <span className="text-primary">business metadata</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-text-muted max-w-3xl mx-auto mb-12 leading-relaxed">
            Enforce controlled vocabulary, track lineage, and maintain
            governance across your entire organization.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="/metadata/glossary"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl
                         bg-primary text-white font-semibold
                         transition-all duration-fast ease-standard
                         hover:bg-primary-600 hover:shadow-floating hover:scale-[1.02]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>Get started</span>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/metadata/sdk"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl
                         bg-background-muted text-text font-semibold border border-border
                         transition-all duration-fast ease-standard
                         hover:bg-background-subtle hover:border-primary hover:shadow-raised
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
            >
              <span>View documentation</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "10K+", label: "Metadata Entities" },
              { value: "100%", label: "Lineage Coverage" },
              { value: "4", label: "Governance Tiers" },
              { value: "<50ms", label: "Query Response" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="py-12 border-y border-border bg-background-subtle">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm text-text-muted mb-8">
            Trusted by leading engineering teams
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
            {["Company A", "Company B", "Company C", "Company D"].map(
              (company) => (
                <div
                  key={company}
                  className="text-xl font-bold text-text-muted"
                >
                  {company}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-xl text-text-muted">
              One end-to-end tool to simplify and accelerate your workflow
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: "Multi-tier governance",
                description:
                  "Enforce compliance with HITL workflows for Tier 1/2 assets. Automated lineage for all data flows.",
              },
              {
                icon: Target,
                title: "Controlled vocabulary",
                description:
                  "Type-safe, versioned SDK ensures only approved terms are used. Compile-time checks prevent drift.",
              },
              {
                icon: TrendingUp,
                title: "Impact analysis",
                description:
                  "Real-time dependency tracking. Know exactly what breaks before you make changes.",
              },
              {
                icon: Database,
                title: "Lineage tracking",
                description:
                  "Automatic column-level lineage. From source to dashboard, see the complete data journey.",
              },
              {
                icon: Shield,
                title: "RBAC + ABAC",
                description:
                  "Granular permissions with attribute-based policies. Integrated with Kernel governance.",
              },
              {
                icon: Boxes,
                title: "SoT packs",
                description:
                  "IFRS/MFRS finance packs built-in. Extend with custom domain standards. Always audit-ready.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl border border-border bg-background
                           transition-all duration-normal ease-standard
                           hover:border-primary hover:shadow-floating hover:bg-background-subtle"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4 transition-transform duration-fast group-hover:scale-110" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="py-24 px-6 bg-background-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Review faster, ship sooner
              </h2>
              <p className="text-xl text-text-muted mb-8 leading-relaxed">
                Get high signal AI reviews on every PR to catch critical bugs
                and get suggested fixes, pre-merge.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Automatic lineage tracking",
                  "Real-time impact analysis",
                  "Type-safe controlled vocabulary",
                  "HITL approval workflows",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/metadata/glossary"
                className="inline-flex items-center gap-2 text-primary font-semibold
                           transition-all duration-fast hover:gap-3"
              >
                <span>Learn more</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="aspect-video rounded-2xl border border-border bg-background-muted shadow-overlay overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                  <Code2 className="w-16 h-16 opacity-20" />
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 px-6 py-4 rounded-xl bg-background border border-border shadow-floating">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary border-2 border-background" />
                    <div className="w-8 h-8 rounded-full bg-success border-2 border-background" />
                    <div className="w-8 h-8 rounded-full bg-metadata-lineage border-2 border-background" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">100+ teams</div>
                    <div className="text-text-muted">using AIBOS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Built on top of modern stack
          </h2>
          <p className="text-xl text-text-muted mb-12">
            Leveraging industry-leading technologies
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Next.js 15", tag: "React" },
              { name: "Tailwind v4", tag: "CSS" },
              { name: "TypeScript", tag: "Types" },
              { name: "Zod v3", tag: "Schema" },
              { name: "Hono", tag: "API" },
              { name: "Turbo", tag: "Build" },
              { name: "Vitest", tag: "Test" },
              { name: "OKLCH", tag: "Color" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="p-6 rounded-xl border border-border bg-background
                           transition-all duration-fast hover:border-primary hover:shadow-raised hover:scale-105"
              >
                <div className="text-lg font-bold mb-1">{tech.name}</div>
                <div className="text-sm text-text-muted">{tech.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-24 px-6 bg-background-subtle">
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

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { metric: "100%", label: "World-class design" },
              { metric: "44%", label: "Code reduction" },
              { metric: "0ms", label: "Runtime overhead" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-8 rounded-2xl border border-border bg-background
                           transition-all duration-normal hover:border-primary hover:shadow-floating"
              >
                <div className="text-5xl font-bold text-primary mb-2">
                  {item.metric}
                </div>
                <div className="text-text-muted">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            Ready to transform your metadata?
          </h2>
          <p className="text-2xl text-text-muted mb-12">
            Join the future of data governance
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/metadata/glossary"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl
                         bg-primary text-white font-bold text-lg
                         transition-all duration-fast ease-standard
                         hover:bg-primary-600 hover:shadow-overlay hover:scale-[1.02]"
            >
              <span>Get started now</span>
              <ArrowRight className="w-6 h-6" />
            </Link>

            <Link
              href="/metadata/sdk"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl
                         bg-background-muted text-text font-bold text-lg border border-border
                         transition-all duration-fast ease-standard
                         hover:bg-background-subtle hover:border-primary hover:shadow-raised"
            >
              <span>View documentation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background-subtle px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold mb-4">AIBOS</div>
              <p className="text-sm text-text-muted">
                Lightweight metadata management for business operations
              </p>
            </div>
            <div>
              <div className="font-semibold mb-4">Product</div>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <Link
                    href="/metadata/glossary"
                    className="hover:text-primary transition-colors"
                  >
                    Glossary
                  </Link>
                </li>
                <li>
                  <Link
                    href="/metadata/sdk"
                    className="hover:text-primary transition-colors"
                  >
                    SDK
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Company</div>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Resources</div>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-text-muted">
            <p>© 2025 AIBOS Metadata Studio. Built with Tailwind CSS v4.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
