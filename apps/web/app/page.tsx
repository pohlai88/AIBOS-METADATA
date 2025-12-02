"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Zap,
  Database,
  Activity,
  Clock,
  CheckCircle2,
  Cpu,
  Network,
  Sun,
  Moon,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Lock,
  AlertCircle,
  Radio,
  GitBranch,
  Brain,
  Bot,
  Workflow,
  Boxes,
} from "lucide-react";

export default function AIOrchestration() {
  const [mode, setMode] = useState<"day" | "night">("day");
  const [time, setTime] = useState(9);
  const [isPaused, setIsPaused] = useState(false);
  const [orchestratorActive, setConductorActive] = useState(false);

  // Orchestrator pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setConductorActive((prev) => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // 24-hour clock
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTime((t) => (t + 1) % 24);
      setMode(time >= 6 && time < 18 ? "day" : "night");
    }, 3000);
    return () => clearInterval(interval);
  }, [time, isPaused]);

  // Live metrics
  const [metrics, setMetrics] = useState({
    processing: 127,
    validated: 1453,
    indexed: 8921,
    archived: 12304,
  });

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setMetrics((m) => ({
        processing: m.processing + Math.floor(Math.random() * 5),
        validated: m.validated + Math.floor(Math.random() * 10),
        indexed: m.indexed + Math.floor(Math.random() * 15),
        archived: m.archived + Math.floor(Math.random() * 3),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const isDay = mode === "day";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* AI MESH NETWORK - Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, ${isDay ? "rgba(251, 146, 60, 0.4)" : "rgba(147, 51, 234, 0.5)"} 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, ${isDay ? "rgba(245, 158, 11, 0.3)" : "rgba(99, 102, 241, 0.4)"} 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, ${isDay ? "rgba(234, 179, 8, 0.2)" : "rgba(168, 85, 247, 0.3)"} 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* AGENT PARTICLES - Floating AI Nodes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
              animation: `agentFloat ${4 + i * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            <div
              className={`w-3 h-3 rounded ${
                i % 4 === 0
                  ? "bg-blue-400"
                  : i % 4 === 1
                    ? "bg-green-400"
                    : i % 4 === 2
                      ? isDay
                        ? "bg-orange-400"
                        : "bg-purple-400"
                      : "bg-cyan-400"
              }`}
              style={{ opacity: 0.4, filter: "blur(1px)" }}
            />
          </div>
        ))}
      </div>

      {/* CONTROL CENTER - Header */}
      <header className="relative z-50 px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-3xl px-8 py-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* AI Orchestrator Icon */}
                <div className="relative">
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                      isDay
                        ? "from-orange-500 to-amber-500"
                        : "from-purple-600 to-indigo-600"
                    } blur-xl transition-all duration-1000 ${
                      orchestratorActive
                        ? "opacity-100 scale-110"
                        : "opacity-50 scale-100"
                    }`}
                  />
                  <div
                    className={`relative p-3 rounded-2xl bg-gradient-to-br ${
                      isDay
                        ? "from-orange-500 to-amber-500"
                        : "from-purple-600 to-indigo-600"
                    } transition-transform duration-500 ${
                      orchestratorActive ? "scale-110" : "scale-100"
                    }`}
                  >
                    <Boxes className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    AI Orchestration Studio
                  </h1>
                  <p className="text-sm text-white/70">
                    Agentic AI • Generative Workflows • MCP Governance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Control */}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`p-3 rounded-2xl transition-all ${
                    isPaused
                      ? "bg-red-500/20 hover:bg-red-500/30"
                      : "bg-green-500/20 hover:bg-green-500/30"
                  }`}
                >
                  {isPaused ? (
                    <Play className="w-6 h-6" />
                  ) : (
                    <Pause className="w-6 h-6" />
                  )}
                </button>

                {/* Clock */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-white/5 blur-md" />
                  <div className="relative px-5 py-3 rounded-full bg-white/10 backdrop-blur font-mono font-bold flex items-center gap-2 border border-white/20">
                    {isDay ? (
                      <Sun className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Moon className="w-5 h-5 text-indigo-400" />
                    )}
                    <span className="text-lg">
                      {time.toString().padStart(2, "0")}:00
                    </span>
                  </div>
                </div>

                {/* Mode Badge */}
                <div
                  className={`px-6 py-3 rounded-full font-bold shadow-2xl transition-all duration-700 ${
                    isDay
                      ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"
                      : "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"
                  }`}
                >
                  {isDay ? "Active Mode" : "Autonomous Mode"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO - AI ORCHESTRATOR */}
      <section className="relative px-6 lg:px-8 pt-16 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Central Orchestrator Node */}
          <div className="relative mb-16">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none">
              {/* Coordination Waves */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 rounded-full border-2 ${
                    isDay ? "border-orange-500/30" : "border-purple-500/30"
                  }`}
                  style={{
                    animation: `ripple 3s ease-out infinite`,
                    animationDelay: `${i * 1}s`,
                  }}
                />
              ))}

              {/* AI Orchestrator Core */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className={`w-24 h-24 rounded-full bg-gradient-to-br ${
                    isDay
                      ? "from-orange-500 to-amber-500"
                      : "from-purple-600 to-indigo-600"
                  } shadow-2xl flex items-center justify-center transition-all duration-500 ${
                    orchestratorActive ? "scale-110" : "scale-100"
                  }`}
                >
                  <Brain className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <div className="text-center relative z-10 pt-32">
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">
                  {isDay
                    ? "Agentic AI • Real-time Coordination • Human-in-Loop"
                    : "Autonomous Agents • Background Processing • Self-Governance"}
                </span>
              </div>

              <h1
                className={`text-7xl sm:text-8xl lg:text-9xl font-black mb-10 leading-none transition-all duration-700 ${
                  isDay
                    ? "bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400"
                    : "bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"
                } bg-clip-text text-transparent`}
                style={{
                  textShadow: isDay
                    ? "0 0 80px rgba(251, 146, 60, 0.3)"
                    : "0 0 80px rgba(147, 51, 234, 0.3)",
                }}
              >
                AI
                <br />
                Orchestration
                <br />
                Studio
              </h1>

              <p className="text-2xl text-white/80 max-w-4xl mx-auto mb-4 leading-relaxed">
                Where Agentic AI, Generative Workflows, and MCP Governance
                <br />
                unite under intelligent metadata orchestration
              </p>
              <p className="text-lg text-white/60 max-w-3xl mx-auto mb-12">
                Coordinating autonomous agents, generative AI tasks, and
                compliance checks across 24/7 cycles
              </p>

              <Link
                href="/metadata/glossary"
                className={`inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all hover:scale-105 ${
                  isDay
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-500/50"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/50"
                }`}
              >
                <span>Enter Orchestration Studio</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AGENTIC AI DASHBOARD */}
      <section className="relative px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <Bot className="w-12 h-12" />
              Agentic AI Agents
            </h2>
            <p className="text-xl text-white/70">
              Autonomous agents executing tasks under MCP governance
            </p>
          </div>

          {/* AI Agent Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                label: "Validation Agents",
                value: metrics.processing,
                icon: CheckCircle2,
                color: isDay ? "blue" : "cyan",
                type: "Agentic",
              },
              {
                label: "Generative Tasks",
                value: metrics.validated,
                icon: Sparkles,
                color: "green",
                type: "GenAI",
              },
              {
                label: "MCP Workflows",
                value: metrics.indexed,
                icon: Workflow,
                color: isDay ? "orange" : "purple",
                type: "Protocol",
              },
              {
                label: "Metadata Ops",
                value: metrics.archived,
                icon: Database,
                color: isDay ? "amber" : "indigo",
                type: "Studio",
              },
            ].map((agent) => (
              <div
                key={agent.label}
                className="relative group"
                style={{
                  animation: `agentPulse 3s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-${agent.color}-500/20 to-${agent.color}-600/20 blur-2xl transition-all duration-500 group-hover:scale-110`}
                />

                <div className="relative backdrop-blur-xl bg-white/5 border-2 border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all shadow-2xl">
                  {/* Agent Type Badge */}
                  <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-bold border border-white/20">
                    {agent.type}
                  </div>

                  <agent.icon className="w-10 h-10 mb-4 text-white/90" />
                  <div className="text-5xl font-black mb-2">
                    {agent.value.toLocaleString()}
                  </div>
                  <div className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                    {agent.label}
                  </div>

                  {/* Activity Indicator */}
                  <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${agent.color}-500 to-${agent.color}-400 rounded-full transition-all duration-1000`}
                      style={{
                        width: `${50 + Math.random() * 50}%`,
                        animation: "activityPulse 2s ease-in-out infinite",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI WORKFLOW TYPES */}
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "Agentic AI",
                desc: "Autonomous decision-making agents",
                icon: Bot,
                color: isDay ? "blue" : "cyan",
                features: ["Self-directed", "Goal-oriented", "Adaptive"],
              },
              {
                name: "Generative AI",
                desc: "Content & code generation tasks",
                icon: Sparkles,
                color: isDay ? "amber" : "pink",
                features: [
                  "Metadata synthesis",
                  "Schema generation",
                  "Auto-docs",
                ],
              },
              {
                name: "MCP Governance",
                desc: "Protocol-based coordination",
                icon: Shield,
                color: isDay ? "orange" : "purple",
                features: ["Policy enforcement", "Audit trails", "Compliance"],
              },
            ].map((workflow) => (
              <div
                key={workflow.name}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br from-${workflow.color}-500/20 to-${workflow.color}-600/20`}
                  >
                    <workflow.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{workflow.name}</h3>
                    <p className="text-sm text-white/60">{workflow.desc}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {workflow.features.map((feature) => (
                    <div
                      key={feature}
                      className="px-4 py-2 rounded-lg bg-white/5 text-sm font-semibold border border-white/10"
                    >
                      ✓ {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MCP GOVERNANCE LAYER */}
      <section className="relative px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12">
            <div className="flex items-center gap-3 mb-10">
              <Shield className="w-10 h-10" />
              <h2 className="text-4xl font-bold">MCP Governance Layer</h2>
              <div className="text-sm text-white/60">
                (Model Context Protocol + Policy Enforcement)
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* External - Untrusted */}
              <div className="relative p-8 rounded-2xl bg-red-500/10 border-2 border-red-500/30 overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-20 h-20 bg-red-500 rounded-full blur-3xl"
                  style={{
                    animation: "warnPulse 2s ease-in-out infinite",
                  }}
                />
                <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">External Layer</h3>
                <p className="text-sm text-white/70 mb-4">
                  Untrusted sources • MCP validation required
                </p>
                <div className="space-y-2">
                  {["External APIs", "User Uploads", "3rd Party Data"].map(
                    (item) => (
                      <div
                        key={item}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm font-semibold"
                      >
                        ⚠ {item}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* MCP Validation */}
              <div
                className={`relative p-8 rounded-2xl border-2 transition-all ${
                  isDay
                    ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-400/50"
                    : "bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-400/50"
                }`}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  style={{
                    animation: "mcpScan 3s ease-in-out infinite",
                  }}
                />
                <Lock className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">MCP Validation</h3>
                <p className="text-sm text-white/70 mb-4">
                  Protocol-based checks • Policy enforcement
                </p>
                <div className="space-y-2">
                  {["Schema ✓", "Governance ✓", "Compliance ⏳"].map(
                    (check) => (
                      <div
                        key={check}
                        className="px-4 py-2 rounded-lg bg-white/10 text-sm font-semibold"
                      >
                        {check}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Internal - Trusted */}
              <div className="relative p-8 rounded-2xl bg-green-500/10 border-2 border-green-500/30">
                <CheckCircle2 className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Internal Layer</h3>
                <p className="text-sm text-white/70 mb-4">
                  Validated • Governed • Audit-ready
                </p>
                <div className="space-y-2">
                  {["Metadata Studio", "AI Agents", "GenAI Tasks"].map(
                    (item) => (
                      <div
                        key={item}
                        className="px-4 py-2 rounded-lg bg-green-500/20 text-green-300 text-sm font-semibold"
                      >
                        ✓ {item}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 24-HOUR ORCHESTRATION CYCLE */}
      <section className="relative px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12">
            <div className="flex items-center gap-3 mb-10">
              <Clock className="w-10 h-10" />
              <h2 className="text-4xl font-bold">24-Hour AI Orchestration</h2>
            </div>

            {/* Timeline Visual */}
            <div className="relative w-full h-32 mb-12">
              <div className="absolute inset-0 rounded-full bg-white/10 overflow-hidden">
                {/* Active Phase (Day) */}
                <div
                  className="absolute h-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-80"
                  style={{ width: "50%", left: "25%" }}
                />
                {/* Autonomous Phase (Night) */}
                <div
                  className="absolute h-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-80"
                  style={{ width: "25%", left: "0" }}
                />
                <div
                  className="absolute h-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-80 rounded-r-full"
                  style={{ width: "25%", left: "75%" }}
                />

                {/* Current time indicator */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl shadow-white/50 transition-all duration-1000"
                  style={{ left: `${(time / 24) * 100}%` }}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-white text-slate-900 text-sm font-bold shadow-2xl whitespace-nowrap">
                    {time.toString().padStart(2, "0")}:00
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mt-1" />
                <div>
                  <div className="font-bold">Active Mode (6:00 - 18:00)</div>
                  <div className="text-sm text-white/60">
                    Human-in-loop • Agentic AI • Real-time coordination
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 mt-1" />
                <div>
                  <div className="font-bold">
                    Autonomous Mode (18:00 - 6:00)
                  </div>
                  <div className="text-sm text-white/60">
                    Self-governance • Background tasks • Batch processing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 lg:px-8 py-32">
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className={`text-6xl sm:text-7xl font-black mb-8 ${
              isDay
                ? "bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400"
                : "bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"
            } bg-clip-text text-transparent`}
          >
            Build with AI Orchestration
          </h2>
          <p className="text-2xl text-white/80 mb-12">
            Agentic AI + Generative Workflows + MCP Governance = Metadata Studio
          </p>
          <Link
            href="/metadata/glossary"
            className={`inline-flex items-center gap-3 px-12 py-6 rounded-2xl font-bold text-2xl shadow-2xl transition-all hover:scale-105 ${
              isDay
                ? "bg-gradient-to-r from-orange-500 to-amber-500"
                : "bg-gradient-to-r from-purple-600 to-indigo-600"
            }`}
          >
            <Brain className="w-8 h-8" />
            <span>Start Orchestrating</span>
            <ArrowRight className="w-8 h-8" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 lg:px-8 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-white/50">
            © 2025 AI Orchestration Studio • Agentic AI • Generative Workflows •
            MCP Governance
          </p>
        </div>
      </footer>

      {/* CSS ANIMATIONS */}
      <style jsx>{`
        @keyframes agentFloat {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-30px) translateX(20px);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes agentPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes activityPulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes warnPulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes mcpScan {
          0%,
          100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
