# 🔍 Tailwind CSS v4 - Reference Repositories for Study

**Purpose:** Real-world examples to upgrade our knowledge from v3 to v4 patterns.

---

## 🎯 **Top Priority Repositories (Clone & Study)**

### **1. Next.js 15 + Tailwind v4 Starter** ⭐⭐⭐
**Repository:** https://github.com/cbmongithub/nextv15-tailwindv4-starter

**Why Study This:**
- ✅ Next.js 15 (same as ours)
- ✅ Tailwind v4 official patterns
- ✅ PostCSS configuration
- ✅ Dark mode implementation
- ✅ TypeScript setup

**What to Learn:**
- How they structure `globals.css` with `@theme`
- `tailwind.config.js` - minimal or complex?
- PostCSS pipeline
- Dark mode with v4

**Clone Command:**
```bash
cd D:/AIBOS-METADATA/reference-repos
git clone https://github.com/cbmongithub/nextv15-tailwindv4-starter.git
cd nextv15-tailwindv4-starter
pnpm install
```

---

### **2. Turbo Monorepo with Tailwind v4** ⭐⭐⭐
**Repository:** https://github.com/philipptpunkt/turbo-with-tailwind-v4

**Why Study This:**
- ✅ **Monorepo setup** (like ours!)
- ✅ Turbo (we use this!)
- ✅ Shared design system
- ✅ Multiple packages consuming Tailwind v4

**What to Learn:**
- How to share `globals.css` across packages
- `@aibos/ui` equivalent patterns
- Content paths for monorepo discovery
- Package exports for design tokens

**Clone Command:**
```bash
cd D:/AIBOS-METADATA/reference-repos
git clone https://github.com/philipptpunkt/turbo-with-tailwind-v4.git
cd turbo-with-tailwind-v4
pnpm install
```

---

### **3. Tailwind v4 Theming Examples** ⭐⭐
**Repository:** https://github.com/Eveelin/tailwind-v4-theming-examples

**Why Study This:**
- ✅ Custom themes with `@theme`
- ✅ Color schemes
- ✅ Next.js + shadcn/ui
- ✅ Dark mode patterns

**What to Learn:**
- Advanced `@theme` usage
- How to structure design tokens
- Theme switching patterns
- CSS variable best practices

**Clone Command:**
```bash
cd D:/AIBOS-METADATA/reference-repos
git clone https://github.com/Eveelin/tailwind-v4-theming-examples.git
cd tailwind-v4-theming-examples
pnpm install
```

---

### **4. HyperUI - Component Library** ⭐
**Repository:** https://github.com/markmead/hyperui

**Why Study This:**
- ✅ Production-ready v4 components
- ✅ Latest Tailwind features
- ✅ Advanced animations
- ✅ Glassmorphism, gradients, 3D

**What to Learn:**
- Component patterns with v4
- Advanced utility combinations
- Animation techniques
- Modern UI patterns

**Clone Command:**
```bash
cd D:/AIBOS-METADATA/reference-repos
git clone https://github.com/markmead/hyperui.git
cd hyperui
pnpm install
```

---

### **5. React + shadcn/ui + Tailwind v4** ⭐
**Repository:** https://github.com/sumitnce1/React-Shadcn-Tailwind-CSS-V4

**Why Study This:**
- ✅ Modern React 19
- ✅ shadcn/ui patterns
- ✅ Component architecture
- ✅ Utility-first styling

**What to Learn:**
- How shadcn/ui adapts to v4
- Component composition
- Registry pattern (similar to ours!)

**Clone Command:**
```bash
cd D:/AIBOS-METADATA/reference-repos
git clone https://github.com/sumitnce1/React-Shadcn-Tailwind-CSS-V4.git
cd React-Shadcn-Tailwind-CSS-V4
pnpm install
```

---

## 📚 **Learning Checklist**

When studying each repo, look for:

### **File Structure:**
- [ ] Where is `globals.css`? What's inside?
- [ ] Is there a `tailwind.config.js`? What's configured?
- [ ] `postcss.config.js` setup?
- [ ] How are design tokens organized?

### **@theme Directive:**
- [ ] What tokens are defined in `@theme`?
- [ ] Colors: RGB, HSL, or OKLCH?
- [ ] Spacing scale?
- [ ] Typography tokens?
- [ ] Custom shadows, animations?

### **Dark Mode:**
- [ ] How is dark mode toggled? (class vs media)
- [ ] CSS variables override pattern?
- [ ] Theme provider implementation?

### **Monorepo (if applicable):**
- [ ] How are styles shared across packages?
- [ ] Content paths configuration?
- [ ] Build pipeline setup?

### **Advanced Features:**
- [ ] `@layer utilities` usage?
- [ ] `@variant` for custom states?
- [ ] Container queries?
- [ ] 3D transforms?

---

## 🚀 **Quick Clone Script**

Create `D:/AIBOS-METADATA/reference-repos/clone-all.sh`:

```bash
#!/bin/bash
mkdir -p reference-repos
cd reference-repos

# Next.js 15 + Tailwind v4
git clone https://github.com/cbmongithub/nextv15-tailwindv4-starter.git

# Turbo Monorepo
git clone https://github.com/philipptpunkt/turbo-with-tailwind-v4.git

# Theming Examples
git clone https://github.com/Eveelin/tailwind-v4-theming-examples.git

# HyperUI Components
git clone https://github.com/markmead/hyperui.git

# React + shadcn/ui
git clone https://github.com/sumitnce1/React-Shadcn-Tailwind-CSS-V4.git

echo "✅ All repositories cloned!"
echo "Next steps:"
echo "1. cd into each directory"
echo "2. Run 'pnpm install'"
echo "3. Explore globals.css and tailwind.config.js"
echo "4. Compare with our AIBOS setup"
```

**Run it:**
```bash
cd D:/AIBOS-METADATA
bash reference-repos/clone-all.sh
```

---

## 📊 **Comparison Matrix**

After studying, fill this in:

| Feature | Next.js Starter | Turbo Mono | Theming | HyperUI | Our AIBOS |
|---------|----------------|------------|---------|---------|-----------|
| `@theme` usage | ? | ? | ? | ? | ✅ |
| Dark mode | ? | ? | ? | ? | ✅ |
| Monorepo | ❌ | ✅ | ❌ | ❌ | ✅ |
| `@layer utilities` | ? | ? | ? | ? | ✅ |
| `@variant` | ? | ? | ? | ? | ✅ |
| 3D transforms | ? | ? | ? | ? | ✅ |
| Container queries | ? | ? | ? | ? | ❌ |

---

## 🎓 **Study Plan**

1. **Day 1:** Clone all repos
2. **Day 2:** Study Next.js 15 + Tailwind v4 Starter
3. **Day 3:** Study Turbo Monorepo setup (most relevant!)
4. **Day 4:** Study Theming examples
5. **Day 5:** Compare patterns and upgrade our AIBOS setup

---

## 📝 **Notes Template**

For each repo, create a notes file:

```markdown
# [Repo Name] - Study Notes

## globals.css Structure
[paste key sections]

## tailwind.config.js
[paste or describe]

## Key Patterns
- Pattern 1: ...
- Pattern 2: ...

## Things to Adopt
- [ ] Feature A
- [ ] Feature B

## Things to Avoid
- Issue A
- Issue B
```

---

**Next Step:** Clone the repos and let me know which one you'd like to explore first! 🚀

I recommend starting with **Turbo Monorepo** since it's most similar to our architecture.

