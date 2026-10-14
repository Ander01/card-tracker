# Design

## Context

See `proposal.md` for the motivation and scope. The repository currently has a concise [`README.md`](../../README.md), a React/Vite/TypeScript client, three durable OpenSpec capabilities, several tool-specific OpenSpec integrations, and versioned Graphify outputs under `graphify-out/`.

The documentation must describe observed repository boundaries rather than imply a deeper feature structure than currently exists:

```text
index.html -> src/main.tsx -> src/App.tsx
                              |
                 +------------+------------+
                 v                         v
       src/domain/collection.ts   src/domain/suggestions.ts
                 |                         |
                 v                         v
          browser localStorage       binder ordering
```

## Goals / Non-Goals

**Goals:**

- Give a new contributor one reliable path from checkout to a validated local change.
- Explain the repository's branch topology and how it relates to OpenSpec planning.
- Give agents a compact map from product capability or task type to source files, tests, specifications, and Graphify queries.
- Make the OpenSpec lifecycle understandable without requiring readers to inspect the Claude, GitHub, and OpenCode integrations separately.
- Keep generated Graphify outputs discoverable while distinguishing shared artifacts from ignored local caches.

**Non-Goals:**

- Restructuring the current React application or splitting `App.tsx`.
- Changing OpenSpec schema, prompts, skills, or capability requirements.
- Adding a documentation website, static-site generator, or new runtime dependency.
- Replacing Graphify's generated report with a manually maintained duplicate graph.
- Defining a new branching policy beyond documenting the existing `feature/*` -> `develop` -> `main` flow.

## Decisions

### Use layered documentation rather than one large README

Keep the README focused on product orientation and the shortest setup path. Add `CONTRIBUTING.md` for development, branch, validation, and OpenSpec workflow instructions. Add `docs/architecture.md` for the deeper agent-oriented map.

This is preferred over putting everything in the README because the graph and workflow details are useful to contributors and agents but would make the landing page difficult to scan.

### Document the conceptual OpenSpec lifecycle once

Describe the lifecycle as:

```text
explore -> propose -> review artifacts -> apply tasks
                                      |
                                      v
                           validate -> sync/archive
```

Link to the repository's existing `.github/prompts/`, `.github/skills/`, `.claude/`, and `.opencode/` integrations as implementation surfaces, but do not duplicate their full instructions. Tool-specific sections should identify the relevant command or skill and its purpose.

### Use Graphify as the architecture source, not a second manual dependency database

The architecture guide will link to `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.html`, and `graphify-out/graph.json`, then summarize stable navigation facts: entrypoint, application composition, domain modules, tests, OpenSpec directories, and Graphify refresh guidance.

The guide should recommend `graphify query`, `graphify path`, and `graphify explain` for focused investigations. It should not copy every node or inferred edge from the generated report.

### Keep documentation validation lightweight and explicit

Documentation tasks will validate links and command accuracy by checking referenced paths and running the existing `npm test`, `npm run typecheck`, and `npm run build` commands when implementation begins. No documentation-specific toolchain will be added.

### Preserve generated-output ownership boundaries

The guide will state that the three shared Graphify outputs are versioned, while `cache/`, manifests, cost data, and extraction chunks are local regeneration artifacts. Contributors should regenerate the graph instead of hand-merging generated output.

## Risks / Trade-offs

- [Documentation can drift from the code] -> Keep file maps concise, link to authoritative source/spec files, and include Graphify refresh guidance.
- [Multiple agent integrations can make the lifecycle appear duplicated] -> Present one conceptual lifecycle and list integrations as adapters.
- [Generated graph output can become stale] -> Document when to refresh it and make refresh verification part of the task checklist.
- [Branch names in archived planning artifacts may not match future work] -> Describe the topology generically as `feature/*` -> `develop` -> `main`, while preserving the original branch as historical context only.
