# Quick Start: Favorite Currencies Feature

**Feature**: Favorite Currencies  
**Branch**: `001-favorite-currencies`  
**Date**: 2025-12-26

## Overview

This feature allows users to mark up to 5 currencies as favorites. Favorites appear at the top of currency selector dropdowns and persist across sessions via localStorage.

## Prerequisites

- Node.js 18.x or higher
- Repository cloned and dependencies installed (`npm install`)
- Familiarity with Next.js 14 App Router and React hooks
- Understanding of project structure (see `.github/copilot-instructions.md`)

## Getting Started (5 minutes)

### 1. Checkout Feature Branch

```bash
git checkout 001-favorite-currencies
npm install  # In case of dependency changes
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Try the Feature

1. **Mark a currency as favorite**:
   - Click "From" or "To" currency selector
   - Click the star icon (☆) next to any currency
   - Currency moves to top of list
   - Star icon fills (★)

2. **Verify persistence**:
   - Reload the page (F5)
   - Open currency selector
   - Favorited currencies still at top

3. **Test max limit**:
   - Favorite 5 currencies
   - Try to favorite a 6th
   - Error message appears: "Maximum 5 favorites reached..."

4. **Remove favorite**:
   - Click filled star icon (★) next to favorited currency
   - Currency returns to alphabetical position
   - Star icon becomes outlined (☆)

### 4. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Check coverage (must be ≥90%)
npm run test:coverage
```

Expected output: All tests pass ✅

## File Structure

### New Files Created

```
components/
├── FavoriteButton.tsx         # Star icon button component
└── FavoriteButton.test.tsx    # Button component tests

hooks/
├── useFavoriteCurrencies.ts   # Favorites state management hook
└── useFavoriteCurrencies.test.ts  # Hook tests

utils/
├── favorites.ts               # localStorage utilities
└── favorites.test.ts          # Utility tests
```

### Modified Files

```
app/
└── page.tsx                   # Added useFavoriteCurrencies hook

components/
├── CurrencySelect.tsx         # Added favorites props and FavoriteButton
├── CurrencySelect.test.tsx    # Added favorites tests
└── index.ts                   # Export FavoriteButton

hooks/
└── index.ts                   # Export useFavoriteCurrencies

types/
└── index.ts                   # Added FavoriteCurrencies types

utils/
└── currency.ts                # Added sortCurrenciesWithFavorites function
```

## Key Concepts

### 1. Custom Hook Pattern

The feature uses `useFavoriteCurrencies` hook for state management:

```typescript
const {
  favorites,         // ["USD", "EUR", "GBP"]
  toggleFavorite,    // (code: string) => void
  error,             // "Maximum 5 favorites..." or null
} = useFavoriteCurrencies();
```

**Why**: Follows project pattern (see `useConverter`, `useExchangeRates`)

### 2. localStorage Persistence

Favorites stored under key `currency_favorites`:

```json
["USD", "EUR", "GBP", "JPY", "AUD"]
```

**How it works**:
- Load on component mount
- Save on every favorites change
- Gracefully degrades if localStorage unavailable

### 3. Sorting Strategy

Currencies sorted in two groups:
1. **Favorites** - Alphabetically at top
2. **Non-favorites** - Alphabetically below

Example: If favorites are ["JPY", "EUR", "AUD"]:
```
AUD  ★
EUR  ★
JPY  ★
─────────
BYN  ☆
CAD  ☆
CHF  ☆
...
```

### 4. Accessibility

All interactive elements (star buttons) are:
- ✅ Keyboard accessible (Tab, Space, Enter)
- ✅ Screen reader friendly (dynamic aria-labels)
- ✅ Focus indicators visible
- ✅ Semantic HTML (`<button>` elements)

## Development Workflow

### Adding a Feature

1. **Write tests first** (TDD):
   ```bash
   # Create test file
   touch components/FavoriteButton.test.tsx
   
   # Write failing tests
   npm test -- FavoriteButton.test.tsx --watch
   
   # Implement component until tests pass
   ```

2. **Implement component**:
   ```typescript
   // components/FavoriteButton.tsx
   export default function FavoriteButton({ ... }: FavoriteButtonProps) {
     // Implementation
   }
   ```

3. **Add to barrel export**:
   ```typescript
   // components/index.ts
   export { default as FavoriteButton } from './FavoriteButton';
   ```

4. **Verify coverage**:
   ```bash
   npm run test:coverage
   # Must be ≥90%
   ```

### Debugging

#### localStorage Issues

```typescript
// Check localStorage in browser console
localStorage.getItem('currency_favorites')
// Should return: ["USD","EUR","GBP"]

// Clear favorites
localStorage.removeItem('currency_favorites')
// Reload page to reset
```

#### Component Not Re-rendering

Check useEffect dependencies in `useFavoriteCurrencies`:
```typescript
useEffect(() => {
  saveFavoritesToStorage(favorites);
}, [favorites]); // Must include favorites dependency
```

#### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test file
npm test -- FavoriteButton.test.tsx

# Verbose output
npm test -- --verbose
```

## Common Tasks

### Task: Add a New Currency to Favorites List

**Not needed** - Favorites are user-selected, not hardcoded.

### Task: Change Max Favorites Limit

1. Update constant in `useFavoriteCurrencies.ts`:
   ```typescript
   const MAX_FAVORITES = 10; // Changed from 5
   ```

2. Update error message:
   ```typescript
   setError(`Maximum ${MAX_FAVORITES} favorites reached...`);
   ```

3. Update tests in `useFavoriteCurrencies.test.ts`:
   ```typescript
   it('enforces maximum limit', () => {
     // Test with MAX_FAVORITES + 1
   });
   ```

4. Update spec documentation

### Task: Add Visual Separator Between Favorites and Non-Favorites

In `CurrencySelect.tsx`:

```tsx
{sortedCurrencies.map((currency, index) => {
  const isFav = favorites.includes(currency.code);
  const prevIsFav = index > 0 && favorites.includes(sortedCurrencies[index - 1].code);
  
  // Add separator when transitioning from favorites to non-favorites
  const showSeparator = index > 0 && prevIsFav && !isFav;
  
  return (
    <Fragment key={currency.code}>
      {showSeparator && <hr className="my-2 border-gray-200" />}
      <option value={currency.code}>
        {/* ... */}
      </option>
    </Fragment>
  );
})}
```

## Testing Guide

### Run Specific Test Suites

```bash
# Component tests
npm test -- components/

# Hook tests
npm test -- hooks/

# Utility tests
npm test -- utils/

# Single file
npm test -- FavoriteButton.test.tsx

# Tests matching pattern
npm test -- favorite
```

### Coverage Report

```bash
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html  # macOS/Linux
start coverage/lcov-report/index.html  # Windows
```

Target: ≥90% coverage for all metrics (statements, branches, functions, lines)

### Accessibility Testing

```bash
# Run tests with jest-axe
npm test -- --testNamePattern="accessibility"

# Manual testing with screen reader:
# - macOS: VoiceOver (Cmd+F5)
# - Windows: NVDA (free download)
# - Chrome: ChromeVox extension
```

## Troubleshooting

### Issue: Favorites not persisting

**Cause**: localStorage disabled (private browsing)

**Solution**: Feature degrades gracefully. Inform user that favorites are session-only in private mode.

### Issue: Error "Maximum 5 favorites reached" doesn't clear

**Cause**: Error not cleared on successful toggle

**Fix**: Call `clearError()` in `toggleFavorite` before setting new state

### Issue: Tests fail with "localStorage is not defined"

**Cause**: Test running in Node environment without localStorage mock

**Solution**: Check `jest.setup.ts` has localStorage mock:
```typescript
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
```

### Issue: Star icon not changing on click

**Cause**: `isFavorite` prop not updating

**Debug**:
1. Check `useFavoriteCurrencies` hook is called
2. Verify `favorites` array updates in React DevTools
3. Confirm `isFavorite` calculation is correct
4. Check component re-renders on state change

## Next Steps

- ✅ Feature implemented and tested
- ✅ Documentation complete
- ⏭️ Ready for code review
- ⏭️ Manual testing on desktop and mobile
- ⏭️ Accessibility audit with screen reader
- ⏭️ Merge to main branch after approval

## Resources

- **Project Documentation**: [README.md](../../../README.md)
- **Architecture Guide**: [.github/copilot-instructions.md](../../../.github/copilot-instructions.md)
- **Constitution**: [.specify/memory/constitution.md](../../../.specify/memory/constitution.md)
- **Feature Spec**: [spec.md](../spec.md)
- **Data Model**: [data-model.md](../data-model.md)
- **Component Contracts**: [contracts/components.md](../contracts/components.md)

## Support

Questions or issues? Check:
1. [Feature specification](../spec.md) for requirements
2. [Data model](../data-model.md) for data structures
3. [Component contracts](../contracts/components.md) for interfaces
4. [Research document](../research.md) for technical decisions
