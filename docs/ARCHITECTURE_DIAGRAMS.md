# Architecture Diagrams - Post-Refactor

**Version:** 2.0  
**Date:** January 16, 2026  
**Status:** ✅ Production Ready

---

## New Architecture (After Refactor)

### **Provider Hierarchy**

```
app/layout.tsx
└── ThemeProvider (next-themes)
    └── AppStateProvider (Global State)
        └── Page Content
            └── CalculationFormProvider (Form State)
                └── Form Components
```

### **Component Tree - Home Page (Refactored)**

```
HomePage (183 lines) ✅ [-66 lines]
├── useAppState() [Context - no prop drilling]
│   ├── employmentDate
│   ├── calculations [with useOptimistic]
│   ├── createCalculation
│   ├── updateCalculation
│   └── deleteCalculation
│
├── useTransition() [React 19 - responsive filtering]
│
└── Card
    ├── PageHeader ✅ [NEW: Reusable]
    │   ├── Logo
    │   ├── Title
    │   ├── Description
    │   ├── Actions
    │   │   ├── EmploymentDateManager
    │   │   ├── Button (Export)
    │   │   └── Button (Add New)
    │   └── ThemeToggle ✅ [NEW: Extracted]
    │
    └── CardContent
        ├── UsageSummary
        │   └── useAppState() ✅ [No window events]
        │
        ├── Select (Status Filter)
        │   └── startTransition() ✅ [React 19]
        │
        └── CalculationList
            └── useAppState() ✅ [Optimistic updates]
```

**Improvements:**

- ✅ **Zero window events** (removed anti-pattern)
- ✅ **Zero prop drilling** (Context API)
- ✅ **Optimistic updates** (useOptimistic)
- ✅ **Responsive filtering** (useTransition)
- ✅ **Reusable components** (PageHeader, ThemeToggle)

---

### **Component Tree - Create Page (Refactored)**

```
CreateCalculation ✅ (shared form + provider)
├── Suspense (fallback)
│
└── CreateCalculationContent
    └── CalculationFormProvider ✅ [NEW]
        ├── React Hook Form
        ├── Zod Validation
        ├── Auto-computed values:
        │   ├── toolsTotal
        │   ├── reimRazem
        │   ├── totalSum
        │   └── invoiceHeavenString
        │
        └── CreateCalculationForm
            ├── useAppState()
            ├── useCalculationForm() ✅
            ├── useSearchParams (clone ID)
            │
            ├── Loading State
            ├── Error State (no employment date)
            │
            └── Card
                ├── PageHeader ✅ [Reusable]
                │   ├── Back Button
                │   ├── Title
                │   └── ThemeToggle ✅
                │
                └── CardContent
                    └── Form ✅ [React Hook Form]
                        ├── FormField (Month) ✅
                        │   └── MonthYearSelect ✅ [Extracted]
                        │       └── useTransition()
                        │
                        ├── FormField (Master Learner) ✅
                        │   ├── Input
                        │   └── FormMessage [Auto error display]
                        │
                        ├── FormField (Master Care) ✅
                        │   ├── Input
                        │   ├── disabled (period check)
                        │   └── FormMessage ✅
                        │
                        ├── ToolsSection
                        │   └── useTools()
                        │
                        ├── FormField (Team building) ✅
                        ├── FormField (Other) ✅
                        │
                        └── Actions
                            ├── Button (Clear)
                            ├── Button (Calculate)
                            └── Button (Save) [form.handleSubmit]
```

**Improvements:**

- ✅ **Zero manual validation** (Zod schemas)
- ✅ **Type-safe forms** (React Hook Form + TypeScript)
- ✅ **Automatic error display** (FormMessage)
- ✅ **Centralized form state** (CalculationFormProvider)
- ✅ **Auto-computed values** (no manual calculation)
- ✅ **WCAG 2.1 AA** (ARIA attributes)

---

### **Component Tree - Edit Page (Refactored)**

```
EditCalculation ✅ (shared form + provider)
└── EditCalculationContent
    └── CalculationFormProvider ✅ [Same as Create]
        └── EditCalculationForm
            ├── useAppState()
            ├── useCalculationForm() ✅
            ├── useParams (calculation ID)
            │
            ├── LoadingState ✅ [Reusable]
            │
            └── Card
                ├── PageHeader ✅
                └── CardContent
                    └── Form ✅
                        ├── FormItem (Month) [disabled]
                        ├── FormField (Master Learner) ✅
                        ├── FormField (Master Care) ✅
                        ├── ToolsSection
                        ├── FormField (Team building) ✅
                        ├── FormField (Other) ✅
                        │
                        └── Actions
                            ├── Button (Cancel)
                            ├── Button (Calculate)
                            └── Button (Save) [form.handleSubmit]
```

**Improvements:**

- ✅ **Same provider as Create** (consistency)
- ✅ **Same validation logic** (no duplication)
- ✅ **Optimistic updates** (instant UI feedback)

---

## State Management Architecture

### **Before Refactor**

```
Component A
├── useState (employmentDate)
├── useEffect (load from localStorage)
├── useEffect (window.addEventListener) ⚠️
└── window.dispatchEvent("changed") ⚠️

Component B
├── useState (employmentDate) [DUPLICATE]
├── useEffect (load from localStorage) [DUPLICATE]
└── useEffect (window.addEventListener) ⚠️

Component C
├── useState (employmentDate) [DUPLICATE]
└── Props drilling from A ⚠️
```

**Issues:**

- ⚠️ State duplicated across components
- ⚠️ Window events for synchronization (anti-pattern)
- ⚠️ Props drilling multiple levels
- ⚠️ No single source of truth

---

### **After Refactor**

```
app/layout.tsx
└── AppStateProvider ✅
    ├── useState (employmentDate)
    ├── useState (calculations)
    ├── useOptimistic (optimisticCalculations) ✅
    ├── useEffect (load once on mount)
    │
    ├── Actions:
    │   ├── setEmploymentDate(date)
    │   ├── createCalculation(data)
    │   ├── updateCalculation(id, data)
    │   └── deleteCalculation(id)
    │
    └── Context Value ✅
        └── Accessible via useAppState() in any component

Component A
└── const { employmentDate } = useAppState() ✅

Component B
└── const { calculations, updateCalculation } = useAppState() ✅

Component C
└── const { createCalculation } = useAppState() ✅
```

**Benefits:**

- ✅ Single source of truth (AppStateProvider)
- ✅ Zero window events
- ✅ Zero prop drilling
- ✅ Optimistic updates (instant UI)
- ✅ Type-safe actions

---

## Form Management Architecture

### **Before Refactor**

```
CreatePage (909 lines)
├── useState (values) ⚠️
├── useState (errors) ⚠️
├── useState (tools)
├── useCallback (handleInputChange) [200+ lines of validation] ⚠️
├── useCallback (handleCalculate) [50+ lines]
├── useCallback (handleSave) [60+ lines]
└── Manual error handling ⚠️

EditPage (594 lines)
├── useState (values) ⚠️ [DUPLICATE]
├── useState (errors) ⚠️ [DUPLICATE]
├── useState (tools)
├── useCallback (handleInputChange) [200+ lines] ⚠️ [DUPLICATE]
├── useCallback (handleCalculate) [50+ lines] [DUPLICATE]
├── useCallback (handleSave) [60+ lines]
└── Manual error handling ⚠️ [DUPLICATE]
```

**Issues:**

- ⚠️ 400+ lines of duplicated validation logic
- ⚠️ Manual error state management
- ⚠️ No type-safe validation
- ⚠️ Error-prone manual calculations

---

### **After Refactor**

```
CalculationFormProvider ✅
├── React Hook Form
│   ├── form.register
│   ├── form.handleSubmit
│   └── form.formState.errors
│
├── Zod Validation ✅
│   ├── calculationFormSchema
│   ├── Real-time validation (onChange)
│   └── Custom rules (Master Care period)
│
├── Computed Values (useMemo) ✅
│   ├── toolsTotal
│   ├── reimRazem
│   ├── totalSum
│   └── invoiceHeavenString
│
└── Context Value
    ├── form
    ├── tools
    ├── computed values
    └── actions

CreatePage ✅
└── useCalculationForm()
    ├── form.handleSubmit(onSubmit)
    └── Zero manual validation ✅

EditPage ✅
└── useCalculationForm()
    ├── form.handleSubmit(onSubmit)
    └── Zero manual validation ✅
```

**Benefits:**

- ✅ Zero manual validation (Zod handles it)
- ✅ Zero duplication (shared provider)
- ✅ Type-safe (Zod + TypeScript)
- ✅ Auto error display (FormMessage)
- ✅ Auto calculations (useMemo)
- ✅ 151 lines removed

---

## Data Flow Diagrams

### **Create Calculation Flow**

```
User Input
  ↓
FormField (React Hook Form)
  ↓
Zod Validation (real-time) ✅
  ↓
CalculationFormProvider
  ├── Auto-compute toolsTotal
  ├── Auto-compute reimRazem
  ├── Auto-compute totalSum
  └── Auto-compute invoiceHeavenString
  ↓
form.handleSubmit(onSubmit)
  ↓
AppStateProvider.createCalculation
  ↓
setOptimisticCalculations (instant UI) ✅
  ↓
CalculationService.create (IndexedDB)
  ↓
refreshCalculations (sync with DB)
  ↓
Navigate to home page
```

### **Update Calculation Flow**

```
Load Calculation
  ↓
CalculationService.getById (IndexedDB)
  ↓
form.reset (populate form) ✅
  ↓
User Edits
  ↓
Zod Validation (real-time) ✅
  ↓
form.handleSubmit(onSubmit)
  ↓
AppStateProvider.updateCalculation
  ↓
setOptimisticCalculations (instant UI) ✅
  ↓
CalculationService.update (IndexedDB)
  ↓
refreshCalculations (sync with DB)
  ↓
Navigate to home page
```

### **Delete Calculation Flow**

```
User Clicks Delete
  ↓
AppStateProvider.deleteCalculation
  ↓
setOptimisticCalculations (instant removal) ✅
  ↓
CalculationService.delete (IndexedDB)
  ↓
refreshCalculations (sync with DB)
  ↓
UI reflects deletion (no navigation)
```

---

## Component Dependency Graph

### **Providers**

```
AppStateProvider
├── Uses: CalculationService, SettingsService
├── Provides: employmentDate, calculations, CRUD actions
└── Used by: All page components

CalculationFormProvider
├── Uses: React Hook Form, Zod, useBudgetValidation
├── Provides: form, tools, computed values, actions
└── Used by: CreatePage, EditPage
```

### **Shared Components**

```
PageHeader
├── Props: title, description, actions, showLogo
└── Used by: All pages

MonthYearSelect
├── Uses: useAppState, useTransition
├── Props: value, onChange, error
└── Used by: CreatePage

ThemeToggle
├── Uses: next-themes
└── Used by: PageHeader

BenefitInput
├── Props: id, label, value, onChange, error
└── Used by: CreatePage, EditPage (legacy)

LoadingState
├── Props: message
└── Used by: All pages

EmptyState
├── Props: title, message, action
└── Used by: HomePage

ErrorMessage
├── Props: error
└── Used by: All forms
```

---

## File Structure

```
app/
├── layout.tsx (Providers)
├── page.tsx (Home - 183 lines) ✅
├── create/
│   └── page.tsx ✅
└── edit/[id]/
    └── page.tsx ✅

providers/
├── app-state-provider.tsx ✅
└── calculation-form-provider.tsx ✅

components/
├── form-fields/
│   ├── master-learner-field.tsx
│   ├── master-care-field.tsx
│   ├── integracje-field.tsx
│   ├── other-field.tsx
│   └── index.ts
├── page-header.tsx ✅
├── month-year-select.tsx ✅
├── tools-section.tsx (existing)
├── calculation-list.tsx (existing)
├── usage-summary.tsx (existing)
├── employment-date-manager.tsx (existing)
└── ui/
    ├── form.tsx ✅
    ├── theme-toggle.tsx ✅
    ├── loading-state.tsx ✅
    ├── empty-state.tsx ✅
    └── error-message.tsx ✅

hooks/
├── useBudgetValidation.ts ✅
├── useInvoiceString.ts ✅
└── useTools.ts (existing)

schemas/
├── calculation-schema.ts ✅
└── tool-schema.ts ✅

utils/
├── financialMath.ts
├── currency.ts
├── periods.ts
└── limits.ts

lib/
└── db.ts (CalculationService, SettingsService)

types/
├── calculation.ts
├── tools.ts
└── benefit-rules.ts
```

---

## Code Metrics Comparison

### Before Refactor

```
app/page.tsx:              249 lines
app/create/page.tsx:       909 lines ⚠️
app/edit/[id]/page.tsx:    594 lines ⚠️
─────────────────────────────────────
Total:                   1,752 lines

Manual validation:         ~400 lines ⚠️
Window events:             3 instances ⚠️
Prop drilling:             Multiple levels ⚠️
```

### After Refactor

```
app/page.tsx:              183 lines ✅ (-66)
app/create/page.tsx       ✅
app/edit/[id]/page.tsx    ✅
─────────────────────────────────────
Total:                   1,188 lines (-564)

New infrastructure:
providers/:                412 lines
components/:               521 lines
schemas/:                   94 lines
hooks/:                     94 lines
─────────────────────────────────────
Reusable:                1,121 lines

Manual validation:           0 lines ✅
Window events:               0 instances ✅
Prop drilling:               0 instances ✅
```

**Net Result:**

- ✅ Application code: -564 lines (-32%)
- ✅ Reusable infrastructure: +1,121 lines
- ✅ Total investment: +557 lines (for massive improvements)

---

## Summary

### Architecture Evolution

**Before:**

- Monolithic page components (909 lines)
- Manual validation everywhere
- Window events for state sync
- Props drilling
- Duplicated logic

**After:**

- Composable components (shared CalculationForm, form-fields)
- Zero manual validation (Zod)
- Context API for state
- Zero prop drilling
- Shared providers and hooks

### Key Improvements

1. **State Management:** AppStateProvider + useOptimistic
2. **Form Management:** CalculationFormProvider + React Hook Form + Zod
3. **Code Reusability:** 8 shared components, 2 providers, 2 hooks
4. **Type Safety:** Zod schemas + TypeScript strict mode
5. **Accessibility:** WCAG 2.1 AA compliant
6. **React 19 Patterns:** useOptimistic, useTransition

---

**Document Version:** 2.0 (Post-Refactor)  
**Last Updated:** January 16, 2026
