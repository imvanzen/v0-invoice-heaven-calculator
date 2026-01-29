"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useOptimistic,
  useTransition,
  type ReactNode,
} from "react";
import { CalculationService, SettingsService } from "@/lib/db";
import type {
  Calculation,
  CalculationInput,
  EmploymentDate,
} from "@/types/calculation";
import { getCurrentBenefitRules } from "@/types/benefit-rules";

// Result type for actions
interface ActionResult {
  success: boolean;
  error?: string;
}

// App state interface
interface AppState {
  // Employment Date
  employmentDate: EmploymentDate | null;
  setEmploymentDate: (date: EmploymentDate | null) => Promise<ActionResult>;
  isEmploymentDateLoading: boolean;

  // Calculations
  calculations: Calculation[];
  isCalculationsLoading: boolean;
  refreshCalculations: () => Promise<void>;

  // CRUD Actions
  createCalculation: (data: CalculationInput) => Promise<ActionResult>;
  updateCalculation: (
    id: string,
    data: Partial<CalculationInput>,
  ) => Promise<ActionResult>;
  deleteCalculation: (id: string) => Promise<ActionResult>;
}

// Create context
const AppStateContext = createContext<AppState | null>(null);

// Provider props
interface AppStateProviderProps {
  children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  // Employment Date State
  const [employmentDate, setEmploymentDateState] =
    useState<EmploymentDate | null>(null);
  const [isEmploymentDateLoading, setIsEmploymentDateLoading] = useState(true);

  // Calculations State
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isCalculationsLoading, setIsCalculationsLoading] = useState(true);

  // Optimistic calculations state
  const [optimisticCalculations, setOptimisticCalculations] = useOptimistic(
    calculations,
    (state, optimisticValue: Calculation[]) => optimisticValue,
  );

  // Load employment date on mount
  useEffect(() => {
    async function loadEmploymentDate() {
      try {
        const settings = await SettingsService.get();
        if (settings?.employmentDate) {
          setEmploymentDateState(settings.employmentDate);
        } else {
          setEmploymentDateState(null);
        }
      } catch (error) {
        console.error("Failed to load employment date:", error);
      } finally {
        setIsEmploymentDateLoading(false);
      }
    }

    loadEmploymentDate();
  }, []);

  // Refresh employment date when it changes outside context (e.g. after import)
  useEffect(() => {
    const handler = () => {
      SettingsService.get().then((settings) => {
        setEmploymentDateState(settings?.employmentDate ?? null);
      });
    };
    window.addEventListener("employmentDateChanged", handler);
    return () => window.removeEventListener("employmentDateChanged", handler);
  }, []);

  // Transition for optimistic state updates
  const [, startTransition] = useTransition();

  // Load calculations on mount
  useEffect(() => {
    loadCalculations();
  }, []);

  // Sync optimistic state with actual state
  useEffect(() => {
    startTransition(() => {
      setOptimisticCalculations(calculations);
    });
  }, [calculations, setOptimisticCalculations]);

  // Load calculations helper
  const loadCalculations = async () => {
    try {
      setIsCalculationsLoading(true);
      const data = await CalculationService.getAllSorted();
      setCalculations(data);
    } catch (error) {
      console.error("Failed to load calculations:", error);
    } finally {
      setIsCalculationsLoading(false);
    }
  };

  // Set employment date action
  const setEmploymentDate = useCallback(
    async (date: EmploymentDate | null): Promise<ActionResult> => {
      try {
        await SettingsService.save({ employmentDate: date });
        setEmploymentDateState(date);

        // Dispatch custom event for backward compatibility
        // (will be removed once all components use context)
        window.dispatchEvent(new Event("employmentDateChanged"));

        return { success: true };
      } catch (error) {
        console.error("Failed to set employment date:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to set employment date",
        };
      }
    },
    [],
  );

  // Refresh calculations action
  const refreshCalculations = useCallback(async () => {
    await loadCalculations();
  }, []);

  // Create calculation action with optimistic update
  const createCalculation = useCallback(
    async (data: CalculationInput): Promise<ActionResult> => {
      // Create optimistic calculation
      const tempId = crypto.randomUUID();
      const benefitRulesVersion =
        data.benefitRulesVersion || getCurrentBenefitRules().version;
      const optimisticCalculation: Calculation = {
        id: tempId,
        month: data.month,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: data.status || "saved",
        benefitRulesVersion,
        masterLearner: data.masterLearner,
        masterCare: data.masterCare,
        tools: data.tools,
        integracje: data.integracje,
        inne: data.inne,
        toolsTotal: data.toolsTotal,
        reimRazem: data.reimRazem,
        totalSum: data.totalSum,
        invoiceHeavenString: data.invoiceHeavenString,
      };

      // Apply optimistic update - insert in correct sorted position (newest first)
      const optimisticUpdate = [...calculations, optimisticCalculation].sort(
        (a, b) => b.month.localeCompare(a.month),
      );
      startTransition(() => {
        setOptimisticCalculations(optimisticUpdate);
      });

      try {
        await CalculationService.create(data);
        // Refresh to get accurate data from DB (with correct ID and timestamps)
        await refreshCalculations();
        return { success: true };
      } catch (error) {
        // useOptimistic will automatically revert to the original state
        console.error("Failed to create calculation:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create calculation",
        };
      }
    },
    [
      calculations,
      refreshCalculations,
      setOptimisticCalculations,
      startTransition,
    ],
  );

  // Update calculation action with optimistic update
  const updateCalculation = useCallback(
    async (
      id: string,
      data: Partial<CalculationInput>,
    ): Promise<ActionResult> => {
      // Apply optimistic update
      const optimisticUpdate = calculations.map((calc) =>
        calc.id === id ? { ...calc, ...data, updatedAt: new Date() } : calc,
      );
      startTransition(() => {
        setOptimisticCalculations(optimisticUpdate);
      });

      try {
        await CalculationService.update(id, data);
        // Refresh to get accurate data from DB
        await refreshCalculations();
        return { success: true };
      } catch (error) {
        // useOptimistic will automatically revert to the original state
        console.error("Failed to update calculation:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update calculation",
        };
      }
    },
    [
      calculations,
      refreshCalculations,
      setOptimisticCalculations,
      startTransition,
    ],
  );

  // Delete calculation action with optimistic update
  const deleteCalculation = useCallback(
    async (id: string): Promise<ActionResult> => {
      // Apply optimistic delete
      const optimisticUpdate = calculations.filter((calc) => calc.id !== id);
      startTransition(() => {
        setOptimisticCalculations(optimisticUpdate);
      });

      try {
        await CalculationService.delete(id);
        // Refresh to sync with DB
        await refreshCalculations();
        return { success: true };
      } catch (error) {
        // useOptimistic will automatically revert to the original state
        console.error("Failed to delete calculation:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete calculation",
        };
      }
    },
    [
      calculations,
      refreshCalculations,
      setOptimisticCalculations,
      startTransition,
    ],
  );

  // Context value
  const value: AppState = {
    employmentDate,
    setEmploymentDate,
    isEmploymentDateLoading,
    calculations: optimisticCalculations,
    isCalculationsLoading,
    refreshCalculations,
    createCalculation,
    updateCalculation,
    deleteCalculation,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

// Hook to use app state
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
