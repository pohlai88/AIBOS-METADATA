"use client";

import { useState, useEffect } from "react";
import { Brain, CheckCircle2, XCircle, ArrowRight, Zap } from "lucide-react";

/**
 * Autonomous Decision Tree Visualization
 * 
 * Shows AI agents making decisions in real-time
 * Inspired by Kestra's workflow state transitions
 */

interface Decision {
  id: string;
  question: string;
  answer: "yes" | "no" | "pending";
  path: "left" | "right";
  timestamp: number;
}

const decisionScenarios = [
  {
    question: "Schema Valid?",
    yesPath: "Proceed to Validation",
    noPath: "Reject & Alert",
  },
  {
    question: "Compliance Met?",
    yesPath: "Approve Workflow",
    noPath: "Request Review",
  },
  {
    question: "Quality Threshold?",
    yesPath: "Auto-publish",
    noPath: "Manual Review",
  },
  {
    question: "MCP Authorized?",
    yesPath: "Grant Access",
    noPath: "Block Request",
  },
];

export function DecisionTreeViz({ isPaused, isDay }: { isPaused: boolean; isDay: boolean }) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [activeNode, setActiveNode] = useState<string>("root");

  // Cycle through scenarios
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentScenario((prev) => (prev + 1) % decisionScenarios.length);
      setActiveNode("root");
      setDecisions([]);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Simulate decision-making
  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      if (activeNode === "root") {
        const answer = Math.random() > 0.5 ? "yes" : "no";
        const path = answer === "yes" ? "left" : "right";
        
        setDecisions([
          {
            id: `decision-${Date.now()}`,
            question: decisionScenarios[currentScenario].question,
            answer,
            path,
            timestamp: Date.now(),
          },
        ]);
        setActiveNode(path);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentScenario, activeNode, isPaused]);

  const scenario = decisionScenarios[currentScenario];
  const latestDecision = decisions[0];

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Tree Container */}
      <div className="relative h-96 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
        {/* Root Node - AI Brain */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <div className="relative">
            {/* Pulse effect when thinking */}
            {activeNode === "root" && (
              <div
                className={`absolute inset-0 rounded-full ${
                  isDay ? "bg-orange-500" : "bg-purple-600"
                } opacity-20 animate-ping`}
                style={{ width: "80px", height: "80px", marginLeft: "-20px", marginTop: "-20px" }}
              />
            )}

            {/* Brain Node */}
            <div
              className={`relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${
                isDay
                  ? "from-orange-500 to-amber-500"
                  : "from-purple-600 to-indigo-600"
              } shadow-2xl border-4 border-white/20 transition-all duration-500 ${
                activeNode === "root" ? "scale-110" : "scale-100"
              }`}
            >
              <Brain className="w-8 h-8 text-white" />
              {activeNode === "root" && (
                <Zap className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 animate-pulse" />
              )}
            </div>

            {/* Question Label */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-sm font-bold text-white text-center">
                {scenario.question}
              </div>
            </div>
          </div>
        </div>

        {/* Decision Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Left path (YES) */}
          <path
            d="M 50% 120 Q 30% 180, 25% 280"
            stroke={latestDecision?.path === "left" ? "rgba(34, 197, 94, 0.8)" : "rgba(255, 255, 255, 0.2)"}
            strokeWidth={latestDecision?.path === "left" ? "4" : "2"}
            fill="none"
            strokeDasharray={latestDecision?.path === "left" ? "0" : "4 4"}
            className={latestDecision?.path === "left" ? "animate-pulse" : ""}
          />
          
          {/* Right path (NO) */}
          <path
            d="M 50% 120 Q 70% 180, 75% 280"
            stroke={latestDecision?.path === "right" ? "rgba(239, 68, 68, 0.8)" : "rgba(255, 255, 255, 0.2)"}
            strokeWidth={latestDecision?.path === "right" ? "4" : "2"}
            fill="none"
            strokeDasharray={latestDecision?.path === "right" ? "0" : "4 4"}
            className={latestDecision?.path === "right" ? "animate-pulse" : ""}
          />
        </svg>

        {/* Left Outcome (YES) */}
        <div className="absolute bottom-8 left-1/4 -translate-x-1/2">
          <div
            className={`flex flex-col items-center transition-all duration-500 ${
              latestDecision?.path === "left" ? "scale-110" : "scale-100"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                latestDecision?.path === "left"
                  ? "bg-green-500 shadow-2xl shadow-green-500/50"
                  : "bg-white/10 border-2 border-white/20"
              } transition-all duration-500`}
            >
              <CheckCircle2
                className={`w-7 h-7 ${
                  latestDecision?.path === "left" ? "text-white" : "text-white/50"
                }`}
              />
            </div>
            <div className="mt-3 text-center">
              <div className={`text-xs font-medium ${latestDecision?.path === "left" ? "text-green-400" : "text-white/60"}`}>
                YES
              </div>
              <div className="text-xs text-white/70 mt-1 whitespace-nowrap">
                {scenario.yesPath}
              </div>
            </div>
          </div>
        </div>

        {/* Right Outcome (NO) */}
        <div className="absolute bottom-8 right-1/4 translate-x-1/2">
          <div
            className={`flex flex-col items-center transition-all duration-500 ${
              latestDecision?.path === "right" ? "scale-110" : "scale-100"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                latestDecision?.path === "right"
                  ? "bg-red-500 shadow-2xl shadow-red-500/50"
                  : "bg-white/10 border-2 border-white/20"
              } transition-all duration-500`}
            >
              <XCircle
                className={`w-7 h-7 ${
                  latestDecision?.path === "right" ? "text-white" : "text-white/50"
                }`}
              />
            </div>
            <div className="mt-3 text-center">
              <div className={`text-xs font-medium ${latestDecision?.path === "right" ? "text-red-400" : "text-white/60"}`}>
                NO
              </div>
              <div className="text-xs text-white/70 mt-1 whitespace-nowrap">
                {scenario.noPath}
              </div>
            </div>
          </div>
        </div>

        {/* Decision Result */}
        {latestDecision && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <div
              className={`px-6 py-3 rounded-full font-bold text-sm shadow-2xl ${
                latestDecision.answer === "yes"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              Decision: {latestDecision.answer.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-white/70">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeNode === "root" ? "bg-yellow-500 animate-pulse" : "bg-white/30"}`} />
          Analyzing
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${latestDecision?.path === "left" ? "bg-green-500 animate-pulse" : "bg-white/30"}`} />
          Approved
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${latestDecision?.path === "right" ? "bg-red-500 animate-pulse" : "bg-white/30"}`} />
          Rejected
        </div>
      </div>
    </div>
  );
}

