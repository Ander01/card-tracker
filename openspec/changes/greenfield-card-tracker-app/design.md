# Design

## Context

The repository currently contains OpenSpec configuration and no application runtime, source tree, or existing product conventions. This is therefore a greenfield client application. The first release must be useful without accounts or a backend, while keeping the collection model and UI boundaries extensible for future synchronization and richer recommendation logic.

## Goals / Non-Goals

**Goals:**

- Establish a maintainable browser application foundation for the first Card Tracker experience.
- Keep collection state local and durable across reloads.
- Separate collection management from binder suggestion logic so either can evolve independently.
- Make the first suggestion algorithm deterministic and explainable.
- Provide a responsive, accessible interface for the core workflows.

**Non-Goals:**

- User authentication, accounts, cloud synchronization, or multi-device collaboration.
- A complete Pokemon card catalog or automatic card database integration.
- Advanced optimization, machine learning, or image recognition for binder layouts.
- Final visual branding or a production deployment pipeline beyond the initial development setup.

## Decisions

### React, Vite, and TypeScript

Use React with Vite and TypeScript for the client foundation. React fits the interaction-heavy collection and filtering UI, Vite keeps the greenfield feedback loop small, and TypeScript provides a stable model boundary as card metadata and recommendation rules grow. Next.js was considered but adds server-oriented structure that is not needed for the local-first first release; Vue and Svelte remain viable alternatives but provide less alignment with the recommended ecosystem and future hiring/community surface.

### Local browser persistence behind a storage boundary

Represent cards with a typed domain model and persist the collection through a small storage boundary backed initially by browser local storage. The UI and suggestion logic must consume collection operations rather than directly depending on storage details. This keeps the first release offline-friendly and makes a later IndexedDB or API-backed implementation possible without changing user-facing requirements.

### Feature-oriented application structure

Organize code around the app shell, collection management, and binder suggestions, with shared types and UI primitives kept separate from feature behavior. Collection state should be loaded once at the application boundary and passed through explicit feature interfaces, avoiding duplicated copies that could diverge between the collection and suggestion views.

### Deterministic rule-based binder suggestions

Implement the initial suggestion behavior with explicit theme/grouping rules and stable tie-breaking. A suggestion should be reproducible for the same collection and theme, and its output should carry enough information for the UI to explain why cards were grouped or marked unclassified. This is preferable to an opaque recommendation approach until real usage reveals which themes and ordering rules collectors value.

### Client-side filtering and validation

Perform search, metadata filtering, and initial validation in the browser. Required values are validated before a card is saved; optional metadata remains optional and is represented as unavailable rather than fabricated. This matches the single-user local-first scope and avoids introducing an API contract before the domain behavior is understood.

### Repository workflow

Use `main` as the stable branch, `develop` as the integration branch, and `feature/feature01-greenfield` for the initial application work. The private GitHub repository should be created under the user's `Ander01` account, with the feature branch based on `develop`.

## Risks / Trade-offs

- [Local storage capacity and manual data entry limit the first release] -> Keep the storage boundary isolated and define a future migration path to IndexedDB or a backend.
- [Pokemon metadata entered by users may be inconsistent] -> Use controlled values where practical, normalize search comparisons, and never infer missing attributes as facts.
- [Simple theme rules may produce limited recommendations] -> Make rules explicit and deterministic, capture rationale in the result, and leave the rule interface extensible.
- [No existing UI system means visual choices may change] -> Use a small set of reusable primitives and accessible semantic controls rather than tightly coupling behavior to styling.
- [Repository setup is external to application behavior] -> Treat branch and GitHub setup as a separate delivery task and document the expected branch topology.

## Migration Plan

1. Create the private GitHub repository and establish `main` and `develop`.
2. Create `feature/feature01-greenfield` from `develop`.
3. Scaffold the React/Vite/TypeScript client and implement the local-first domain and UI.
4. Verify collection persistence, filtering, and deterministic suggestions in the browser.
5. Merge the completed feature into `develop`; promote to `main` only after the initial acceptance checks pass.

Rollback for the application is a branch-level rollback to the previous commit because this is the initial app and has no production data migration. If future releases add a persistence migration, that migration must be planned separately.
