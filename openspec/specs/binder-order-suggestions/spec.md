# binder-order-suggestions Specification

## Purpose

Helps collectors turn the cards they already own into an understandable first binder layout by grouping and ordering cards according to a selected theme or collection goal.

## Requirements

### Requirement: Choose a binder suggestion theme

The application SHALL allow the user to select or enter a theme or grouping criterion for a binder-order suggestion.

#### Scenario: User selects a supported theme

- **WHEN** the user selects a supported theme
- **THEN** the application uses that theme to generate an ordered suggestion from the locally available collection

#### Scenario: User provides no theme

- **WHEN** the user requests a suggestion without selecting or entering a theme
- **THEN** the application prompts the user to provide a theme and does not present an unlabeled recommendation as final

### Requirement: Generate an ordered binder layout

The application SHALL present a deterministic ordered list of collection cards for the selected theme and identify the grouping or ordering rationale when available.

#### Scenario: Matching cards exist

- **WHEN** the selected theme matches cards in the collection
- **THEN** the application displays the matching cards in binder order with their relevant grouping rationale

#### Scenario: No matching cards exist

- **WHEN** the selected theme matches no cards in the collection
- **THEN** the application displays an explicit no-match state and leaves the saved collection unchanged

### Requirement: Handle incomplete collection metadata

The application SHALL still generate a suggestion from cards with incomplete optional metadata and SHALL distinguish unavailable information rather than inventing card attributes.

#### Scenario: Card lacks theme-related metadata

- **WHEN** a card lacks metadata needed to classify it for the selected theme
- **THEN** the application either excludes it with an explanation or places it in an explicitly labeled unclassified group
