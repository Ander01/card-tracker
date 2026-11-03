# Spec Delta

## ADDED Requirements

### Requirement: Add reviewed catalog cards through shared intake

The application SHALL allow collectors to add a reviewed English physical catalog card with positive whole-number quantity and optional personal notes through the existing validated Unsorted intake. Catalog identity SHALL include provider, language, and exact card identifier separately from local entry and copy identifiers. Catalog descriptive fields SHALL retain their provider meaning; choosing manual entry SHALL remove the catalog association rather than silently attaching it to edited identity fields. Cancelling search or review SHALL NOT alter the collection. Existing manual and reviewed-camera intake SHALL remain available without automated recognition.

#### Scenario: Collector saves three copies
- **WHEN** the collector confirms a selected catalog card with quantity three
- **THEN** exactly three individually identified copies arrive in Unsorted with unknown manual values and the selected catalog reference

#### Scenario: Collector abandons selection
- **WHEN** the collector cancels catalog review
- **THEN** no entries, copies, values, or locations change

#### Scenario: Collector submits invalid quantity
- **WHEN** catalog review is submitted with zero, a negative number, or a fractional quantity
- **THEN** an explicit validation error appears and no copies are created

#### Scenario: Collector uses manual fallback
- **WHEN** the catalog is unavailable and the collector saves a valid manual entry
- **THEN** normal local intake succeeds without a fabricated catalog reference

### Requirement: Represent catalog metadata accurately

The application SHALL retain supplied catalog rarity labels without coercing them into the original five manual rarity choices. It SHALL preserve exact set identifiers, set names, collector numbers, and available variants separately from card category and elemental typing. Unknown rarity SHALL be represented distinctly from a supplied label such as None. Owned rarity filters SHALL support saved rarity labels. Pokemon generation SHALL be derived only from explicit supported Pokédex identifiers using a documented mapping; absent or unsupported identifiers SHALL NOT receive a guessed generation.

#### Scenario: Collector owns an illustration rare
- **WHEN** a catalog card with rarity Illustration rare is saved and reloaded
- **THEN** that exact rarity remains visible and can be used to filter its owned copies

#### Scenario: Card lacks generation evidence
- **WHEN** a card has no supported Pokédex identifiers
- **THEN** its generation remains unknown even if its set or name appears to suggest one

#### Scenario: Card has multiple species
- **WHEN** the supplied main Pokédex identifiers map to more than one generation
- **THEN** its saved generation metadata contains each supported generation without duplicates

### Requirement: Persist catalog snapshots without losing existing ownership

The application SHALL persist catalog references and validated metadata snapshots locally, including available artwork references and variant descriptions, without requiring the API to load an owned collection. Loading existing valid quantity-based or physical-copy collections SHALL preserve all existing metadata, identities, locations, manual values, and container configuration, without automatically matching manual cards by name. Migration SHALL retain the recoverable source before replacing its saved format, report backup or persistence failures, and never present failed migration as a successful empty collection. Temporary camera images and image binaries SHALL NOT be persisted as collection metadata. Market prices SHALL NOT populate or replace manual copy values.

#### Scenario: Collector reloads without network
- **WHEN** a saved catalog-backed collection is opened while the API is unavailable
- **THEN** its saved descriptive metadata, copies, locations, and manual values remain usable without requiring artwork to be available offline

#### Scenario: Existing physical collection upgrades
- **WHEN** an existing valid physical-copy collection is loaded by the updated app
- **THEN** entry IDs, copy IDs, counts, metadata, notes, manual values, categories, binder configuration, and exact pocket placements remain unchanged

#### Scenario: Existing legacy quantities upgrade
- **WHEN** a valid quantity-based collection is loaded
- **THEN** its metadata is retained and its quantities are expanded exactly once into stable copies in Unsorted with unknown values, retaining the existing legacy-backup guarantees

#### Scenario: Upgrade cannot be saved safely
- **WHEN** backing up or persisting an upgraded collection fails
- **THEN** the original stored source is not overwritten and the application reports a blocking recovery error

#### Scenario: Catalog prices are present
- **WHEN** catalog information includes a market price
- **THEN** intake leaves each new copy's manual value Unknown and existing manually entered values remain unchanged

### Requirement: Display artwork for owned cards

The application SHALL show available catalog artwork in All cards, bulk sections, and occupied binder pockets while retaining names, exact card identity, selection, and copy-scoped actions. Manual entries and cards without artwork SHALL remain usable. Rendering images SHALL NOT change ownership, counts, values, filtering, or placement.

#### Scenario: Duplicates have different locations
- **WHEN** one catalog-backed copy is in a binder and another is in bulk
- **THEN** both display the shared card artwork while retaining their separate copy identities, locations, and values

#### Scenario: Manual entry has no artwork
- **WHEN** a manual entry is displayed
- **THEN** its textual identity and copy actions remain usable without a broken-image element
