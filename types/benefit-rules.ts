/**
 * Benefit rules versioning system
 *
 * This ensures that calculations made in the past use the benefit limits
 * that were valid at that time, making the system audit-proof and compliant.
 */

export interface BenefitRules {
  version: string;
  effectiveFrom: string; // ISO date string (YYYY-MM-DD)
  effectiveTo?: string; // ISO date string, undefined means "current"
  description: string;
  limits: {
    masterLearner: {
      /** Fixed 500 PLN per bi-monthly period (no employment-date dependency) */
      biMonthlyLimit: number;
      description: string;
    };
    masterCare: {
      biMonthlyLimit: number;
      description: string;
    };
    integrations: {
      quarterlyLimit: number;
      description: string;
      travelExpensesOnly: boolean;
    };
  };
}

/**
 * Historical benefit rules registry
 * New rules should be added at the top with effectiveFrom date
 * Rules are ordered from newest to oldest for efficient lookup
 */
export const BENEFIT_RULES_REGISTRY: BenefitRules[] = [
  {
    version: "2026-01",
    effectiveFrom: "2026-01-01",
    effectiveTo: undefined, // Current rules
    description: "Initial benefit rules as per 2026 company policy",
    limits: {
      masterLearner: {
        biMonthlyLimit: 500,
        description:
          "500 PLN per bi-monthly period (same method as Master Care; no employment-date dependency)",
      },
      masterCare: {
        biMonthlyLimit: 750,
        description:
          "750 PLN per bi-monthly period (January-February, March-April, etc.)",
      },
      integrations: {
        quarterlyLimit: 1500,
        description:
          "Fixed 1500 PLN per quarter (Q1-Q4), not dependent on employment date. Travel expenses only (accommodation and transport).",
        travelExpensesOnly: true,
      },
    },
  },
];

/**
 * Get the benefit rules that were/are effective on a given date
 * @param date - Date object (should be created with UTC to avoid timezone issues)
 */
export function getBenefitRules(date: Date): BenefitRules {
  // Extract date string in YYYY-MM-DD format
  // Using UTC components ensures consistent date string regardless of timezone
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const targetDateStr = `${year}-${month}-${day}`;

  // Find the most recent rules that were effective on or before the target date
  for (const rules of BENEFIT_RULES_REGISTRY) {
    const effectiveFrom = rules.effectiveFrom;
    const effectiveTo = rules.effectiveTo;

    const isAfterStart = targetDateStr >= effectiveFrom;
    const isBeforeEnd = !effectiveTo || targetDateStr <= effectiveTo;

    if (isAfterStart && isBeforeEnd) {
      return rules;
    }
  }

  // Fallback to the newest (first) rules if nothing matches (shouldn't happen)
  // This ensures we always return current rules rather than outdated ones
  return BENEFIT_RULES_REGISTRY[0];
}

/**
 * Get the current benefit rules
 */
export function getCurrentBenefitRules(): BenefitRules {
  return getBenefitRules(new Date());
}

/**
 * Get benefit rules by version
 */
export function getBenefitRulesByVersion(
  version: string,
): BenefitRules | undefined {
  return BENEFIT_RULES_REGISTRY.find((rules) => rules.version === version);
}
