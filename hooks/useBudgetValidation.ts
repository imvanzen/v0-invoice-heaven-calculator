import { useMemo } from "react";
import type { Calculation, EmploymentDate } from "@/types/calculation";
import {
  calculateAccumulatedML,
  calculateAccumulatedMC,
  calculateAccumulatedIntegrations,
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
    /** Max PLN allowed for this bi-monthly period (500 PLN fixed) */
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
 * Hook to validate benefit values against accumulated limits (ML/MC bi-monthly, Integrations quarterly).
 * ML no longer depends on employment date; fixed 500 PLN per bi-monthly period.
 */
export function useBudgetValidation(
  selectedMonth: string,
  _employmentDate: EmploymentDate | null,
  calculations: Calculation[],
  values: BudgetValidationInput,
  editingCalculationId?: string,
): BudgetValidationResult {
  return useMemo(() => {
    const { year, month } = parseMonthString(selectedMonth);
    const date = new Date(Date.UTC(year, month - 1, 1));
    const benefitRules = getBenefitRules(date);

    // Master Learner: bi-monthly period only, 500 PLN limit (no employment-date dependency)
    const mlAccumulated = calculateAccumulatedML(
      calculations,
      selectedMonth,
      editingCalculationId,
    );
    const mlLimit = benefitRules.limits.masterLearner.biMonthlyLimit;
    const mlTotal = mlAccumulated + values.masterLearner;
    const mlRemaining = Math.max(0, mlLimit - mlAccumulated);
    const mlValid = mlTotal <= mlLimit;

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
        accumulated: mlAccumulated,
        limit: mlLimit,
        remaining: mlRemaining,
        maxThisPeriod: Math.min(mlLimit, mlRemaining),
        isValid: mlValid,
        error: mlValid
          ? undefined
          : `Would exceed period limit of ${mlLimit} PLN. Accumulated: ${mlAccumulated} PLN. Remaining: ${mlRemaining} PLN.`,
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
  }, [selectedMonth, calculations, values, editingCalculationId]);
}
