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
import {
  parseMonthString,
  isMonthBiMonthlySettlementMonth,
} from "@/utils/periods";
import { parseMoneyFormValue, toMoneyInputValue } from "@/utils/money";

export function MasterLearnerField() {
  const form = useFormContext<CalculationFormData>();
  const { budgetValidation } = useCalculationForm();

  return (
    <FormField
      control={form.control}
      name="masterLearner"
      render={({ field }) => {
        const selectedMonth = form.watch("month");
        const monthNum = parseMonthString(selectedMonth).month;
        const isSettlementMonth = isMonthBiMonthlySettlementMonth(monthNum);

        const mlValidation = budgetValidation?.masterLearner;
        const remaining = mlValidation?.remaining ?? 0;
        const limit = mlValidation?.limit ?? 0;
        const maxThisPeriod = mlValidation?.maxThisPeriod ?? 500;
        const accumulated = mlValidation?.accumulated ?? 0;
        const isValid = mlValidation?.isValid ?? true;
        const error = mlValidation?.error;

        return (
          <FormItem>
            <FormLabel>Master Learner</FormLabel>
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
              !field.value && (
                <p className="text-sm text-muted-foreground">
                  Master Learner can only be entered in settlement months
                  (February, April, June, August, October, December)
                </p>
              )
            ) : (
              mlValidation && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Used: {formatCurrency(accumulated, true)} / Limit:{" "}
                    {formatCurrency(limit, true)} (max {formatCurrency(maxThisPeriod, true)} this period) | Remaining:{" "}
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
