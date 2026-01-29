# Invoice Heaven Calculator - User Stories

**Last Updated:** January 29, 2026  
**Status:** ✅ Production - Post-Refactor Architecture

**Feedback update (Jan 2026):** Master Learner simplified to 500 PLN every two months (same method as Master Care; no employment-date dependency). Budget category "Budżet na dojazdy i noclegi" removed; accommodation/travel covered under Integracje (team-building). Terminology: "Integracje" = team-building (company/employee events), not system integrations. InvoiceHeaven string format updated: no "budżet na dojazdy i noclegi" segment; REIM.RAZEM = Tools + Integracje + Inne.

## Project Overview

**Business Goal:** Provide employees with a web-based calculator tool to generate properly formatted reimbursement strings for the InvoiceHeaven invoicing system, supporting the 2026 Benefits program at MasterBorn (MB).

**Domain:** Employee Benefits & Reimbursement Management

**Target Users:** MasterBorn employees submitting reimbursement requests

---

## 📋 Business Rules

### Master Learner (ML) – Simplified (Same Method as Master Care)

**Source:** Benefits 2026 Program Documentation; updated per product feedback (Jan 2026).

**Rule:** Master Learner is calculated **exactly the same way as Master Care**: a **fixed amount per bi-monthly period**, with **no employment-date dependency** and **no annual cap**.

- **Amount:** **500 PLN every two months** (per bi-monthly period).
- **Settlement period:** Bi-monthly (Jan–Feb, Mar–Apr, May–Jun, Jul–Aug, Sep–Oct, Nov–Dec). Values can only be entered in calculations for months within the current bi-monthly settlement period (same rules as Master Care).
- **Removed:** Rules tied to “when someone joins” and “total annual budget”—these are no longer used.

**Rationale:** Simplification removes edge cases and alignment problems; “500 PLN every two months” is the single rule.

**Coverage:** English lessons, conferences, training, courses, certifications, tuition fees, books, coaching, and related logistics (transport, accommodation).

**Implementation Requirements:**

- **No employment start date** is required for ML limit calculation.
- System applies a **per-period limit**: 500 PLN per bi-monthly period (same period definition as Master Care).
- Accumulated ML in the current bi-monthly period must not exceed 500 PLN.
- Period-based input: ML can only be entered in calculations for months within the current bi-monthly settlement period (aligned with Master Care behaviour).

**Note:** ML and MC now share the same calculation method (fixed per bi-monthly period, no employment dependency):

- **Master Care:** Fixed 750 PLN per bi-monthly period.
- **Master Learner:** Fixed 500 PLN per bi-monthly period.
- **Integracje (team-building):** Fixed 1,500 PLN per quarter (see terminology note below).

---

## ⚡ Technical Implementation (Post-Refactor)

**Framework:** Next.js 16.1 + React 19.2 + TypeScript  
**State Management:** React Context API + useOptimistic  
**Form Management:** React Hook Form + Zod  
**Styling:** Tailwind CSS 4.1.18 + shadcn/ui  
**Data Persistence:** IndexedDB (via idb library)

### Architecture Overview

#### **1. Global State Management**

- **`AppStateProvider`** (`providers/app-state-provider.tsx`)
  - Manages employment date and calculations
  - Uses `useOptimistic` for instant UI updates
  - Provides CRUD actions: `createCalculation`, `updateCalculation`, `deleteCalculation`
  - Zero prop drilling across the application

#### **2. Form State Management**

- **`CalculationFormProvider`** (`providers/calculation-form-provider.tsx`)
  - Wraps React Hook Form with custom logic
  - Auto-computes: `toolsTotal`, `reimRazem`, `totalSum`, `invoiceHeavenString`
  - Integrates Zod validation schemas
  - Provides `resetForm()` and `loadClonedData()` actions

#### **3. Validation**

- **Zod Schemas** (`schemas/calculation-schema.ts`, `schemas/tool-schema.ts`)
  - Type-safe validation
  - Real-time error display
  - Accumulated limit validation via `useBudgetValidation` hook

#### **4. Shared Components**

- `PageHeader` - Consistent page headers with logo, title, actions
- `MonthYearSelect` - Employment-date-aware month selector with `useTransition`
- `BenefitInput` - Reusable input with error display
- `ThemeToggle` - System/light/dark theme switcher
- `LoadingState`, `EmptyState`, `ErrorMessage` - UI feedback components
- `Form` components - shadcn/ui form primitives with ARIA attributes

#### **5. Pages**

- **Home Page** (`app/page.tsx`) - Calculation history + usage summaries
- **Create Page** (`app/create/page.tsx`) - New calculation form (551 lines)
- **Edit Page** (`app/edit/[id]/page.tsx`) - Edit calculation form (454 lines)

### Key Patterns

✅ **React 19 Patterns**

- `useOptimistic` for instant UI updates
- `useTransition` for responsive month/year selection

✅ **Type Safety**

- Zod schemas for runtime validation
- TypeScript strict mode
- No `any` types

✅ **Accessibility**

- WCAG 2.1 AA compliant
- ARIA attributes on form fields
- Keyboard navigation
- Screen reader support

✅ **Code Quality**

- Zero manual validation logic
- Zero window events
- Zero prop drilling
- 363 lines removed from application code

---

## Epics

### Epic 1: Core Calculation Engine

**Goal:** Enable accurate calculation and formatting of reimbursement data according to InvoiceHeaven requirements.

### Epic 2: User Input & Validation

**Goal:** Provide intuitive input mechanisms with robust validation to prevent errors and ensure data quality.

### Epic 3: Multi-Currency Tools Management

**Goal:** Support tools/equipment purchases in multiple currencies with accurate PLN conversion.

### Epic 4: User Experience & Accessibility

**Goal:** Deliver a modern, accessible, and responsive user interface that works across devices and preferences.

### Epic 5: Data Persistence & Recovery

**Goal:** Preserve user input to prevent data loss and improve workflow efficiency.

### Epic 6: Calculation History & Limit Tracking

**Goal:** Track monthly calculations, enable editing of saved calculations, validate against accumulated benefit limits to prevent over-submission, enforce period-based input restrictions, and provide data backup/restore capabilities for safety.

---

## User Stories

### Epic 1: Core Calculation Engine

#### US-001: Calculate Total Reimbursement Sum

**Story ID:** US-001  
**Title:** Calculate Total Reimbursement Sum  
**Story Statement:** As an employee, I want the system to calculate the total sum of all my reimbursement categories, so that I know the total amount I'm requesting.

**Business Value:** Ensures transparency and accuracy in reimbursement requests, helping employees verify their calculations before submission.

**Acceptance Criteria:**

- Given I have entered values in any combination of Master Learner, Master Care, Tools, Integrations, and Other fields
- When I click the "Calculate" button
- Then the system displays the total sum in PLN with 2 decimal places
- And the total sum equals: ML + MC + Tools (in PLN) + Integrations + Other
- And the calculation uses financial math to avoid floating-point precision errors

**Edge Cases:**

- All fields empty → Total = 0.00
- Only one field filled → Total equals that value
- Decimal values (e.g., 0.1, 0.2) → Correctly sums to 2 decimal places
- Large values → Handles without overflow

**Dependencies:** US-002 (REIM.RAZEM calculation), US-003 (Tools calculation)

**Risks:** Floating-point arithmetic errors in JavaScript

**Sub-Tasks:**

- Implement `addFinancialValues` utility function using integer math
- Create total sum calculation logic in main calculator component
- Display total sum in results dialog
- Add unit tests for edge cases

**References:**

- `utils/financialMath.ts`
- `app/page.tsx` (lines 91-92)

**Change Note:** New

---

#### US-002: Calculate REIM.RAZEM Subtotal

**Story ID:** US-002  
**Title:** Calculate REIM.RAZEM Subtotal  
**Story Statement:** As an employee, I want the system to calculate the REIM.RAZEM subtotal (reimbursement total), so that it matches the InvoiceHeaven format requirements.

**Business Value:** REIM.RAZEM is a required field in the InvoiceHeaven string format representing the sum of reimbursable expenses (excluding ML and MC which are separate benefit categories).

**Acceptance Criteria:**

- Given I have entered values in Tools, Integrations, and/or Other fields
- When I click "Calculate"
- Then REIM.RAZEM equals: Tools (in PLN) + Integrations + Other
- And REIM.RAZEM is displayed with exactly 2 decimal places in the output string
- And REIM.RAZEM is calculated even when some fields are empty (treated as 0)

**Edge Cases:**

- All REIM fields empty → REIM.RAZEM = 0.00
- Only Tools filled → REIM.RAZEM = Tools total
- Decimal precision → Correctly sums to 2 decimal places

**Dependencies:** US-003 (Tools calculation)

**Risks:** Incorrect calculation logic could lead to reimbursement errors

**Sub-Tasks:**

- Implement REIM.RAZEM calculation logic
- Format REIM.RAZEM with 2 decimal places in output string
- Add validation tests

**References:**

- `app/page.tsx` (lines 79-86, 88)
- Business requirement: REIM.RAZEM = narzędzia + integracje + inne (Budget category removed per feedback; accommodation/travel covered under Integracje / team-building)

**Change Note:** New

---

#### US-003: Generate InvoiceHeaven Format String

**Story ID:** US-003  
**Title:** Generate InvoiceHeaven Format String  
**Story Statement:** As an employee, I want the system to generate a properly formatted string matching InvoiceHeaven requirements, so that I can copy and paste it directly into the InvoiceHeaven system.

**Business Value:** Eliminates manual formatting errors and ensures compatibility with the InvoiceHeaven invoicing system, reducing processing time and rejections.

**Acceptance Criteria:**

- Given I have entered values (or left them empty) in all fields
- When I click "Calculate"
- Then the system generates a string in the exact format: `ML;{ml};MC;{mc};REIM.RAZEM;{razem};narzędzia;{tools};integracje;{integracje};inne;{inne}`
- And empty fields are represented as "0"
- And REIM.RAZEM and narzędzia always show 2 decimal places (e.g., "0.00")
- And other numeric values show without decimal places if they are whole numbers
- And the string is displayed in a monospace font for readability

**Edge Cases:**

- All zeros → `ML;0;MC;0;REIM.RAZEM;0.00;narzędzia;0.00;integracje;0;inne;0`
- Decimal values → Properly formatted (e.g., "150.50", "75.25")
- Large values → No formatting issues

**Dependencies:** US-001, US-002

**Risks:** Format mismatch could cause InvoiceHeaven parsing errors

**Sub-Tasks:**

- Implement string formatting logic
- Ensure consistent decimal formatting
- Add format validation tests
- Display formatted string in results dialog

**References:**

- `app/page.tsx` (lines 70-88)
- Business requirement from Benefits 2026 announcement
- Test: `tests/calculator.spec.ts` (lines 285-302)

**Change Note:** New

---

### Epic 2: User Input & Validation

#### US-004: Input Master Learner Amount

**Story ID:** US-004  
**Title:** Input Master Learner Amount  
**Story Statement:** As an employee, I want to enter my Master Learner benefit amount, so that it's included in my reimbursement calculation.

**Business Value:** Master Learner is a core benefit category with a **fixed 500 PLN per bi-monthly period** (same calculation method as Master Care; no employment-date dependency). It must be tracked separately in the InvoiceHeaven format. See [Business Rules](#-business-rules) section for detailed specification.

**Acceptance Criteria:**

- Given I am on the calculator page
- When I see the "Master Learner" input field
- Then I can enter a numeric value
- And the field accepts decimal numbers
- And the field shows a placeholder "0"
- And I cannot enter negative values (validation error shown)
- And I cannot enter values exceeding 500 PLN per entry (validation error shown)
- And I can only enter Master Learner values in calculations for months within the current bi-monthly settlement period (same rules as Master Care: Feb, Apr, Jun, Aug, Oct, Dec for the respective Jan–Feb, Mar–Apr, etc. periods)
- And validation errors are displayed immediately below the field

**Edge Cases:**

- Empty field → Treated as 0 in calculation
- Value exactly 500 → Accepted (if within correct bi-monthly period)
- Value 501 → Rejected with error message
- Negative value → Rejected with error message
- Non-numeric input → Browser prevents (type="number")
- Entering ML in a month outside the bi-monthly settlement window → Rejected with period error (same behaviour as Master Care)

**Dependencies:** US-027 (for accumulated limit validation), US-033 (period-based input validation)

**Risks:** Missing validation could allow invalid submissions

**Sub-Tasks:**

- Create Master Learner input field
- Implement validation logic (0–500 per entry, no negatives)
- Implement period-based validation (same as Master Care)
- Integrate with accumulated limit validation (US-027) for bi-monthly period
- Display validation error messages
- Add validation tests

**References:**

- `app/page.tsx` (lines 173-183, 50-54)
- Business rule: Master Learner 500 PLN per bi-monthly period (no employment date; see [Business Rules](#-business-rules))
- Test: `tests/calculator.spec.ts` (lines 198-209)

**Change Note:** Updated per feedback – ML simplified to 500 PLN every two months, same method as Master Care; employment-date-dependent annual limit removed.

---

#### US-005: Input Master Care Amount

**Story ID:** US-005  
**Title:** Input Master Care Amount  
**Story Statement:** As an employee, I want to enter my Master Care benefit amount, so that it's included in my reimbursement calculation.

**Business Value:** Master Care is a core benefit category (750 PLN every 2 months per person) for health and sports expenses that must be tracked separately. Master Care is settled bi-monthly at the end of each period (Jan-Feb, Mar-Apr, etc.), so values can only be entered in calculations for the second month of each bi-monthly period (February, April, June, August, October, December).

**Acceptance Criteria:**

- Given I am on the calculator page
- When I see the "Master Care" input field
- Then I can enter a numeric value
- And the field accepts decimal numbers
- And the field shows a placeholder "0"
- And I cannot enter negative values (validation error shown)
- And I cannot enter values exceeding 750 PLN (validation error shown)
- And I can only enter Master Care values in calculations for months within the current bi-monthly settlement period:
  - Jan-Feb period: Can enter MC in February calculations only
  - Mar-Apr period: Can enter MC in April calculations only
  - May-Jun period: Can enter MC in June calculations only
  - Jul-Aug period: Can enter MC in August calculations only
  - Sep-Oct period: Can enter MC in October calculations only
  - Nov-Dec period: Can enter MC in December calculations only
- And if I try to enter MC value in a calculation for a month outside the allowed month:
  - Field is disabled or shows validation error
  - Error message: "Master Care can only be entered in calculations for {settlementMonth} (settlement month for {currentPeriod} period). This calculation is for {month}, which is not the settlement month."
- And validation errors are displayed immediately below the field

**Edge Cases:**

- Empty field → Treated as 0 in calculation
- Value exactly 750 → Accepted (if within correct period)
- Value 751 → Rejected with error message
- Negative value → Rejected with error message
- Entering MC in March calculation during Jan-Feb period → Rejected with period error
- Entering MC in January calculation during Jan-Feb period → Rejected (only February allowed)
- Entering MC in February calculation during Jan-Feb period → Accepted
- Period transition (Feb → Mar) → Validation updates, MC can be entered in April calculation (Mar-Apr period)
- Creating new calculation for current month → Period validation based on calculation month, not current date

**Dependencies:** US-022 (calculation month/year), US-027 (for accumulated limit validation), US-033 (period-based input validation)

**Risks:** Missing validation could allow invalid submissions, users may be confused by period restrictions

**Sub-Tasks:**

- Create Master Care input field
- Implement validation logic (0-750 range, no negatives)
- Implement period-based validation (check calculation month against bi-monthly period)
- Integrate with accumulated limit validation (US-027)
- Display validation error messages (including period errors)
- Add helper text explaining bi-monthly settlement periods
- Add validation tests (including period boundary tests)

**References:**

- `app/page.tsx` (lines 185-196, 50-54)
- Business rule: Master Care max 750 PLN per entry, 750 PLN per bi-monthly period
- Test: `tests/calculator.spec.ts` (lines 211-216)
- MasterCare.pdf: 750 PLN every 2 months, settled bi-monthly (Jan-Feb, Mar-Apr, etc.)

**Change Note:** Updated - Added period-based validation to ensure MC can only be entered in calculations for months within the correct bi-monthly settlement period

---

#### US-006: Input Budget for Commutes and Accommodation — **REMOVED**

**Story ID:** US-006  
**Title:** Input Budget for Commutes and Accommodation  
**Status:** **Removed** (per product feedback, Jan 2026).

**Rationale:** "Budżet na dojazdy i noclegi" (accommodation and travel) has been removed as a separate category. These costs are covered under **Integracje (team-building)**; the formula was simplified and the separate budget field is no longer part of the InvoiceHeaven string or REIM.RAZEM. See [Business Rules](#-business-rules) and updated string format in US-002/US-003.

**Change Note:** Category removed; do not implement or display this field. Existing references in code/docs to "Budget" in the reimbursement sense should be removed or migrated to the new formula (Tools + Integracje + Inne only).

---

#### US-007: Input Integrations (Team-Building) Amount

**Story ID:** US-007  
**Title:** Input Integrations (Team-Building) Amount  
**Story Statement:** As an employee, I want to enter my individual travel expenses (accommodation and transport) for team-building events, so that they're included in the REIM.RAZEM calculation and InvoiceHeaven format.

**Terminology:** In this context **"Integracje"** means **team-building** (company/employee events, office visits, project get-togethers). It does _not_ mean system/technical integrations. Use "team-building" in UI or docs where it avoids confusion. The InvoiceHeaven label remains "integracje".

**Business Value:** Integracje (team-building) is a benefit category with a fixed amount of 1,500 PLN quarterly per person (no employment date dependency) for project team integrations and office visits. Individual employees can only settle their own travel expenses (accommodation and transport) through the reimbursement system. Group activities (restaurants, attractions) are handled separately by organizers using company cards. Integrations are settled quarterly, so values can only be entered in calculations for months within the correct quarter.

**Acceptance Criteria:**

- Given I am on the calculator page
- When I see the "Integracje" input field
- Then I can enter a numeric value for my individual travel expenses (accommodation + transport)
- And the field accepts decimal numbers
- And the field shows a placeholder "0"
- And I cannot enter negative values (validation error shown)
- And empty field is treated as 0 in calculation
- And the value is included in the InvoiceHeaven string format as "integracje;{value}"
- And the field includes helper text clarifying: "Individual travel expenses only (accommodation and transport). Group activities are handled by organizers."
- And the quarterly limit is a fixed 1,500 PLN per quarter (not dependent on employment date) and applies to individual travel expenses only
- And I can only enter Integrations values in calculations for months within the current quarterly settlement period:
  - Q1 (Jan-Mar): Can enter Integrations in January, February, or March calculations only
  - Q2 (Apr-Jun): Can enter Integrations in April, May, or June calculations only
  - Q3 (Jul-Sep): Can enter Integrations in July, August, or September calculations only
  - Q4 (Oct-Dec): Can enter Integrations in October, November, or December calculations only
- And if I try to enter Integrations value in a calculation for a month outside the current quarter:
  - Field is disabled or shows validation error
  - Error message: "Integrations can only be entered in calculations for {currentQuarter} (e.g., Q1: Jan-Mar). This calculation is for {month}, which is outside the current settlement period."

**Edge Cases:**

- Empty field → Treated as 0, shown as "integracje;0" in output
- Decimal values → Accepted (if within correct quarter)
- Large values → Accepted (no upper limit specified per entry, but business rule is 1,500 PLN quarterly for travel expenses)
- Entering Integrations in April calculation during Q1 (Jan-Mar) → Rejected with period error
- Entering Integrations in January calculation during Q1 → Accepted
- Entering Integrations in March calculation during Q1 → Accepted
- Quarter transition (Mar → Apr) → Validation updates, Integrations can be entered in Apr calculation
- Creating new calculation for current month → Period validation based on calculation month, not current date

**Dependencies:** US-002, US-003, US-022 (calculation month/year), US-027 (for accumulated limit validation), US-033 (period-based input validation)

**Risks:** Users may confuse individual travel expenses with group activity costs, users may be confused by quarterly period restrictions

**Sub-Tasks:**

- Create integrations input field
- Add helper text/clarification about individual vs. organizer expenses
- Implement validation (no negatives)
- Implement period-based validation (check calculation month against quarterly period)
- Integrate with accumulated limit validation (US-027)
- Add to REIM.RAZEM calculation
- Add to InvoiceHeaven string format
- Add tests (including period boundary tests)

**References:**

- `app/page.tsx` (lines 216-227, 88)
- Business requirement: Benefits 2026 announcement - Integracje 1,500 PLN quarterly
- Integracje projektowe + przyjazdy do biura.pdf: Individual employees settle "Nocleg i dojazd" (accommodation and transport) individually; organizers handle group activities with company card

**Change Note:** Updated - Added period-based validation to ensure Integrations can only be entered in calculations for months within the correct quarterly settlement period. Integrations limit is fixed at 1,500 PLN per quarter (not dependent on employment date).

---

#### US-008: Input Other Expenses Amount

**Story ID:** US-008  
**Title:** Input Other Expenses Amount  
**Story Statement:** As an employee, I want to enter miscellaneous expenses in the "Other" category, so that they're included in my reimbursement calculation.

**Business Value:** Provides flexibility for expenses that don't fit into other predefined categories.

**Acceptance Criteria:**

- Given I am on the calculator page
- When I see the "Inne" (Other) input field
- Then I can enter a numeric value
- And the field accepts decimal numbers
- And the field shows a placeholder "0"
- And I cannot enter negative values (validation error shown)
- And empty field is treated as 0 in calculation

**Edge Cases:**

- Empty field → Treated as 0
- Decimal values → Accepted

**Dependencies:** US-002, US-003

**Risks:** None significant

**Sub-Tasks:**

- Create "Inne" input field
- Implement validation (no negatives)
- Add to REIM.RAZEM calculation
- Add to InvoiceHeaven string format
- Add tests

**References:**

- `app/page.tsx` (lines 229-240, 88)

**Change Note:** New

---

#### US-009: Clear All Form Fields

**Story ID:** US-009  
**Title:** Clear All Form Fields  
**Story Statement:** As an employee, I want to clear all input fields with one action, so that I can quickly start a new calculation.

**Business Value:** Improves workflow efficiency when processing multiple reimbursement requests.

**Acceptance Criteria:**

- Given I have entered values in any combination of fields
- When I click the "Clear" button
- Then all input fields are reset to empty
- And all validation errors are cleared
- And the Tools section is reset (if applicable)
- And I can immediately start entering new values

**Edge Cases:**

- All fields already empty → No change
- Some fields have validation errors → Errors cleared
- Tools section has multiple tools → Reset to single empty tool

**Dependencies:** US-004 through US-008, US-010

**Risks:** Accidental clearing could cause data loss (mitigated by localStorage persistence)

**Sub-Tasks:**

- Implement clear button handler
- Reset all form state
- Clear validation errors
- Reset Tools section
- Add tests

**References:**

- `app/page.tsx` (lines 122-131, 243-245)
- Test: `tests/calculator.spec.ts` (lines 225-240)

**Change Note:** New

---

#### US-010: Prevent Calculation with Validation Errors

**Story ID:** US-010  
**Title:** Prevent Calculation with Validation Errors  
**Story Statement:** As an employee, I want the system to prevent calculation when there are validation errors, so that I don't generate incorrect reimbursement strings.

**Business Value:** Ensures data quality and prevents submission of invalid reimbursement requests.

**Acceptance Criteria:**

- Given I have entered invalid values (e.g., negative, exceeding max)
- When I click "Calculate"
- Then the calculation dialog does not open
- And validation error messages remain visible
- And I must correct the errors before calculation can proceed

**Edge Cases:**

- Multiple fields with errors → All errors must be fixed
- Error in Tools section → Calculation blocked
- Error fixed → Calculation proceeds normally

**Dependencies:** US-004, US-005, US-011

**Risks:** User frustration if errors are unclear

**Sub-Tasks:**

- Implement validation check before calculation
- Block dialog opening when errors exist
- Ensure clear error messaging

**References:**

- `app/page.tsx` (lines 65-68)
- Test: `tests/calculator.spec.ts` (lines 198-209)

**Change Note:** New

---

### Epic 3: Multi-Currency Tools Management

#### US-011: Add Tools/Equipment Entries

**Story ID:** US-011  
**Title:** Add Tools/Equipment Entries  
**Story Statement:** As an employee, I want to add multiple tools/equipment entries with names, amounts, and currencies, so that I can track all my tool purchases in one reimbursement request.

**Business Value:** Employees often purchase tools in different currencies (especially USD/EUR for software licenses), and need to convert them to PLN for reimbursement.

**Acceptance Criteria:**

- Given I am on the calculator page
- When I see the "Narzędzia" (Tools) section
- Then I see at least one empty tool entry by default
- And I can click "+ Dodaj narzędzie" to add more entries
- And each tool entry has fields: Name, Amount, Currency, Exchange Rate
- And I can add multiple tools
- And the name field accepts any text input
- And the amount field accepts numeric values
- And I can select currency from: PLN, USD, EUR

**Edge Cases:**

- No tools added → At least one empty tool always present
- Multiple tools → All are included in calculation
- Empty tool name → Accepted (name is optional for calculation)
- Empty amount → Treated as 0

**Dependencies:** US-012, US-013

**Risks:** None significant

**Sub-Tasks:**

- Create Tools section component
- Implement add tool functionality
- Create tool entry UI with all fields
- Implement currency selector
- Add tests

**References:**

- `components/tools-section.tsx`
- `hooks/useTools.ts`
- Test: `tests/tools-section.spec.ts` (lines 8-25, 17-25)

**Change Note:** New

---

#### US-012: Convert Foreign Currency Tools to PLN

**Story ID:** US-012  
**Title:** Convert Foreign Currency Tools to PLN  
**Story Statement:** As an employee, I want to enter tool purchases in USD or EUR with exchange rates, so that they are automatically converted to PLN for reimbursement calculation.

**Business Value:** Many tools (especially software licenses) are purchased in USD/EUR, and employees need accurate PLN conversion for reimbursement.

**Acceptance Criteria:**

- Given I have added a tool entry
- When I select USD or EUR as the currency
- Then I can enter an exchange rate
- And the exchange rate field is enabled (not disabled)
- And the system calculates: Amount × Exchange Rate = PLN value
- And the PLN value is displayed in real-time
- And the PLN value is included in the tools total
- And if I switch back to PLN, the exchange rate is automatically set to 1 and disabled

**Edge Cases:**

- Exchange rate empty for non-PLN → Error shown, calculation blocked
- Exchange rate = 0 → Calculates to 0 PLN
- Exchange rate with decimals → Accurate calculation (e.g., 4.25)
- Switching from USD to EUR → Exchange rate remains editable, user must update

**Dependencies:** US-011, US-013

**Risks:** Incorrect exchange rates could lead to reimbursement errors

**Sub-Tasks:**

- Implement currency conversion logic
- Create exchange rate input with validation
- Calculate PLN value in real-time
- Handle currency switching
- Add validation for required exchange rate
- Add tests

**References:**

- `components/tools-section.tsx` (lines 88-140)
- `hooks/useTools.ts` (lines 36-43, 55-71)
- Test: `tests/tools-section.spec.ts` (lines 42-68, 94-118)

**Change Note:** New

---

#### US-013: Calculate Tools Total in PLN

**Story ID:** US-013  
**Title:** Calculate Tools Total in PLN  
**Story Statement:** As an employee, I want to see the total of all my tools converted to PLN, so that I know the total tools amount included in my reimbursement.

**Business Value:** Provides transparency and allows employees to verify their tools calculation before generating the final reimbursement string.

**Acceptance Criteria:**

- Given I have added one or more tool entries
- When I enter amounts and exchange rates (if applicable)
- Then the system calculates the sum of all tools in PLN
- And the total is displayed in the "Podsuma" (Summary) field
- And the total is read-only (display only)
- And the total updates in real-time as I modify tool entries
- And the total uses financial math to avoid floating-point errors
- And the total is included in the main calculator's REIM.RAZEM and total sum

**Edge Cases:**

- All tools empty → Total = 0.00
- Mix of PLN, USD, EUR → All converted and summed correctly
- Multiple tools with decimals → Accurate sum to 2 decimal places
- Tool removed → Total recalculated

**Dependencies:** US-011, US-012

**Risks:** Floating-point arithmetic errors

**Sub-Tasks:**

- Implement tools total calculation
- Use financial math utility
- Display total in summary field
- Update parent calculator on changes
- Add tests

**References:**

- `hooks/useTools.ts` (lines 55-71)
- `components/tools-section.tsx` (lines 43-45, 163-172)
- `utils/financialMath.ts`
- Test: `tests/tools-section.spec.ts` (lines 27-40, 143-164)

**Change Note:** New

---

#### US-014: Remove Tool Entries

**Story ID:** US-014  
**Title:** Remove Tool Entries  
**Story Statement:** As an employee, I want to remove individual tool entries, so that I can correct mistakes or remove unwanted entries.

**Business Value:** Allows users to manage their tool list efficiently without having to clear everything.

**Acceptance Criteria:**

- Given I have multiple tool entries
- When I click the delete (trash) icon on a tool entry
- Then that tool is removed from the list
- And the tools total is recalculated
- And at least one tool entry always remains (cannot delete the last one)
- And if I delete the last tool, it is replaced with an empty tool entry

**Edge Cases:**

- Only one tool → Delete button still works, but tool is replaced with empty one
- Deleting tool with errors → Errors cleared
- Deleting tool in middle of list → Other tools remain intact

**Dependencies:** US-011

**Risks:** Accidental deletion (mitigated by requiring at least one tool)

**Sub-Tasks:**

- Implement remove tool functionality
- Enforce minimum one tool rule
- Recalculate total after removal
- Add tests

**References:**

- `hooks/useTools.ts` (lines 45-53)
- `components/tools-section.tsx` (lines 141-148)
- Test: `tests/tools-section.spec.ts` (lines 166-196)

**Change Note:** New

---

#### US-015: Validate Tools Exchange Rates

**Story ID:** US-015  
**Title:** Validate Tools Exchange Rates  
**Story Statement:** As an employee, I want the system to validate that exchange rates are provided for non-PLN currencies, so that I don't generate incorrect calculations.

**Business Value:** Prevents calculation errors that could lead to incorrect reimbursement amounts.

**Acceptance Criteria:**

- Given I have a tool with USD or EUR currency
- When the exchange rate field is empty
- Then an error message is displayed: "Exchange rate is required for non-PLN currencies"
- And the error is shown below the exchange rate field
- And the field is highlighted (red border)
- And calculation is blocked until the error is fixed

**Edge Cases:**

- Exchange rate = 0 → Accepted (may be intentional)
- Exchange rate with only spaces → Treated as empty, error shown
- Switching to PLN → Exchange rate automatically set to 1, error cleared

**Dependencies:** US-012, US-010

**Risks:** None significant

**Sub-Tasks:**

- Implement exchange rate validation
- Display error messages
- Block calculation when errors exist
- Add tests

**References:**

- `hooks/useTools.ts` (lines 73-83)
- `components/tools-section.tsx` (lines 48-51, 150-154)
- Test: `tests/tools-section.spec.ts` (lines 120-141)

**Change Note:** New

---

### Epic 4: User Experience & Accessibility

#### US-016: Display Calculation Results in Dialog

**Story ID:** US-016  
**Title:** Display Calculation Results in Dialog  
**Story Statement:** As an employee, I want to see the generated InvoiceHeaven string and total sum in a dialog, so that I can review the results before copying.

**Business Value:** Provides clear visibility of the output and allows users to verify correctness before using it.

**Acceptance Criteria:**

- Given I have entered values and clicked "Calculate"
- When the calculation completes
- Then a dialog opens displaying:
  - The generated InvoiceHeaven format string in monospace font
  - The total sum in PLN with currency symbol
  - Copy buttons for both outputs
- And the dialog can be closed by clicking outside or the close button
- And the string is selectable (click to select all)

**Edge Cases:**

- Very long string → Dialog scrolls or wraps appropriately
- All zeros → Dialog still shows results
- Dialog closed and reopened → Same results shown (if values unchanged)

**Dependencies:** US-003, US-001

**Risks:** None significant

**Sub-Tasks:**

- Create results dialog component
- Format and display InvoiceHeaven string
- Display total sum
- Implement dialog open/close logic
- Add text selection functionality
- Add tests

**References:**

- `app/page.tsx` (lines 258-322)
- Uses Radix UI Dialog component

**Change Note:** New

---

#### US-017: Copy InvoiceHeaven String to Clipboard

**Story ID:** US-017  
**Title:** Copy InvoiceHeaven String to Clipboard  
**Story Statement:** As an employee, I want to copy the generated InvoiceHeaven string to my clipboard with one click, so that I can quickly paste it into the InvoiceHeaven system.

**Business Value:** Streamlines the workflow and reduces manual copy-paste errors.

**Acceptance Criteria:**

- Given the results dialog is open with a generated string
- When I click the "Copy" button next to the string
- Then the entire InvoiceHeaven string is copied to my clipboard
- And the button text changes to "Copied" with a checkmark icon
- And a tooltip confirms "Copied to clipboard!"
- And the button returns to "Copy" after 2 seconds
- And I can paste the string into InvoiceHeaven or any other application

**Edge Cases:**

- Clipboard permission denied → Error handling (graceful degradation)
- Very long string → Still copies successfully
- Multiple rapid clicks → Only one copy operation

**Dependencies:** US-016, US-003

**Risks:** Browser clipboard API limitations

**Sub-Tasks:**

- Implement clipboard copy functionality
- Add visual feedback (button state change)
- Add tooltip confirmation
- Handle clipboard errors gracefully
- Add tests

**References:**

- `app/page.tsx` (lines 97-108, 273-292)
- Test: `tests/calculator.spec.ts` (lines 242-264)

**Change Note:** New

---

#### US-018: Copy Total Sum to Clipboard

**Story ID:** US-018  
**Title:** Copy Total Sum to Clipboard  
**Story Statement:** As an employee, I want to copy the total sum to my clipboard, so that I can use it in other applications or documents.

**Business Value:** Allows employees to use the total sum value in other contexts (e.g., email, spreadsheet).

**Acceptance Criteria:**

- Given the results dialog is open with a calculated total sum
- When I click the "Copy" button next to the total sum
- Then the total sum value (e.g., "1576.50") is copied to my clipboard
- And the button text changes to "Copied" with a checkmark icon
- And a tooltip confirms "Copied to clipboard!"
- And the button returns to "Copy" after 2 seconds

**Edge Cases:**

- Total sum = 0.00 → Still copies "0.00"
- Decimal values → Copies with 2 decimal places

**Dependencies:** US-016, US-001

**Risks:** None significant

**Sub-Tasks:**

- Implement total sum copy functionality
- Add visual feedback
- Format copied value (2 decimal places)
- Add tests

**References:**

- `app/page.tsx` (lines 294-319)
- Test: `tests/calculator.spec.ts` (lines 266-283)

**Change Note:** New

---

#### US-019: Theme Switching (Light/Dark/System)

**Story ID:** US-019  
**Title:** Theme Switching  
**Story Statement:** As an employee, I want to switch between light, dark, and system themes, so that I can use the calculator comfortably in different lighting conditions and according to my preferences.

**Business Value:** Improves user comfort and accessibility, especially for extended use.

**Acceptance Criteria:**

- Given I am on the calculator page
- When I see the theme switcher button (sun/moon/monitor icon) in the header
- Then I can click it to open a dropdown menu
- And I can select: Light, Dark, or System
- And the theme changes immediately
- And my preference is persisted (stored in browser)
- And the theme persists across page reloads
- And "System" follows my OS/browser theme preference

**Edge Cases:**

- First visit → Uses system theme or default
- Theme preference stored → Loads on next visit
- System theme changes → Calculator updates accordingly (if System selected)

**Dependencies:** None

**Risks:** Theme flash on initial load (mitigated by mounted state check)

**Sub-Tasks:**

- Integrate next-themes library
- Create theme switcher UI component
- Implement theme persistence
- Handle system theme detection
- Prevent flash of wrong theme
- Add tests (optional, visual)

**References:**

- `app/page.tsx` (lines 32-33, 141-169)
- `components/theme-provider.tsx`
- Uses next-themes library

**Change Note:** New

---

#### US-020: Responsive Design

**Story ID:** US-020  
**Title:** Responsive Design  
**Story Statement:** As an employee, I want the calculator to work well on mobile, tablet, and desktop devices, so that I can use it from any device.

**Business Value:** Enables flexible usage scenarios and improves accessibility.

**Acceptance Criteria:**

- Given I access the calculator on any device (mobile, tablet, desktop)
- When I view the calculator
- Then all input fields are visible and accessible
- And the layout adapts to screen size
- And touch interactions work on mobile devices
- And the dialog is properly sized for the viewport
- And text is readable without zooming

**Edge Cases:**

- Very small screens (320px) → Layout remains functional
- Landscape orientation → Layout adapts
- Large screens → Content doesn't stretch excessively

**Dependencies:** None

**Risks:** Poor mobile experience could reduce usage

**Sub-Tasks:**

- Implement responsive CSS/Tailwind classes
- Test on multiple screen sizes
- Ensure touch-friendly button sizes
- Optimize dialog for mobile
- Add viewport meta tag

**References:**

- `app/page.tsx` (responsive classes throughout)
- Tailwind CSS responsive utilities

**Change Note:** New

---

### Epic 5: Data Persistence & Recovery

#### US-021: Persist Tools Data in LocalStorage

**Story ID:** US-021  
**Title:** Persist Tools Data in LocalStorage  
**Story Statement:** As an employee, I want my tools entries to be saved automatically, so that I don't lose my work if I accidentally close the browser or navigate away.

**Business Value:** Prevents data loss and improves user experience, especially when entering multiple tools.

**Acceptance Criteria:**

- Given I have added and filled tool entries
- When I navigate away or close the browser
- Then my tools data is saved to browser localStorage
- And when I return to the calculator
- Then my tools entries are restored exactly as I left them
- And the restoration happens automatically on page load
- And if localStorage is empty or corrupted, a default empty tool is created

**Edge Cases:**

- First visit → No data, creates default empty tool
- localStorage disabled → Gracefully handles, works without persistence
- Corrupted localStorage data → Falls back to default empty tool
- Multiple browser tabs → Each tab has independent state (localStorage shared)

**Dependencies:** US-011

**Risks:** localStorage quota exceeded (rare), privacy concerns (data stored locally only)

**Sub-Tasks:**

- Implement localStorage save on tools change
- Implement localStorage load on component mount
- Handle localStorage errors gracefully
- Add default fallback
- Add tests (mock localStorage)

**References:**

- `hooks/useTools.ts` (lines 20-28)
- Storage key: "invoice-heaven-tools"

**Change Note:** New

---

### Epic 6: Calculation History & Limit Tracking

#### US-022: Save Calculation for Selected Month

**Story ID:** US-022  
**Title:** Save Calculation for Selected Month  
**Story Statement:** As an employee, I want to save my calculation with a selected month/year, so that I can track my reimbursement requests over time and reference them later.

**Business Value:** Enables tracking of monthly submissions, supports limit validation, and provides audit trail for reimbursement history.

**Acceptance Criteria:**

- Given I am on the calculator page (/create)
- When I have completed a calculation (entered values and clicked "Calculate")
- Then I can select a month/year using a month/year selector (shadcn Select component)
- And the selector shows available months with guardrails:
  - Cannot select months prior to employment start date
  - Cannot select future months (beyond current month)
  - Shows months from employment date (or 2 years ago if not set) to current month
- And I cannot select a month that already has a saved calculation (validation error shown)
- And when I click "Save Calculation"
- Then the system saves the calculation with:
  - All form field values (ML, MC, Tools, Integrations, Other)
- And the calculation is tagged with selected month and year (e.g., "2026-01")
- And the calculation is assigned a unique ID
- And the calculation includes a timestamp
- And the calculation includes the generated InvoiceHeaven string
- And the calculation includes the total sum
- And the calculation is saved to IndexedDB
- And I am navigated back to the home page (calculation list)
- And the new calculation appears in the list
- And the calculator state in localStorage is cleared after successful save

**Edge Cases:**

- Saving without entering any values → Saves with all zeros
- Trying to save for a month that already has a calculation → Validation error: "A calculation already exists for {month}. Please edit the existing calculation or select a different month."
- Browser refresh before save → Calculator state restored from localStorage
- Saving calculation with validation errors → Blocked, must fix errors first
- Trying to select future month → Not available in selector (restricted by guardrails)
- Trying to select month before employment date → Not available in selector (restricted by guardrails)
- Employment date not set → Selector shows last 2 years to current month

**Dependencies:** US-001, US-003, US-034 (calculator state persistence), US-035 (one calculation per month validation)

**Risks:** localStorage quota limits for many calculations, data loss if localStorage cleared before save

**Sub-Tasks:**

- Design calculation data structure/schema
- Implement month/year selector component using shadcn Select
- Add guardrails: restrict to employment date through current month
- Add month/year validation (one calculation per month)
- Implement save calculation functionality
- Add month/year tagging logic
- Generate unique IDs for calculations
- Store calculations in IndexedDB
- Implement navigation back to home page after save
- Clear localStorage state after successful save
- Add tests

**References:**

- Business rules: MasterLearner.pdf, MasterCare.pdf, Koszty bieżące i narzędzia pracy.pdf
- Period tracking: Monthly (ML, Costs), Bi-monthly (MC), Quarterly (Integrations)
- ADR-001: IndexedDB storage strategy

**Change Note:** Updated - Added month/year selector with guardrails (employment date to current month only), one calculation per month restriction, navigation to separate page, localStorage state persistence

---

#### US-023: View Calculation History List on Home Page

**Story ID:** US-023  
**Title:** View Calculation History List on Home Page  
**Story Statement:** As an employee, I want to view my saved calculations in a list on the home page, so that I can see my reimbursement history and access all calculations quickly.

**Business Value:** Provides visibility into past submissions, helps users understand their benefit usage patterns, and supports decision-making for future requests. Centralized home page improves navigation and workflow.

**Acceptance Criteria:**

- Given I am on the home page
- When the page loads
- Then above the calculation list, I see a summary section displaying current period usage and limits:
  - **Master Learner:** "Used: {amount} / Limit: 500 PLN" (current bi-monthly period; no employment-date dependency)
  - **Master Care:** "Used: {amount} / Limit: 750 PLN" (current bi-monthly period)
  - **Integrations (team-building):** "Used: {amount} / Limit: 1,500 PLN" (current quarter)
- And the usage is calculated from all calculations in the current period:
  - ML: Current bi-monthly period (Jan-Feb, Mar-Apr, etc.)
  - MC: Current bi-monthly period (Jan-Feb, Mar-Apr, etc.)
  - Integrations: Current quarter (Q1, Q2, Q3, Q4)
- And the limits are fixed (no employment-date dependency for ML):
  - ML limit: 500 PLN per bi-monthly period
  - MC limit: 750 PLN per bi-monthly period
  - Integrations limit: 1,500 PLN per quarter
- And I see a list of all saved calculations displayed in a table format below the summary
- And each calculation row displays the following columns:
  - **Month:** Month and year (e.g., "January 2026")
  - **Master Learner (ML):** Value in PLN
  - **Master Care (MC):** Value in PLN
  - **Tools:** Total tools value in PLN
  - **Integrations:** Integrations (team-building) value in PLN
  - **Other:** Other expenses value in PLN
  - **Total:** Total sum in PLN (formatted with 2 decimal places)
  - **Status:** Current status (Saved, Submitted, Declined, Approved) with visual indicator
  - **Actions:** Action buttons (Copy, Edit, Delete)
- And the list is sorted by month (newest first, or configurable)
- And at the top right corner of the page, I see three buttons:
  - **Import:** Import calculations from file (US-032)
  - **Export:** Export calculations to file (US-031)
  - **Add New Calculation:** Navigate to /create page
- And I can click on any row to view details (optional, or use action buttons)
- And the list shows an empty state if no calculations exist

**Edge Cases:**

- No saved calculations → Shows empty state message with "Add New Calculation" button
- Calculations from multiple years → All displayed in single list, sorted by date
- Very long list → Pagination or virtual scrolling (if needed)
- Calculations from current month → May be highlighted
- All columns fit on screen → Responsive design handles smaller screens

**Dependencies:** US-022, US-026 (accumulated usage calculation), US-031, US-032, US-038 (employment date)

**Risks:** Performance issues with large history lists, table may be wide on smaller screens

**Sub-Tasks:**

- Create home page layout with calculation list
- Design table component with all required columns
- Implement calculation list data fetching from IndexedDB
- Add action buttons (Copy, Edit, Delete) to each row
- Add top-right action buttons (Import, Export, Add New)
- Implement sorting functionality
- Design empty state
- Add responsive design for mobile/tablet
- Add pagination if needed
- Add tests

**References:**

- Date handling: date-fns library (already installed)
- ADR-001: IndexedDB storage strategy

**Change Note:** Updated - Changed to home page list view with table format, specific columns, and top-right action buttons

---

#### US-024: Edit Saved Calculation

**Story ID:** US-024  
**Title:** Edit Saved Calculation  
**Story Statement:** As an employee, I want to edit a saved calculation, so that I can correct errors or update it if my invoice was declined and I need to resubmit.

**Business Value:** Allows correction of mistakes and resubmission after invoice decline, reducing need to recreate calculations from scratch.

**Acceptance Criteria:**

- Given I am on the home page with calculation list
- When I click "Edit" button on a saved calculation
- Then I am navigated to the calculator page (/create or /edit/{id})
- And the calculator form is populated with the saved calculation values:
  - Master Learner value
  - Master Care value
  - All tools entries (names, amounts, currencies, exchange rates)
  - Integrations value
  - Other value
  - Month selector shows the calculation's month (disabled/read-only)
- And I can modify any field (ML, MC, Tools, Integrations, Other)
- And I can add, remove, or modify tools entries
- And the calculator state is persisted in localStorage as I make changes
- And when I click "Save" after editing
- Then the calculation is updated in IndexedDB (not created as new)
- And the updated timestamp is changed
- And I am navigated back to the home page
- And the updated calculation appears in the list with updated values
- And the calculator state in localStorage is cleared after successful save
- And when I click "Cancel" button
- Then a confirmation dialog appears: "Are you sure you want to cancel? Unsaved changes will be lost."
- And if I confirm cancellation:
  - I am navigated back to the home page
  - Unsaved changes are discarded
  - Calculator state in localStorage is cleared
- And if I cancel the confirmation dialog:
  - I remain on the calculator page
  - Can continue editing

**Edge Cases:**

- Editing calculation with invalid data → Validation errors shown, save blocked
- Browser refresh during edit → Calculator state restored from localStorage
- Editing and changing month → Month selector should be disabled/read-only (cannot change month when editing)
- Canceling without making changes → Still shows confirmation (or skip if no changes detected)
- Network error during save → Error message shown, remain on page, state preserved

**Dependencies:** US-022, US-023, US-034 (calculator state persistence)

**Risks:** Data integrity if editing submitted calculations, confusion about versioning, data loss if localStorage cleared

**Sub-Tasks:**

- Implement edit navigation (route to /create or /edit/{id})
- Load calculation data from IndexedDB
- Populate calculator form with saved values
- Disable month selector when editing (read-only)
- Implement update logic (update existing calculation, not create new)
- Add Cancel button with confirmation dialog
- Implement navigation back to home page after save
- Clear localStorage state after successful save/cancel
- Add tests

**References:**

- Business context: Invoice decline scenarios require editing
- ADR-001: IndexedDB storage strategy

**Change Note:** Updated - Added navigation to separate calculator page, localStorage state persistence, cancel confirmation dialog, month selector read-only when editing

---

#### US-025: Create Calculation from Existing (Clone)

**Story ID:** US-025  
**Title:** Create Calculation from Existing (Clone)  
**Story Statement:** As an employee, I want to create a new calculation based on an existing one, so that I can quickly create similar calculations for a different month without re-entering all data.

**Business Value:** Improves efficiency when submitting similar reimbursement requests, especially for recurring expenses or monthly submissions.

**Acceptance Criteria:**

- Given I am on the home page with calculation list
- When I click "Clone" or "Create from this" button on a saved calculation
- Then I am navigated to the calculator page (/create)
- And the calculator form is pre-filled with values copied from the selected calculation:
  - Master Learner value
  - Master Care value
  - All tools entries (names, amounts, currencies, exchange rates)
  - Integrations value
  - Other value
- And the month selector shows current month (or next available month)
- And I can modify any values before saving
- And I must select a different month (one calculation per month restriction applies)
- And when I save, it creates a new calculation (not updating the original)
- And the new calculation is tagged with the selected month/year
- And the original calculation remains unchanged
- And I am navigated back to the home page after save
- And the new calculation appears in the list

**Edge Cases:**

- Cloning from previous month → Month selector shows current/next available month
- Cloning calculation with tools → All tools entries copied
- Cloning and then canceling → No new calculation created, navigated back to list
- Cloning calculation with validation errors → Errors not copied, form starts valid
- Cloning to a month that already has a calculation → Month selector validation prevents save

**Dependencies:** US-022, US-023, US-034, US-035

**Risks:** Accidental duplicate submissions if user forgets to modify values or select different month

**Sub-Tasks:**

- Implement clone/duplicate functionality
- Add "Clone" button to calculation list row
- Copy calculation data to new form
- Navigate to /create page with pre-filled data
- Set month selector to current/next available month
- Generate new calculation ID
- Tag with selected month/year
- Add tests

**References:**

- Use case: Monthly recurring expenses
- Similar to US-024 (edit) but creates new calculation instead of updating

**Change Note:** Updated - Added navigation to /create page, month selector requirement, one calculation per month validation

---

#### US-026: Calculate Accumulated Usage per Benefit Category

**Story ID:** US-026  
**Title:** Calculate Accumulated Usage per Benefit Category  
**Story Statement:** As an employee, I want to see my accumulated usage for each benefit category within their respective periods, so that I know how much budget I have remaining.

**Business Value:** Prevents over-submission by showing remaining budget, helps users plan their benefit usage, and ensures compliance with benefit limits.

**Acceptance Criteria:**

- Given I have saved calculations
- When the system calculates accumulated usage
- Then for Master Learner:
  - Sum all ML values from **current bi-monthly period** (Jan-Feb, Mar-Apr, May-Jun, etc.)
  - Show: Used / Period Limit (e.g., "300 / 500 PLN")
  - Show remaining: Period Limit - Used (limit = 500 PLN per bi-monthly period; no employment-date dependency)
- And for Master Care:
  - Sum all MC values from current bi-monthly period (Jan-Feb, Mar-Apr, May-Jun, etc.)
  - Show: Used / Period Limit (e.g., "500 / 750 PLN")
  - Show remaining: Period Limit - Used
- And for Integrations (team-building):
  - Sum all Integrations values from current quarter (Q1, Q2, Q3, Q4)
  - Note: Only individual travel expenses (accommodation + transport) are tracked; group activities handled by organizers
  - Show: Used / Quarterly Limit (e.g., "1,200 / 1,500 PLN")
  - Show remaining: Quarterly Limit - Used
- And the accumulated usage is displayed in the calculator or history view
- And the calculation updates automatically when new calculations are saved

**Edge Cases:**

- No calculations in period → Shows "0 / Limit PLN"
- Usage exceeds limit → Shows negative remaining (with warning)
- Calculations from different periods → Only current period counted
- Period transition → Master Learner and Master Care reset every 2 months; Integrations every quarter

**Dependencies:** US-022, US-023

**Risks:** Incorrect period calculation could lead to wrong limits

**Sub-Tasks:**

- Implement period calculation logic (monthly, bi-monthly, quarterly, annual)
- Create accumulated usage calculation functions
- Determine current period based on date
- Sum calculations within period
- Display usage summary UI
- Handle period transitions
- Add tests for period boundaries

**References:**

- Business rules:
  - Master Learner: See [Business Rules](#-business-rules) – 500 PLN per bi-monthly period (no employment-date dependency)
  - Master Care: 750 PLN every 2 months, bi-monthly period starting January
  - Integrations (team-building): Fixed 1,500 PLN quarterly (individual travel expenses only)
- Integracje projektowe + przyjazdy do biura.pdf: Individual employees settle travel expenses individually; organizers handle group activities

**Change Note:** Updated per feedback – ML simplified to bi-monthly 500 PLN; Budget category removed from accumulated usage.

---

#### US-027: Validate Against Accumulated Benefit Limits

**Story ID:** US-027  
**Title:** Validate Against Accumulated Benefit Limits  
**Story Statement:** As an employee, I want the system to validate my new calculation against my accumulated usage, so that I don't exceed my benefit limits and my invoice isn't rejected.

**Business Value:** Prevents over-submission, reduces invoice rejections, and ensures compliance with benefit program rules.

**Acceptance Criteria:**

- Given I am creating a new calculation
- When I enter values for Master Learner, Master Care, or Integrations
- Then the system checks my accumulated usage for the current period
- And if ML + accumulated ML > bi-monthly limit (500 PLN):
  - Show validation error: "Master Learner: You have used {accumulated} PLN in this period. This entry ({new}) would exceed the period limit of 500 PLN. Remaining: {remaining} PLN"
  - Block calculation save
- And if MC + accumulated MC > bi-monthly limit (750 PLN):
  - Show validation error: "Master Care: You have used {accumulated} PLN in this period. This entry ({new}) would exceed the period limit of 750 PLN. Remaining: {remaining} PLN"
  - Block calculation save
- And if Integrations + accumulated Integrations > quarterly limit (1,500 PLN):
  - Show validation error: "Integrations: You have used {accumulated} PLN this quarter for travel expenses. This entry ({new}) would exceed the quarterly limit of 1,500 PLN. Remaining: {remaining} PLN. Note: Only individual travel expenses (accommodation and transport) are tracked here."
  - Block calculation save
- And validation happens in real-time as I type
- And I can see remaining budget displayed next to each field
- And when editing a saved calculation, validation uses the original value (not double-counting)

**Edge Cases:**

- First calculation of period → No accumulated usage, only per-entry validation
- Calculation exactly at limit → Accepted (e.g., 500 PLN total for ML in current bi-monthly period)
- Calculation exceeding limit by small amount → Rejected with clear error
- Editing calculation → Validation subtracts original value, adds new value
- Multiple calculations in same session → Each validated against current accumulated total
- Period transition during session → Validation updates to new period limits

**Dependencies:** US-004, US-005, US-007, US-026

**Risks:** Complex validation logic, potential for bugs in period calculations

**Sub-Tasks:**

- Integrate accumulated usage into validation logic
- Update Master Learner validation (US-004) to check bi-monthly limit (500 PLN)
- Update Master Care validation (US-005) to check bi-monthly limit
- Add Integrations validation (US-007) to check quarterly limit
- Display remaining budget indicators
- Handle editing scenarios (subtract original, add new)
- Add real-time validation feedback
- Update error messages to include usage context
- Add comprehensive tests for period boundaries

**References:**

- Business rules: Master Learner 500 PLN per bi-monthly period (see [Business Rules](#-business-rules)); Master Care 750 PLN every 2 months; Integracje 1,500 PLN quarterly (individual travel expenses only)
- Existing validation: US-004, US-005, US-007

**Change Note:** Updated per feedback – ML validation changed to bi-monthly 500 PLN limit; no employment-date dependency.

---

#### US-028: Display Remaining Budget Indicators

**Story ID:** US-028  
**Title:** Display Remaining Budget Indicators  
**Story Statement:** As an employee, I want to see how much budget I have remaining for each benefit category, so that I can plan my reimbursement requests accordingly.

**Business Value:** Improves user experience by providing proactive information, helps users make informed decisions, and reduces trial-and-error.

**Acceptance Criteria:**

- Given I am on the calculator page
- When the page loads or I enter values
- Then I see next to each benefit field:
  - Master Learner: "Remaining: X / 500 PLN" (current bi-monthly period; no employment-date dependency)
  - Master Care: "Remaining: X / 750 PLN" (current bi-monthly period)
  - Integrations (team-building): "Remaining: X / 1,500 PLN (travel expenses only)" (current quarter)
- And the remaining amount updates in real-time as I type
- And if remaining is low (< 10% of limit), show warning color (e.g., orange)
- And if remaining is 0 or negative, show error color (e.g., red)
- And the indicator shows the period (e.g., "Jan-Feb 2026" for MC)
- And clicking the indicator shows detailed breakdown (optional)

**Edge Cases:**

- No calculations saved → Shows full limit as remaining
- Period just started → Shows full limit
- Period ending soon → Still shows current period limit
- Multiple periods in history → Only current period shown

**Dependencies:** US-026, US-027

**Risks:** UI clutter if too much information displayed

**Sub-Tasks:**

- Design remaining budget indicator UI component
- Calculate remaining budget in real-time
- Add color coding (green/yellow/red)
- Display period information
- Add tooltip or detailed view (optional)
- Update indicators as user types
- Add tests

**References:**

- UI pattern: Inline validation with helpful hints

**Change Note:** Updated per feedback – ML remaining shows 500 PLN bi-monthly limit; no employment-date dependency.

---

#### US-029: Filter Calculations by Status

**Story ID:** US-029  
**Title:** Filter Calculations by Status  
**Story Statement:** As an employee, I want to filter my calculation history by status (e.g., Saved, Submitted, Declined, Approved), so that I can quickly find calculations that need attention or resubmission.

**Business Value:** Helps users manage their reimbursement workflow, especially when dealing with declined invoices that need editing and resubmission.

**Acceptance Criteria:**

- Given I have calculations with different statuses
- When I view the calculation history
- Then I can filter by status:
  - All (default)
  - Saved (draft, not yet submitted)
  - Submitted (sent to InvoiceHeaven)
  - Declined (rejected, needs editing)
  - Approved (accepted and processed)
- And the filter applies immediately
- And I can see the count of calculations per status
- And calculations are visually distinguished by status (e.g., color coding, icons)

**Edge Cases:**

- No calculations with selected status → Shows empty state
- Multiple filters → Single-select filter (or multi-select if needed)
- Status changes → Filter updates dynamically

**Dependencies:** US-022, US-023

**Risks:** None significant

**Sub-Tasks:**

- Add status field to calculation data model
- Implement status filtering logic
- Add filter UI component (dropdown or tabs)
- Add status indicators (colors, icons)
- Add status counts
- Add tests

**References:**

- Use case: Managing declined invoices for resubmission

**Change Note:** New

---

#### US-030: Mark Calculation Status (Submitted/Declined/Approved)

**Story ID:** US-030  
**Title:** Mark Calculation Status  
**Story Statement:** As an employee, I want to mark my calculations with their status (Submitted, Declined, Approved), so that I can track the lifecycle of my reimbursement requests.

**Business Value:** Provides workflow management, helps identify calculations needing attention, and supports the editing workflow for declined invoices.

**Acceptance Criteria:**

- Given I have a saved calculation
- When I want to update its status
- Then I can select status from: Saved, Submitted, Declined, Approved
- And I can change status at any time
- And when I mark as "Declined":
  - The calculation is highlighted or flagged
  - I can easily access the "Edit" action
  - Optional: System suggests creating a new calculation from this one
- And status changes are saved immediately
- And status is visible in the calculation history list
- And I can filter by status (US-029)

**Edge Cases:**

- Changing status of old calculation → Status updated, timestamp may or may not change
- Marking as "Declined" then editing → Status can be changed to "Resubmitted" or "Saved"
- Multiple status changes → Latest status is saved

**Dependencies:** US-022, US-023, US-024

**Risks:** None significant

**Sub-Tasks:**

- Add status management to calculation data model
- Implement status update functionality
- Add status selector UI (dropdown or buttons)
- Add visual status indicators
- Integrate with edit workflow for declined calculations
- Add tests

**References:**

- Workflow: Save → Submit → (Decline → Edit → Resubmit) → Approve

**Change Note:** New

---

#### US-031: Export Calculations to File

**Story ID:** US-031  
**Title:** Export Calculations to File  
**Story Statement:** As an employee, I want to export my calculation history to a file, so that I can create a backup and protect my data from loss.

**Business Value:** Provides data safety and backup capability, allowing users to preserve their calculation history independently of browser storage. Critical for data recovery if browser data is cleared or device is lost.

**Acceptance Criteria:**

- Given I have saved calculations in my history
- When I click "Export Calculations" (or similar action)
- Then I can choose to export:
  - All calculations
  - Calculations filtered by date range
  - Calculations filtered by status
  - Calculations for specific month/year
- And the system generates a JSON file containing:
  - All selected calculations with complete data (values, InvoiceHeaven strings, totals, metadata)
  - Export metadata:
    - Export date (ISO timestamp)
    - Version number from package.json (via NEXT_PUBLIC_VERSION environment variable)
    - Number of calculations exported
  - Data structure compatible with import functionality
- And the file is automatically downloaded with a descriptive filename (e.g., "invoice-heaven-calculations-2026-01-16.json")
- And the file is human-readable JSON format
- And I can save the file to my preferred location
- And the export includes a warning/note about data privacy (sensitive financial information)

**Edge Cases:**

- No calculations to export → Show message "No calculations to export"
- Very large export (1000+ calculations) → Still works, may take a few seconds
- Export during active session → Current unsaved changes not included (or show warning)
- Browser download restrictions → Handle gracefully, show instructions if needed
- File name conflicts → Append timestamp or increment number

**Dependencies:** US-022, US-023

**Risks:** Large exports may be slow, JSON files contain sensitive data (privacy concern)

**Sub-Tasks:**

- Implement export functionality
- Create JSON serialization logic
- Add export filters (all, date range, status, month)
- Generate descriptive filenames
- Add export metadata (including version from package.json via NEXT_PUBLIC_VERSION)
- Handle large datasets efficiently
- Add privacy warning/note
- Add tests

**References:**

- ADR-001: Export functionality mentioned as safety feature
- Data structure: Calculation interface from ADR-001
- Version source: `package.json` version exposed as `NEXT_PUBLIC_VERSION` in `next.config.mjs`
- Implementation: `utils/export.ts` uses `process.env.NEXT_PUBLIC_VERSION`

**Change Note:** New

---

#### US-032: Import Calculations from File

**Story ID:** US-032  
**Title:** Import Calculations from File  
**Story Statement:** As an employee, I want to import calculations from a previously exported file, so that I can restore my backup or transfer calculations to a new device.

**Business Value:** Enables data recovery, device migration, and backup restoration. Critical safety feature for protecting user data.

**Acceptance Criteria:**

- Given I have an exported calculation file (JSON format)
- When I click "Import Calculations" (or similar action)
- Then I can select a JSON file from my device
- And the system validates the file format:
  - Checks if file is valid JSON
  - Validates calculation data structure
  - Checks for required fields
- And if file is valid:
  - System parses all calculations from file
  - Shows preview: number of calculations, date range, status summary
  - Asks for import strategy:
    - Merge: Add imported calculations to existing ones (keep duplicates)
    - Replace: Replace all existing calculations with imported ones
    - Skip duplicates: Only import calculations that don't already exist (by ID)
- And when I confirm import:
  - Calculations are imported into IndexedDB
  - System shows success message with count of imported calculations
  - Calculation history is refreshed
  - Any duplicates are handled according to selected strategy
- And if file is invalid:
  - System shows clear error message explaining the issue
  - Import is cancelled
  - No data is modified

**Edge Cases:**

- Invalid JSON file → Show error, don't import anything
- Missing required fields → Show error listing missing fields
- Duplicate IDs (merge strategy) → Create new IDs for imported duplicates, or skip
- Import file from different version → Handle schema differences gracefully, show warnings
- Very large import file → Process in batches, show progress
- Import during active session → Show warning about unsaved changes
- Corrupted file → Validate before import, show error
- Empty file → Show message "No calculations found in file"

**Dependencies:** US-022, US-023, US-031

**Risks:**

- Data corruption if import fails mid-process (mitigate with transaction rollback)
- Privacy: Imported files may contain sensitive data
- Schema version mismatches (future versions may have different structure)

**Sub-Tasks:**

- Implement file selection (input type="file")
- Create JSON parsing and validation logic
- Validate calculation data structure
- Implement import preview
- Add import strategy selection (merge/replace/skip duplicates)
- Handle duplicate detection and resolution
- Add transaction support (rollback on error)
- Add progress indicator for large imports
- Handle schema version differences
- Add comprehensive error handling
- Add tests (mock file reading)

**References:**

- ADR-001: Import functionality for backup restoration
- Data structure: Calculation interface from ADR-001
- File API: HTML5 File API

**Change Note:** New

---

#### US-033: Validate Period-Based Input Restrictions

**Story ID:** US-033  
**Title:** Validate Period-Based Input Restrictions  
**Story Statement:** As an employee, I want the system to prevent me from entering benefit values in calculations for months outside their settlement periods, so that I don't create invalid reimbursement requests.

**Business Value:** Ensures compliance with benefit settlement periods. Master Learner and Master Care are settled bi-monthly (same settlement months: Feb, Apr, Jun, Aug, Oct, Dec); Integrations are settled quarterly. Values can only be entered in calculations for months within the correct period. This prevents errors and ensures accurate period-based limit tracking.

**Acceptance Criteria:**

- Given I am creating or editing a calculation with a specific month/year
- When I try to enter Master Learner or Master Care value
- Then the system checks if the calculation's month is the settlement month for the current bi-monthly period (ML and MC share the same rule):
  - Jan-Feb period: Only February calculations can have MC values (settlement month)
  - Mar-Apr period: Only April calculations can have MC values (settlement month)
  - May-Jun period: Only June calculations can have MC values (settlement month)
  - Jul-Aug period: Only August calculations can have MC values (settlement month)
  - Sep-Oct period: Only October calculations can have MC values (settlement month)
  - Nov-Dec period: Only December calculations can have MC values (settlement month)
- And if the calculation month is not the settlement month:
  - ML and MC fields are disabled or show validation error
  - Error message clearly indicates the settlement month for the current period and why the month is invalid
- And when I try to enter Integrations value
- Then the system checks if the calculation's month is within the current quarterly period:
  - Q1 (Jan-Mar): Only January, February, and March calculations can have Integrations values
  - Q2 (Apr-Jun): Only April, May, and June calculations can have Integrations values
  - Q3 (Jul-Sep): Only July, August, and September calculations can have Integrations values
  - Q4 (Oct-Dec): Only October, November, and December calculations can have Integrations values
- And if the calculation month is outside the current quarter:
  - Integrations field is disabled or shows validation error
  - Error message clearly indicates the current quarter and why the month is invalid
- And the validation updates automatically when:
  - Calculation month/year is changed
  - Period transitions occur (e.g., Feb → Mar, Mar → Apr)
- And the validation is applied both when:
  - Creating new calculations
  - Editing existing calculations (re-validates based on calculation month)

**Edge Cases:**

- Creating calculation for future month → Validates against that month's period, not current date
- Creating calculation for past month → Validates against that month's period (may be outside current period)
- Editing calculation and changing month → Re-validates all period-based fields
- Period boundary (e.g., last day of Feb, first day of Mar) → Validation based on calculation month, not current date
- Entering MC in first month of period (Jan, Mar, May, etc.) → Rejected (only second month allowed)
- Multiple calculations in same session → Each validated independently based on its month
- Importing calculations from file → Period validation applied during import validation

**Dependencies:** US-022 (calculation month/year), US-004 (Master Learner input), US-005 (Master Care input), US-007 (Integrations input)

**Risks:**

- Users may be confused why they can't enter values in certain months
- Need clear error messages explaining settlement periods
- Validation logic complexity (period calculations)

**Sub-Tasks:**

- Implement period calculation utilities:
  - `getCurrentBiMonthlyPeriod()` - Returns current bi-monthly period (Jan-Feb, Mar-Apr, etc.)
  - `getBiMonthlySettlementMonth(period)` - Returns settlement month for period (Feb, Apr, Jun, Aug, Oct, Dec)
  - `getCurrentQuarter()` - Returns current quarter (Q1, Q2, Q3, Q4)
  - `isMonthBiMonthlySettlementMonth(month, period)` - Checks if month is the settlement month for bi-monthly period
  - `isMonthInQuarter(month, quarter)` - Checks if month is in quarter
- Integrate period validation into ML field (US-004) and MC field (US-005) — same bi-monthly settlement rule
- Integrate period validation into Integrations field (US-007)
- Add validation error messages with period information
- Add helper text explaining settlement periods
- Handle period transitions gracefully
- Add comprehensive tests for all period boundaries
- Test with calculations for different months

**References:**

- Business rules:
  - MasterCare.pdf: 750 PLN every 2 months, settled bi-monthly (Jan-Feb, Mar-Apr, etc.)
  - Integracje projektowe + przyjazdy do biura.pdf: 1,500 PLN quarterly, settled quarterly (Q1-Q4)
- User Stories: US-004, US-005, US-007, US-022
- Business rules: ML and MC both bi-monthly (500 PLN and 750 PLN per period respectively); see [Business Rules](#-business-rules)

**Change Note:** Updated per feedback – ML added to period-based validation (same settlement months as MC).

---

#### US-034: Persist Calculator State in LocalStorage

**Story ID:** US-034  
**Title:** Persist Calculator State in LocalStorage  
**Story Statement:** As an employee, I want my calculator input to be automatically saved as I type, so that I don't lose my work if I accidentally close the browser or navigate away before saving.

**Business Value:** Prevents data loss during calculation entry, especially for complex calculations with multiple tools and values. Critical for user experience when entering detailed reimbursement data.

**Acceptance Criteria:**

- Given I am on the calculator page (/create)
- When I enter values in any field (ML, MC, Tools, Integrations, Other)
- Then the calculator state is automatically saved to localStorage after each change
- And the state includes:
  - All form field values
  - All tools entries
  - Selected month (if applicable)
  - Calculation mode (new/edit)
  - Calculation ID (if editing)
- And when I return to the calculator page (e.g., after browser refresh)
- Then the calculator form is automatically populated with saved values from localStorage
- And I can continue where I left off
- And when I successfully save the calculation
- Then the localStorage state is cleared
- And when I cancel and confirm cancellation
- Then the localStorage state is cleared

**Edge Cases:**

- First visit to calculator → No saved state, form is empty
- localStorage disabled → Calculator works without persistence, user warned
- Corrupted localStorage data → Falls back to empty form, shows warning
- Multiple browser tabs → Each tab has independent state (localStorage shared, may conflict)
- Very large state → localStorage quota may be exceeded (rare, but handle gracefully)

**Dependencies:** US-022, US-024

**Risks:** localStorage quota exceeded (rare), state conflicts between tabs, privacy concerns

**Sub-Tasks:**

- Design calculator state data structure
- Implement auto-save on field changes (debounced)
- Implement state restoration on page load
- Clear state after successful save
- Clear state after confirmed cancel
- Handle localStorage errors gracefully
- Add state versioning for future compatibility
- Add tests (mock localStorage)

**References:**

- Storage key: "invoice-heaven-calculator-state"
- Similar to US-021 (Tools persistence)

**Change Note:** New

---

#### US-035: Enforce One Calculation Per Month

**Story ID:** US-035  
**Title:** Enforce One Calculation Per Month  
**Story Statement:** As an employee, I want the system to prevent me from creating multiple calculations for the same month, so that I maintain a single reimbursement request per month and avoid confusion.

**Business Value:** Ensures data integrity, prevents duplicate submissions, and maintains clear one-to-one relationship between months and calculations. Simplifies tracking and limit validation.

**Acceptance Criteria:**

- Given I am creating a new calculation on the calculator page
- When I select a month using the month selector
- Then the system checks if a calculation already exists for that month
- And if a calculation exists for the selected month:
  - Month selector shows validation error
  - Error message: "A calculation already exists for {month}. Please edit the existing calculation or select a different month."
  - Save button is disabled or blocked
  - I cannot proceed with saving until I select a different month
- And if no calculation exists for the selected month:
  - Month selector shows no error
  - Save button is enabled
  - I can proceed with saving
- And when editing an existing calculation:
  - Month selector is disabled/read-only
  - Shows the calculation's month
  - No validation needed (editing existing calculation for its month)

**Edge Cases:**

- Checking month availability → Query IndexedDB for existing calculations
- Month selector for future months → May be allowed or restricted (business decision)
- Multiple tabs trying to save for same month → First save succeeds, second shows error
- Importing calculations → Validation applied during import (skip duplicates or show conflicts)

**Dependencies:** US-022, US-023

**Risks:** Performance if checking on every keystroke (should check on month selection only)

**Sub-Tasks:**

- Implement month availability check function
- Query IndexedDB for existing calculations by month
- Add validation to month selector
- Display validation error message
- Disable save button when validation fails
- Handle month selector in edit mode (disabled/read-only)
- Add tests for duplicate month scenarios

**References:**

- ADR-001: IndexedDB storage strategy
- Business rule: One calculation per month

**Change Note:** New

---

#### US-036: Delete Calculation with Confirmation

**Story ID:** US-036  
**Title:** Delete Calculation with Confirmation  
**Story Statement:** As an employee, I want to delete a calculation with a confirmation step, so that I don't accidentally lose important data.

**Business Value:** Allows users to remove incorrect or unwanted calculations while preventing accidental deletions through confirmation dialog.

**Acceptance Criteria:**

- Given I am on the home page with calculation list
- When I click "Delete" button on a calculation row
- Then a confirmation dialog appears with:
  - Title: "Delete Calculation?"
  - Message: "Are you sure you want to delete the calculation for {month}? This action cannot be undone."
  - Buttons: "Cancel" and "Delete"
- And if I click "Cancel":
  - Dialog closes
  - Calculation remains in the list
  - No changes made
- And if I click "Delete":
  - Calculation is removed from IndexedDB
  - Calculation disappears from the list immediately
  - Success message shown: "Calculation for {month} deleted successfully"
  - Dialog closes
- And the list updates to reflect the deletion

**Edge Cases:**

- Deleting the only calculation → List shows empty state
- Deleting calculation with status "Submitted" → May show additional warning (optional)
- Network error during deletion → Error message shown, calculation remains
- Multiple rapid delete clicks → Only one deletion processed

**Dependencies:** US-022, US-023

**Risks:** Accidental deletion, data loss if confirmed by mistake

**Sub-Tasks:**

- Implement delete button in calculation list row
- Create confirmation dialog component
- Implement delete functionality (remove from IndexedDB)
- Update list after deletion
- Add success/error messages
- Handle edge cases
- Add tests

**References:**

- ADR-001: IndexedDB storage strategy
- UI pattern: Confirmation dialogs for destructive actions

**Change Note:** New

---

#### US-037: Copy Calculation InvoiceHeaven String from List

**Story ID:** US-037  
**Title:** Copy Calculation InvoiceHeaven String from List  
**Story Statement:** As an employee, I want to copy the InvoiceHeaven string directly from the calculation list, so that I can quickly paste it into the InvoiceHeaven system without opening the calculation details.

**Business Value:** Improves workflow efficiency by allowing quick access to InvoiceHeaven strings without navigating to detail view or editing the calculation.

**Acceptance Criteria:**

- Given I am on the home page with calculation list
- When I click "Copy" button on a calculation row
- Then the InvoiceHeaven string for that calculation is copied to my clipboard
- And a success indicator appears (e.g., button changes to "Copied" with checkmark)
- And a tooltip or toast message confirms: "Copied to clipboard!"
- And the indicator returns to "Copy" after 2 seconds
- And I can paste the string into InvoiceHeaven or any other application

**Edge Cases:**

- Clipboard permission denied → Error message shown, graceful degradation
- Very long string → Still copies successfully
- Multiple rapid clicks → Only one copy operation

**Dependencies:** US-022, US-023

**Risks:** Clipboard API limitations in some browsers

**Sub-Tasks:**

- Implement copy button in calculation list row
- Add clipboard copy functionality
- Add visual feedback (button state change)
- Add tooltip/toast confirmation
- Handle clipboard errors gracefully
- Add tests

**References:**

- Similar to US-017 (copy from dialog)
- Clipboard API: navigator.clipboard.writeText()

**Change Note:** New

---

#### US-038: Enter Employment Start Date

**Story ID:** US-038  
**Title:** Enter Employment Start Date  
**Story Statement:** As an employee, I want to enter my employment start date (month and year), so that the system can correctly narrow down the months for which I can create calculations (e.g., from employment month to current month).

**Business Value:** Employment date is used for **month/year selector guardrails only** (restrict selectable months to from-employment to current). It is **not** used for Master Learner or Integrations limit calculation; ML is fixed 500 PLN per bi-monthly period and Integrations 1,500 PLN per quarter (no employment-date dependency). See [Business Rules](#-business-rules).

**Acceptance Criteria:**

- Given I am using the calculator for the first time (or employment date not set)
- When the system detects no employment date is stored
- Then I am prompted to enter my employment start date
- And I can enter:
  - Month (1-12 or month name)
  - Year (e.g., 2025, 2026)
- And the employment date is saved to localStorage or IndexedDB
- And I can update my employment date only if no calculations exist yet
- And once calculations exist, the employment date cannot be changed (button disabled with tooltip explanation)
- And the employment date is used for:
  - Month/year selector: restrict selectable months to from employment to current (guardrails)
  - Display in settings or profile (optional)
- And if employment date is not set:
  - Month selector may default to a reasonable range (e.g., 2 years ago to current)
  - ML limit is always 500 PLN per bi-monthly period; Integrations 1,500 PLN per quarter (no dependency on employment date)

**Edge Cases:**

- Entering future employment date → Validation error: "Employment date cannot be in the future"
- Entering very old employment date (e.g., 2000) → Accepted (may be valid for long-term employees)
- Trying to change employment date after calculations exist → Button disabled, cannot open dialog, tooltip explains restriction
- Employment date not set → Month selector uses default range; ML/Integrations limits unaffected

**Dependencies:** US-022 (month selector), US-026, US-027 (limits do not depend on employment date)

**Risks:** Users may set incorrect employment date initially (cannot change after calculations exist)

**Sub-Tasks:**

- Design employment date input UI (month/year selector)
- Implement employment date storage (localStorage or IndexedDB)
- Add employment date validation (not in future, reasonable date range)
- Use employment date for month selector guardrails only (not for ML/Integrations limits)
- Add employment date display/editing in settings or profile
- Implement check for existing calculations (disable changes if any exist)
- Disable button and inputs when calculations exist
- Add tooltip explaining restriction
- Hide Clear button when calculations exist
- Add tests

**References:**

- Business rules: Master Learner 500 PLN per bi-monthly period (no employment dependency); Integrations 1,500 PLN quarterly; see [Business Rules](#-business-rules)
- Q-008: Master Learner pro-rating (resolved by simplification: ML is now fixed 500 PLN per bi-monthly period)

**Change Note:** Updated per feedback – employment date no longer used for ML limit; used for month selector guardrails only.

---

#### US-039: Store User Settings in IndexedDB

**Story ID:** US-039  
**Title:** Store User Settings in IndexedDB  
**Story Statement:** As an employee, I want my user settings (employment date, theme preference) to be stored in IndexedDB alongside my calculations, so that all my data is centralized and can be exported/imported together.

**Business Value:** Provides a unified data storage approach, enabling complete backup/restore of user data including preferences.

**Acceptance Criteria:**

- Given I am using the application
- When I set my employment date
- Then it is saved to both IndexedDB (settings store) and localStorage (for backward compatibility)
- And when I change my theme preference
- Then it is saved to IndexedDB settings store
- And when I export my data
- Then the export file includes my user settings
- And when I import data with settings
- Then my settings are restored from the import file
- And the settings are applied immediately (employment date loaded, theme applied)

**Edge Cases:**

- First-time user with no settings → Default settings created on first save
- Migrating from localStorage-only to IndexedDB → Settings automatically migrated on first load
- Import file without settings (old format) → Only calculations imported, settings unchanged
- Import file with settings → Settings overwrite current settings with confirmation

**Dependencies:** US-031 (Export), US-032 (Import), US-038 (Employment Date)

**Risks:**

- Settings migration from localStorage to IndexedDB may fail → Fallback to localStorage
- IndexedDB not supported in browser → Fallback to localStorage only

**Sub-Tasks:**

- Create UserSettings type definition
- Add settings object store to IndexedDB schema (v2)
- Implement SettingsService with get/save/clear/import methods
- Update EmploymentDateManager to sync with IndexedDB
- Migrate existing localStorage settings to IndexedDB on first load
- Add tests for settings persistence

**References:**

- D-014: User Settings Storage Strategy (IndexedDB primary, localStorage fallback)

**Change Note:** New in v2.6

---

#### US-040: Export User Settings with Calculations

**Story ID:** US-040  
**Title:** Export User Settings with Calculations  
**Story Statement:** As an employee, I want my user settings (employment date, theme) to be included in the exported JSON file, so that I can restore my complete configuration when importing the file.

**Business Value:** Provides complete backup/restore capability, ensuring users don't lose their preferences when moving between devices or recovering from data loss.

**Acceptance Criteria:**

- Given I have set my employment date and theme preference
- When I export my calculations
- Then the exported JSON file includes a "settings" object with:
  - employmentDate: { month, year } or null
  - theme: "light" | "dark" | "system"
  - createdAt: timestamp
  - updatedAt: timestamp
- And the export file structure remains backward compatible (settings is optional field)
- And the export filename reflects it's a complete backup (e.g., "invoice-heaven-backup-2026-01-16.json")

**Edge Cases:**

- No settings configured → Export includes settings object with null/default values
- Partial settings (only employment date set) → Export includes all settings fields
- Old export format without settings → Still importable (settings field optional)

**Dependencies:** US-031 (Export), US-039 (Settings Storage)

**Risks:**

- Export file size increases slightly with settings data → Negligible impact
- Breaking change for old import code → Mitigated by making settings optional

**Sub-Tasks:**

- Update ExportData interface to include optional settings field
- Modify exportCalculationsToJSON to fetch and include settings from IndexedDB
- Update export filename to "invoice-heaven-backup-{date}.json"
- Add tests for export with settings

**References:**

- US-031: Export Calculations to File
- US-039: Store User Settings in IndexedDB

**Change Note:** New in v2.6

---

#### US-041: Import User Settings with Calculations

**Story ID:** US-041  
**Title:** Import User Settings with Calculations  
**Story Statement:** As an employee, I want to import my user settings along with calculations from a backup file, so that I can restore my complete configuration including employment date and theme preferences.

**Business Value:** Enables seamless restoration of user environment, improving user experience when recovering from data loss or moving between devices.

**Acceptance Criteria:**

- Given I import a JSON file that includes user settings
- When the import is processed
- Then the settings are restored to IndexedDB
- And the employment date is applied (synced to localStorage, event dispatched)
- And the theme preference is applied immediately to the UI
- And the import preview dialog shows settings information:
  - Employment date (formatted as "Month Year" or "Not set")
  - Theme preference
- And if the import file has no settings (old format)
- Then only calculations are imported, settings remain unchanged
- And no error is shown (backward compatible)

**Edge Cases:**

- Import file with settings but user already has settings → Settings overwritten (user should be aware via preview)
- Import file with invalid settings data → Validation error shown, import cancelled
- Import file without settings (old format) → Only calculations imported, no settings changes
- Theme change during import → UI updates immediately to reflect new theme

**Dependencies:** US-032 (Import), US-039 (Settings Storage), US-040 (Export Settings)

**Risks:**

- Overwriting current settings without clear warning → Mitigated by showing settings in preview dialog
- Theme change may be jarring → User sees preview before confirming import

**Sub-Tasks:**

- Update ImportValidationResult to include hasSettings and settingsPreview fields
- Modify validateImportFile to extract and preview settings
- Update ImportDialog to display settings preview
- Implement settings import in handleImport (save to IndexedDB, apply theme, dispatch events)
- Add tests for import with settings

**References:**

- US-032: Import Calculations from File
- US-039: Store User Settings in IndexedDB
- US-040: Export User Settings with Calculations

**Change Note:** New in v2.6

---

#### US-042: Require Employment Date Before Creating Calculations

**Story ID:** US-042  
**Title:** Require Employment Date Before Creating Calculations  
**Story Statement:** As a system, I want to require users to set their employment date before creating any calculations, so that the month selector can correctly restrict selectable months (from employment to current).

**Business Value:** Ensures month/year selector guardrails are correct from the start (user cannot select months before their employment). Note: Benefit limits (ML, Integrations) no longer depend on employment date; ML is fixed 500 PLN per bi-monthly period.

**Acceptance Criteria:**

- Given I navigate to the calculator page (/create)
- When the system detects no employment date is set
- Then I see a blocking screen with:
  - Clear message: "Employment Date Required"
  - Explanation of why it's needed (month selector restricts selectable months to from employment to current)
  - Example: "Month selector is restricted to months from your employment start to current month. Set your employment date to continue."
  - Button: "Go to Home Page to Set Employment Date"
- And I cannot access the calculator form
- And when I click the button
- Then I am redirected to the home page
- And the employment date dialog is not automatically opened (user must click the settings button)
- And once I set my employment date
- Then I can access the calculator normally

**Edge Cases:**

- User clears employment date after setting it → Next calculator access shows blocking screen again
- User imports data with employment date → Employment date is set, calculator accessible
- User tries to access /edit/[id] without employment date → Same blocking screen shown

**Dependencies:** US-038 (Employment Date), US-022 (Create Calculation)

**Risks:**

- May frustrate users who want to explore the calculator first → Mitigated by clear explanation
- Users may set incorrect employment date just to proceed → Cannot change after calculations exist (US-038)

**Sub-Tasks:**

- Add employment date check in CreateCalculationContent component
- Create blocking screen UI with informative message
- Add loading state while checking for employment date
- Implement redirect to home page
- Add same check to edit page
- Add tests

**References:**

- US-038: Enter Employment Start Date
- US-022: Save Calculation for Selected Month

**Change Note:** New in v2.6

---

#### US-043: Separate Month and Year Selectors with Dynamic Filtering

**Story ID:** US-043  
**Title:** Separate Month and Year Selectors with Dynamic Filtering  
**Story Statement:** As an employee, I want to select the calculation month and year using separate dropdown menus, so that I can easily navigate through available months with clear constraints.

**Business Value:** Improves usability by providing separate, focused controls for month and year selection, with intelligent filtering based on employment date and current date.

**Acceptance Criteria:**

- Given I am creating or editing a calculation
- When I see the month/year selector
- Then I see two separate Select dropdowns:
  - Month selector: Lists all 12 months (January - December)
  - Year selector: Lists years from employment date year to current year
- And when I select a year
- Then the month dropdown is filtered:
  - If employment year is selected: Only months from employment month onwards are shown
  - If current year is selected: Only months from January to current month are shown
  - If any other year: All 12 months are shown
- And when I change the year
- Then the selected month is automatically adjusted if it becomes invalid:
  - If selected month is before employment month in employment year → Changed to employment month
  - If selected month is after current month in current year → Changed to current month
- And by default, the current month and year are selected

**Edge Cases:**

- Employment date is current month → Only current month shown for current year
- Employment date is in the future (validation error) → Should not occur (US-038 validation)
- No employment date set → Defaults to 2 years ago to current date range
- Selecting past year then current year → Month list updates to exclude future months

**Dependencies:** US-022 (Create Calculation), US-038 (Employment Date)

**Risks:**

- Complex filtering logic may confuse users → Mitigated by clear visual feedback
- Month auto-adjustment may be unexpected → Happens only when necessary, preserves user intent

**Sub-Tasks:**

- Replace single MonthYearSelect with two separate Select components
- Implement year dropdown (employment year to current year)
- Implement month dropdown (all 12 months)
- Add dynamic month filtering based on selected year
- Implement month auto-adjustment when year changes
- Add tests for filtering logic

**References:**

- US-022: Save Calculation for Selected Month
- US-038: Enter Employment Start Date

**Change Note:** New in v2.6

---

#### US-044: Disable Master Care Input Outside Settlement Months

**Story ID:** US-044  
**Title:** Disable Master Care Input Outside Settlement Months  
**Story Statement:** As an employee, I want the Master Care input field to be disabled when I'm viewing a calculation for a non-settlement month, so that I understand when I can and cannot enter Master Care expenses.

**Business Value:** Prevents data entry errors by making it visually clear when Master Care expenses can be entered, reinforcing the bi-monthly settlement schedule.

**Acceptance Criteria:**

- Given I am creating or editing a calculation
- When the selected month is NOT a Master Care settlement month (not Feb, Apr, Jun, Aug, Oct, Dec)
- Then the Master Care input field is disabled (greyed out)
- And a helper text is displayed below the field:
  - "Master Care can only be entered in settlement months (February, April, June, August, October, December)"
- And when the selected month IS a settlement month
- Then the Master Care input field is enabled
- And no helper text is shown (or validation errors if applicable)
- And the disabled state updates immediately when the month selector changes

**Edge Cases:**

- User changes month from settlement to non-settlement month → Field disabled, existing value preserved but not editable
- User changes month from non-settlement to settlement month → Field enabled, can enter value
- User tries to paste value into disabled field → Browser prevents input (standard disabled behavior)
- User has Master Care value and switches to non-settlement month → Value preserved, field disabled

**Dependencies:** US-005 (Master Care Input), US-033 (Period-Based Validation), US-022 (Month Selector)

**Risks:**

- Users may not understand why field is disabled → Mitigated by clear helper text
- Disabled field may be missed visually → Standard disabled styling should be sufficient

**Sub-Tasks:**

- Add disabled prop to Master Care Input based on isMonthBiMonthlySettlementMonth check
- Add conditional helper text below Master Care input
- Update styling for disabled state (ensure clear visual feedback)
- Test disabled state updates when month changes
- Add tests

**References:**

- US-005: Input Master Care Amount
- US-033: Validate Period-Based Input Restrictions
- Flow 12: Period-Based Input Validation

**Change Note:** New in v2.6

---

## Domain Model / Glossary

### Benefit Categories

- **Master Learner (ML):** Learning and development benefit with **fixed 500 PLN every two months** (same calculation method as Master Care; no employment-date dependency). Bi-monthly period (Jan–Feb, Mar–Apr, etc.); can only be entered in settlement months (Feb, Apr, Jun, Aug, Oct, Dec). Covers: English lessons, conferences, training, courses, certificates, tuition fees, books, coaching, and related logistics. See [Business Rules](#-business-rules). [MasterLearner.pdf]
- **Master Care (MC):** Health and sports benefit (750 PLN every 2 months per person). Bi-monthly period starting January (Jan-Feb, Mar-Apr, May-Jun, Jul-Aug, Sep-Oct, Nov-Dec). Covers: psychotherapy, doctors, medicines, sports memberships, equipment, supplements, children's medical expenses. [MasterCare.pdf]
- **Integracje (team-building):** In this app, "Integracje" means **team-building** (company/employee events, office visits, project get-togethers)—_not_ system/technical integrations. Benefit: fixed 1,500 PLN quarterly per person (no employment date dependency). Quarterly period (Q1–Q4). **For individual employees:** Only accommodation and transport (nocleg i dojazd) can be settled via reimbursement. **For organizers:** Group activities are handled separately with company cards. Budget does not accumulate between quarters. [Integracje projektowe + przyjazdy do biura.pdf]
- **Budżet na dojazdy i noclegi:** **Removed.** This category was removed per product feedback; accommodation and travel in this context are covered under Integracje (team-building). Do not display or use in REIM.RAZEM or InvoiceHeaven string.
- **Narzędzia (Tools):** Equipment and software purchases. Can be in PLN, USD, or EUR with exchange rate conversion. Part of Koszty bieżące (monthly period).
- **Inne (Other):** Miscellaneous expenses not covered by other categories.

### Calculation Entity

- **Calculation:** A saved reimbursement calculation containing:
  - Unique ID (UUID)
  - Month/Year (e.g., "2026-01")
  - Timestamp (created/updated)
  - Optional name/description
  - Status (Saved, Submitted, Declined, Approved)
  - Form values (ML, MC, Tools array, Integrations, Other)
  - Generated InvoiceHeaven string
  - Total sum
  - Version history (optional, for edits)

### User Profile / Settings

- **Employment Start Date:** Month and year when employee joined MasterBorn. Used for month/year selector guardrails (e.g. restrict to months from employment to current). **Not** used for Master Learner limit (ML is fixed 500 PLN per bi-monthly period; no employment dependency). Integracje: fixed 1,500 PLN quarterly (not dependent on employment date). Stored in localStorage or IndexedDB; can be updated per product rules.

### Period Definitions

- **Monthly Period:** Calendar month (January, February, etc.). Applies to: Koszty bieżące (e.g. Tools).
- **Bi-Monthly Period:** Two-month periods starting January: Jan-Feb, Mar-Apr, May-Jun, Jul-Aug, Sep-Oct, Nov-Dec. Settlement months: February, April, June, August, October, December. Applies to: Master Care (750 PLN/period) and Master Learner (500 PLN/period); both fixed per period, no employment dependency.
- **Quarterly Period:** Three-month periods: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec). Applies to: Integracje (team-building), 1,500 PLN per quarter.

### Calculations

- **REIM.RAZEM:** Reimbursement subtotal = Tools (PLN) + Integrations + Other (Budget category removed.)
- **Total Sum:** Grand total = ML + MC + REIM.RAZEM

### InvoiceHeaven Format

String format: `ML;{ml};MC;{mc};REIM.RAZEM;{razem};narzędzia;{tools};integracje;{integracje};inne;{inne}`  
_(No "budżet na dojazdy i noclegi" segment; accommodation/travel covered under Integracje / team-building.)_

### Validation Rules

**Per-Entry Validation:**

- Master Learner: 0–500 PLN per entry (no negatives; max 500 per bi-monthly period; period-based input same as Master Care)
- Master Care: 0–750 PLN per entry (no negatives; max 750 per bi-monthly period)
- All other fields: ≥ 0 (no negatives; no upper limit specified per entry)
- Tools exchange rate: Required for non-PLN currencies

**Accumulated Limit Validation (US-027):**

- Master Learner: Sum of all ML entries in **current bi-monthly period** ≤ 500 PLN. Can only be entered in settlement months (February, April, June, August, October, December). No employment-date dependency. See [Business Rules](#-business-rules).
- Master Care: Sum of all MC entries in current bi-monthly period ≤ 750 PLN.
- Integracje (team-building): Sum of all Integrations entries (individual travel expenses only) in current quarter ≤ 1,500 PLN (fixed limit, not dependent on employment date). Group activities handled by organizers are not tracked here.

---

## Main User Flows

### Flow 1: Standard Reimbursement Calculation

1. User opens calculator
2. Enters Master Learner amount (if applicable; max 500 PLN per bi-monthly period)
3. Enters Master Care amount (if applicable)
4. Adds tools (if applicable):
   - Enters tool name
   - Enters amount
   - Selects currency
   - Enters exchange rate (if non-PLN)
5. Enters Integrations (team-building) amount (if applicable)
6. Enters Other amount (if applicable)
7. Clicks "Calculate"
8. Reviews results in dialog
9. Copies InvoiceHeaven string to clipboard
10. Pastes into InvoiceHeaven system

### Flow 2: Multi-Currency Tools Calculation

1. User adds tool entry
2. Enters tool name (e.g., "GitHub Pro")
3. Enters amount in foreign currency (e.g., 4 USD)
4. Selects currency (USD)
5. Enters exchange rate (e.g., 4.25)
6. System calculates and displays: 17.00 PLN
7. Adds more tools (repeat steps 1-6)
8. System shows tools total in PLN
9. User proceeds with main calculation

### Flow 3: Error Correction

1. User enters invalid value (e.g., negative or exceeding max)
2. System displays validation error
3. User corrects the value
4. Error disappears
5. User can proceed with calculation

### Flow 4: Save and Track Monthly Calculation

1. User completes calculation (enters values, calculates)
2. User clicks "Save Calculation"
3. System saves calculation with current month/year
4. User optionally adds name/description
5. Calculation appears in history
6. System updates accumulated usage for benefit categories
7. User can view remaining budget for next calculation

### Flow 7: Delete Calculation

1. User is on home page (calculation list)
2. User clicks "Delete" button on a calculation row
3. Confirmation dialog appears: "Are you sure you want to delete the calculation for {month}? This action cannot be undone."
4. User clicks "Cancel" in dialog
5. Dialog closes, calculation remains in list
6. OR User clicks "Delete" in dialog
7. Calculation is removed from IndexedDB
8. Calculation disappears from list
9. Success message shown: "Calculation for {month} deleted successfully"

### Flow 8: Copy InvoiceHeaven String from List

1. User is on home page (calculation list)
2. User clicks "Copy" button on a calculation row
3. InvoiceHeaven string is copied to clipboard
4. Button changes to "Copied" with checkmark
5. Tooltip/toast confirms: "Copied to clipboard!"
6. Button returns to "Copy" after 2 seconds
7. User can paste string into InvoiceHeaven system

### Flow 9: Limit Validation with Accumulated Usage

1. User starts new calculation
2. System displays remaining budget indicators next to each field
3. User enters Master Learner amount (e.g., 1,000 PLN)
4. System checks: accumulated ML in current bi-monthly period (e.g., 300) + new (250) = 550 > limit (500 PLN per bi-monthly period - see [Business Rules](#-business-rules) section)
5. System shows validation error: "Would exceed annual limit. Remaining: 500 PLN"
6. User adjusts to 500 PLN or less
7. Validation passes, user can save calculation

### Flow 10: Export Calculations for Backup

1. User views calculation history
2. User clicks "Export Calculations"
3. User selects export scope (all, date range, status, or month)
4. System generates JSON file with selected calculations
5. File automatically downloads with descriptive filename
6. User saves file to preferred location (backup created)

### Flow 11: Import Calculations from Backup

1. User clicks "Import Calculations"
2. User selects previously exported JSON file
3. System validates file format and structure
4. System shows import preview (count, date range, status summary)
5. User selects import strategy (merge/replace/skip duplicates)
6. User confirms import
7. System imports calculations into IndexedDB
8. System shows success message with import count
9. Calculation history refreshes with imported data

### Flow 12: Period-Based Input Validation

1. User creates new calculation for February (Jan-Feb period)
2. User enters Master Care value → Accepted (February is the settlement month for Jan-Feb period)
3. User tries to enter Integrations value → Accepted (February is in Q1: Jan-Mar)
4. User changes calculation month to January
5. System re-validates all period-based fields
6. Master Care field shows error: "Master Care can only be entered in calculations for February (settlement month for Jan-Feb period). This calculation is for January, which is not the settlement month."
7. Integrations field remains enabled (January is still in Q1)
8. User changes calculation month to March
9. Master Care field still shows error (March is not in Jan-Feb period, and April is the settlement month for Mar-Apr)
10. User changes calculation month back to February
11. Master Care field becomes enabled again, validation passes

---

## Decision Log

### D-001: Financial Math Implementation

**Decision:** Use integer-based arithmetic (cents) to avoid floating-point precision errors.  
**Rationale:** JavaScript floating-point arithmetic can cause precision issues (e.g., 0.1 + 0.2 = 0.30000000000000004). Converting to integers, summing, then converting back ensures accurate 2-decimal-place results.  
**Date:** Implemented in current codebase  
**Status:** Accepted

### D-002: Tools LocalStorage Persistence

**Decision:** Persist only Tools section data in localStorage, not main form fields.  
**Rationale:** Tools section is more complex (multiple entries, currencies) and benefits more from persistence. Main form fields are simpler and users typically complete in one session.  
**Date:** Implemented in current codebase  
**Status:** Accepted

### D-003: Validation Error Blocking

**Decision:** Block calculation when validation errors exist, rather than allowing calculation with warnings.  
**Rationale:** Prevents generation of incorrect reimbursement strings that could cause processing issues in InvoiceHeaven.  
**Date:** Implemented in current codebase  
**Status:** Accepted

### D-004: Minimum One Tool Requirement

**Decision:** Always require at least one tool entry (cannot delete the last one).  
**Rationale:** Simplifies UI logic and ensures Tools section is always present. Empty tool doesn't affect calculation (treated as 0).  
**Date:** Implemented in current codebase  
**Status:** Accepted

### D-005: Integrations Field Addition

**Decision:** Add "integracje" field to calculator and InvoiceHeaven format string.  
**Rationale:** New benefit category introduced in Benefits 2026 program (1,500 PLN quarterly). Required for compliance with new benefit structure.  
**Date:** Based on Benefits 2026 announcement  
**Status:** Implemented

### D-006: Calculation History Storage Strategy

**Decision:** Use IndexedDB as primary storage for calculation history, with localStorage as temporary cache.  
**Rationale:**

- IndexedDB provides large storage capacity (10GB+) vs. localStorage (5-10MB)
- Indexed queries enable fast filtering by month, status, date range
- Asynchronous operations don't block UI thread
- Data persists across browser restarts and cache clears
- No backend infrastructure required (client-side only)
- Privacy: Data stays on user's device
  **Implementation:**
- IndexedDB for all calculation history (primary storage)
- localStorage for temporary session state and recent calculations cache
- Use `idb` library (lightweight IndexedDB wrapper)
- Indexes on: monthYear, status, timestamp, createdAt
  **Considerations:**
- More complex than localStorage (requires async patterns)
- Need to handle schema migrations if data structure changes
- Fallback to localStorage if IndexedDB unavailable (rare)
  **Date:** 2026-01-16  
  **Status:** Accepted  
  **Reference:** See ADR-001-calculation-storage-strategy.md for detailed analysis

### D-007: Period-Based Limit Validation

**Decision:** Implement accumulated usage validation based on benefit-specific periods (monthly, bi-monthly, quarterly, annual).  
**Rationale:**

- Business rules specify different periods for different benefits
- Prevents over-submission and invoice rejections
- Aligns with actual benefit program structure
  **Implementation:**
- Master Learner: Annual (calendar year)
- Master Care: Bi-monthly (Jan-Feb, Mar-Apr, etc.)
- Integrations: Quarterly (Q1-Q4)
- Koszty bieżące: Monthly
  **Date:** 2026-01-16  
  **Status:** Accepted

### D-008: Calculation Editing Strategy

**Decision:** Allow editing of saved calculations, with updated timestamp but preserve original data structure.  
**Rationale:**

- Supports workflow for declined invoices (edit and resubmit)
- Users may need to correct mistakes
- Simpler than versioning system initially
  **Considerations:**
- Editing submitted calculations may need confirmation
- Future: Consider version history if audit trail needed
  **Date:** 2026-01-16  
  **Status:** Accepted

### D-009: Status Management for Calculations

**Decision:** Implement status tracking (Saved, Submitted, Declined, Approved) to support workflow management.  
**Rationale:**

- Helps users track reimbursement lifecycle
- Supports editing workflow (declined → edit → resubmit)
- Provides visibility into pending/approved requests
  **Date:** 2026-01-16  
  **Status:** Accepted

### D-010: Integracje Scope - Individual Travel Expenses Only

**Decision:** Integracje field in calculator tracks only individual employee travel expenses (accommodation and transport), not group activities.  
**Rationale:**

- Business rule from Integracje projektowe + przyjazdy do biura.pdf: Individual employees settle "Nocleg i dojazd" (accommodation and transport) individually through reimbursement system
- Group activities (restaurants, attractions, bowling) are handled separately by organizers using company cards
- Calculator scope is limited to individual reimbursements, not organizer-managed group expenses
  **Implementation:**

- Helper text in Integracje field clarifies individual vs. organizer expenses
- Validation and tracking only applies to individual travel expenses
- 1,500 PLN quarterly limit applies to individual travel expenses only
  **Date:** 2026-01-16  
  **Status:** Accepted

### D-011: Benefit Rules Versioning System

**Decision:** Implement immutable benefit rules versioning system to track which rules applied at the time each calculation was created.  
**Rationale:**

- Critical for audit compliance - every calculation must store which rules applied
- Ensures historical accuracy - old calculations always show correct limits
- Future-proof - new rules can be added without breaking old data
- Transparency - rules changes are documented with effective dates
  **Implementation:**

- Benefit rules stored in versioned registry (`BENEFIT_RULES_REGISTRY`)
- Each calculation stores `benefitRulesVersion` field
- Version-aware functions: `getBenefitRules(date)`, `getCurrentBenefitRules()`, `getBenefitRulesByVersion(version)`
- Rules selected automatically based on calculation date
- Historical calculations maintain their original rules version
  **Architecture:**

- `types/benefit-rules.ts`: Benefit rules interface and registry
- `Calculation` type includes `benefitRulesVersion` field
- All validation functions accept optional `BenefitRules` parameter
- Database layer auto-saves current rules version when creating calculations
  **Migration Strategy:**

- Add new entry to `BENEFIT_RULES_REGISTRY` at top
- Set `effectiveFrom` date
- Update previous rule's `effectiveTo` date
- All new calculations automatically use new rules
- Historical calculations remain unchanged
  **Date:** 2026-01-16  
  **Status:** Accepted

### D-012: Currency Formatting with Intl Module

**Decision:** Use Intl.NumberFormat API for consistent, localized currency formatting throughout the application.  
**Rationale:**

- Proper Polish locale formatting (space thousands separator, comma decimal separator)
- Consistent currency display across all components
- Better user experience with localized numbers matching Polish conventions
- Maintainable - centralized formatting logic in `utils/currency.ts`
  **Implementation:**

- `formatCurrency(amount, compact)` - Formats as PLN currency (e.g., "1 234,56 zł")
- `formatAmount(amount, decimals)` - Formats number without currency symbol
- Applied across all components displaying monetary values:
  - `components/usage-summary.tsx` - All budget displays
  - `components/calculation-list.tsx` - All table columns
  - `components/calculation-result-dialog.tsx` - Total sum display
    **Date:** 2026-01-16  
    **Status:** Accepted

### D-013: Employment Date Reactive Updates

**Decision:** Use React context (AppState) as the primary mechanism for reactive employment date updates; custom event `employmentDateChanged` is used only where a one-off refresh is needed (e.g. after import).  
**Rationale:**

- Employment date is stored (e.g. via SettingsService/IndexedDB) and must update multiple components reactively
- AppStateProvider exposes `employmentDate` and `setEmploymentDate`; components that need it use `useAppState()` (no prop drilling)
- Enables real-time updates when employment date changes

**Implementation:**

- **Primary:** `AppStateProvider` holds `employmentDate`; components such as `UsageSummary`, `MonthYearSelect`, and `EmploymentDateManager` consume it via `useAppState()`. `UsageSummary` receives `calculations` and `employmentDate` as props from the parent (e.g. home page), which gets them from context.
- **Event (narrow use):** `employmentDateChanged` is dispatched in `import-dialog.tsx` after import so the app can refresh; reactive updates elsewhere are via context, not event listeners.
- **Date:** 2026-01-16
- **Status:** Accepted (implementation aligned with context-based reactivity as of 2026-01-28)

---

### D-014: User Settings Storage Strategy (IndexedDB + localStorage Hybrid)

**Decision:** Store user settings (employment date, theme) in IndexedDB as primary storage, with localStorage as backward compatibility layer.  
**Rationale:**

- **Centralized Data:** All user data (calculations + settings) in one database for unified export/import
- **Scalability:** IndexedDB can handle more complex settings structures as features grow
- **Backup/Restore:** Settings included in export files for complete configuration restoration
- **Backward Compatibility:** localStorage maintained for components not yet migrated and for fallback
- **Migration Path:** Automatic migration from localStorage to IndexedDB on first load

**Implementation:**

- IndexedDB schema v2 with new "settings" object store
- `SettingsService` class for CRUD operations on settings
- Settings structure: `{ id: "user-settings", employmentDate, theme, createdAt, updatedAt }`
- `EmploymentDateManager` syncs changes to both IndexedDB and localStorage
- Export includes settings in JSON file
- Import restores settings and applies them immediately (theme, employment date)
- Custom event system (`employmentDateChanged`) still used for reactive updates

**Alternatives Considered:**

1. **localStorage only:** Simple but doesn't integrate with export/import, limited scalability
2. **IndexedDB only:** Clean but breaks backward compatibility, requires full migration
3. **Separate settings file export:** More complex UX, users manage multiple files

**Date:** 2026-01-16  
**Status:** Accepted

---

## Open Questions

### Q-001: Budget Upper Limit

**Question:** Should "Budżet na dojazdy i noclegi" have an upper limit validation?  
**Context:** This category was removed per product feedback (Jan 2026). Accommodation and travel are covered under Integracje (team-building).  
**Status:** ✅ OBSOLETE – Budget category removed; no separate budget field in formula or REIM.RAZEM.

### Q-002: Integrations Upper Limit

**Question:** Should "Integracje" have validation for the 1,500 PLN quarterly limit?  
**Context:** Business rule states 1,500 PLN quarterly, but calculator doesn't enforce this.  
**Impact:** Could prevent over-submission if limit should be enforced per quarter.  
**Status:** Needs business confirmation

### Q-003: Master Learner Annual Tracking

**Question:** Should the calculator track annual usage of Master Learner (3,000 PLN limit)?  
**Context:** Per product feedback (Jan 2026), ML was simplified to **500 PLN per bi-monthly period** (same method as Master Care; no employment-date dependency, no annual cap).  
**Status:** ✅ SUPERSEDED – ML is now bi-monthly 500 PLN; tracked in US-026 and US-027 per bi-monthly period (not annual).

### Q-004: Master Care Period Tracking

**Question:** Should the calculator track bi-monthly usage of Master Care (750 PLN limit)?  
**Context:** Currently only validates per-entry max (500), but period limit is 750 PLN every 2 months.  
**Impact:** Would require backend/database to track usage across periods.  
**Status:** ✅ RESOLVED - Implemented in US-026 and US-027 (localStorage-based tracking)

### Q-005: Exchange Rate Source

**Question:** Should the calculator fetch current exchange rates automatically, or rely on user input?  
**Context:** Currently users must manually enter exchange rates.  
**Impact:** Could improve accuracy and user experience, but requires API integration.  
**Status:** Future enhancement consideration

### Q-006: Calculation Versioning

**Question:** Should edited calculations create new versions or update in place?  
**Context:** D-008 allows editing, but doesn't specify versioning strategy.  
**Impact:** Version history would provide audit trail but adds complexity.  
**Status:** Deferred - Start with simple update-in-place, add versioning if needed

### Q-007: Cross-Device Synchronization

**Question:** Should calculation history sync across user's devices?  
**Context:** Currently localStorage is device-specific.  
**Impact:** Would require backend/authentication, but improves user experience.  
**Status:** Future enhancement consideration

### Q-008: Master Learner Pro-Rated Amount for Mid-Year Joiners

**Question:** Should the calculator automatically detect if user joined July-December and apply 1,500 PLN limit instead of 3,000 PLN?  
**Context:** Per product feedback (Jan 2026), ML is now **fixed 500 PLN per bi-monthly period** for all employees (no pro-rating, no employment-date dependency).  
**Status:** ✅ RESOLVED – ML simplified; single rule 500 PLN every two months; no join-date logic needed.

---

## Next Actions

### Immediate (After User Confirmation)

1. **Confirm validation limits:** Get business confirmation on Q-002 (Integrations upper limit) if not yet confirmed. Q-001 (Budget) obsolete – category removed. Q-008 (ML pro-rating) resolved – ML is 500 PLN per bi-monthly period.
2. **Review Epic priorities:** Confirm if all epics are in correct priority order
3. **Confirm data storage approach:** Validate D-006 (localStorage strategy) is acceptable

### Short-term Enhancements (Epic 6 Implementation)

1. **Implement home page with calculation list:** US-023 (table view with columns: month, IH values, total, status, actions; top-right buttons: Import, Export, Add New)
2. **Implement calculator on separate page:** US-022, US-024 (navigation to /create, state persistence in localStorage)
3. **Add month selector and validation:** US-022, US-035 (month selector component, one calculation per month validation)
4. **Implement calculator state persistence:** US-034 (localStorage auto-save as user types)
5. **Add edit functionality:** US-024 (edit with cancel confirmation dialog, navigation back to list)
6. **Add delete functionality:** US-036 (delete with confirmation dialog)
7. **Add copy from list:** US-037 (copy InvoiceHeaven string directly from list)
8. **Add period-based tracking:** US-026 (accumulated usage calculation)
9. **Implement limit validation:** US-027 (validate against accumulated limits)
10. **Add period-based input validation:** US-033 (restrict ML/MC/Integrations to correct periods)
11. **Add status management:** US-029, US-030 (filter and mark status)
12. **Add remaining budget indicators:** US-028 (display remaining budget)
13. **Implement export/import:** US-031, US-032 (backup and restore calculations)

### Medium-term Enhancements

1. **Improve error messaging:** Ensure all validation errors are clear and actionable (especially limit errors)
2. **Add help text:** Consider adding tooltips or help text explaining each benefit category and periods
3. **PDF export:** Consider PDF export of reimbursement summary or calculation history (in addition to JSON export)
4. **Calculation search:** Add search functionality for calculation history
5. **Scheduled backups:** Consider automatic periodic export reminders

### Future Considerations

1. **Backend integration:** Migrate from localStorage to backend API for calculation history
2. **User authentication:** Enable cross-device synchronization (Q-007)
3. **Exchange rate API:** Integrate real-time exchange rate fetching (Q-005)
4. **Multi-language support:** Consider Polish language option (currently English UI with Polish field labels)
5. **Version history:** Implement calculation versioning if audit trail needed (Q-006)
6. **User profile:** Store join date for Master Learner pro-rating (Q-008)
7. **Notifications:** Alert users when approaching benefit limits
8. **Reporting:** Generate usage reports and analytics

---

## References

### Internal

- Codebase: `/Users/jakubreczko/development/invoice-heaven-calculator`
- Tests: `tests/calculator.spec.ts`, `tests/tools-section.spec.ts`
- Components: `app/page.tsx`, `components/tools-section.tsx`
- Utilities: `utils/financialMath.ts`, `hooks/useTools.ts`

### External

- Benefits 2026 Announcement (from image): MasterBorn internal communication
- InvoiceHeaven System: Target system for reimbursement string format
- MasterLearner.pdf: Business rules for Master Learner benefit
- MasterCare.pdf: Business rules for Master Care benefit
- Koszty bieżące i narzędzia pracy.pdf: Business rules for current costs and tools
- Next.js Documentation: Framework used
- Playwright Documentation: Testing framework used

---

**Document Version:** 3.0  
**Last Updated:** 2026-01-16  
**Maintained By:** Jakub Reczko

For detailed version history and changes, see [CHANGELOG.md](./CHANGELOG.md).
