# Design

## Context

See [proposal.md](proposal.md) for motivation. The app is a browser-only React application. Collection version 2 separates CardEntry metadata from OwnedCopy identity, value, and location. The storage reader reconstructs supported fields, rejects image payload fields, and validates all references before exposing an editable collection. Existing camera captures are ephemeral and recognition is explicitly unavailable.

TCGdex v2 exposes lightweight card search results, full card details, sets, and series. List results do not contain complete metadata. Images are optional base URLs with quality/format suffixes. Live checks confirmed English browser access, missing images, a broader rarity vocabulary, and both legacy and detailed variant representations. TCG Pocket shares the API and has series identifier tcgp.

## Goals / Non-Goals

**Goals:** Keep provider parsing outside the ownership domain, save enough validated metadata for network-independent collection browsing, preserve ownership invariants, and explicitly distinguish unavailable data from errors.

**Non-Goals:** A local mirror of the database, provider synchronization, automatic manual-card matching, recognition, grading, market-price features, selected per-copy printing variants, and persistent offline image caching.

## Decisions

### 1. Use a typed REST adapter rather than importing database records

Use native fetch behind a catalog module with explicit unknown-response validation and typed normalized outputs. Support abort signals and HTTP error handling. Fetch English sets and series for navigation and physical membership, paginated name queries for results, and full details only for selection. Memoize session-level set membership and repeated detail lookups without making a successful network request a prerequisite for loading owned data.

The official SDK is a valid alternative, but direct REST avoids a runtime dependency and makes cancellation, validation, and error semantics explicit for this small integration. Importing source records or self-hosting would add unnecessary build and operational scope.

### 2. Establish physical set membership independently of images

Use series membership to build a set-ID index excluding tcgp. Resolve card summaries against known set IDs and their exact ID prefix plus delimiter, choosing the longest matching set ID rather than splitting on an arbitrary hyphen. Set-scoped searches already know the set. Reject unresolved membership explicitly rather than guessing from rarity or an image path.

Global provider pages can contain digital cards. Filter each bounded provider page through the membership index, retain its provider page cursor, and advance across all-digital pages until physical results or provider exhaustion. Do not equate an empty filtered page with end of results. Keep provider page size constant; a short raw page signals exhaustion, while a full page permits a next-page request that can legitimately return no further results. Do not invent total counts. Test mixed and all-digital pages. Set-scoped results retain normal pagination.

### 3. Extend entries, not owned copies, with a catalog snapshot

Keep local entry IDs and all copy IDs independent from the provider. Add optional catalog metadata containing provider tcgdex, language en, cardId, setId, collectorNumber, and a validated snapshot. Keep name, set name, category, types, and rarity available to existing collection projections. Snapshot descriptive fields include imageBaseUrl, supported set presentation fields, illustrator, dex IDs, and available variants; omit absent fields. Do not persist whole unvalidated provider responses or pricing.

Keep collector numbers as strings. Store rarity as an optional nonempty string, preserving exact provider labels and existing manual choices; absence is Unknown, distinct from the label None. Build owned rarity filters from saved labels. Category and elemental types remain separate validated concepts. Map supported main dex IDs to generation using explicit species ranges, deduplicating generations; do not derive generation from set release date, names, notes, or artwork cameo species.

Normalize legacy variant flags and detailed variants into optional typed metadata that distinguishes flags from detailed available-printing descriptions. Preserve recognized type, subtype, size, stamps, and variant identifier when supplied. Unsupported future fields are not copied as arbitrary blobs. Available variants describe catalog possibilities, never ownership of a selected finish.

An unstructured provider object was rejected because it couples persistence to upstream response changes and can accidentally store prices or irrelevant data.

### 4. Review catalog identity without silently editing it

Expose catalog search alongside the existing manual intake. Debounce name search, abort superseded requests, and guard against stale responses. Show loading, empty, retryable error, and selected-card detail states explicitly. Do not enable catalog submission before detail validation and physical-membership confirmation.

Catalog-derived identity and descriptive fields are read-only during review; quantity and personal notes remain editable. An explicit switch to manual entry removes the catalog association before descriptive editing. Saving uses shared validation and Unsorted intake. Retain the current behavior of creating a local entry per submission rather than introducing automatic merging. Cancel leaves ownership untouched.

Leave the scanner workflow and recognition status unchanged; catalog search is not image recognition.

### 5. Add a versioned, backup-first storage transition

Introduce version 3 for the extended snapshot and unknown/broader rarity representation. Validate snapshots, HTTPS TCGdex artwork references, metadata types, and all existing ownership constraints before storage or publication.

Read v2 through its existing strict semantics, retain its exact raw payload under a dedicated v2 backup key, and then persist the validated v3 envelope before publishing it. Fail if an existing backup differs instead of overwriting it. Preserve all IDs, values, locations, metadata, and configuration. Route legacy quantity-array migration directly to v3 while retaining the existing exact legacy-backup guarantee and one-time expansion.

Allow only artwork URL references in the new snapshot; continue rejecting camera data URLs and image binaries. No API calls occur during collection loading. No automatic snapshot refresh is introduced.

An additive v2 extension was rejected because old readers reconstruct fields and could silently discard catalog data or reject new rarities.

### 6. Share artwork rendering across owned views

Use one accessible image component for search/review and owned views, including the existing shared collection-copy rendering used in bulk and binder pockets. Construct low.webp for thumbnails and high.webp only where a larger preview is shown. Lazy-load list and pocket images with fixed aspect ratios to reduce layout shift. Reset image-error state when the source changes.

Keep identity text and selection controls available regardless of image success. Render an explicit unavailable state for absent or failed artwork. Do not replace the application's decorative home-page art as part of this change.

## Risks / Trade-offs

- Incomplete catalog/images -> retain manual entry, nullable metadata, and explicit artwork-unavailable states.
- API outages, malformed data, and stale responses -> typed boundary validation, cancellation, retry, and local saved snapshots.
- Physical membership lookup adds requests -> cache small set/series indexes for the session; never use image availability as a shortcut.
- Open-ended rarity labels -> preserve provider strings and derive owned filter options rather than maintaining a lossy closed enum.
- Shared catalog artwork does not identify a physical finish -> present variants as available metadata only.
- Local storage quota -> save selected normalized snapshots and URLs, not images, prices, or a full catalog.
- Database licensing does not transfer artwork ownership -> credit TCGdex, retain applicable MIT notices where required, and document that Pokemon artwork rights remain with their owners.

## Migration Plan

1. Implement and test v3 parsing and backup-first v2/legacy transitions before wiring catalog intake.
2. Verify reload round trips for manual and catalog-backed entries, including variants and broad rarity labels.
3. Integrate network search/review and then artwork without changing copy operations.
4. Document backups and the incompatibility of old bundles with v3 data. Do not roll back an old bundle against v3 storage; preserve current data and prefer a corrected v3-compatible reader. Restoring a pre-upgrade backup is manual and loses later edits.
5. Run deterministic mocked tests, typecheck, build, and browser validation. Live endpoints provide an optional smoke check, not a required test dependency.
