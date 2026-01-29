import { Calculation, EmploymentDate } from "@/types/calculation";
import { parseMonthString, getBiMonthlyPeriod, getQuarter } from "./periods";
import { addMoney } from "./money";
import { getCurrentBenefitRules, BenefitRules } from "@/types/benefit-rules";

/**
 * Calculate total months worked from employment date to selected month
 * @param employmentDate - User's employment start date
 * @param selectedMonth - Month string in format "YYYY-MM"
 * @returns Total number of months worked (inclusive of both start and end months)
 */
function calculateTotalMonthsWorked(
  employmentDate: EmploymentDate,
  selectedMonth: string,
): number {
  const { year: selectedYear, month: selectedMonthNum } =
    parseMonthString(selectedMonth);
  const { year: employmentYear, month: employmentMonth } = employmentDate;

  // Calculate total months: (selectedYear - employmentYear) * 12 + (selectedMonthNum - employmentMonth) + 1
  // The +1 makes it inclusive of both the employment month and the selected month
  const totalMonths =
    (selectedYear - employmentYear) * 12 +
    (selectedMonthNum - employmentMonth) +
    1;

  return totalMonths;
}

/**
 * Calculate Master Learner annual limit based on employment date, selected month, and benefit rules
 * The limit depends on total months worked (not just the join month):
 * - If total months worked < 6: reduced pool (1,500 PLN)
 * - If total months worked >= 6: full pool (3,000 PLN)
 * @param employmentDate - User's employment start date (null means not set)
 * @param selectedMonth - Month string in format "YYYY-MM" (for calculating total months worked)
 * @param rules - Benefit rules to use (defaults to current rules)
 */
export function getMasterLearnerAnnualLimit(
  employmentDate: EmploymentDate | null,
  selectedMonth: string,
  rules?: BenefitRules,
): number {
  const benefitRules = rules || getCurrentBenefitRules();
  const annualLimit = benefitRules.limits.masterLearner.annualLimit;

  if (!employmentDate) {
    return annualLimit; // Default to full limit
  }

  // Calculate total months worked from employment date to selected month
  const totalMonths = calculateTotalMonthsWorked(
    employmentDate,
    selectedMonth,
  );

  // If worked less than 6 months, use reduced pool
  // Otherwise, use full pool
  return totalMonths < 6 ? annualLimit / 2 : annualLimit;
}

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

// Calculate accumulated Master Learner usage for current year (for annual limit validation)
export function calculateAccumulatedMLAnnual(
  calculations: Calculation[],
  currentYear: number,
  excludeCalculationId?: string,
): number {
  return calculations
    .filter((calc) => {
      if (excludeCalculationId && calc.id === excludeCalculationId) {
        return false;
      }
      const { year } = parseMonthString(calc.month);
      return year === currentYear;
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
    period: string; // "2026"
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
 * Calculate complete usage summary using current benefit rules
 */
export function calculateUsageSummary(
  calculations: Calculation[],
  currentMonth: string,
  employmentDate: EmploymentDate | null,
): UsageSummary {
  const { year, month } = parseMonthString(currentMonth);
  const rules = getCurrentBenefitRules();

  const mlLimit = getMasterLearnerAnnualLimit(
    employmentDate,
    currentMonth,
    rules,
  );
  const mlUsedAnnual = calculateAccumulatedMLAnnual(calculations, year);
  // Show annual usage (limit is annual, but settled bi-monthly)
  const mlRemaining = mlLimit - mlUsedAnnual;

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
      used: mlUsedAnnual, // Show annual usage (limit is annual)
      limit: mlLimit, // Annual limit
      remaining: mlRemaining,
      period: `${period} ${year}`, // Show current bi-monthly period for context
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
 * Validate Master Learner against accumulated usage using current rules
 * Per-period cap: 500 PLN; annual cap: limit (3000 or 1500).
 */
export function validateMLAgainstLimit(
  newValue: number,
  accumulated: number,
  limit: number,
  rules?: BenefitRules,
): ValidationResult {
  const benefitRules = rules || getCurrentBenefitRules();
  const maxEntryPerPeriod = benefitRules.limits.masterLearner.biMonthlyLimit;

  if (newValue > maxEntryPerPeriod) {
    return {
      isValid: false,
      error: `Master Learner: Maximum ${maxEntryPerPeriod} PLN per period (every 2 months).`,
    };
  }

  const total = addMoney(...[accumulated, newValue]);
  if (total > limit) {
    const remaining = Math.max(0, limit - accumulated);
    return {
      isValid: false,
      error: `Master Learner: You have used ${accumulated} PLN this year. This entry (${newValue}) would exceed the annual limit of ${limit} PLN. Remaining: ${remaining} PLN.`,
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
