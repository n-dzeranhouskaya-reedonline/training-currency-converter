# Feature Specification: Favorite Currencies

**Feature Branch**: `001-favorite-currencies`  
**Created**: 2025-12-26  
**Status**: Draft  
**Input**: User description: "Add Favorite Currencies feature: Users can mark currencies as favorites, favorites appear at top of selectors, maximum 5 favorites, persist in localStorage"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark Currency as Favorite (Priority: P1)

Users can mark frequently-used currencies as favorites for quick access during conversions. This improves efficiency by reducing scrolling through the full currency list.

**Why this priority**: Core functionality that delivers immediate value - users can start favoriting currencies and see them prioritized in the selector immediately.

**Independent Test**: Can be fully tested by clicking a favorite icon next to a currency in the selector, verifying it appears at the top of the list, and checking localStorage persistence after page reload.

**Acceptance Scenarios**:

1. **Given** the user has opened a currency selector dropdown, **When** they click the star icon next to a currency, **Then** that currency is marked as a favorite and moves to the top of the selector list
2. **Given** a user has marked a currency as favorite, **When** they reload the page, **Then** the currency remains marked as favorite and appears at the top of selectors
3. **Given** a user has marked a currency as favorite, **When** they click the star icon again, **Then** the currency is unfavorited and returns to its alphabetical position

---

### User Story 2 - Enforce Maximum Favorites Limit (Priority: P2)

System prevents users from exceeding 5 favorites, ensuring the feature remains manageable and doesn't clutter the interface.

**Why this priority**: Enforces data integrity and prevents UX degradation from too many favorites. Can be implemented after basic favoriting works.

**Independent Test**: Can be tested by attempting to favorite 6 currencies and verifying the system prevents the 6th addition with a clear error message.

**Acceptance Scenarios**:

1. **Given** a user has already favorited 5 currencies, **When** they attempt to favorite a 6th currency, **Then** they see an error message "Maximum 5 favorites reached. Remove a favorite to add another."
2. **Given** a user has 5 favorites and wants to add another, **When** they unfavorite one currency and favorite a new one, **Then** the operation succeeds
3. **Given** a user attempts to exceed the limit, **When** the error appears, **Then** the UI provides a clear way to manage existing favorites

---

### User Story 3 - Visual Favorite Indicators (Priority: P3)

Users can easily identify which currencies are favorited through visual indicators (filled vs. unfilled star icons) both in the dropdown and when a currency is selected.

**Why this priority**: Enhances usability but the feature works without it. Can be refined after core functionality is stable.

**Independent Test**: Can be tested by verifying filled stars appear next to favorited currencies and unfilled stars next to non-favorites across all currency selectors.

**Acceptance Scenarios**:

1. **Given** the user opens a currency selector, **When** the dropdown displays, **Then** favorited currencies show a filled star icon and non-favorites show an unfilled star icon
2. **Given** a currency is selected in the "from" or "to" field, **When** it is a favorite, **Then** a small filled star indicator appears next to the selected currency code
3. **Given** the user toggles a favorite, **When** the state changes, **Then** the star icon updates immediately with smooth visual feedback

---

### Edge Cases

- What happens when a user tries to favorite a currency that's already selected in both "from" and "to" fields?
- How does the system handle corrupted localStorage data (e.g., favorites array contains invalid currency codes)?
- What happens if localStorage is disabled or unavailable in the browser?
- How does the feature behave with assistive technologies (screen readers announcing favorite status)?
- What keyboard interactions are required (Space/Enter to toggle favorite, arrow keys to navigate)?
- How are favorites handled when swapping currencies (should they remain favorited)?
- What happens if the favorites list in localStorage exceeds 5 items (legacy data or manual editing)?

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to mark any currency as a favorite via a clickable star icon
- **FR-002**: System MUST display favorited currencies at the top of both currency selector dropdowns (from and to)
- **FR-003**: System MUST enforce a maximum limit of 5 favorite currencies
- **FR-004**: System MUST persist favorite currencies in localStorage with key `currency_favorites`
- **FR-005**: System MUST load favorites from localStorage on application initialization
- **FR-006**: System MUST allow users to remove a currency from favorites by clicking the star icon again
- **FR-007**: System MUST display a visual distinction between favorited (filled star) and non-favorited (unfilled star) currencies
- **FR-008**: System MUST show an error message when users attempt to exceed the 5-favorite limit
- **FR-009**: System MUST maintain favorites across page reloads and browser sessions
- **FR-010**: Favorite currencies MUST appear in alphabetical order within the favorites section
- **FR-011**: Non-favorite currencies MUST appear in alphabetical order below the favorites section
- **FR-012**: System MUST handle localStorage unavailability gracefully (feature disabled, no errors thrown)
- **FR-013**: System MUST validate favorite currency codes against the CURRENCIES list on load and remove invalid entries

### Testing Requirements (NON-NEGOTIABLE per Constitution)

- **TR-001**: Feature MUST achieve ≥90% test coverage (statements, branches, functions, lines)
- **TR-002**: All components MUST have co-located `.test.tsx` files
- **TR-003**: Tests MUST cover: happy path, edge cases, error states, null/undefined handling
- **TR-004**: All interactive elements (star icons) MUST have unit tests verifying toggle behavior
- **TR-005**: Critical paths (localStorage read/write, favorite limit enforcement) MUST achieve 100% coverage
- **TR-006**: Tests MUST verify localStorage persistence and retrieval
- **TR-007**: Tests MUST verify favorites are correctly sorted at the top of selectors

### Accessibility Requirements (WCAG 2.1 AA per Constitution)

- **AR-001**: Star icons MUST be keyboard accessible (Tab to focus, Space/Enter to toggle)
- **AR-002**: Star icons MUST have `aria-label` describing action (e.g., "Mark USD as favorite" or "Remove USD from favorites")
- **AR-003**: Color contrast for star icons MUST meet 4.5:1 minimum ratio
- **AR-004**: Focus indicators MUST be visible on star icons (`focus:ring-2 focus:ring-blue-500`)
- **AR-005**: Star icons MUST be implemented as `<button>` elements (semantic HTML)
- **AR-006**: Screen readers MUST announce when a currency is favorited/unfavorited (use live region or toast notification)
- **AR-007**: All tests MUST include `jest-axe` assertions for star icon buttons
- **AR-008**: Error message for max favorites MUST be announced to screen readers

### Key Entities

- **FavoriteCurrency**: Represents a user's favorited currency
  - Currency code (string, must match CURRENCIES list)
  - Order in favorites list (implicit from array position)
  - Stored as array of currency codes in localStorage: `['USD', 'EUR', 'GBP']`
  
- **CurrencyWithFavoriteStatus**: Extension of existing Currency type
  - All existing Currency properties (code, name, symbol)
  - isFavorite (boolean, derived from favorites list)
  - Used for rendering currency selectors with favorite indicators

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can mark a currency as favorite in under 3 seconds (single click/tap on star icon)
- **SC-002**: Favorited currencies appear at the top of selector dropdowns within 100ms of opening
- **SC-003**: 95% of users successfully favorite at least one currency within first use session
- **SC-004**: Favorites persist correctly across 100% of page reloads (verified through localStorage tests)
- **SC-005**: System prevents exceeding 5-favorite limit 100% of the time with clear user feedback
- **SC-006**: Testing: Feature achieves ≥90% coverage, all tests pass in CI
- **SC-007**: Accessibility: Feature passes all jest-axe tests, keyboard navigation works completely for all favorite operations
- **SC-008**: Feature gracefully degrades when localStorage is unavailable (no application crashes or console errors)

## Assumptions

- Users understand star icon convention for favorites (common pattern across applications)
- 5-favorite limit is sufficient for most users' needs (based on industry standard for quick-access lists)
- localStorage is available in target browsers (fallback: feature disabled but app remains functional)
- Alphabetical ordering within favorites section is acceptable (no custom user-defined order in MVP)
- Existing CURRENCIES list in `utils/currency.ts` remains stable (currency codes don't change frequently)

## Out of Scope (for this specification)

- Custom ordering of favorites (drag-and-drop reordering)
- Syncing favorites across devices (requires backend/authentication)
- Analytics tracking of which currencies are most favorited
- Importing/exporting favorite lists
- Different favorite limits for different user types
- Favorite currency suggestions based on user location
