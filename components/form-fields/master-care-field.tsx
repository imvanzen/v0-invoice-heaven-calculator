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
import { InlineError } from "@/components/ui/inline-error";
import {
  parseMonthString,
  isMonthBiMonthlySettlementMonth,
} from "@/utils/periods";
import type { CalculationFormData } from "@/schemas/calculation-schema";
import { parseMoneyFormValue, toMoneyInputValue } from "@/utils/money";

export function MasterCareField() {
  const form = useFormContext<CalculationFormData>();
  const { budgetValidation } = useCalculationForm();

  return (
    <FormField
      control={form.control}
      name="masterCare"
      render={({ field }) => {
        const selectedMonth = form.watch("month");
        const monthNum = parseMonthString(selectedMonth).month;
        const isSettlementMonth = isMonthBiMonthlySettlementMonth(monthNum);

        const mcValidation = budgetValidation?.masterCare;
        const remaining = mcValidation?.remaining ?? 0;
        const limit = mcValidation?.limit ?? 0;
        const accumulated = mcValidation?.accumulated ?? 0;
        const isValid = mcValidation?.isValid ?? true;
        const error = mcValidation?.error;

        return (
          <FormItem>
            <FormLabel>Master Care</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                {...field}
                value={toMoneyInputValue(field.value)}
                onChange={(e) =>
                  field.onChange(parseMoneyFormValue(e.target.value, field.value))
                }
                disabled={!isSettlementMonth}
                className={!isValid ? "border-destructive" : ""}
              />
            </FormControl>
            {!isSettlementMonth ? (
              // Show helper only when no value; otherwise FormMessage shows the same error
              !field.value && (
                <p className="text-sm text-muted-foreground">
                  Master Care can only be entered in settlement months (February,
                  April, June, August, October, December)
                </p>
              )
            ) : (
              mcValidation && (
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
                  </p>
                  {error && <InlineError message={error} />}
                </div>
              )
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

