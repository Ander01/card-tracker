# Proposal

## Why

The collection currently depends on manually entered descriptions and cannot identify exact catalog cards or show their artwork. TCGdex provides the real card metadata and images needed to make collection intake and binder browsing accurate without introducing accounts or a backend.

## What Changes

- Add paginated English physical-card catalog search and exact-card selection using the hosted TCGdex v2 API.
- Review a selected card before creating owned copies through existing Unsorted intake.
- Represent catalog identity, set identifiers, collector numbers, artwork references, available printing variants, and optional descriptive information without conflating rarity with finish.
- Support provider rarities beyond the current five choices and explicitly retain unknown metadata.
- Save a local catalog snapshot so collection metadata remains usable without the API.
- Display available artwork in collection, bulk, binder pockets, and catalog review with accessible missing-image states.
- Preserve manual entry, existing collections, copy identities, locations, notes, and manual EUR values.
- Keep automated recognition, grading, market-price integration, multilingual intake, digital TCG Pocket cards, advanced per-copy variant tracking, and guaranteed offline artwork out of scope.

## Capabilities

### New Capabilities

- `card-catalog`: Search, select, normalize, and review English physical-card catalog data, including identity and artwork behavior.

### Modified Capabilities

- `collection-management`: Catalog-backed intake, accurate metadata, durable catalog snapshots, backward-compatible loading, and artwork in owned collection views.
- `binder-management`: Display catalog artwork in occupied pockets without altering explicit copy placement.

## Impact

- Runtime surfaces: `src/App.tsx`, shared card fields, collection rendering, and new catalog client/review components.
- Domain and persistence: `src/domain/collection.ts`, `src/domain/storage.ts`, metadata filters, and related tests.
- External services: read-only requests to `api.tcgdex.net` and images from `assets.tcgdex.net`; no collection or camera-image uploads.
- Documentation: architecture and user guidance for catalog availability, local snapshots, and attribution.
- No new runtime dependency is required; the design uses browser fetch behind a typed adapter.
