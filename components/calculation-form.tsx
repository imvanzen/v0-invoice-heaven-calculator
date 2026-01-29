"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ToolsSection } from "@/components/tools-section";
import { MonthYearSelect } from "@/components/month-year-select";
import { MasterLearnerField } from "@/components/form-fields/master-learner-field";
import { MasterCareField } from "@/components/form-fields/master-care-field";
import { BudgetField } from "@/components/form-fields/budget-field";
import { IntegrationField } from "@/components/form-fields/integracje-field";
import { OtherField } from "@/components/form-fields/other-field";
import { CalculationResultDialog } from "@/components/calculation-result-dialog";
import { useCalculationForm } from "@/providers/calculation-form-provider";
import type { CalculationFormData } from "@/schemas/calculation-schema";
import { useFormContext } from "react-hook-form";

interface CalculationFormProps {
  mode: "create" | "edit";
  onSubmit: (data: CalculationFormData) => Promise<void>;
  saving: boolean;
  monthError?: string;
  lockedMonth?: string; // For edit mode - month cannot be changed
  onCancel?: () => void;
}

export function CalculationForm({
  mode,
  onSubmit,
  saving,
  monthError,
  lockedMonth,
  onCancel,
}: CalculationFormProps) {
  const { tools, setTools, totalSum, invoiceHeavenString, budgetValidation } =
    useCalculationForm();
  const form = useFormContext<CalculationFormData>();

  const [showDialog, setShowDialog] = useState(false);

  const handleCalculate = useCallback(() => {
    // Zod validation will prevent submission if there are errors
    // Just check if form is valid before showing dialog
    form
      .trigger()
      .then((isValid) => {
        if (isValid) {
          setShowDialog(true);
        } else {
          // FormMessage components should show errors
          // Scroll to first error if needed
          const firstErrorField = Object.keys(form.formState.errors)[0];
          if (firstErrorField) {
            const element = document.querySelector(
              `[name="${firstErrorField}"]`,
            ) as HTMLElement;
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
            element?.focus();
          }
        }
      })
      .catch((error) => {
        console.error("Error during form validation:", error);
      });
  }, [form]);

  const handleSubmit = async (data: CalculationFormData) => {
    // Check budget validation before submitting
    if (budgetValidation && !budgetValidation.isValid) {
      const errors: string[] = [];
      if (!budgetValidation.masterLearner.isValid) {
        errors.push(budgetValidation.masterLearner.error || "Limit exceeded.");
      }
      if (!budgetValidation.masterCare.isValid) {
        errors.push(budgetValidation.masterCare.error || "Limit exceeded.");
      }
      if (!budgetValidation.integracje.isValid) {
        errors.push(budgetValidation.integracje.error || "Limit exceeded.");
      }
      alert("Cannot save: " + errors.join("\n"));
      return;
    }

    await onSubmit(data);
  };

  const isSubmitDisabled = mode === "create" && !!monthError;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Month Selection */}
          {mode === "create" ? (
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <MonthYearSelect
                    value={field.value}
                    onChange={field.onChange}
                    error={monthError}
                  />
                </FormItem>
              )}
            />
          ) : (
            <>
              {/* Hidden field to register month with react-hook-form */}
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => <input type="hidden" {...field} />}
              />
              <FormItem>
                <FormLabel htmlFor="month">Month</FormLabel>
                <input
                  id="month"
                  type="text"
                  value={lockedMonth || ""}
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Month cannot be changed when editing
                </p>
              </FormItem>
            </>
          )}

          {/* Master Learner */}
          <MasterLearnerField />

          {/* Master Care */}
          <MasterCareField />

          {/* Tools */}
          <div className="space-y-2">
            <FormLabel className="text-base font-medium">Narzędzia</FormLabel>
            <ToolsSection
              tools={tools}
              setTools={setTools}
              onChange={(value, toolsData) => {
                setTools(toolsData);
              }}
            />
          </div>

          {/* Budget */}
          <BudgetField />

          {/* Integrations */}
          <IntegrationField />

          {/* Other */}
          <OtherField />

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCalculate}
              disabled={isSubmitDisabled}
            >
              Calculate
            </Button>
            <Button type="submit" disabled={isSubmitDisabled || saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Calculate Dialog */}
      <CalculationResultDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        invoiceString={invoiceHeavenString}
        totalSum={totalSum}
      />
    </>
  );
}
