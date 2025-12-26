---
agent: agent
---

# Unit Test Generation Prompt

Write comprehensive unit tests for the file: `<FILENAME>`.

## Requirements
- Use Jest and React Testing Library (for React components)
- Place the test file next to the source file, named `<Component>.test.tsx` or `<util>.test.ts`
- Cover all main logic branches, edge cases, and error handling
- For components: test rendering, user interaction, error states, and accessibility
- For utilities: test valid/invalid input, edge cases, and error messages
- For API routes: mock fetch, test all response branches, and error handling
- Use accessibility-first queries (`getByRole`, `getByLabelText`, `getByText`)
- Mock external dependencies (fetch, localStorage, etc.) as needed
- Use `beforeEach` for setup/cleanup
- Use `@testing-library/jest-dom` matchers
- Return `ValidationError | null` for validation utilities
- Do not test implementation details—test behavior and output
- **DO NOT test CSS classes directly** (e.g., `toHaveClass('bg-white', 'text-red-500')`). CSS classes are implementation details. Test visual behavior through accessibility queries and user interactions instead
  - **Exception**: If a component accepts `className` as a prop, you MUST test that it applies the custom class correctly:
	```typescript
	// ✅ Good: Testing className prop (public API)
	it('should apply custom className', () => {
		const { container } = setup({ className: 'custom-class' });
		expect(container.firstChild).toHaveClass('custom-class');
	});
	
	// ❌ Bad: Testing internal CSS classes
	it('should have correct default styles', () => {
		const { container } = setup();
		expect(container.firstChild).toHaveClass('bg-white', 'rounded-lg', 'p-4');
	});
	```
  - **Exception**: If a prop changes the component's CSS classes (e.g., `variant`, `size`, `disabled`), you MUST test that different prop values result in different classes:
	```typescript
	// ✅ Good: Testing variant prop affects styling (public API)
	test.each([
		{ variant: 'primary', expectedClass: 'bg-blue-500' },
		{ variant: 'secondary', expectedClass: 'bg-gray-500' },
		{ variant: 'danger', expectedClass: 'bg-red-500' },
	])('should apply $expectedClass for variant=$variant', ({ variant, expectedClass }) => {
		const { container } = setup({ variant });
		expect(container.firstChild).toHaveClass(expectedClass);
	});
	
	// ❌ Bad: Testing all internal classes
	it('should apply all default classes', () => {
		const { container } = setup();
		expect(container.firstChild).toHaveClass('px-4', 'py-2', 'rounded', 'font-medium');
	});
	```
- If you use mocks (jest.fn, jest.spyOn, etc.), always clear and restore them in `afterEach`:
	```typescript
	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});
	```
- If you need to mock a function (e.g., `useRouter`), define the mock value in `beforeEach`:
	```typescript
	const useRouter = jest.spyOn(require('next/router'), 'useRouter');
	describe('test for component', () => {
		beforeEach(() => {
			useRouter.mockReturnValue({});
		});
		// ...
	});
	```
- If you use the `render` method from React Testing Library, wrap it in a `setup` function for reuse:
	```typescript
	describe('MyComponent', () => {
		const setup = (props) => render(<MyComponent {...props} />);
		
		it('should render with default props', () => {
			setup();
			expect(screen.getByText('...')).toBeInTheDocument();
		});
		
		it('should handle user interaction', () => {
			setup();
			// ...interaction and assertion...
		});
		// ...
	});
	```
- Prefer `test.each` for similar test cases with different input data:
	```typescript
	test.each([
		{ input: 'valid@email.com', expected: null },
		{ input: 'invalid', expected: { field: 'email', message: 'Invalid email' } },
		{ input: '', expected: { field: 'email', message: 'Email is required' } },
	])('should validate email: $input', ({ input, expected }) => {
		expect(validateEmail(input)).toEqual(expected);
	});
	```
- Always use `test.each` when multiple tests check the same behavior with different data. If you have 2+ tests that differ only in input/output values, combine them:
	```typescript
	// ❌ Bad: Multiple separate tests for same behavior
	it('should call onSelect with first item', () => {
		fireEvent.click(screen.getByText('Item 1'));
		expect(onSelect).toHaveBeenCalledWith('data1');
	});
	it('should call onSelect with second item', () => {
		fireEvent.click(screen.getByText('Item 2'));
		expect(onSelect).toHaveBeenCalledWith('data2');
	});
	
	// ✅ Good: Use test.each
	test.each([
		{ title: 'Item 1', expectedData: 'data1' },
		{ title: 'Item 2', expectedData: 'data2' },
	])('should call onSelect when clicking $title', ({ title, expectedData }) => {
		fireEvent.click(screen.getByText(title));
		expect(onSelect).toHaveBeenCalledWith(expectedData);
	});
	```
- **CRITICAL**: If you have multiple `test.each` blocks testing the SAME function/behavior, consolidate them into ONE `test.each` block. Do NOT create separate `test.each` blocks for semantic grouping (e.g., "minutes", "hours", "days"):
	```typescript
	// ❌ Bad: Multiple test.each blocks for same behavior (date formatting)
	describe('Date Formatting', () => {
		test.each([
			{ timestamp: Date.now() - 1000 * 60 * 1, expected: '1m ago' },
			{ timestamp: Date.now() - 1000 * 60 * 30, expected: '30m ago' },
		])('should display "$expected" for minutes', ({ timestamp, expected }) => {
			// test logic
		});
		
		test.each([
			{ timestamp: Date.now() - 1000 * 60 * 60 * 1, expected: '1h ago' },
			{ timestamp: Date.now() - 1000 * 60 * 60 * 12, expected: '12h ago' },
		])('should display "$expected" for hours', ({ timestamp, expected }) => {
			// SAME test logic
		});
	});
	
	// ✅ Good: Single test.each with all cases
	describe('Date Formatting', () => {
		test.each([
			// Minutes
			{ timestamp: Date.now() - 1000 * 60 * 1, expected: '1m ago' },
			{ timestamp: Date.now() - 1000 * 60 * 30, expected: '30m ago' },
			// Hours
			{ timestamp: Date.now() - 1000 * 60 * 60 * 1, expected: '1h ago' },
			{ timestamp: Date.now() - 1000 * 60 * 60 * 12, expected: '12h ago' },
			// Days
			{ timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1, expected: '1d ago' },
		])('should display "$expected" for timestamp $timestamp', ({ timestamp, expected }) => {
			// Single test logic for all cases
		});
	});
	```
- For Rendering tests, group related element checks into a single test instead of multiple small tests:
	```typescript
	describe('Rendering', () => {
		it('should render nothing when history is empty', () => {
			const { container } = setup({ history: [] });
			expect(container.firstChild).toBeNull();
		});
		
		it('should render all main elements', () => {
			setup();
			// Check all primary elements in one test
			expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
			expect(screen.getByText('Content')).toBeInTheDocument();
		});
	});
	```

## Success Criteria
- All tests pass (`npm test`)
- Coverage is maximized for the file
- Follows the structure and style of existing tests (see `Button.test.tsx`, `validation.test.ts`, etc.)

## Example Structure
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';
import '@testing-library/jest-dom';

describe('MyComponent', () => {
	it('should render with default props', () => {
		render(<MyComponent />);
		expect(screen.getByText('...')).toBeInTheDocument();
	});

	it('should handle user interaction', () => {
		// ...interaction and assertion...
	});

	// ...more tests...
});
```