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
import type { CalculationFormData } from "@/schemas/calculation-schema";
import { parseMoneyFormValue, toMoneyInputValue } from "@/utils/money";

export function OtherField() {
  const form = useFormContext<CalculationFormData>();

  return (
    <FormField
      control={form.control}
      name="inne"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Other</FormLabel>
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
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
