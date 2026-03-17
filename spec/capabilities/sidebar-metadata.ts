/**
 * @agents-mcp/spec — sidebar-metadata capability (OPTIONAL)
 *
 * Tools for displaying status badges, progress bars, logs, and
 * notifications in the terminal environment's sidebar/chrome.
 *
 * Providers: cmux-agent-mcp (wezterm does not support this)
 */

import { z } from "zod";
import { ResultEnvelope } from "../types.js";

// ===========================================================================
// STATUS BADGES
// ===========================================================================

/** sidebar_set_status — Set a key-value status badge */
export const SidebarSetStatusInput = z.object({
  key: z.string(),
  value: z.string(),
  icon: z.string().optional(),
  color: z.string().optional(),
});
export const SidebarSetStatusOutput = ResultEnvelope;

/** sidebar_clear_status — Remove a status badge */
export const SidebarClearStatusInput = z.object({
  key: z.string(),
});
export const SidebarClearStatusOutput = ResultEnvelope;

/** sidebar_list_status — List all active status badges */
export const SidebarListStatusInput = z.object({});
export const SidebarListStatusOutput = ResultEnvelope.extend({
  statuses: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      icon: z.string().optional(),
      color: z.string().optional(),
    })
  ),
});

// ===========================================================================
// PROGRESS
// ===========================================================================

/** sidebar_set_progress — Set a progress bar (0.0 to 1.0) */
export const SidebarSetProgressInput = z.object({
  progress: z.number().min(0).max(1),
  label: z.string().optional(),
});
export const SidebarSetProgressOutput = ResultEnvelope;

/** sidebar_clear_progress — Remove the progress bar */
export const SidebarClearProgressInput = z.object({});
export const SidebarClearProgressOutput = ResultEnvelope;

// ===========================================================================
// LOGGING
// ===========================================================================

/** sidebar_log — Append a log entry to the sidebar */
export const SidebarLogInput = z.object({
  message: z.string(),
  level: z.enum(["info", "progress", "success", "warning", "error"]).optional().default("info"),
  source: z.string().optional(),
});
export const SidebarLogOutput = ResultEnvelope;

// ===========================================================================
// NOTIFICATIONS
// ===========================================================================

/** sidebar_notify — Show a visual notification */
export const SidebarNotifyInput = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
});
export const SidebarNotifyOutput = ResultEnvelope;

/** sidebar_clear_notifications — Clear all notifications */
export const SidebarClearNotificationsInput = z.object({});
export const SidebarClearNotificationsOutput = ResultEnvelope;

// ===========================================================================
// Tool registry
// ===========================================================================

export const SIDEBAR_METADATA_TOOLS = {
  sidebar_set_status: { input: SidebarSetStatusInput, output: SidebarSetStatusOutput },
  sidebar_clear_status: { input: SidebarClearStatusInput, output: SidebarClearStatusOutput },
  sidebar_list_status: { input: SidebarListStatusInput, output: SidebarListStatusOutput },
  sidebar_set_progress: { input: SidebarSetProgressInput, output: SidebarSetProgressOutput },
  sidebar_clear_progress: { input: SidebarClearProgressInput, output: SidebarClearProgressOutput },
  sidebar_log: { input: SidebarLogInput, output: SidebarLogOutput },
  sidebar_notify: { input: SidebarNotifyInput, output: SidebarNotifyOutput },
  sidebar_clear_notifications: {
    input: SidebarClearNotificationsInput,
    output: SidebarClearNotificationsOutput,
  },
} as const;

export type SidebarMetadataToolName = keyof typeof SIDEBAR_METADATA_TOOLS;
