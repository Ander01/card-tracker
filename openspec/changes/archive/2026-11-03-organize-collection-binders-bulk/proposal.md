# Proposal

## Why

The collection currently records quantities in a flat list, so it cannot represent where individual copies live or recreate a collector's binder arrangement. Collectors need physical-copy locations in customizable binders and a bulk box with divider categories, while preserving ownership totals and existing local data.

## What Changes

- Track individual physical copies with exactly one location each; split duplicates between bulk sections and binder pockets without changing total ownership.
- Send every new copy from manual entry or reviewed scanning into an automatic, temporary bulk section named Unsorted. Show this section only while it contains copies.
- Add flat, user-managed bulk categories representing divider markers, not nested folders or automatic filter results.
- Add named binders with cover color, page count, and a regular pocket grid per page; preserve empty pockets and explicit copy positions.
- Support page-turn browsing, accessible page controls, and explicit movement between bulk and binder pockets. Full binders require explicit expansion or a freed pocket.
- Extend metadata and filtering with elemental typing, Pokemon generation, and independently editable per-copy EUR values. Missing values remain Unknown.
- Persist organization locally and migrate existing quantities into Unsorted without losing card metadata.
- Preserve existing read-only binder suggestions and scanner behavior; suggestions do not place or move copies.
- Defer structured condition/grading fields, live prices, currency conversion, nested categories, automatic sorting, and automated placement.

## Capabilities

### New Capabilities

- `bulk-box-organization`: Flat divider categories, automatic Unsorted lifecycle, and copy-preserving bulk movement.
- `binder-management`: Binder customization, fixed-capacity page/pocket placement, safe configuration changes, and page-turn browsing.

### Modified Capabilities

- `collection-management`: Individual copies and values, richer metadata/filtering, location-aware browsing, default intake, and compatible local persistence.

## Impact

- Replace the quantity-only storage representation in `src/domain/collection.ts` with a versioned collection state and explicit copy locations, retaining the existing localStorage key.
- Update `src/App.tsx`, collection components, and `src/styles.css` for the collection overview, bulk dividers, copy selection, and binder browser while retaining the incumbent visual system.
- Share collection intake between manual submission and `ScannerView` completion; update scanner metadata entry/types where needed without persisting camera images.
- Adapt the input to `src/domain/suggestions.ts` from the new model without changing its theme behavior or adding placement side effects.
- Extend domain, storage, app, scanner, and accessibility tests; update README and the architecture guide during implementation.
- No backend, account, pricing provider, or new runtime dependency is planned.
