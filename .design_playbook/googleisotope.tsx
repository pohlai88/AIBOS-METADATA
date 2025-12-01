import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Zap, 
  ArrowRight, 
  Terminal, 
  Activity, 
  Ghost, 
  Hexagon, 
  Aperture,
  Layers,
  ShieldCheck,
  Command,
  Disc
} from 'lucide-react';

/**
 * NANO BANANA PRO - PROTOCOL: ISOTOPE (ELEVENLABS QUALITY TARGET)
 * ----------------------------------------------------------------
 * Techniques:
 * 1. Mouse-tracking Spotlight Borders (The "Radium" effect).
 * 2. Noise Grain Overlays (The "Film/Cinema" quality).
 * 3. Prismatic Glass (Chromatic aberration simulation).
 * 4. Ultra-fine 1px borders with alpha-blending.
 */

// --- UTILS: MOUSE TRACKER ---
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);
  return mousePosition;
};

const DesignSystemProvider = ({ children }) => {
  return (
    <div className="font-sans antialiased text-fg bg-bg min-h-screen selection:bg-radium selection:text-bg overflow-x-hidden">
      <style>{`
        :root {
          /* --- PALETTE: ISOTOPE --- */
          /* Backgrounds: Deep Void with a hint of purple UV */
          --bg-void: #030005;
          --bg-panel: rgba(10, 10, 12, 0.6);
          --bg-panel-solid: #0A0A0C;

          /* Radium: High-Voltage Chartreuse */
          --radium: #CCFF00;
          --radium-dim: rgba(204, 255, 0, 0.2);
          --radium-glow: rgba(204, 255, 0, 0.5);

          /* Angel: Holographic White/Blue */
          --angel: #E0E7FF;
          --angel-dim: #6366F1;

          /* Text */
          --fg: #EDEDED;
          --fg-muted: #888888;
          --fg-dark: #111111;

          /* Borders */
          --border: rgba(255, 255, 255, 0.08);
          --border-light: rgba(255, 255, 255, 0.15);
        }

        body {
          background-color: var(--bg-void);
          color: var(--fg);
        }

        /* --- TEXTURE: NOISE --- */
        .bg-noise {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          z-index: 50;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
        }

        /* --- EFFECT: SPOTLIGHT --- */
        .spotlight-card {
          position: relative;
          overflow: hidden;
          background: var(--bg-panel);
          border: 1px solid var(--border);
        }
        .spotlight-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06), transparent 40%);
          z-index: 1;
          pointer-events: none;
        }
        .spotlight-border {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), var(--radium-glow), transparent 40%);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          padding: 1px; /* The border width */
        }

        /* --- TYPOGRAPHY --- */
        .font-display { font-family: 'Inter', sans-serif; letter-spacing: -0.02em; }
        .font-mono-tech { font-family: 'JetBrains Mono', monospace; letter-spacing: -0.05em; }

        /* --- ANIMATIONS --- */
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scanline {
          position: absolute;
          top: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(204, 255, 0, 0.05), transparent);
          animation: scanline 4s linear infinite;
          pointer-events: none;
        }
      `}</style>
      <div className="bg-noise" />
      {children}
    </div>
  );
};

// --- COMPONENTS: HIGH FIDELITY ---

const SpotlightCard = ({ children, className = "", noPadding = false }) => {
  const { x, y } = useMousePosition();
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setPosition({ x: x - rect.left, y: y - rect.top });
    }
  }, [x, y]);

  return (
    <div 
      ref={cardRef}
      className={`spotlight-card rounded-xl transition-colors duration-500 hover:bg-[#111] ${className}`}
      style={{ '--mouse-x': `${position.x}px`, '--mouse-y': `${position.y}px` }}
    >
      <div className="spotlight-border rounded-xl" />
      <div className={`relative z-10 ${noPadding ? '' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
};

const RadiumBadge = ({ children, active = false }) => (
  <span className={`
    inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono-tech uppercase tracking-wider border
    ${active 
      ? 'bg-radium/10 border-radium/40 text-radium shadow-[0_0_10px_rgba(204,255,0,0.2)]' 
      : 'bg-white/5 border-white/10 text-fg-muted'}
  `}>
    {active && <span className="w-1 h-1 rounded-full bg-radium animate-pulse"/>}
    {children}
  </span>
);

const Navbar = () => (
  <nav className="fixed top-0 w-full z-40 border-b border-white/5 bg-bg-void/80 backdrop-blur-xl">
    <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-radium text-bg-void flex items-center justify-center rounded-sm">
           <Zap size={12} fill="currentColor" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white">NANO BANANA</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-fg-muted">
        <a href="#" className="hover:text-white transition-colors">Manifesto</a>
        <a href="#" className="hover:text-white transition-colors">Protocol</a>
        <a href="#" className="hover:text-white transition-colors">Pricing</a>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-xs font-mono-tech text-fg-muted hover:text-white px-3 py-1.5 border border-white/10 rounded hover:bg-white/5 transition-all">
          LOG_IN
        </button>
        <button className="text-xs font-mono-tech bg-white text-black px-3 py-1.5 rounded font-bold hover:bg-radium transition-colors">
          INIT_SYSTEM
        </button>
      </div>
    </div>
  </nav>
);

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-radium opacity-[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-angel opacity-[0.05] blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center justify-center mb-8 border border-white/10 bg-white/5 rounded-full px-1 py-1 pr-4 backdrop-blur-md animate-fade-in-up">
           <span className="bg-radium text-black text-[10px] font-bold px-2 py-0.5 rounded-full mr-2">NEW</span>
           <span className="text-xs text-fg-muted">Protocol Isotope v2.0 is live</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-medium tracking-tighter text-white mb-6 leading-[0.95]">
          Orchestrate <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">The Impossible.</span>
        </h1>
        
        <p className="text-xl text-fg-muted max-w-2xl mx-auto mb-10 font-light">
          The sovereign AI ecosystem for high-precision enterprise. <br/>
          <span className="text-radium">Zero drift.</span> <span className="text-white">Total governance.</span>
        </p>

        <div className="flex justify-center gap-4">
          <button className="group relative px-8 py-3 bg-fg text-bg-void font-semibold rounded-lg overflow-hidden transition-all hover:pr-10">
             <span className="relative z-10 flex items-center gap-2">
               Start Orchestrating <ArrowRight size={16} className="transition-transform group-hover:translate-x-1"/>
             </span>
             <div className="absolute inset-0 bg-radium transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </button>
          
          <button className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all font-medium flex items-center gap-2">
             <Terminal size={16} className="text-fg-muted" /> Documentation
          </button>
        </div>
      </div>
      
      {/* Hero Visual - The "Angel" Interface */}
      <div className="mt-20 max-w-[1200px] mx-auto px-6 relative">
         <div className="absolute -inset-1 bg-gradient-to-b from-radium/20 to-transparent opacity-20 blur-xl" />
         <div className="relative rounded-xl border border-white/10 bg-[#050505] shadow-2xl overflow-hidden aspect-[16/9] group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            
            {/* Fake UI Header */}
            <div className="h-10 border-b border-white/5 flex items-center px-4 justify-between bg-white/5 backdrop-blur-md">
               <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
               </div>
               <div className="text-[10px] font-mono-tech text-fg-muted flex items-center gap-2">
                  <ShieldCheck size={10} className="text-radium" />
                  SECURE_CONNECTION // NANO_KERNEL_V1
               </div>
            </div>

            {/* UI Body - Abstract Data Vis */}
            <div className="p-8 h-full flex items-center justify-center relative">
               <div className="animate-scanline" />
               <div className="grid grid-cols-3 gap-8 w-full h-full">
                  
                  {/* Column 1: Metrics */}
                  <div className="space-y-4">
                     {[1,2,3].map(i => (
                        <div key={i} className="p-4 border border-white/5 bg-white/5 rounded hover:border-radium/30 transition-colors">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-mono-tech text-fg-muted">METRIC_{i}0{i}</span>
                              <Activity size={12} className="text-radium" />
                           </div>
                           <div className="text-2xl font-display text-white">{92 + i}%</div>
                           <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                              <div className="h-full bg-radium w-[80%]" />
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Column 2: Central Core */}
                  <div className="relative flex items-center justify-center">
                     <div className="absolute inset-0 bg-radium/5 blur-[50px]" />
                     <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center relative animate-[spin_10s_linear_infinite]">
                        <div className="absolute inset-2 border border-dashed border-radium/30 rounded-full" />
                     </div>
                     <div className="absolute w-32 h-32 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center flex-col text-center">
                        <Hexagon size={32} className="text-radium mb-2" strokeWidth={1} />
                        <div className="text-[10px] font-mono-tech text-fg-muted">CORE_ACTIVE</div>
                     </div>
                  </div>

                  {/* Column 3: Log Stream */}
                  <div className="font-mono-tech text-[10px] text-fg-muted space-y-2 opacity-70">
                     {[...Array(8)].map((_,i) => (
                        <div key={i} className="flex gap-2 border-b border-white/5 pb-1">
                           <span className="text-radium">{`>`}</span>
                           <span>[{(10+i)}:00:{42+i}]</span>
                           <span className="text-white">packet_verified_0x{i}9a</span>
                        </div>
                     ))}
                  </div>

               </div>
            </div>
         </div>
      </div>
    </section>
  );
};

const Features = () => (
  <section className="py-32 px-6 max-w-[1400px] mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
       <SpotlightCard className="col-span-2">
          <div className="mb-8">
             <RadiumBadge active>L1_ORCHESTRATOR</RadiumBadge>
          </div>
          <h3 className="text-3xl font-display text-white mb-4">The Brain.</h3>
          <p className="text-fg-muted leading-relaxed max-w-md">
             Unlike standard LLMs, the Nano Orchestrator breaks tasks into atomic units, assigns them to specialized agents, and enforces architectural boundaries.
          </p>
          <div className="mt-12 flex items-end justify-between">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full bg-white/10 border border-black backdrop-blur-md flex items-center justify-center text-[10px] text-white">
                      A{i}
                   </div>
                ))}
             </div>
             <Ghost className="text-radium opacity-50" size={48} strokeWidth={1} />
          </div>
       </SpotlightCard>

       <SpotlightCard>
          <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white">
             <Layers size={20} />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Dual-Mode UX</h4>
          <p className="text-sm text-fg-muted">Seamlessly switch between high-density Ledger grids and the agentic Cockpit.</p>
       </SpotlightCard>

       <SpotlightCard>
          <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white">
             <Aperture size={20} />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Anti-Drift</h4>
          <p className="text-sm text-fg-muted">Automated governance ensures your Figma tokens never diverge from production code.</p>
       </SpotlightCard>
    </div>
  </section>
);

const InteractiveCockpit = () => {
  const [activeTab, setActiveTab] = useState('cockpit');

  return (
    <section className="py-24 border-y border-white/5 bg-black/40 relative">
      <div className="max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row gap-16">
         
         <div className="lg:w-1/3">
            <RadiumBadge active>INTERACTIVE_DEMO</RadiumBadge>
            <h2 className="text-4xl md:text-5xl font-display text-white mt-6 mb-6">
               <span className="text-radium">Ledger</span> meets <br/> 
               <span className="text-angel-dim">Intelligence.</span>
            </h2>
            <p className="text-fg-muted text-lg leading-relaxed mb-8">
               Most AI tools are just chatbots. Nano Banana is a complete operating system. 
               Use the Ledger for speed. Use the Cockpit for strategy.
            </p>
            
            <div className="space-y-2">
               <button 
                  onClick={() => setActiveTab('ledger')}
                  className={`w-full text-left p-4 rounded border transition-all ${activeTab === 'ledger' ? 'bg-white/5 border-radium/50' : 'border-transparent hover:bg-white/5'}`}
               >
                  <div className="flex justify-between items-center text-white font-medium mb-1">
                     <span>Mode A: The Ledger</span>
                     {activeTab === 'ledger' && <div className="w-2 h-2 rounded-full bg-radium shadow-[0_0_8px_var(--radium)]" />}
                  </div>
                  <p className="text-xs text-fg-muted">Tabular density. Keyboard navigation. Zero latency.</p>
               </button>

               <button 
                  onClick={() => setActiveTab('cockpit')}
                  className={`w-full text-left p-4 rounded border transition-all ${activeTab === 'cockpit' ? 'bg-white/5 border-radium/50' : 'border-transparent hover:bg-white/5'}`}
               >
                  <div className="flex justify-between items-center text-white font-medium mb-1">
                     <span>Mode B: The Cockpit</span>
                     {activeTab === 'cockpit' && <div className="w-2 h-2 rounded-full bg-radium shadow-[0_0_8px_var(--radium)]" />}
                  </div>
                  <p className="text-xs text-fg-muted">Agentic planning. Visual diffs. Human-in-the-loop.</p>
               </button>
            </div>
         </div>

         <div className="lg:w-2/3 h-[600px] relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-radium to-angel-dim opacity-10 blur-xl rounded-2xl" />
            <div className="absolute inset-0 bg-[#050505] rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
               
               {/* Browser Chrome */}
               <div className="h-10 border-b border-white/5 bg-[#0A0A0C] flex items-center px-4 justify-between">
                  <div className="flex gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                     <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  </div>
                  <div className="flex bg-black/50 border border-white/10 rounded px-3 py-1 text-[10px] text-fg-muted font-mono-tech w-1/3 justify-center">
                     nano://{activeTab}.system
                  </div>
                  <div className="w-10" />
               </div>

               {/* Viewport */}
               <div className="flex-1 relative overflow-hidden">
                  {activeTab === 'ledger' ? (
                     <div className="h-full flex flex-col animate-fade-in bg-[#030303]">
                        {/* LEDGER HEADER */}
                        <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-[#080808]">
                           <div className="text-sm font-medium text-white flex items-center gap-2">
                              <span className="text-radium">GL_JOURNAL_2025</span>
                              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-fg-muted">READ_ONLY</span>
                           </div>
                           <div className="flex gap-2 text-[10px] font-mono-tech text-fg-muted">
                              <span>ROWS: 14,203</span>
                              <span className="text-radium">SYNCED</span>
                           </div>
                        </div>
                        {/* LEDGER GRID */}
                        <div className="flex-1 overflow-hidden font-mono-tech text-xs">
                           <div className="flex border-b border-white/5 text-fg-muted bg-white/5">
                              <div className="w-24 p-3 border-r border-white/5">DATE</div>
                              <div className="w-32 p-3 border-r border-white/5">REF_ID</div>
                              <div className="flex-1 p-3 border-r border-white/5">DESCRIPTION</div>
                              <div className="w-32 p-3 text-right">AMOUNT</div>
                           </div>
                           {[...Array(15)].map((_, i) => (
                              <div key={i} className="flex border-b border-white/5 hover:bg-white/5 transition-colors group cursor-default text-fg-muted hover:text-white">
                                 <div className="w-24 p-3 border-r border-white/5">2025-10-{10+i}</div>
                                 <div className="w-32 p-3 border-r border-white/5 text-radium/70 group-hover:text-radium">TX-882{i}</div>
                                 <div className="flex-1 p-3 border-r border-white/5">AWS Infrastructure / Compute Unit {i}</div>
                                 <div className="w-32 p-3 text-right font-medium">$ {(1240.50 + i).toFixed(2)}</div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ) : (
                     <div className="h-full bg-[#050505] p-8 flex flex-col animate-fade-in relative">
                        {/* COCKPIT UI */}
                        <div className="absolute top-0 left-0 w-full h-[300px] bg-radium opacity-[0.02] blur-[80px] pointer-events-none" />
                        
                        <div className="flex items-start gap-6 mb-8 relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                              <Cpu size={24} className="text-radium" />
                           </div>
                           <div>
                              <h3 className="text-2xl font-display text-white">System Status</h3>
                              <p className="text-sm text-fg-muted">Orchestrator is monitoring 4 active streams.</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                           <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-radium/50 transition-colors">
                              <div className="text-[10px] font-mono-tech text-fg-muted mb-2 uppercase">Anomaly Detected</div>
                              <div className="text-lg text-white font-medium mb-1">Variance detected in Q3 Tax</div>
                              <div className="text-sm text-fg-muted mb-4">The calculated VAT output differs from the posted journal by 4.2%.</div>
                              <button className="text-xs bg-radium text-black px-3 py-1.5 rounded font-bold hover:bg-white transition-colors">
                                 Review Plan
                              </button>
                           </div>
                           <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                              <div className="text-[10px] font-mono-tech text-fg-muted mb-2 uppercase">System Health</div>
                              <div className="flex items-center gap-4 mt-4">
                                 <div className="relative w-20 h-20">
                                    <svg className="w-full h-full transform -rotate-90">
                                       <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                                       <circle cx="40" cy="40" r="36" stroke="var(--radium)" strokeWidth="6" fill="none" strokeDasharray="226" strokeDashoffset="20" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">94%</div>
                                 </div>
                                 <div className="text-xs text-fg-muted space-y-1">
                                    <div>Latency: <span className="text-white">12ms</span></div>
                                    <div>Uptime: <span className="text-white">99.99%</span></div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="mt-auto border-t border-white/5 pt-4 relative z-10">
                           <div className="bg-black/40 border border-white/10 rounded p-3 flex items-center gap-3">
                              <Command size={16} className="text-radium" />
                              <span className="text-sm text-fg-muted">Ask the kernel...</span>
                              <div className="ml-auto text-[10px] font-mono-tech text-fg-muted bg-white/5 px-2 py-1 rounded">CMD+K</div>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

            </div>
         </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 px-6 border-t border-white/5 bg-bg-void text-center relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radium opacity-[0.02] blur-[100px] pointer-events-none" />
    <div className="relative z-10">
       <div className="flex items-center justify-center gap-2 mb-6 text-white/40">
          <Disc size={24} className="animate-spin-slow" />
       </div>
       <p className="text-sm text-fg-muted mb-8">
          Nano Banana Pro © 2025 <br/>
          Protocol Isotope v2.1.4
       </p>
       <div className="flex justify-center gap-6 text-xs font-mono-tech text-fg-muted uppercase tracking-widest">
          <a href="#" className="hover:text-radium transition-colors">Twitter</a>
          <a href="#" className="hover:text-radium transition-colors">GitHub</a>
          <a href="#" className="hover:text-radium transition-colors">Status</a>
       </div>
    </div>
  </footer>
);

const App = () => {
  return (
    <DesignSystemProvider>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <InteractiveCockpit />
      </main>
      <Footer />
    </DesignSystemProvider>
  );
};

export default App;