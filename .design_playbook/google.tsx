import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Terminal, 
  Zap, 
  ArrowRight, 
  LayoutTemplate, 
  GitBranch, 
  Box, 
  Activity 
} from 'lucide-react';

/**
 * NANO BANANA PRO - DESIGN SYSTEM IMPLEMENTATION
 * * Based on the provided 'tokens.ts' and AI-BOS specifications.
 * This configuration bridges the gap between semantic TypeScript tokens
 * and raw CSS variables injected into the DOM.
 */

const DesignSystemProvider = ({ children }) => {
  return (
    <div className="font-sans antialiased text-fg bg-bg min-h-screen selection:bg-primary selection:text-primary-foreground">
      <style>{`
        :root {
          /* --- CORE PALETTE (NANO BANANA DARK MODE) --- */
          /* Backgrounds */
          --bg: 10 10 10;           /* #0a0a0a - Deep Void */
          --bg-muted: 23 23 23;     /* #171717 - Muted Void */
          --bg-elevated: 38 38 38;  /* #262626 - Card Surface */

          /* Foreground / Text */
          --fg: 250 250 250;        /* #fafafa - Pure White */
          --fg-muted: 163 163 163;  /* #a3a3a3 - Muted Grey */
          --fg-subtle: 82 82 82;    /* #525252 - Subtle Grey */

          /* Brand - The "Nano Banana" Gold */
          --primary: 255 215 0;             /* #FFD700 - Electric Gold */
          --primary-foreground: 10 10 10;   /* Black text on Gold */
          --primary-soft: 66 58 10;         /* Low opacity gold for backgrounds */

          /* Secondary */
          --secondary: 45 45 45;
          --secondary-foreground: 250 250 250;
          --secondary-soft: 38 38 38;

          /* Semantic Status */
          --success: 34 197 94;
          --success-soft: 20 83 45;
          --warning: 245 158 11;
          --warning-soft: 120 53 15;
          --danger: 239 68 68;
          --danger-soft: 127 29 29;

          /* Borders & Rings */
          --border: 64 64 64;
          --border-subtle: 40 40 40;
          --ring: 255 215 0;

          /* Radii */
          --radius-xs: 0.125rem;
          --radius-sm: 0.25rem;
          --radius-md: 0.375rem;
          --radius-lg: 0.5rem;
          --radius-xl: 0.75rem;
          --radius-2xl: 1rem;
          --radius-full: 9999px;

          /* Shadows */
          --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }

        /* Utility Class Mappings to Vars (Simulating Tailwind Config) */
        .bg-bg { background-color: rgb(var(--bg)); }
        .bg-bg-muted { background-color: rgb(var(--bg-muted)); }
        .bg-bg-elevated { background-color: rgb(var(--bg-elevated)); }
        
        .text-fg { color: rgb(var(--fg)); }
        .text-fg-muted { color: rgb(var(--fg-muted)); }
        .text-fg-subtle { color: rgb(var(--fg-subtle)); }

        .bg-primary { background-color: rgb(var(--primary)); }
        .bg-primary-soft { background-color: rgb(var(--primary-soft)); }
        .text-primary-foreground { color: rgb(var(--primary-foreground)); }

        .bg-secondary { background-color: rgb(var(--secondary)); }
        .bg-secondary-soft { background-color: rgb(var(--secondary-soft)); }
        .text-secondary-foreground { color: rgb(var(--secondary-foreground)); }

        .border-border { border-color: rgb(var(--border)); }
        .border-border-subtle { border-color: rgb(var(--border-subtle)); }
        
        .ring-ring { --tw-ring-color: rgb(var(--ring)); }

        /* Animation Keyframes */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; box-shadow: 0 0 20px rgba(255, 215, 0, 0.1); }
          50% { opacity: 1; box-shadow: 0 0 40px rgba(255, 215, 0, 0.3); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-glow 4s ease-in-out infinite; }
      `}</style>
      {children}
    </div>
  );
};

// --- ATOMIC COMPONENTS (Based on provided componentTokens) ---

const ButtonPrimary = ({ children, className = "", ...props }) => (
  <button 
    className={`
      inline-flex items-center justify-center gap-1.5 
      px-4 py-2 rounded-[var(--radius-lg)] 
      bg-primary text-primary-foreground 
      shadow-[var(--shadow-xs)] 
      transition hover:opacity-95 active:scale-[0.98] 
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
      font-semibold tracking-tight
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);

const ButtonGhost = ({ children, className = "", ...props }) => (
  <button 
    className={`
      inline-flex items-center justify-center gap-1.5 
      px-3 py-1.5 rounded-[var(--radius-lg)] 
      bg-bg-elevated text-fg 
      border border-transparent hover:border-border hover:bg-bg-muted 
      active:scale-[0.98] transition
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
      text-sm font-medium
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);

const Badge = ({ children, variant = "primary" }) => {
  const styles = variant === "primary" 
    ? "bg-primary-soft text-primary-foreground border-transparent"
    : "bg-bg-muted text-fg-muted border-border-subtle";
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`
    bg-bg-elevated text-fg 
    border border-border rounded-[var(--radius-lg)] 
    shadow-[var(--shadow-xs)] p-6
    ${className}
  `}>
    {children}
  </div>
);

// --- SECTIONS ---

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-md border-b border-border-subtle">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-[var(--radius-md)] flex items-center justify-center text-primary-foreground">
          <Zap size={20} fill="currentColor" />
        </div>
        <span className="text-lg font-bold tracking-tight text-fg">Nano Banana <span className="text-primary">Pro</span></span>
      </div>
      <div className="hidden md:flex gap-8 text-sm font-medium text-fg-muted">
        <a href="#orchestra" className="hover:text-primary transition-colors">The Orchestra</a>
        <a href="#dual-mode" className="hover:text-primary transition-colors">Dual-Mode UX</a>
        <a href="#governance" className="hover:text-primary transition-colors">Governance</a>
      </div>
      <div className="flex gap-3">
        <ButtonGhost>Sign In</ButtonGhost>
        <ButtonPrimary>Get Access</ButtonPrimary>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
    {/* Abstract Background Elements */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-soft opacity-10 blur-[120px] rounded-full pointer-events-none" />
    
    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
      <div className="flex justify-center mb-6">
        <Badge variant="muted">v1.0.0 Public Beta</Badge>
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
        Stop Vibe Coding. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
          Start Orchestrating.
        </span>
      </h1>
      <p className="text-lg md:text-xl text-fg-muted max-w-2xl mx-auto mb-10 leading-relaxed">
        The first Sovereign AI Ecosystem for the Enterprise. 
        Replacing chaos with governed Orchestras, strictly typed Agents, and MCP-powered tools.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <ButtonPrimary className="h-12 px-8 text-base">
          Deploy Your Orchestra <ArrowRight size={18} />
        </ButtonPrimary>
        <ButtonGhost className="h-12 px-8 text-base">
          Read the Manifesto
        </ButtonGhost>
      </div>

      {/* Hero Visual: The L1 Orchestrator */}
      <div className="mt-20 relative mx-auto max-w-4xl animate-float">
        <div className="bg-bg-elevated rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="bg-bg-muted px-4 py-2 border-b border-border flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-danger/50" />
              <div className="w-3 h-3 rounded-full bg-warning/50" />
              <div className="w-3 h-3 rounded-full bg-success/50" />
            </div>
            <div className="ml-4 text-xs font-mono text-fg-subtle">frontend-orchestrator.manifest.json</div>
          </div>
          <div className="p-6 font-mono text-sm text-left grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="text-primary font-bold mb-2">// INCOMING TASK: L0 -&gt; L1</div>
              <div className="p-3 bg-bg rounded-[var(--radius-md)] border border-border-subtle text-fg-muted">
                <span className="text-primary">Task:</span> "Refactor Landing Hero"<br/>
                <span className="text-primary">Policy:</span> Fortune 500 Grade<br/>
                <span className="text-primary">Tokens:</span> Strict Mode
              </div>
              <div className="flex flex-col gap-2 relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border border-dashed" />
                <div className="flex items-center gap-3 pl-8">
                  <div className="p-1.5 bg-primary-soft rounded text-primary"><LayoutTemplate size={14} /></div>
                  <span className="text-fg">Lynx.UIUXEngineer</span>
                </div>
                <div className="flex items-center gap-3 pl-8">
                  <div className="p-1.5 bg-bg-muted rounded text-fg-muted"><Terminal size={14} /></div>
                  <span className="text-fg">Lynx.FrontendImplementor</span>
                </div>
                <div className="flex items-center gap-3 pl-8">
                  <div className="p-1.5 bg-bg-muted rounded text-fg-muted"><ShieldCheck size={14} /></div>
                  <span className="text-fg">Lynx.FrontendTester</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
               <div className="text-success font-bold mb-2">// GENERATING DIFF...</div>
               <div className="p-3 bg-bg rounded-[var(--radius-md)] border border-border-subtle text-xs leading-relaxed text-fg-muted opacity-80">
                 <span className="text-danger">- bg-blue-500</span><br/>
                 <span className="text-success">+ bg-primary</span><br/>
                 <span className="text-danger">- rounded-xl</span><br/>
                 <span className="text-success">+ rounded-[var(--radius-lg)]</span><br/>
                 <span className="text-primary mt-2 block"># Governance Check Passed.</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FeatureCard = ({ icon: Icon, title, description, badge }) => (
  <Card className="hover:border-primary/50 transition duration-300 group h-full">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-bg-muted rounded-[var(--radius-md)] group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon size={24} />
      </div>
      {badge && <Badge>{badge}</Badge>}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-fg group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-fg-muted leading-relaxed text-sm">{description}</p>
  </Card>
);

const Features = () => (
  <section id="orchestra" className="py-24 bg-bg-muted/30 border-y border-border-subtle">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">The AI Orchestra Model</h2>
        <p className="text-fg-muted">
          We don't just "chat" with AI. We assign strict Roles, provide MCP Tools, and enforce Governance.
          Based on the <span className="text-fg font-medium">AI-BOS 4W1H Strategy</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
          icon={Layers}
          title="L1 Orchestrator"
          badge="Core"
          description="The central brain that breaks down complex requests (L0) into atomic tasks for specialized agents, ensuring no context is lost."
        />
        <FeatureCard 
          icon={Box}
          title="Agentic Specialists"
          badge="L2 Layer"
          description="Specialized personas (Lynx.UIUX, Lynx.DBA) that only do one thing perfectly. No hallucinating generalists."
        />
        <FeatureCard 
          icon={Terminal}
          title="MCP Tooling"
          badge="L3 Layer"
          description="Agents connect to the real world via Model Context Protocol. Git, Figma, Linear, and Database access—strictly scoped."
        />
        <FeatureCard 
          icon={ShieldCheck}
          title="Governance Kernel"
          description="Tokens are Law. The Kernel blocks any code that violates design tokens, schema definitions, or security policies."
        />
        <FeatureCard 
          icon={LayoutTemplate}
          title="Dual-Mode UX"
          badge="Innovation"
          description="Seamlessly switch between 'The Ledger' (High-density Grid) and 'The Cockpit' (AI Planner). Stability meets Agility."
        />
        <FeatureCard 
          icon={GitBranch}
          title="Anti-Drift System"
          description="Automated drift detection ensures the Figma design system and the production React code never diverge."
        />
      </div>
    </div>
  </section>
);

const InteractivePreview = () => {
  const [activeMode, setActiveMode] = useState('cockpit');

  return (
    <section id="dual-mode" className="py-24 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6">
          <Badge variant="muted">Dual-Mode Architecture</Badge>
          <h2 className="text-4xl font-bold text-fg">
            Ledger vs. Cockpit.<br/>
            <span className="text-primary">Two views, one reality.</span>
          </h2>
          <p className="text-fg-muted text-lg leading-relaxed">
            Stop forcing chat interfaces onto spreadsheets. Use <strong>The Ledger</strong> for high-density 
            work and <strong>The Cockpit</strong> for AI-assisted orchestration.
          </p>
          
          <div className="flex flex-col gap-4 mt-8">
            <div 
              className={`p-4 rounded-[var(--radius-lg)] border cursor-pointer transition-all ${activeMode === 'ledger' ? 'bg-bg-elevated border-primary ring-1 ring-primary' : 'border-border hover:bg-bg-muted'}`}
              onClick={() => setActiveMode('ledger')}
            >
              <div className="flex items-center gap-3 mb-2">
                <Activity size={20} className={activeMode === 'ledger' ? 'text-primary' : 'text-fg-subtle'} />
                <h4 className="font-semibold text-fg">The Ledger (Stability)</h4>
              </div>
              <p className="text-sm text-fg-muted pl-8">High-density grids. Keyboard centric. Zero surprises. For when accuracy is paramount.</p>
            </div>

            <div 
              className={`p-4 rounded-[var(--radius-lg)] border cursor-pointer transition-all ${activeMode === 'cockpit' ? 'bg-bg-elevated border-primary ring-1 ring-primary' : 'border-border hover:bg-bg-muted'}`}
              onClick={() => setActiveMode('cockpit')}
            >
              <div className="flex items-center gap-3 mb-2">
                <Cpu size={20} className={activeMode === 'cockpit' ? 'text-primary' : 'text-fg-subtle'} />
                <h4 className="font-semibold text-fg">The Cockpit (Agility)</h4>
              </div>
              <p className="text-sm text-fg-muted pl-8">Agentic intent. Plan -&gt; Act -&gt; Verify loops. For orchestration and creative direction.</p>
            </div>
          </div>
        </div>

        {/* Dynamic Preview Window */}
        <div className="flex-1 w-full">
          <div className="bg-bg border border-border rounded-[var(--radius-xl)] shadow-2xl overflow-hidden h-[400px] flex flex-col relative">
            
            {/* Window Controls */}
            <div className="h-10 border-b border-border bg-bg-muted flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-border" />
              <div className="w-3 h-3 rounded-full bg-border" />
              <div className="w-3 h-3 rounded-full bg-border" />
            </div>

            {/* Viewport */}
            <div className="flex-1 p-6 relative">
              {activeMode === 'ledger' ? (
                 <div className="animate-in fade-in zoom-in duration-300">
                   {/* Ledger Mockup */}
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-fg">General Ledger - Q3</h3>
                     <div className="flex gap-2">
                       <div className="w-20 h-6 bg-bg-elevated rounded"></div>
                       <div className="w-6 h-6 bg-primary rounded"></div>
                     </div>
                   </div>
                   <div className="space-y-2">
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className="flex gap-2 text-xs font-mono text-fg-muted items-center border-b border-border-subtle pb-2">
                         <span className="w-16">2025-10-0{i}</span>
                         <span className="flex-1 text-fg">INV-00{930+i} - AWS Infrastructure</span>
                         <span className="w-20 text-right tabular-nums text-fg">$1,29{i}.00</span>
                         <span className="w-20 text-center"><Badge variant="muted">Posted</Badge></span>
                       </div>
                     ))}
                   </div>
                 </div>
              ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-300 h-full flex flex-col">
                  {/* Cockpit Mockup */}
                  <div className="mb-4">
                    <h3 className="font-bold text-fg flex items-center gap-2">
                      <Cpu size={16} className="text-primary"/> AI Orchestrator Plan
                    </h3>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-3">
                       <div className="flex flex-col items-center gap-1">
                         <div className="w-2 h-2 rounded-full bg-success"></div>
                         <div className="w-0.5 h-full bg-border"></div>
                       </div>
                       <div className="pb-4">
                         <div className="text-sm font-semibold text-fg">Scan Anomalies</div>
                         <div className="text-xs text-fg-muted">Found 3 variances in Q3 GL.</div>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <div className="flex flex-col items-center gap-1">
                         <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                         <div className="w-0.5 h-full bg-border"></div>
                       </div>
                       <div className="pb-4">
                         <div className="text-sm font-semibold text-fg">Propose Fixes</div>
                         <div className="text-xs text-fg-muted">Generating reclassification journal entries...</div>
                         <div className="mt-2 p-2 bg-bg-elevated border border-border rounded-[var(--radius-md)] text-xs font-mono">
                           &gt; Reclass $4,200 from Marketing to IT<br/>
                           &gt; Update Tax Code to GST-05
                         </div>
                       </div>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-end gap-2">
                    <ButtonGhost className="text-xs h-8">Reject</ButtonGhost>
                    <ButtonPrimary className="text-xs h-8">Approve Plan</ButtonPrimary>
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

const CtaSection = () => (
  <section className="py-24 bg-gradient-to-b from-bg to-bg-muted border-t border-border-subtle text-center">
    <div className="max-w-3xl mx-auto px-6">
      <h2 className="text-4xl font-bold mb-6">Ready to Orchestrate?</h2>
      <p className="text-fg-muted text-lg mb-10">
        Join the pioneers building Sovereign AI ecosystems. 
        Strict governance. Incredible speed. Zero bloat.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <ButtonPrimary className="w-full sm:w-auto h-14 px-10 text-lg">
          Start Free Trial
        </ButtonPrimary>
        <ButtonGhost className="w-full sm:w-auto h-14 px-10 text-lg">
          Contact Sales
        </ButtonGhost>
      </div>
      <p className="mt-6 text-sm text-fg-subtle">
        Compliant with SOC2, GDPR, and AI-BOS Standards.
      </p>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-bg border-t border-border py-12">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground">
            <Zap size={14} fill="currentColor" />
          </div>
          <span className="font-bold text-fg">Nano Banana</span>
        </div>
        <p className="text-sm text-fg-subtle">
          The intelligence layer for the modern enterprise. Built on the AI-BOS Architecture.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-fg mb-4">Platform</h4>
        <ul className="space-y-2 text-sm text-fg-muted">
          <li><a href="#" className="hover:text-primary">Orchestrator</a></li>
          <li><a href="#" className="hover:text-primary">Agents</a></li>
          <li><a href="#" className="hover:text-primary">MCP Hub</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-fg mb-4">Resources</h4>
        <ul className="space-y-2 text-sm text-fg-muted">
          <li><a href="#" className="hover:text-primary">Documentation</a></li>
          <li><a href="#" className="hover:text-primary">Manifest Specs</a></li>
          <li><a href="#" className="hover:text-primary">Community</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-fg mb-4">Legal</h4>
        <ul className="space-y-2 text-sm text-fg-muted">
          <li><a href="#" className="hover:text-primary">Privacy</a></li>
          <li><a href="#" className="hover:text-primary">Terms</a></li>
          <li><a href="#" className="hover:text-primary">Governance</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border-subtle text-center text-xs text-fg-subtle">
      © 2025 Nano Banana Pro. All systems normal.
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
        <InteractivePreview />
        <CtaSection />
      </main>
      <Footer />
    </DesignSystemProvider>
  );
};

export default App;