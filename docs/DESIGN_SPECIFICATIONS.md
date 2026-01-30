# Invoice Heaven Calculator - Design Specifications

**Document Version:** 1.1  
**Last Updated:** 2026-01-16  
**Design System:** base-ui, Tailwind CSS 4.1, Radix UI

---

## Design Principles

1. **Clarity over Decoration:** Financial precision and legible numbers take priority
2. **Progressive Disclosure:** Essential metrics visible immediately; complex details behind interactions
3. **State Visibility:** Users always know calculation validity status
4. **Consistency:** Strict adherence to base-ui style
5. **Precision UI:** Generous whitespace with compact typography for metadata

---

## Epic 1: Core Calculation Engine

### US-001: Calculate Total Reimbursement Sum

#### Visual Strategy Summary

**Goal:** Display accurate total sum with financial precision, ensuring users can verify their reimbursement amount before submission.

**Hierarchy:**

- Primary: Total sum display (large, prominent)
- Secondary: Individual category values (supporting context)

**Accessibility:**

- Use `tabular-nums` font feature for number alignment
- ARIA label: "Total reimbursement sum"
- High contrast ratio (WCAG AA minimum)

#### Component Specification

**File Path:** `app/page.tsx` (Results Dialog)

**Tailwind Strategy:**

```tsx
// Total sum display
className = "text-2xl font-bold tabular-nums";
// Container
className = "bg-muted rounded-md p-3";
```

**Interactive States:**

- Default: Large, bold number with currency symbol
- Hover: Subtle background highlight (if interactive)
- Focus: Visible focus ring for copy button

#### Design Details

- **Typography:** `text-2xl font-bold` for total sum
- **Number Format:** Always 2 decimal places (e.g., "1576.50 zł")
- **Font Feature:** `tabular-nums` for proper alignment
- **Color:** Uses `--foreground` CSS variable
- **Layout:** Centered in muted background container
- **Copy Button:** Adjacent to total, with checkmark icon on success

#### Design Review Checklist

- [x] Dark Mode verified (uses CSS variables)
- [x] Mobile/Tablet responsiveness (responsive padding)
- [x] Tab-key navigation working (copy button focusable)
- [x] Financial data legible (large font, tabular-nums)

---

### US-002: Calculate REIM.RAZEM Subtotal

#### Visual Strategy Summary

**Goal:** Display REIM.RAZEM subtotal in InvoiceHeaven string format, ensuring format compliance.

**Hierarchy:**

- Primary: REIM.RAZEM value in output string
- Secondary: Calculation breakdown (implicit)

**Accessibility:**

- Monospace font for string readability
- Clear visual separation in output string

#### Component Specification

**File Path:** `app/page.tsx` (Results Dialog)

**Tailwind Strategy:**

```tsx
// Output string container
className = "break-all font-mono text-sm cursor-text";
// Container background
className = "bg-muted rounded-md p-3";
```

**Interactive States:**

- Default: Monospace text, selectable
- Click: Selects entire string
- Hover: Cursor changes to text cursor

#### Design Details

- **Format:** Always 2 decimal places (e.g., "150.50")
- **Font:** Monospace (`font-mono`) for alignment
- **Display:** Part of semicolon-separated string
- **Position:** In InvoiceHeaven format string output

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness (break-all for wrapping)
- [x] Tab-key navigation working
- [x] Financial data legible (monospace ensures alignment)

---

### US-003: Generate InvoiceHeaven Format String

#### Visual Strategy Summary

**Goal:** Present formatted string in clear, copyable format matching InvoiceHeaven requirements exactly.

**Hierarchy:**

- Primary: Complete formatted string (monospace, selectable)
- Secondary: Copy button (prominent, accessible)

**Accessibility:**

- Full string selectable with single click
- Copy button with clear feedback
- ARIA labels for screen readers

#### Component Specification

**File Path:** `app/page.tsx` (Results Dialog)

**Tailwind Strategy:**

```tsx
// String container
className = "break-all font-mono text-sm cursor-text grow";
// Container wrapper
className = "flex items-center justify-between bg-muted rounded-md p-3 gap-4";
// Copy button
className = "shadow-md transition-all hover:scale-105";
```

**Interactive States:**

- Default: Monospace text, muted background
- Click (text): Selects all text
- Hover (button): Slight scale up (105%)
- Active (button): Scale down slightly
- Copied: Button shows checkmark, "Copied" text

#### Design Details

- **Format:** `ML;{ml};MC;{mc};REIM.RAZEM;{razem};narzędzia;{tools};integracje;{integracje};inne;{inne}`
- **Font:** Monospace (`font-mono`) for consistent character width
- **Wrapping:** `break-all` ensures long strings wrap on mobile
- **Copy Feedback:** Button changes to checkmark + "Copied" for 2 seconds
- **Tooltip:** "Copied to clipboard!" appears on successful copy

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness (break-all, responsive padding)
- [x] Tab-key navigation working (copy button focusable)
- [x] Financial data legible (monospace font)

---

## Epic 2: User Input & Validation

### US-004: Input Master Learner Amount

#### Visual Strategy Summary

**Goal:** Provide clear input field with immediate validation feedback, preventing invalid entries.

**Hierarchy:**

- Primary: Input field (prominent, accessible)
- Secondary: Validation error message (appears below field)
- Tertiary: Remaining budget indicator (if implemented)

**Accessibility:**

- Label associated with input (`htmlFor` attribute)
- Error message announced to screen readers
- Clear visual error state (red border)

#### Component Specification

**File Path:** `app/page.tsx` (Calculator Form)

**Tailwind Strategy:**

```tsx
// Input field
className={cn(
  "w-full",
  errors.masterLearner && "border-destructive"
)}
// Error message
className="text-sm text-destructive"
// Container
className="space-y-2"
```

**Interactive States:**

- Default: Standard input styling
- Focus: Ring color from `--ring` CSS variable
- Error: Red border (`border-destructive`)
- Disabled: Muted background and cursor-not-allowed

#### Design Details

- **Input Type:** `type="number"` with `min="0"`
- **Placeholder:** "0"
- **Validation:** Real-time on change
- **Error Display:** Red text below input, red border on input
- **Max Value:** 6,000 PLN (per-entry limit)
- **Helper Text:** Optional remaining budget indicator (US-028)

#### Design Review Checklist

- [x] Dark Mode verified (CSS variables)
- [x] Mobile/Tablet responsiveness (full width, touch-friendly)
- [x] Tab-key navigation working (logical tab order)
- [x] Financial data legible (number input type)

---

### US-005: Input Master Care Amount

#### Visual Strategy Summary

**Goal:** Input field with period-based validation, ensuring MC can only be entered in settlement months.

**Hierarchy:**

- Primary: Input field
- Secondary: Period validation error (if month invalid)
- Tertiary: Helper text explaining bi-monthly periods

**Accessibility:**

- Disabled state when period invalid (with explanation)
- Clear error messaging about settlement periods

#### Component Specification

**File Path:** `app/page.tsx` (Calculator Form)

**Tailwind Strategy:**

```tsx
// Input field (disabled when period invalid)
className={cn(
  "w-full",
  errors.masterCare && "border-destructive",
  isPeriodInvalid && "opacity-50 cursor-not-allowed"
)}
// Period error message
className="text-sm text-destructive"
// Helper text
className="text-xs text-muted-foreground"
```

**Interactive States:**

- Default: Enabled (if period valid)
- Disabled: When calculation month is not settlement month
- Error: Red border for validation errors
- Focus: Standard focus ring (when enabled)

#### Design Details

- **Period Validation:** Only enabled in settlement months (Feb, Apr, Jun, Aug, Oct, Dec)
- **Max Value:** 750 PLN (bi-monthly limit)
- **Error Message:** "Master Care can only be entered in calculations for {settlementMonth} (settlement month for {currentPeriod} period). This calculation is for {month}, which is not the settlement month."
- **Helper Text:** "Settled bi-monthly. Can only be entered in {settlementMonth} calculations."

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working (skips disabled field)
- [x] Financial data legible
- [ ] Period validation clearly explained

---

### US-006: Input Budget for Commutes and Accommodation

#### Visual Strategy Summary

**Goal:** Simple numeric input for budget amount with basic validation.

**Hierarchy:**

- Primary: Input field
- Secondary: Validation error (if negative)

**Accessibility:**

- Standard input accessibility
- Clear error messaging

#### Component Specification

**File Path:** `app/page.tsx` (Calculator Form)

**Tailwind Strategy:**

```tsx
// Input field
className={cn(
  "w-full",
  errors.budzet && "border-destructive"
)}
// Error message
className="text-sm text-destructive"
```

**Interactive States:**

- Default: Standard input
- Error: Red border for negative values
- Focus: Standard focus ring

#### Design Details

- **Input Type:** `type="number"` with `min="0"`
- **Placeholder:** "0"
- **Validation:** No negatives allowed
- **No Upper Limit:** Per business rules

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working
- [x] Financial data legible

---

### US-007: Input Team building Amount

#### Visual Strategy Summary

**Goal:** Input field with quarterly period validation and helper text clarifying individual vs. organizer expenses.

**Hierarchy:**

- Primary: Input field
- Secondary: Helper text (individual expenses only)
- Tertiary: Period validation error (if quarter invalid)

**Accessibility:**

- Helper text clearly explains scope
- Disabled state when quarter invalid

#### Component Specification

**File Path:** `app/page.tsx` (Calculator Form)

**Tailwind Strategy:**

```tsx
// Input field
className={cn(
  "w-full",
  errors.integracje && "border-destructive",
  isQuarterInvalid && "opacity-50 cursor-not-allowed"
)}
// Helper text
className="text-xs text-muted-foreground italic"
// Period error
className="text-sm text-destructive"
```

**Interactive States:**

- Default: Enabled (if quarter valid)
- Disabled: When calculation month is outside current quarter
- Error: Red border for validation errors
- Focus: Standard focus ring (when enabled)

#### Design Details

- **Helper Text:** "Individual travel expenses only (accommodation and transport). Group activities are handled by organizers."
- **Quarterly Validation:** Only enabled in months within current quarter
- **Max Value:** Fixed 1,500 PLN quarterly (not dependent on employment date, tracked via US-027)
- **Error Message:** "Team building can only be entered in calculations for {currentQuarter} (e.g., Q1: Jan-Mar). This calculation is for {month}, which is outside the current settlement period."

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working
- [x] Financial data legible
- [ ] Helper text clearly explains scope

---

### US-008: Input Other Expenses Amount

#### Visual Strategy Summary

**Goal:** Simple numeric input for miscellaneous expenses.

**Hierarchy:**

- Primary: Input field
- Secondary: Validation error (if negative)

**Accessibility:**

- Standard input accessibility

#### Component Specification

**File Path:** `app/page.tsx` (Calculator Form)

**Tailwind Strategy:**

```tsx
// Input field
className={cn(
  "w-full",
  errors.inne && "border-destructive"
)}
// Error message
className="text-sm text-destructive"
```

**Interactive States:**

- Default: Standard input
- Error: Red border for negative values
- Focus: Standard focus ring

#### Design Details

- **Input Type:** `type="number"` with `min="0"`
- **Placeholder:** "0"
- **Validation:** No negatives allowed

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working
- [x] Financial data legible

---

### US-009: Clear All Form Fields

#### Visual Strategy Summary

**Goal:** Provide quick reset action without disrupting workflow.

**Hierarchy:**

- Primary: Clear button (secondary action, outline variant)
- Secondary: Calculate button (primary action)

**Accessibility:**

- Clear button label
- Confirmation not required (data persisted in localStorage)

#### Component Specification

**File Path:** `app/page.tsx` (Calculator Form)

**Tailwind Strategy:**

```tsx
// Clear button
className = "variant-outline";
// Button container
className = "flex justify-end gap-4 pt-4";
```

**Interactive States:**

- Default: Outline button style
- Hover: Background highlight
- Active: Slight scale down
- Focus: Visible focus ring

#### Design Details

- **Button Variant:** `outline` (secondary action)
- **Position:** Left of Calculate button
- **Action:** Clears all form fields and validation errors
- **Tools Section:** Also reset (via ToolsSection component)

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working
- [x] Clear visual hierarchy (outline vs. primary)

---

### US-010: Prevent Calculation with Validation Errors

#### Visual Strategy Summary

**Goal:** Block calculation when errors exist, preventing invalid output generation.

**Hierarchy:**

- Primary: Calculate button (disabled when errors exist)
- Secondary: Error messages (visible, clear)

**Accessibility:**

- Disabled button state announced to screen readers
- Error messages clearly visible

#### Component Specification

**File Path:** `app/page.tsx` (Calculator Form)

**Tailwind Strategy:**

```tsx
// Calculate button (disabled)
className={cn(
  "disabled:opacity-50 disabled:cursor-not-allowed"
)}
```

**Interactive States:**

- Default: Enabled (no errors)
- Disabled: When `Object.keys(errors).length > 0`
- Hover: No hover effect when disabled
- Focus: Focusable but non-interactive when disabled

#### Design Details

- **Validation Check:** Before opening dialog
- **Error Display:** All errors visible in form
- **User Feedback:** Button appears disabled, errors remain visible

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working
- [x] Disabled state clearly visible

---

## Epic 3: Multi-Currency Tools Management

### US-011: Add Tools/Equipment Entries

#### Visual Strategy Summary

**Goal:** Provide intuitive interface for managing multiple tool entries with clear visual hierarchy.

**Hierarchy:**

- Primary: Tool entry rows (grid layout)
- Secondary: Add tool button
- Tertiary: Tools total summary

**Accessibility:**

- Grid layout with proper labels
- Add button clearly labeled
- Keyboard navigation through all fields

#### Component Specification

**File Path:** `components/tools-section.tsx`

**Tailwind Strategy:**

```tsx
// Tool entry grid
className =
  "grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-2 text-sm";
// Card container
className = "bg-muted/50";
// Add button
className = "variant-ghost";
```

**Interactive States:**

- Default: Grid of input fields
- Focus: Standard focus rings on inputs
- Hover (add button): Background highlight
- Active: Button press feedback

#### Design Details

- **Grid Layout:** 6 columns (Name, Amount, Currency, Exchange Rate, PLN Result, Delete)
- **Responsive:** Stack on mobile (grid-cols-1)
- **Minimum One Tool:** Always at least one empty tool entry
- **Auto-focus:** Name input focused when new tool added

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness (responsive grid)
- [x] Tab-key navigation working (logical order)
- [x] Financial data legible

---

### US-012: Convert Foreign Currency Tools to PLN

#### Visual Strategy Summary

**Goal:** Display real-time currency conversion with clear PLN result.

**Hierarchy:**

- Primary: Exchange rate input (when currency is USD/EUR)
- Secondary: PLN conversion result (read-only display)
- Tertiary: Currency selector

**Accessibility:**

- Exchange rate input enabled/disabled based on currency
- PLN result clearly labeled
- Currency symbols in selector

#### Component Specification

**File Path:** `components/tools-section.tsx`

**Tailwind Strategy:**

```tsx
// Exchange rate input
className={cn(
  "w-full",
  toolErrors[tool.id] && "border-destructive",
  tool.currency === "PLN" && "disabled:opacity-50"
)}
// PLN result display
className="w-full whitespace-nowrap"
```

**Interactive States:**

- Default: Enabled for USD/EUR, disabled for PLN
- Disabled: When currency is PLN (exchange rate = 1)
- Error: Red border when exchange rate missing
- Focus: Standard focus ring (when enabled)

#### Design Details

- **Real-time Calculation:** `amount × exchangeRate = PLN value`
- **Display Format:** "= {value} PLN" (e.g., "= 17.00 PLN")
- **Auto-disable:** Exchange rate input disabled when PLN selected
- **Auto-set:** Exchange rate set to "1" when switching to PLN

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working
- [x] Financial data legible (2 decimal places)

---

### US-013: Calculate Tools Total in PLN

#### Visual Strategy Summary

**Goal:** Display sum of all tools in clear, read-only summary field.

**Hierarchy:**

- Primary: Tools total (read-only input)
- Secondary: Label "Podsuma"

**Accessibility:**

- Read-only input (not editable)
- Label associated with input
- Clear visual distinction (muted background)

#### Component Specification

**File Path:** `components/tools-section.tsx`

**Tailwind Strategy:**

```tsx
// Total input (read-only)
className = "read-only:bg-muted read-only:cursor-default";
// Container
className = "flex gap-2 items-center";
```

**Interactive States:**

- Default: Read-only, muted background
- Focus: No focus ring (read-only)
- Hover: No hover effect

#### Design Details

- **Format:** Always 2 decimal places
- **Update:** Real-time as tools change
- **Position:** Bottom of tools section
- **Calculation:** Uses `addFinancialValues` utility

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working (skips read-only)
- [x] Financial data legible (tabular-nums recommended)

---

### US-014: Remove Tool Entries

#### Visual Strategy Summary

**Goal:** Provide clear delete action without accidental removal.

**Hierarchy:**

- Primary: Delete button (icon only, ghost variant)
- Secondary: Tool entry (context for deletion)

**Accessibility:**

- Icon button with ARIA label
- Tooltip on hover (optional)

#### Component Specification

**File Path:** `components/tools-section.tsx`

**Tailwind Strategy:**

```tsx
// Delete button
className = "variant-ghost size-icon h-10 w-10";
// Icon
className = "h-4 w-4";
```

**Interactive States:**

- Default: Ghost button (transparent)
- Hover: Background highlight
- Active: Scale down slightly
- Focus: Visible focus ring
- Disabled: When only one tool remains (cannot delete last)

#### Design Details

- **Icon:** Trash2 from lucide-react
- **Position:** Rightmost column in grid
- **Minimum One:** Cannot delete last tool (replaced with empty tool)
- **Action:** Immediate removal, total recalculated

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working
- [x] Clear visual feedback (hover state)

---

### US-015: Validate Tools Exchange Rates

#### Visual Strategy Summary

**Goal:** Prevent calculation with missing exchange rates for non-PLN currencies.

**Hierarchy:**

- Primary: Exchange rate input (with error state)
- Secondary: Error message below input

**Accessibility:**

- Error message announced to screen readers
- Red border indicates error state

#### Component Specification

**File Path:** `components/tools-section.tsx`

**Tailwind Strategy:**

```tsx
// Exchange rate input (error)
className={cn(
  "w-full",
  toolErrors[tool.id] && "border-destructive"
)}
// Error message
className="text-sm text-destructive mt-1"
```

**Interactive States:**

- Default: Standard input
- Error: Red border when exchange rate missing for USD/EUR
- Focus: Standard focus ring
- Validation: Real-time on change

#### Design Details

- **Error Message:** "Exchange rate is required for non-PLN currencies"
- **Validation:** Checks when currency is USD or EUR and exchange rate is empty
- **Block Calculation:** Prevents calculation when errors exist

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working
- [x] Error state clearly visible

---

## Epic 4: User Experience & Accessibility

### US-016: Display Calculation Results in Dialog

#### Visual Strategy Summary

**Goal:** Present results in modal dialog with clear hierarchy and copy actions.

**Hierarchy:**

- Primary: InvoiceHeaven string (monospace, selectable)
- Secondary: Total sum (large, prominent)
- Tertiary: Copy buttons (accessible, with feedback)

**Accessibility:**

- Dialog with proper ARIA attributes
- Focus trap within dialog
- Escape key closes dialog
- Click outside closes dialog

#### Component Specification

**File Path:** `app/page.tsx` (Dialog Component)

**Tailwind Strategy:**

```tsx
// Dialog content
className = "sm:max-w-[600px]";
// String container
className = "flex items-center justify-between bg-muted rounded-md p-3 gap-4";
// Total container
className = "flex items-center justify-between bg-muted rounded-md p-3 gap-4";
```

**Interactive States:**

- Default: Dialog open, content visible
- Click (outside): Closes dialog
- Escape: Closes dialog
- Focus: Trapped within dialog

#### Design Details

- **Dialog Size:** Max width 600px on small screens and up
- **Content:** Two sections (string + total)
- **Background:** Muted background for content containers
- **Close:** X button in header (Radix UI default)

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness (responsive max-width)
- [x] Tab-key navigation working (focus trap)
- [x] Financial data legible

---

### US-017: Copy InvoiceHeaven String to Clipboard

#### Visual Strategy Summary

**Goal:** Provide one-click copy with clear visual feedback.

**Hierarchy:**

- Primary: Copy button (adjacent to string)
- Secondary: Success feedback (checkmark + "Copied" text)

**Accessibility:**

- Button with clear label
- Tooltip confirms copy success
- ARIA live region for screen readers (optional)

#### Component Specification

**File Path:** `app/page.tsx` (Dialog Component)

**Tailwind Strategy:**

```tsx
// Copy button
className = "shadow-md transition-all hover:scale-105";
// Button content
className = "flex items-center gap-1";
// Icon
className = "h-4 w-4";
```

**Interactive States:**

- Default: Copy icon + "Copy" text
- Hover: Slight scale up (105%)
- Active: Scale down
- Copied: Checkmark icon + "Copied" text (2 seconds)
- Tooltip: "Copied to clipboard!" appears

#### Design Details

- **Icon:** Copy icon (default), Check icon (copied)
- **Feedback Duration:** 2 seconds
- **Tooltip:** Appears on successful copy
- **Animation:** Subtle scale on hover

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working
- [x] Clear visual feedback

---

### US-018: Copy Total Sum to Clipboard

#### Visual Strategy Summary

**Goal:** Copy total sum value with same feedback pattern as string copy.

**Hierarchy:**

- Primary: Copy button (adjacent to total)
- Secondary: Success feedback

**Accessibility:**

- Consistent with string copy pattern
- Clear button label

#### Component Specification

**File Path:** `app/page.tsx` (Dialog Component)

**Tailwind Strategy:**

```tsx
// Copy button (same as US-017)
className = "shadow-md transition-all hover:scale-105";
```

**Interactive States:**

- Same as US-017 (consistent pattern)

#### Design Details

- **Copied Value:** Total sum with 2 decimal places (e.g., "1576.50")
- **Feedback:** Same pattern as string copy
- **Position:** Right side of total container

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working
- [x] Consistent with US-017

---

### US-019: Theme Switching (Light/Dark/System)

#### Visual Strategy Summary

**Goal:** Provide theme switcher in header with clear visual indication of current theme.

**Hierarchy:**

- Primary: Theme switcher button (icon in header)
- Secondary: Dropdown menu with options

**Accessibility:**

- Icon indicates current theme
- Dropdown menu with clear labels
- Keyboard navigation supported

#### Component Specification

**File Path:** `app/page.tsx` (Header)

**Tailwind Strategy:**

```tsx
// Theme button
className = "variant-outline size-icon";
// Dropdown menu
className = "align-end";
// Menu items
className = "flex items-center gap-2";
```

**Interactive States:**

- Default: Icon shows current theme (Sun/Moon/Monitor)
- Hover: Background highlight
- Active: Dropdown opens
- Focus: Visible focus ring

#### Design Details

- **Icons:** Sun (light), Moon (dark), Monitor (system)
- **Position:** Top right of card header
- **Menu Items:** Light, Dark, System (with icons)
- **Persistence:** Theme saved to localStorage

#### Design Review Checklist

- [x] Dark Mode verified (theme switcher itself)
- [x] Mobile/Tablet responsiveness
- [x] Tab-key navigation working
- [x] Clear visual indication

---

### US-020: Responsive Design

#### Visual Strategy Summary

**Goal:** Ensure calculator works seamlessly across all device sizes.

**Hierarchy:**

- Primary: Content (adapts to viewport)
- Secondary: Navigation and actions (accessible on all sizes)

**Accessibility:**

- Touch-friendly targets (minimum 44x44px)
- Readable text without zooming
- Logical layout flow

#### Component Specification

**File Path:** `app/page.tsx` (Root Container)

**Tailwind Strategy:**

```tsx
// Root container
className =
  "min-h-screen flex flex-col items-center justify-center bg-background p-4";
// Card
className = "w-full max-w-3xl";
// Responsive padding
className = "p-4 sm:p-6";
```

**Interactive States:**

- Mobile: Stacked layout, full-width inputs
- Tablet: Optimized spacing, larger touch targets
- Desktop: Centered, max-width container

#### Design Details

- **Breakpoints:** `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Container:** Max width 3xl (768px) on large screens
- **Padding:** Responsive (p-4 on mobile, p-6 on larger)
- **Touch Targets:** Minimum 44x44px for buttons

#### Design Review Checklist

- [x] Dark Mode verified
- [x] Mobile/Tablet responsiveness (tested at breakpoints)
- [x] Tab-key navigation working
- [x] Financial data legible (responsive font sizes)

---

## Epic 5: Data Persistence & Recovery

### US-021: Persist Tools Data in LocalStorage

#### Visual Strategy Summary

**Goal:** Transparent persistence with no visible UI changes (background operation).

**Hierarchy:**

- No UI changes (background operation)
- User sees restored tools on page load

**Accessibility:**

- No accessibility impact (background operation)

#### Component Specification

**File Path:** `hooks/useTools.ts` (Implementation)

**Tailwind Strategy:**

- No UI styling (background operation)

**Interactive States:**

- No interactive states (automatic save/load)

#### Design Details

- **Storage Key:** `"invoice-heaven-tools"`
- **Save:** On every tool change (no debouncing)
- **Load:** On component mount
- **Fallback:** Empty tool if localStorage empty/corrupted

#### Design Review Checklist

- [x] Dark Mode verified (no impact)
- [x] Mobile/Tablet responsiveness (no impact)
- [x] Tab-key navigation working (no impact)
- [x] Financial data legible (no impact)

---

## Epic 6: Calculation History & Limit Tracking

### US-022: Save Calculation for Selected Month

#### Visual Strategy Summary

**Goal:** Provide month selector and save action with clear validation feedback.

**Hierarchy:**

- Primary: Month selector (prominent, accessible)
- Secondary: Save button (primary action)
- Tertiary: Validation error (if month already exists)

**Accessibility:**

- Month selector with proper labels
- Error message announced to screen readers
- Clear save action

#### Component Specification

**File Path:** `app/create/page.tsx` (New Page)

**Tailwind Strategy:**

```tsx
// Month selector
className = "w-full";
// Save button
className = "variant-default";
// Error message
className = "text-sm text-destructive";
```

**Interactive States:**

- Default: Month selector enabled
- Error: Red border on selector, error message below
- Disabled: Save button disabled when errors exist
- Focus: Standard focus rings

#### Design Details

- **Month Selector:** Dropdown with month/year selection
- **Format:** "January 2026" (human-readable)
- **Validation:** One calculation per month (US-035)
- **Save Action:** Navigates to home page after save
- **Storage:** IndexedDB (per ADR-001)

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Month selector accessible

---

### US-023: View Calculation History List on Home Page

#### Visual Strategy Summary

**Goal:** Display calculation history in clear table format with usage summary and actions.

**Hierarchy:**

- Primary: Usage summary (top of page)
- Secondary: Calculation table (main content)
- Tertiary: Action buttons (top right: Import, Export, Add New)

**Accessibility:**

- Table with proper headers
- Action buttons clearly labeled
- Usage summary with clear labels

#### Component Specification

**File Path:** `app/page.tsx` (Home Page)

**Tailwind Strategy:**

```tsx
// Usage summary container
className = "bg-muted rounded-lg p-4 mb-6";
// Summary items
className = "grid grid-cols-1 md:grid-cols-3 gap-4";
// Table container
className = "overflow-x-auto";
// Table
className = "w-full border-collapse";
// Table header
className = "bg-muted font-semibold";
// Table row
className = "border-b hover:bg-muted/50";
// Action buttons container
className = "flex gap-2 justify-end";
```

**Interactive States:**

- Default: Table rows with hover effect
- Hover: Row background highlight
- Focus: Action buttons with focus rings
- Active: Button press feedback

#### Design Details

- **Usage Summary:**
  - Master Learner: "Used: {amount} / Limit: {limit} PLN"
  - Master Care: "Used: {amount} / Limit: 750 PLN"
  - Team building: "Used: {amount} / Limit: 1,500 PLN"
- **Table Columns:**
  - Month (e.g., "January 2026")
  - ML, MC, Tools, Team building, Other (values in PLN)
  - Total (2 decimal places)
  - Status (badge with color coding)
  - Actions (Copy, Edit, Delete buttons)
- **Top Right Buttons:**
  - Import (outline variant)
  - Export (outline variant)
  - Add New (default variant, primary)

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness (horizontal scroll on mobile)
- [ ] Tab-key navigation working
- [ ] Financial data legible (tabular-nums for numbers)

---

### US-024: Edit Saved Calculation

#### Visual Strategy Summary

**Goal:** Pre-populate calculator form with saved values, allow editing with cancel confirmation.

**Hierarchy:**

- Primary: Calculator form (pre-populated)
- Secondary: Month selector (read-only, disabled)
- Tertiary: Cancel button (with confirmation dialog)

**Accessibility:**

- Form fields pre-populated
- Month selector disabled (read-only)
- Cancel confirmation dialog accessible

#### Component Specification

**File Path:** `app/edit/[id]/page.tsx` (Edit Page)

**Tailwind Strategy:**

```tsx
// Month selector (read-only)
className = "w-full disabled:opacity-50 disabled:cursor-not-allowed";
// Cancel button
className = "variant-outline";
// Confirmation dialog
className = "sm:max-w-[425px]";
```

**Interactive States:**

- Default: Form pre-populated, month selector disabled
- Cancel Click: Opens confirmation dialog
- Confirm Cancel: Navigates to home, clears localStorage
- Cancel Dialog: Returns to form

#### Design Details

- **Route:** `/edit/[id]` (dynamic route)
- **Month Selector:** Disabled, shows calculation month
- **Cancel Dialog:** "Are you sure you want to cancel? Unsaved changes will be lost."
- **Save Action:** Updates existing calculation, navigates to home

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Cancel confirmation clear

---

### US-025: Create Calculation from Existing (Clone)

#### Visual Strategy Summary

**Goal:** Pre-fill calculator with cloned values, allow modification before saving.

**Hierarchy:**

- Primary: Calculator form (pre-filled)
- Secondary: Month selector (enabled, shows current/next month)
- Tertiary: Save button (creates new calculation)

**Accessibility:**

- Form pre-filled with cloned values
- Month selector enabled (must select different month)

#### Component Specification

**File Path:** `app/create/page.tsx` (Clone Mode)

**Tailwind Strategy:**

```tsx
// Same as US-022 (create page)
// Month selector enabled
className = "w-full";
```

**Interactive States:**

- Default: Form pre-filled, month selector enabled
- Month Selection: Must select different month (validation)
- Save: Creates new calculation (not update)

#### Design Details

- **Route:** `/create?clone={id}` (query parameter)
- **Pre-fill:** All form values copied from source
- **Month:** Defaults to current month or next available
- **Validation:** One calculation per month (US-035)

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Clone functionality clear

---

### US-026: Calculate Accumulated Usage per Benefit Category

#### Visual Strategy Summary

**Goal:** Display usage summary with clear period indicators and remaining budget.

**Hierarchy:**

- Primary: Usage summary cards (top of home page)
- Secondary: Period indicators (e.g., "Jan-Feb 2026")
- Tertiary: Remaining budget (calculated)

**Accessibility:**

- Summary cards with clear labels
- Period information clearly displayed
- Remaining budget highlighted

#### Component Specification

**File Path:** `app/page.tsx` (Home Page - Usage Summary)

**Tailwind Strategy:**

```tsx
// Summary container
className = "bg-muted rounded-lg p-4 mb-6";
// Summary cards
className = "grid grid-cols-1 md:grid-cols-3 gap-4";
// Card
className = "bg-background border rounded-lg p-4";
// Usage text
className = "text-sm text-muted-foreground";
// Limit text
className = "text-lg font-semibold";
// Remaining (if low)
className = "text-orange-600 dark:text-orange-400";
// Remaining (if zero/negative)
className = "text-destructive";
```

**Interactive States:**

- Default: Summary cards with usage/limit
- Hover: Optional detailed breakdown (tooltip)
- Focus: Cards focusable for keyboard navigation

#### Design Details

- **Master Learner:**
  - Period: Current calendar year
  - Limit: 3,000 PLN (if joined Jan-Jun) or 1,500 PLN (if joined Jul-Dec)
  - Display: "Used: {amount} / Limit: {limit} PLN"
- **Master Care:**
  - Period: Current bi-monthly period (e.g., "Jan-Feb 2026")
  - Limit: 750 PLN
  - Display: "Used: {amount} / Limit: 750 PLN"
- **Team building:**
  - Period: Current quarter (e.g., "Q1: Jan-Mar 2026")
  - Limit: Fixed 1,500 PLN (not dependent on employment date)
  - Display: "Used: {amount} / Limit: 1,500 PLN travel expenses only (accommodation and transport)"

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness (stacked on mobile)
- [ ] Tab-key navigation working
- [ ] Period information clear

---

### US-027: Validate Against Accumulated Benefit Limits

#### Visual Strategy Summary

**Goal:** Show real-time validation with clear error messages including usage context.

**Hierarchy:**

- Primary: Input field (with error state)
- Secondary: Error message (with usage context)
- Tertiary: Remaining budget indicator (US-028)

**Accessibility:**

- Error messages announced to screen readers
- Clear visual error state
- Usage context in error message

#### Component Specification

**File Path:** `app/create/page.tsx` (Validation)

**Tailwind Strategy:**

```tsx
// Input field (error)
className={cn(
  "w-full",
  errors.field && "border-destructive"
)}
// Error message
className="text-sm text-destructive"
// Remaining indicator
className="text-xs text-muted-foreground"
```

**Interactive States:**

- Default: Input field enabled
- Error: Red border, error message below
- Validation: Real-time as user types
- Blocked: Save button disabled when errors exist

#### Design Details

- **Error Messages:**
  - ML: "Master Learner: You have used {accumulated} PLN. This entry ({new}) would exceed the annual limit of 3,000 PLN. Remaining: {remaining} PLN"
  - MC: "Master Care: You have used {accumulated} PLN in this period. This entry ({new}) would exceed the period limit of 750 PLN. Remaining: {remaining} PLN"
  - Team building: "Team building: You have used {accumulated} PLN this quarter for travel expenses. This entry ({new}) would exceed the quarterly limit of 1,500 PLN (fixed limit). Remaining: {remaining} PLN. Note: Only individual travel expenses (accommodation and transport) are tracked here."
- **Validation:** Real-time, checks accumulated usage + new value

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Error messages clear and actionable

---

### US-028: Display Remaining Budget Indicators

#### Visual Strategy Summary

**Goal:** Show remaining budget next to each benefit field with color coding.

**Hierarchy:**

- Primary: Input field
- Secondary: Remaining budget indicator (below field)
- Tertiary: Period information (optional)

**Accessibility:**

- Indicator clearly associated with field
- Color coding with text labels (not color alone)

#### Component Specification

**File Path:** `app/create/page.tsx` (Budget Indicators)

**Tailwind Strategy:**

```tsx
// Remaining indicator (normal)
className = "text-xs text-muted-foreground";
// Remaining indicator (low - < 10%)
className = "text-xs text-orange-600 dark:text-orange-400";
// Remaining indicator (zero/negative)
className = "text-xs text-destructive";
// Period info
className = "text-xs text-muted-foreground italic";
```

**Interactive States:**

- Default: Indicator visible, updates in real-time
- Low Budget: Orange color (< 10% of limit)
- Zero/Negative: Red color (error state)
- Hover: Optional tooltip with detailed breakdown

#### Design Details

- **Display Format:** "Remaining: X / {limit} PLN"
- **Period Info:** "Jan-Feb 2026" for MC, "Q1: Jan-Mar 2026" for Team building
- **Color Coding:**
  - Green/Normal: > 10% remaining
  - Orange/Warning: < 10% remaining
  - Red/Error: 0 or negative remaining
- **Update:** Real-time as user types

#### Design Review Checklist

- [ ] Dark Mode verified (orange color in dark mode)
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Color coding accessible (text labels)

---

### US-029: Filter Calculations by Status

#### Visual Strategy Summary

**Goal:** Provide filter dropdown with status options and counts.

**Hierarchy:**

- Primary: Filter dropdown (top of table)
- Secondary: Status badges in table (visual indicators)
- Tertiary: Status counts (in filter dropdown)

**Accessibility:**

- Filter dropdown with proper labels
- Status badges with color and text
- Keyboard navigation supported

#### Component Specification

**File Path:** `app/page.tsx` (Home Page - Filter)

**Tailwind Strategy:**

```tsx
// Filter dropdown
className = "w-full sm:w-auto";
// Status badge (Saved)
className = "bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs";
// Status badge (Submitted)
className =
  "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs";
// Status badge (Declined)
className = "bg-destructive/10 text-destructive px-2 py-1 rounded-full text-xs";
// Status badge (Approved)
className =
  "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs";
```

**Interactive States:**

- Default: Filter shows "All" or selected status
- Hover: Dropdown items highlight
- Active: Selected item highlighted
- Focus: Dropdown focusable

#### Design Details

- **Filter Options:**
  - All (default)
  - Saved (draft)
  - Submitted
  - Declined
  - Approved
- **Status Badges:**
  - Saved: Muted (gray)
  - Submitted: Blue
  - Declined: Red (destructive)
  - Approved: Green
- **Counts:** Show in dropdown (e.g., "Submitted (3)")

#### Design Review Checklist

- [ ] Dark Mode verified (status badge colors)
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Status colors accessible (text labels)

---

### US-030: Mark Calculation Status

#### Visual Strategy Summary

**Goal:** Provide status selector in calculation row or detail view.

**Hierarchy:**

- Primary: Status badge (clickable or dropdown)
- Secondary: Status options (dropdown menu)

**Accessibility:**

- Status selector accessible via keyboard
- Status changes announced to screen readers

#### Component Specification

**File Path:** `app/page.tsx` (Home Page - Status Selector)

**Tailwind Strategy:**

```tsx
// Status badge (clickable)
className = "cursor-pointer hover:opacity-80";
// Status dropdown
className = "min-w-[150px]";
```

**Interactive States:**

- Default: Status badge visible
- Hover: Badge opacity change
- Click: Dropdown opens
- Selected: Status updated, badge changes

#### Design Details

- **Status Options:** Saved, Submitted, Declined, Approved
- **Update:** Immediate save to IndexedDB
- **Visual:** Badge color changes based on status
- **Position:** In table row or detail view

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Status changes clear

---

### US-031: Export Calculations to File

#### Visual Strategy Summary

**Goal:** Provide export action with filter options and clear file download.

**Hierarchy:**

- Primary: Export button (top right of home page)
- Secondary: Export options dialog (if filters needed)
- Tertiary: Download confirmation

**Accessibility:**

- Export button clearly labeled
- Export options accessible
- File download announced

#### Component Specification

**File Path:** `app/page.tsx` (Home Page - Export)

**Tailwind Strategy:**

```tsx
// Export button
className = "variant-outline";
// Export dialog
className = "sm:max-w-[500px]";
// Export options
className = "space-y-4";
```

**Interactive States:**

- Default: Export button in top right
- Click: Opens export dialog (if filters) or downloads immediately
- Hover: Button highlight
- Focus: Button focusable

#### Design Details

- **Export Options:**
  - All calculations
  - Date range
  - Status filter
  - Specific month/year
- **File Format:** JSON
- **Filename:** `invoice-heaven-calculations-{date}.json`
- **Download:** Automatic browser download

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Export options clear

---

### US-032: Import Calculations from File

#### Visual Strategy Summary

**Goal:** Provide import action with file selection, validation, and preview.

**Hierarchy:**

- Primary: Import button (top right of home page)
- Secondary: File selection dialog
- Tertiary: Import preview and strategy selection

**Accessibility:**

- Import button clearly labeled
- File input accessible
- Preview information clear

#### Component Specification

**File Path:** `app/page.tsx` (Home Page - Import)

**Tailwind Strategy:**

```tsx
// Import button
className = "variant-outline";
// Import dialog
className = "sm:max-w-[600px]";
// File input
className = "w-full";
// Preview section
className = "bg-muted rounded-lg p-4";
// Strategy selection
className = "space-y-2";
```

**Interactive States:**

- Default: Import button in top right
- Click: Opens file selection
- File Selected: Shows preview and strategy options
- Confirm: Imports calculations

#### Design Details

- **File Selection:** HTML5 file input (JSON only)
- **Validation:** JSON format, required fields
- **Preview:**
  - Number of calculations
  - Date range
  - Status summary
- **Import Strategies:**
  - Merge (add to existing)
  - Replace (replace all)
  - Skip duplicates (by ID)
- **Success Message:** "Imported {count} calculations successfully"

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Import preview clear

---

### US-033: Validate Period-Based Input Restrictions

#### Visual Strategy Summary

**Goal:** Disable or show errors for period-invalid inputs with clear explanations.

**Hierarchy:**

- Primary: Input field (disabled or with error)
- Secondary: Period error message (clear explanation)
- Tertiary: Helper text (period information)

**Accessibility:**

- Disabled fields announced to screen readers
- Error messages explain period restrictions
- Helper text provides context

#### Component Specification

**File Path:** `app/create/page.tsx` (Period Validation)

**Tailwind Strategy:**

```tsx
// Input field (disabled)
className={cn(
  "w-full",
  isPeriodInvalid && "opacity-50 cursor-not-allowed"
)}
// Period error
className="text-sm text-destructive"
// Helper text
className="text-xs text-muted-foreground italic"
```

**Interactive States:**

- Default: Enabled (if period valid)
- Disabled: When period invalid (MC/Team building)
- Error: Red border and error message
- Focus: No focus when disabled

#### Design Details

- **Master Care:**
  - Disabled in non-settlement months
  - Error: "Master Care can only be entered in calculations for {settlementMonth} (settlement month for {currentPeriod} period). This calculation is for {month}, which is not the settlement month."
- **Team building:**
  - Disabled outside current quarter
  - Error: "Team building can only be entered in calculations for {currentQuarter} (e.g., Q1: Jan-Mar). This calculation is for {month}, which is outside the current settlement period."
- **Helper Text:** Explains settlement periods

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working (skips disabled)
- [ ] Period errors clearly explained

---

### US-034: Persist Calculator State in LocalStorage

#### Visual Strategy Summary

**Goal:** Transparent auto-save with no visible UI (background operation).

**Hierarchy:**

- No UI changes (background operation)
- User sees restored state on page load

**Accessibility:**

- No accessibility impact

#### Component Specification

**File Path:** `app/create/page.tsx` (State Persistence)

**Tailwind Strategy:**

- No UI styling (background operation)

**Interactive States:**

- No interactive states (automatic save/load)

#### Design Details

- **Storage Key:** `"invoice-heaven-calculator-state"`
- **Save:** Debounced (e.g., 500ms after change)
- **Load:** On component mount
- **Clear:** After successful save or confirmed cancel
- **State Includes:**
  - All form field values
  - All tools entries
  - Selected month
  - Calculation mode (new/edit)
  - Calculation ID (if editing)

#### Design Review Checklist

- [x] Dark Mode verified (no impact)
- [x] Mobile/Tablet responsiveness (no impact)
- [x] Tab-key navigation working (no impact)
- [x] State restoration transparent

---

### US-035: Enforce One Calculation Per Month

#### Visual Strategy Summary

**Goal:** Validate month selection to prevent duplicate calculations.

**Hierarchy:**

- Primary: Month selector (with validation)
- Secondary: Error message (if month exists)
- Tertiary: Save button (disabled when error)

**Accessibility:**

- Error message announced to screen readers
- Month selector with error state

#### Component Specification

**File Path:** `app/create/page.tsx` (Month Validation)

**Tailwind Strategy:**

```tsx
// Month selector (error)
className={cn(
  "w-full",
  errors.month && "border-destructive"
)}
// Error message
className="text-sm text-destructive"
```

**Interactive States:**

- Default: Month selector enabled
- Error: Red border, error message below
- Disabled: Save button disabled when error exists
- Focus: Standard focus ring

#### Design Details

- **Validation:** Checks IndexedDB for existing calculation for selected month
- **Error Message:** "A calculation already exists for {month}. Please edit the existing calculation or select a different month."
- **Edit Mode:** Month selector disabled (read-only)

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Error message clear

---

### US-036: Delete Calculation with Confirmation

#### Visual Strategy Summary

**Goal:** Provide delete action with confirmation dialog to prevent accidental deletion.

**Hierarchy:**

- Primary: Delete button (in table row)
- Secondary: Confirmation dialog (destructive action)
- Tertiary: Success message (after deletion)

**Accessibility:**

- Delete button with ARIA label
- Confirmation dialog accessible
- Success message announced

#### Component Specification

**File Path:** `app/page.tsx` (Home Page - Delete)

**Tailwind Strategy:**

```tsx
// Delete button
className =
  "variant-ghost size-icon text-destructive hover:text-destructive hover:bg-destructive/10";
// Confirmation dialog
className = "sm:max-w-[425px]";
// Delete button in dialog
className = "variant-destructive";
```

**Interactive States:**

- Default: Delete button (icon, ghost variant)
- Hover: Red background highlight
- Click: Opens confirmation dialog
- Confirm: Deletes calculation, shows success message
- Cancel: Closes dialog, no action

#### Design Details

- **Confirmation Dialog:**
  - Title: "Delete Calculation?"
  - Message: "Are you sure you want to delete the calculation for {month}? This action cannot be undone."
  - Buttons: "Cancel" (outline), "Delete" (destructive)
- **Success Message:** "Calculation for {month} deleted successfully"
- **Action:** Removes from IndexedDB, updates list

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Confirmation dialog clear

---

### US-037: Copy Calculation InvoiceHeaven String from List

#### Visual Strategy Summary

**Goal:** Provide quick copy action directly from calculation list.

**Hierarchy:**

- Primary: Copy button (in table row)
- Secondary: Success feedback (button state change)

**Accessibility:**

- Copy button with ARIA label
- Success feedback announced

#### Component Specification

**File Path:** `app/page.tsx` (Home Page - Copy)

**Tailwind Strategy:**

```tsx
// Copy button
className = "variant-ghost size-icon";
// Button (copied state)
className = "variant-ghost size-icon text-green-600 dark:text-green-400";
```

**Interactive States:**

- Default: Copy icon button
- Hover: Background highlight
- Click: Copies string, shows checkmark
- Copied: Checkmark icon, green color (2 seconds)

#### Design Details

- **Button:** Icon-only (Copy icon)
- **Feedback:** Changes to checkmark icon, green color
- **Duration:** 2 seconds
- **Tooltip:** "Copied to clipboard!" (optional)

#### Design Review Checklist

- [ ] Dark Mode verified (green color in dark mode)
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Success feedback clear

---

### US-038: Enter Employment Start Date

#### Visual Strategy Summary

**Goal:** Provide employment date input for accurate limit calculations.

**Hierarchy:**

- Primary: Employment date input (month/year selector)
- Secondary: Warning message (if not set)
- Tertiary: Settings/profile section

**Accessibility:**

- Date input with proper labels
- Warning message announced
- Clear instructions

#### Component Specification

**File Path:** `app/settings/page.tsx` (Settings Page) or inline in calculator

**Tailwind Strategy:**

```tsx
// Date input container
className = "space-y-2";
// Month selector
className = "w-full";
// Year input
className = "w-full";
// Warning message
className = "text-sm text-orange-600 dark:text-orange-400";
```

**Interactive States:**

- Default: Date input enabled
- Error: Red border if future date
- Focus: Standard focus rings
- Warning: Orange text if not set

#### Design Details

- **Input:** Month (1-12 or month name) and Year (number)
- **Validation:** Cannot be future date
- **Storage:** localStorage or IndexedDB
- **Warning:** "Employment date not set. Default limits applied. Set your employment date for accurate limit calculations."
- **Impact:**
  - Master Learner: 3,000 PLN (Jan-Jun) or 1,500 PLN (Jul-Dec)
  - Team building: Fixed 1,500 PLN quarterly (not dependent on employment date)

#### Design Review Checklist

- [ ] Dark Mode verified
- [ ] Mobile/Tablet responsiveness
- [ ] Tab-key navigation working
- [ ] Warning message clear

---

## Design System Reference

### Color Palette (HSL Variables)

- **Background:** `--background`, `--foreground`
- **Card:** `--card`, `--card-foreground`
- **Primary:** `--primary`, `--primary-foreground`
- **Secondary:** `--secondary`, `--secondary-foreground`
- **Muted:** `--muted`, `--muted-foreground`
- **Accent:** `--accent`, `--accent-foreground`
- **Destructive:** `--destructive`, `--destructive-foreground`
- **Border:** `--border`, `--input`, `--ring`

### Typography

- **Headings:** `font-semibold` or `font-bold`
- **Body:** Default font size
- **Small Text:** `text-sm` or `text-xs`
- **Monospace:** `font-mono` for InvoiceHeaven strings
- **Numbers:** `tabular-nums` for alignment

### Spacing

- **Container Padding:** `p-4` (mobile), `p-6` (desktop)
- **Gap Between Elements:** `gap-2`, `gap-4`
- **Card Padding:** `p-3`, `p-4`, `p-6`

### Components

- **Buttons:** base-ui Button component
  - Default: Primary action
  - Outline: Secondary action
  - Ghost: Tertiary action
  - Destructive: Delete/destructive actions
- **Inputs:** base-ui Input component
  - Standard styling with error states
  - Read-only: Muted background
- **Dialogs:** Radix UI Dialog
  - Max width: `sm:max-w-[600px]` or `sm:max-w-[425px]`
  - Focus trap enabled
- **Tables:** Standard HTML table with Tailwind styling
  - Responsive: Horizontal scroll on mobile
  - Hover: Row highlight

---

## Implementation Notes

1. **All components must use CSS variables** for theming (not hardcoded colors)
2. **Responsive design** is mandatory (mobile-first approach)
3. **Accessibility** must be verified (WCAG AA minimum)
4. **Financial data** must use `tabular-nums` for proper alignment
5. **Error states** must use `--destructive` color
6. **Dark mode** must be tested for all components
7. **Keyboard navigation** must be logical and complete

---

## Change Log

### Version 1.1 (2026-01-16)

- Updated Team building benefit rules: Changed from employment date-dependent limit to fixed 1,500 PLN quarterly limit (not dependent on employment date)
- Updated US-007 design specifications: Clarified that Team building limit is fixed at 1,500 PLN per quarter
- Updated US-026, US-027 design specifications: Removed employment date dependency for Team building limit calculations
- Updated US-038 design specifications: Removed Team building from employment date dependencies

---

**Document End**
