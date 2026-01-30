# Invoice Heaven Calculator - Technical Description

**Last Updated:** January 16, 2026  
**Status:** ✅ Production - Post-Refactor Architecture  
**Version:** 2.0 (Major Refactor Complete)

---

## Overview

A Next.js-based web application for calculating and formatting employee reimbursement data for the InvoiceHeaven invoicing system. The application features modern React 19 patterns, type-safe validation with Zod, centralized state management, and a fully accessible UI compliant with WCAG 2.1 AA.

**Key Features:**

- Real-time form validation with instant feedback
- Multi-currency tools management with PLN conversion
- Calculation history with optimistic UI updates
- Accumulated benefit limit tracking
- Dark/Light/System theme support
- Offline-first with IndexedDB persistence

---

## Technology Stack

### Core Framework

- **Next.js 16.1** (App Router)
  - React 19.2 with Server Components
  - Client components marked with `"use client"` directive
  - TypeScript 5.7.3 strict mode enabled
  - React Compiler enabled (`reactCompiler: true`)

### State Management

- **React Context API**
  - `AppStateProvider` - Global state (employment date, calculations)
  - `CalculationFormProvider` - Form state with React Hook Form
- **React 19 Hooks**
  - `useOptimistic` - Instant UI updates for CRUD operations
  - `useTransition` - Responsive month/year selection
  - `useState`, `useEffect`, `useCallback`, `useMemo`
- **IndexedDB** (via `idb` 8.0.3)
  - `CalculationService` - Calculation CRUD operations
  - `SettingsService` - Employment date persistence

### Form Management (✅ Fully Integrated)

- **React Hook Form 7.70.0**
  - Form state management
  - Real-time validation (onChange mode)
  - Type-safe form values
  - Automatic error display
- **Zod 4.3.5**
  - Runtime type validation
  - Schema-based validation
  - Custom validation rules (Master Care period restriction)
- **@hookform/resolvers 5.2.2**
  - zodResolver for RHF + Zod integration

### UI & Styling

- **Tailwind CSS 4.1.18** (v4 with `@theme` directive)
  - CSS variables for theming (HSL color system)
  - Responsive breakpoints (sm, md, lg, xl)
  - `tailwindcss-animate` for animations
  - `tailwind-merge` + `clsx` for conditional classes
- **base-ui** (component library)
  - Radix UI primitives (Dialog, Select, Tooltip, Label)
  - WCAG 2.1 AA compliant
  - Keyboard navigation support
  - Form components with ARIA attributes

### Theming

- **next-themes 0.4.6**
  - Light/Dark/System theme support
  - Theme persistence via localStorage
  - SSR-safe with `suppressHydrationWarning`
  - Seamless theme switching

### Utilities

- **lucide-react 0.562.0** (icon library)
  - Consistent iconography
  - Tree-shakeable

---

## Architecture Overview

### 1. Global State Management

**File:** `providers/app-state-provider.tsx` (186 lines)

```typescript
interface AppState {
  // Employment Date
  employmentDate: EmploymentDate | null;
  setEmploymentDate: (date: EmploymentDate | null) => Promise<ActionResult>;
  isEmploymentDateLoading: boolean;

  // Calculations
  calculations: Calculation[];
  isCalculationsLoading: boolean;
  refreshCalculations: () => Promise<void>;

  // CRUD Actions
  createCalculation: (data: CalculationInput) => Promise<ActionResult>;
  updateCalculation: (
    id: string,
    data: Partial<CalculationInput>,
  ) => Promise<ActionResult>;
  deleteCalculation: (id: string) => Promise<ActionResult>;
}
```

**Key Features:**

- ✅ `useOptimistic` for instant UI updates
- ✅ Zero prop drilling
- ✅ Type-safe ActionResult interface
- ✅ Automatic error handling

**Usage:**

```typescript
const { employmentDate, calculations, createCalculation } = useAppState();
```

---

### 2. Form State Management

**File:** `providers/calculation-form-provider.tsx` (~276 lines)

```typescript
interface CalculationFormContext {
  tools: Tool[];
  setTools: (tools: Tool[]) => void;
  toolsTotal: number;
  reimRazem: number;
  totalSum: number;
  invoiceHeavenString: string;
  budgetValidation: ReturnType<typeof useBudgetValidation> | null;
  resetForm: () => void;
  loadClonedData: (calculationId: string) => Promise<void>;
}
```

Form state is provided via React Hook Form’s `FormProvider`; consumers use `useFormContext<CalculationFormData>()` to access the form instance.

**Key Features:**

- ✅ React Hook Form integration (FormProvider + useFormContext)
- ✅ Zod validation with zodResolver (schema built via createCalculationFormSchema(employmentDate))
- ✅ Auto-computed values (totals, strings)
- ✅ Budget validation hook integration
- ✅ Reusable across create/edit pages

**Usage:**

```typescript
// Create page: no props
<CalculationFormProvider>
  <MyForm />
</CalculationFormProvider>;

// Edit page: pass id so tools are not loaded from localStorage
<CalculationFormProvider editingCalculationId={id}>
  <MyForm />
</CalculationFormProvider>;

const { totalSum, invoiceHeavenString } = useCalculationForm();
const form = useFormContext<CalculationFormData>();
```

---

### 3. Validation

#### Zod Schemas

**File:** `schemas/calculation-schema.ts` (~212 lines)

The form provider uses `createCalculationFormSchema(employmentDate)` so Master Learner limits respect employment date. Base schema is `baseCalculationFormSchema`; refinements handle settlement months and ML/MC limits.

```typescript
// Provider builds schema with employment context
const schema = createCalculationFormSchema(employmentDate);

// Base shape: month, masterLearner, masterCare, budzet, integracje, inne, tools, status (optional)
// superRefine: settlement months, ML bi-monthly/annual limits from benefit rules
```

**File:** `schemas/tool-schema.ts` (26 lines)

```typescript
export const toolSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  amount: z.coerce.number().min(0).max(999999),
  currency: z.enum(["PLN", "USD", "EUR", "GBP"]),
  exchangeRate: z.coerce.number().min(0.01).max(1000),
});
```

#### Budget Validation Hook

**File:** `hooks/useBudgetValidation.ts`

```typescript
export function useBudgetValidation(
  selectedMonth: string,
  employmentDate: EmploymentDate | null,
  calculations: Calculation[],
  values: BudgetValidationInput,
  editingCalculationId?: string, // Exclude this calculation from accumulated usage when editing
): BudgetValidationResult {
  // Validates ML/MC/Team building against accumulated limits
  // Returns validation results with error messages
}
```

**Features:**

- ✅ Master Learner annual limit validation
- ✅ Master Care bi-monthly period limit validation
- ✅ Team building quarterly limit validation
- ✅ Real-time accumulated usage tracking

---

### 4. Component Architecture

```
app/
  ├── layout.tsx                  # Root layout with providers
  ├── page.tsx                    # Home page (calculation history)
  ├── create/
  │   └── page.tsx                # Create calculation form
  └── edit/[id]/
      └── page.tsx                # Edit calculation form

providers/
  ├── app-state-provider.tsx      # Global state
  └── calculation-form-provider.tsx  # Form state

components/
  ├── form-fields/                # Form field components
  │   ├── master-learner-field.tsx
  │   ├── master-care-field.tsx
  │   ├── integracje-field.tsx
  │   ├── other-field.tsx
  │   └── index.ts
  ├── page-header.tsx             # Reusable page header
  ├── month-year-select.tsx       # Month/year selector with constraints
  ├── tools-section.tsx           # Tools management UI
  ├── calculation-list.tsx        # Calculation history list
  ├── usage-summary.tsx           # Budget usage indicators (props: calculations, employmentDate)
  ├── employment-date-manager.tsx # Employment date picker
  └── ui/
      ├── form.tsx                # base-ui form components
      ├── theme-toggle.tsx        # Theme switcher
      ├── loading-state.tsx       # Loading indicator
      ├── empty-state.tsx         # Empty state placeholder
      └── error-message.tsx       # Error display

hooks/
  ├── useBudgetValidation.ts      # Budget limit validation
  ├── useInvoiceString.ts         # Invoice string generation
  └── useTools.ts                 # Tools state management (if used)

schemas/
  ├── calculation-schema.ts       # Calculation form validation
  └── tool-schema.ts              # Tool validation

utils/
  ├── money.ts                    # Financial arithmetic (addMoney, multiplyMoney)
  ├── currency.ts                 # Currency formatting
  ├── periods.ts                  # Period/date utilities
  └── limits.ts                   # Benefit limit calculations

lib/
  └── db.ts                       # IndexedDB services

types/
  ├── calculation.ts              # Calculation types
  ├── tools.ts                    # Tool types
  └── benefit-rules.ts            # Benefit rules types
```

---

## Design Patterns

### 1. Provider Pattern

**Usage:** Centralized state management without prop drilling

```typescript
// app/layout.tsx
<AppStateProvider>
  {children}
</AppStateProvider>

// app/create/page.tsx
<CalculationFormProvider>
  <CreateForm />
</CalculationFormProvider>

// app/edit/[id]/page.tsx
<CalculationFormProvider editingCalculationId={id}>
  <EditForm />
</CalculationFormProvider>
```

### 2. React 19 Optimistic Updates

**Usage:** Instant UI feedback for CRUD operations

```typescript
const [optimisticCalculations, setOptimisticCalculations] = useOptimistic(
  calculations,
  (state, optimisticValue: Calculation[]) => optimisticValue,
);

// Update optimistically
setOptimisticCalculations(updatedList);
await CalculationService.update(id, data);
// Automatically reverts on error
```

### 3. React 19 Transitions

**Usage:** Responsive UI during non-urgent updates

```typescript
const [isPending, startTransition] = useTransition();

const handleMonthChange = (newMonth: string) => {
  startTransition(() => {
    setMonth(newMonth);
  });
};
```

### 4. Form Composition with RHF

**Usage:** Declarative form building with automatic validation

```typescript
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="masterLearner"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Master Learner</FormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### 5. Financial Math Pattern

**Usage:** Money arithmetic in `utils/money.ts` (e.g. `addMoney`, `multiplyMoney`) to keep calculations consistent.

---

## Data Flow

### Create Calculation Flow

```
User Input
  ↓
FormField (RHF)
  ↓
Zod Validation (real-time)
  ↓
CalculationFormProvider (computed values)
  ↓
form.handleSubmit(onSubmit)
  ↓
AppStateProvider.createCalculation
  ↓
useOptimistic (instant UI update)
  ↓
CalculationService.create (IndexedDB)
  ↓
refreshCalculations (sync with DB)
  ↓
Navigate to home page
```

### Update Calculation Flow

```
Load Calculation (IndexedDB)
  ↓
form.reset (populate form)
  ↓
User Edits
  ↓
Real-time Validation (Zod)
  ↓
form.handleSubmit(onSubmit)
  ↓
AppStateProvider.updateCalculation
  ↓
useOptimistic (instant UI update)
  ↓
CalculationService.update (IndexedDB)
  ↓
refreshCalculations (sync with DB)
  ↓
Navigate to home page
```

### Delete Calculation Flow

```
User Clicks Delete
  ↓
AppStateProvider.deleteCalculation
  ↓
useOptimistic (instant UI removal)
  ↓
CalculationService.delete (IndexedDB)
  ↓
refreshCalculations (sync with DB)
  ↓
UI reflects deletion (no navigation)
```

---

## Key Improvements from Refactor

### Before Refactor (v1.x)

- ❌ Manual validation (200+ lines per page)
- ❌ Window events for state sync
- ❌ Prop drilling across components
- ❌ Duplicated form logic
- ❌ No type-safe validation

**Code Stats:**

- `app/create/page.tsx`: 909 lines
- `app/edit/[id]/page.tsx`: 594 lines

### After Refactor (v2.0)

- ✅ Zod validation (zero manual logic)
- ✅ Context providers (zero window events)
- ✅ Centralized state (zero prop drilling)
- ✅ Shared form provider (zero duplication)
- ✅ Type-safe validation with Zod

**Code Stats (post-refactor; current line counts may vary):**

- Create and edit pages are significantly smaller; shared logic lives in CalculationForm, form-fields, and providers.
- **Net Result:** Less duplication, reusable form infrastructure.

---

## Performance Optimizations

### 1. React Compiler

- **Enabled:** `reactCompiler: true` in `next.config.ts`
- **Benefit:** Automatic memoization of components and hooks
- **Impact:** Reduces need for manual `useCallback` and `useMemo`

### 2. Optimistic Updates

- **Pattern:** `useOptimistic` for instant UI feedback
- **Benefit:** Perceived performance improvement
- **Impact:** Users see changes immediately, no waiting for DB writes

### 3. Transitions

- **Pattern:** `useTransition` for non-urgent updates
- **Benefit:** Keeps UI responsive during heavy operations
- **Impact:** Month/year selection feels smooth even with complex validation

### 4. IndexedDB

- **Storage:** Client-side persistence with idb
- **Benefit:** No network requests, instant data access
- **Impact:** Works offline, faster than server roundtrips

---

## Accessibility (WCAG 2.1 AA)

### Implemented Features

1. **Keyboard Navigation**
   - All interactive elements accessible via keyboard
   - Logical tab order
   - Focus indicators visible

2. **Screen Reader Support**
   - ARIA labels on form fields
   - ARIA-describedby for error messages
   - ARIA-invalid for validation states
   - Semantic HTML elements

3. **Color Contrast**
   - All text meets AA contrast ratios
   - Error states use sufficient contrast
   - Dark mode maintains accessibility

4. **Form Validation**
   - Error messages announced to screen readers
   - Validation states indicated with ARIA attributes
   - Helper text provides guidance

5. **Responsive Design**
   - Works on mobile, tablet, desktop
   - Touch-friendly targets (min 44x44px)
   - Readable text sizes

---

## Security Considerations

### 1. Client-Side Only

- **Status:** No server-side API
- **Impact:** No authentication/authorization needed
- **Risk:** Data stored locally in IndexedDB (user-specific)

### 2. XSS Prevention

- **Protection:** React's automatic escaping
- **Risk:** Low (no user-generated content rendered as HTML)

### 3. Data Privacy

- **Storage:** IndexedDB (local to user's browser)
- **Impact:** No data leaves the user's device
- **Compliance:** GDPR-friendly (no data collection)

---

## Browser Compatibility

### Supported Browsers

- **Chrome/Edge:** 120+ (full support)
- **Firefox:** 115+ (full support)
- **Safari:** 17+ (full support)

### Required APIs

- IndexedDB (for data persistence)
- localStorage (for theme + tools)
- Crypto API (for UUID generation)
- Intl.NumberFormat (for currency formatting)

### Graceful Degradation

- **Theme:** Falls back to light mode if localStorage unavailable
- **Tools:** Falls back to session state if localStorage unavailable
- **IndexedDB:** Shows error if unavailable (rare)

---

## Future Enhancements

### 1. Testing Infrastructure (P2)

- Install Vitest + React Testing Library
- Unit tests for providers and hooks
- Integration tests for forms
- **Effort:** 3-4 days

### 2. Suspense Boundaries (P3)

- Refactor data fetching to use `use()` hook
- Add `<Suspense>` boundaries
- Remove manual loading states
- **Effort:** 1-2 days

### 3. PWA Support (P4)

- Add service worker for offline support
- Add app manifest for installability
- **Effort:** 1-2 days

### 4. Export/Import (P4)

- JSON export of calculations
- Import from backup file
- **Effort:** 1-2 days

---

## References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [base-ui](https://base-ui.com/)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=a%2Caaa)

---

**Document Version:** 2.0 (Post-Refactor)  
**Last Updated:** January 16, 2026  
**Maintainer:** Development Team
