"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Box, 
  Lock, 
  Search 
} from "lucide-react";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- COMPONENTS ---

// 1. THE AURORA BACKGROUND (The "Living" Atmosphere)
const AuroraBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-primary/20 blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-50" />
      <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/20 blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen opacity-50" />
      <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-success/20 blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen opacity-50" />
      {/* Noise Texture for that "Physical" feel */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
    </div>
  );
};

// 2. THE NEURAL ORB (The "Brain")
const NeuralOrb = ({ state = "idle" }: { state?: "idle" | "active" | "thinking" }) => {
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      {/* Outer Rings */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-dashed border-primary/20"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 rounded-full border border-primary/10"
      />
      
      {/* The Core */}
      <motion.div 
        animate={{ 
          scale: state === "active" ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: state === "active" ? 0.8 : 0.5,
          boxShadow: state === "active" 
            ? "0 0 50px var(--color-primary)" 
            : "0 0 20px var(--color-primary-soft)"
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-8 h-8 rounded-full bg-primary shadow-lg z-10"
      />
      
      {/* Pulse Effect */}
      <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl animate-pulse" />
    </div>
  );
};

// 3. 3D SPOTLIGHT CARD (Mouse-aware Physics)
const SpotlightCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative border border-border bg-bg-elevated/50 overflow-hidden rounded-xl",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              var(--color-primary-soft),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

// 4. TEXT REVEAL (Typewriter / Cipher)
const RevealText = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  const words = text.split(" ");
  return (
    <motion.span className="inline-block overflow-hidden">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: delay + i * 0.05 }}
          className="inline-block mr-1.5"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

// 5. THE TRACING BEAM (Timeline)
const TracingBeam = () => {
  const { scrollYProgress } = useScroll();
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1000]), {
    stiffness: 500, 
    damping: 90 
  });

  return (
    <div className="absolute left-8 top-0 bottom-0 w-[2px] hidden md:block">
      <div className="h-full w-full bg-border-subtle" />
      <motion.div 
        style={{ height: y }}
        className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-secondary to-success shadow-[0_0_15px_var(--color-primary)]"
      />
    </div>
  );
};


// --- PAGE COMPONENT ---

export default function NanoShowcasePage() {
  const [activeTab, setActiveTab] = useState<"analysis" | "execution" | "result">("analysis");

  return (
    <div className="min-h-screen font-sans text-fg selection:bg-primary/30 relative">
      
      {/* LAYER 0: ATMOSPHERE */}
      <AuroraBackground />

      {/* LAYER 1: CONTENT */}
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:pl-24">
        
        {/* The Timeline Spine */}
        <TracingBeam />

        {/* HERO SECTION */}
        <section className="mb-32 relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            {/* The Brain */}
            <div className="flex-shrink-0">
              <NeuralOrb state="active" />
            </div>

            {/* The Headline */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono font-bold tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                SYSTEM ONLINE v3.0
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                <RevealText text="Beyond the Dashboard." />
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  <RevealText text="Biomimetic Intelligence." delay={0.5} />
                </span>
              </h1>
              
              <p className="text-xl text-fg-muted max-w-2xl leading-relaxed">
                <RevealText 
                  text="Experience an ERP that breathes. Built on the Nano Banana Physics Engine, adapting to risk, trust, and human intent in real-time." 
                  delay={1.0} 
                />
              </p>

              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Initialize Cockpit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "var(--color-bg-elevated)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-bg-muted/50 border border-border text-fg font-semibold rounded-xl backdrop-blur-md"
                >
                  View Documentation
                </motion.button>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE GRID (Glass + Physics) */}
        <section className="grid md:grid-cols-3 gap-6 mb-32">
          
          <SpotlightCard className="p-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Real-Time Processing</h3>
            <p className="text-fg-muted">
              Data isn't just displayed; it flows. The system pulses with live updates from the Kernel.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-8">
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-6 text-success">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Adaptive Trust</h3>
            <p className="text-fg-muted">
              The UI physically shifts contrast modes when high-risk variances are detected.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-8">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mb-6 text-warning">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Biomimetic Feedback</h3>
            <p className="text-fg-muted">
              Interfaces that respond to touch with spring physics, mimicking organic material.
            </p>
          </SpotlightCard>

        </section>

        {/* INTERACTIVE DEMO (The "Cockpit") */}
        <section className="relative rounded-3xl border border-border bg-bg-elevated/30 backdrop-blur-xl overflow-hidden">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-bg/50">
            <div className="flex items-center gap-4">
               <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-danger/50" />
                 <div className="w-3 h-3 rounded-full bg-warning/50" />
                 <div className="w-3 h-3 rounded-full bg-success/50" />
               </div>
               <span className="text-sm font-mono text-fg-subtle">AI-BOS // COCKPIT EXECUTION PLANE</span>
            </div>
            <div className="flex gap-4 text-xs font-mono">
               <span className="text-primary">LATENCY: 12ms</span>
               <span className="text-success">KERNEL: SECURE</span>
            </div>
          </div>

          {/* Main Interface */}
          <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12">
            
            {/* Sidebar Controls */}
            <div className="w-full md:w-64 space-y-2">
               {[
                 { id: "analysis", label: "Analysis", icon: Search },
                 { id: "execution", label: "Execution", icon: Box },
                 { id: "result", label: "Result", icon: Lock },
               ].map((item) => (
                 <button
                   key={item.id}
                   onClick={() => setActiveTab(item.id as any)}
                   className={cn(
                     "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                     activeTab === item.id 
                       ? "bg-primary/10 text-primary border border-primary/20" 
                       : "text-fg-muted hover:bg-bg-muted hover:text-fg"
                   )}
                 >
                   <item.icon className="w-4 h-4" />
                   {item.label}
                   {activeTab === item.id && (
                     <motion.div 
                       layoutId="active-pill"
                       className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                     />
                   )}
                 </button>
               ))}
            </div>

            {/* Dynamic Viewport */}
            <div className="flex-1 min-h-[400px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {activeTab === "analysis" && (
                     <div className="space-y-6">
                       <h3 className="text-2xl font-bold">Scope Analysis</h3>
                       <div className="p-6 rounded-xl border border-dashed border-border bg-bg/50">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-spin-slow">
                              <Cpu className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-mono text-sm">Scanning GL Entries...</span>
                          </div>
                          <div className="h-2 w-full bg-bg-muted rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: "0%" }}
                               animate={{ width: "100%" }}
                               transition={{ duration: 2, ease: "easeInOut" }}
                               className="h-full bg-primary"
                             />
                          </div>
                       </div>
                     </div>
                  )}

                  {activeTab === "execution" && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-warning">Variance Detected</h3>
                      <div className="p-6 rounded-xl border border-warning/30 bg-warning/5">
                        <p className="text-fg mb-4">Tier 1 Risk: Unmatched FX revaluation of $4.2M.</p>
                        <button className="px-4 py-2 bg-warning text-warning-foreground font-bold rounded-lg text-sm">
                          Review Diff
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "result" && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-success">Audit Locked</h3>
                      <div className="flex items-center justify-center h-48 rounded-xl border border-success/20 bg-success/5">
                        <div className="text-center">
                          <div className="inline-flex p-4 rounded-full bg-success/10 text-success mb-4">
                            <ShieldCheck className="w-8 h-8" />
                          </div>
                          <p className="font-mono text-sm text-success">Evidence Locker #EL-992 Sealed</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}