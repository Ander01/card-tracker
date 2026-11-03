# Spec Delta

## ADDED Requirements

### Requirement: Render catalog artwork without changing pocket semantics

The application SHALL display available catalog artwork for copies in their assigned binder pockets, preserve card names and accessible selection controls, and keep empty pockets visibly empty. Missing or failed artwork SHALL NOT make an occupied pocket appear empty or prevent access to its copy details and manual value. Image loading SHALL NOT relocate copies or change page navigation.

#### Scenario: Occupied pocket has artwork
- **WHEN** the collector opens a page containing a catalog-backed copy with artwork
- **THEN** that card's artwork appears in its exact saved pocket without changing other placements

#### Scenario: Occupied pocket has no usable image
- **WHEN** artwork for an assigned copy is missing or fails
- **THEN** that pocket still identifies the owned card and offers its existing controls rather than appearing available

#### Scenario: Images finish after page navigation
- **WHEN** images finish loading after the collector turns a page
- **THEN** the active page and its saved pocket arrangement remain unchanged
