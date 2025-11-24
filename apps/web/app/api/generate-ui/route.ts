// apps/web/app/api/generate-ui/route.ts
// Dev-only API route for generating UI components via MCP

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate-ui
 * 
 * Generate a UI component using the MCP UI generator
 * 
 * Body: { componentName: string, description?: string }
 * 
 * Returns: { code: string, success: boolean, error?: string }
 * 
 * Note: This is a dev-only route. In production, use the CLI script instead.
 */

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "This endpoint is only available in development" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { componentName, description } = body;

    if (!componentName) {
      return NextResponse.json(
        { success: false, error: "componentName is required" },
        { status: 400 },
      );
    }

    // Try to import and use the MCP generator
    try {
      // Dynamic import - .mcp directory is excluded from TypeScript compilation
      // Type assertion needed because module is excluded from tsconfig
      const modulePath = "../../../../.mcp/ui-generator/server.mjs" as string;
      const { runUiGeneratorAgent } = await import(modulePath) as {
        runUiGeneratorAgent: (messages: Array<{ role: string; content: string }>) => Promise<string>;
      };

      const userPrompt = description
        ? `Generate a ${componentName} component: ${description}`
        : `Generate a ${componentName} component following the design system rules.`;

      const generatedCode = await runUiGeneratorAgent([
        {
          role: "user",
          content: userPrompt,
        },
      ]);

      if (!generatedCode || generatedCode.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "MCP generator returned empty code" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        code: generatedCode,
      });
    } catch (error: any) {
      if (error.code === "MODULE_NOT_FOUND" || error.message?.includes("@ai-sdk")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "MCP dependencies not installed. Run: pnpm add @ai-sdk/openai ai",
          },
          { status: 503 },
        );
      }
      throw error;
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 },
    );
  }
}

