# Invoice String & Dialog Refactoring

## Overview

Extracted the calculation dialog into a separate component and consolidated the invoice string generation logic into a reusable hook with a template pattern.

## Changes Made

### 1. Created `useInvoiceString` Hook

**Location:** `hooks/useInvoiceString.ts`

A centralized hook for generating Invoice Heaven formatted strings using a template pattern.

#### Template Structure

```typescript
const INVOICE_TEMPLATE = {
  separator: ";",
  fields: [
    { key: "ML", getValue: (p) => formatMoney(p.masterLearner) },
    { key: "MC", getValue: (p) => formatMoney(p.masterCare) },
    { key: "REIM.RAZEM", getValue: (p) => formatMoney(p.reimRazem) },
    { key: "narzędzia", getValue: (p) => formatMoney(p.toolsTotal) },
    { key: "budżet na dojazdy i noclegi", getValue: (p) => formatMoney(p.budzet) },
    { key: "integracje", getValue: (p) => formatMoney(p.integracje) },
    { key: "inne", getValue: (p) => formatMoney(p.inne) },
  ],
};
```

#### Benefits

1. **Single Source of Truth**: Template defined once, used everywhere
2. **Easy to Modify**: Change field order or add/remove fields in one place
3. **Type Safe**: TypeScript ensures all required params are provided
4. **Testable**: Pure function that can be unit tested
5. **Consistent Formatting**: Uses `formatMoney` utility for all values

#### API

```typescript
// Hook (memoized)
const invoiceString = useInvoiceString({
  masterLearner: 3000,
  masterCare: 750,
  toolsTotal: 500,
  budzet: 500,
  integracje: 500,
  inne: 0,
  reimRazem: 1500,
});

// Pure function (for testing/utilities)
const invoiceString = generateInvoiceString(params);

// Parser (for imports/debugging)
const params = parseInvoiceString("ML;3000;MC;750;...");
```

### 2. Created `CalculationResultDialog` Component

**Location:** `components/calculation-result-dialog.tsx`

A self-contained dialog component for displaying calculation results.

#### Features

- Invoice string display with click-to-select
- Copy to clipboard functionality
- Total sum display with formatted currency
- Tooltip feedback on copy
- Fully encapsulated state management

#### Props Interface

```typescript
interface CalculationResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceString: string;
  totalSum: number;
}
```

#### Benefits

1. **Separation of Concerns**: Dialog logic isolated from form logic
2. **Reusable**: Can be used in other contexts (e.g., calculation list preview)
3. **Self-Contained**: Manages its own copy state and tooltips
4. **Testable**: Can be tested independently
5. **Smaller Components**: Form component reduced by ~100 lines

### 3. Updated Components

#### `providers/calculation-form-provider.tsx`

**Before:**
```typescript
const invoiceHeavenString = useMemo(() => {
  const ml = Number(watchedValues.masterLearner) || 0;
  const mc = Number(watchedValues.masterCare) || 0;
  // ... more variables
  return `ML;${formatMoney(ml)};MC;${formatMoney(mc)};...`;
}, [/* many dependencies */]);
```

**After:**
```typescript
const invoiceHeavenString = useInvoiceString({
  masterLearner: Number(watchedValues.masterLearner) || 0,
  masterCare: Number(watchedValues.masterCare) || 0,
  toolsTotal,
  budzet: Number(watchedValues.budzet) || 0,
  integracje: Number(watchedValues.integracje) || 0,
  inne: Number(watchedValues.inne) || 0,
  reimRazem,
});
```

#### `components/calculation-form.tsx`

**Removed:**
- Dialog JSX (~100 lines)
- Copy handlers
- Output ref management
- Tooltip state management
- Temporary state for output/totalSum

**Added:**
```typescript
<CalculationResultDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  invoiceString={invoiceHeavenString}
  totalSum={totalSum}
/>
```

## Architecture Benefits

### Before

```
CalculationForm
  ├── Form fields
  ├── Dialog JSX (100 lines)
  ├── Copy logic
  ├── Tooltip management
  └── Output state

Provider
  └── Invoice string generation (inline template string)
```

### After

```
CalculationForm
  ├── Form fields
  └── <CalculationResultDialog /> (1 line)

CalculationResultDialog (separate)
  ├── Dialog JSX
  ├── Copy logic
  ├── Tooltip management
  └── Output state

Provider
  └── useInvoiceString() (hook)

useInvoiceString (separate)
  ├── Template definition
  ├── Generation logic
  └── Parser utility
```

## Template Pattern Benefits

### 1. Maintainability

**Changing field order:**
```typescript
// Just reorder in the template array
fields: [
  { key: "MC", getValue: (p) => formatMoney(p.masterCare) },
  { key: "ML", getValue: (p) => formatMoney(p.masterLearner) },
  // ...
]
```

**Adding a new field:**
```typescript
fields: [
  // ... existing fields
  { key: "newField", getValue: (p) => formatMoney(p.newField) },
]
```

**Changing separator:**
```typescript
const INVOICE_TEMPLATE = {
  separator: "|", // Changed from ";"
  fields: [/* ... */]
};
```

### 2. Consistency

All invoice strings use the same:
- Formatting logic (`formatMoney`)
- Field order
- Separator
- Structure

### 3. Testability

```typescript
// Easy to test
describe('generateInvoiceString', () => {
  it('formats correctly', () => {
    const result = generateInvoiceString({
      masterLearner: 3000,
      masterCare: 750,
      // ...
    });
    expect(result).toBe('ML;3000.00;MC;750.00;...');
  });
});
```

### 4. Documentation

The template serves as living documentation of the invoice string format.

## Code Metrics

### Lines Reduced

- **CalculationForm**: ~100 lines removed (dialog JSX + handlers)
- **Provider**: ~15 lines simplified (inline template → hook call)

### Lines Added

- **useInvoiceString**: 105 lines (hook + utilities)
- **CalculationResultDialog**: 125 lines (extracted component)

### Net Result

- **Total**: +115 lines
- **But**: Better separation, reusability, and maintainability
- **Components are smaller and more focused**

## Usage Examples

### In Provider

```typescript
const invoiceHeavenString = useInvoiceString({
  masterLearner: Number(watchedValues.masterLearner) || 0,
  masterCare: Number(watchedValues.masterCare) || 0,
  toolsTotal,
  budzet: Number(watchedValues.budzet) || 0,
  integracje: Number(watchedValues.integracje) || 0,
  inne: Number(watchedValues.inne) || 0,
  reimRazem,
});
```

### In Form

```typescript
<CalculationResultDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  invoiceString={invoiceHeavenString}
  totalSum={totalSum}
/>
```

### In Tests

```typescript
const invoiceString = generateInvoiceString({
  masterLearner: 3000,
  masterCare: 750,
  toolsTotal: 500,
  budzet: 500,
  integracje: 500,
  inne: 0,
  reimRazem: 1500,
});
```

## Future Enhancements

1. **Template Versioning**: Support multiple invoice string formats
2. **Custom Formatters**: Allow per-field custom formatting
3. **Validation**: Add schema validation for invoice strings
4. **Import/Export**: Use `parseInvoiceString` for data import
5. **Preview Component**: Create a read-only preview using the dialog
6. **PDF Generation**: Use the template for PDF invoice generation

## Migration Notes

- ✅ No breaking changes
- ✅ All existing functionality preserved
- ✅ Invoice string format unchanged
- ✅ UI/UX identical
- ✅ No changes to database or API

## Files Modified

### New Files
- `hooks/useInvoiceString.ts` - Invoice string generation hook
- `components/calculation-result-dialog.tsx` - Calculation result dialog

### Modified Files
- `providers/calculation-form-provider.tsx` - Uses new hook
- `components/calculation-form.tsx` - Uses new dialog component

### Unchanged Files
- All form field components
- Page components
- Other utilities

