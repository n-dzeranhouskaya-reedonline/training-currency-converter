# Research: Favorite Currencies Feature

**Feature**: Favorite Currencies  
**Date**: 2025-12-26  
**Purpose**: Research technical decisions and best practices for implementing favorites functionality

## Technical Decisions

### 1. State Management Approach

**Decision**: Use custom React hook (`useFavoriteCurrencies`) with useState and useEffect

**Rationale**:
- Aligns with project constitution (no external state management libraries)
- Follows existing pattern in project (`useConverter`, `useExchangeRates` hooks)
- Sufficient for client-side localStorage persistence
- Keeps state local to components that need it

**Alternatives considered**:
- ❌ Redux/Zustand: Violates constitution principle IV (no external state libs)
- ❌ Context API: Overkill for feature-specific state, adds unnecessary complexity
- ❌ URL params: Poor UX for favorites (clutters URL, security concerns)

### 2. localStorage Structure

**Decision**: Store as JSON array of currency codes

```typescript
// Key: 'currency_favorites'
// Value: ["USD", "EUR", "GBP"]
```

**Rationale**:
- Simple, minimal storage footprint
- Easy to validate against CURRENCIES list
- Fast array operations for add/remove
- Aligns with existing `currency_converter_history` pattern in project

**Alternatives considered**:
- ❌ Object with metadata: `{code: "USD", addedAt: timestamp}` - Unnecessary complexity for MVP
- ❌ Separate keys per currency: More localStorage calls, harder to enforce limit
- ❌ IndexedDB: Overkill for simple array storage

### 3. Component Architecture

**Decision**: Create reusable `<FavoriteButton>` component, modify `<CurrencySelect>`

**Rationale**:
- Follows atomic design principle (constitution I)
- Reusable across both "from" and "to" selectors
- Keeps favorite logic separate from select logic (single responsibility)
- Easier to test in isolation

**Component breakdown**:
- `FavoriteButton.tsx`: Star icon button with toggle logic
- `CurrencySelect.tsx` (modified): Adds FavoriteButton to each option, handles sorting

**Alternatives considered**:
- ❌ Inline star buttons in CurrencySelect: Violates single responsibility, harder to test
- ❌ Separate favorites dropdown: Poor UX, requires separate UI controls

### 4. Currency Sorting Strategy

**Decision**: Sort favorites alphabetically at top, non-favorites alphabetically below

```typescript
function sortCurrenciesWithFavorites(currencies: Currency[], favorites: string[]): Currency[] {
  const favoriteCurrencies = currencies
    .filter(c => favorites.includes(c.code))
    .sort((a, b) => a.code.localeCompare(b.code));
  
  const nonFavoriteCurrencies = currencies
    .filter(c => !favorites.includes(c.code))
    .sort((a, b) => a.code.localeCompare(b.code));
  
  return [...favoriteCurrencies, ...nonFavoriteCurrencies];
}
```

**Rationale**:
- Predictable ordering (users can find currencies reliably)
- No custom drag-and-drop complexity (out of scope per spec)
- Alphabetical sort is familiar pattern

**Alternatives considered**:
- ❌ Recently added favorites first: Unpredictable, requires timestamp metadata
- ❌ User-defined order: Requires drag-and-drop UI, complex to implement
- ❌ Frequency-based ordering: Requires usage tracking, privacy concerns

### 5. Accessibility Implementation

**Decision**: Use semantic `<button>` elements with dynamic aria-labels

```typescript
<button
  aria-label={isFavorite ? `Remove ${code} from favorites` : `Mark ${code} as favorite`}
  onClick={handleToggle}
  className="focus:ring-2 focus:ring-blue-500"
>
  {isFavorite ? <FilledStarIcon /> : <OutlinedStarIcon />}
</button>
```

**Rationale**:
- Meets WCAG 2.1 AA (constitution III)
- Screen readers announce action context
- Keyboard accessible (Tab, Space, Enter)
- Focus indicators visible

**Alternatives considered**:
- ❌ `<div>` with onClick: Not semantic, poor screen reader support
- ❌ Checkbox styled as star: Confusing semantics (checkboxes imply forms)
- ❌ Static aria-label: Doesn't communicate current state

### 6. Error Handling for Max Favorites

**Decision**: Show inline error message, prevent favorite action

```typescript
if (favorites.length >= 5 && !isFavorite) {
  setError("Maximum 5 favorites reached. Remove a favorite to add another.");
  return;
}
```

**Rationale**:
- Clear feedback to user (constitution I - error-resistant)
- Non-blocking (doesn't break app)
- Error message component already exists (`<ErrorMessage>`)

**Alternatives considered**:
- ❌ Silent failure: Poor UX, confusing to users
- ❌ Toast notification: Requires new component, inconsistent with project patterns
- ❌ Modal dialog: Disruptive, overkill for simple validation

### 7. localStorage Unavailability Handling

**Decision**: Feature gracefully degrades, app remains functional

```typescript
function checkLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
```

**Rationale**:
- Follows constitution principle IV (graceful fallbacks)
- App works without favorites in private/incognito mode
- No console errors or crashes

**Alternatives considered**:
- ❌ Require localStorage: Breaks app in private browsing
- ❌ In-memory fallback: Lost on reload, confusing UX
- ❌ Show error banner: Annoying to users, no actionable solution

## Best Practices Identified

### React Hooks Patterns

**From existing codebase** (`hooks/useConverter.ts`, `hooks/useExchangeRates.ts`):
- Use `useCallback` for toggle functions to prevent unnecessary re-renders
- Load from localStorage in `useEffect` with empty dependency array
- Save to localStorage in `useEffect` watching favorites array
- Clear mocks in tests' `beforeEach` blocks

### Testing Patterns

**From existing tests** (`components/CurrencySelect.test.tsx`, `utils/storage.test.ts`):
- Mock localStorage in `jest.setup.ts` (already configured)
- Test both presence and absence of localStorage
- Verify jest-axe assertions for all interactive elements
- Test keyboard interactions with `@testing-library/user-event`

### Tailwind CSS Patterns

**From existing components**:
- Use `focus:ring-2 focus:ring-blue-500` for focus indicators
- Star icon sizing: `w-5 h-5` (24px - meets WCAG minimum touch target)
- Color contrast: Ensure star icons meet 4.5:1 ratio
- Hover states: `hover:text-yellow-500` for interactive feedback

## Integration Points

### Existing Code to Modify

1. **components/CurrencySelect.tsx**:
   - Add `onFavoriteToggle` prop
   - Integrate `<FavoriteButton>` in option rendering
   - Pass sorted currencies with favorites first

2. **utils/currency.ts**:
   - Add `sortCurrenciesWithFavorites()` utility function
   - Export from barrel file

3. **types/index.ts**:
   - Add `FavoriteCurrency` type alias: `type FavoriteCurrency = string[]`

### No Changes Required

- ✅ API routes (feature is client-side only)
- ✅ Page layout (app/page.tsx uses existing components)
- ✅ Global styles (Tailwind classes sufficient)

## Performance Considerations

### Optimization Strategies

1. **Memoization**: Use `useMemo` for sorted currency list
2. **Debouncing**: Not needed (favorites toggle is infrequent user action)
3. **localStorage batching**: Not needed (max 5 items, <1KB storage)
4. **Re-render prevention**: `useCallback` for toggle handlers

### Performance Benchmarks

- Target: <100ms for favorite toggle (measured from click to visual update)
- Target: <50ms localStorage write (async, doesn't block UI)
- Target: <100ms dropdown reordering (12 currencies, simple sort)

All targets are well within acceptable ranges for modern browsers.

## Security Considerations

### localStorage Safety

- **XSS Protection**: Next.js sanitizes inputs by default
- **Data Validation**: Validate currency codes against CURRENCIES list on load
- **Quota Limits**: 5-favorite limit prevents localStorage abuse
- **Manual Editing**: Filter invalid codes on load, don't crash

### Privacy

- **No PII**: Only stores currency codes (no user identification)
- **Local Only**: No server-side storage or tracking
- **Clear Mechanism**: Users can clear via browser settings

## Dependencies

### No New Dependencies Required

- ✅ All functionality achievable with existing dependencies:
  - React 18.3.0 (hooks, useState, useEffect, useCallback, useMemo)
  - TypeScript 5.3.3 (type safety)
  - Tailwind CSS 3.4.1 (styling)
  - Jest + RTL + jest-axe (testing)

### Leveraging Existing Utilities

- `utils/storage.ts` patterns for localStorage operations
- `utils/currency.ts` patterns for currency manipulation
- `components/ErrorMessage.tsx` for error display

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| localStorage unavailable | Low | Medium | Graceful degradation, feature disabled |
| User manually edits localStorage | Low | Low | Validate and filter on load |
| Performance with large favorites list | None | None | Hard limit of 5 favorites |
| Accessibility gaps | Medium | High | jest-axe tests, manual testing with screen reader |
| Breaking existing CurrencySelect | Low | High | Comprehensive regression tests |

## Open Questions (All Resolved)

1. ~~Should favorites sync across tabs?~~ → No, out of scope (requires BroadcastChannel API, adds complexity)
2. ~~Should favorites persist when swapping currencies?~~ → Yes, favorites are independent of selected currencies
3. ~~Should we add a "Manage Favorites" modal?~~ → No, inline management is simpler and meets requirements
4. ~~What if user has 5 favorites and none are visible in filtered list?~~ → N/A, no filtering in current implementation

## Next Steps

With research complete, proceed to **Phase 1**:
1. Generate `data-model.md` (data structures and types)
2. Generate `contracts/` (no API contracts needed, document component interfaces)
3. Generate `quickstart.md` (developer onboarding guide)
4. Update agent context
5. Re-evaluate Constitution Check
