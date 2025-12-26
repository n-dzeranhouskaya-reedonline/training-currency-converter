# Currency Converter Bug Fixing Prompt (Interactive Workflow)

This prompt provides a **three-stage interactive workflow** for fixing bugs in the Currency Converter application:
1. **Stage 1: Gather Information** - Collect problem description and context
2. **Stage 2: Create Plan** - Analyze and propose a fix plan for approval
3. **Stage 3: Execute Fix** - Implement, test, and validate after approval

---

## Stage 1: Gather Information

**Start here when encountering a bug. Ask the user for:**

1. **Problem Description** (Required)
   - What is the issue you're experiencing?
   - What did you expect to happen?
   - What actually happened instead?

2. **Reproduction Steps** (Required)
   - What specific actions trigger the bug?
   - Are there particular input values or conditions that cause it?

3. **Context** (Required)
   - Does the issue occur in development or production?
   - What browser/environment are you using?
   - Any error messages in browser console or terminal?
   - When did this start happening? (After a specific change or update?)

4. **Additional Information** (Optional)
   - Have you tried any workarounds?
   - Does it affect multiple currencies or specific ones?
   - Is it related to URL parameters, API calls, or UI rendering?

**Output after gathering information:**
- Summarize the problem clearly
- Note any patterns or affected areas
- Ask for clarification on any missing details
- **Move to Stage 2 once you have complete context**

---

## Stage 2: Create & Propose Fix Plan

**After understanding the bug, create a detailed plan:**

### Analysis Phase

1. **Reproduce & Identify**
   - Analyze which component or hook is likely involved (AmountInput, CurrencySelect, SwapButton, ConversionResult, useExchangeRates, or useConverter)
   - Check URL parameters as most state is stored in URL
   - Review browser console and logs for errors

2. **Trace Root Cause**
   - Trace the data flow: API → hooks → components
   - Check URL sync logic in `useConverter` hook
   - Review API fallback chain in [app/api/rates/route.ts](app/api/rates/route.ts) if API-related
   - Verify type definitions in `/types/` folder match implementation
   - Check for Common Bug Patterns (see reference section below)

### Fix Plan Structure

Present the plan with:

1. **Root Cause** - Explain what's causing the bug
2. **Affected Files** - List all files that will be modified
3. **Implementation Approach** - Describe changes:
   - Code changes needed (with file paths)
   - Why these changes fix the issue
   - Patterns being maintained
4. **Test Strategy** - Outline:
   - Which tests need updating
   - New test cases for edge cases
   - Manual testing steps
5. **Risk Assessment** - Any potential side effects?

### Present Plan for Approval

Format the plan clearly and ask:
> **Ready to proceed with this plan? Please review and confirm before I implement the fix.**

**Wait for explicit approval before moving to Stage 3.**

---

## Stage 3: Execute Fix (After Approval)

**Only proceed after user approves the plan.**

### 3.1 Implement Changes

- Apply code changes to identified files
- Maintain existing patterns for URL state, component structure, and hook composition
- Preserve type safety - ensure TypeScript types are properly maintained
- Keep components focused - don't add mixed responsibilities
- Maintain API fallback strategy for reliability

### 3.2 Update & Run Tests

```bash
npm run test
```

- Update affected tests to reflect changes while maintaining coverage
- Add new tests for specific edge cases that caused the bug
- Verify all tests pass:

```bash
npm run test:watch -- --testPathPattern=FileName
```

### 3.3 Validate in Browser

```bash
npm run dev
```

Then at http://localhost:3000:

- Test in browser with the original problem scenario
- Check responsive layout on mobile and desktop views
- Verify currency conversion works correctly with different inputs
- Test error states by forcing API failures or invalid inputs
- Validate URL state by refreshing the page with URL parameters

### 3.4 Summary Report

Provide a concise explanation of:

1. **Root Cause** - What was causing the bug?
2. **Implementation Changes** - What was fixed and why?
3. **Test Modifications** - What tests were added/updated?
4. **UI Validation** - What was verified in the browser?

---

## Reference: Common Bug Patterns

1. **Conversion calculation errors** - Check decimal handling and currency rate application
2. **URL sync issues** - Verify URL parameters are updated and read correctly
3. **API fallback failures** - Ensure multiple API sources are properly tried
4. **Input validation** - Confirm amount validation provides proper user feedback
5. **Component rendering issues** - Check conditional rendering logic in components

---

## Key Points for Planning

- **Maintain patterns** - Follow existing patterns for URL state, component structure, and hook composition
- **Preserve type safety** - Ensure TypeScript types are properly maintained
- **Keep components focused** - Don't add mixed responsibilities
- **Maintain API fallback strategy** - Reliability is critical