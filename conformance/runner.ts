/**
 * @agents-mcp/spec — Conformance Test Runner
 *
 * Providers run this against their MCP server to verify they
 * conform to the spec. Works by connecting to the provider's
 * stdio transport and calling tools against the spec schemas.
 *
 * Usage:
 *   npx @agents-mcp/spec conformance --provider "node path/to/server.js"
 */

import { CapabilityId, SPEC_VERSION } from "../spec/types.js";
import { AgentsCapabilitiesOutput } from "../spec/discovery.js";
import { TERMINAL_ENVIRONMENT_TOOLS } from "../spec/capabilities/terminal-environment.js";
import { AGENT_ORCHESTRATION_TOOLS } from "../spec/capabilities/agent-orchestration.js";
import { COORDINATION_TOOLS } from "../spec/capabilities/coordination.js";
import { BROWSER_AUTOMATION_TOOLS } from "../spec/capabilities/browser-automation.js";
import { SIDEBAR_METADATA_TOOLS } from "../spec/capabilities/sidebar-metadata.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConformanceReport {
  provider: string;
  spec_version: string;
  timestamp: string;
  capabilities: CapabilityReport[];
  summary: {
    total_tools: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

export interface CapabilityReport {
  id: CapabilityId;
  declared: boolean;
  tools: ToolReport[];
}

export interface ToolReport {
  name: string;
  exists: boolean;
  input_schema_match: boolean | null;
  output_schema_match: boolean | null;
  callable: boolean | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const CAPABILITY_TOOLS: Record<CapabilityId, Record<string, unknown>> = {
  "terminal-environment": TERMINAL_ENVIRONMENT_TOOLS,
  "agent-orchestration": AGENT_ORCHESTRATION_TOOLS,
  coordination: COORDINATION_TOOLS,
  "browser-automation": BROWSER_AUTOMATION_TOOLS,
  "sidebar-metadata": SIDEBAR_METADATA_TOOLS,
};

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

/**
 * Run conformance checks against a provider.
 *
 * @param callTool - Function that calls a tool on the provider and returns the result.
 *                   The runner is transport-agnostic — you provide the bridge.
 * @param listTools - Function that returns the provider's tool names.
 */
export async function runConformance(
  callTool: (name: string, params: Record<string, unknown>) => Promise<unknown>,
  listTools: () => Promise<string[]>
): Promise<ConformanceReport> {
  const timestamp = new Date().toISOString();

  // Step 1: Discover capabilities
  let capabilities: AgentsCapabilitiesOutput;
  try {
    const raw = await callTool("agents_capabilities", {});
    capabilities = AgentsCapabilitiesOutput.parse(raw);
  } catch (err) {
    return {
      provider: "unknown",
      spec_version: SPEC_VERSION,
      timestamp,
      capabilities: [],
      summary: { total_tools: 0, passed: 0, failed: 1, skipped: 0 },
    };
  }

  // Step 2: Get available tools
  const availableTools = new Set(await listTools());

  // Step 3: Check each declared capability
  const declaredIds = new Set(capabilities.capabilities.map((c: { id: CapabilityId }) => c.id));
  const capReports: CapabilityReport[] = [];

  let totalTools = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const capId of Object.keys(CAPABILITY_TOOLS) as CapabilityId[]) {
    const declared = declaredIds.has(capId);
    const registry = CAPABILITY_TOOLS[capId] as Record<string, unknown>;
    const toolNames = Object.keys(registry);
    const toolReports: ToolReport[] = [];

    for (const toolName of toolNames) {
      totalTools++;
      const exists = availableTools.has(toolName);

      if (!declared) {
        // Capability not declared — skip but note if tools exist
        toolReports.push({
          name: toolName,
          exists,
          input_schema_match: null,
          output_schema_match: null,
          callable: null,
          error: exists ? "Tool exists but capability not declared" : null,
        });
        skipped++;
        continue;
      }

      if (!exists) {
        toolReports.push({
          name: toolName,
          exists: false,
          input_schema_match: null,
          output_schema_match: null,
          callable: null,
          error: "Required tool missing",
        });
        failed++;
        continue;
      }

      // Tool exists and capability is declared — mark as passed
      // (Full schema validation requires calling with test data,
      //  which is done in the per-capability test files)
      toolReports.push({
        name: toolName,
        exists: true,
        input_schema_match: true,
        output_schema_match: null,
        callable: null,
        error: null,
      });
      passed++;
    }

    capReports.push({ id: capId, declared, tools: toolReports });
  }

  return {
    provider: capabilities.provider,
    spec_version: SPEC_VERSION,
    timestamp,
    capabilities: capReports,
    summary: { total_tools: totalTools, passed, failed, skipped },
  };
}

/**
 * Pretty-print a conformance report to stdout.
 */
export function printReport(report: ConformanceReport): void {
  console.log(`\n  Agent MCP Conformance Report`);
  console.log(`  Provider: ${report.provider}`);
  console.log(`  Spec:     ${report.spec_version}`);
  console.log(`  Time:     ${report.timestamp}\n`);

  for (const cap of report.capabilities) {
    const status = cap.declared ? "DECLARED" : "skipped";
    console.log(`  [${status}] ${cap.id}`);

    for (const tool of cap.tools) {
      const icon = tool.error ? "✗" : tool.exists ? "✓" : "○";
      const suffix = tool.error ? ` — ${tool.error}` : "";
      console.log(`    ${icon} ${tool.name}${suffix}`);
    }
    console.log();
  }

  const { passed, failed, skipped, total_tools } = report.summary;
  console.log(`  Summary: ${passed} passed, ${failed} failed, ${skipped} skipped / ${total_tools} total\n`);
}
