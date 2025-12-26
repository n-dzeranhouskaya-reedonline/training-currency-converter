# Implementation Plan: Favorite Currencies

**Branch**: `001-favorite-currencies` | **Date**: 2025-12-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-favorite-currencies/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add favorite currencies feature allowing users to mark up to 5 currencies as favorites. Favorites appear at the top of currency selector dropdowns, persist in localStorage, and provide visual indicators (star icons) for favorited state. Technical approach: Create custom React hook `useFavoriteCurrencies` for state management, extend existing `CurrencySelect` component with star icon buttons, implement localStorage utilities in `utils/favorites.ts`, and ensure full keyboard accessibility and WCAG 2.1 AA compliance.

## Technical Context

**Language/Version**: TypeScript 5.3.3 with strict mode enabled  
**Primary Dependencies**: Next.js 14.2.0, React 18.3.0, Tailwind CSS 3.4.1  
**Storage**: Browser localStorage (key: `currency_favorites`)  
**Testing**: Jest 30.2.0 + React Testing Library 16.3.0 + jest-axe 10.0.0  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) with localStorage support
**Project Type**: Next.js 14 web application (App Router with client-side components)  
**Performance Goals**: <100ms for favorite toggle, <50ms localStorage read/write, <100ms selector reordering  
**Constraints**: Max 5 favorites, graceful degradation without localStorage, no external state management libraries  
**Scale/Scope**: Single-feature addition to existing currency converter (~200 LOC, 3 new files, 2 modified components)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **Code Quality**: TypeScript strict mode enabled, no unjustified `any` types - All new code will use strict TypeScript types
- [x] **Testing**: ≥90% coverage plan documented, co-located test files planned - Test files planned for all new components/hooks/utilities
- [x] **Accessibility**: WCAG 2.1 AA requirements documented (semantic HTML, ARIA, keyboard nav) - Star buttons with aria-labels, keyboard support, focus indicators
- [x] **Educational Clarity**: Patterns follow established conventions in `.github/copilot-instructions.md` - Using existing patterns (co-located tests, barrel exports, custom hooks)
- [x] **Next.js 14 Practices**: App Router structure, proper client directives, API route caching - Client-side feature, no API routes needed
- [x] **Anti-patterns avoided**: No external state libs, no API route errors, no `pages/` directory - Using React hooks only, no new dependencies

**Violations requiring justification**: None

### Source Code (repository root)

```text
components/
├── CurrencySelect.tsx         # MODIFY: Add star icon buttons for favoriting
├── CurrencySelect.test.tsx    # MODIFY: Add tests for favorite toggling
├── FavoriteButton.tsx         # NEW: Reusable star icon button component
├── FavoriteButton.test.tsx    # NEW: Tests for FavoriteButton
├── index.ts                   # MODIFY: Export new FavoriteButton component

hooks/
├── useFavoriteCurrencies.ts   # NEW: Custom hook for favorites state management
├── useFavoriteCurrencies.test.ts  # NEW: Tests for favorites hook
├── index.ts                   # MODIFY: Export new hook

utils/
├── favorites.ts               # NEW: localStorage utilities for favorites
├── favorites.test.ts          # NEW: Tests for favorites utilities
├── currency.ts                # MODIFY: Add utility to sort currencies with favorites first

types/
├── index.ts                   # MODIFY: Add FavoriteCurrency types
```

**Structure Decision**: This is a Next.js 14 web application using App Router. All components are in `components/` directory with co-located tests. Custom hooks go in `hooks/` directory. Utility functions in `utils/` directory. Following existing project structure - no backend/frontend split, no separate src/ directory.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution requirements are met.
