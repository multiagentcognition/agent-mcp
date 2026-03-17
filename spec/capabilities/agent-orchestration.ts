/**
 * @agents-mcp/spec — agent-orchestration capability
 *
 * REQUIRED tools for agent-aware terminal environments.
 * Covers launching AI CLIs, bulk I/O, and session persistence.
 *
 * Depends on: terminal-environment (providers MUST also implement that)
 */

import { z } from "zod";
import { PaneRef, PaneInfo, CliType, ResultEnvelope } from "../types.js";

// ===========================================================================
// LAUNCHERS
// ===========================================================================

/** orch_launch — Spawn multiple AI agents in an auto-sized grid */
export const OrchLaunchInput = z.object({
  cli: CliType,
  count: z.number().int().min(1).max(12),
  cwd: z.string().optional(),
  workspace_name: z.string().optional(),
  prompt: z.string().optional().describe("Initial prompt to send to all agents after launch"),
  assignments: z
    .array(z.string())
    .optional()
    .describe("Per-agent prompts (length must match count)"),
  delay_ms: z
    .number()
    .int()
    .optional()
    .describe("Delay between agent launches in ms"),
});
export const OrchLaunchOutput = ResultEnvelope.extend({
  panes: z.array(PaneInfo),
});

/** orch_launch_grid — Create an empty terminal grid (no CLIs) */
export const OrchLaunchGridInput = z.object({
  rows: z.number().int().min(1).max(10),
  cols: z.number().int().min(1).max(10),
  cwd: z.string().optional(),
  command: z.string().optional(),
  workspace_name: z.string().optional(),
});
export const OrchLaunchGridOutput = ResultEnvelope.extend({
  panes: z.array(PaneInfo),
  total: z.number().int(),
});

/** orch_launch_mixed — Launch heterogeneous AI CLIs in one workspace */
export const OrchLaunchMixedInput = z.object({
  agents: z.array(
    z.object({
      cli: CliType,
      label: z.string().optional(),
    })
  ),
  cwd: z.string().optional(),
  workspace_name: z.string().optional(),
});
export const OrchLaunchMixedOutput = ResultEnvelope.extend({
  panes: z.array(PaneInfo),
});

// ===========================================================================
// BULK I/O
// ===========================================================================

/** orch_broadcast — Send the same text + Enter to all panes */
export const OrchBroadcastInput = z.object({
  text: z.string(),
});
export const OrchBroadcastOutput = ResultEnvelope.extend({
  sent_to: z.number().int().describe("Number of panes that received the text"),
});

/** orch_send_each — Send different text to each pane (by order) */
export const OrchSendEachInput = z.object({
  texts: z.array(z.string()),
});
export const OrchSendEachOutput = ResultEnvelope.extend({
  sent_to: z.number().int(),
});

/** orch_send_some — Send text to a specific set of panes */
export const OrchSendSomeInput = z.object({
  pane_ids: z.array(PaneRef),
  text: z.string(),
});
export const OrchSendSomeOutput = ResultEnvelope.extend({
  sent_to: z.number().int(),
});

/** orch_read_all — Read output from all panes (passive, non-interactive) */
export const OrchReadAllInput = z.object({
  lines: z.number().int().optional().describe("Lines per pane to read"),
});
export const OrchReadAllOutput = ResultEnvelope.extend({
  panes: z.array(
    z.object({
      id: PaneRef,
      cli: CliType.optional(),
      state: z.string().optional(),
      output: z.string(),
    })
  ),
});

/** orch_read_deep — Query idle agents for status summaries */
export const OrchReadDeepInput = z.object({
  lines: z.number().int().optional(),
  query: z.string().optional().describe("Custom question to ask idle agents"),
});
export const OrchReadDeepOutput = ResultEnvelope.extend({
  panes: z.array(
    z.object({
      id: PaneRef,
      cli: CliType.optional(),
      state: z.string().optional(),
      output: z.string(),
      summary: z.string().optional().describe("Agent-provided status summary"),
    })
  ),
});

/** orch_orchestrate — Send targeted prompts to specific panes */
export const OrchOrchestrateInput = z.object({
  assignments: z.array(
    z.object({
      pane_id: PaneRef,
      text: z.string(),
    })
  ),
  delay_ms: z.number().int().optional(),
});
export const OrchOrchestrateOutput = ResultEnvelope.extend({
  sent_to: z.number().int(),
});

// ===========================================================================
// SESSION PERSISTENCE
// ===========================================================================

/** orch_session_save — Persist current environment state */
export const OrchSessionSaveInput = z.object({});
export const OrchSessionSaveOutput = ResultEnvelope.extend({
  saved: z.boolean(),
  panes: z.number().int().describe("Number of panes captured"),
  manifest_path: z.string().optional(),
});

/** orch_session_recover — Restore environment from saved manifest */
export const OrchSessionRecoverInput = z.object({
  manifest_path: z.string().optional(),
});
export const OrchSessionRecoverOutput = ResultEnvelope.extend({
  recovered: z.boolean(),
  panes: z.number().int().describe("Number of panes restored"),
});

/** orch_session_reconcile — Compare saved state vs. live state */
export const OrchSessionReconcileInput = z.object({});
export const OrchSessionReconcileOutput = ResultEnvelope.extend({
  in_sync: z.boolean(),
  drift: z.array(z.string()).optional().describe("Descriptions of detected differences"),
});

// ===========================================================================
// Tool registry
// ===========================================================================

export const AGENT_ORCHESTRATION_TOOLS = {
  // Launchers
  orch_launch: { input: OrchLaunchInput, output: OrchLaunchOutput },
  orch_launch_grid: { input: OrchLaunchGridInput, output: OrchLaunchGridOutput },
  orch_launch_mixed: { input: OrchLaunchMixedInput, output: OrchLaunchMixedOutput },
  // Bulk I/O
  orch_broadcast: { input: OrchBroadcastInput, output: OrchBroadcastOutput },
  orch_send_each: { input: OrchSendEachInput, output: OrchSendEachOutput },
  orch_send_some: { input: OrchSendSomeInput, output: OrchSendSomeOutput },
  orch_read_all: { input: OrchReadAllInput, output: OrchReadAllOutput },
  orch_read_deep: { input: OrchReadDeepInput, output: OrchReadDeepOutput },
  orch_orchestrate: { input: OrchOrchestrateInput, output: OrchOrchestrateOutput },
  // Session
  orch_session_save: { input: OrchSessionSaveInput, output: OrchSessionSaveOutput },
  orch_session_recover: { input: OrchSessionRecoverInput, output: OrchSessionRecoverOutput },
  orch_session_reconcile: { input: OrchSessionReconcileInput, output: OrchSessionReconcileOutput },
} as const;

export type AgentOrchestrationToolName = keyof typeof AGENT_ORCHESTRATION_TOOLS;
