/**
 * @agents-mcp/spec — Provider Validator
 *
 * Validates that a provider's tool set conforms to the spec.
 * Used in conformance tests and at provider startup.
 */

import { z } from "zod";
import { CapabilityId, SPEC_VERSION } from "../spec/types.js";
import { TERMINAL_ENVIRONMENT_TOOLS } from "../spec/capabilities/terminal-environment.js";
import { AGENT_ORCHESTRATION_TOOLS } from "../spec/capabilities/agent-orchestration.js";
import { COORDINATION_TOOLS } from "../spec/capabilities/coordination.js";
import { BROWSER_AUTOMATION_TOOLS } from "../spec/capabilities/browser-automation.js";
import { SIDEBAR_METADATA_TOOLS } from "../spec/capabilities/sidebar-metadata.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProviderTool {
  name: string;
  inputSchema?: z.ZodType;
  outputSchema?: z.ZodType;
}

export interface ValidationResult {
  ok: boolean;
  spec_version: string;
  capability: CapabilityId;
  missing_tools: string[];
  extra_tools: string[];
  schema_mismatches: Array<{
    tool: string;
    issue: string;
  }>;
}

// ---------------------------------------------------------------------------
// Registry lookup
// ---------------------------------------------------------------------------

const REGISTRIES: Record<CapabilityId, Record<string, { input: z.ZodType; output: z.ZodType }>> = {
  "terminal-environment": TERMINAL_ENVIRONMENT_TOOLS,
  "agent-orchestration": AGENT_ORCHESTRATION_TOOLS,
  coordination: COORDINATION_TOOLS,
  "browser-automation": BROWSER_AUTOMATION_TOOLS,
  "sidebar-metadata": SIDEBAR_METADATA_TOOLS,
};

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

/**
 * Validate a provider's tools against a capability profile.
 *
 * @param capability - Which capability to validate against
 * @param providerTools - The tools the provider exposes (by name)
 * @returns Validation result with missing tools, extras, and schema mismatches
 */
export function validateProvider(
  capability: CapabilityId,
  providerTools: Map<string, ProviderTool>
): ValidationResult {
  const registry = REGISTRIES[capability];
  if (!registry) {
    return {
      ok: false,
      spec_version: SPEC_VERSION,
      capability,
      missing_tools: [],
      extra_tools: [],
      schema_mismatches: [{ tool: "*", issue: `Unknown capability: ${capability}` }],
    };
  }

  const requiredNames = new Set(Object.keys(registry));
  const providedNames = new Set(providerTools.keys());

  const missing_tools = [...requiredNames].filter((n) => !providedNames.has(n));
  const extra_tools = [...providedNames].filter((n) => !requiredNames.has(n));
  const schema_mismatches: Array<{ tool: string; issue: string }> = [];

  // For tools that exist in both, validate schema compatibility
  for (const name of requiredNames) {
    if (!providedNames.has(name)) continue;

    const specTool = registry[name];
    const providerTool = providerTools.get(name)!;

    // Check that provider accepts at least the spec's input shape
    if (providerTool.inputSchema) {
      try {
        // Generate a sample from the spec schema and validate against provider
        const specShape = specTool.input;
        if (specShape instanceof z.ZodObject && providerTool.inputSchema instanceof z.ZodObject) {
          const specKeys = Object.keys(specShape.shape);
          const providerKeys = Object.keys(
            (providerTool.inputSchema as z.ZodObject<z.ZodRawShape>).shape
          );
          const missingKeys = specKeys.filter((k) => !providerKeys.includes(k));
          if (missingKeys.length > 0) {
            schema_mismatches.push({
              tool: name,
              issue: `Missing input fields: ${missingKeys.join(", ")}`,
            });
          }
        }
      } catch {
        schema_mismatches.push({
          tool: name,
          issue: "Could not compare input schemas",
        });
      }
    }
  }

  return {
    ok: missing_tools.length === 0 && schema_mismatches.length === 0,
    spec_version: SPEC_VERSION,
    capability,
    missing_tools,
    extra_tools,
    schema_mismatches,
  };
}
