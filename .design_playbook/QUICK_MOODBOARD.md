# ⚡ QUICK MOODBOARD - Landing Page

## Immediate Visual Reference

---

## 🎨 **COLOR SWATCHES**

```
PRIMARY PALETTE:
┌─────────────────────────────────────────┐
│  #0a0e1a  #101827  #1a1f2e              │ Dark Backgrounds
│  #38bdf8  #22d3ee  #10b981              │ Accent Colors (Cyan/Teal/Green)
│  #e5e7eb  #9ca3af  #6b7280              │ Text Colors
└─────────────────────────────────────────┘

GRADIENT MESHES:
┌─────────────────────────────────────────┐
│  Cyan → Teal → Green                     │ Animated, Blurred
│  Radial Gradients                        │ Multiple Layers
│  Mix-blend-mode                         │ Multiply/Screen
└─────────────────────────────────────────┘
```

---

## ✍️ **TYPOGRAPHY**

```
HERO TITLE:
┌─────────────────────────────────────────┐
│  AI-BOS Nexus-Lynx                      │
│  Font: Inter Black                      │
│  Size: 3rem - 6rem (responsive)         │
│  Style: Gradient (cyan → teal)         │
│  Tracking: -0.04em                      │
└─────────────────────────────────────────┘

BODY TEXT:
┌─────────────────────────────────────────┐
│  Regular weight, 1rem, line-height 1.7  │
│  Color: #9ca3af (muted gray)            │
└─────────────────────────────────────────┘
```

---

## 🎭 **VISUAL ELEMENTS**

### **Hero Section:**

```
┌─────────────────────────────────────────┐
│  [Badge] AI-governed ERP                │
│                                          │
│  AI-BOS Nexus-Lynx                       │
│  (Gradient Text)                         │
│                                          │
│  Agentic AI creating AI —                │
│  you hold the thread.                    │
│                                          │
│  [Primary CTA] [Secondary CTA]          │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  [Kite Visualization]              │   │
│  │  • Follows cursor                  │   │
│  │  • Animated gradient mesh          │   │
│  │  • 3D floating elements            │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### **Feature Cards:**

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  [Icon]     │  │  [Icon]     │  │  [Icon]     │
│  Title      │  │  Title      │  │  Title      │
│  Description│  │  Description│  │  Description│
│  Glass Card │  │  Glass Card │  │  Glass Card │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 🎬 **ANIMATION STYLE**

```
SCROLL ANIMATIONS:
• Fade In (opacity 0 → 1)
• Slide Up (translateY 20px → 0)
• Parallax (background slower)
• Scale (scale 0.95 → 1)

HOVER EFFECTS:
• Lift (translateY -4px)
• Glow (box-shadow intensifies)
• Scale (scale 1.05)
• Color Shift (accent brightens)

MICRO-INTERACTIONS:
• Button Press (scale 0.95)
• Icon Spin (rotate 360deg)
• Particle Burst (on click)
• Gradient Shift (animated)
```

---

## 🧩 **COMPONENT STYLES**

### **Button Primary:**

```
Background: Gradient (cyan → teal)
Text: White, Bold
Shadow: Cyan glow
Hover: Lift + Glow
Border-radius: 999px
```

### **Glass Card:**

```
Background: rgba(15, 23, 42, 0.7)
Backdrop: blur(24px)
Border: rgba(148, 163, 184, 0.2)
Shadow: Colored shadow
Border-radius: 1.5rem
```

### **Badge:**

```
Background: Accent color (10% opacity)
Border: Accent color (50% opacity)
Text: Accent color
Font: Mono, Uppercase
Border-radius: 999px
```

---

## 🎯 **KEY VISUALS**

### **1. Kite & Thread:**

- Handle: Fixed (bottom-left)
- Kite: Follows cursor
- String: Dynamic SVG line
- Style: Glowing, pulsing

### **2. Gradient Mesh:**

- Multiple radial gradients
- Animated position
- Blur effect
- Mix-blend-mode

### **3. 3D Elements:**

- Floating geometric shapes
- Depth with shadows
- Parallax scrolling
- Interactive rotation

---

## 📐 **LAYOUT**

```
CONTAINER:
Max-width: 1280px
Padding: 1.5rem (mobile) → 3rem (desktop)

GRID:
Desktop: 12 columns
Tablet: 8 columns
Mobile: 4 columns
Gap: 2rem (32px)

SPACING:
xs: 0.5rem (8px)
sm: 1rem (16px)
md: 2rem (32px)
lg: 4rem (64px)
xl: 6rem (96px)
```

---

## 🚀 **QUICK START**

### **Gradient Background:**

```tsx
<div className="fixed inset-0 -z-10">
  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-green-500/20 blur-3xl" />
</div>
```

### **Glass Card:**

```tsx
<div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
  {/* Content */}
</div>
```

### **Gradient Text:**

```tsx
<h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
  AI-BOS Nexus-Lynx
</h1>
```

---

**Status:** ✅ **Ready to Use!**
