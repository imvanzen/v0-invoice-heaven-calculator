// Period calculation utilities for benefit limits

export type BiMonthlyPeriod =
  | "Jan-Feb"
  | "Mar-Apr"
  | "May-Jun"
  | "Jul-Aug"
  | "Sep-Oct"
  | "Nov-Dec";

export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

// Get bi-monthly period for a given month (1-12)
export function getBiMonthlyPeriod(month: number): BiMonthlyPeriod {
  if (month >= 1 && month <= 2) return "Jan-Feb";
  if (month >= 3 && month <= 4) return "Mar-Apr";
  if (month >= 5 && month <= 6) return "May-Jun";
  if (month >= 7 && month <= 8) return "Jul-Aug";
  if (month >= 9 && month <= 10) return "Sep-Oct";
  return "Nov-Dec";
}

// Get settlement month for a bi-monthly period (2, 4, 6, 8, 10, 12)
export function getBiMonthlySettlementMonth(period: BiMonthlyPeriod): number {
  switch (period) {
    case "Jan-Feb":
      return 2;
    case "Mar-Apr":
      return 4;
    case "May-Jun":
      return 6;
    case "Jul-Aug":
      return 8;
    case "Sep-Oct":
      return 10;
    case "Nov-Dec":
      return 12;
  }
}

// Check if a month is the settlement month for its bi-monthly period
export function isMonthBiMonthlySettlementMonth(month: number): boolean {
  const period = getBiMonthlyPeriod(month);
  const settlementMonth = getBiMonthlySettlementMonth(period);
  return month === settlementMonth;
}

// Get quarter for a given month (1-12)
export function getQuarter(month: number): Quarter {
  if (month >= 1 && month <= 3) return "Q1";
  if (month >= 4 && month <= 6) return "Q2";
  if (month >= 7 && month <= 9) return "Q3";
  return "Q4";
}

// Get months in a quarter
export function getMonthsInQuarter(quarter: Quarter): number[] {
  switch (quarter) {
    case "Q1":
      return [1, 2, 3];
    case "Q2":
      return [4, 5, 6];
    case "Q3":
      return [7, 8, 9];
    case "Q4":
      return [10, 11, 12];
  }
}

// Check if a month is in a specific quarter
export function isMonthInQuarter(month: number, quarter: Quarter): boolean {
  return getMonthsInQuarter(quarter).includes(month);
}

// Parse month string "YYYY-MM" to year and month number
export function parseMonthString(monthString: string): {
  year: number;
  month: number;
} {
  const [yearStr, monthStr] = monthString.split("-");
  return {
    year: parseInt(yearStr, 10),
    month: parseInt(monthStr, 10),
  };
}

// Format month for display (e.g., "January 2026")
export function formatMonth(monthString: string): string;
export function formatMonth(year: number, month: number): string;
export function formatMonth(
  yearOrString: string | number,
  month?: number
): string {
  let year: number;
  let monthNum: number;

  if (typeof yearOrString === "string") {
    const parsed = parseMonthString(yearOrString);
    year = parsed.year;
    monthNum = parsed.month;
  } else {
    year = yearOrString;
    monthNum = month!;
  }

  const date = new Date(year, monthNum - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Create month string from year and month numbers
export function createMonthString(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

// Get current month string "YYYY-MM"
export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Get month string for a specific date
export function getMonthString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Get bi-monthly period description
export function getBiMonthlyPeriodDescription(
  month: number,
  year: number
): string {
  const period = getBiMonthlyPeriod(month);
  return `${period} ${year}`;
}

// Get quarter description
export function getQuarterDescription(month: number, year: number): string {
  const quarter = getQuarter(month);
  const monthsInQuarter = getMonthsInQuarter(quarter);
  const startMonth = new Date(
    year,
    monthsInQuarter[0] - 1,
    1
  ).toLocaleDateString("en-US", { month: "short" });
  const endMonth = new Date(
    year,
    monthsInQuarter[monthsInQuarter.length - 1] - 1,
    1
  ).toLocaleDateString("en-US", { month: "short" });
  return `${quarter}: ${startMonth}-${endMonth} ${year}`;
}
