"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCalculationForm } from "@/providers/calculation-form-provider";
import { formatCurrency } from "@/utils/currency";
import type { CalculationFormData } from "@/schemas/calculation-schema";
import { InlineError } from "@/components/ui/inline-error";
import { parseMoneyFormValue, toMoneyInputValue } from "@/utils/money";

export function IntegrationField() {
  const form = useFormContext<CalculationFormData>();
  const { budgetValidation } = useCalculationForm();

  return (
    <FormField
      control={form.control}
      name="integracje"
      render={({ field }) => {
        const intValidation = budgetValidation?.integracje;
        const remaining = intValidation?.remaining ?? 0;
        const limit = intValidation?.limit ?? 0;
        const accumulated = intValidation?.accumulated ?? 0;
        const isValid = intValidation?.isValid ?? true;
        const error = intValidation?.error;

        return (
          <FormItem>
            <FormLabel>Team building</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                {...field}
                value={toMoneyInputValue(field.value)}
                onChange={(e) =>
                  field.onChange(
                    parseMoneyFormValue(e.target.value, field.value),
                  )
                }
                className={!isValid ? "border-destructive" : ""}
              />
            </FormControl>
            {intValidation && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Used: {formatCurrency(accumulated, true)} / Limit:{" "}
                  {formatCurrency(limit, true)} | Remaining:{" "}
                  <span
                    className={
                      remaining <= 0
                        ? "text-destructive font-semibold"
                        : remaining / limit < 0.1
                          ? "text-orange-600 dark:text-orange-400 font-semibold"
                          : "text-muted-foreground"
                    }
                  >
                    {formatCurrency(remaining, true)}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    (Travel expenses only (accommodation and transport))
                  </span>
                </p>
                {error && <InlineError message={error} />}
              </div>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
