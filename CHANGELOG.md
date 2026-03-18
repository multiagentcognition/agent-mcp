# Changelog

## 0.1.0 (2026-03-18)

### Added

- Initial spec with 5 composable capability profiles
  - `terminal-environment` — 15 tools: lifecycle, pane CRUD, text I/O, navigation, layout
  - `agent-orchestration` — 12 tools: launchers, bulk I/O, session persistence
  - `coordination` — 27 tools: messaging, file claims, shared memory, tasks, goals
  - `browser-automation` — 10 tools: embedded browser control (optional)
  - `sidebar-metadata` — 8 tools: status, progress, logs, notifications (optional)
- `agents_capabilities` discovery tool (required for all providers)
- SDK validator for programmatic conformance checks
- Conformance test runner with pretty-printed reports
- Zod schemas for all tool inputs and outputs
