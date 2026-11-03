# Spec Delta

## Purpose

Lets collectors find and review exact English physical Pokemon cards using TCGdex metadata and artwork before adding owned copies to their local collection.

## ADDED Requirements

### Requirement: Search the English physical-card catalog

The application SHALL provide English card-name search, set selection, and paginated results that identify cards by catalog identifier and collector number. Results SHALL exclude TCG Pocket cards using catalog set membership, including cards without artwork. Search SHALL distinguish loading, no matches, and request failures, provide retry after failure, and prevent outdated responses from replacing newer results. Search and selection SHALL NOT create ownership or upload collection records or camera captures.

#### Scenario: Collector searches by name
- **WHEN** the collector searches for Pikachu
- **THEN** results identify individual catalog cards with their collector numbers and offer exact-card selection rather than treating all Pikachu cards as one card

#### Scenario: Collector selects a set
- **WHEN** the collector selects a physical set and searches within it
- **THEN** only matching cards from that set are displayed and paginated

#### Scenario: Digital card has no artwork
- **WHEN** a result belongs to the TCG Pocket series and has no image reference
- **THEN** it is excluded based on set membership rather than an image URL or rarity heuristic

#### Scenario: Requests complete out of order
- **WHEN** an earlier query finishes after a newer query
- **THEN** the displayed results still correspond to the newer query

#### Scenario: Catalog is unavailable
- **WHEN** a request fails or its response cannot be interpreted safely
- **THEN** the application explains the failure, offers retry and manual entry, and leaves saved collection data unchanged

#### Scenario: Search finds nothing
- **WHEN** a successful search returns no matching physical cards
- **THEN** the application displays a no-results state distinct from a request failure

### Requirement: Review an exact catalog card

The application SHALL retrieve the selected card's full information before enabling catalog-backed submission. Review SHALL show its name, set, string collector number, category, available elemental types, rarity, and artwork or an explicit unavailable state. Available illustrator, Pokédex identifiers, and printing-variant information SHALL remain representable in the saved metadata. Rarity SHALL remain distinct from available printing finishes; listing variants SHALL NOT claim any specific variant is owned. Missing optional metadata SHALL remain unknown rather than being fabricated.

#### Scenario: Collector reviews Base Set Charizard
- **WHEN** the collector selects catalog card base1-4
- **THEN** review identifies Base Set Charizard number 4, preserves the supplied Rare rarity, and distinguishes its available holo printing information from rarity

#### Scenario: Collector number contains leading zeros or letters
- **WHEN** a selected card has collector number 004 or TG01
- **THEN** review and saved metadata retain that exact string

#### Scenario: Detail retrieval fails
- **WHEN** full information for a selected search result cannot be loaded
- **THEN** catalog-backed submission is unavailable until retry succeeds or the collector explicitly switches to manual entry

#### Scenario: Variant information is absent
- **WHEN** a selected card does not provide printing variants
- **THEN** review leaves variant information unknown and does not infer a normal or holo finish

### Requirement: Display catalog artwork accessibly

The application SHALL use provider-supplied artwork references when available, use thumbnail-sized artwork in lists and pockets, and provide descriptive alternative text. Missing or failed images SHALL leave card identity and actions usable through an explicit artwork-unavailable state. Artwork availability SHALL NOT determine whether a physical card can be saved. Guaranteed offline artwork SHALL NOT be required.

#### Scenario: Card has artwork
- **WHEN** a catalog card with an image reference is displayed in search or review
- **THEN** its image is shown with alternative text identifying the card

#### Scenario: Artwork fails
- **WHEN** an image is absent or fails to load
- **THEN** the card name and identifying metadata remain visible, an artwork-unavailable state appears, and valid intake remains possible
