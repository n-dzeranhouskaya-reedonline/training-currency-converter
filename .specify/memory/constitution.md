<!--
  SYNC IMPACT REPORT:
  Version change: none → 1.0.0 (Initial constitution)
  Modified principles: none (initial creation)
  Added sections: All sections created from template
  Removed sections: none
  Templates status:
    ✅ Updated: plan-template.md (gates align with principles)
    ✅ Updated: spec-template.md (scope/requirements align)
    ✅ Updated: tasks-template.md (task categorization aligns)
  Follow-up TODOs: None
-->

# Currency Converter Training Project Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

All code MUST be:
- **Type-safe**: TypeScript with strict mode enabled; no `any` types unless explicitly justified
- **Component-based**: Atomic design with single responsibility; components in `components/` directory
- **Maintainable**: Co-located tests (`*.test.tsx`), clear naming conventions, documented edge cases
- **Error-resistant**: Comprehensive validation (`validateAmount`), graceful fallbacks (API → mock data), user-friendly error messages

**Rationale**: This is an educational project where code quality demonstrates best practices to learners. Poor quality undermines the training mission.

### II. Testing Standards (NON-NEGOTIABLE)

Testing is MANDATORY with these requirements:
- **80% minimum coverage**: Run `npm run test:coverage` to verify; all new features MUST maintain or improve coverage
- **Co-located tests**: Every component/hook/utility MUST have a corresponding `.test.tsx` file in the same directory
- **Testing tools**: Jest + React Testing Library; `@testing-library/jest-dom` for assertions
- **Test types**:
  - Unit tests for all utilities (`utils/currency.ts`, `utils/storage.ts`)
  - Component tests with full props rendering (no partial mocks)
  - Integration tests for hooks (`useConverter`, `useExchangeRates`)
  - API tests with `@jest-environment node` directive

**Rationale**: Training curriculum requires demonstrable test coverage. Learners must see and practice proper testing techniques.

### III. Accessibility Standards (NON-NEGOTIABLE)

All UI MUST comply with **WCAG 2.1 Level AA**:
- **Semantic HTML**: Proper heading hierarchy, `<button>` for actions, `<label>` for inputs
- **ARIA attributes**: `aria-label` on icon buttons, `role` on interactive elements
- **Keyboard navigation**: All interactive elements accessible via Tab, Enter, Space
- **Color contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus indicators**: Visible focus rings using Tailwind's `focus:ring-2 focus:ring-blue-500`
- **Screen reader support**: Descriptive labels, error announcements, meaningful alt text

**Testing**: Use `jest-axe` for automated accessibility testing in component tests.

**Rationale**: Accessibility is a professional requirement. Training must instill inclusive design habits from the start.

### IV. Educational Clarity

Code prioritizes learning over optimization:
- **Explicit over implicit**: Clear variable names, documented hooks, verbose error messages
- **Pattern consistency**: Established patterns MUST be followed (see `.github/copilot-instructions.md`)
- **No external state libraries**: Pure React hooks (useState, useEffect, useCallback) for transparency
- **Documented decisions**: Comments explain "why" for non-obvious logic

**Rationale**: This is a training curriculum. Code serves as reference material for AI-assisted development patterns.

### V. Next.js 14 Best Practices

Framework-specific requirements:
- **App Router only**: No `pages/` directory; all routes in `app/`
- **Client components**: Use `'use client'` directive for state/hooks (see `app/page.tsx`)
- **API Routes**: Next.js Route Handlers in `app/api/` with proper caching (`revalidate: 3600`)
- **Import aliases**: Use `@/` prefix for workspace imports
- **No strict mode**: `reactStrictMode: false` in `next.config.js` to prevent double API calls

**Rationale**: Demonstrates Next.js 14 patterns correctly for learners replicating this architecture.

## Testing Requirements

### Coverage Standards

- **Overall coverage**: MUST maintain ≥80% across all metrics (statements, branches, functions, lines)
- **New features**: MUST achieve ≥90% coverage before PR approval
- **Critical paths**: 100% coverage required for:
  - Validation logic (`utils/currency.ts`)
  - API routes (`app/api/rates/route.ts`)
  - Core hooks (`useConverter`, `useExchangeRates`)

### Test Quality Gates

All tests MUST:
1. **Pass consistently**: No flaky tests; retry logic only for known external dependencies
2. **Run in CI**: `npm run test:ci` MUST pass on all PRs
3. **Cover edge cases**: Empty inputs, boundary values, error states, null/undefined handling
4. **Assert meaningfully**: Verify behavior, not implementation details
5. **Clear mocks**: All mocks reset in `beforeEach` (see `jest.setup.ts`)

## Development Workflow

### Branching Strategy

- **main**: Stable branch with complete features
- **Challenge branches**: `customisation`, `unit-test`, `bug-fix`, `feature`, `agent-issue`, `spec-kit` (reference solutions)
- **Feature branches**: Checkout from appropriate base, use descriptive names

### Code Review Requirements

Before merge, verify:
1. ✅ All tests pass (`npm test`)
2. ✅ Coverage ≥80% (`npm run test:coverage`)
3. ✅ TypeScript compiles (`npm run build`)
4. ✅ Linting passes (`npm run lint`)
5. ✅ Accessibility tests pass (jest-axe assertions)
6. ✅ Manual testing on desktop and mobile viewports
7. ✅ No `console.error` or `console.warn` in production code

### Anti-Patterns (Explicitly Forbidden)

❌ External state management libraries (Redux, Zustand)
❌ Throwing errors in API routes (use fallback mock data)
❌ Form submission handlers (conversions are automatic)
❌ Mocking entire components in tests (test real integration)
❌ Using `pages/` directory (App Router only)
❌ `any` types without justification comment

## Governance

This constitution supersedes all other practices. AI coding agents and developers MUST:
- Verify compliance before implementing features
- Justify any complexity or deviations in PR descriptions
- Reference `.github/copilot-instructions.md` for runtime development guidance
- Update tests when modifying functionality (no orphaned tests)

### Amendment Procedure

1. Propose amendment with rationale and migration plan
2. Document version bump (MAJOR for breaking changes, MINOR for additions, PATCH for clarifications)
3. Update dependent templates and documentation
4. Obtain approval from project maintainers
5. Update this file with new version and amendment date

### Compliance Review

Constitution violations are categorized as:
- **Blocking**: Prevents PR merge (testing coverage, accessibility failures, TypeScript errors)
- **Advisory**: Requires justification (external dependencies, pattern deviations)
- **Informational**: Best practice suggestions (code organization, naming)

**Version**: 1.0.0 | **Ratified**: 2025-12-26 | **Last Amended**: 2025-12-26
