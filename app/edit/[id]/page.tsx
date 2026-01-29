"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppState } from "@/providers/app-state-provider";
import {
  CalculationFormProvider,
  useCalculationForm,
} from "@/providers/calculation-form-provider";
import { CalculationForm } from "@/components/calculation-form";
import { FormPageLayout } from "@/components/form-page-layout";
import { CancelEditDialog } from "@/components/cancel-edit-dialog";
import { LoadingState } from "@/components/ui/loading-state";
import { CalculationService } from "@/lib/db";
import { Calculation } from "@/types/calculation";
import { formatMonth } from "@/utils/periods";
import { addMoney, multiplyMoney } from "@/utils/money";
import { generateInvoiceString } from "@/hooks/useInvoiceString";
import type { CalculationFormData } from "@/schemas/calculation-schema";
import { useFormContext } from "react-hook-form";

function EditCalculationForm() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { updateCalculation } = useAppState();

  const [loading, setLoading] = useState(true);
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const hasLoadedRef = useRef(false);

  const { setTools } = useCalculationForm();
  const form = useFormContext<CalculationFormData>();
  const formRef = useRef(form);
  formRef.current = form;

  // Load calculation
  useEffect(() => {
    if (!id || hasLoadedRef.current) return;

    async function loadCalc() {
      try {
        const calc = await CalculationService.getById(id);
        if (!calc) {
          alert("Calculation not found");
          router.push("/");
          return;
        }

        setCalculation(calc);

        // Convert tools to ensure amount and exchangeRate are numbers
        const toolsForForm = calc.tools.map((tool) => ({
          id: tool.id,
          name: tool.name,
          amount: Number(tool.amount) || 0,
          currency: tool.currency,
          exchangeRate: Number(tool.exchangeRate) || 1,
        }));

        // Reset form with calculation data
        formRef.current.reset(
          {
            month: calc.month,
            masterLearner: calc.masterLearner,
            masterCare: calc.masterCare,
            integracje: calc.integracje,
            inne: calc.inne,
            tools: toolsForForm,
          },
          {
            keepDefaultValues: false,
            keepValues: false,
          },
        );
        setTools(toolsForForm);
        hasLoadedRef.current = true;
      } catch (error) {
        console.error("Failed to load calculation:", error);
        alert("Failed to load calculation");
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadCalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (data: CalculationFormData) => {
    if (!calculation) {
      console.error("No calculation loaded");
      return;
    }

    setSaving(true);
    try {
      const filteredTools = data.tools;
      const toolsTotalFiltered = addMoney(
        ...filteredTools.map((t) =>
          multiplyMoney(Number(t.amount) || 0, Number(t.exchangeRate) || 1),
        ),
      );
      const integracje = Number(data.integracje) || 0;
      const inne = Number(data.inne) || 0;
      const reimRazemFiltered = addMoney(toolsTotalFiltered, integracje, inne);
      const masterLearner = Number(data.masterLearner) || 0;
      const masterCare = Number(data.masterCare) || 0;
      const totalSumFiltered = addMoney(
        masterLearner,
        masterCare,
        reimRazemFiltered,
      );

      const result = await updateCalculation(id, {
        masterLearner,
        masterCare,
        tools: filteredTools,
        integracje,
        inne,
        toolsTotal: toolsTotalFiltered,
        reimRazem: reimRazemFiltered,
        totalSum: totalSumFiltered,
        invoiceHeavenString: generateInvoiceString({
          masterLearner,
          masterCare,
          toolsTotal: toolsTotalFiltered,
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

  const handleCancelConfirm = () => {
    router.push("/");
  };

  if (loading) {
    return <LoadingState message="Loading calculation..." fullPage />;
  }

  if (!calculation) {
    return null;
  }

  return (
    <>
      <FormPageLayout
        title="Edit Calculation"
        description={`Editing calculation for ${formatMonth(
          calculation.month,
        )}`}
      >
        <CalculationForm
          mode="edit"
          onSubmit={onSubmit}
          saving={saving}
          lockedMonth={formatMonth(calculation.month)}
          onCancel={() => setShowCancelDialog(true)}
        />
      </FormPageLayout>

      <CancelEditDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}

function EditCalculationContent() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <CalculationFormProvider editingCalculationId={id}>
      <EditCalculationForm />
    </CalculationFormProvider>
  );
}

export default function EditCalculation() {
  return <EditCalculationContent />;
}
