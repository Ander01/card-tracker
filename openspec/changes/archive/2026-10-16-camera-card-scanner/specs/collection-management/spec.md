# Spec Delta

## MODIFIED Requirements

### Requirement: Add a card to the collection

The application SHALL allow the user to add a card with its name and optional collection metadata such as set, type, rarity, quantity, and notes, either through the manual entry form or through a reviewed camera capture.

#### Scenario: User adds a valid card

- **WHEN** the user submits a card with a name and valid quantity from either entry path
- **THEN** the application adds the card to the collection and displays the saved card

#### Scenario: User omits the card name

- **WHEN** the user submits a card without a name from either entry path
- **THEN** the application rejects the submission, identifies the missing required value, and does not add an incomplete card

#### Scenario: User saves a reviewed camera capture

- **WHEN** the user confirms a camera capture and submits valid metadata
- **THEN** the application saves the card using the same collection validation and local persistence behavior as manual entry

#### Scenario: User abandons a reviewed camera capture

- **WHEN** the user cancels or discards a camera capture before submitting valid metadata
- **THEN** the application does not add a card or change the existing collection
