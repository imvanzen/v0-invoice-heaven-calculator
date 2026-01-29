import { Calculation } from "@/types/calculation";
import { parseMonthString, getBiMonthlyPeriod, getQuarter } from "./periods";
import { addMoney } from "./money";
import { getCurrentBenefitRules, BenefitRules } from "@/types/benefit-rules";

// Calculate accumulated Master Learner usage for current bi-monthly period
export function calculateAccumulatedML(
  calculations: Calculation[],
  currentMonth: string,
  excludeCalculationId?: string,
): number {
  const { year, month } = parseMonthString(currentMonth);
  const currentPeriod = getBiMonthlyPeriod(month);

  return calculations
    .filter((calc) => {
      if (excludeCalculationId && calc.id === excludeCalculationId) {
        return false;
      }
      const calcDate = parseMonthString(calc.month);
      if (calcDate.year !== year) return false;
      const calcPeriod = getBiMonthlyPeriod(calcDate.month);
      return calcPeriod === currentPeriod;
    })
    .reduce((sum, calc) => addMoney(...[sum, calc.masterLearner]), 0);
}

// Calculate accumulated Master Care usage for current bi-monthly period
export function calculateAccumulatedMC(
  calculations: Calculation[],
  currentMonth: string,
  excludeCalculationId?: string,
): number {
  const { year, month } = parseMonthString(currentMonth);
  const currentPeriod = getBiMonthlyPeriod(month);

  return calculations
    .filter((calc) => {
      if (excludeCalculationId && calc.id === excludeCalculationId) {
        return false;
      }
      const calcDate = parseMonthString(calc.month);
      if (calcDate.year !== year) return false;
      const calcPeriod = getBiMonthlyPeriod(calcDate.month);
      return calcPeriod === currentPeriod;
    })
    .reduce((sum, calc) => addMoney(...[sum, calc.masterCare]), 0);
}

// Calculate accumulated Integrations usage for current quarter
export function calculateAccumulatedIntegrations(
  calculations: Calculation[],
  currentMonth: string,
  excludeCalculationId?: string,
): number {
  const { year, month } = parseMonthString(currentMonth);
  const currentQuarter = getQuarter(month);

  return calculations
    .filter((calc) => {
      if (excludeCalculationId && calc.id === excludeCalculationId) {
        return false;
      }
      const calcDate = parseMonthString(calc.month);
      if (calcDate.year !== year) return false;
      const calcQuarter = getQuarter(calcDate.month);
      return calcQuarter === currentQuarter;
    })
    .reduce((sum, calc) => addMoney(...[sum, calc.integracje]), 0);
}

// Usage summary for display
export interface UsageSummary {
  masterLearner: {
    used: number;
    limit: number;
    remaining: number;
    period: string; // "Jan-Feb 2026"
  };
  masterCare: {
    used: number;
    limit: number;
    remaining: number;
    period: string; // "Jan-Feb 2026"
  };
  integrations: {
    used: number;
    limit: number;
    remaining: number;
    period: string; // "Q1: Jan-Mar 2026"
  };
}

/**
 * Calculate complete usage summary using current benefit rules.
 * ML and MC are bi-monthly (500 / 750 PLN per period); Integrations quarterly.
 */
export function calculateUsageSummary(
  calculations: Calculation[],
  currentMonth: string,
): UsageSummary {
  const { year, month } = parseMonthString(currentMonth);
  const rules = getCurrentBenefitRules();

  const mlLimit = rules.limits.masterLearner.biMonthlyLimit;
  const mlUsed = calculateAccumulatedML(calculations, currentMonth);
  const mlRemaining = mlLimit - mlUsed;

  const mcLimit = rules.limits.masterCare.biMonthlyLimit;
  const mcUsed = calculateAccumulatedMC(calculations, currentMonth);
  const mcRemaining = mcLimit - mcUsed;

  const intLimit = rules.limits.integrations.quarterlyLimit;
  const intUsed = calculateAccumulatedIntegrations(calculations, currentMonth);
  const intRemaining = intLimit - intUsed;

  const period = getBiMonthlyPeriod(month);
  const quarter = getQuarter(month);

  return {
    masterLearner: {
      used: mlUsed,
      limit: mlLimit,
      remaining: mlRemaining,
      period: `${period} ${year}`,
    },
    masterCare: {
      used: mcUsed,
      limit: mcLimit,
      remaining: mcRemaining,
      period: `${period} ${year}`,
    },
    integrations: {
      used: intUsed,
      limit: intLimit,
      remaining: intRemaining,
      period: `${quarter}: ${year}`,
    },
  };
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate Master Learner against accumulated usage (bi-monthly period only; 500 PLN limit).
 */
export function validateMLAgainstLimit(
  newValue: number,
  accumulated: number,
  rules?: BenefitRules,
): ValidationResult {
  const benefitRules = rules || getCurrentBenefitRules();
  const periodLimit = benefitRules.limits.masterLearner.biMonthlyLimit;

  if (newValue > periodLimit) {
    return {
      isValid: false,
      error: `Master Learner: Maximum ${periodLimit} PLN per period (every 2 months).`,
    };
  }

  const total = addMoney(...[accumulated, newValue]);
  if (total > periodLimit) {
    const remaining = Math.max(0, periodLimit - accumulated);
    return {
      isValid: false,
      error: `Master Learner: You have used ${accumulated} PLN in this period. This entry (${newValue}) would exceed the period limit of ${periodLimit} PLN. Remaining: ${remaining} PLN.`,
    };
  }

  return { isValid: true };
}

/**
 * Validate Master Care against accumulated usage using current rules
 */
export function validateMCAgainstLimit(
  newValue: number,
  accumulated: number,
  rules?: BenefitRules,
): ValidationResult {
  const benefitRules = rules || getCurrentBenefitRules();
  const periodLimit = benefitRules.limits.masterCare.biMonthlyLimit;
  const maxEntry = periodLimit; // Max entry equals period limit

  if (newValue > maxEntry) {
    return {
      isValid: false,
      error: `Master Care: Maximum entry value is ${maxEntry} PLN.`,
    };
  }

  const total = addMoney(...[accumulated, newValue]);
  if (total > periodLimit) {
    const remaining = Math.max(0, periodLimit - accumulated);
    return {
      isValid: false,
      error: `Master Care: You have used ${accumulated} PLN in this period. This entry (${newValue}) would exceed the period limit of ${periodLimit} PLN. Remaining: ${remaining} PLN.`,
    };
  }

  return { isValid: true };
}

/**
 * Validate Integrations against accumulated usage using current rules
 */
export function validateIntegrationsAgainstLimit(
  newValue: number,
  accumulated: number,
  rules?: BenefitRules,
): ValidationResult {
  const benefitRules = rules || getCurrentBenefitRules();
  const quarterlyLimit = benefitRules.limits.integrations.quarterlyLimit;

  const total = addMoney(...[accumulated, newValue]);
  if (total > quarterlyLimit) {
    const remaining = Math.max(0, quarterlyLimit - accumulated);
    return {
      isValid: false,
      error: `Integrations: You have used ${accumulated} PLN this quarter for travel expenses. This entry (${newValue}) would exceed the quarterly limit of ${quarterlyLimit} PLN (fixed limit). Remaining: ${remaining} PLN. Note: Only individual travel expenses (accommodation and transport) are tracked here.`,
    };
  }

  return { isValid: true };
}
