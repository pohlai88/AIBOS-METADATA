# 🚀 Workspace SDK - Quick Start Guide for Developers

**For Junior Developers & Microservice Builders**

---

## 🎯 What is Workspace SDK?

**Workspace SDK** is a scaffold generator that creates new packages/apps with **all AIBOS standards pre-configured**.

Instead of spending hours setting up TypeScript, ESLint, SDK integration, etc., you get everything ready in **30 seconds**!

---

## ✨ What You Get Automatically

Every generated package includes:

✅ **AIBOS Controlled Vocabulary SDK** - Only approved terms  
✅ **TypeScript** - Type safety  
✅ **ESLint** - Code quality  
✅ **SDK Version Checking** - Prevents deployment errors  
✅ **Hot Reload** - Auto-restart on changes  
✅ **Documentation** - README with examples  
✅ **Best Practices** - Industry-standard patterns  

**You just focus on business logic!** 🎉

---

## 🚀 How to Use (3 Simple Steps)

### Step 1: Run the Generator

```bash
pnpm create
```

### Step 2: Answer Questions

```
? What do you want to create? › 
  ❯ 🌐 Next.js Application
    ⚡ Hono API Service
    📦 Shared Library

? Package name: › my-awesome-app
? Package description: › My first AIBOS app
? Create app "my-awesome-app" in apps/my-awesome-app? › Yes
```

### Step 3: Start Coding!

```bash
cd apps/my-awesome-app
pnpm install
pnpm dev
```

**Done!** ✅ Your app is running with all AIBOS standards!

---

## 📦 Package Types Explained

### 1. 🌐 Next.js Application

**When to use:**
- Customer-facing websites
- Admin dashboards
- Internal tools with UI

**What you get:**
- Next.js 16 with App Router
- React 19
- AIBOS SDK integrated
- Type-safe routing

**Example:**
```bash
pnpm create
→ Choose "Next.js Application"
→ Name it "customer-portal"
→ Get a full Next.js app ready to code!
```

---

### 2. ⚡ Hono API Service

**When to use:**
- REST APIs
- Microservices
- Backend services

**What you get:**
- Hono framework (super fast!)
- Zod validation
- AIBOS SDK integrated
- Hot reload

**Example:**
```bash
pnpm create
→ Choose "Hono API Service"
→ Name it "notifications-api"
→ Get an API service ready to code!
```

---

### 3. 📦 Shared Library

**When to use:**
- Utility functions
- Shared types
- Reusable logic

**What you get:**
- TypeScript library
- Vitest for testing
- Can be imported by other packages

**Example:**
```bash
pnpm create
→ Choose "Shared Library"
→ Name it "string-utils"
→ Get a library package ready to code!
```

---

## 💡 Real-World Examples

### Example 1: Building a New Feature

**Scenario:** You need to build an "Analytics Dashboard"

```bash
# 1. Create the app
pnpm create
→ Next.js Application
→ Name: "analytics-dashboard"

# 2. Install & start
cd apps/analytics-dashboard
pnpm install
pnpm dev

# 3. Open http://localhost:3000
# 4. Start building your dashboard!
```

**Time saved:** 2-3 hours of setup ✅

---

### Example 2: Building a Microservice

**Scenario:** You need to build a "Notification Service"

```bash
# 1. Create the service
pnpm create
→ Hono API Service
→ Name: "notification-service"

# 2. Install & start
cd apps/notification-service
pnpm install
pnpm dev

# 3. Your API is running on http://localhost:3001
# 4. Start adding endpoints!
```

**Time saved:** 2 hours of setup ✅

---

### Example 3: Creating Shared Utilities

**Scenario:** You have utility functions to share across apps

```bash
# 1. Create the library
pnpm create
→ Shared Library
→ Name: "email-utils"

# 2. Add your functions to src/index.ts
# 3. Other packages can import it!
```

---

## 📋 What Gets Created?

### For Next.js App:

```
apps/your-app/
├── app/
│   ├── layout.tsx         # ✅ SDK initialized
│   └── page.tsx           # ✅ Example usage
├── lib/
│   └── sdk-guard.ts       # ✅ Version checking
├── package.json           # ✅ All dependencies
├── tsconfig.json          # ✅ TypeScript config
├── next.config.ts         # ✅ Next.js config
└── README.md              # ✅ Documentation
```

**Everything configured!** Just run `pnpm dev`!

---

## 🎓 For Junior Developers

### Your First App? Follow This:

**Step 1: Create Your App**
```bash
cd /path/to/AIBOS-METADATA
pnpm create
```

**Step 2: Choose Type**
- New to this? Start with "Next.js Application"
- Building an API? Choose "Hono API Service"

**Step 3: Name It Well**
- ✅ Good names: `user-dashboard`, `product-catalog`, `auth-api`
- ❌ Bad names: `test`, `MyApp`, `temp_project`

**Step 4: Read the README**
```bash
cd apps/your-app
cat README.md
```

**Step 5: Start Coding!**
```bash
pnpm install
pnpm dev
```

---

## ✅ Checklist Before You Start

Before running `pnpm create`, make sure:

- [ ] You're in the root of AIBOS-METADATA repo
- [ ] You've pulled latest changes (`git pull`)
- [ ] You know what you're building (app/service/library)
- [ ] You have a good name in mind
- [ ] You have time to read the generated README

---

## 🔧 Common Issues & Solutions

### Issue: "Command not found: pnpm"

**Fix:**
```bash
npm install -g pnpm@8.15.0
```

---

### Issue: "Package name already exists"

**Fix:** Choose a different name or delete the existing package

```bash
rm -rf apps/old-package-name
```

---

### Issue: "SDK Version Mismatch"

**Fix:** Update the SDK version in your generated package

```typescript
// apps/your-app/lib/sdk-guard.ts
export const CLIENT_SDK_VERSION = "1.0.0";  // Update this!
```

---

## 🎯 Best Practices

### 1. Naming Conventions

**Apps:**
- `{feature}-{type}` format
- Examples: `admin-dashboard`, `customer-portal`

**Services:**
- `{domain}-api` format
- Examples: `auth-api`, `payment-api`

**Libraries:**
- `{purpose}-utils` format
- Examples: `date-utils`, `validation-utils`

---

### 2. Using the SDK

All generated packages can use approved terms:

```typescript
import { APPROVED_FINANCE_TERMS } from "@aibos/types";

// ✅ GOOD: Using approved term
const accountType = APPROVED_FINANCE_TERMS.revenue;

// ❌ BAD: Using unapproved term
const accountType = "sales";  // TypeScript error!
```

**Why?** Consistent terminology across all apps!

---

### 3. Development Workflow

```bash
# 1. Create package
pnpm create

# 2. Install dependencies
cd apps/your-package
pnpm install

# 3. Start development
pnpm dev

# 4. Make changes
# Files auto-reload on save!

# 5. Check types
pnpm type-check

# 6. Lint your code
pnpm lint

# 7. Build for production
pnpm build
```

---

## 📚 Learn More

### After Creating Your Package:

1. **Read the README** - Generated in your package folder
2. **Explore the files** - See how things are structured
3. **Check the examples** - See working code
4. **Ask for help** - Slack channel #dev-support

### Important Documentation:

- **Controlled Vocabulary Guide:** `docs/guidelines/CONTROLLED-VOCABULARY-GUIDE.md`
- **Quick Reference:** `docs/guidelines/CONTROLLED-VOCABULARY-QUICK-REFERENCE.md`
- **Workspace SDK README:** `tools/workspace-scaffold/README.md`

---

## 💬 Getting Help

### Something Not Working?

1. **Read the error message** - It usually tells you what's wrong
2. **Check the README** - In your generated package
3. **Ask in Slack** - #dev-support channel
4. **Ask a senior dev** - They've been through this!

### Want to Customize?

1. **After generation, you can modify anything**
2. **The generated code is YOUR code**
3. **Keep the SDK integration** - But customize everything else!

---

## 🎉 Success Story

**Before Workspace SDK:**
- 3 hours setting up TypeScript ⏱️
- 2 hours configuring ESLint ⏱️
- 1 hour integrating SDK ⏱️
- 1 hour debugging config ⏱️
- **Total: 7 hours** 😫

**After Workspace SDK:**
- 30 seconds generating package ⚡
- Start coding immediately ✅
- **Total: 30 seconds** 🎉

**Time saved: 6.5 hours per project!**

---

## 🚀 Quick Reference

### Generate New Package
```bash
pnpm create
```

### Common Commands
```bash
pnpm dev         # Start development
pnpm build       # Build for production
pnpm lint        # Check code quality
pnpm type-check  # Check TypeScript
```

### Package Locations
- **Apps:** `apps/your-app/`
- **Services:** `apps/your-service/`
- **Libraries:** `packages/your-library/`

---

## 📝 Summary

**What is Workspace SDK?**
- Quick start tool for new packages
- All AIBOS standards pre-configured
- Saves hours of setup time

**Who is this for?**
- Junior developers building features
- Senior developers scaffolding microservices
- Anyone who wants to save time!

**How do I use it?**
1. Run `pnpm create`
2. Answer questions
3. Start coding!

---

**Questions?** Ask in #dev-support Slack channel  
**Need help?** Ping a senior developer  
**Found a bug?** Report in #platform-bugs

---

**Happy Coding!** 🚀

**Created by:** AIBOS Platform Team  
**For:** Junior Developers & Microservice Builders  
**Last Updated:** December 1, 2025

