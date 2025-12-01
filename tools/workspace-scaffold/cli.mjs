#!/usr/bin/env node

/**
 * AIBOS Workspace Scaffold Generator
 * 
 * Quick start tool for creating new packages/apps in the monorepo
 * with all AIBOS standards pre-configured
 * 
 * Usage:
 *   pnpm create:app my-app        # Create new Next.js app
 *   pnpm create:service my-api    # Create new service (Hono API)
 *   pnpm create:package my-lib    # Create new shared library
 */

import prompts from 'prompts';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Package type templates
const PACKAGE_TYPES = {
  app: {
    name: 'Next.js Application',
    description: 'Full-stack Next.js 16 app with AIBOS SDK',
    directory: 'apps',
  },
  service: {
    name: 'Hono API Service',
    description: 'Lightweight Hono API service with Zod validation',
    directory: 'apps',
  },
  package: {
    name: 'Shared Library',
    description: 'Reusable TypeScript library package',
    directory: 'packages',
  },
};

async function main() {
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                       ║', 'cyan');
  log('║    🚀 AIBOS Workspace Scaffold Generator 🚀         ║', 'cyan');
  log('║                                                       ║', 'cyan');
  log('║    Quick start tool for new packages/apps            ║', 'cyan');
  log('║                                                       ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');

  // Get package type
  const { type } = await prompts({
    type: 'select',
    name: 'type',
    message: 'What do you want to create?',
    choices: [
      { 
        title: '🌐 Next.js Application', 
        value: 'app',
        description: 'Full-stack Next.js 16 app with AIBOS SDK'
      },
      { 
        title: '⚡ Hono API Service', 
        value: 'service',
        description: 'Lightweight Hono API service with Zod validation'
      },
      { 
        title: '📦 Shared Library', 
        value: 'package',
        description: 'Reusable TypeScript library package'
      },
    ],
  });

  if (!type) {
    log('❌ Cancelled', 'red');
    process.exit(0);
  }

  // Get package name
  const { name } = await prompts({
    type: 'text',
    name: 'name',
    message: 'Package name (e.g., my-app, my-service):',
    validate: (value) => {
      if (!value) return 'Name is required';
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Name must be lowercase letters, numbers, and hyphens only';
      }
      return true;
    },
  });

  if (!name) {
    log('❌ Cancelled', 'red');
    process.exit(0);
  }

  // Get description
  const { description } = await prompts({
    type: 'text',
    name: 'description',
    message: 'Package description:',
    initial: `A new ${PACKAGE_TYPES[type].name}`,
  });

  // Confirm
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `Create ${type} "${name}" in ${PACKAGE_TYPES[type].directory}/${name}?`,
    initial: true,
  });

  if (!confirm) {
    log('❌ Cancelled', 'red');
    process.exit(0);
  }

  // Generate package
  console.log('\n');
  log('🔨 Generating package...', 'blue');
  
  try {
    await generatePackage(type, name, description);
    
    console.log('\n');
    log('✅ Package created successfully!', 'green');
    console.log('\n');
    log('📋 Next steps:', 'yellow');
    log(`   1. cd ${PACKAGE_TYPES[type].directory}/${name}`, 'reset');
    log('   2. pnpm install', 'reset');
    log('   3. pnpm dev', 'reset');
    console.log('\n');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function generatePackage(type, name, description) {
  const packageType = PACKAGE_TYPES[type];
  const targetDir = join(process.cwd(), '../..', packageType.directory, name);
  
  log(`   Creating directory: ${packageType.directory}/${name}`, 'blue');
  await mkdir(targetDir, { recursive: true });
  
  // Generate files based on type
  if (type === 'app') {
    await generateNextApp(targetDir, name, description);
  } else if (type === 'service') {
    await generateHonoService(targetDir, name, description);
  } else if (type === 'package') {
    await generateLibraryPackage(targetDir, name, description);
  }
  
  log('   ✅ All files created', 'green');
}

async function generateNextApp(targetDir, name, description) {
  // package.json
  await writeFile(
    join(targetDir, 'package.json'),
    JSON.stringify({
      name: `@aibos/${name}`,
      version: '0.1.0',
      description,
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'eslint . --config ../../eslint.config.mjs',
        'type-check': 'tsc --noEmit',
      },
      dependencies: {
        '@aibos/types': 'workspace:*',
        next: '16.0.3',
        react: '19.2.0',
        'react-dom': '19.2.0',
      },
      devDependencies: {
        '@aibos/config-eslint': '0.1.0',
        '@types/node': '^22.19.1',
        '@types/react': '19.2.4',
        '@types/react-dom': '19.2.3',
        eslint: '^9.39.1',
        typescript: '^5.9.3',
      },
    }, null, 2)
  );
  log('   ✅ package.json', 'green');

  // tsconfig.json
  await writeFile(
    join(targetDir, 'tsconfig.json'),
    JSON.stringify({
      extends: '../../tsconfig.json',
      compilerOptions: {
        outDir: '.next',
        rootDir: '.',
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules', '.next'],
    }, null, 2)
  );
  log('   ✅ tsconfig.json', 'green');

  // next.config.ts
  await writeFile(
    join(targetDir, 'next.config.ts'),
    `import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ['@aibos/types'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
  reactStrictMode: true,
};

export default nextConfig;
`
  );
  log('   ✅ next.config.ts', 'green');

  // Create app directory
  await mkdir(join(targetDir, 'app'), { recursive: true });
  
  // app/layout.tsx
  await writeFile(
    join(targetDir, 'app/layout.tsx'),
    `import type { ReactNode } from "react";
import type { Metadata } from "next";
import { initializeSDK } from "../lib/sdk-guard";

// Initialize AIBOS SDK
initializeSDK();

export const metadata: Metadata = {
  title: "${name}",
  description: "${description}",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
  );
  log('   ✅ app/layout.tsx', 'green');

  // app/page.tsx
  await writeFile(
    join(targetDir, 'app/page.tsx'),
    `import { APPROVED_FINANCE_TERMS, ControlledVocabulary } from "@aibos/types";

export default function HomePage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>${name}</h1>
      <p>${description}</p>
      
      <h2>AIBOS SDK Status</h2>
      <p>SDK Version: {ControlledVocabulary.version}</p>
      <p>Approved Terms: {ControlledVocabulary.metadata.totalApprovedTerms}</p>
      
      <h2>Example: Using Controlled Vocabulary</h2>
      <p>Revenue Term: {APPROVED_FINANCE_TERMS.revenue}</p>
    </div>
  );
}
`
  );
  log('   ✅ app/page.tsx', 'green');

  // lib/sdk-guard.ts
  await mkdir(join(targetDir, 'lib'), { recursive: true });
  await writeFile(
    join(targetDir, 'lib/sdk-guard.ts'),
    `import { SDK_VERSION, assertVersionCompatibility } from "@aibos/metadata-studio/sdk/version";
import { initializeControlledVocabularySDK } from "@aibos/types";

export const CLIENT_SDK_VERSION = "1.0.0";

export function initializeSDK() {
  try {
    assertVersionCompatibility(CLIENT_SDK_VERSION);
    const vocabulary = initializeControlledVocabularySDK(CLIENT_SDK_VERSION);
    
    console.log(\`✅ SDK Initialized Successfully\`);
    console.log(\`   Client Version: v\${CLIENT_SDK_VERSION}\`);
    console.log(\`   Server Version: v\${SDK_VERSION.full}\`);
    
    return vocabulary;
  } catch (error) {
    console.error(\`❌ SDK VERSION MISMATCH - DEPLOYMENT BLOCKED\`);
    console.error(error);
    throw error;
  }
}
`
  );
  log('   ✅ lib/sdk-guard.ts', 'green');

  // README.md
  await writeFile(
    join(targetDir, 'README.md'),
    `# ${name}

${description}

## Features

- ✅ Next.js 16 with App Router
- ✅ AIBOS Controlled Vocabulary SDK integrated
- ✅ TypeScript configured
- ✅ ESLint configured
- ✅ SDK version checking on startup

## Development

\`\`\`bash
pnpm dev
\`\`\`

## Build

\`\`\`bash
pnpm build
pnpm start
\`\`\`

## SDK

This app uses the AIBOS Controlled Vocabulary SDK v${CLIENT_SDK_VERSION}.

Only approved terms can be used in code. See:
- \`@aibos/types\` for approved terms
- \`docs/guidelines/CONTROLLED-VOCABULARY-GUIDE.md\` for documentation
`
  );
  log('   ✅ README.md', 'green');
}

async function generateHonoService(targetDir, name, description) {
  // package.json
  await writeFile(
    join(targetDir, 'package.json'),
    JSON.stringify({
      name: `@aibos/${name}`,
      version: '0.1.0',
      description,
      private: true,
      type: 'module',
      scripts: {
        dev: 'tsx watch src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        lint: 'eslint . --config ../../eslint.config.mjs',
        'type-check': 'tsc --noEmit',
      },
      dependencies: {
        '@aibos/types': 'workspace:*',
        '@aibos/metadata-studio': 'workspace:*',
        hono: '^4.0.0',
        zod: '^3.23.8',
      },
      devDependencies: {
        '@aibos/config-eslint': '0.1.0',
        '@types/node': '^22.19.1',
        eslint: '^9.39.1',
        tsx: '^4.19.2',
        typescript: '^5.9.3',
      },
    }, null, 2)
  );
  log('   ✅ package.json', 'green');

  // tsconfig.json
  await writeFile(
    join(targetDir, 'tsconfig.json'),
    JSON.stringify({
      extends: '../../tsconfig.json',
      compilerOptions: {
        outDir: 'dist',
        rootDir: 'src',
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    }, null, 2)
  );
  log('   ✅ tsconfig.json', 'green');

  // Create src directory
  await mkdir(join(targetDir, 'src'), { recursive: true });
  
  // src/index.ts
  await writeFile(
    join(targetDir, 'src/index.ts'),
    `import { Hono } from 'hono';
import { initializeControlledVocabularySDK } from '@aibos/types';
import { SDK_VERSION } from '@aibos/metadata-studio/sdk/version';

// Initialize SDK
const CLIENT_SDK_VERSION = "1.0.0";
initializeControlledVocabularySDK(CLIENT_SDK_VERSION);

const app = new Hono();

app.get('/', (c) => {
  return c.json({
    name: '${name}',
    description: '${description}',
    sdkVersion: SDK_VERSION.full,
    status: 'healthy',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

export default app;

// Start server
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const port = parseInt(process.env.PORT || '3001');
  console.log(\`🚀 ${name} running on http://localhost:\${port}\`);
  
  Bun.serve({
    port,
    fetch: app.fetch,
  });
}
`
  );
  log('   ✅ src/index.ts', 'green');

  // README.md
  await writeFile(
    join(targetDir, 'README.md'),
    `# ${name}

${description}

## Features

- ✅ Hono lightweight API framework
- ✅ AIBOS Controlled Vocabulary SDK integrated
- ✅ Zod schema validation
- ✅ TypeScript configured
- ✅ Hot reload with tsx watch

## Development

\`\`\`bash
pnpm dev
\`\`\`

## Build

\`\`\`bash
pnpm build
pnpm start
\`\`\`

## API Endpoints

- \`GET /\` - Service info
- \`GET /health\` - Health check
`
  );
  log('   ✅ README.md', 'green');
}

async function generateLibraryPackage(targetDir, name, description) {
  // package.json
  await writeFile(
    join(targetDir, 'package.json'),
    JSON.stringify({
      name: `@aibos/${name}`,
      version: '0.1.0',
      description,
      private: true,
      main: './src/index.ts',
      types: './src/index.ts',
      scripts: {
        lint: 'eslint . --config ../../eslint.config.mjs',
        'type-check': 'tsc --noEmit',
        test: 'vitest',
      },
      devDependencies: {
        '@aibos/config-eslint': '0.1.0',
        '@types/node': '^22.19.1',
        eslint: '^9.39.1',
        typescript: '^5.9.3',
        vitest: '^3.0.0',
      },
    }, null, 2)
  );
  log('   ✅ package.json', 'green');

  // tsconfig.json
  await writeFile(
    join(targetDir, 'tsconfig.json'),
    JSON.stringify({
      extends: '../../tsconfig.json',
      compilerOptions: {
        outDir: 'dist',
        rootDir: 'src',
        declaration: true,
        declarationMap: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    }, null, 2)
  );
  log('   ✅ tsconfig.json', 'green');

  // Create src directory
  await mkdir(join(targetDir, 'src'), { recursive: true });
  
  // src/index.ts
  await writeFile(
    join(targetDir, 'src/index.ts'),
    `/**
 * ${name}
 * 
 * ${description}
 */

export function hello(name: string): string {
  return \`Hello, \${name}!\`;
}

// Export your library functions here
`
  );
  log('   ✅ src/index.ts', 'green');

  // README.md
  await writeFile(
    join(targetDir, 'README.md'),
    `# @aibos/${name}

${description}

## Installation

This package is part of the AIBOS monorepo.

\`\`\`json
{
  "dependencies": {
    "@aibos/${name}": "workspace:*"
  }
}
\`\`\`

## Usage

\`\`\`typescript
import { hello } from "@aibos/${name}";

console.log(hello("World"));
\`\`\`

## Development

\`\`\`bash
pnpm type-check
pnpm test
\`\`\`
`
  );
  log('   ✅ README.md', 'green');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

