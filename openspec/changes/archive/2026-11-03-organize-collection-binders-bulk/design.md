# Design

## Context

See [proposal.md](proposal.md) for motivation and the three [delta capabilities](specs/) for behavioral contracts. This design is warranted by the cross-cutting copy model, local-data migration, and new organization interfaces.

Currently `src/domain/collection.ts` combines a `Card` entry with `quantity`, metadata filters, and a `CardStorage` boundary storing a bare array under `card-tracker.collection`. `src/App.tsx` separately appends cards from the manual form and scanner completion. `src/domain/suggestions.ts` consumes those entries and produces an alphabetical, read-only themed list. Scanner metadata uses `NewCard`; captured images are ephemeral. Tests cover quantity validation, simple filtering, storage reload, suggestions, intake/navigation, and basic accessibility.

The existing collection specification has no locations or binders; the binder-order specification defines suggestions, not actual storage. This change extends collection behavior and adds separate bulk and binder capabilities rather than redefining suggestions. Existing visual styles remain authoritative; this is an Operate-mode extension, not a visual rebrand.

## Goals / Non-Goals

**Goals:**

- Make copy identity and location authoritative so quantity cannot drift during organization.
- Keep organization operations pure and validated, with a single local persistence boundary for an entire consistent state.
- Preserve existing metadata and scanner/suggestion semantics while separating owned copies from shared card descriptions.
- Make fixed positions, unknown metadata, capacity boundaries, and persistence failures visible.

**Non-Goals:**

- No card catalog, card-image source, automatic recognition, market-price service, currency conversion, grading model, or remote synchronization.
- No nested bulk hierarchy, automatic assignment based on filters, automatic pocket packing, occupied-pocket swapping, or suggestion-to-binder application.
- No individual-card deletion or quantity-reduction workflow; this change adds placement and valuation, not disposal.
- No regeneration of Graphify outputs, design-system files, or unrelated workflow configuration.

## Decisions

### 1. Separate shared card entries from owned copies

Use a versioned collection envelope with shared entries, copy records, bulk categories, and binders:

```text
CollectionState v2
|
+-- entries: descriptive metadata, stable entry id
|   +-- name, set, kind, rarity, notes
|   +-- elementalTypes[], generations[]
|
+-- copies: stable copy id, entry id, valueCents, location
|   +-- Unsorted
|   +-- Bulk category id
|   +-- Binder id + page index + pocket index
|
+-- categories: stable id, name
+-- binders: stable id, name, color, pageCount, rows, columns
+-- currency: EUR
```

Location is a discriminated union, not three optional references. A copy record is the sole source of placement; do not also store copy-id arrays on sections or pockets. Pocket occupancy and all counts are derived. Shared metadata is stored once per entry; per-copy identity, value, and location remain independent. Adding an entry with quantity N creates N copies and does not automatically merge entries with matching names.

Preserve the current `type` field as card kind for compatibility and display it as "Card kind." Add separate optional elemental-type and generation selections; do not reinterpret existing Pokemon/Trainer/Energy values. Generation is explicitly Pokemon generation, not set chronology. Arrays allow multi-type and multi-generation card descriptions without forcing a guessed classification; empty arrays display Unknown. Trainer/Energy cards can leave generation unknown. No inference from names, notes, or sets.

Alternative: placing a location on a quantity-bearing entry cannot split duplicates. Independent copies duplicating every metadata field would permit unnecessary drift. Redundant occupancy arrays would require maintaining two competing location indexes.

### 2. Derive Unsorted and keep divider membership explicit

Unsorted is a distinguished copy location, not a persisted category entity. Its UI section exists only when any copy has that location, independently of active filters. It has no create, rename, or delete action.

User categories are a flat list of stable ids and trimmed names. Reject empty, case-insensitive duplicate, and reserved Unsorted names. Keep empty user categories visible until explicitly deleted. Rename changes only the label. Confirmed category or binder deletion returns its copies to Unsorted in the same state transition; cancellation does nothing.

Alternative: creating/deleting an actual Unsorted category introduces dangling references and requires special recovery code. Rule-based categories would behave like saved searches rather than physical dividers.

### 3. Centralize validated transitions and commit before announcing success

Keep domain validation and transitions in `src/domain/collection.ts` and a focused organization domain module if needed for clarity. Expose one intake operation shared by manual entry and scanner completion, plus operations for category/binder management, movement, and per-copy valuation.

Validate the entire candidate state before persistence: ids are unique; references exist; every copy has one valid location; binder coordinates are in range; no pocket has multiple occupants; values and dimensions are supported safe integers. Batch movement includes explicit destination assignments; resolve all sources and destinations before updating any copy. Do not silently skip missing copies, fill another pocket, or partially save a batch.

At the application boundary, build the next state, save it as one snapshot, then publish it to React state and show success. Convert expected validation/storage errors into explicit actionable UI messages; do not broadly catch errors and return empty data. Failed commands leave the prior committed state active and preserve editable inputs for retry.

Alternatives: state-first updates can falsely announce success or require rollback. Separate saves for copy and destination changes can persist contradictory ownership.

### 4. Use fixed regular-grid binders with conservative resizing

Pages use a uniform rows-by-columns grid. Proposed form defaults are 20 pages and 3 x 3 pockets, with a neutral cover color; these are convenience defaults, not automatic growth or user limits. Use positive whole-number dimensions and safe-integer capacity/coordinate arithmetic. Validate color as a supported color value rather than arbitrary style content.

Page and pocket indexes are zero-based internally and one-based in visible labels. Render the current logical page only, rather than allocating all empty pockets across the entire binder. Existing assignments always remain at their saved coordinates.

Allow explicit page addition. Allow trailing page removal only when all removed pages are empty. Allow grid changes only on an empty binder. This conservative policy avoids silently remapping filled pockets when columns or page capacity change. Renaming and recoloring are always safe. Reject occupied-pocket placement rather than implementing a swap.

Alternative: auto-growing binders contradict confirmed fixed capacity. Automatic reflow or packing changes the physical arrangement without the user moving cards. Multiple page-specific layouts add complexity not needed for this change.

### 5. Preserve binder context with accessible page turning

Collection navigation exposes All cards, Bulk box, and the binder list while retaining manual-add and scanner entry points. Bulk shows section markers and copies; binder cards show name, color, occupancy, and capacity. Selecting a binder opens its page browser.

The binder browser shows explicit empty pockets, page number/total, previous/next buttons, and direct page selection. Page changes use a restrained page-turn transition, but controls remain functional with reduced motion and keyboard input. Do not make swiping, dragging, color, or animation the sole means of understanding or operating the binder.

Provide a labeled, non-drag move interaction: choose specific copies, then a bulk section or explicit available binder page/pocket assignments. Preserve usable focus after movement, page changes, and removal of the last Unsorted copy. Announce move success and capacity failures through status/alert semantics.

All-cards search results expose copy locations and can open a binder at the exact page/pocket. Filtering never compacts a physical page; preserve its slots rather than rendering filtered cards as a new layout. No persistent current-page preference is required; opening normally starts at page one, while a location link supplies its target page.

Reuse the existing typography, controls, panels, and CSS tokens. No new animation or drag-and-drop dependency is needed. Verify narrow-screen page grids, long names, empty states, keyboard navigation, and reduced motion during implementation.

### 6. Keep EUR value exact, optional, and per copy

The user selected EUR for the collection. Store value as nullable integer euro cents, with null meaning Unknown and zero meaning an explicit EUR 0.00. Parse user monetary input without rounding unsupported precision and reject negatives, nonfinite amounts, or values outside safe-integer cents. Use locale-aware EUR formatting for display.

Create new copies with unknown values, then let users edit each copy independently. Condition and grading may motivate the user-entered amount but are not captured as structured fields, and the application never estimates a value.

Value filters are inclusive min/max cents; either bound can be omitted. Exclude unknown values when a bound is active, but include them with no value filter. Reject invalid or inverted ranges with visible errors. Combine text, set, kind, rarity, elemental typing, generation, and value filters within the chosen All cards, whole bulk, or individual section scope.

Alternative: floating-point amounts introduce avoidable comparisons/rounding issues. Entry-level values cannot distinguish copies. Live pricing or multiple currencies requires a separate product decision and provider design.

### 7. Migrate local data once, preserving recoverability

Retain `card-tracker.collection`, replacing the bare legacy array with the v2 envelope. Distinguish missing data (a genuinely empty collection) from parse errors, unsupported versions, or invalid persisted invariants (a blocking recovery state). Parse persisted data as unknown and validate shape and references before use; do not keep the current unchecked `Card[]` assertion.

For a valid legacy array, preserve entry ids and all existing metadata and create exactly `quantity` copies in Unsorted. Initialize new metadata to Unknown and copy values to null. Persist generated copy ids; subsequent v2 reloads do not recreate or duplicate copies.

Before overwriting legacy data, save its exact raw payload under a dedicated legacy backup key. If the backup or migrated snapshot cannot be written, keep the source untouched, report migration failure, and do not enter a success-shaped empty state. A successful migration writes one complete v2 snapshot. Preserve the backup for recovery; do not overwrite it on later loads. Camera images never enter the envelope or backup unless already present in unexpected input, which must be rejected rather than adopted.

Alternatives: resetting legacy data loses ownership. Expanding quantities only in React without persisting identity changes copies on every reload. Introducing a backend or IndexedDB is unnecessary for the current local-first scope.

### 8. Adapt suggestions and scanner without adding behavior

Provide a derived card-entry/quantity projection from copies for `suggestBinderOrder()`, preserving the existing alphabetical/theme logic and unclassified behavior. A suggestion continues to list card entries, not one row per duplicate; label counts clearly as entries rather than implying physical copies have been placed. Do not use the actual binder pocket styling to claim those previews are saved placements.

Both intake paths call the same validated operation. Extend the scanner's reviewed metadata form/types alongside manual metadata if required by the shared draft type; preserve cancellation, camera track cleanup, unavailable analysis messaging, and ephemeral images. The scanner never selects a placement or saves values automatically.

Alternative: running suggestions directly against duplicate copies changes existing preview behavior; allowing suggestions to move copies adds unconfirmed capacity and conflict semantics.

## Risks / Trade-offs

- More records for large quantities -> derive counts/indexes per state revision and render only the active page; test a representative large fixture, not just single-copy examples.
- Stale selection or unavailable destinations -> revalidate at submission and fail the whole move without changing prior state.
- Local storage quota, blocked access, or invalid persisted records -> explicit error/retry states, one-snapshot commits, and a retained legacy backup; no silent clearing.
- Generation is not always meaningful and values may be absent -> preserve Unknown and avoid catalog inference.
- Pocket grid edits are intentionally restrictive -> explain how to move copies to bulk before changing the layout.
- Page-turn effects can obscure focus or cause motion discomfort -> keep controls primary, respect reduced motion, and test keyboard/focus behavior.
- Legacy application versions cannot read v2 -> roll out the migration with the new reader/writer together; do not treat an older bundle as a safe data rollback.

## Migration Plan

1. Implement and test v2 parsing, validation, migration, backup, and error states before routing UI mutations through the new writer.
2. Load a valid legacy snapshot read-only, build/validate the new envelope, retain its raw backup, and save the complete v2 state before showing success.
3. Use only v2 transitions thereafter. Reload fixtures must retain copy ids, quantities, values, category ids, and exact binder positions.
4. On malformed input or migration/write failure, retain stored source data and show a recovery error. Do not automatically reset storage.
5. To roll back a deployment, retain/export the current v2 snapshot before any manual restoration of the pre-migration backup. Restoring legacy data discards subsequent organization/value edits and must never happen automatically; prefer deploying a fixed v2-compatible reader.

## Proposed Defaults

The user confirmed physical-copy placement, fixed capacity, divider categories, automatic Unsorted, Pokemon generation, manual per-copy values without grading fields, and EUR. Remaining convenience and safety defaults in this plan are explicitly proposed: 20-page 3 x 3 binders, uniform grids, named flat dividers with unique names, deletion returning copies to Unsorted, and conservative resizing. They are reviewable choices, not claims about existing behavior.
