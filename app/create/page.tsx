"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/providers/app-state-provider";
import {
  CalculationFormProvider,
  useCalculationForm,
} from "@/providers/calculation-form-provider";
import { CalculationForm } from "@/components/calculation-form";
import { FormPageLayout } from "@/components/form-page-layout";
import { EmploymentDateGuard } from "@/components/employment-date-guard";
import { LoadingState } from "@/components/ui/loading-state";
import { CalculationService } from "@/lib/db";
import { formatMonth } from "@/utils/periods";
import { addMoney, multiplyMoney } from "@/utils/money";
import { generateInvoiceString } from "@/hooks/useInvoiceString";
import type { CalculationFormData } from "@/schemas/calculation-schema";
import { useFormContext } from "react-hook-form";

function CreateCalculationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams?.get("clone");
  const { employmentDate, isEmploymentDateLoading, createCalculation } =
    useAppState();

  const { setTools, loadClonedData } = useCalculationForm();

  const form = useFormContext<CalculationFormData>();

  const [saving, setSaving] = useState(false);
  const [monthError, setMonthError] = useState<string>("");

  // Load cloned calculation if cloneId is provided
  useEffect(() => {
    if (!cloneId) return;

    async function loadClone() {
      try {
        await loadClonedData(cloneId || "");
      } catch (error) {
        console.error("Failed to load calculation for cloning:", error);
        alert("Failed to load calculation for cloning");
      }
    }

    loadClone();
  }, [cloneId, loadClonedData]);

  // Validate month uniqueness
  const selectedMonth = form.watch("month");
  useEffect(() => {
    async function checkMonth() {
      if (!selectedMonth) return;

      const exists = await CalculationService.existsForMonth(selectedMonth);
      if (exists) {
        setMonthError(
          `A calculation already exists for ${formatMonth(
            selectedMonth,
          )}. Please edit the existing calculation or select a different month.`,
        );
      } else {
        setMonthError("");
      }
    }

    checkMonth();
  }, [selectedMonth]);

  const onSubmit = async (data: CalculationFormData) => {
    setSaving(true);
    try {
      const filteredTools = data.tools;
      const toolsTotalFiltered = addMoney(
        ...filteredTools.map((t) =>
          multiplyMoney(Number(t.amount) || 0, Number(t.exchangeRate) || 1),
        ),
      );
      const budzet = Number(data.budzet) || 0;
      const integracje = Number(data.integracje) || 0;
      const inne = Number(data.inne) || 0;
      const reimRazemFiltered = addMoney(
        toolsTotalFiltered,
        budzet,
        integracje,
        inne,
      );
      const masterLearner = Number(data.masterLearner) || 0;
      const masterCare = Number(data.masterCare) || 0;
      const totalSumFiltered = addMoney(
        masterLearner,
        masterCare,
        reimRazemFiltered,
      );

      const result = await createCalculation({
        month: data.month,
        masterLearner,
        masterCare,
        tools: filteredTools,
        budzet,
        integracje,
        inne,
        toolsTotal: toolsTotalFiltered,
        reimRazem: reimRazemFiltered,
        totalSum: totalSumFiltered,
        invoiceHeavenString: generateInvoiceString({
          masterLearner,
          masterCare,
          toolsTotal: toolsTotalFiltered,
          budzet,
          integracje,
          inne,
          reimRazem: reimRazemFiltered,
        }),
      });

      if (result.success) {
        router.push("/");
      } else {
        alert(result.error || "Failed to save calculation. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save calculation:", error);
      alert("Failed to save calculation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = useCallback(() => {
    form.reset();
    setTools([]);
    setMonthError("");
  }, [form, setTools]);

  return (
    <EmploymentDateGuard
      isLoading={isEmploymentDateLoading}
      hasEmploymentDate={!!employmentDate}
    >
      <FormPageLayout
        title={cloneId ? "Clone Calculation" : "New Calculation"}
        description={
          cloneId
            ? `Creating a copy for ${formatMonth(selectedMonth)}`
            : `Enter your reimbursements for ${formatMonth(selectedMonth)}`
        }
      >
        <CalculationForm
          mode="create"
          onSubmit={onSubmit}
          saving={saving}
          monthError={monthError}
          onCancel={handleCancel}
        />
      </FormPageLayout>
    </EmploymentDateGuard>
  );
}

function CreateCalculationContent() {
  return (
    <CalculationFormProvider>
      <CreateCalculationForm />
    </CalculationFormProvider>
  );
}

export default function CreateCalculation() {
  return (
    <Suspense fallback={<LoadingState withCard />}>
      <CreateCalculationContent />
    </Suspense>
  );
}
