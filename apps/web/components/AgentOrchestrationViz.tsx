"use client";

import { useState, useEffect, useMemo } from "react";
import { Bot, Zap, CheckCircle2, ArrowRight, Brain } from "lucide-react";

/**
 * Agent Orchestration Visualization
 * 
 * Inspired by Kestra's workflow visualization
 * Shows real-time agent coordination and task execution
 */

interface Task {
  id: string;
  name: string;
  agent: string;
  status: "queued" | "running" | "completed";
  progress: number;
  startTime: number;
}

interface Agent {
  id: string;
  name: string;
  type: "validation" | "generation" | "governance" | "metadata";
  status: "idle" | "busy" | "waiting";
  tasksCompleted: number;
  position: { x: number; y: number };
}

export function AgentOrchestrationViz({ isPaused }: { isPaused: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "agent-1",
      name: "Validator-01",
      type: "validation",
      status: "idle",
      tasksCompleted: 0,
      position: { x: 20, y: 30 },
    },
    {
      id: "agent-2",
      name: "Generator-02",
      type: "generation",
      status: "idle",
      tasksCompleted: 0,
      position: { x: 50, y: 20 },
    },
    {
      id: "agent-3",
      name: "Governor-03",
      type: "governance",
      status: "idle",
      tasksCompleted: 0,
      position: { x: 80, y: 30 },
    },
    {
      id: "agent-4",
      name: "Metadata-04",
      type: "metadata",
      status: "idle",
      tasksCompleted: 0,
      position: { x: 50, y: 70 },
    },
  ]);

  // Task generator
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const taskNames = [
        "Validate Schema",
        "Generate Metadata",
        "Check Compliance",
        "Index Documents",
        "Transform Data",
        "Audit Trail",
        "Quality Check",
        "Sync Repository",
      ];

      const agentTypes: Agent["type"][] = ["validation", "generation", "governance", "metadata"];

      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: taskNames[Math.floor(Math.random() * taskNames.length)],
        agent: agentTypes[Math.floor(Math.random() * agentTypes.length)],
        status: "queued",
        progress: 0,
        startTime: Date.now(),
      };

      setTasks((prev) => [...prev.slice(-4), newTask]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Task processor
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.status === "queued") {
            return { ...task, status: "running", progress: 10 };
          }
          if (task.status === "running" && task.progress < 100) {
            return { ...task, progress: Math.min(100, task.progress + 20) };
          }
          if (task.progress >= 100 && task.status !== "completed") {
            // Update agent stats
            setAgents((agents) =>
              agents.map((agent) =>
                agent.type === task.agent
                  ? { ...agent, tasksCompleted: agent.tasksCompleted + 1 }
                  : agent
              )
            );
            return { ...task, status: "completed" };
          }
          return task;
        })
      );
    }, 800);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Agent status updater
  useEffect(() => {
    if (isPaused) return;

    const runningTasks = tasks.filter((t) => t.status === "running");
    setAgents((prev) =>
      prev.map((agent) => ({
        ...agent,
        status: runningTasks.some((t) => t.agent === agent.type)
          ? "busy"
          : "idle",
      }))
    );
  }, [tasks, isPaused]);

  const agentColors = {
    validation: { bg: "bg-blue-500", border: "border-blue-400", glow: "shadow-blue-500/50" },
    generation: { bg: "bg-green-500", border: "border-green-400", glow: "shadow-green-500/50" },
    governance: { bg: "bg-purple-500", border: "border-purple-400", glow: "shadow-purple-500/50" },
    metadata: { bg: "bg-amber-500", border: "border-amber-400", glow: "shadow-amber-500/50" },
  };

  return (
    <div className="relative w-full">
      {/* Agent Network Graph */}
      <div className="relative h-96 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden mb-8">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Connection Lines */}
          {agents.map((agent, i) =>
            agents.slice(i + 1).map((targetAgent, j) => (
              <line
                key={`${agent.id}-${targetAgent.id}`}
                x1={`${agent.position.x}%`}
                y1={`${agent.position.y}%`}
                x2={`${targetAgent.position.x}%`}
                y2={`${targetAgent.position.y}%`}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            ))
          )}
          
          {/* Active Connection Pulses */}
          {tasks
            .filter((t) => t.status === "running")
            .map((task, idx) => {
              const sourceAgent = agents.find((a) => a.type === task.agent);
              const targetAgent = agents[(agents.findIndex((a) => a.type === task.agent) + 1) % agents.length];
              if (!sourceAgent || !targetAgent) return null;
              
              return (
                <line
                  key={task.id}
                  x1={`${sourceAgent.position.x}%`}
                  y1={`${sourceAgent.position.y}%`}
                  x2={`${targetAgent.position.x}%`}
                  y2={`${targetAgent.position.y}%`}
                  stroke="rgba(96, 165, 250, 0.6)"
                  strokeWidth="3"
                  className="animate-pulse"
                />
              );
            })}
        </svg>

        {/* Agent Nodes */}
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
            style={{
              left: `${agent.position.x}%`,
              top: `${agent.position.y}%`,
            }}
          >
            {/* Pulse ring when busy */}
            {agent.status === "busy" && (
              <div
                className={`absolute inset-0 rounded-full ${agentColors[agent.type].bg} opacity-30 animate-ping`}
                style={{ width: "100px", height: "100px", marginLeft: "-20px", marginTop: "-20px" }}
              />
            )}

            {/* Agent Node */}
            <div
              className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 ${
                agentColors[agent.type].border
              } ${agentColors[agent.type].bg} shadow-2xl ${
                agent.status === "busy" ? agentColors[agent.type].glow : ""
              } transition-all duration-300`}
            >
              <Bot className="w-6 h-6 text-white" />
              {agent.status === "busy" && (
                <Zap className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400 animate-pulse" />
              )}
            </div>

            {/* Agent Label */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <div className="text-xs font-bold text-white/90">{agent.name}</div>
              <div className="text-xs text-white/60">{agent.tasksCompleted} tasks</div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Execution Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Live Task Stream</h3>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {tasks.filter((t) => t.status === "running").length} running
          </div>
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-white/50">
            Waiting for tasks...
          </div>
        )}

        {tasks.slice().reverse().map((task, index) => (
          <div
            key={task.id}
            className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-500 hover:border-white/20"
            style={{
              animation: "fadeInUp 0.5s ease-out",
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {task.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : task.status === "running" ? (
                  <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                )}
                <div>
                  <div className="font-medium text-white">{task.name}</div>
                  <div className="text-xs text-white/60">Agent: {task.agent}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === "completed"
                      ? "bg-green-500/20 text-green-400"
                      : task.status === "running"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {task.status}
                </span>
                {task.status !== "queued" && (
                  <span className="text-sm font-mono text-white/70">
                    {task.progress}%
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {task.status !== "queued" && (
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    task.status === "completed"
                      ? "bg-green-500"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

