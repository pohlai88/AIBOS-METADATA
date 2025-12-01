/**
 * Tool Registry Check
 * 
 * Checks mdm_tool_registry to ensure tools are enabled before allowing execution
 */

import { sql } from './db';

export interface ToolRegistryStatus {
  enabled: boolean;
  toolId: string;
  toolName: string | null;
  reason?: string;
}

/**
 * Check if a tool is enabled in the registry
 * 
 * @param toolId - The tool identifier (e.g., 'aibos-metadata')
 * @returns ToolRegistryStatus indicating if tool is enabled
 */
export async function checkToolRegistry(toolId: string): Promise<ToolRegistryStatus> {
  try {
    const registry = await sql`
      SELECT 
        tool_id,
        tool_name,
        metadata
      FROM mdm_tool_registry
      WHERE tool_id = ${toolId}
      LIMIT 1
    `;

    if (!registry || registry.length === 0) {
      // Tool not in registry - allow by default for now, but log warning
      return {
        enabled: true,
        toolId,
        toolName: null,
        reason: 'Tool not found in registry (allowing by default)',
      };
    }

    const tool = registry[0] as {
      tool_id: string;
      tool_name: string;
      metadata: any;
    };

    // Check metadata for enabled/disabled flag
    const metadata = tool.metadata || {};
    const enabled = metadata.enabled !== false; // Default to enabled if not specified

    if (!enabled) {
      return {
        enabled: false,
        toolId,
        toolName: tool.tool_name,
        reason: metadata.reason || 'Tool is disabled in registry',
      };
    }

    return {
      enabled: true,
      toolId,
      toolName: tool.tool_name,
    };
  } catch (error) {
    // On error, allow tool execution but log warning
    console.error(`Error checking tool registry for ${toolId}:`, error);
    return {
      enabled: true,
      toolId,
      toolName: null,
      reason: 'Registry check failed (allowing by default)',
    };
  }
}

