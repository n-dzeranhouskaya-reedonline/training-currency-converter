# Component Contracts: Favorite Currencies

**Feature**: Favorite Currencies  
**Date**: 2025-12-26  
**Purpose**: Document component interfaces, props, and behaviors

## Component Interfaces

### 1. FavoriteButton Component

**File**: `components/FavoriteButton.tsx`

**Purpose**: Reusable star icon button for toggling favorite status

**Props**:

```typescript
interface FavoriteButtonProps {
  /** Currency code to favorite/unfavorite (e.g., "USD") */
  currencyCode: string;
  
  /** Whether this currency is currently favorited */
  isFavorite: boolean;
  
  /** Callback when user toggles favorite status */
  onToggle: (currencyCode: string) => void;
  
  /** Optional: Disable button (e.g., when max favorites reached) */
  disabled?: boolean;
}
```

**Return**: JSX.Element (button with star icon)

**Behavior**:
- Renders filled star icon when `isFavorite === true`
- Renders outlined star icon when `isFavorite === false`
- Calls `onToggle(currencyCode)` on click
- Uses semantic `<button>` element
- Provides dynamic `aria-label` based on favorite status
- Keyboard accessible (Tab, Space, Enter)
- Shows focus indicator on focus
- Disabled styling when `disabled === true`

**Accessibility**:
- `aria-label`: "Mark {code} as favorite" or "Remove {code} from favorites"
- `role`: "button" (implicit from `<button>` element)
- Focus visible: `focus:ring-2 focus:ring-blue-500`
- Color contrast: 4.5:1 minimum for star icons

**Example Usage**:

```tsx
<FavoriteButton
  currencyCode="USD"
  isFavorite={favorites.includes("USD")}
  onToggle={handleToggleFavorite}
  disabled={favorites.length >= 5 && !isFavorite}
/>
```

---

### 2. CurrencySelect Component (Modified)

**File**: `components/CurrencySelect.tsx`

**New Props Added**:

```typescript
interface CurrencySelectProps {
  // ... existing props (label, value, onChange, currencies, etc.)
  
  /** Array of favorited currency codes */
  favorites?: string[];
  
  /** Callback when user toggles favorite for a currency */
  onFavoriteToggle?: (currencyCode: string) => void;
  
  /** Error message for favorite operations (e.g., max limit reached) */
  favoriteError?: string | null;
}
```

**Behavior Changes**:
- Sorts currencies with favorites at top (if `favorites` prop provided)
- Renders `<FavoriteButton>` next to each currency in dropdown
- Passes `onFavoriteToggle` to each `<FavoriteButton>`
- Displays `favoriteError` below select dropdown if present
- Maintains all existing functionality (selection, validation, etc.)

**Example Usage**:

```tsx
<CurrencySelect
  label="From"
  value={fromCurrency}
  onChange={setFromCurrency}
  currencies={CURRENCIES}
  favorites={favorites}
  onFavoriteToggle={toggleFavorite}
  favoriteError={favoriteError}
/>
```

---

### 3. useFavoriteCurrencies Hook

**File**: `hooks/useFavoriteCurrencies.ts`

**Purpose**: Manage favorite currencies state and localStorage persistence

**Interface**:

```typescript
function useFavoriteCurrencies(): UseFavoriteCurrenciesResult

interface UseFavoriteCurrenciesResult {
  /** Array of favorited currency codes */
  favorites: FavoriteCurrencies;
  
  /** Check if a currency is favorited */
  isFavorite: (currencyCode: string) => boolean;
  
  /** Toggle favorite status for a currency */
  toggleFavorite: (currencyCode: string) => void;
  
  /** Check if user can add more favorites (< 5) */
  canAddFavorite: () => boolean;
  
  /** Current error message (null if no error) */
  error: string | null;
  
  /** Clear current error message */
  clearError: () => void;
}
```

**Behavior**:
- Loads favorites from localStorage on mount
- Saves favorites to localStorage whenever array changes
- Enforces 5-favorite maximum limit
- Validates currency codes against CURRENCIES list
- Provides error messages for limit violations
- Handles localStorage unavailability gracefully

**Side Effects**:
- Reads from `localStorage['currency_favorites']` on mount
- Writes to `localStorage['currency_favorites']` on favorites change

**Example Usage**:

```tsx
function ConverterForm() {
  const {
    favorites,
    toggleFavorite,
    error: favoriteError,
    clearError,
  } = useFavoriteCurrencies();
  
  return (
    <CurrencySelect
      favorites={favorites}
      onFavoriteToggle={toggleFavorite}
      favoriteError={favoriteError}
      // ... other props
    />
  );
}
```

---

## Utility Functions

### sortCurrenciesWithFavorites

**File**: `utils/currency.ts`

**Purpose**: Sort currencies with favorites at top, both sections alphabetically

**Signature**:

```typescript
function sortCurrenciesWithFavorites(
  currencies: Currency[],
  favorites: FavoriteCurrencies
): Currency[]
```

**Parameters**:
- `currencies`: Full array of Currency objects
- `favorites`: Array of favorited currency codes

**Returns**: New sorted array with favorites first, non-favorites after, both alphabetical

**Example**:

```typescript
const sorted = sortCurrenciesWithFavorites(
  CURRENCIES,
  ["JPY", "EUR", "AUD"]
);
// Result: [AUD, EUR, JPY, ...rest alphabetically]
```

---

### loadFavoritesFromStorage

**File**: `utils/favorites.ts`

**Purpose**: Load and validate favorites from localStorage

**Signature**:

```typescript
function loadFavoritesFromStorage(): FavoriteCurrencies
```

**Returns**: Array of valid currency codes (empty array if none/error)

**Behavior**:
- Reads from `localStorage['currency_favorites']`
- Parses JSON
- Validates each code against CURRENCIES list
- Filters out invalid codes
- Enforces max 5 limit
- Returns empty array if localStorage unavailable or corrupted

---

### saveFavoritesToStorage

**File**: `utils/favorites.ts`

**Purpose**: Save favorites to localStorage

**Signature**:

```typescript
function saveFavoritesToStorage(favorites: FavoriteCurrencies): void
```

**Parameters**:
- `favorites`: Array of currency codes to save

**Behavior**:
- Enforces max 5 limit
- Serializes to JSON
- Writes to `localStorage['currency_favorites']`
- Silently fails if localStorage unavailable (graceful degradation)

---

### checkLocalStorageAvailable

**File**: `utils/favorites.ts`

**Purpose**: Detect if localStorage is available

**Signature**:

```typescript
function checkLocalStorageAvailable(): boolean
```

**Returns**: `true` if localStorage is available and writable, `false` otherwise

**Behavior**:
- Attempts test write to localStorage
- Returns `false` in private browsing mode, disabled storage, etc.
- Used internally by hook to determine if persistence is possible

---

## Error Contracts

### Error Messages

| Scenario | Message | Type |
|----------|---------|------|
| Max favorites reached | "Maximum 5 favorites reached. Remove a favorite to add another." | User error (validation) |
| localStorage unavailable | null (silent degradation) | System error (graceful) |
| Invalid currency code | null (filtered on load) | Data error (corrected) |

**Error Display**:
- Shown via `<ErrorMessage>` component (already exists)
- Automatically cleared after 5 seconds (optional enhancement)
- Cleared when user successfully toggles a different favorite

---

## Type Contracts

**File**: `types/index.ts`

```typescript
/** Array of favorited currency codes */
export type FavoriteCurrencies = string[];

/** Currency with favorite status flag */
export interface CurrencyWithFavoriteStatus extends Currency {
  isFavorite: boolean;
}

/** Hook return interface */
export interface UseFavoriteCurrenciesResult {
  favorites: FavoriteCurrencies;
  isFavorite: (currencyCode: string) => boolean;
  toggleFavorite: (currencyCode: string) => void;
  canAddFavorite: () => boolean;
  error: string | null;
  clearError: () => void;
}

/** Component prop interfaces */
export interface FavoriteButtonProps {
  currencyCode: string;
  isFavorite: boolean;
  onToggle: (currencyCode: string) => void;
  disabled?: boolean;
}
```

---

## Testing Contracts

### Test Requirements

Each component/hook/utility MUST have co-located tests verifying:

**FavoriteButton.test.tsx**:
- ✅ Renders filled star when `isFavorite === true`
- ✅ Renders outlined star when `isFavorite === false`
- ✅ Calls `onToggle` with correct currency code on click
- ✅ Shows correct aria-label based on favorite status
- ✅ Keyboard accessible (Space, Enter trigger onToggle)
- ✅ Focus indicator visible
- ✅ jest-axe accessibility assertions pass
- ✅ Disabled state prevents click

**CurrencySelect.test.tsx** (additions):
- ✅ Sorts currencies with favorites first
- ✅ Renders FavoriteButton for each currency
- ✅ Calls onFavoriteToggle when star clicked
- ✅ Displays favoriteError message if present

**useFavoriteCurrencies.test.ts**:
- ✅ Loads favorites from localStorage on mount
- ✅ Saves favorites to localStorage on change
- ✅ Enforces 5-favorite limit
- ✅ Shows error when limit exceeded
- ✅ Filters invalid currency codes on load
- ✅ Handles localStorage unavailability
- ✅ toggleFavorite adds/removes correctly
- ✅ isFavorite returns correct boolean
- ✅ canAddFavorite returns correct boolean

**favorites.test.ts**:
- ✅ loadFavoritesFromStorage validates and filters
- ✅ saveFavoritesToStorage writes correctly
- ✅ checkLocalStorageAvailable detects availability
- ✅ Handles corrupted JSON gracefully
- ✅ Enforces max 5 limit on load and save

**currency.test.ts** (additions):
- ✅ sortCurrenciesWithFavorites sorts correctly
- ✅ Favorites appear first alphabetically
- ✅ Non-favorites appear after alphabetically
- ✅ Empty favorites array handled
- ✅ All favorites in list handled

---

## Integration Points

### Existing Components to Modify

1. **app/page.tsx**:
   ```typescript
   // Add hook
   const {
     favorites,
     toggleFavorite,
     error: favoriteError,
   } = useFavoriteCurrencies();
   
   // Pass to CurrencySelect components
   <CurrencySelect
     favorites={favorites}
     onFavoriteToggle={toggleFavorite}
     favoriteError={favoriteError}
     // ... other props
   />
   ```

2. **components/index.ts**:
   ```typescript
   export { default as FavoriteButton } from './FavoriteButton';
   ```

3. **hooks/index.ts**:
   ```typescript
   export { default as useFavoriteCurrencies } from './useFavoriteCurrencies';
   ```

---

## Contract Validation

All contracts MUST:
- ✅ Have TypeScript interfaces defined
- ✅ Include comprehensive JSDoc comments
- ✅ Follow existing project patterns
- ✅ Be covered by ≥90% test coverage
- ✅ Pass jest-axe accessibility tests
- ✅ Be documented in this file
