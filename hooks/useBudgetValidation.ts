import { useMemo } from "react";
import type { Calculation, EmploymentDate } from "@/types/calculation";
import {
  calculateAccumulatedMLAnnual,
  calculateAccumulatedMC,
  calculateAccumulatedIntegrations,
  getMasterLearnerAnnualLimit,
} from "@/utils/limits";
import { parseMonthString } from "@/utils/periods";
import { getBenefitRules } from "@/types/benefit-rules";

interface BudgetValidationInput {
  masterLearner: number;
  masterCare: number;
  integracje: number;
}

interface BudgetValidationResult {
  masterLearner: {
    accumulated: number;
    limit: number;
    remaining: number;
    /** Max PLN allowed for this bi-monthly period (500 or less if remaining < 500) */
    maxThisPeriod: number;
    isValid: boolean;
    error?: string;
  };
  masterCare: {
    accumulated: number;
    limit: number;
    remaining: number;
    isValid: boolean;
    error?: string;
  };
  integracje: {
    accumulated: number;
    limit: number;
    remaining: number;
    isValid: boolean;
    error?: string;
  };
  isValid: boolean;
}

/**
 * Hook to validate budget values against accumulated limits using benefit rules
 * for the selected month
 * @param selectedMonth - Month string (YYYY-MM)
 * @param employmentDate - User's employment date (used for Master Learner limit calculation)
 * @param calculations - All calculations (will exclude editingCalculationId if provided)
 * @param values - Current form values to validate
 * @param editingCalculationId - ID of calculation being edited (optional, for edit mode)
 */
export function useBudgetValidation(
  selectedMonth: string,
  employmentDate: EmploymentDate | null,
  calculations: Calculation[],
  values: BudgetValidationInput,
  editingCalculationId?: string,
): BudgetValidationResult {
  return useMemo(() => {
    const { year, month } = parseMonthString(selectedMonth);

    // Get benefit rules for the selected month
    // Use UTC date to avoid timezone issues when converting to ISO string
    const date = new Date(Date.UTC(year, month - 1, 1)); // month is 1-indexed
    const benefitRules = getBenefitRules(date);

    // Master Learner validation
    // Use annual accumulation for limit validation (annual limit)
    const mlAccumulatedAnnual = calculateAccumulatedMLAnnual(
      calculations,
      year,
      editingCalculationId,
    );
    const mlAnnualLimit = getMasterLearnerAnnualLimit(
      employmentDate,
      selectedMonth,
      benefitRules,
    );
    const mlBiMonthlyCap = benefitRules.limits.masterLearner.biMonthlyLimit;
    const mlTotal = mlAccumulatedAnnual + values.masterLearner;
    const mlRemaining = Math.max(0, mlAnnualLimit - mlAccumulatedAnnual);
    const mlValid =
      values.masterLearner <= mlBiMonthlyCap && mlTotal <= mlAnnualLimit;

    // Master Care validation
    const mcAccumulated = calculateAccumulatedMC(
      calculations,
      selectedMonth,
      editingCalculationId,
    );
    const mcLimit = benefitRules.limits.masterCare.biMonthlyLimit;
    const mcTotal = mcAccumulated + values.masterCare;
    const mcRemaining = Math.max(0, mcLimit - mcAccumulated);
    const mcValid = mcTotal <= mcLimit;

    // Integrations validation
    const intAccumulated = calculateAccumulatedIntegrations(
      calculations,
      selectedMonth,
      editingCalculationId,
    );
    const intLimit = benefitRules.limits.integrations.quarterlyLimit;
    const intTotal = intAccumulated + values.integracje;
    const intRemaining = Math.max(0, intLimit - intAccumulated);
    const intValid = intTotal <= intLimit;

    const result: BudgetValidationResult = {
      masterLearner: {
        accumulated: mlAccumulatedAnnual,
        limit: mlAnnualLimit,
        remaining: mlRemaining,
        maxThisPeriod: Math.min(mlBiMonthlyCap, mlRemaining),
        isValid: mlValid,
        error: mlValid
          ? undefined
          : values.masterLearner > mlBiMonthlyCap
            ? `Max ${mlBiMonthlyCap} PLN per period. Remaining this year: ${mlRemaining} PLN.`
            : `Would exceed annual limit of ${mlAnnualLimit} PLN. Accumulated: ${mlAccumulatedAnnual} PLN. Remaining: ${mlRemaining} PLN.`,
      },
      masterCare: {
        accumulated: mcAccumulated,
        limit: mcLimit,
        remaining: mcRemaining,
        isValid: mcValid,
        error: mcValid
          ? undefined
          : `Would exceed limit of ${mcLimit} PLN. Accumulated: ${mcAccumulated} PLN. Remaining: ${mcRemaining} PLN.`,
      },
      integracje: {
        accumulated: intAccumulated,
        limit: intLimit,
        remaining: intRemaining,
        isValid: intValid,
        error: intValid
          ? undefined
          : `Would exceed limit of ${intLimit} PLN. Accumulated: ${intAccumulated} PLN. Remaining: ${intRemaining} PLN.`,
      },
      isValid: mlValid && mcValid && intValid,
    };

    return result;
  }, [
    selectedMonth,
    employmentDate,
    calculations,
    values,
    editingCalculationId,
  ]);
}
