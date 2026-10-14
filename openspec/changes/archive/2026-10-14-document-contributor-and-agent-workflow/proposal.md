# Proposal

## Why

Card Tracker has a working local-first application and an OpenSpec workflow, but a new contributor or coding agent must infer how the repository fits together from scattered files, archived planning artifacts, and tool-specific workflow integrations. The versioned Graphify output now provides a shared architecture map, so this is the right time to turn that knowledge into a maintained contributor and agent entry point.

## What Changes

- Expand the project README with a clear quick start, validation commands, repository orientation, and links to contributor documentation.
- Add contributor documentation covering local development, the `feature/*` -> `develop` -> `main` branch flow, pull request expectations, and pre-merge checks.
- Document the repository's spec-driven development lifecycle through OpenSpec: explore, propose, review planning artifacts, apply tasks, validate, sync or archive, and merge.
- Add an agent-oriented architecture guide grounded in the versioned Graphify report, including application entry points, feature-to-file ownership, data flow, test locations, and guidance for refreshing the graph.
- Explain which Graphify artifacts are versioned shared outputs and which generated caches are intentionally ignored.
- Keep documentation aligned with the existing React/Vite/TypeScript app, local browser storage boundary, three durable OpenSpec capabilities, and existing workflow integrations.

## Capabilities

### New Capabilities

<!-- This is documentation and tooling guidance only; no runtime capability is introduced. -->

### Modified Capabilities

<!-- No product requirements change. This change opts out of capability specs. -->

## Impact

- Documentation files at the repository root and under `docs/`.
- Agent guidance in the contributor documentation, without changing application runtime behavior.
- OpenSpec planning and workflow documentation, without changing the existing OpenSpec capability specifications.
- No production dependencies, APIs, persistence formats, or user-facing application behavior.
- The versioned `graphify-out/` artifacts remain the source of the generated architecture graph; the documentation will link to and explain them rather than duplicate their full contents.
