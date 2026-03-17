/**
 * @agents-mcp/spec — browser-automation capability (OPTIONAL)
 *
 * Tools for controlling embedded browser surfaces.
 * Not all terminal providers support this — consumers MUST check
 * agents_capabilities before calling these tools.
 *
 * Providers: cmux-agent-mcp (wezterm does not support this)
 */

import { z } from "zod";
import { PaneRef, ResultEnvelope } from "../types.js";

// ===========================================================================
// BROWSER TOOLS
// ===========================================================================

/** browser_open — Open a browser surface */
export const BrowserOpenInput = z.object({
  url: z.string().optional(),
  pane_id: PaneRef.optional(),
});
export const BrowserOpenOutput = ResultEnvelope.extend({
  pane_id: PaneRef.optional(),
});

/** browser_navigate — Navigate the browser */
export const BrowserNavigateInput = z.object({
  action: z.enum(["goto", "back", "forward", "reload"]),
  url: z.string().optional().describe("Required when action is 'goto'"),
  pane_id: PaneRef.optional(),
});
export const BrowserNavigateOutput = ResultEnvelope;

/** browser_snapshot — Get accessibility tree snapshot of the page */
export const BrowserSnapshotInput = z.object({
  selector: z.string().optional(),
  compact: z.boolean().optional(),
  pane_id: PaneRef.optional(),
});
export const BrowserSnapshotOutput = ResultEnvelope.extend({
  snapshot: z.string(),
});

/** browser_screenshot — Capture page screenshot */
export const BrowserScreenshotInput = z.object({
  output_path: z.string().optional(),
  pane_id: PaneRef.optional(),
});
export const BrowserScreenshotOutput = ResultEnvelope.extend({
  path: z.string().optional(),
});

/** browser_eval — Execute JavaScript in the page */
export const BrowserEvalInput = z.object({
  script: z.string(),
  pane_id: PaneRef.optional(),
});
export const BrowserEvalOutput = ResultEnvelope.extend({
  result: z.unknown().optional(),
});

/** browser_click — Click an element */
export const BrowserClickInput = z.object({
  selector: z.string(),
  pane_id: PaneRef.optional(),
});
export const BrowserClickOutput = ResultEnvelope;

/** browser_fill — Fill an input field */
export const BrowserFillInput = z.object({
  selector: z.string(),
  value: z.string(),
  pane_id: PaneRef.optional(),
});
export const BrowserFillOutput = ResultEnvelope;

/** browser_type — Type text key-by-key */
export const BrowserTypeInput = z.object({
  selector: z.string(),
  text: z.string(),
  pane_id: PaneRef.optional(),
});
export const BrowserTypeOutput = ResultEnvelope;

/** browser_wait — Wait for a condition */
export const BrowserWaitInput = z.object({
  selector: z.string().optional(),
  text: z.string().optional(),
  url_contains: z.string().optional(),
  timeout_ms: z.number().int().optional(),
  pane_id: PaneRef.optional(),
});
export const BrowserWaitOutput = ResultEnvelope;

/** browser_get — Get page data */
export const BrowserGetInput = z.object({
  property: z.enum([
    "url",
    "title",
    "text",
    "html",
    "value",
    "attr",
    "count",
    "box",
    "styles",
  ]),
  selector: z.string().optional(),
  attribute: z.string().optional(),
  pane_id: PaneRef.optional(),
});
export const BrowserGetOutput = ResultEnvelope.extend({
  value: z.unknown(),
});

// ===========================================================================
// Tool registry
// ===========================================================================

export const BROWSER_AUTOMATION_TOOLS = {
  browser_open: { input: BrowserOpenInput, output: BrowserOpenOutput },
  browser_navigate: { input: BrowserNavigateInput, output: BrowserNavigateOutput },
  browser_snapshot: { input: BrowserSnapshotInput, output: BrowserSnapshotOutput },
  browser_screenshot: { input: BrowserScreenshotInput, output: BrowserScreenshotOutput },
  browser_eval: { input: BrowserEvalInput, output: BrowserEvalOutput },
  browser_click: { input: BrowserClickInput, output: BrowserClickOutput },
  browser_fill: { input: BrowserFillInput, output: BrowserFillOutput },
  browser_type: { input: BrowserTypeInput, output: BrowserTypeOutput },
  browser_wait: { input: BrowserWaitInput, output: BrowserWaitOutput },
  browser_get: { input: BrowserGetInput, output: BrowserGetOutput },
} as const;

export type BrowserAutomationToolName = keyof typeof BROWSER_AUTOMATION_TOOLS;
