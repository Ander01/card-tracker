# Tasks

## 1. Establish contributor documentation

- [x] 1.1 Expand `README.md` with the product summary, prerequisites, install/run commands, validation commands, local-first storage note, and links to `CONTRIBUTING.md` and `docs/architecture.md`; verify every documented command matches `package.json`.
- [x] 1.2 Create `CONTRIBUTING.md` with repository orientation, the `feature/*` -> `develop` -> `main` branch flow, focused change expectations, pull request guidance, and the required test/typecheck/build checks; verify all referenced branches, commands, and files exist or are explicitly described as future setup.
- [x] 1.3 Document the OpenSpec SDD lifecycle in `CONTRIBUTING.md`, including exploration, proposal artifacts, review, apply, validation, sync/archive, and the planning-versus-implementation boundary; verify each lifecycle step links to the corresponding repository command, prompt, skill, or directory.

## 2. Add the Graphify-informed agent architecture guide

- [x] 2.1 Create `docs/architecture.md` with the actual application entrypoint and data-flow map from `index.html` through `src/main.tsx`, `src/App.tsx`, the domain modules, browser storage, and binder suggestions; verify every source and test link resolves.
- [x] 2.2 Add feature-to-file and test-to-behavior tables covering the app shell, collection management, binder suggestions, persistence, accessibility, and OpenSpec capability specifications; verify the tables point to the current durable specs and source files rather than archived duplicates.
- [x] 2.3 Add an agent navigation guide with recommended first searches, Graphify `query`/`path`/`explain` examples, and guidance for tracing a requirement to implementation and tests; verify the examples use current node/file names from `graphify-out/GRAPH_REPORT.md` and `graphify-out/graph.json`.
- [x] 2.4 Document the versioned Graphify outputs and ignored regeneration artifacts, including when to refresh the graph and why generated files should be regenerated rather than hand-merged; verify the documented tracked/ignored split matches `.gitignore` and `.gitattributes`.

## 3. Integrate and validate the documentation

- [x] 3.1 Cross-link `README.md`, `CONTRIBUTING.md`, `docs/architecture.md`, the durable OpenSpec specs, and the versioned Graphify report; verify links resolve from their containing documents.
- [x] 3.2 Review the new documentation against the current repository and remove claims that are only present in archived planning artifacts; verify the documented architecture matches the generated Graphify report and current source tree.
- [x] 3.3 Run `npm test`, `npm run typecheck`, and `npm run build`; verify all existing application checks pass and no runtime source files or dependencies were changed by the documentation work.
- [x] 3.4 Run `openspec validate --changes "document-contributor-and-agent-workflow"` and verify the change reports complete with specs intentionally skipped because this is documentation/tooling only.
