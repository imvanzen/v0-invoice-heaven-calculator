import { Calculation } from "@/types/calculation";
import { ExportData } from "./export";

export interface ImportValidationResult {
  isValid: boolean;
  error?: string;
  data?: ExportData;
  preview?: {
    count: number;
    dateRange: { start: string; end: string } | null;
    statusSummary: Record<string, number>;
    hasSettings: boolean;
    settingsPreview?: {
      employmentDate: string | null;
      theme: string;
    };
  };
}

/** Raw calculation shape from JSON (dates are strings). budzet optional for backward compat with old exports. */
interface RawCalculation {
  id: string;
  month: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  benefitRulesVersion?: string;
  masterLearner: number;
  masterCare: number;
  tools: unknown[];
  budzet?: number;
  integracje: number;
  inne: number;
  toolsTotal: number;
  reimRazem: number;
  totalSum: number;
  invoiceHeavenString: string;
}

function reviveDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
}

/**
 * Normalize parsed import data: revive Date fields and coerce types so
 * processImportCalculations and IndexedDB receive proper Calculation[].
 */
export function normalizeImportCalculations(raw: unknown[]): Calculation[] {
  return raw.map((item) => {
    const calc = item as RawCalculation;
    const { budzet: _dropped, ...rest } = calc;
    return {
      ...rest,
      createdAt: reviveDate(calc.createdAt),
      updatedAt: reviveDate(calc.updatedAt),
      status: (
        ["saved", "submitted", "declined", "approved"] as const
      ).includes(calc.status as "saved" | "submitted" | "declined" | "approved")
        ? (calc.status as Calculation["status"])
        : "saved",
      benefitRulesVersion: calc.benefitRulesVersion ?? "1.0",
      tools: Array.isArray(calc.tools) ? calc.tools : [],
    } as Calculation;
  });
}

export function validateImportFile(
  fileContent: string,
): ImportValidationResult {
  try {
    const parsed = JSON.parse(fileContent) as ExportData & {
      calculations?: unknown[];
    };

    // Validate structure
    if (
      !parsed.version ||
      !parsed.calculations ||
      !Array.isArray(parsed.calculations)
    ) {
      return {
        isValid: false,
        error: "Invalid file format. Missing required fields.",
      };
    }

    // Allow empty calculations (e.g. settings-only backup)
    const rawCalculations = parsed.calculations;

    // Validate each calculation has required fields
    for (const calc of rawCalculations) {
      if (
        !calc.id ||
        !calc.month ||
        calc.masterLearner === undefined ||
        calc.masterCare === undefined ||
        !calc.tools ||
        !Array.isArray(calc.tools)
      ) {
        return {
          isValid: false,
          error: "Invalid calculation data structure in file.",
        };
      }
    }

    const calculations = normalizeImportCalculations(rawCalculations);

    const data: ExportData = {
      ...parsed,
      calculations,
      calculationsCount: calculations.length,
    };

    const sortedCalcs = [...calculations].sort((a, b) =>
      a.month.localeCompare(b.month),
    );
    const statusSummary: Record<string, number> = {};
    calculations.forEach((calc) => {
      statusSummary[calc.status] = (statusSummary[calc.status] || 0) + 1;
    });

    const hasSettings = !!parsed.settings;
    const settingsPreview = parsed.settings
      ? {
          employmentDate: parsed.settings.employmentDate
            ? `${parsed.settings.employmentDate.year}-${String(
                parsed.settings.employmentDate.month,
              ).padStart(2, "0")}`
            : null,
          theme: parsed.settings.theme,
        }
      : undefined;

    const dateRange =
      sortedCalcs.length > 0
        ? {
            start: sortedCalcs[0].month,
            end: sortedCalcs[sortedCalcs.length - 1].month,
          }
        : null;

    return {
      isValid: true,
      data,
      preview: {
        count: calculations.length,
        dateRange,
        statusSummary,
        hasSettings,
        settingsPreview,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to parse file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export type ImportStrategy = "merge" | "replace" | "skip-duplicates";

export function processImportCalculations(
  importedCalculations: Calculation[],
  existingCalculations: Calculation[],
  strategy: ImportStrategy,
): Calculation[] {
  const existingMonths = new Set(existingCalculations.map((c) => c.month));
  const existingIds = new Set(existingCalculations.map((c) => c.id));

  switch (strategy) {
    case "replace":
      return importedCalculations;

    case "merge":
      // Add all imported calculations, generate new IDs for duplicates
      return importedCalculations.map((calc) => {
        if (existingIds.has(calc.id)) {
          return {
            ...calc,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
        return calc;
      });

    case "skip-duplicates":
      // Only import calculations with months that don't exist
      return importedCalculations.filter(
        (calc) => !existingMonths.has(calc.month),
      );

    default:
      return importedCalculations;
  }
}
