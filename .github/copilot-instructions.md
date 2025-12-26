# AI Coding Agent Instructions

## Project Overview

This is a **Next.js 14 training curriculum** for learning AI-assisted development. The repository contains a fully-functional currency converter app that serves as the foundation for 8 progressive challenges (see [docs/challenges.md](../docs/challenges.md)). Each branch contains a completed challenge solution for comparison.

**Key Point**: This is primarily an educational project. Solutions should follow the established patterns and prioritize clarity over optimization.

## Architecture

### Client-Side Architecture (CSR Pattern)
- **Entry Point**: [app/page.tsx](../app/page.tsx) — Client component (`'use client'`) that orchestrates the entire UI
- **State Management**: Two custom hooks manage all state:
  - `useExchangeRates`: Fetches rates from `/api/rates`, handles loading/error states
  - `useConverter`: Manages conversion logic, URL sync, validation, and localStorage history
- **URL Persistence**: All conversions sync to URL params (`?amount=100&from=USD&to=EUR`) via Next.js router
- **Component Structure**: Atomic components in [components/](../components/) export through barrel file [components/index.ts](../components/index.ts)

### API Layer
- **Single Endpoint**: [app/api/rates/route.ts](../app/api/rates/route.ts) — Next.js Route Handler with:
  - External API fetch with 10s timeout
  - Automatic fallback to mock data on failure (see `MOCK_RATES` constant)
  - 1-hour cache via `revalidate: 3600`
  - Currently uses frankfurter.app API exclusively

### Data Flow
```
User Input → useConverter hook → URL update → validateAmount() → 
convertCurrency() → saveConversion() → localStorage → update history UI
```

## Critical Development Patterns

### Testing Standards (Jest + RTL)
- **Test Files**: Co-located `*.test.tsx` next to source files
- **Setup**: [jest.setup.ts](../jest.setup.ts) mocks:
  - `next/navigation` (router, searchParams, pathname)
  - `window.matchMedia` for responsive tests
  - `localStorage` with in-memory mock
- **API Tests**: Use `@jest-environment node` directive (see [app/api/rates/route.test.ts](../app/api/rates/route.test.ts#L1-L3))
- **Component Tests**: Always render with full props object, clear mocks in `beforeEach`
- **Run Commands**: 
  - `npm test` — Single run
  - `npm run test:watch` — Watch mode
  - `npm run test:coverage` — Coverage report

### Validation & Error Handling
- **Input Validation**: [utils/currency.ts#validateAmount()](../utils/currency.ts) returns `{ isValid, error }` object
- **Display Errors**: Use `<ErrorMessage message={error} />` component (auto-hides when null)
- **API Fallback**: Never throw on API failure — always return mock rates (dev/testing resilience)

### State Management Conventions
- **No External Libraries**: Pure React hooks (useState, useEffect, useCallback)
- **URL as Source of Truth**: Initialize state from `searchParams`, sync on change
- **History Management**: Max 10 items in localStorage via [utils/storage.ts](../utils/storage.ts)
- **Auto-Conversion**: No submit button — `useEffect` triggers conversion on amount/currency change

### Next.js Specific
- **Config**: `reactStrictMode: false` in [next.config.js](../next.config.js) to prevent double API calls
- **Import Aliases**: Use `@/` prefix (e.g., `import { CURRENCIES } from '@/utils/currency'`)
- **App Router**: All routes in `app/` directory, no `pages/` directory

## File Structure Conventions

```
components/
  ├── ComponentName.tsx          # Implementation
  ├── ComponentName.test.tsx     # Tests co-located
  └── index.ts                   # Barrel exports

hooks/
  ├── useHookName.ts
  └── useHookName.test.ts

utils/
  ├── utility.ts
  └── utility.test.ts

app/
  ├── page.tsx                   # Main client component
  └── api/routes/route.ts        # API endpoints
```

## Common Workflows

### Adding a New Component
1. Create `components/NewComponent.tsx` with TypeScript interface for props
2. Add to barrel: `export { default as NewComponent } from './NewComponent';`
3. Import via: `import { NewComponent } from '@/components';`
4. Create `components/NewComponent.test.tsx` with RTL tests
5. Run tests: `npm test NewComponent.test.tsx`

### Adding/Modifying Currencies
- Edit `CURRENCIES` array in [utils/currency.ts](../utils/currency.ts)
- Ensure API mock includes the new currency in [app/api/rates/route.ts](../app/api/rates/route.ts) `MOCK_RATES`
- Update tests with new currency codes

### Debugging API Issues
- API always returns mock data as fallback (see [app/api/rates/route.ts#L89-L91](../app/api/rates/route.ts))
- Check browser DevTools → Network tab for `/api/rates` response
- Verify cache headers: `Cache-Control: public, s-maxage=3600`
- Test API independently: `curl http://localhost:3000/api/rates`

### Running the Application
```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm start            # Run production build
npm run lint         # ESLint check
npm test             # Run all tests
```

## Challenge-Specific Guidance

This project is structured around **8 training challenges** (see [docs/challenges.md](../docs/challenges.md)). When working on challenges:

1. **Read Challenge Docs First**: Each challenge in `docs/*.md` has specific requirements
2. **Branch Structure**: Checkout challenge branches (`customisation`, `unit-test`, `bug-fix`, etc.) to see solutions
3. **Training Focus**: Prioritize educational clarity over production patterns
4. **Reference Guide**: See [docs/copilot-reference.md](../docs/copilot-reference.md) for Copilot best practices

## Anti-Patterns to Avoid

❌ **Don't** add external state management (Redux, Zustand) — use built-in hooks  
❌ **Don't** create API routes for static data — use constants in utils  
❌ **Don't** throw errors in API routes — always return fallback mock data  
❌ **Don't** add form submission handlers — conversions are automatic  
❌ **Don't** mock components in tests — test real component integration  
❌ **Don't** use `pages/` directory — this project uses App Router only

## Questions to Ask When Uncertain

- Is this for a training challenge? Check the specific challenge doc first
- Does this pattern exist elsewhere in the codebase? Search for similar implementations
- Should this component be client or server? (Hint: Most are client due to state/hooks)
- Does this need a test? (Yes, if it's a component/hook/utility function)
- Should the API throw an error? (No, use fallback mock data)
