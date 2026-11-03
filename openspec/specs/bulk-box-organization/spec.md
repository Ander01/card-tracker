# bulk-box-organization Specification

## Purpose

Represents a collector's bulk box as physical divider sections, with a temporary intake area and explicit movement of individual owned copies.

## Requirements

### Requirement: Automatically manage Unsorted intake

The application SHALL place all newly added physical copies in a system-managed bulk section named Unsorted. Unsorted SHALL appear if and only if it contains at least one copy, SHALL NOT be a user-renamable or user-deletable category, and SHALL NOT require manual creation.

#### Scenario: First copies arrive
- **WHEN** the user adds cards while Unsorted is absent
- **THEN** Unsorted appears and contains every newly added copy

#### Scenario: Last unsorted copy is organized
- **WHEN** the last copy in Unsorted moves to a bulk category or binder pocket
- **THEN** Unsorted disappears without removing any owned copies

#### Scenario: Unsorted is needed again
- **WHEN** a new copy is added or an existing copy is returned to Unsorted after that section disappeared
- **THEN** Unsorted reappears containing those copies

#### Scenario: Filters hide unsorted copies
- **WHEN** filters hide all copies in a nonempty Unsorted section
- **THEN** the section remains present and displays a no-match state rather than being removed

### Requirement: Manage flat divider categories

The application SHALL allow users to create and rename flat bulk categories with nonempty names. Categories SHALL represent physical divider sections, not nested folders or automatically populated filters. Names SHALL be unique ignoring surrounding whitespace and case, and the name Unsorted SHALL be reserved.

#### Scenario: User creates a divider
- **WHEN** the user creates a category named Trades
- **THEN** an empty Trades section appears and no existing copies are automatically moved into it

#### Scenario: User supplies an invalid category name
- **WHEN** a name is blank, duplicates another category, or matches the reserved name Unsorted
- **THEN** the application explains the validation error and leaves categories and copies unchanged

#### Scenario: User renames a divider
- **WHEN** the user saves a valid new name for a category containing copies
- **THEN** the category displays its new name and retains the same copies

### Requirement: Move copies between bulk sections

The application SHALL let users select specific copies and move them between Unsorted, user categories, and binders. Movement SHALL preserve copy identity, metadata, value, and total ownership, and SHALL leave each copy in exactly one location. An invalid multi-copy move SHALL fail as a whole with an explanation.

#### Scenario: Duplicates are split across sections
- **WHEN** the user moves one of four copies from Unsorted into Trades
- **THEN** Trades contains the selected copy, Unsorted contains the remaining three, and the collection still owns four

#### Scenario: Bulk copy moves into a binder
- **WHEN** the user moves a bulk copy into an available binder pocket
- **THEN** it leaves its bulk section and appears only in the selected pocket

#### Scenario: Destination no longer exists
- **WHEN** a selected destination category no longer exists at submission
- **THEN** the application explains the error and moves none of the selected copies

### Requirement: Remove dividers without deleting cards

The application SHALL require confirmation before deleting a user category and SHALL explain that its copies return to Unsorted. Cancellation SHALL leave all data unchanged. Confirmed deletion SHALL preserve the copies and their values.

#### Scenario: Occupied category is deleted
- **WHEN** the user confirms deletion of a category containing copies
- **THEN** the category is removed and all of its copies appear in Unsorted with unchanged identities and values

#### Scenario: Deletion is cancelled
- **WHEN** the user cancels category deletion
- **THEN** the category and its copy locations remain unchanged

### Requirement: Filter bulk without changing physical organization

The application SHALL provide collection metadata and per-copy value filters within a selected bulk section and across the whole bulk box. The selected scope SHALL be visible. Filtering SHALL NOT move copies, create divider categories, or change underlying section membership.

#### Scenario: Filter across bulk
- **WHEN** the user filters the whole bulk box by generation
- **THEN** only matching bulk copies appear, binder copies are excluded, and the copies retain their original sections

#### Scenario: Filter one divider
- **WHEN** the user selects Trades and applies a rarity filter
- **THEN** only matching copies in Trades appear and no copies are moved
