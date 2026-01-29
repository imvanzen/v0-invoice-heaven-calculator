# Form Refactoring Documentation

## Overview

The calculation forms (create and edit) have been refactored to eliminate code duplication, improve maintainability, and follow React best practices with proper separation of concerns.

## Architecture

### Component Structure

```
components/
├── form-fields/              # Individual form field components
│   ├── master-learner-field.tsx
│   ├── master-care-field.tsx
│   ├── integracje-field.tsx
│   ├── budget-field.tsx
│   ├── other-field.tsx
│   └── index.ts
├── calculation-form.tsx      # Shared form component
├── tools-section.tsx         # Existing tools component
└── month-year-select.tsx     # Existing month selector

app/
├── create/
│   └── page.tsx             # Create page (client component)
└── edit/
    └── [id]/
        └── page.tsx         # Edit page (client component)
```

## Key Changes

### 1. Field Components

Each form field is now a self-contained component with its own logic:

- **MasterLearnerField**: Handles Master Learner input with accumulated limit validation display
- **MasterCareField**: Handles Master Care input with settlement month restrictions and validation
- **IntegrationField**: Handles integrations input with quarterly limit validation
- **BudgetField**: Simple budget input field
- **OtherField**: Simple other expenses input field

**Benefits:**

- Single responsibility principle
- Easy to test in isolation
- Reusable across different contexts
- Encapsulated validation logic and UI

### 2. Shared Form Component

`CalculationForm` component consolidates all common form logic:

**Props Interface:**

```typescript
interface CalculationFormProps {
  mode: "create" | "edit";
  onSubmit: (data: CalculationFormData) => Promise<void>;
  saving: boolean;
  monthError?: string;
  lockedMonth?: string; // For edit mode
  onCancel?: () => void;
}
```

**Responsibilities:**

- Form layout and structure
- Calculate dialog management
- Copy to clipboard functionality
- Budget validation checks
- Conditional rendering based on mode (create/edit)

### 3. Page Components

Both create and edit pages are now much simpler:

**Create Page (`app/create/page.tsx`):**

- Handles employment date check
- Manages month uniqueness validation
- Loads cloned data if applicable
- Provides onSubmit handler

**Edit Page (`app/edit/[id]/page.tsx`):**

- Loads existing calculation
- Manages cancel confirmation dialog
- Provides onSubmit handler

## Data Flow

```
Page Component (create/edit)
    ↓
CalculationFormProvider (context)
    ↓
CalculationForm (shared UI)
    ↓
Individual Field Components
    ↓
useFormContext (React Hook Form)
    ↓
useCalculationForm (custom hook)
```

## Validation Strategy

### 1. Zod Schema Validation

- Handled by `zodResolver` in the form provider
- Validates field types, ranges, and Master Care settlement months
- Runs automatically on form submission

### 2. Budget Validation

- Handled by `useBudgetValidation` hook
- Calculates accumulated limits across all calculations
- Displayed inline in field components
- Checked before submission in shared form

### 3. Month Uniqueness (Create Only)

- Async validation in create page
- Checks database for existing calculations
- Prevents duplicate month entries

## Benefits of This Architecture

1. **Reduced Duplication**: ~800 lines of duplicated code eliminated
2. **Better Maintainability**: Changes to field logic only need to be made once
3. **Improved Testability**: Each component can be tested independently
4. **Clearer Separation of Concerns**: Each component has a single, well-defined responsibility
5. **Easier to Extend**: Adding new fields or modifying existing ones is straightforward
6. **Better Developer Experience**: Smaller, focused components are easier to understand

## Server vs Client Components

Currently, all form-related components are client components (`"use client"`) because they:

- Use React hooks (useState, useEffect, useCallback)
- Handle user interactions
- Access form context
- Manage local state

The app directory structure is maintained for future optimization opportunities where static content could be separated.

## Future Improvements

1. **Extract Dialog Components**: Create reusable dialog components for calculate output and cancel confirmation
2. **Validation Display Component**: Create a reusable component for limit validation display
3. **Form Actions**: Consider using Next.js 14 Server Actions for form submission
4. **Error Boundary**: Add error boundaries around form components
5. **Loading States**: Improve loading state handling with Suspense boundaries
6. **Accessibility**: Add ARIA labels and improve keyboard navigation

## Migration Notes

- All existing functionality has been preserved
- No changes to the database schema or API
- Form validation behavior remains the same
- UI/UX is identical to previous implementation
