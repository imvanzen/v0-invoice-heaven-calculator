# Documentation vs Code Verification

**Date:** 2026-01-28  
**Scope:** Active docs (TECHNICAL_DESCRIPTION, ARCHITECTURE_DIAGRAMS, USER_STORIES, REFACTORING_FORMS, DESIGN_SPECIFICATIONS) vs current codebase.

---

## Summary

Several docs are **out of date** relative to the code. The main gaps: provider API (no `mode`, use `editingCalculationId`; no `form` in context), component tree (no `benefit-input.tsx`, use `form-fields/`), file line counts, schema/validation structure, and USER_STORIES D-013 (UsageSummary no longer uses custom events).

---

## Discrepancies Found

### 1. TECHNICAL_DESCRIPTION.md

| Doc says                                                                   | Code reality                                                                                                                              |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `CalculationFormContext` has `form: UseFormReturn<...>`                    | No `form` in context; form is from `FormProvider` / `useFormContext()`                                                                    |
| `budgetValidation: BudgetValidationResult \| null`                         | `ReturnType<typeof useBudgetValidation> \| null` (same shape, type name differs)                                                          |
| `<CalculationFormProvider mode="create">`                                  | Create: `<CalculationFormProvider>`. Edit: `<CalculationFormProvider editingCalculationId={id}>`. No `mode` prop.                         |
| calculation-form-provider: 226 lines                                       | 276 lines                                                                                                                                 |
| app-state-provider: 186 lines                                              | 293 lines                                                                                                                                 |
| create/page.tsx: 551 lines                                                 | 154 lines                                                                                                                                 |
| edit/[id]/page.tsx: 454 lines                                              | 185 lines                                                                                                                                 |
| Component list includes `benefit-input.tsx`                                | No such file; form uses `form-fields/` (master-learner-field, master-care-field, integracje-field, other-field); Budget field removed     |
| utils: `financialMath.ts`                                                  | No file; financial helpers in `utils/money.ts` (e.g. `addMoney`, `multiplyMoney`)                                                         |
| calculation-schema: single `calculationFormSchema` with inline refinements | Schema uses `createCalculationFormSchema(employmentDate)` and `baseCalculationFormSchema`; provider builds schema with employment context |
| calculation-schema: 68 lines                                               | 212 lines                                                                                                                                 |
| useBudgetValidation(selectedMonth, employmentDate, calculations, values)   | 5th param: `editingCalculationId?: string`                                                                                                |
| form.tsx: 157 lines                                                        | 193 lines                                                                                                                                 |

### 2. USER_STORIES.md (D-013: Employment Date Reactive Updates)

- **Doc:** "Custom event: `employmentDateChanged`"; "`UsageSummary` listens for event and updates internal state."
- **Code:** `UsageSummary` receives `calculations` and `employmentDate` as **props** (from parent that uses `useAppState()`). No event listener in UsageSummary. Event `employmentDateChanged` is only dispatched in `import-dialog.tsx` after import; reactive updates elsewhere are via React context (AppState), not events.

### 3. ARCHITECTURE_DIAGRAMS.md

- Lists `benefit-input.tsx (51 lines)` — file does not exist; form uses `form-fields/` components.
- Line counts: same as TECHNICAL_DESCRIPTION (calculation-form-provider 226→276, app-state-provider 186→293, create 551→154, edit 454→185, form 157→193, calculation-schema 68→212).

### 4. REFACTORING_FORMS.md

- CalculationForm props and form-fields layout match the code (mode, onSubmit, saving, monthError, lockedMonth, onCancel; form-fields export names match).
- No changes needed for REFACTORING_FORMS.

### 5. Package versions (minor)

- TECHNICAL_DESCRIPTION: "Next.js 16.1" — package: `16.1.5`.
- lucide-react: doc `0.562.0` — package `0.563.0`.
- React Hook Form: doc `7.70.0` — package `7.71.1`.
- TypeScript: doc `5.7.3` — package `5.9.3`.
- Tailwind: doc `4.1.18` — matches.

### 6. Tool schema / currency

- Doc snippet: `currency: z.enum(["PLN", "USD", "EUR", "GBP"])` in tool-schema — code has same enum in `tool-schema.ts`. Provider’s `getDefaultToolsFromStorage` validates only PLN, USD, EUR; GBP is allowed by schema but not in that runtime filter. Consider aligning or documenting.

---

## Corrections Applied

The following doc updates were applied to align with the code:

1. **TECHNICAL_DESCRIPTION.md** – CalculationFormContext (remove `form`, clarify budgetValidation type), provider usage (`editingCalculationId`, no `mode`), component tree (form-fields, no benefit-input), utils (money.ts, no financialMath), schema description, useBudgetValidation signature, line counts.
2. **USER_STORIES.md** – D-013 updated to describe props-from-context flow for UsageSummary and that employmentDate reactivity is via AppState; event only used after import.
3. **ARCHITECTURE_DIAGRAMS.md** – Replace benefit-input with form-fields; update line counts to match current files.

---

## Recommendations

- After any refactor that changes provider API, page layout, or shared components, update TECHNICAL_DESCRIPTION and ARCHITECTURE_DIAGRAMS in the same PR.
- Optionally add a short "Implementation notes" under D-013 stating that the primary mechanism is AppState (context), and the event is for one-off refresh after import.
- Consider removing or archiving line-count assertions from docs (or generating them) so they don’t drift.
