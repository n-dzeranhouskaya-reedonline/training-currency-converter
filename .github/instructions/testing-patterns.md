# Unit Testing Rules & Patterns - Lyrics Printer

## Overview

This project follows comprehensive unit testing strategy with 9 test files covering utilities, components, and API routes. Every component and utility function has corresponding tests.

---

## Testing Setup & Configuration

### Jest Configuration
- **Environment**: `jest-environment-jsdom` (for React components)
- **Test Pattern**: `**/?(*.)+(spec|test).[jt]s?(x)`
- **Module Mapping**: `@/*` paths supported
- **Coverage**: Collected from `app/`, `components/`, `utils/`

### Running Tests
```bash
npm test              # Run all tests once
npm run test:watch   # Watch mode (re-run on file changes)
npm run test:coverage # Generate coverage report
```

### Test Setup Files
- `jest.setup.js` - Imports `@testing-library/jest-dom` for extended matchers
- `jest.config.js` - Module mappers and environment configuration

---

## File Organization

### Test File Naming & Location
```
ComponentName.tsx       → ComponentName.test.tsx     (same folder)
utils/helper.ts         → utils/helper.test.ts       (same folder)
app/api/route/route.ts  → app/api/route/route.test.ts (same folder)
```

**Rule**: Test files live alongside source files, not in separate `__tests__` directories

---

## Utility Function Testing Pattern

### 1. Pure Function Tests (No Mocking)

**File**: [utils/validation.test.ts](utils/validation.test.ts)

**Pattern**:
```typescript
describe('Module Name', () => {
  describe('functionName', () => {
    it('should return correct value for valid input', () => {
      const result = validateArtist('Queen');
      expect(result).toBeNull(); // Valid input returns null
    });

    it('should return error for invalid input', () => {
      const result = validateArtist('');
      expect(result).not.toBeNull();
      expect(result?.field).toBe('artist');
      expect(result?.message).toContain('required');
    });

    it('should handle edge cases', () => {
      expect(validateArtist('A'.repeat(101))).not.toBeNull();
    });
  });
});
```

**Key Patterns**:
- **Validation functions return `ValidationError | null`** - test both cases
- **Test boundary conditions** - empty strings, max length, min length
- **Check error messages contain expected text** - use `.toContain()`
- **Group related tests in nested describe blocks**

### 2. Utility Tests with Async Operations

**File**: [utils/api.test.ts](utils/api.test.ts)

**Pattern**:
```typescript
describe('timeout', () => {
  it('should resolve when promise completes before timeout', async () => {
    const promise = Promise.resolve('success');
    const result = await timeout(promise, 1000);
    expect(result).toBe('success');
  });

  it('should reject when promise takes too long', async () => {
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('too slow'), 2000);
    });
    
    await expect(timeout(slowPromise, 100)).rejects.toThrow('Request timeout');
  });
});
```

**Key Patterns**:
- **Use `async/await` in test functions**
- **Test both success and timeout paths**
- **Use `rejects` matcher for rejected promises**
- **Use `resolves` matcher for resolved promises** (when needed)

### 3. localStorage Mocking Pattern

**File**: [utils/storage.test.ts](utils/storage.test.ts)

**Pattern**:
```typescript
// Mock localStorage ONCE at module level
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorage.clear(); // Reset before each test
  });

  it('should return empty array when no history exists', () => {
    expect(getSearchHistory()).toEqual([]);
  });

  it('should handle corrupted data gracefully', () => {
    localStorage.setItem('lyrics_search_history', 'invalid json');
    expect(getSearchHistory()).toEqual([]);
  });
});
```

**Key Patterns**:
- **Create localStorage mock once at module level**
- **Reset with `beforeEach(() => localStorage.clear())`**
- **Test graceful error handling** (JSON.parse errors)
- **Test actual storage key names**

---

## Component Testing Pattern

### 1. Simple Presentational Components

**File**: [components/LyricsDisplay.test.tsx](components/LyricsDisplay.test.tsx)

**Pattern**:
```typescript
import { render, screen } from '@testing-library/react';
import LyricsDisplay from './LyricsDisplay';
import { LyricsResponse } from '@/types';
import '@testing-library/jest-dom';

describe('LyricsDisplay Component', () => {
  const mockLyrics: LyricsResponse = {
    artist: 'Queen',
    title: 'Bohemian Rhapsody',
    lyrics: 'Is this the real life?',
    source: 'Lyrics.ovh',
  };

  it('should render nothing when lyrics is null', () => {
    const { container } = render(<LyricsDisplay lyrics={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display song title', () => {
    render(<LyricsDisplay lyrics={mockLyrics} />);
    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();
  });

  it('should preserve line breaks in lyrics', () => {
    render(<LyricsDisplay lyrics={mockLyrics} />);
    const lyricsElement = screen.getByText(/Is this the real life/);
    expect(lyricsElement.tagName).toBe('PRE');
  });
});
```

**Key Patterns**:
- **Import `@testing-library/jest-dom` in component tests**
- **Create mock data objects at describe level** (reusable in tests)
- **Test null/empty cases** - component should gracefully handle missing data
- **Use `screen.getByText()`, `screen.getByRole()`** for queries
- **Test element properties** (className, tagName, etc.)

### 2. Interactive Components with Event Handlers

**File**: [components/Button.test.tsx](components/Button.test.tsx)

**Pattern**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not fire click event when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply correct variant styles', () => {
    render(<Button variant="danger">Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button.className).toContain('bg-red-600');
  });
});
```

**Key Patterns**:
- **Mock event callbacks with `jest.fn()`**
- **Use `fireEvent.click()` for user interactions**
- **Test both positive and negative cases** (enabled/disabled, different variants)
- **Verify CSS classes with `toContain()` instead of exact match**
- **Test visual states** (loading, disabled, variant styles)

### 3. Form Components with Validation

**File**: [components/Input.test.tsx](components/Input.test.tsx)

**Pattern**:
```typescript
describe('Input Component', () => {
  const defaultProps = {
    id: 'test-input',
    name: 'testName',
    value: '',
    onChange: jest.fn(),
    label: 'Test Label',
  };

  it('should display error message', () => {
    render(<Input {...defaultProps} error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should apply error styles when error exists', () => {
    render(<Input {...defaultProps} error="Error message" />);
    const input = screen.getByLabelText('Test Label');
    expect(input.className).toContain('border-red-500');
  });

  it('should call onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<Input {...defaultProps} onChange={handleChange} />);
    
    const input = screen.getByLabelText('Test Label');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
```

**Key Patterns**:
- **Define `defaultProps` object** for reusable test setup
- **Test error state and error styling separately**
- **Test form interaction** (onChange, onBlur, etc.)
- **Query by label text** when possible for accessibility testing

### 4. Components with Callbacks (SearchHistory)

**File**: [components/SearchHistory.test.tsx](components/SearchHistory.test.tsx)

**Pattern**:
```typescript
describe('SearchHistory Component', () => {
  const mockHistory: SearchHistory[] = [
    {
      id: '1',
      artist: 'Queen',
      title: 'Bohemian Rhapsody',
      timestamp: Date.now() - 1000 * 60 * 5,
    },
  ];

  it('should call onSelect when history item is clicked', () => {
    const handleSelect = jest.fn();
    render(
      <SearchHistoryComponent 
        history={mockHistory} 
        onSelect={handleSelect} 
        onClear={jest.fn()} 
      />
    );
    
    fireEvent.click(screen.getByText('Bohemian Rhapsody'));
    expect(handleSelect).toHaveBeenCalledWith('Queen', 'Bohemian Rhapsody');
  });

  it('should render nothing when history is empty', () => {
    const { container } = render(
      <SearchHistoryComponent history={[]} onSelect={jest.fn()} onClear={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });
});
```

**Key Patterns**:
- **Mock multiple callbacks** - pass `jest.fn()` for unused handlers
- **Verify callback parameters** - `toHaveBeenCalledWith(arg1, arg2)`
- **Test conditional rendering** - component should be null/empty for empty data
- **Test relative timestamps** - verify formatted time strings like "5m ago"

---

## API Route Testing Pattern

**File**: [app/api/lyrics/route.test.ts](app/api/lyrics/route.test.ts)

### 1. Mock Next.js Modules

```typescript
// IMPORTANT: Mock Next.js BEFORE imports
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    public nextUrl: { searchParams: URLSearchParams };
    constructor(url: string | URL) {
      const urlObj = typeof url === 'string' ? new URL(url) : url;
      this.nextUrl = { searchParams: urlObj.searchParams };
    }
  },
  NextResponse: {
    json: (data: any, options?: { status?: number }) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    })
  }
}));

// Mock global fetch
global.fetch = jest.fn();

// Silence console during tests
global.console.log = jest.fn();
global.console.error = jest.fn();

import { GET } from './route';
```

### 2. Test Invalid Requests

```typescript
describe('Lyrics API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it('should return 400 when artist is missing', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/lyrics?title=Hey%20Jude')
    );

    const response = await GET(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('INVALID_REQUEST');
  });
});
```

**Key Patterns**:
- **Mock Next.js before any imports** - must be first in test file
- **Create NextRequest with full URL** - includes query params
- **Check response status code**
- **Test error response structure** - `{ error: string, message?: string }`
- **Use `beforeEach` to clear all mocks** - prevents test pollution

### 3. Test Successful API Calls

```typescript
it('should return 200 with lyrics when successful', async () => {
  // Mock successful fetch response
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ lyrics: 'Hey Jude, don\'t make it bad' }),
  });

  const request = new NextRequest(
    new URL('http://localhost:3000/api/lyrics?artist=The%20Beatles&title=Hey%20Jude')
  );

  const response = await GET(request);
  expect(response.status).toBe(200);
  
  const data = await response.json();
  expect(data.artist).toBe('The Beatles');
  expect(data.lyrics).toBeDefined();
});
```

**Key Patterns**:
- **Mock fetch with `mockResolvedValueOnce`** - for one-time success responses
- **Test response includes expected fields** - artist, title, lyrics, source
- **Verify data transformations** - values should match request

### 4. Test Fallback Behavior

```typescript
it('should return demo content when all sources fail', async () => {
  // Mock all API calls to fail
  (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

  const request = new NextRequest(
    new URL('http://localhost:3000/api/lyrics?artist=Unknown&title=Unknown')
  );

  const response = await GET(request);
  expect(response.status).toBe(200);
  
  const data = await response.json();
  expect(data.source).toBe('Demo Mode');
  expect(data.lyrics).toContain('[Demo Mode - External APIs unavailable]');
});
```

**Key Patterns**:
- **Mock failed responses with `mockRejectedValue`**
- **Test graceful fallback** - should return demo content instead of error
- **Verify fallback response structure** - should match success response shape

---

## Testing Best Practices

### ✅ Do's

1. **Name tests descriptively** - "should return error when artist is missing" (not "test error")
2. **Test one thing per test** - Don't test multiple behaviors in one `it` block
3. **Use meaningful variable names** - `mockLyrics`, `handleSelect`, not `data`, `fn`
4. **Group related tests** - Use nested `describe()` blocks for organization
5. **Reset mocks between tests** - Use `beforeEach()` with `jest.clearAllMocks()`
6. **Test edge cases** - Empty strings, null values, max/min bounds
7. **Test accessibility** - Use `getByLabelText`, `getByRole` instead of `getByTestId`
8. **Mock external dependencies** - APIs, localStorage, Date.now() when needed
9. **Use snapshot tests sparingly** - Only for stable components or generated output
10. **Import jest-dom** - Need `.toBeInTheDocument()` in component tests

### ❌ Don'ts

1. **Don't test implementation details** - Test behavior, not how component renders
2. **Don't skip error cases** - Test both success and failure paths
3. **Don't use generic test names** - Avoid "should work", "should render"
4. **Don't test external APIs directly** - Always mock external calls
5. **Don't forget `beforeEach` for setup/cleanup** - Can cause test pollution
6. **Don't use `getByTestId` as primary query** - Accessibility-first queries
7. **Don't skip type safety** - Mock data should match types
8. **Don't leave console logs** - Use `jest.fn()` to mock console
9. **Don't test styling with exact selectors** - Use `.toContain()` for classes
10. **Don't create component instances multiple times** - Reuse defaultProps

---

## Common Testing Utilities

### React Testing Library Imports
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Adds matchers like toBeInTheDocument()
```

### Query Methods (in order of preference)
```typescript
// 1. Accessibility queries (preferred)
screen.getByRole('button')           // By ARIA role
screen.getByLabelText('Artist')      // By label text
screen.getByText('Click me')         // By text content

// 2. Semantic queries
screen.getByDisplayValue('value')    // Input value
screen.getByPlaceholderText('...')   // Placeholder

// 3. Last resort (test ID)
screen.getByTestId('custom-id')      // Only if others don't work
```

### Jest Matchers
```typescript
// Truthiness
expect(result).toBeNull()
expect(result).not.toBeNull()
expect(value).toBeTruthy()
expect(value).toBeFalsy()

// Equality
expect(result).toBe('exact value')
expect(result).toEqual({ key: 'value' })
expect(result).toContain('substring')

// Arrays
expect(array).toHaveLength(5)
expect(array).toEqual([1, 2, 3])

// Functions
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledTimes(2)
expect(fn).toHaveBeenCalledWith('arg1', 'arg2')

// Promises
await expect(promise).resolves.toBe('value')
await expect(promise).rejects.toThrow('error')

// DOM (needs @testing-library/jest-dom)
expect(element).toBeInTheDocument()
expect(element).toBeDisabled()
expect(element).toHaveClass('className')
```

---

## Coverage Requirements

The project uses Jest coverage reporting:
```bash
npm run test:coverage
```

Coverage is collected from:
- `app/**/*.{js,jsx,ts,tsx}`
- `components/**/*.{js,jsx,ts,tsx}`
- `utils/**/*.{js,jsx,ts,tsx}`

**Excluded**:
- Type definition files (`.d.ts`)
- node_modules
- .next directory
- coverage directory

---

## Test Execution Flow

```
npm test / npm run test:watch
    ↓
jest reads jest.config.js
    ↓
jest.setup.js runs (imports jest-dom)
    ↓
Test files found matching **/*.test.{ts,tsx}
    ↓
Each test file executes:
  - Module-level setup (mocks, constants)
  - describe() blocks organize tests
  - beforeEach() runs before each it()
  - afterEach() runs after each it()
  - Test assertions checked
    ↓
Coverage report generated
```

---

## Quick Reference: Test File Template

### Utility Test
```typescript
import { myFunction } from './myFile';

describe('Module Name', () => {
  describe('myFunction', () => {
    it('should handle valid input', () => {
      expect(myFunction('valid')).toBe(expected);
    });

    it('should handle invalid input', () => {
      expect(myFunction('invalid')).toEqual({ error: true });
    });
  });
});
```

### Component Test
```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';
import '@testing-library/jest-dom';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('expected')).toBeInTheDocument();
  });
});
```

### API Route Test
```typescript
jest.mock('next/server', () => ({ /* ... */ }));
global.fetch = jest.fn();

import { GET } from './route';

describe('API Route', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 200', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const request = new NextRequest(new URL('http://localhost:3000/api/test'));
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});
```

