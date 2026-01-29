// Calculation entity types
import { Tool } from "./tools";

export type CalculationStatus = "saved" | "submitted" | "declined" | "approved";

export interface Calculation {
  id: string;
  month: string; // Format: "YYYY-MM" (e.g., "2026-01")
  createdAt: Date;
  updatedAt: Date;
  status: CalculationStatus;
  benefitRulesVersion: string; // Version of benefit rules used for this calculation
  
  // Form values
  masterLearner: number;
  masterCare: number;
  tools: Tool[];
  budzet: number;
  integracje: number;
  inne: number;
  
  // Calculated values (stored for quick access)
  toolsTotal: number;
  reimRazem: number;
  totalSum: number;
  invoiceHeavenString: string;
}

export interface CalculationInput {
  month: string;
  masterLearner: number;
  masterCare: number;
  tools: Tool[];
  budzet: number;
  integracje: number;
  inne: number;
  toolsTotal: number;
  reimRazem: number;
  totalSum: number;
  invoiceHeavenString: string;
  status?: CalculationStatus;
  benefitRulesVersion?: string; // Optional, will use current if not provided
}

export interface EmploymentDate {
  month: number; // 1-12
  year: number;
}

