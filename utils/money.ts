/**
 * Centralized Money Utility
 * 
 * All financial calculations are performed in cents (integers) to avoid
 * floating-point precision errors. All display values are rounded up to
 * 2 decimal places and formatted as "0.00".
 * 
 * Core principles:
 * 1. Store and calculate in cents (integers)
 * 2. Round up to 2 decimals for display
 * 3. Use consistent formatting across the app
 * 4. No imports within functions (all at top)
 */

/**
 * Convert decimal amount to cents (integer)
 * @param amount - Decimal amount (e.g., 82.70)
 * @returns Amount in cents (e.g., 8270)
 */
export function toCents(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) {
    return 0;
  }
  return Math.round(amount * 100);
}

/**
 * Convert cents (integer) to decimal amount
 * @param cents - Amount in cents (e.g., 8270)
 * @returns Decimal amount (e.g., 82.70)
 */
export function fromCents(cents: number): number {
  if (isNaN(cents) || !isFinite(cents)) {
    return 0;
  }
  return cents / 100;
}

/**
 * Round up amount to 2 decimal places (ceiling)
 * @param amount - Decimal amount
 * @returns Amount rounded up to 2 decimals
 */
export function roundUpMoney(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) {
    return 0;
  }
  return Math.ceil(amount * 100) / 100;
}

/**
 * Add multiple money values using cent-based calculation
 * @param values - Variable number of decimal amounts
 * @returns Sum rounded up to 2 decimal places
 */
export function addMoney(...values: number[]): number {
  const sumInCents = values.reduce((sum, value) => {
    return sum + toCents(value);
  }, 0);
  
  return roundUpMoney(fromCents(sumInCents));
}

/**
 * Multiply two money values using cent-based calculation
 * @param amount - Base amount
 * @param multiplier - Multiplier (e.g., exchange rate)
 * @returns Product rounded up to 2 decimal places
 */
export function multiplyMoney(amount: number, multiplier: number): number {
  if (isNaN(amount) || !isFinite(amount)) {
    return 0;
  }
  if (isNaN(multiplier) || !isFinite(multiplier)) {
    return 0;
  }
  
  // For multiplication, we work in cents but the multiplier stays decimal
  const amountInCents = toCents(amount);
  const resultInCents = Math.round(amountInCents * multiplier);
  
  return roundUpMoney(fromCents(resultInCents));
}

/**
 * Format money amount for display (always 2 decimals)
 * @param amount - Decimal amount
 * @returns Formatted string (e.g., "82.70")
 */
export function formatMoney(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return "0.00";
  }
  
  // Round up and format to exactly 2 decimals
  const rounded = roundUpMoney(amount);
  return rounded.toFixed(2);
}

/**
 * Format money amount for display using Polish locale
 * @param amount - Decimal amount
 * @returns Formatted string with comma separator (e.g., "82,70")
 */
export function formatMoneyPL(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return "0,00";
  }
  
  const rounded = roundUpMoney(amount);
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

/**
 * Parse string input to money value
 * Handles both comma and dot as decimal separator
 * @param input - String input (e.g., "82.70" or "82,70")
 * @returns Parsed decimal amount
 */
export function parseMoneyInput(input: string | number): number {
  if (typeof input === "number") {
    return input;
  }

  if (!input || input === "") {
    return 0;
  }

  // Replace comma with dot for parsing
  const normalized = input.toString().replace(",", ".");
  const parsed = parseFloat(normalized);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse raw form input to the number to set on a money field.
 * Empty string → 0; valid number (comma or dot) → that number; invalid → keep currentValue.
 * Use for controlled money inputs (create/edit forms) for consistent behavior.
 */
export function parseMoneyFormValue(
  rawInput: string,
  currentValue: number | undefined
): number {
  if (rawInput === "") return 0;
  const num = parseMoneyInput(rawInput);
  return isNaN(num) ? (currentValue ?? 0) : num;
}

/**
 * Format stored money value for display in a controlled input.
 * undefined / null / 0 → "" (empty input for pristine create); otherwise the number.
 * Use so create form shows empty and edit form shows initial values.
 */
export function toMoneyInputValue(value: number | undefined | null): string {
  if (value === undefined || value === null || value === 0) return "";
  return String(value);
}

