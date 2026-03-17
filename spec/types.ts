/**
 * @agents-mcp/spec — Shared types
 *
 * These types are used across all capability profiles.
 * Providers MUST use these exact shapes for interoperability.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Spec version
// ---------------------------------------------------------------------------

export const SPEC_VERSION = "0.1.0";

// ---------------------------------------------------------------------------
// Capability profiles
// ---------------------------------------------------------------------------

export const CapabilityId = z.enum([
  "terminal-environment",
  "agent-orchestration",
  "coordination",
  "browser-automation",
  "sidebar-metadata",
]);
export type CapabilityId = z.infer<typeof CapabilityId>;

// ---------------------------------------------------------------------------
// Common enums
// ---------------------------------------------------------------------------

export const PaneState = z.enum(["idle", "busy", "exited", "unknown"]);
export type PaneState = z.infer<typeof PaneState>;

export const SplitDirection = z.enum(["left", "right", "up", "down"]);
export type SplitDirection = z.infer<typeof SplitDirection>;

export const ResizeDirection = z.enum(["left", "right", "up", "down"]);
export type ResizeDirection = z.infer<typeof ResizeDirection>;

export const CliType = z.enum([
  "claude",
  "gemini",
  "codex",
  "opencode",
  "goose",
]);
export type CliType = z.infer<typeof CliType>;

export const SpecialKey = z.enum([
  "enter",
  "tab",
  "escape",
  "backspace",
  "delete",
  "up",
  "down",
  "left",
  "right",
  "ctrl+c",
  "ctrl+d",
  "ctrl+z",
  "ctrl+l",
  "ctrl+a",
  "ctrl+e",
]);
export type SpecialKey = z.infer<typeof SpecialKey>;

// ---------------------------------------------------------------------------
// Common schemas
// ---------------------------------------------------------------------------

/** Identifies a single pane across all providers */
export const PaneRef = z.string().describe("Opaque pane identifier (provider-specific format)");

/** Describes a pane in list results */
export const PaneInfo = z.object({
  id: PaneRef,
  title: z.string().optional(),
  cli: CliType.optional().describe("Detected AI CLI running in this pane"),
  state: PaneState.optional(),
  cwd: z.string().optional(),
});
export type PaneInfo = z.infer<typeof PaneInfo>;

/** Standard result envelope — every tool returns this shape */
export const ResultEnvelope = z.object({
  ok: z.boolean(),
  error: z.string().optional(),
});
export type ResultEnvelope = z.infer<typeof ResultEnvelope>;

// ---------------------------------------------------------------------------
// Coordination enums
// ---------------------------------------------------------------------------

export const Priority = z.enum(["P0", "P1", "P2", "P3"]);
export type Priority = z.infer<typeof Priority>;

export const TaskStatus = z.enum([
  "pending",
  "accepted",
  "in-progress",
  "done",
  "blocked",
  "cancelled",
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const GoalType = z.enum(["mission", "project_goal", "agent_goal"]);
export type GoalType = z.infer<typeof GoalType>;

export const GoalStatus = z.enum(["active", "completed", "paused"]);
export type GoalStatus = z.infer<typeof GoalStatus>;

export const MemoryScope = z.enum(["agent", "channel", "workspace"]);
export type MemoryScope = z.infer<typeof MemoryScope>;

export const MemoryLayer = z.enum(["constraints", "behavior", "context"]);
export type MemoryLayer = z.infer<typeof MemoryLayer>;

export const Confidence = z.enum(["stated", "inferred", "observed"]);
export type Confidence = z.infer<typeof Confidence>;
