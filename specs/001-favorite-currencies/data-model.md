# Data Model: Favorite Currencies

**Feature**: Favorite Currencies  
**Date**: 2025-12-26  
**Purpose**: Define data structures, types, and state management for favorites feature

## Type Definitions

### Core Types

```typescript
// types/index.ts

/**
 * Array of favorited currency codes
 * Stored in localStorage under key 'currency_favorites'
 * Maximum length: 5
 */
export type FavoriteCurrencies = string[];

/**
 * Currency with favorite status metadata
 * Extended from base Currency type with derived isFavorite flag
 */
export interface CurrencyWithFavoriteStatus extends Currency {
  isFavorite: boolean;
}

/**
 * Return type for useFavoriteCurrencies hook
 */
export interface UseFavoriteCurrenciesResult {
  favorites: FavoriteCurrencies;
  isFavorite: (currencyCode: string) => boolean;
  toggleFavorite: (currencyCode: string) => void;
  canAddFavorite: () => boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Props for FavoriteButton component
 */
export interface FavoriteButtonProps {
  currencyCode: string;
  isFavorite: boolean;
  onToggle: (currencyCode: string) => void;
  disabled?: boolean;
}
```

## Data Structures

### localStorage Schema

**Key**: `currency_favorites`  
**Type**: JSON array of strings  
**Max Size**: 5 elements  
**Example**:

```json
["USD", "EUR", "GBP", "JPY", "AUD"]
```

**Validation Rules**:
- Must be valid JSON array
- Each element must be a string
- Each string must exist in `CURRENCIES` list from `utils/currency.ts`
- Array length ≤ 5
- Invalid entries filtered out on load

### In-Memory State

**Location**: `useFavoriteCurrencies` hook  
**State Variables**:

```typescript
const [favorites, setFavorites] = useState<FavoriteCurrencies>([]);
const [error, setError] = useState<string | null>(null);
```

**Derived Values** (computed, not stored):
- `isFavorite(code)`: Boolean indicating if currency is favorited
- `canAddFavorite()`: Boolean indicating if user can add more favorites

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                      useFavoriteCurrencies                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  State: favorites: string[]                          │  │
│  │  State: error: string | null                         │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                          │         │
│         │ saves                                    │ loads   │
│         ▼                                          ▼         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  localStorage['currency_favorites']                  │  │
│  │  ["USD", "EUR", "GBP"]                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ provides
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      CurrencySelect                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Uses: favorites array                               │  │
│  │  Calls: toggleFavorite(code)                         │  │
│  │  Displays: sorted currencies (favorites first)       │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                                    │
│         │ renders                                            │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FavoriteButton (for each currency)                  │  │
│  │  Props: currencyCode, isFavorite, onToggle          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## State Transitions

### Favorite Toggle Flow

```
Initial State: favorites = ["USD", "EUR"]

┌─────────────────────────────────────────────────────────────┐
│ User clicks star icon next to "GBP"                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Is GBP in     │
         │ favorites?    │
         └───────┬───────┘
                 │
        ┌────────┴────────┐
        │ NO              │ YES
        ▼                 ▼
┌───────────────┐  ┌──────────────┐
│ Check limit   │  │ Remove GBP   │
│ favorites.len │  │ from array   │
│ < 5?          │  │              │
└───────┬───────┘  └──────┬───────┘
        │                  │
   ┌────┴─────┐           │
   │ YES      │ NO        │
   ▼          ▼           │
┌────────┐ ┌────────┐    │
│ Add    │ │ Show   │    │
│ GBP to │ │ error  │    │
│ array  │ │ message│    │
└───┬────┘ └────────┘    │
    │                     │
    └──────┬──────────────┘
           │
           ▼
    ┌──────────────┐
    │ Save to      │
    │ localStorage │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Update UI    │
    │ (re-render)  │
    └──────────────┘

Final State: favorites = ["USD", "EUR", "GBP"]
```

### Error States

| Scenario | Error Message | User Action |
|----------|---------------|-------------|
| Max favorites reached (5) | "Maximum 5 favorites reached. Remove a favorite to add another." | Click star on any favorited currency to remove it |
| localStorage unavailable | null (feature silently disabled) | None - feature gracefully degrades |
| Corrupted localStorage data | null (filtered on load) | None - invalid entries removed automatically |

## Validation Logic

### On Load (from localStorage)

```typescript
function loadFavoritesFromStorage(): FavoriteCurrencies {
  try {
    const stored = localStorage.getItem('currency_favorites');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Validate structure
    if (!Array.isArray(parsed)) return [];
    
    // Filter valid currency codes only
    const validCodes = parsed.filter(code => 
      typeof code === 'string' && 
      CURRENCIES.some(c => c.code === code)
    );
    
    // Enforce max limit (handle legacy data)
    return validCodes.slice(0, 5);
    
  } catch {
    return []; // Graceful fallback
  }
}
```

### On Save (to localStorage)

```typescript
function saveFavoritesToStorage(favorites: FavoriteCurrencies): void {
  try {
    // Already validated at this point, but enforce limit
    const limited = favorites.slice(0, 5);
    localStorage.setItem('currency_favorites', JSON.stringify(limited));
  } catch {
    // Silent failure if localStorage unavailable
    // Feature degrades gracefully
  }
}
```

### On Toggle

```typescript
function toggleFavorite(currencyCode: string): void {
  setError(null); // Clear any existing errors
  
  const isFav = favorites.includes(currencyCode);
  
  if (isFav) {
    // Remove from favorites
    setFavorites(prev => prev.filter(code => code !== currencyCode));
  } else {
    // Add to favorites (with limit check)
    if (favorites.length >= 5) {
      setError("Maximum 5 favorites reached. Remove a favorite to add another.");
      return;
    }
    setFavorites(prev => [...prev, currencyCode]);
  }
}
```

## Sorting Algorithm

### Sort Currencies with Favorites First

```typescript
/**
 * Sorts currencies with favorites at the top, both sections alphabetically
 * @param currencies - Full list of currencies
 * @param favorites - Array of favorited currency codes
 * @returns Sorted array with favorites first
 */
export function sortCurrenciesWithFavorites(
  currencies: Currency[],
  favorites: FavoriteCurrencies
): Currency[] {
  const favoriteCurrencies = currencies
    .filter(c => favorites.includes(c.code))
    .sort((a, b) => a.code.localeCompare(b.code));
  
  const nonFavoriteCurrencies = currencies
    .filter(c => !favorites.includes(c.code))
    .sort((a, b) => a.code.localeCompare(b.code));
  
  return [...favoriteCurrencies, ...nonFavoriteCurrencies];
}
```

**Example**:

Input:
- `currencies`: All 12 currencies (USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, INR, MXN, GEL, BYN)
- `favorites`: ["JPY", "EUR", "AUD"]

Output:
- ["AUD", "EUR", "JPY", "BYN", "CAD", "CHF", "CNY", "GBP", "GEL", "INR", "MXN", "USD"]
- (Favorites: AUD, EUR, JPY alphabetically at top)
- (Non-favorites: Rest alphabetically below)

## Performance Characteristics

### Time Complexity

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Load from localStorage | O(n) | n = number of stored favorites (max 5) |
| Save to localStorage | O(n) | n = number of favorites (max 5) |
| Check if favorite | O(n) | n = number of favorites (max 5), linear search |
| Toggle favorite | O(n) | Filter/concat operations (max 5 items) |
| Sort currencies | O(n log n) | n = 12 currencies, sorting both sections |

All operations are effectively O(1) due to small n values.

### Space Complexity

| Storage | Size | Notes |
|---------|------|-------|
| localStorage | ~50 bytes | `["USD","EUR","GBP","JPY","AUD"]` = ~30 bytes + overhead |
| In-memory state | ~40 bytes | Array of 5 strings, ~8 bytes each |
| Derived sorted array | ~1 KB | 12 Currency objects temporarily during render |

Total: Negligible memory impact.

## Data Migration

### Future Compatibility

If favorites structure needs to change in future versions:

**Current version (v1)**:
```json
["USD", "EUR", "GBP"]
```

**Potential future version (v2)** - if we add metadata:
```json
{
  "version": 2,
  "favorites": [
    {"code": "USD", "addedAt": 1703606400000},
    {"code": "EUR", "addedAt": 1703606401000}
  ]
}
```

**Migration strategy**: Detect version, migrate on first load, preserve old format as fallback.

*Note: v2 is out of scope for current spec but structure allows for future evolution.*

## Testing Data

### Test Fixtures

```typescript
// For unit tests
export const TEST_FAVORITES = {
  empty: [],
  single: ["USD"],
  multiple: ["USD", "EUR", "GBP"],
  max: ["USD", "EUR", "GBP", "JPY", "AUD"],
  invalid: ["USD", "INVALID", "EUR"], // Will be filtered
  oversized: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"], // Will be trimmed
};

// For integration tests
export const TEST_CURRENCIES_WITH_FAVORITES = sortCurrenciesWithFavorites(
  CURRENCIES,
  TEST_FAVORITES.multiple
);
```

### Edge Cases to Test

1. Empty favorites array
2. Single favorite
3. Max favorites (5)
4. Attempting to add 6th favorite
5. Invalid currency codes in localStorage
6. Oversized array (>5) in localStorage
7. Corrupted JSON in localStorage
8. localStorage unavailable (private browsing)
9. Toggling same currency rapidly (debouncing not needed but test it)
10. Swapping currencies when both are favorites

## Summary

- **Simple data model**: Array of strings, minimal storage
- **Validation**: Comprehensive checks on load and save
- **Performance**: All operations O(1) effective time due to small dataset
- **Extensibility**: Structure allows future enhancements without breaking changes
- **Testability**: Clear fixtures and edge cases defined
