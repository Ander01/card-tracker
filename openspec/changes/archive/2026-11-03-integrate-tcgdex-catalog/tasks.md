# Tasks

## 1. Accurate catalog metadata

- [x] 1.1 Define typed catalog references and normalized snapshots separately from local entry/copy IDs; support exact string collector numbers, set IDs, optional rarity labels, artwork references, illustrator, dex IDs, and legacy/detailed available variants. Verify domain tests cover leading zeros, lettered numbers, missing metadata, and rarity versus finish.
- [x] 1.2 Implement explicit supported main-dex-ID generation mapping and dynamic owned rarity filtering without changing copy semantics; verify tests cover multiple generations, unsupported IDs, unknown rarity versus None, Illustration rare, existing manual rarities, and filter immutability.
- [x] 1.3 Update shared manual fields and relevant projections for the revised metadata types without introducing scanner recognition; verify manual/scanner validation and suggestion tests and document the catalog-versus-copy boundary and generation mapping in the existing architecture guide.

## 2. Durable storage and migration

- [x] 2.1 Implement version 3 validation and snapshot round trips, allowing validated TCGdex URL references but rejecting camera images, image binaries, malformed snapshots, and invalid ownership references; verify targeted storage tests preserve every supported snapshot field.
- [x] 2.2 Implement exact-source-backup-first v2-to-v3 and legacy-array-to-v3 migration, preserving existing legacy-backup guarantees; verify tests cover IDs, quantities, metadata, notes, values, category/binder configuration, pocket placements, reload idempotency, backup conflicts, and failed backup/write operations.
- [x] 2.3 Preserve save-before-publish behavior and network-independent owned collection loading; verify integration tests retain previous state on persistence errors and load saved catalog cards with fetch unavailable. Update existing architecture documentation with v3 backup and rollback guidance.

## 3. TCGdex client and physical catalog search

- [x] 3.1 Implement a validated English REST adapter for sets, series, paginated card summaries, and full card details using fetch, cancellation, and session-level index/detail caching; verify mocked tests cover valid data, missing images, legacy/detailed variants, malformed responses, HTTP errors, aborted requests, and omission of pricing.
- [x] 3.2 Implement physical set membership excluding tcgp independently of image URLs, with exact longest-set-prefix matching and set-scoped queries; verify tests include hyphenated IDs, ambiguous prefixes, digital cards without images, and unresolved membership failures.
- [x] 3.3 Implement constant-size provider pagination that retains cursors across filtered pages and distinguishes exhaustion from all-digital pages; verify mocked tests cover mixed pages, consecutive digital-only pages, a final short page, and an empty page after a full last page.
- [x] 3.4 Document the API and asset hosts, request privacy, catalog availability limitations, and TCGdex attribution in existing user/architecture documentation; verify links and examples match the implemented client.

## 4. Search, review, and shared intake

- [x] 4.1 Add accessible catalog/manual intake choice, debounced name search, physical set selection, pagination, and loading/empty/error/retry states; verify UI tests cover keyboard use, request cancellation, stale responses, retry, and preservation of the collection during browsing.
- [x] 4.2 Add full-card review with read-only catalog identity and metadata, available variant descriptions, editable quantity/notes, and explicit manual fallback that detaches catalog identity; verify tests prevent submission before details resolve and distinguish unknown fields from defaults.
- [x] 4.3 Wire confirmed catalog intake through shared validation and save-before-publish Unsorted intake; verify UI tests cover three copies, invalid quantity, cancellation, save failure, local/catalog ID independence, and reloading the saved snapshot without API access.
- [x] 4.4 Keep manual intake and reviewed-camera workflows available with recognition and centering still unavailable; verify existing scanner tests and manual fallback tests, and update user guidance for selecting exact cards and switching to manual entry.

## 5. Artwork in owned views

- [x] 5.1 Add shared artwork rendering using provider base URLs, low.webp thumbnails, descriptive alt text, reserved aspect ratio, lazy loading, and explicit missing/load-error states; verify component tests include source changes after image failure and valid intake without artwork.
- [x] 5.2 Render artwork and exact identity in All cards, bulk, and assigned binder pockets without replacing copy controls or empty-pocket states; verify tests cover duplicate copies in different locations, manual entries, missing images in occupied pockets, page navigation during image loading, and unchanged moves/values/counts.
- [x] 5.3 Verify keyboard selection and copy details remain accessible with images enabled or failed using targeted accessibility tests and browser inspection; document that saved metadata works offline but artwork availability is not guaranteed.

## 6. End-to-end verification

- [x] 6.1 Run the combined catalog/domain/storage/UI test selectors, then npm run typecheck and npm run build; verify no failures introduced by the revised data model or catalog wiring.
  - Verified 2026-11-03: `npm test` passed 77 tests across 13 files; `npm run typecheck` and `npm run build` passed. Existing jsdom canvas capability warnings remain unchanged.
- [x] 6.2 Perform a browser smoke check of search, exact-card review, adding copies, binder placement, and reload; simulate API/image failure and verify manual fallback, saved metadata access, and unchanged ownership. Record verification results in this task checklist without depending on live requests for automated tests.
  - Verified live English Base Set Charizard search/details/artwork, three-copy intake, explicit page 2/pocket 5 placement, and a EUR 12.34 value on another copy. Reload with API and artwork requests blocked retained all three copies, placement, and value; the occupied pocket showed artwork unavailable and manual fallback remained usable. Desktop and 390px mobile inspection showed usable review controls and no horizontal overflow. Automated tests use mocked responses.
  - The interface detector reported only the incumbent Inter font warning; the existing visual system was deliberately preserved.
