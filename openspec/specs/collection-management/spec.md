# collection-management Specification

## Purpose

Enables a collector to record and inspect a personal Pokemon card collection with enough metadata to find cards and prepare them for themed binder organization.

## Requirements

### Requirement: Add a card to the collection

The application SHALL allow the user to add a card with its name and optional collection metadata such as set, card kind, elemental typing, Pokemon generation, rarity, quantity, and notes, either through the manual entry form or through a reviewed camera capture. A valid positive whole-number quantity SHALL create that many individually identifiable physical copies, each initially in Bulk's automatic Unsorted section with an unknown manual value.

#### Scenario: User adds a valid card

- **WHEN** the user submits a card with a name and valid quantity from either entry path
- **THEN** the application adds and displays exactly that many physical copies in Unsorted

#### Scenario: User omits the card name

- **WHEN** the user submits a card without a name from either entry path
- **THEN** the application rejects the submission, identifies the missing required value, and does not add an incomplete card

#### Scenario: User supplies an invalid quantity

- **WHEN** the user submits a zero, negative, fractional, or otherwise unsupported quantity
- **THEN** the application explains the validation error and does not create any copies

#### Scenario: User saves a reviewed camera capture

- **WHEN** the user confirms a camera capture and submits valid metadata
- **THEN** the application uses the same validation, Unsorted intake, and local persistence behavior as manual entry, without persisting the temporary image

#### Scenario: User abandons a reviewed camera capture

- **WHEN** the user cancels or discards a camera capture before submitting valid metadata
- **THEN** the application does not add a card or change the existing collection

### Requirement: Browse the collection

The application SHALL display saved cards and their available metadata in a collection view with access to the bulk box and binders. It SHALL distinguish total physical copies from distinct card entries, allow copies to be individually selected, and expose their locations and manual values without counting one copy more than once.

#### Scenario: Collection contains saved cards

- **WHEN** the user opens the collection view
- **THEN** the application displays saved cards, their available metadata, physical-copy counts, and access to their locations

#### Scenario: Duplicates occupy different locations

- **WHEN** one of four copies is in a binder and the other three are in bulk
- **THEN** the collection reports four owned copies and identifies their respective bulk sections or binder pages and pockets

#### Scenario: Collection is empty

- **WHEN** the user opens the collection view with no saved cards
- **THEN** the application displays an empty state explaining how to add the first card and does not display Unsorted

### Requirement: Search and filter cards

The application SHALL allow users to narrow the displayed collection by card name, set, card kind (Pokemon, Trainer, or Energy), rarity, elemental typing, Pokemon generation, and inclusive per-copy EUR value bounds. Generation SHALL mean Pokemon generation, not card set, release year, language, or geographic region. Multiple filters SHALL be combined without changing saved metadata or physical organization. Missing optional attributes SHALL remain explicitly unknown and SHALL NOT be inferred from names or notes.

#### Scenario: User searches by name

- **WHEN** the user enters a search term
- **THEN** the application displays only cards whose names match the term without changing saved collection data

#### Scenario: User applies a metadata filter

- **WHEN** the user selects one or more available metadata filters
- **THEN** the application displays only copies matching all selected filters in the active scope

#### Scenario: User filters by elemental typing

- **WHEN** the user filters for Fire
- **THEN** cards explicitly marked with Fire typing match, including multi-type cards, without conflating typing with Pokemon, Trainer, or Energy card kind

#### Scenario: User filters by generation with incomplete metadata

- **WHEN** the user filters for Generation I
- **THEN** only copies whose card metadata explicitly includes Generation I appear, and cards with unknown generation are excluded without being assigned a guessed generation

#### Scenario: User filters copies by value

- **WHEN** two copies of one card are valued at EUR 2.00 and EUR 20.00 and the minimum value is EUR 10.00
- **THEN** only the EUR 20.00 copy matches, and copies with unknown values are excluded from that bounded value filter

#### Scenario: Invalid value range is entered

- **WHEN** the user supplies a negative bound, nonnumeric amount, more than two decimal places, or a minimum greater than the maximum
- **THEN** the application explains the invalid range without applying it or altering collection data

### Requirement: Persist collection data locally

The application SHALL persist card metadata, individually identifiable copies, copy values and locations, bulk categories, and binder configuration on the user's device without a remote account. Existing valid quantity-based collections SHALL migrate without losing metadata or copies, with every migrated copy placed in Unsorted and its value marked Unknown. Storage and migration failures SHALL be explicitly reported and SHALL NOT be presented as empty collections or successful saves.

#### Scenario: User reloads after adding a card

- **WHEN** the user reloads the application after saving a card
- **THEN** the card and all of its physical copies remain available in their saved locations

#### Scenario: User reloads an organized collection

- **WHEN** the user reloads after configuring binders, assigning pockets, creating categories, and editing copy values
- **THEN** all configuration, copy identities, placements, and values are restored, with Unsorted visible only if it contains copies

#### Scenario: Existing quantities are migrated

- **WHEN** the application loads a valid legacy entry with quantity four
- **THEN** exactly four distinct copies appear in Unsorted, the original entry's metadata is preserved, and all four values are Unknown

#### Scenario: Migrated data is loaded again

- **WHEN** the user reloads after a successful migration
- **THEN** the saved copy identities and counts remain unchanged and no additional copies are created

#### Scenario: Stored data cannot be interpreted safely

- **WHEN** stored data is malformed, refers to invalid locations, or uses an unsupported format version
- **THEN** the application displays a recovery error and does not overwrite that data or present an empty editable collection as successful recovery

#### Scenario: Persistence fails

- **WHEN** saving an intake, move, value edit, configuration change, or migration fails
- **THEN** the application reports the failure, does not announce success, and preserves the previously saved state and any recoverable source data

### Requirement: Maintain physical-copy ownership

Each physical copy SHALL have exactly one location: Unsorted, one bulk category, or one valid binder pocket. Moving or organizing copies SHALL NOT create or delete ownership. One pocket SHALL contain at most one copy. Existing binder suggestions SHALL remain read-only and SHALL NOT move copies or reserve pockets.

#### Scenario: User splits duplicates

- **WHEN** the user moves one of four copies into a binder and another into a bulk category
- **THEN** four copies remain owned, with one in the binder, one in the category, and two in Unsorted

#### Scenario: User generates binder ideas

- **WHEN** the user generates an existing theme-based suggestion from an organized collection
- **THEN** the application presents the deterministic suggestion without changing any copy location, value, or binder configuration

### Requirement: Edit manual values per copy

The application SHALL allow each physical copy to have an independently editable manual value in EUR, represented as a nonnegative amount with at most two decimal places, or as Unknown when unset. Clearing a value SHALL restore Unknown. Values SHALL NOT be inferred from condition or grading, and this change SHALL NOT require structured condition, grading-company, or grade fields.

#### Scenario: Copies have different values

- **WHEN** the user assigns EUR 2.00 to one copy and EUR 20.00 to another copy of the same card
- **THEN** the two values are saved independently and remain attached to their copies after moves

#### Scenario: Unknown differs from zero

- **WHEN** a copy has no value and another is explicitly valued at EUR 0.00
- **THEN** the first displays Unknown and the second displays EUR 0.00

#### Scenario: User clears a value

- **WHEN** the user clears a previously saved manual value
- **THEN** that copy's value becomes Unknown without changing any other copy

#### Scenario: User enters an invalid value

- **WHEN** the user supplies a negative, nonfinite, overprecision, or otherwise unsupported monetary amount
- **THEN** the application explains the error and leaves the saved value unchanged

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
