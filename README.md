# agents-mcp

Canonical spec for Agent MCP providers. Defines the tool names, input schemas, output schemas, and semantics that any Agent MCP implementation must follow for interoperability.

## Problem

Multiple Agent MCP providers exist (cmux-agent-mcp, wezterm-agent-mcp, macp-agent-mcp) with overlapping functionality but different tool names and schemas. Consumers (Pulse, Storyrun, future products) are forced to couple to specific implementations. If a provider changes its interface, everything downstream breaks.

## Solution

This repo defines **capability profiles** — composable contracts that providers implement and consumers program against. A provider declares which capabilities it supports via `agents_capabilities`, and consumers discover + call tools using canonical names.

```
┌─────────────────────────────────────────────────────────┐
│                     Consumers                           │
│   Pulse  ·  Storyrun  ·  Custom orchestrators           │
│                         │                               │
│              calls canonical tool names                 │
│                         ▼                               │
│   ┌─────────────────────────────────────────────────┐   │
│   │            agents-mcp spec (this repo)          │   │
│   │                                                 │   │
│   │  terminal-environment  ·  agent-orchestration   │   │
│   │  coordination  ·  browser-automation            │   │
│   │  sidebar-metadata                               │   │
│   └─────────────────────────────────────────────────┘   │
│                         │                               │
│           providers implement these profiles            │
│                         ▼                               │
│   cmux-agent-mcp  ·  wezterm-agent-mcp  ·  macp-agent-mcp │
└─────────────────────────────────────────────────────────┘
```

## Capability Profiles

### `terminal-environment` (Required for terminal providers)

Lifecycle, pane CRUD, text I/O, navigation, and layout.

| Tool | Description |
|---|---|
| `term_status` | Health check and environment info |
| `term_start` | Launch the terminal environment |
| `term_shutdown` | Terminate all panes and environment |
| `term_spawn` | Create a new pane |
| `term_split` | Split an existing pane |
| `term_kill_pane` | Close a specific pane |
| `term_list` | List all panes with metadata |
| `term_send_text` | Send text without Enter |
| `term_send_submit` | Send text and press Enter |
| `term_send_key` | Send a special key |
| `term_read_output` | Read text output from a pane |
| `term_focus_pane` | Focus/activate a pane |
| `term_resize_pane` | Resize a pane |
| `term_rename` | Rename tab/workspace/window |
| `term_screenshot` | Capture a screenshot |

### `agent-orchestration` (Required for agent-aware terminals)

Launching AI CLIs, bulk I/O, and session persistence. **Depends on** `terminal-environment`.

| Tool | Description |
|---|---|
| `orch_launch` | Spawn multiple AI agents in a grid |
| `orch_launch_grid` | Create an empty terminal grid |
| `orch_launch_mixed` | Launch heterogeneous AI CLIs |
| `orch_broadcast` | Send same text to all panes |
| `orch_send_each` | Send different text to each pane |
| `orch_send_some` | Send text to specific panes |
| `orch_read_all` | Read output from all panes |
| `orch_read_deep` | Query idle agents for status |
| `orch_orchestrate` | Send targeted prompts to panes |
| `orch_session_save` | Persist environment state |
| `orch_session_recover` | Restore from saved state |
| `orch_session_reconcile` | Compare saved vs. live state |

### `coordination` (Standalone — no terminal required)

Multi-agent messaging, file claims, shared memory, tasks, and goals.

| Tool | Description |
|---|---|
| `coord_register` | Register agent session |
| `coord_poll` | Check for incoming messages |
| `coord_send_channel` | Broadcast to channel |
| `coord_send_direct` | Send to specific agent |
| `coord_ack` | Acknowledge delivery |
| `coord_deregister` | Unregister session |
| `coord_list_agents` | List active agents |
| `coord_claim_files` | Create advisory file locks |
| `coord_release_files` | Release file claims |
| `coord_list_locks` | List active file claims |
| `coord_set_memory` | Store scoped value |
| `coord_get_memory` | Retrieve value |
| `coord_search_memory` | Full-text search memories |
| `coord_list_memories` | List memories |
| `coord_delete_memory` | Archive memory |
| `coord_dispatch_task` | Create a task |
| `coord_claim_task` | Claim a pending task |
| `coord_start_task` | Transition to in-progress |
| `coord_complete_task` | Complete with result |
| `coord_block_task` | Block with reason |
| `coord_cancel_task` | Cancel a task |
| `coord_get_task` | Fetch task details |
| `coord_list_tasks` | List tasks |
| `coord_create_goal` | Create a goal |
| `coord_update_goal` | Update a goal |
| `coord_list_goals` | List goals |
| `coord_get_goal` | Fetch goal details |

### `browser-automation` (Optional extension)

Embedded browser control. Not all providers support this.

| Tool | Description |
|---|---|
| `browser_open` | Open browser surface |
| `browser_navigate` | Navigate (goto/back/forward/reload) |
| `browser_snapshot` | Accessibility tree snapshot |
| `browser_screenshot` | Capture page screenshot |
| `browser_eval` | Execute JavaScript |
| `browser_click` | Click element |
| `browser_fill` | Fill input field |
| `browser_type` | Type text key-by-key |
| `browser_wait` | Wait for condition |
| `browser_get` | Get page data |

### `sidebar-metadata` (Optional extension)

Status badges, progress bars, logs, and notifications.

| Tool | Description |
|---|---|
| `sidebar_set_status` | Set status badge |
| `sidebar_clear_status` | Remove status badge |
| `sidebar_list_status` | List status badges |
| `sidebar_set_progress` | Set progress bar |
| `sidebar_clear_progress` | Remove progress bar |
| `sidebar_log` | Append log entry |
| `sidebar_notify` | Show notification |
| `sidebar_clear_notifications` | Clear notifications |

## Discovery

Every conforming provider MUST expose `agents_capabilities`:

```json
{
  "ok": true,
  "spec_version": "0.1.0",
  "provider": "cmux",
  "provider_version": "1.2.3",
  "capabilities": [
    { "id": "terminal-environment", "version": "0.1.0" },
    { "id": "agent-orchestration", "version": "0.1.0" },
    { "id": "browser-automation", "version": "0.1.0" },
    { "id": "sidebar-metadata", "version": "0.1.0" }
  ],
  "platform": "darwin"
}
```

Consumers call this first, then only use tools from declared capabilities.

## Usage

### For providers (implementing the spec)

```bash
npm install @agents-mcp/spec
```

```typescript
import {
  TERMINAL_ENVIRONMENT_TOOLS,
  AGENT_ORCHESTRATION_TOOLS,
  AgentsCapabilitiesOutput,
} from "@agents-mcp/spec";

// Register tools using the canonical names and schemas
for (const [name, { input, output }] of Object.entries(TERMINAL_ENVIRONMENT_TOOLS)) {
  server.tool(name, input, async (params) => {
    // Your implementation here
    return output.parse(result);
  });
}
```

### For consumers (calling providers)

```typescript
import {
  TermListOutput,
  OrchLaunchInput,
  OrchReadAllOutput,
} from "@agents-mcp/spec";

// Call canonical tool names — works with any conforming provider
const panes = TermListOutput.parse(await callTool("term_list", {}));
const launched = await callTool("orch_launch", OrchLaunchInput.parse({
  cli: "claude",
  count: 4,
  cwd: "/my/project",
}));
```

### Conformance testing

```typescript
import { runConformance, printReport } from "@agents-mcp/spec/conformance";

const report = await runConformance(callTool, listTools);
printReport(report);
// ✓ term_status
// ✓ term_spawn
// ✗ term_split — Missing input fields: direction
```

## Versioning

- Spec follows semver: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes (removed tools, changed required fields)
- **MINOR**: Additive changes (new optional tools, new optional fields)
- **PATCH**: Docs, clarifications, conformance test fixes
- Providers declare which spec version they conform to
- Consumers should check `spec_version` and handle gracefully

## Design Principles

1. **Canonical names** — One name per concept. No prefixes that leak provider identity.
2. **Composable capabilities** — Pick what you implement. Headless coordination? Just `coordination`. Full terminal? `terminal-environment` + `agent-orchestration`.
3. **Schema-first** — Every tool has Zod input/output schemas. Validation is free.
4. **Discovery-driven** — Consumers never guess. Call `agents_capabilities` first.
5. **Provider-agnostic** — The spec doesn't care if you're cmux, wezterm, or something that doesn't exist yet.

## Provider Mapping

How existing providers map to spec capabilities:

| Provider | terminal-environment | agent-orchestration | coordination | browser-automation | sidebar-metadata |
|---|---|---|---|---|---|
| cmux-agent-mcp | Yes | Yes | — | Yes | Yes |
| wezterm-agent-mcp | Yes | Yes | — | — | — |
| macp-agent-mcp | — | — | Yes | — | — |

## License

[PolyForm Strict 1.0.0](LICENSE)
