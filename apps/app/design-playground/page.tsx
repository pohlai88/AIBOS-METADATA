'use client';

import { useState } from 'react';
import { 
  Palette, 
  Type, 
  Layout, 
  Sparkles, 
  Database,
  Eye,
  Moon,
  Sun,
  Copy,
  Check
} from 'lucide-react';

// Design tokens from the system
const colorPalette = {
  light: {
    primary: { value: '#2563eb', name: 'blue-600', usage: 'CTAs, active states, brand' },
    primarySoft: { value: 'rgba(37, 99, 235, 0.12)', name: 'blue-600/12%', usage: 'Backgrounds, subtle highlights' },
    secondary: { value: '#1d4ed8', name: 'blue-700', usage: 'Secondary actions, depth' },
    success: { value: '#16a34a', name: 'green-600', usage: 'Success, completed, valid' },
    warning: { value: '#f59e0b', name: 'amber-500', usage: 'Warning, pending, attention' },
    danger: { value: '#dc2626', name: 'red-600', usage: 'Error, critical, blocked' },
    bg: { value: '#f9fafb', name: 'gray-50', usage: 'Main background' },
    bgMuted: { value: '#f3f4f6', name: 'gray-100', usage: 'Muted background' },
    bgElevated: { value: '#ffffff', name: 'white', usage: 'Cards, elevated surfaces' },
    fg: { value: '#111827', name: 'gray-900', usage: 'Primary text' },
    fgMuted: { value: '#6b7280', name: 'gray-500', usage: 'Secondary text' },
    fgSubtle: { value: '#9ca3af', name: 'gray-400', usage: 'Tertiary text' },
    border: { value: '#e5e7eb', name: 'gray-200', usage: 'Borders, dividers' },
  },
  dark: {
    primary: { value: '#60a5fa', name: 'blue-400', usage: 'CTAs, active states, brand' },
    primarySoft: { value: 'rgba(96, 165, 250, 0.18)', name: 'blue-400/18%', usage: 'Backgrounds, subtle highlights' },
    secondary: { value: '#38bdf8', name: 'sky-400', usage: 'Secondary actions, depth' },
    success: { value: '#22c55e', name: 'green-500', usage: 'Success, completed, valid' },
    warning: { value: '#fbbf24', name: 'amber-400', usage: 'Warning, pending, attention' },
    danger: { value: '#f87171', name: 'red-400', usage: 'Error, critical, blocked' },
    bg: { value: '#020617', name: 'slate-950', usage: 'Main background' },
    bgMuted: { value: '#020617', name: 'slate-950', usage: 'Muted background' },
    bgElevated: { value: '#020617', name: 'slate-950', usage: 'Cards, elevated surfaces' },
    fg: { value: '#e5e7eb', name: 'gray-200', usage: 'Primary text' },
    fgMuted: { value: '#9ca3af', name: 'gray-400', usage: 'Secondary text' },
    fgSubtle: { value: '#6b7280', name: 'gray-500', usage: 'Tertiary text' },
    border: { value: '#1f2937', name: 'gray-800', usage: 'Borders, dividers' },
  }
};

const typographyScale = {
  headingLg: { size: '18px', weight: '600', lineHeight: '1.5', usage: 'Page titles' },
  headingMd: { size: '16px', weight: '600', lineHeight: '1.5', usage: 'Section headers' },
  headingSm: { size: '14px', weight: '600', lineHeight: '1.5', usage: 'Subsection headers' },
  bodyMd: { size: '15px', weight: '400', lineHeight: '1.6', usage: 'Body text' },
  bodySm: { size: '14px', weight: '400', lineHeight: '1.6', usage: 'Small body text' },
  labelSm: { size: '11px', weight: '500', lineHeight: '1.4', usage: 'Labels, tags (uppercase)' },
};

const spacingScale = {
  xs: { value: '0.25rem', pixels: '4px', usage: 'Tight spacing' },
  sm: { value: '0.375rem', pixels: '6px', usage: 'Small spacing' },
  md: { value: '0.5rem', pixels: '8px', usage: 'Medium spacing' },
  lg: { value: '0.75rem', pixels: '12px', usage: 'Large spacing' },
  xl: { value: '1rem', pixels: '16px', usage: 'Extra large spacing' },
};

const radiusScale = {
  xs: { value: '0.25rem', pixels: '4px', usage: 'Small elements' },
  sm: { value: '0.375rem', pixels: '6px', usage: 'Buttons, inputs' },
  md: { value: '0.5rem', pixels: '8px', usage: 'Cards, containers' },
  lg: { value: '0.5rem', pixels: '8px', usage: 'Large cards' },
  xl: { value: '0.75rem', pixels: '12px', usage: 'Extra large containers' },
  '2xl': { value: '1rem', pixels: '16px', usage: 'Modals, dialogs' },
  full: { value: '9999px', pixels: '∞', usage: 'Pills, badges' },
};

export default function DesignPlaygroundPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'moodboard' | 'colors' | 'typography' | 'spacing' | 'metadata'>('moodboard');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentColors = darkMode ? colorPalette.dark : colorPalette.light;

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-bg' : 'bg-bg'}`}>
      {/* Header */}
      <header className="border-b border-border bg-bg-elevated sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-fg">AI-BOS Design Playground</h1>
            <p className="text-sm text-fg-muted">Interactive design system showcase for customers</p>
            <p className="text-xs text-fg-subtle mt-1">
              Design System by <span className="font-medium text-fg-muted">Elegance Design Agent</span> · 
              Playground by <span className="font-medium text-fg-muted">Next.js Agent</span>
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-bg-elevated hover:bg-bg-muted transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm font-medium">{darkMode ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border bg-bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'moodboard', label: 'Moodboard', icon: Sparkles },
              { id: 'colors', label: 'Color Palette', icon: Palette },
              { id: 'typography', label: 'Typography', icon: Type },
              { id: 'spacing', label: 'Spacing & Radius', icon: Layout },
              { id: 'metadata', label: 'Schema Registry', icon: Database },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-fg-muted hover:text-fg'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Moodboard Tab */}
        {activeTab === 'moodboard' && (
          <div className="space-y-8">
            <section className="bg-bg-elevated border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-fg mb-4">Brand Philosophy</h2>
              <div className="space-y-4 text-fg-muted">
                <p className="text-lg font-medium text-fg">
                  &quot;Governed Agility: Where Precision Meets Possibility&quot;
                </p>
                <p>
                  AI-BOS is the world&apos;s first <strong>Governed-Agility ERP OS</strong> — a platform that combines:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The flexibility of modern SaaS (ERPNext-style customization)</li>
                  <li>The discipline of enterprise ERP (NetSuite/Dynamics-level governance)</li>
                  <li>The intelligence of AI-native architecture (explainable, auditable, reversible)</li>
                </ul>
              </div>
            </section>

            <section className="bg-bg-elevated border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-fg mb-4">Core Design Principles</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Metadata-First', desc: 'Semantic clarity, meaning-driven design' },
                  { title: 'Lego Architecture', desc: 'Modular, fault-tolerant, graceful degradation' },
                  { title: 'Dual-Mode UX', desc: 'Ledger (stability) + Cockpit (agility)' },
                ].map((principle) => (
                  <div key={principle.title} className="p-4 bg-bg-muted rounded-lg">
                    <h3 className="font-semibold text-fg mb-2">{principle.title}</h3>
                    <p className="text-sm text-fg-muted">{principle.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-bg-elevated border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-fg mb-4">Brand Values</h2>
              <div className="grid md:grid-cols-5 gap-4">
                {['Trust', 'Precision', 'Agility', 'Intelligence', 'Elegance'].map((value) => (
                  <div key={value} className="text-center p-4 bg-primary-soft rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-2">{value}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Color Palette Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-fg mb-6">Color Palette</h2>
              
              {/* Primary Colors */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-fg mb-4">Brand Colors</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['primary', 'primarySoft', 'secondary'].map((key) => {
                    const color = currentColors[key as keyof typeof currentColors];
                    return (
                      <div key={key} className="bg-bg-elevated border border-border rounded-lg p-4">
                        <div 
                          className="w-full h-24 rounded-lg mb-3 border border-border"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-fg capitalize">{key}</span>
                            <button
                              onClick={() => copyToClipboard(color.value, `color-${key}`)}
                              className="p-1 hover:bg-bg-muted rounded"
                            >
                              {copied === `color-${key}` ? (
                                <Check size={14} className="text-success" />
                              ) : (
                                <Copy size={14} className="text-fg-muted" />
                              )}
                            </button>
                          </div>
                          <div className="text-sm text-fg-muted font-mono">{color.name}</div>
                          <div className="text-xs text-fg-subtle">{color.usage}</div>
                          <div className="text-xs font-mono text-fg-subtle">{color.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Colors */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-fg mb-4">Status Colors</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {['success', 'warning', 'danger'].map((key) => {
                    const color = currentColors[key as keyof typeof currentColors];
                    return (
                      <div key={key} className="bg-bg-elevated border border-border rounded-lg p-4">
                        <div 
                          className="w-full h-24 rounded-lg mb-3 border border-border"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-fg capitalize">{key}</span>
                            <button
                              onClick={() => copyToClipboard(color.value, `color-${key}`)}
                              className="p-1 hover:bg-bg-muted rounded"
                            >
                              {copied === `color-${key}` ? (
                                <Check size={14} className="text-success" />
                              ) : (
                                <Copy size={14} className="text-fg-muted" />
                              )}
                            </button>
                          </div>
                          <div className="text-sm text-fg-muted font-mono">{color.name}</div>
                          <div className="text-xs text-fg-subtle">{color.usage}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Neutral Colors */}
              <div>
                <h3 className="text-lg font-semibold text-fg mb-4">Neutral Colors</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['bg', 'bgMuted', 'bgElevated', 'fg', 'fgMuted', 'fgSubtle', 'border'].map((key) => {
                    const color = currentColors[key as keyof typeof currentColors];
                    return (
                      <div key={key} className="bg-bg-elevated border border-border rounded-lg p-4">
                        <div 
                          className="w-full h-20 rounded-lg mb-3 border border-border"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-fg text-sm capitalize">{key}</span>
                            <button
                              onClick={() => copyToClipboard(color.value, `color-${key}`)}
                              className="p-1 hover:bg-bg-muted rounded"
                            >
                              {copied === `color-${key}` ? (
                                <Check size={12} className="text-success" />
                              ) : (
                                <Copy size={12} className="text-fg-muted" />
                              )}
                            </button>
                          </div>
                          <div className="text-xs text-fg-muted font-mono">{color.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-fg mb-6">Typography Scale</h2>
              <div className="bg-bg-elevated border border-border rounded-lg p-6 space-y-6">
                {Object.entries(typographyScale).map(([key, style]) => (
                  <div key={key} className="border-b border-border-subtle pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className={`font-semibold text-fg`} style={{
                          fontSize: style.size,
                          fontWeight: style.weight,
                          lineHeight: style.lineHeight,
                        }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <p className="text-sm text-fg-muted mt-1">{style.usage}</p>
                      </div>
                      <div className="text-right text-xs text-fg-subtle font-mono">
                        <div>{style.size} / {style.weight}</div>
                        <div>Line: {style.lineHeight}</div>
                      </div>
                    </div>
                    <div className="text-fg-muted" style={{
                      fontSize: style.size,
                      fontWeight: style.weight,
                      lineHeight: style.lineHeight,
                    }}>
                      The quick brown fox jumps over the lazy dog. 1234567890
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-fg mb-4">Font Families</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-bg-elevated border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-fg mb-2">Primary: Inter</h3>
                  <p className="text-sm text-fg-muted mb-2">Usage: UI, body text, headings</p>
                  <p className="text-sm text-fg-muted">Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)</p>
                  <div className="mt-4 font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="text-2xl font-bold">Inter Bold</div>
                    <div className="text-lg font-semibold">Inter Semibold</div>
                    <div className="text-base font-medium">Inter Medium</div>
                    <div className="text-base">Inter Regular</div>
                  </div>
                </div>
                <div className="bg-bg-elevated border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-fg mb-2">Monospace: System Mono</h3>
                  <p className="text-sm text-fg-muted mb-2">Usage: Code, technical data, metadata displays</p>
                  <div className="mt-4 font-mono text-sm">
                    <div>const token = &quot;value&quot;;</div>
                    <div className="text-fg-muted">// Metadata registry</div>
                    <div>SELECT * FROM mdm_concept;</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Spacing & Radius Tab */}
        {activeTab === 'spacing' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-fg mb-6">Spacing Scale</h2>
              <div className="bg-bg-elevated border border-border rounded-lg p-6 space-y-4">
                {Object.entries(spacingScale).map(([key, scale]) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-semibold text-fg">{key.toUpperCase()}</div>
                    <div className="flex-1">
                      <div 
                        className="bg-primary h-8 rounded"
                        style={{ width: scale.pixels }}
                      />
                    </div>
                    <div className="w-32 text-sm text-fg-muted font-mono">{scale.value} ({scale.pixels})</div>
                    <div className="flex-1 text-sm text-fg-subtle">{scale.usage}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-fg mb-6">Border Radius Scale</h2>
              <div className="bg-bg-elevated border border-border rounded-lg p-6">
                <div className="grid md:grid-cols-4 gap-6">
                  {Object.entries(radiusScale).map(([key, radius]) => (
                    <div key={key} className="text-center">
                      <div 
                        className="w-20 h-20 mx-auto mb-3 bg-primary border-2 border-border"
                        style={{ borderRadius: radius.value }}
                      />
                      <div className="text-sm font-semibold text-fg">{key.toUpperCase()}</div>
                      <div className="text-xs text-fg-muted font-mono">{radius.value}</div>
                      <div className="text-xs text-fg-subtle mt-1">{radius.usage}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Schema Registry Tab */}
        {activeTab === 'metadata' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-fg mb-6">Design System Metadata</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-bg-elevated border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
                    <Database size={20} />
                    Token Registry
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Color Tokens:</span>
                      <span className="font-mono text-fg">13 tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Typography Tokens:</span>
                      <span className="font-mono text-fg">6 styles</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Spacing Tokens:</span>
                      <span className="font-mono text-fg">5 scales</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Radius Tokens:</span>
                      <span className="font-mono text-fg">7 values</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Component Tokens:</span>
                      <span className="font-mono text-fg">6 presets</span>
                    </div>
                  </div>
                </div>

                <div className="bg-bg-elevated border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
                    <Eye size={20} />
                    Compliance Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-fg-muted">WCAG 2.1 AA:</span>
                      <span className="px-2 py-1 bg-success-soft text-success rounded text-xs font-medium">Compliant</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-fg-muted">Design Tokens:</span>
                      <span className="px-2 py-1 bg-success-soft text-success rounded text-xs font-medium">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-fg-muted">Light/Dark Mode:</span>
                      <span className="px-2 py-1 bg-success-soft text-success rounded text-xs font-medium">Supported</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-fg-muted">Accessibility:</span>
                      <span className="px-2 py-1 bg-success-soft text-success rounded text-xs font-medium">Validated</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-fg mb-4">Component Token Schema</h2>
              <div className="bg-bg-elevated border border-border rounded-lg p-6">
                <div className="space-y-4">
                  {['buttonPrimary', 'buttonSecondary', 'buttonGhost', 'card', 'badgePrimary', 'badgeMuted', 'input'].map((component) => (
                    <div key={component} className="border-b border-border-subtle pb-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-fg">{component}</span>
                        <span className="text-xs text-fg-muted">componentTokens.{component}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-fg mb-4">Design System Files</h2>
              <div className="bg-bg-elevated border border-border rounded-lg p-6">
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center justify-between p-2 hover:bg-bg-muted rounded">
                    <span className="text-fg">packages/ui/src/design/tokens.ts</span>
                    <span className="text-xs text-fg-muted">TypeScript tokens</span>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-bg-muted rounded">
                    <span className="text-fg">packages/ui/src/design/globals.css</span>
                    <span className="text-xs text-fg-muted">CSS variables</span>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-bg-muted rounded">
                    <span className="text-fg">.DESIGN/AI-BOS_MOODBOARD.md</span>
                    <span className="text-xs text-fg-muted">Brand guidelines</span>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-bg-muted rounded">
                    <span className="text-fg">.DESIGN/AI-BOS_VISUAL_STYLE_GUIDE.md</span>
                    <span className="text-xs text-fg-muted">Quick reference</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer with Credits */}
      <footer className="border-t border-border bg-bg-muted mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-fg mb-3">Design System</h3>
              <p className="text-sm text-fg-muted">
                Created by <span className="font-medium text-fg">Elegance Design Agent</span>
              </p>
              <p className="text-sm text-fg-muted mt-1">
                Head of Design · Brand Strategy
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fg mb-3">Playground Implementation</h3>
              <p className="text-sm text-fg-muted">
                Built by <span className="font-medium text-fg">Next.js Agent</span>
              </p>
              <p className="text-sm text-fg-muted mt-1">
                Interactive showcase for customers
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fg mb-3">Design Team</h3>
              <p className="text-sm text-fg-muted">
                Elegance Design Agent
              </p>
              <p className="text-sm text-fg-muted">
                Head of Design
              </p>
              <p className="text-sm text-fg-muted">
                Brand Strategy Team
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border-subtle text-center text-xs text-fg-subtle">
            <p>AI-BOS Design System v1.0.0 · &quot;Governed Agility: Where Precision Meets Possibility&quot;</p>
            <p className="mt-2">Design System Owner: Elegance Design Agent · Head of Design</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

