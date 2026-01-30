import { z } from "zod";
import { toolSchema } from "./tool-schema";
import {
  parseMonthString,
  isMonthBiMonthlySettlementMonth,
} from "@/utils/periods";
import { getBenefitRules, getCurrentBenefitRules } from "@/types/benefit-rules";

/**
 * Get max values from benefit rules for validation
 * ML and MC use bi-monthly limits; Integrations use quarterly.
 */
function getMaxValuesFromRules(month?: string) {
  let rules;
  if (month) {
    const { year, month: monthNum } = parseMonthString(month);
    const date = new Date(Date.UTC(year, monthNum - 1, 1));
    rules = getBenefitRules(date);
  } else {
    rules = getCurrentBenefitRules();
  }

  return {
    masterLearner: rules.limits.masterLearner.biMonthlyLimit,
    masterCare: rules.limits.masterCare.biMonthlyLimit,
    integrations: rules.limits.integrations.quarterlyLimit,
  };
}

// Get default max values from current benefit rules
const defaultMaxValues = getMaxValuesFromRules();

const SETTLEMENT_MONTHS_MESSAGE =
  "Can only be entered in settlement months (February, April, June, August, October, December)";

/**
 * Base validation schema for Calculation form (without refinements)
 * This allows .omit() to work properly
 *
 * Note: Per-entry max values use benefit rule limits. The accumulated
 * validation (checking usage across multiple calculations) is handled
 * separately via useBudgetValidation hook.
 */
const baseCalculationFormSchema = z.object({
  // Month selection (format: YYYY-MM)
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid month format (expected YYYY-MM)")
    .refine((val) => {
      const { year } = parseMonthString(val);
      const currentYear = new Date().getFullYear();
      return year >= 2020 && year <= currentYear;
    }, "Year must be between 2020 and current year"),

  // Master Learner (500 PLN per bi-monthly period; same method as Master Care)
  masterLearner: z
    .number({ error: "Master Learner must be a number" })
    .min(0, "Master Learner cannot be negative")
    .max(
      defaultMaxValues.masterLearner,
      `Master Learner cannot exceed ${defaultMaxValues.masterLearner} PLN per period (every 2 months)`,
    ),

  // Master Care (per-entry max uses benefit rules)
  masterCare: z
    .number({ error: "Master Care must be a number" })
    .min(0, "Master Care cannot be negative")
    .max(
      defaultMaxValues.masterCare,
      `Master Care cannot exceed ${defaultMaxValues.masterCare} PLN per entry`,
    ),

  // Team building (per-entry max uses benefit rules)
  integracje: z
    .number({ error: "Team building must be a number" })
    .min(0, "Team building cannot be negative")
    .max(
      defaultMaxValues.integrations,
      `Team building cannot exceed ${defaultMaxValues.integrations} PLN per entry`,
    ),

  // Other expenses (no specific limit)
  inne: z
    .number({ error: "Other must be a number" })
    .min(0, "Other cannot be negative")
    .max(99999, "Other exceeds reasonable limit"),

  // Tools array: empty allowed; filter out entries with no name before validating
  tools: z.preprocess(
    (val) =>
      Array.isArray(val)
        ? val.filter((t: unknown) => {
            const o = t as { name?: string };
            return typeof o?.name === "string" && o.name.trim() !== "";
          })
        : val,
    z.array(toolSchema),
  ),

  // Status (for edit mode) — must match CalculationStatus
  status: z.enum(["saved", "submitted", "declined", "approved"]).optional(),
});

/**
 * Schema for creating a new calculation (without status, before refinements)
 * This allows .omit() to work since it's called before superRefine
 */
const baseCreateCalculationSchema = baseCalculationFormSchema.omit({
  status: true,
});

/**
 * Create validation schema (period-based restrictions for ML/MC; ML no longer depends on employment date)
 */
export function createCalculationFormSchema(_employmentDate?: unknown) {
  return baseCalculationFormSchema.superRefine((data, ctx) => {
    const { month, masterCare, masterLearner } = data;
    const { month: monthNum } = parseMonthString(month);

    if (masterCare > 0 && !isMonthBiMonthlySettlementMonth(monthNum)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["masterCare"],
        message: SETTLEMENT_MONTHS_MESSAGE,
      });
    }

    if (masterLearner > 0 && !isMonthBiMonthlySettlementMonth(monthNum)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["masterLearner"],
        message: SETTLEMENT_MONTHS_MESSAGE,
      });
    }
  });
}

/**
 * Full validation schema for Calculation form with custom refinements
 * Use this for form validation where Master Care period restrictions apply
 * Note: This uses a default schema without employment date context.
 * For accurate Master Learner validation, use createCalculationFormSchema() instead.
 */
export const calculationFormSchema = baseCalculationFormSchema.superRefine(
  (data, ctx) => {
    const { month, masterCare, masterLearner } = data;
    const { month: monthNum } = parseMonthString(month);

    if (masterCare > 0 && !isMonthBiMonthlySettlementMonth(monthNum)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["masterCare"],
        message: SETTLEMENT_MONTHS_MESSAGE,
      });
    }

    if (masterLearner > 0 && !isMonthBiMonthlySettlementMonth(monthNum)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["masterLearner"],
        message: SETTLEMENT_MONTHS_MESSAGE,
      });
    }
  },
);

export type CalculationFormData = z.infer<typeof calculationFormSchema>;

/**
 * Schema for creating a new calculation (without status)
 * Note: This doesn't include the Master Care period refinement
 * The period validation is handled in the form provider via useBudgetValidation
 */
export const createCalculationSchema = baseCreateCalculationSchema;

export type CreateCalculationFormData = z.infer<typeof createCalculationSchema>;

/**
 * Schema for updating an existing calculation (all fields optional except id)
 * Uses base schema to avoid refinements conflict with .partial()
 */
export const updateCalculationSchema = baseCalculationFormSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  });

export type UpdateCalculationFormData = z.infer<typeof updateCalculationSchema>;
