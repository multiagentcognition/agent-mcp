/**
 * @agents-mcp/spec — terminal-environment capability
 *
 * REQUIRED tools that any terminal-based Agent MCP provider MUST implement.
 * These cover lifecycle, pane CRUD, text I/O, navigation, and layout.
 *
 * Providers: cmux-agent-mcp, wezterm-agent-mcp, future terminal MCPs
 */

import { z } from "zod";
import {
  PaneRef,
  PaneInfo,
  PaneState,
  SplitDirection,
  ResizeDirection,
  SpecialKey,
  ResultEnvelope,
} from "../types.js";

// ===========================================================================
// LIFECYCLE
// ===========================================================================

/** term_status — Health check and environment info */
export const TermStatusInput = z.object({});
export const TermStatusOutput = ResultEnvelope.extend({
  running: z.boolean(),
  pane_count: z.number().int(),
  platform: z.string().optional(),
  version: z.string().optional(),
});

/** term_start — Launch the terminal environment if not running */
export const TermStartInput = z.object({
  cwd: z.string().optional().describe("Working directory to open in"),
});
export const TermStartOutput = ResultEnvelope.extend({
  started: z.boolean().describe("True if freshly started, false if already running"),
});

/** term_shutdown — Terminate all panes and the environment */
export const TermShutdownInput = z.object({});
export const TermShutdownOutput = ResultEnvelope;

// ===========================================================================
// PANE CRUD
// ===========================================================================

/** term_spawn — Create a new pane (new window/tab) */
export const TermSpawnInput = z.object({
  cwd: z.string().optional(),
  command: z.string().optional().describe("Shell command to run in the new pane"),
  new_window: z.boolean().optional().describe("Open in a new OS window"),
});
export const TermSpawnOutput = ResultEnvelope.extend({
  pane_id: PaneRef,
});

/** term_split — Split an existing pane */
export const TermSplitInput = z.object({
  pane_id: PaneRef.optional().describe("Pane to split (default: focused pane)"),
  direction: SplitDirection,
  cwd: z.string().optional(),
  command: z.string().optional(),
});
export const TermSplitOutput = ResultEnvelope.extend({
  pane_id: PaneRef.describe("The newly created pane"),
});

/** term_kill_pane — Close a specific pane */
export const TermKillPaneInput = z.object({
  pane_id: PaneRef,
});
export const TermKillPaneOutput = ResultEnvelope;

/** term_list — List all panes with metadata */
export const TermListInput = z.object({});
export const TermListOutput = ResultEnvelope.extend({
  total: z.number().int(),
  panes: z.array(PaneInfo),
});

// ===========================================================================
// TEXT I/O
// ===========================================================================

/** term_send_text — Send text to a pane WITHOUT pressing Enter */
export const TermSendTextInput = z.object({
  pane_id: PaneRef.optional().describe("Target pane (default: focused pane)"),
  text: z.string(),
});
export const TermSendTextOutput = ResultEnvelope;

/** term_send_submit — Send text to a pane AND press Enter */
export const TermSendSubmitInput = z.object({
  pane_id: PaneRef.optional(),
  text: z.string(),
});
export const TermSendSubmitOutput = ResultEnvelope;

/** term_send_key — Send a special key to a pane */
export const TermSendKeyInput = z.object({
  pane_id: PaneRef.optional(),
  key: SpecialKey,
});
export const TermSendKeyOutput = ResultEnvelope;

/** term_read_output — Read text output from a pane */
export const TermReadOutputInput = z.object({
  pane_id: PaneRef,
  lines: z.number().int().optional().describe("Number of lines to read (default: all visible)"),
  scrollback: z.boolean().optional().describe("Include scrollback buffer"),
});
export const TermReadOutputOutput = ResultEnvelope.extend({
  output: z.string(),
  lines: z.number().int().optional(),
});

// ===========================================================================
// NAVIGATION & LAYOUT
// ===========================================================================

/** term_focus_pane — Focus/activate a specific pane */
export const TermFocusPaneInput = z.object({
  pane_id: PaneRef,
});
export const TermFocusPaneOutput = ResultEnvelope;

/** term_resize_pane — Resize a pane in a direction */
export const TermResizePaneInput = z.object({
  pane_id: PaneRef,
  direction: ResizeDirection,
  amount: z.number().int().optional().describe("Resize magnitude (default: 1)"),
});
export const TermResizePaneOutput = ResultEnvelope;

/** term_rename — Rename a tab, workspace, or window */
export const TermRenameInput = z.object({
  title: z.string(),
  target: z.enum(["tab", "workspace", "window"]).optional().default("tab"),
});
export const TermRenameOutput = ResultEnvelope;

/** term_screenshot — Capture a screenshot of the environment */
export const TermScreenshotInput = z.object({
  output_path: z.string().optional(),
  pane_id: PaneRef.optional().describe("Specific pane to capture (default: entire environment)"),
});
export const TermScreenshotOutput = ResultEnvelope.extend({
  path: z.string().optional().describe("Path to the saved screenshot"),
});

// ===========================================================================
// Tool registry — canonical names and schemas
// ===========================================================================

export const TERMINAL_ENVIRONMENT_TOOLS = {
  // Lifecycle
  term_status: { input: TermStatusInput, output: TermStatusOutput },
  term_start: { input: TermStartInput, output: TermStartOutput },
  term_shutdown: { input: TermShutdownInput, output: TermShutdownOutput },
  // Pane CRUD
  term_spawn: { input: TermSpawnInput, output: TermSpawnOutput },
  term_split: { input: TermSplitInput, output: TermSplitOutput },
  term_kill_pane: { input: TermKillPaneInput, output: TermKillPaneOutput },
  term_list: { input: TermListInput, output: TermListOutput },
  // Text I/O
  term_send_text: { input: TermSendTextInput, output: TermSendTextOutput },
  term_send_submit: { input: TermSendSubmitInput, output: TermSendSubmitOutput },
  term_send_key: { input: TermSendKeyInput, output: TermSendKeyOutput },
  term_read_output: { input: TermReadOutputInput, output: TermReadOutputOutput },
  // Navigation & Layout
  term_focus_pane: { input: TermFocusPaneInput, output: TermFocusPaneOutput },
  term_resize_pane: { input: TermResizePaneInput, output: TermResizePaneOutput },
  term_rename: { input: TermRenameInput, output: TermRenameOutput },
  term_screenshot: { input: TermScreenshotInput, output: TermScreenshotOutput },
} as const;

export type TerminalEnvironmentToolName = keyof typeof TERMINAL_ENVIRONMENT_TOOLS;
