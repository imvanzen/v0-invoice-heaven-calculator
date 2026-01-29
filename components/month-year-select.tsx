"use client";

import React, { useMemo, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppState } from "@/providers/app-state-provider";
import { parseMonthString, createMonthString } from "@/utils/periods";
import { InlineError } from "@/components/ui/inline-error";

interface MonthYearSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function MonthYearSelect({
  value,
  onChange,
  error,
}: MonthYearSelectProps) {
  const { employmentDate } = useAppState();
  const [isPending, startTransition] = useTransition();

  const { year, month } = parseMonthString(value);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Generate available years (from employment date to current year)
  const availableYears = useMemo(() => {
    const years: number[] = [];
    const startYear = employmentDate ? employmentDate.year : currentYear - 2;

    for (let y = startYear; y <= currentYear; y++) {
      years.push(y);
    }

    return years;
  }, [employmentDate, currentYear]);

  // Generate all months
  const availableMonths = useMemo(() => {
    const months: { value: number; label: string }[] = [];

    for (let m = 1; m <= 12; m++) {
      const date = new Date(2026, m - 1, 1);
      const label = date.toLocaleDateString("en-US", { month: "long" });
      months.push({ value: m, label });
    }

    return months;
  }, []);

  // Filter available months based on constraints
  const filteredMonths = useMemo(() => {
    return availableMonths.filter((m) => {
      // If employment year, filter months before employment month
      if (
        employmentDate &&
        year === employmentDate.year &&
        m.value < employmentDate.month
      ) {
        return false;
      }

      // If current year, filter months after current month
      if (year === currentYear && m.value > currentMonth) {
        return false;
      }

      return true;
    });
  }, [availableMonths, employmentDate, year, currentYear, currentMonth]);

  const handleYearChange = (newYear: string) => {
    startTransition(() => {
      const y = parseInt(newYear, 10);
      // Keep current month if valid, otherwise default to first available
      const newMonthString = createMonthString(y, month);
      onChange(newMonthString);
    });
  };

  const handleMonthChange = (newMonth: string) => {
    startTransition(() => {
      const m = parseInt(newMonth, 10);
      const newMonthString = createMonthString(year, m);
      onChange(newMonthString);
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="month-select">
            Month{" "}
            {isPending && (
              <span className="text-muted-foreground text-xs ml-2">
                (Updating...)
              </span>
            )}
          </Label>
          <Select
            value={month.toString()}
            onValueChange={(value) => {
              handleMonthChange(value || "");
            }}
            disabled={isPending}
          >
            <SelectTrigger
              id="month-select"
              className={error ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent className="min-w-40 max-h-110">
              {filteredMonths.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="year-select">Year</Label>
          <Select
            value={year.toString()}
            onValueChange={(value) => {
              handleYearChange(value || "");
            }}
            disabled={isPending}
          >
            <SelectTrigger
              id="year-select"
              className={error ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <InlineError message={error} className="text-sm" />}
    </div>
  );
}
