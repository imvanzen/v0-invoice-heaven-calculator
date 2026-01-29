import { useMemo } from "react";
import { formatMoney } from "@/utils/money";

interface InvoiceStringParams {
  masterLearner: number;
  masterCare: number;
  toolsTotal: number;
  integracje: number;
  inne: number;
  reimRazem: number;
}

/**
 * Template for Invoice Heaven string format
 * Format: ML;{ml};MC;{mc};REIM.RAZEM;{razem};narzędzia;{tools};integracje;{integracje};inne;{inne}
 * (Budget category removed per product feedback; accommodation/travel under Integracje)
 */
const INVOICE_TEMPLATE = {
  separator: ";",
  fields: [
    {
      key: "ML",
      getValue: (p: InvoiceStringParams) => formatMoney(p.masterLearner),
    },
    {
      key: "MC",
      getValue: (p: InvoiceStringParams) => formatMoney(p.masterCare),
    },
    {
      key: "REIM.RAZEM",
      getValue: (p: InvoiceStringParams) => formatMoney(p.reimRazem),
    },
    {
      key: "narzędzia",
      getValue: (p: InvoiceStringParams) => formatMoney(p.toolsTotal),
    },
    {
      key: "integracje",
      getValue: (p: InvoiceStringParams) => formatMoney(p.integracje),
    },
    { key: "inne", getValue: (p: InvoiceStringParams) => formatMoney(p.inne) },
  ],
} as const;

/**
 * Generates Invoice Heaven formatted string from calculation data
 *
 * Format: key1;value1;key2;value2;...
 * Example: ML;3000;MC;750;REIM.RAZEM;1500.00;narzędzia;500.00;budżet na dojazdy i noclegi;500;integracje;500;inne;0
 *
 * @param params - Calculation values to format
 * @returns Formatted invoice string
 */
export function generateInvoiceString(params: InvoiceStringParams): string {
  const { separator, fields } = INVOICE_TEMPLATE;

  return fields
    .map((field) => `${field.key}${separator}${field.getValue(params)}`)
    .join(separator);
}

/**
 * Hook to generate Invoice Heaven string from calculation values
 * Memoized to prevent unnecessary recalculations
 *
 * @param params - Calculation values
 * @returns Invoice Heaven formatted string
 */
export function useInvoiceString(params: InvoiceStringParams): string {
  return useMemo(
    () => generateInvoiceString(params),
    [
      params.masterLearner,
      params.masterCare,
      params.toolsTotal,
      params.integracje,
      params.inne,
      params.reimRazem,
    ],
  );
}

/**
 * Parse Invoice Heaven string back to object (useful for imports/debugging)
 *
 * @param invoiceString - Invoice Heaven formatted string
 * @returns Parsed object with calculation values
 */
export function parseInvoiceString(
  invoiceString: string,
): Partial<InvoiceStringParams> {
  const parts = invoiceString.split(INVOICE_TEMPLATE.separator);
  const result: any = {};

  for (let i = 0; i < parts.length; i += 2) {
    const key = parts[i];
    const value = parts[i + 1];

    switch (key) {
      case "ML":
        result.masterLearner = Number(value);
        break;
      case "MC":
        result.masterCare = Number(value);
        break;
      case "REIM.RAZEM":
        result.reimRazem = Number(value);
        break;
      case "narzędzia":
        result.toolsTotal = Number(value);
        break;
      case "integracje":
        result.integracje = Number(value);
        break;
      case "inne":
        result.inne = Number(value);
        break;
    }
  }

  return result;
}
