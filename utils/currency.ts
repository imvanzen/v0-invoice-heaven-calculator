/**
 * Currency formatting utilities using Intl.NumberFormat
 * Uses centralized money utilities for consistent rounding
 */

import { roundUpMoney } from "./money";

const PLN_FORMATTER = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PLN_COMPACT_FORMATTER = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a number as PLN currency
 * @param amount - The amount to format
 * @param compact - If true, omits decimal places for whole numbers
 * @returns Formatted currency string (e.g., "1 234,56 zł")
 */
export function formatCurrency(amount: number, compact = false): string {
  // Handle NaN and invalid numbers
  if (isNaN(amount) || !isFinite(amount)) {
    return "0,00 zł";
  }
  
  // Round up to 2 decimals using centralized money utility
  const rounded = roundUpMoney(amount);
  
  if (compact && rounded % 1 === 0) {
    return PLN_COMPACT_FORMATTER.format(rounded);
  }
  return PLN_FORMATTER.format(rounded);
}

/**
 * Format a number as PLN amount without currency symbol
 * Useful for inputs and calculations display
 * Always rounds up to specified decimals
 */
export function formatAmount(amount: number, decimals = 2): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return decimals === 2 ? "0,00" : "0";
  }
  
  // Round up using centralized utility
  const rounded = roundUpMoney(amount);
  
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rounded);
}

