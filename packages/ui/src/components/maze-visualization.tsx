"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { cn } from "../lib/cn";

/**
 * Maze Visualization Component
 * 
 * Represents the chaos and complexity of ERP systems.
 * The kite (user) flies above, navigating with control.
 * Crystals represent intelligence at intersections.
 * Liquid flows through paths showing data flow.
 */

interface MazeVisualizationProps {
  className?: string;
  mode?: "2d" | "3d";
  interactive?: boolean;
}

interface Crystal {
  id: string;
  x: number;
  y: number;
  size: number;
}

interface LiquidPath {
  id: string;
  path: string;
  progress: number;
}

export function MazeVisualization({
  className,
  mode = "2d",
  interactive = true,
}: MazeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [crystals, setCrystals] = useState<Crystal[]>([]);
  const [liquidPaths, setLiquidPaths] = useState<LiquidPath[]>([]);

  // Kite position (follows cursor)
  const kiteX = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const kiteY = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });

  // Handle position (fixed)
  const handleX = 80;
  const handleY = 220;

  // Generate maze structure (simplified for demo)
  useEffect(() => {
    // Generate crystals at intersections
    const newCrystals: Crystal[] = [];
    for (let i = 0; i < 12; i++) {
      newCrystals.push({
        id: `crystal-${i}`,
        x: 100 + (i % 4) * 120,
        y: 80 + Math.floor(i / 4) * 100,
        size: 8 + Math.random() * 8,
      });
    }
    setCrystals(newCrystals);

    // Generate liquid paths
    const paths = [
      { id: "path-1", path: "M80,220 Q120,180 160,140", progress: 0 },
      { id: "path-2", path: "M160,140 Q200,100 240,80", progress: 0 },
      { id: "path-3", path: "M240,80 Q280,60 320,100", progress: 0 },
      { id: "path-4", path: "M320,100 Q360,140 400,180", progress: 0 },
    ];
    setLiquidPaths(paths);
  }, []);

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x, y });
      kiteX.set(x - 24); // Center kite (48px / 2)
      kiteY.set(y - 24);
    },
    [kiteX, kiteY]
  );

  // Animate liquid flow
  useEffect(() => {
    const interval = setInterval(() => {
      setLiquidPaths((prev) =>
        prev.map((path) => ({
          ...path,
          progress: (path.progress + 0.02) % 1,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Calculate thread line (from handle to kite)
  const threadPath = `M ${handleX} ${handleY} L ${kiteX.get()} ${kiteY.get()}`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-bg via-bg-muted to-bg",
        "border border-border/50",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[100px]"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* SVG Container for Maze */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Maze Walls (Paths) */}
        <g className="maze-paths">
          {/* Horizontal paths */}
          <motion.path
            d="M 80 220 L 200 220"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className={cn(
              "text-fg-muted/30",
              hoveredPath === "path-1" && "text-primary/60"
            )}
            onMouseEnter={() => setHoveredPath("path-1")}
            onMouseLeave={() => setHoveredPath(null)}
            animate={{
              opacity: hoveredPath === "path-1" ? 1 : 0.3,
            }}
          />
          <motion.path
            d="M 200 220 L 320 180"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className={cn(
              "text-fg-muted/30",
              hoveredPath === "path-2" && "text-primary/60"
            )}
            onMouseEnter={() => setHoveredPath("path-2")}
            onMouseLeave={() => setHoveredPath(null)}
            animate={{
              opacity: hoveredPath === "path-2" ? 1 : 0.3,
            }}
          />
          <motion.path
            d="M 320 180 L 400 140"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className={cn(
              "text-fg-muted/30",
              hoveredPath === "path-3" && "text-primary/60"
            )}
            onMouseEnter={() => setHoveredPath("path-3")}
            onMouseLeave={() => setHoveredPath(null)}
            animate={{
              opacity: hoveredPath === "path-3" ? 1 : 0.3,
            }}
          />
          <motion.path
            d="M 400 140 L 480 100"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className={cn(
              "text-fg-muted/30",
              hoveredPath === "path-4" && "text-primary/60"
            )}
            onMouseEnter={() => setHoveredPath("path-4")}
            onMouseLeave={() => setHoveredPath(null)}
            animate={{
              opacity: hoveredPath === "path-4" ? 1 : 0.3,
            }}
          />

          {/* Vertical paths */}
          <motion.path
            d="M 200 220 L 200 140"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-fg-muted/30"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.path
            d="M 320 180 L 320 100"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-fg-muted/30"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </g>

        {/* Liquid Flow Animations */}
        <g className="liquid-paths">
          {liquidPaths.map((liquid) => (
            <motion.path
              key={liquid.id}
              d={liquid.path}
              stroke="url(#liquid-gradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="10 5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{
                pathLength: liquid.progress,
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </g>

        {/* Thread (from handle to kite) */}
        <motion.line
          x1={handleX}
          y1={handleY}
          x2={kiteX}
          y2={kiteY}
          stroke="url(#thread-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
          animate={{
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="liquid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="thread-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      {/* Crystals at Intersections */}
      <AnimatePresence>
        {crystals.map((crystal) => (
          <motion.div
            key={crystal.id}
            className="absolute"
            style={{
              left: `${crystal.x}px`,
              top: `${crystal.y}px`,
              width: `${crystal.size}px`,
              height: `${crystal.size}px`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
            whileHover={{
              scale: 1.5,
              opacity: 1,
            }}
          >
            {/* Crystal Shape (Glassmorphism) */}
            <div
              className={cn(
                "w-full h-full rounded-full",
                "bg-gradient-to-br from-primary/30 via-secondary/40 to-success/30",
                "backdrop-blur-md border border-white/20",
                "shadow-[0_0_20px_rgba(56,189,248,0.5)]"
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Handle (You) */}
      <motion.div
        className="absolute"
        style={{
          left: `${handleX - 35}px`,
          top: `${handleY - 35}px`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <div className="relative w-[70px] h-[70px] rounded-full border border-primary/50 bg-bg-elevated/80 backdrop-blur-md flex items-center justify-center shadow-lg">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-warning to-warning/60 shadow-[0_0_12px_rgba(248,150,69,0.9)]" />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-fg-muted">
            You
          </span>
        </div>
      </motion.div>

      {/* Kite (Lynx) - Follows Cursor */}
      <motion.div
        className="absolute"
        style={{
          x: kiteX,
          y: kiteY,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.1 }}
      >
        <div className="relative w-[48px] h-[48px] rounded-xl border border-primary/50 bg-bg-elevated/90 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.6)]">
          {/* Kite Core */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-teal-400 to-green-400 shadow-[0_0_26px_rgba(45,212,191,0.9)]" />
          {/* Orbit Ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-primary/40" />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-fg-muted">
            Lynx
          </span>
        </div>
        {/* Shadow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-8 h-4 bg-black/20 blur-md rounded-full" />
      </motion.div>
    </div>
  );
}


