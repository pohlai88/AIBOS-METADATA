#!/usr/bin/env node
// Phase 1: Foundation & Structure Migration Script
// Creates directory structure and boilerplate files

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../../");
const appDir = path.join(workspaceRoot, "apps/web/app");

// Directory structure to create
const DIRECTORY_STRUCTURE = [
  "(auth)/login",
  "(auth)/register",
  "(dashboard)",
  "(dashboard)/modules",
  "api/auth/[...nextauth]",
  "api/modules",
  "components",
  "lib",
  "actions",
];

// Files to create with content
const FILES_TO_CREATE = {
  "loading.tsx": `export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}
`,
  "error.tsx": `'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
`,
  "not-found.tsx": `export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Not Found</h2>
      <p className="text-gray-600 mb-4">Could not find requested resource</p>
      <a href="/" className="text-blue-500 hover:underline">
        Return Home
      </a>
    </div>
  );
}
`,
  "(dashboard)/layout.tsx": `import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add authentication check
  // const session = await getServerSession();
  // if (!session) {
  //   redirect('/login');
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">AI-BOS Platform</h1>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
`,
  "(dashboard)/page.tsx": `export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome to the AI-BOS Platform dashboard.</p>
    </div>
  );
}
`,
  "lib/data-fetching.ts": `// Data fetching utilities
// Server-side data fetching functions

export async function fetchAccountingData() {
  // TODO: Implement accounting data fetching
  return null;
}

export async function fetchModuleData(module: string) {
  // TODO: Implement generic module data fetching
  return null;
}
`,
  "middleware.ts": `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // TODO: Add authentication check
  // TODO: Add rate limiting
  // TODO: Add request logging
  // TODO: Add header manipulation

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
`,
};

async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

async function createFile(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf-8");
}

async function main() {
  console.log("🚀 Starting Phase 1: Foundation & Structure Migration\n");

  // Create directory structure
  console.log("📁 Creating directory structure...");
  for (const dir of DIRECTORY_STRUCTURE) {
    const fullPath = path.join(appDir, dir);
    await ensureDir(fullPath);
    console.log(`   ✅ Created: ${dir}`);
  }

  // Create files
  console.log("\n📄 Creating boilerplate files...");
  for (const [file, content] of Object.entries(FILES_TO_CREATE)) {
    const filePath = path.join(appDir, file);
    await createFile(filePath, content);
    console.log(`   ✅ Created: ${file}`);
  }

  // Create middleware in root of apps/web
  const middlewarePath = path.join(workspaceRoot, "apps/web/middleware.ts");
  await createFile(middlewarePath, FILES_TO_CREATE["middleware.ts"]);
  console.log(`   ✅ Created: middleware.ts (in apps/web/)`);

  console.log("\n✅ Phase 1 migration complete!");
  console.log("\n📋 Next Steps:");
  console.log("   1. Review created files");
  console.log("   2. Update next.config.ts with Cache Components");
  console.log("   3. Install authentication dependencies");
  console.log("   4. Implement authentication logic");
}

main().catch(console.error);

