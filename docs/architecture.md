# Architecture and agent guide

This document is a navigation guide for contributors and coding agents. The generated [Graphify report](../graphify-out/GRAPH_REPORT.md), [Graphify JSON graph](../graphify-out/graph.json), and [interactive graph](../graphify-out/graph.html) are the deeper architecture references; this document summarizes the stable paths agents use most often.

## Runtime entrypoint and data flow

```text
index.html
    |
    v
src/main.tsx
    |
    v
src/App.tsx
    |
    +-----------------------------+
    |                             |
    v                             v
collection.ts                 suggestions.ts
    |                             |
    +--> Card model               +--> BinderSuggestion
    +--> validateCard()           +--> suggestBinderOrder()
    +--> filterCards()                    |
    +--> createLocalStorage()             v
             |                    deterministic binder result
             v
      browser localStorage
```

The application has one top-level React composition point:

1. [`index.html`](../index.html) provides the `#app` mount and loads `src/main.tsx`.
2. [`src/main.tsx`](../src/main.tsx) creates the React root, loads global styles, and renders `App`.
3. [`src/App.tsx`](../src/App.tsx) owns the `home`, `collection`, and `suggestions` views, shared card state, navigation, form submission, and feature composition.
4. [`src/domain/collection.ts`](../src/domain/collection.ts) defines card types, validation, filtering, and the local storage boundary.
5. [`src/domain/suggestions.ts`](../src/domain/suggestions.ts) consumes cards and produces deterministic theme-based binder suggestions.

The collection is local to the browser. `createLocalStorage()` uses the `card-tracker.collection` key; there is no account, API, or remote synchronization layer in the current runtime.

## Feature ownership

| Capability | Runtime implementation | Durable specification | Main tests |
| --- | --- | --- | --- |
| App shell and navigation | [`src/App.tsx`](../src/App.tsx), [`src/main.tsx`](../src/main.tsx), [`index.html`](../index.html) | [`openspec/specs/card-tracker-app-shell/spec.md`](../openspec/specs/card-tracker-app-shell/spec.md) | [`src/App.test.tsx`](../src/App.test.tsx), [`src/accessibility.test.tsx`](../src/accessibility.test.tsx) |
| Collection model, validation, search, filters | [`src/domain/collection.ts`](../src/domain/collection.ts), collection view in [`src/App.tsx`](../src/App.tsx) | [`openspec/specs/collection-management/spec.md`](../openspec/specs/collection-management/spec.md) | [`src/domain/collection.test.ts`](../src/domain/collection.test.ts), [`src/App.test.tsx`](../src/App.test.tsx) |
| Local persistence | [`createLocalStorage()`](../src/domain/collection.ts) | [`openspec/specs/collection-management/spec.md`](../openspec/specs/collection-management/spec.md) | [`src/domain/storage.test.ts`](../src/domain/storage.test.ts) |
| Binder themes and deterministic ordering | [`src/domain/suggestions.ts`](../src/domain/suggestions.ts), suggestions view in [`src/App.tsx`](../src/App.tsx) | [`openspec/specs/binder-order-suggestions/spec.md`](../openspec/specs/binder-order-suggestions/spec.md) | [`src/domain/suggestions.test.ts`](../src/domain/suggestions.test.ts), [`src/App.test.tsx`](../src/App.test.tsx) |
| Accessibility baseline | [`src/accessibility.test.tsx`](../src/accessibility.test.tsx) | App shell and collection scenarios | `vitest-axe` check in accessibility test |

## Test-to-behavior map

| Test | Use it when changing |
| --- | --- |
| [`src/App.test.tsx`](../src/App.test.tsx) | Navigation, add-card form behavior, saved messages, or the end-to-end binder suggestion flow |
| [`src/accessibility.test.tsx`](../src/accessibility.test.tsx) | Semantic controls, labels, focus behavior, or layout changes that affect the landing view |
| [`src/domain/collection.test.ts`](../src/domain/collection.test.ts) | Card validation, filtering, card metadata, or filter immutability |
| [`src/domain/storage.test.ts`](../src/domain/storage.test.ts) | The storage boundary, serialization, or reload persistence |
| [`src/domain/suggestions.test.ts`](../src/domain/suggestions.test.ts) | Theme matching, deterministic ordering, no-theme handling, or no-match behavior |

## Agent navigation

### Start with the requirement

For a product behavior change, locate the durable capability first:

```text
openspec/specs/<capability>/spec.md
        |
        v
scenario -> runtime implementation -> focused test
```

The current capability directories are:

- [`card-tracker-app-shell`](../openspec/specs/card-tracker-app-shell/spec.md)
- [`collection-management`](../openspec/specs/collection-management/spec.md)
- [`binder-order-suggestions`](../openspec/specs/binder-order-suggestions/spec.md)

Then trace the requirement to the matching rows in the feature and test tables above. Keep behavior in the domain module when it is domain logic; keep view composition in `App.tsx` unless the change explicitly includes a component-boundary refactor.

### Use Graphify for relationship questions

The versioned graph is available immediately after checkout. Prefer focused queries over reading the entire report:

```bash
graphify query "How does collection data flow to binder suggestions?"
graphify path "App.tsx" "suggestions.ts"
graphify explain "createLocalStorage"
```

Useful starting nodes from the current graph include `App()`, `Card`, `collection.ts`, `suggestions.ts`, `createLocalStorage()`, `filterCards()`, and `suggestBinderOrder()`. The graph also connects the current source to the durable OpenSpec capabilities and the OpenSpec workflow integrations.

### Use the source tree when the graph is insufficient

Graphify is a navigation aid, not a replacement for reading the authoritative file. Read the implementation and its tests before editing. If a task changes a requirement, inspect the current spec and any active change artifacts; do not use archived planning artifacts as current requirements.

## Graphify artifacts

The following outputs are versioned and shared:

- [`graph.json`](../graphify-out/graph.json) - machine-readable graph used by Graphify queries.
- [`GRAPH_REPORT.md`](../graphify-out/GRAPH_REPORT.md) - human-readable report, communities, hubs, gaps, and suggested questions.
- [`graph.html`](../graphify-out/graph.html) - interactive visualization.

The following are intentionally ignored because they are machine-local regeneration state:

- `graphify-out/cache/`
- `graphify-out/manifest.json`
- `graphify-out/cost.json`
- `graphify-out/.graphify_chunk_*.json`
- `graphify-out/.graphify_labels.json`
- `graphify-out/.graphify_python`

Refresh the graph after meaningful structural changes or when the current graph no longer matches the source tree:

```bash
graphify update .
```

Review the generated report and query the refreshed graph before committing. Do not hand-merge generated graph files; regenerate them from the branch that contains the desired source state. The tracked/ignored split is defined by [`.gitignore`](../.gitignore) and [`.gitattributes`](../.gitattributes).

## Configuration and workflow references

- [`package.json`](../package.json) defines scripts and dependencies.
- [`tsconfig.json`](../tsconfig.json) defines TypeScript compiler checks.
- [`vite.config.ts`](../vite.config.ts) defines the Vite build configuration.
- [`openspec/config.yaml`](../openspec/config.yaml) selects the spec-driven workflow.
- [`openspec/changes/`](../openspec/changes/) contains active and archived planning work.
- [`.github/`](../.github/) contains the Copilot prompts and skills; equivalent integrations live in [`.claude/`](../.claude/) and [`.opencode/`](../.opencode/).
