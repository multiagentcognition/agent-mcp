/**
 * @agents-mcp/spec — barrel export
 *
 * Import everything from here:
 *   import { TERMINAL_ENVIRONMENT_TOOLS, COORDINATION_TOOLS, ... } from "@agents-mcp/spec"
 */

// Shared types
export * from "./types.js";

// Discovery (required for all providers)
export * from "./discovery.js";

// Capability profiles
export * from "./capabilities/terminal-environment.js";
export * from "./capabilities/agent-orchestration.js";
export * from "./capabilities/coordination.js";
export * from "./capabilities/browser-automation.js";
export * from "./capabilities/sidebar-metadata.js";

// Aggregated tool registries
import { DISCOVERY_TOOL } from "./discovery.js";
import { TERMINAL_ENVIRONMENT_TOOLS } from "./capabilities/terminal-environment.js";
import { AGENT_ORCHESTRATION_TOOLS } from "./capabilities/agent-orchestration.js";
import { COORDINATION_TOOLS } from "./capabilities/coordination.js";
import { BROWSER_AUTOMATION_TOOLS } from "./capabilities/browser-automation.js";
import { SIDEBAR_METADATA_TOOLS } from "./capabilities/sidebar-metadata.js";

/** All tool registries grouped by capability */
export const ALL_TOOLS = {
  discovery: { agents_capabilities: DISCOVERY_TOOL },
  "terminal-environment": TERMINAL_ENVIRONMENT_TOOLS,
  "agent-orchestration": AGENT_ORCHESTRATION_TOOLS,
  coordination: COORDINATION_TOOLS,
  "browser-automation": BROWSER_AUTOMATION_TOOLS,
  "sidebar-metadata": SIDEBAR_METADATA_TOOLS,
} as const;

/** Flat map of every canonical tool name */
export const TOOL_NAMES = {
  // Discovery
  agents_capabilities: true,
  // Terminal environment
  ...Object.fromEntries(
    Object.keys(TERMINAL_ENVIRONMENT_TOOLS).map((k) => [k, true])
  ),
  // Agent orchestration
  ...Object.fromEntries(
    Object.keys(AGENT_ORCHESTRATION_TOOLS).map((k) => [k, true])
  ),
  // Coordination
  ...Object.fromEntries(
    Object.keys(COORDINATION_TOOLS).map((k) => [k, true])
  ),
  // Browser automation
  ...Object.fromEntries(
    Object.keys(BROWSER_AUTOMATION_TOOLS).map((k) => [k, true])
  ),
  // Sidebar metadata
  ...Object.fromEntries(
    Object.keys(SIDEBAR_METADATA_TOOLS).map((k) => [k, true])
  ),
} as const;
