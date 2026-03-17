/**
 * @agents-mcp/spec — coordination capability
 *
 * Tools for multi-agent coordination: messaging, file claims,
 * shared memory, tasks, and goals.
 *
 * Provider: macp-agent-mcp (and any future coordination layer)
 * This capability does NOT require terminal-environment.
 */

import { z } from "zod";
import {
  Priority,
  TaskStatus,
  GoalType,
  GoalStatus,
  MemoryScope,
  MemoryLayer,
  Confidence,
  ResultEnvelope,
} from "../types.js";

// ===========================================================================
// MESSAGING
// ===========================================================================

/** coord_register — Register this agent session */
export const CoordRegisterInput = z.object({
  agent_name: z.string().optional(),
  role: z.string().optional(),
  interest_tags: z.array(z.string()).optional(),
});
export const CoordRegisterOutput = ResultEnvelope.extend({
  agent_id: z.string(),
  session_id: z.string(),
});

/** coord_poll — Check for incoming messages */
export const CoordPollInput = z.object({});
export const CoordPollOutput = ResultEnvelope.extend({
  deliveries: z.array(
    z.object({
      delivery_id: z.string(),
      from_agent: z.string(),
      channel: z.string().optional(),
      content: z.string(),
      content_type: z.string().optional(),
      priority: z.number().int().optional(),
      timestamp: z.string(),
    })
  ),
});

/** coord_send_channel — Broadcast to a channel */
export const CoordSendChannelInput = z.object({
  channel: z.string().optional().describe("Channel name (default: workspace default channel)"),
  content: z.string(),
  content_type: z.string().optional().default("text/plain"),
  priority: z.number().int().min(0).max(3).optional(),
});
export const CoordSendChannelOutput = ResultEnvelope;

/** coord_send_direct — Send to a specific agent */
export const CoordSendDirectInput = z.object({
  to_agent: z.string(),
  content: z.string(),
  content_type: z.string().optional().default("text/plain"),
  priority: z.number().int().min(0).max(3).optional(),
});
export const CoordSendDirectOutput = ResultEnvelope;

/** coord_ack — Acknowledge a delivery */
export const CoordAckInput = z.object({
  delivery_id: z.string(),
});
export const CoordAckOutput = ResultEnvelope;

/** coord_deregister — Unregister this agent session */
export const CoordDeregisterInput = z.object({});
export const CoordDeregisterOutput = ResultEnvelope;

// ===========================================================================
// AWARENESS
// ===========================================================================

/** coord_list_agents — List all active agents */
export const CoordListAgentsInput = z.object({});
export const CoordListAgentsOutput = ResultEnvelope.extend({
  agents: z.array(
    z.object({
      agent_id: z.string(),
      name: z.string().optional(),
      role: z.string().optional(),
      channels: z.array(z.string()).optional(),
      state: z.string().optional(),
    })
  ),
});

// ===========================================================================
// FILE CLAIMS
// ===========================================================================

/** coord_claim_files — Create advisory file locks */
export const CoordClaimFilesInput = z.object({
  paths: z.array(z.string()),
  ttl_seconds: z.number().int().optional().describe("Lock expiry in seconds"),
});
export const CoordClaimFilesOutput = ResultEnvelope.extend({
  claimed: z.array(z.string()),
  conflicts: z
    .array(
      z.object({
        path: z.string(),
        held_by: z.string(),
      })
    )
    .optional(),
});

/** coord_release_files — Release file claims */
export const CoordReleaseFilesInput = z.object({
  paths: z.array(z.string()),
});
export const CoordReleaseFilesOutput = ResultEnvelope;

/** coord_list_locks — List active file claims */
export const CoordListLocksInput = z.object({});
export const CoordListLocksOutput = ResultEnvelope.extend({
  locks: z.array(
    z.object({
      path: z.string(),
      held_by: z.string(),
      expires_at: z.string().optional(),
    })
  ),
});

// ===========================================================================
// SHARED MEMORY
// ===========================================================================

/** coord_set_memory — Store a scoped value */
export const CoordSetMemoryInput = z.object({
  key: z.string(),
  value: z.string(),
  scope: MemoryScope.optional().default("workspace"),
  layer: MemoryLayer.optional(),
  confidence: Confidence.optional(),
});
export const CoordSetMemoryOutput = ResultEnvelope;

/** coord_get_memory — Retrieve a value with scope cascading */
export const CoordGetMemoryInput = z.object({
  key: z.string(),
  scope: MemoryScope.optional(),
});
export const CoordGetMemoryOutput = ResultEnvelope.extend({
  value: z.string().nullable(),
  scope: MemoryScope.optional(),
});

/** coord_search_memory — Full-text search across visible memories */
export const CoordSearchMemoryInput = z.object({
  query: z.string(),
  scope: MemoryScope.optional(),
  limit: z.number().int().optional(),
});
export const CoordSearchMemoryOutput = ResultEnvelope.extend({
  results: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      scope: MemoryScope,
    })
  ),
});

/** coord_list_memories — List memories with optional filtering */
export const CoordListMemoriesInput = z.object({
  scope: MemoryScope.optional(),
  prefix: z.string().optional(),
});
export const CoordListMemoriesOutput = ResultEnvelope.extend({
  memories: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      scope: MemoryScope,
    })
  ),
});

/** coord_delete_memory — Archive a memory entry */
export const CoordDeleteMemoryInput = z.object({
  key: z.string(),
  scope: MemoryScope.optional(),
});
export const CoordDeleteMemoryOutput = ResultEnvelope;

// ===========================================================================
// TASKS
// ===========================================================================

/** coord_dispatch_task — Create a task for routing */
export const CoordDispatchTaskInput = z.object({
  title: z.string(),
  description: z.string().optional(),
  priority: Priority.optional().default("P2"),
  assigned_to: z.string().optional().describe("Agent ID or profile slug"),
  goal_id: z.string().optional(),
});
export const CoordDispatchTaskOutput = ResultEnvelope.extend({
  task_id: z.string(),
});

/** coord_claim_task — Agent claims a pending task */
export const CoordClaimTaskInput = z.object({
  task_id: z.string(),
});
export const CoordClaimTaskOutput = ResultEnvelope;

/** coord_start_task — Transition task to in-progress */
export const CoordStartTaskInput = z.object({
  task_id: z.string(),
});
export const CoordStartTaskOutput = ResultEnvelope;

/** coord_complete_task — Complete a task with result */
export const CoordCompleteTaskInput = z.object({
  task_id: z.string(),
  result: z.string().optional(),
});
export const CoordCompleteTaskOutput = ResultEnvelope;

/** coord_block_task — Block a task with reason */
export const CoordBlockTaskInput = z.object({
  task_id: z.string(),
  reason: z.string(),
});
export const CoordBlockTaskOutput = ResultEnvelope;

/** coord_cancel_task — Cancel a task */
export const CoordCancelTaskInput = z.object({
  task_id: z.string(),
  reason: z.string().optional(),
});
export const CoordCancelTaskOutput = ResultEnvelope;

/** coord_get_task — Fetch task details */
export const CoordGetTaskInput = z.object({
  task_id: z.string(),
});
export const CoordGetTaskOutput = ResultEnvelope.extend({
  task: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    status: TaskStatus,
    priority: Priority,
    assigned_to: z.string().optional(),
    goal_id: z.string().optional(),
    result: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

/** coord_list_tasks — List tasks with filtering */
export const CoordListTasksInput = z.object({
  status: TaskStatus.optional(),
  priority: Priority.optional(),
  assigned_to: z.string().optional(),
  goal_id: z.string().optional(),
});
export const CoordListTasksOutput = ResultEnvelope.extend({
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: TaskStatus,
      priority: Priority,
      assigned_to: z.string().optional(),
    })
  ),
});

// ===========================================================================
// GOALS
// ===========================================================================

/** coord_create_goal — Create a goal in the hierarchy */
export const CoordCreateGoalInput = z.object({
  title: z.string(),
  description: z.string().optional(),
  type: GoalType.optional().default("project_goal"),
  parent_id: z.string().optional(),
});
export const CoordCreateGoalOutput = ResultEnvelope.extend({
  goal_id: z.string(),
});

/** coord_update_goal — Update a goal */
export const CoordUpdateGoalInput = z.object({
  goal_id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: GoalStatus.optional(),
});
export const CoordUpdateGoalOutput = ResultEnvelope;

/** coord_list_goals — List goals with filtering */
export const CoordListGoalsInput = z.object({
  status: GoalStatus.optional(),
  type: GoalType.optional(),
});
export const CoordListGoalsOutput = ResultEnvelope.extend({
  goals: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      type: GoalType,
      status: GoalStatus,
      parent_id: z.string().optional(),
    })
  ),
});

/** coord_get_goal — Fetch a single goal with ancestry */
export const CoordGetGoalInput = z.object({
  goal_id: z.string(),
});
export const CoordGetGoalOutput = ResultEnvelope.extend({
  goal: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    type: GoalType,
    status: GoalStatus,
    parent_id: z.string().optional(),
    children: z.array(z.string()).optional(),
  }),
});

// ===========================================================================
// Tool registry
// ===========================================================================

export const COORDINATION_TOOLS = {
  // Messaging
  coord_register: { input: CoordRegisterInput, output: CoordRegisterOutput },
  coord_poll: { input: CoordPollInput, output: CoordPollOutput },
  coord_send_channel: { input: CoordSendChannelInput, output: CoordSendChannelOutput },
  coord_send_direct: { input: CoordSendDirectInput, output: CoordSendDirectOutput },
  coord_ack: { input: CoordAckInput, output: CoordAckOutput },
  coord_deregister: { input: CoordDeregisterInput, output: CoordDeregisterOutput },
  // Awareness
  coord_list_agents: { input: CoordListAgentsInput, output: CoordListAgentsOutput },
  // File claims
  coord_claim_files: { input: CoordClaimFilesInput, output: CoordClaimFilesOutput },
  coord_release_files: { input: CoordReleaseFilesInput, output: CoordReleaseFilesOutput },
  coord_list_locks: { input: CoordListLocksInput, output: CoordListLocksOutput },
  // Shared memory
  coord_set_memory: { input: CoordSetMemoryInput, output: CoordSetMemoryOutput },
  coord_get_memory: { input: CoordGetMemoryInput, output: CoordGetMemoryOutput },
  coord_search_memory: { input: CoordSearchMemoryInput, output: CoordSearchMemoryOutput },
  coord_list_memories: { input: CoordListMemoriesInput, output: CoordListMemoriesOutput },
  coord_delete_memory: { input: CoordDeleteMemoryInput, output: CoordDeleteMemoryOutput },
  // Tasks
  coord_dispatch_task: { input: CoordDispatchTaskInput, output: CoordDispatchTaskOutput },
  coord_claim_task: { input: CoordClaimTaskInput, output: CoordClaimTaskOutput },
  coord_start_task: { input: CoordStartTaskInput, output: CoordStartTaskOutput },
  coord_complete_task: { input: CoordCompleteTaskInput, output: CoordCompleteTaskOutput },
  coord_block_task: { input: CoordBlockTaskInput, output: CoordBlockTaskOutput },
  coord_cancel_task: { input: CoordCancelTaskInput, output: CoordCancelTaskOutput },
  coord_get_task: { input: CoordGetTaskInput, output: CoordGetTaskOutput },
  coord_list_tasks: { input: CoordListTasksInput, output: CoordListTasksOutput },
  // Goals
  coord_create_goal: { input: CoordCreateGoalInput, output: CoordCreateGoalOutput },
  coord_update_goal: { input: CoordUpdateGoalInput, output: CoordUpdateGoalOutput },
  coord_list_goals: { input: CoordListGoalsInput, output: CoordListGoalsOutput },
  coord_get_goal: { input: CoordGetGoalInput, output: CoordGetGoalOutput },
} as const;

export type CoordinationToolName = keyof typeof COORDINATION_TOOLS;
