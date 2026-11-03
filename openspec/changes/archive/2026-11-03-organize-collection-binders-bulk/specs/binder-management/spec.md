# Spec Delta

## Purpose

Lets collectors create customizable fixed-capacity binders, arrange physical copies in explicit pockets, and browse saved pages like an actual binder.

## ADDED Requirements

### Requirement: Create and customize binders

The application SHALL allow the user to create named binders with a cover color, positive whole-number page count, and a regular rows-by-columns pocket layout used on each page. Capacity SHALL equal pages multiplied by pockets per page, with one physical copy per pocket. Name and color SHALL remain editable without relocating copies.

#### Scenario: User creates a binder
- **WHEN** the user creates a 20-page binder with a three-by-three pocket layout
- **THEN** it contains 180 empty pockets and displays its saved name and cover color

#### Scenario: Invalid configuration is submitted
- **WHEN** the user submits a blank name, invalid color, nonpositive or fractional dimensions, or a capacity outside safely supported numeric bounds
- **THEN** the application explains the invalid configuration and does not create or change the binder

#### Scenario: User edits appearance
- **WHEN** the user changes a populated binder's name or color
- **THEN** its appearance updates without changing pocket assignments or values

### Requirement: Preserve explicit copy placement

The application SHALL let the user move selected physical copies into specific empty binder pockets and move them to other empty pockets, bulk categories, or Unsorted. Moves SHALL preserve copy identity, per-copy value, and total ownership. Occupied or invalid destinations SHALL be rejected explicitly without replacing a copy, shifting other copies, or partially applying a multi-copy move.

#### Scenario: Copy is placed
- **WHEN** the user selects one bulk copy and an empty pocket on page two
- **THEN** that copy appears in that exact pocket and is no longer present in bulk

#### Scenario: Pocket is occupied
- **WHEN** the user tries to move a copy into an occupied pocket
- **THEN** an error explains that the pocket is occupied and both copies remain in their original locations

#### Scenario: User leaves a gap
- **WHEN** the user moves a copy out of the middle of a binder page
- **THEN** that pocket remains visibly empty and every other copy retains its page and pocket

#### Scenario: A batch contains an invalid destination
- **WHEN** a move assigns multiple copies to the same pocket or includes an invalid pocket
- **THEN** none of the copies move and the application explains the conflict

### Requirement: Enforce fixed capacity and safe layout changes

The application SHALL NOT expand a binder automatically. Users SHALL be able to append pages explicitly. Removing trailing pages SHALL be allowed only when those pages are empty. Changing rows or columns SHALL be allowed only while the binder is empty, with an explanation when blocked.

#### Scenario: Binder is full
- **WHEN** the user attempts to add a copy to a full binder
- **THEN** the copy stays in its original location and the application instructs the user to add pages or free a pocket

#### Scenario: User explicitly adds pages
- **WHEN** the user increases the page count of a populated binder
- **THEN** empty pages are appended and all existing placements remain unchanged

#### Scenario: Requested page removal would lose a placement
- **WHEN** the user reduces the page count and a removed page contains a copy
- **THEN** the change is rejected with instructions to move those copies first

#### Scenario: User changes a populated pocket layout
- **WHEN** the user changes the rows or columns of a binder containing copies
- **THEN** the change is rejected with an explanation and no copies are relocated

### Requirement: Browse binder pages accessibly

The application SHALL provide page-turn browsing with visible page numbering, previous and next controls, and direct page selection. Empty pockets and saved positions SHALL remain visible. Browsing SHALL work using keyboard and pointer input without requiring swipe or drag gestures. Page-turn motion SHALL respect reduced-motion preferences.

#### Scenario: User turns a page
- **WHEN** the user advances from page one to page two
- **THEN** page two's saved pocket arrangement appears, the current page indicator updates, and no placements change

#### Scenario: User reaches a boundary
- **WHEN** the user views the first or last page
- **THEN** navigation past that boundary is disabled and the valid page remains visible

#### Scenario: Keyboard and reduced motion are used
- **WHEN** the user navigates with a keyboard while reduced motion is enabled
- **THEN** they can select any page and pocket without animation-dependent interaction, and focus remains usable after navigation

#### Scenario: User searches for a binder copy
- **WHEN** the user opens a matching collection search result that identifies a binder page and pocket
- **THEN** that saved page is shown without compacting or rearranging the binder to match the filter

### Requirement: Delete binders safely

The application SHALL require confirmation before deleting a binder and SHALL explain that all contained copies will return to Unsorted. Confirmed deletion SHALL preserve owned copies and their values; cancellation SHALL change nothing.

#### Scenario: Populated binder is deleted
- **WHEN** the user confirms deletion of a populated binder
- **THEN** the binder is removed and its copies return to Unsorted with unchanged identities and values

#### Scenario: Binder deletion is cancelled
- **WHEN** the user cancels the confirmation
- **THEN** the binder and all pocket assignments remain unchanged
