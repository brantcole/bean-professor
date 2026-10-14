# Phase 1 architecture

## Application boundary

Expo Router provides four native tabs and separate settings/session-detail routes. Coffee School is the default screen. A root `DemoProvider` owns mock journal rows, equipment, and separate brew/roast timers so navigating between screens preserves the running preview state.

Shared native controls provide 46–50px minimum touch targets, labeled inputs, selected/disabled accessibility states, safe areas, scrollable content, keyboard avoidance, readable system text, and a warm semantic palette. Headers use platform-provided serif typography; no external font download or stock photo is needed. The background is original code-based color/grid styling and can be replaced with authorized artwork later. The supplied logo binary is copied without editing. Light mode is implemented; a dark theme is deferred.

## Journal boundary

`packages/domain` defines a versioned `JournalSession`, guide snapshot, input snapshot, notes, favorite flag, timestamps, and saved timer markers. The `JournalRepository` port separates storage from screen code. Its Phase 1 implementation is an isolated in-memory repository that copies nested data on both writes and reads.

A future local database adapter can implement the same asynchronous port, with account-scoped storage, schema upgrades, pagination, deletion/export and a separate synchronization layer. Add an explicit owner identity and sync/revision/conflict model when staging Auth is approved. The Phase 1 prototype has no real user ownership and must never be mistaken for production-secure storage. It reads no legacy records.

Saving a lab session uses the inputs captured at plan generation, not the currently editable form. It also snapshots elapsed time and all current timer markers. Editing notes updates only the note and updated timestamp, preserving the guide and original observations. Favorites and search operate locally; search matches multiple case-insensitive terms across title, coffee, gear, notes and input values.

## Timer boundary

Elapsed time derives from a supplied monotonic clock rather than interval counts. Display ticks only request UI updates. Pause and marker actions sample the clock directly, avoiding stale displayed time. Root state survives tab navigation in the same running process. The prototype does not persist timer state across process termination or reload, and native suspension behavior has not been verified. Durable lifecycle recovery, background handling, and clock-adjustment tests remain later-phase work.

## Service boundary

`services/api/src/contracts.ts` establishes a versioned provider port and typed result/error shape. It is a scaffold, not a running HTTP server. Phase 1 mock factories are pure local functions with no fetches, database SDKs, credentials, or provider configuration. Later implementations will add runtime schemas, authentication, quotas, cancellation, evidence/provenance, and validated server responses under separately approved phases.

Coffee School uses a few deterministic sample lessons and a transient recent-question list. It does not claim to answer arbitrary questions with research. Brew parameters are illustrative demo values. Roast outputs intentionally withhold machine-specific controls. Custom gear does not imply verified capabilities.

## Legacy preservation

`legacy/` is a file-for-file extraction of the original archive. The root ignores its `.env`; nothing imports it or its application into the mobile runtime. Original archives and migration instructions are preserved. Root `AGENTS.md` and `00_START_HERE.md` are copied from the package, with the full package under `specs/`. New automated checks and formatter scopes omit these reference files. No migration or production request has occurred.
