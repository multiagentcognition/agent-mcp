/**
 * @agents-mcp/spec — Capability Discovery
 *
 * Every conforming provider MUST expose the `agents_capabilities` tool.
 * Consumers call this first to learn what the provider supports and
 * which spec version it conforms to.
 */

import { z } from "zod";
import { CapabilityId, SPEC_VERSION } from "./types.js";

// ---------------------------------------------------------------------------
// agents_capabilities — REQUIRED for all providers
// ---------------------------------------------------------------------------

export const AgentsCapabilitiesInput = z.object({}).describe(
  "No parameters required. Returns the provider's capability manifest."
);

export const CapabilityDeclaration = z.object({
  id: CapabilityId,
  version: z.string().describe("Semver of the capability implementation"),
});

export const AgentsCapabilitiesOutput = z.object({
  ok: z.literal(true),
  spec_version: z.string().describe("Spec version this provider conforms to"),
  provider: z.string().describe("Provider name (e.g. 'cmux', 'wezterm', 'macp')"),
  provider_version: z.string().describe("Provider's own version"),
  capabilities: z.array(CapabilityDeclaration),
  platform: z.enum(["darwin", "linux", "win32", "headless"]).optional(),
});

export type AgentsCapabilitiesOutput = z.infer<typeof AgentsCapabilitiesOutput>;

// ---------------------------------------------------------------------------
// Tool definition (for providers to register)
// ---------------------------------------------------------------------------

export const DISCOVERY_TOOL = {
  name: "agents_capabilities",
  description:
    "Returns the capability manifest for this Agent MCP provider. " +
    "Consumers MUST call this first to discover supported capabilities.",
  inputSchema: AgentsCapabilitiesInput,
  outputSchema: AgentsCapabilitiesOutput,
} as const;

export { SPEC_VERSION };
