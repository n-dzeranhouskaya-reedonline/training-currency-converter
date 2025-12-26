# Implementation Tasks: Favorite Currencies

**Feature**: Favorite Currencies  
**Branch**: `001-favorite-currencies`  
**Date**: 2025-12-26  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Task Summary

- **Total Tasks**: 28
- **Setup Phase**: 2 tasks
- **Foundational Phase**: 3 tasks
- **User Story 1 (P1)**: 9 tasks
- **User Story 2 (P2)**: 5 tasks
- **User Story 3 (P3)**: 6 tasks
- **Polish Phase**: 3 tasks

---

## Phase 1: Setup

**Goal**: Initialize project structure and dependencies

- [ ] T001 Create feature branch `001-favorite-currencies` from current branch
- [ ] T002 Verify project dependencies (Next.js 14.2.0, React 18.3.0, Jest 30.2.0, jest-axe 10.0.0)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Create shared utilities and types needed by all user stories

- [X] T003 [P] Add FavoriteCurrencies types to types/index.ts
- [X] T004 [P] Create utils/favorites.ts with localStorage utilities (getFavorites, saveFavorites, validateFavorites)
- [X] T005 [P] Create utils/favorites.test.ts with tests for localStorage utilities

**Independent Test Criteria**: All foundational utilities can be tested independently without UI components. Tests should verify localStorage read/write, validation of currency codes, and graceful degradation when localStorage unavailable.

---

## Phase 3: User Story 1 - Mark Currency as Favorite (P1)

**Story Goal**: Users can mark frequently-used currencies as favorites for quick access during conversions. Favorites appear at top of selectors and persist across page reloads.

**Independent Test Criteria**: 
- Click star icon next to any currency in dropdown → currency moves to top of list
- Reload page → favorited currency still at top with filled star icon
- Click star again → currency unfavorites and returns to alphabetical position
- localStorage contains correct array of currency codes after each operation

### Implementation Tasks

- [X] T006 [P] [US1] Create hooks/useFavoriteCurrencies.ts with state management (favorites array, isFavorite, toggleFavorite, error state)
- [X] T007 [P] [US1] Create hooks/useFavoriteCurrencies.test.ts with unit tests (initialization, toggleFavorite, localStorage persistence)
- [X] T008 [P] [US1] Add sortCurrenciesWithFavorites function to utils/currency.ts
- [X] T009 [P] [US1] Add tests for sortCurrenciesWithFavorites to utils/currency.test.ts
- [X] T010 [P] [US1] Create components/FavoriteButton.tsx with star icon button (filled/unfilled states)
- [X] T011 [P] [US1] Create components/FavoriteButton.test.tsx with accessibility tests (aria-labels, keyboard nav, jest-axe)
- [X] T012 [US1] Modify components/CurrencySelect.tsx to add favorites props (favorites array, onFavoriteToggle callback)
- [X] T013 [US1] Integrate FavoriteButton into CurrencySelect dropdown options with sorted currency list
- [X] T014 [US1] Update components/CurrencySelect.test.tsx to test favorite sorting and button rendering

**Parallel Execution Opportunities**:
- T006-T007 (hook), T008-T009 (utility), T010-T011 (button) can be developed in parallel (different files, no dependencies)
- T012-T014 must run sequentially after T010-T011 complete (depends on FavoriteButton component)

---

## Phase 4: User Story 2 - Enforce Maximum Favorites Limit (P2)

**Story Goal**: System prevents users from exceeding 5 favorites, ensuring the feature remains manageable and doesn't clutter the interface.

**Independent Test Criteria**:
- Favorite 5 currencies → attempt to favorite 6th → error message appears "Maximum 5 favorites reached..."
- Error message displayed clearly below currency selector
- Unfavorite one currency → favorite a new one → operation succeeds
- localStorage never contains more than 5 currency codes

### Implementation Tasks

- [X] T015 [P] [US2] Add canAddFavorite() method to useFavoriteCurrencies hook
- [X] T016 [P] [US2] Add max limit validation to toggleFavorite in useFavoriteCurrencies.ts
- [X] T017 [P] [US2] Add error state management (setError, clearError) to useFavoriteCurrencies hook
- [X] T018 [US2] Update CurrencySelect.tsx to display favoriteError prop using ErrorMessage component
- [X] T019 [US2] Add tests for max limit enforcement to hooks/useFavoriteCurrencies.test.ts and components/CurrencySelect.test.tsx

**Parallel Execution Opportunities**:
- T015-T017 can be developed together (same hook file, related logic)
- T018-T019 must run after T015-T017 complete (depends on hook error handling)

---

## Phase 5: User Story 3 - Visual Favorite Indicators (P3)

**Story Goal**: Users can easily identify which currencies are favorited through visual indicators (filled vs. unfilled star icons).

**Independent Test Criteria**:
- Open currency selector → favorited currencies show filled star (★), non-favorites show unfilled star (☆)
- Toggle favorite → star icon updates immediately with visual feedback
- Selected currency in "from" or "to" field → shows small star indicator if favorited
- All star icons meet 4.5:1 color contrast ratio (WCAG 2.1 AA)

### Implementation Tasks

- [X] T020 [P] [US3] Design star icon states (filled/unfilled) with proper color contrast (4.5:1 minimum)
- [X] T021 [P] [US3] Add CSS transitions to FavoriteButton.tsx for smooth toggle animation
- [X] T022 [P] [US3] Add visual feedback on hover/focus states for FavoriteButton
- [X] T023 [P] [US3] Add small star indicator next to selected currency in CurrencySelect display
- [X] T024 [US3] Update FavoriteButton.test.tsx to verify icon states and CSS classes
- [X] T025 [US3] Update CurrencySelect.test.tsx to verify selected currency star indicator

**Parallel Execution Opportunities**:
- T020-T023 can be developed in parallel (different visual concerns, independent)
- T024-T025 must run after T020-T023 complete (depends on visual implementation)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Finalize integration, documentation, and testing completeness

- [X] T026 Update components/index.ts barrel export to include FavoriteButton
- [X] T027 Update hooks/index.ts barrel export to include useFavoriteCurrencies
- [X] T028 Run full test suite and verify ≥90% coverage for all new files (npm test -- --coverage)

---

## Dependencies & Execution Order

### Story Completion Order

```
Phase 1 (Setup)
     ↓
Phase 2 (Foundational) ← MUST complete before any user story
     ↓
Phase 3 (US1: Mark as Favorite) ← MVP, can deploy independently
     ↓
Phase 4 (US2: Max Limit) ← Depends on US1 (needs toggleFavorite hook)
     ↓
Phase 5 (US3: Visual Indicators) ← Depends on US1 (needs FavoriteButton component)
     ↓
Phase 6 (Polish)
```

### Critical Dependencies

- **Phase 2 → Phase 3**: Foundational utilities (types, localStorage functions) must exist before hook/components
- **T010-T011 → T012-T014**: FavoriteButton must exist before CurrencySelect integration
- **T015-T017 → T018-T019**: Error handling in hook must exist before UI display
- **T020-T023 → T024-T025**: Visual implementation must exist before visual tests

### Parallel Work Opportunities Per Phase

**Phase 2 (Foundational)**:
- T003 (types), T004 (utils), T005 (tests) — All parallelizable (different files)

**Phase 3 (US1)**:
- T006-T007 (hook) || T008-T009 (utility) || T010-T011 (button) — 3 parallel tracks
- Then T012-T014 (integration) sequentially

**Phase 4 (US2)**:
- T015-T017 (hook updates) — Sequential (same file)
- Then T018-T019 (UI/tests) sequentially

**Phase 5 (US3)**:
- T020-T023 (visual design) — 4 parallel tracks
- Then T024-T025 (tests) in parallel

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)

**Deploy after Phase 3 (User Story 1)** to get user feedback:
- Basic favoriting functionality (mark/unmark)
- Persistence in localStorage
- Favorites sorted at top of dropdown
- ~70% of total value delivered

### Incremental Delivery Plan

1. **Sprint 1**: Phase 1-3 (Setup + Foundational + US1) → Deploy MVP
2. **Sprint 2**: Phase 4 (US2) → Add limit enforcement → Deploy
3. **Sprint 3**: Phase 5-6 (US3 + Polish) → Visual polish → Final deployment

### Testing Strategy

- **Unit tests first**: Complete T005, T007, T009, T011 before integration work
- **Integration tests**: T014, T019, T025 after component modifications
- **Coverage gate**: T028 must show ≥90% coverage before merge

---

## Validation Checklist

Before marking feature complete:

- [ ] All 28 tasks completed and checked off
- [ ] Test coverage ≥90% (run `npm test -- --coverage`)
- [ ] All tests passing (125+ tests including new ones)
- [ ] jest-axe tests passing for all interactive elements
- [ ] Manual keyboard testing (Tab, Space, Enter on star icons)
- [ ] localStorage persistence verified across page reloads
- [ ] Error messages display correctly for max limit
- [ ] Visual indicators (filled/unfilled stars) working
- [ ] Favorites sorting correctly (alphabetical, favorites first)
- [ ] Constitution compliance verified (no violations)

---

## Notes

- **Constitution Compliance**: All tasks follow TypeScript strict mode, 90%+ coverage requirement, WCAG 2.1 AA standards
- **Task Format**: All tasks use required format `- [ ] [TaskID] [P?] [Story?] Description with file path`
- **Tests are included**: Feature specification did not explicitly disable tests, so tests are part of implementation per constitution requirements
- **File Paths**: All tasks include specific file paths for clarity
- **Parallelization**: [P] marker indicates tasks that can be executed in parallel (different files, no blocking dependencies)
