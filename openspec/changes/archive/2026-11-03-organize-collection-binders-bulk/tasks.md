# Tasks

## 1. Physical-copy domain and metadata

- [x] 1.1 Define the v2 collection envelope, shared card entries, stable physical copies, discriminated locations, categories, and binders in the collection domain; derive ownership counts from copies and verify tests distinguish one entry from four owned copies.
- [x] 1.2 Implement shared manual/scanner intake validation and copy creation, preserving existing card kind and adding optional elemental types and Pokemon generations; verify missing names, invalid quantities, multi-type metadata, unknown metadata, and quantity-four creation with four unique Unsorted copies in domain tests.
- [x] 1.3 Add exact nullable EUR-cent parsing, formatting, and per-copy edits; verify Unknown versus zero, independent duplicate values, clearing, negatives, nonfinite amounts, overprecision, and safe-integer bounds in focused domain tests.
- [x] 1.4 Document the new entry/copy ownership boundary and derived counts in `docs/architecture.md`; verify the documented fields and invariants agree with domain types and tests.

## 2. Organization transitions and scoped filtering

- [x] 2.1 Implement flat category creation, rename, reserved/unique-name validation, confirmed-delete transitions returning copies to Unsorted, and derived Unsorted visibility; verify empty categories persist, filtered-out copies do not remove Unsorted, and the final move removes it without deleting ownership.
- [x] 2.2 Implement binder creation and appearance/configuration updates with positive whole-number dimensions, validated colors, safe capacity arithmetic, explicit page expansion, empty trailing-page removal, and empty-binder-only grid changes; verify 20 x 9 equals 180 pockets and rejected edits preserve occupied positions.
- [x] 2.3 Implement atomic copy movement between bulk and explicit binder pockets plus binder-deletion transitions; verify split duplicates, retained identity/value, unchanged totals, empty gaps, full-binder rejection, occupied/out-of-range pockets, duplicate destination assignments, missing sources/destinations, and all-or-nothing batch errors.
- [x] 2.4 Implement copy-level search/filtering for All cards, whole bulk, and selected sections using name, set, kind, rarity, elemental typing, generation, and inclusive EUR bounds; verify AND semantics, type/generation membership, unknown handling, equal boundary values, inverted/invalid ranges, scope isolation, and source-state immutability.
- [x] 2.5 Extend `docs/architecture.md` with organization operation ownership and filtering scope; verify it identifies the implemented domain module and explains why filtering does not change location.

## 3. Local persistence and legacy migration

- [x] 3.1 Replace unchecked array loading with validated versioned state loading at the existing `card-tracker.collection` key; verify valid v2 round trips and explicit failures for malformed JSON, unsupported versions, duplicate ids, dangling references, invalid money/dimensions, and conflicting pockets in storage tests.
- [x] 3.2 Implement legacy-array migration with a retained raw backup before overwrite; verify metadata/id preservation, exact quantity-to-copy expansion into Unsorted, null values, unchanged ids after reload, empty legacy collections, and no repeated expansion.
- [x] 3.3 Add explicit read/write/migration error results and save-before-publish application commits; verify blocked storage access, backup failure, snapshot failure, and quota errors preserve previous state/source data and never emit success or silently initialize an empty collection.
- [x] 3.4 Document the storage version, backup behavior, recovery limitations, and nonautomatic rollback in `docs/architecture.md`; verify the documented keys and migration sequence match storage tests.

## 4. Collection navigation, intake, values, and suggestion compatibility

- [x] 4.1 Wire the shared v2 state and persisted transitions into `src/App.tsx`, with clear load/recovery/save errors and All cards/Bulk/binder navigation while retaining the landing and scanner paths; verify navigation and failure-state behavior in app tests.
- [x] 4.2 Update manual and scanner-reviewed metadata entry/types to use shared intake with elemental typing and generation; verify both paths add the exact quantity into Unsorted with unknown values, invalid input adds nothing, scanner cancellation preserves state, and camera images remain ephemeral using app/scanner tests.
- [x] 4.3 Render explicit copy counts, copy identity/location details, scoped filters, and per-copy EUR editors using existing visual styles; verify the EUR 2.00/EUR 20.00 duplicate example, Unknown/zero display, value persistence through movement, clear-value behavior, and visible filter/edit errors in component tests.
- [x] 4.4 Adapt existing binder suggestions using derived entry quantities and label preview counts clearly without implying saved placement; verify existing themes, ordering, unclassified/no-match behavior, and an unchanged organization/value snapshot after generation in suggestion and app tests.
- [x] 4.5 Update README supported fields and collection workflow documentation for copy tracking, typing, generation, and manual EUR values; verify structured grading/live pricing are not described as implemented.

## 5. Bulk divider interface and movement

- [x] 5.1 Build the bulk box and flat category create/rename/delete controls with confirmation/cancellation and a read-only system Unsorted marker; verify reserved-name errors, empty-category persistence, deletion-to-Unsorted, and automatic appearance/disappearance/reappearance in UI tests.
- [x] 5.2 Add specific-copy selection and an accessible destination interaction supporting bulk destinations and explicit binder pocket assignments, including atomic multi-copy submissions; verify four-copy splitting, stale/invalid destination errors, cancellation, retained values, and ownership totals in UI tests.
- [x] 5.3 Handle focus and status updates when the last Unsorted copy moves or a selected category is deleted; verify keyboard operation and automated accessibility checks on empty, populated, filtered-no-match, and confirmation/error states.
- [x] 5.4 Document divider categories, nonmutating filters, and the temporary Unsorted lifecycle in README; verify examples match the implemented intake and movement flow.

## 6. Binder customization and page browser

- [x] 6.1 Build binder listing and create/edit/delete controls using the proposed 20-page 3 x 3 defaults, cover color, explicit capacity, safe page resizing, and deletion confirmation; verify valid customization, blocked destructive layout edits, full capacity messaging, cancellation, and deletion returning copies to Unsorted in UI tests.
- [x] 6.2 Render only the selected logical binder page with fixed empty/occupied pockets, individual copy details, and movement into/out of exact coordinates; verify middle-pocket removal leaves a gap, other pages remain unchanged, and location links open the correct page/pocket.
- [x] 6.3 Add previous/next and direct page controls with visible numbering and a reduced-motion-aware page-turn transition; verify first/last boundaries, one-page binders, direct navigation, keyboard focus, and no placement changes in component tests.
- [x] 6.4 Extend accessibility checks to binder creation, page browsing, move controls, and validation states; inspect the rendered UI at 375px and 1280px widths with long names and a populated 3 x 3 page, verifying usable controls, readable labels, no clipped actions, and reduced-motion behavior.
- [x] 6.5 Document binder capacity, explicit expansion, safe layout edits, keyboard page navigation, and the distinction between previews and saved binders in README; verify the examples against the implemented browser.

## 7. Cross-feature acceptance checks

- [x] 7.1 Add an integrated migration-to-organization reload test: migrate four copies, assign differing values, split them between a divider and binder, sort the remainder until Unsorted disappears, reload, and add another copy; verify stable ids, exact positions/values/totals, and Unsorted reappearing only for the new copy.
- [x] 7.2 Exercise a 1,000-copy collection with a 20-page 3 x 3 binder; verify exact counts/filter results, stable identities through moves/reload, and only the active page's nine pockets rendered rather than all 180.
- [x] 7.3 Run the combined targeted collection/organization/storage/suggestion/app/scanner/accessibility tests, then `npm run typecheck` and `npm run build`; verify all pass and existing scanner cleanup, offline/local collection use, and read-only suggestion behavior remain intact.
- [x] 7.4 Validate

## Acceptance evidence

- Physical-copy intake, metadata, independent/cleared/zero/unknown EUR values (including safe-integer precision), ownership totals, divider names/lifecycle, atomic moves, occupied/invalid destinations, safe configuration edits, and scoped filters: `src/domain/organization.test.ts`.
- Legacy quantity expansion, preserved metadata/ids/raw backup, empty/malformed/unsupported data, invalid references/values/dimensions/pocket conflicts, backup/snapshot/read/write failures, migration-organize-reload-intake, and 1,000-copy identity/count stability: `src/domain/storage.test.ts`.
- Category create/rename/delete/cancel, Unsorted disappearance/reappearance, copy/batch selection and moves, filters/errors, independent value editing/clearing, binder creation/customization/full capacity/deletion/cancel, empty pockets, page boundaries/direct navigation/location links, recovery/save errors, scanner save/cancel, suggestion immutability, keyboard/focus and active-page rendering: `src/CollectionView.test.tsx`.
- Automated accessibility checks cover empty collection, populated/filtered bulk, deletion confirmation, binder configuration/error states, and binder page browsing in `src/CollectionView.test.tsx`; existing landing/scanner checks remain in `src/accessibility.test.tsx`.
- Browser inspection at 1280px and 375px verified a populated 3 x 3 binder page with a long card/binder name, nine rendered pockets, usable wrapped controls, no settled horizontal overflow, and `animation-name: none` under reduced motion. Binder details collapse to keep the narrow page readable; copy details/value remain available through native disclosure controls.
- Automated suite, TypeScript, production build, strict OpenSpec validation, and whitespace checks passed. The UI detector reported only the incumbent Inter font warning; typography was intentionally preserved rather than rebranding. this change with `openspec validate organize-collection-binders-bulk --strict`; verify it passes and each scenario has corresponding automated or explicitly recorded manual acceptance evidence before marking implementation complete.
