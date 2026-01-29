"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCalculationFormSchema,
  type CalculationFormData,
} from "@/schemas/calculation-schema";
import { Tool } from "@/types/tools";
import { addMoney, multiplyMoney } from "@/utils/money";
import { useBudgetValidation } from "@/hooks/useBudgetValidation";
import { useInvoiceString } from "@/hooks/useInvoiceString";
import { useAppState } from "@/providers/app-state-provider";
import { getCurrentMonthString } from "@/utils/periods";
import { DraftToolsService } from "@/lib/db";

function createEmptyTool(): Tool {
  return {
    id: crypto.randomUUID(),
    name: "",
    amount: 0,
    currency: "PLN",
    exchangeRate: 1,
  };
}

// Form context interface
interface CalculationFormContext {
  // Tools management
  tools: Tool[];
  setTools: (tools: Tool[]) => void;
  toolsTotal: number;

  // Computed values
  reimRazem: number;
  totalSum: number;
  invoiceHeavenString: string;

  // Budget validation
  budgetValidation: ReturnType<typeof useBudgetValidation> | null;

  // Actions
  resetForm: () => void;
  loadClonedData: (calculationId: string) => Promise<void>;
}

const CalculationFormContext = createContext<CalculationFormContext | null>(
  null,
);

// Provider props
interface CalculationFormProviderProps {
  children: ReactNode;
  defaultValues?: Partial<CalculationFormData>;
  editingCalculationId?: string;
}

export function CalculationFormProvider({
  children,
  defaultValues,
  editingCalculationId,
}: CalculationFormProviderProps) {
  const { calculations } = useAppState();
  const [tools, setTools] = useState<Tool[]>(() =>
    editingCalculationId ? [] : [createEmptyTool()],
  );

  // Load draft tools from IndexedDB when in create mode (not editing)
  useEffect(() => {
    if (editingCalculationId || typeof window === "undefined") return;
    DraftToolsService.get()
      .then((stored) => {
        if (stored.length > 0) setTools(stored);
      })
      .catch(() => {});
  }, [editingCalculationId]);

  // Persist draft tools to IndexedDB when in create mode (not editing)
  useEffect(() => {
    if (editingCalculationId || typeof window === "undefined") return;
    DraftToolsService.save(tools).catch(() => {});
  }, [editingCalculationId, tools]);

  // Schema: period-based validation for ML/MC (no employment-date dependency)
  const schema = useMemo(() => createCalculationFormSchema(), []);

  // Initialize form with React Hook Form + Zod
  const form = useForm<CalculationFormData>({
    resolver: zodResolver(schema),
    mode: "onChange", // Real-time validation
    defaultValues: {
      month: defaultValues?.month || getCurrentMonthString(),
      masterLearner: defaultValues?.masterLearner || 0,
      masterCare: defaultValues?.masterCare || 0,
      integracje: defaultValues?.integracje || 0,
      inne: defaultValues?.inne || 0,
      tools: defaultValues?.tools || [],
      status: defaultValues?.status,
    },
  });

  // Watch form values for computed calculations
  const watchedValues = form.watch();
  const selectedMonth = watchedValues.month;

  // Sync tools state with form state
  useEffect(() => {
    form.setValue("tools", tools, { shouldValidate: true });
  }, [tools, form]);

  // Calculate tools total
  const toolsTotal = useMemo(() => {
    const toolAmounts = tools.map((tool) =>
      multiplyMoney(Number(tool.amount) || 0, Number(tool.exchangeRate) || 1),
    );
    return addMoney(...toolAmounts);
  }, [tools]);

  // Calculate REIM.RAZEM (tools + integrations + other; budget category removed)
  const reimRazem = useMemo(() => {
    const integracje = Number(watchedValues.integracje) || 0;
    const inne = Number(watchedValues.inne) || 0;
    return addMoney(toolsTotal, integracje, inne);
  }, [toolsTotal, watchedValues.integracje, watchedValues.inne]);

  // Calculate total sum (ML + MC + REIM.RAZEM)
  const totalSum = useMemo(() => {
    const masterLearner = Number(watchedValues.masterLearner) || 0;
    const masterCare = Number(watchedValues.masterCare) || 0;
    return addMoney(masterLearner, masterCare, reimRazem);
  }, [watchedValues.masterLearner, watchedValues.masterCare, reimRazem]);

  // Generate InvoiceHeaven string using template hook
  const invoiceHeavenString = useInvoiceString({
    masterLearner: Number(watchedValues.masterLearner) || 0,
    masterCare: Number(watchedValues.masterCare) || 0,
    toolsTotal,
    integracje: Number(watchedValues.integracje) || 0,
    inne: Number(watchedValues.inne) || 0,
    reimRazem,
  });

  // Budget validation (for accumulated limits) — memoize values to avoid defeating useBudgetValidation's internal memo
  const budgetValidationValues = useMemo(
    () => ({
      masterLearner: watchedValues.masterLearner || 0,
      masterCare: watchedValues.masterCare || 0,
      integracje: watchedValues.integracje || 0,
    }),
    [
      watchedValues.masterLearner,
      watchedValues.masterCare,
      watchedValues.integracje,
    ],
  );
  const budgetValidation = useBudgetValidation(
    selectedMonth,
    null, // ML no longer depends on employment date (500 PLN per bi-monthly period)
    calculations,
    budgetValidationValues,
    editingCalculationId,
  );

  // Reset form to default values
  const resetForm = useCallback(() => {
    form.reset({
      month: getCurrentMonthString(),
      masterLearner: 0,
      masterCare: 0,
      integracje: 0,
      inne: 0,
      tools: [],
    });
    setTools([]);
  }, [form]);

  // Load cloned calculation data
  const loadClonedData = useCallback(
    async (calculationId: string) => {
      try {
        // TODO importing inline is prohibited!
        const { CalculationService } = await import("@/lib/db");
        const calc = await CalculationService.getById(calculationId);

        if (!calc) {
          throw new Error("Calculation not found");
        }

        // Pre-fill form with cloned data
        form.reset({
          month: getCurrentMonthString(), // Keep current month
          masterLearner: calc.masterLearner,
          masterCare: calc.masterCare,
          integracje: calc.integracje,
          inne: calc.inne,
          tools: [],
        });

        // Set tools state (convert numbers to strings for form inputs)
        const toolsForForm = calc.tools.map((tool) => ({
          id: tool.id,
          name: tool.name,
          amount: Number(tool.amount),
          currency: tool.currency,
          exchangeRate: Number(tool.exchangeRate),
        }));
        setTools(toolsForForm);
      } catch (error) {
        console.error("Failed to load calculation for cloning:", error);
        throw error;
      }
    },
    [form],
  );

  // Context value
  const value: CalculationFormContext = {
    tools,
    setTools,
    toolsTotal,
    reimRazem,
    totalSum,
    invoiceHeavenString,
    budgetValidation,
    resetForm,
    loadClonedData,
  };

  return (
    <CalculationFormContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </CalculationFormContext.Provider>
  );
}

// Hook to use calculation form context
export function useCalculationForm() {
  const context = useContext(CalculationFormContext);
  if (!context) {
    throw new Error(
      "useCalculationForm must be used within CalculationFormProvider",
    );
  }
  return context;
}
