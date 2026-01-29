"use client";

import { useState, useEffect } from "react";
import type { EmploymentDate } from "@/types/calculation";
import { useAppState } from "@/providers/app-state-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { ErrorMessage } from "@/components/ui/error-message";

export function EmploymentDateManager() {
  // Get state from context
  const { employmentDate, setEmploymentDate, calculations } = useAppState();

  // Local UI state
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Filter out decimal characters from input
  const handleMonthChange = (value: string) => {
    // Remove commas and periods
    const filtered = value.replace(/[,.]/g, "");
    setMonth(filtered);
  };

  const handleYearChange = (value: string) => {
    // Remove commas and periods
    const filtered = value.replace(/[,.]/g, "");
    setYear(filtered);
  };

  // Calculate if we have calculations (to disable changing date)
  const hasCalculations = calculations.length > 0;

  // Sync form fields with employment date from context
  useEffect(() => {
    if (employmentDate) {
      setMonth(employmentDate.month.toString());
      setYear(employmentDate.year.toString());
    } else {
      setMonth("");
      setYear("");
    }
  }, [employmentDate]);

  async function handleSave() {
    setError(null);

    // Validation
    if (!month || !year) {
      setError("Please enter both month and year");
      return;
    }

    // Check for decimal values (comma or period)
    if (month.includes(",") || month.includes(".")) {
      setError("Month cannot contain decimal values");
      return;
    }

    if (year.includes(",") || year.includes(".")) {
      setError("Year cannot contain decimal values");
      return;
    }

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    // Check if parsing resulted in NaN (invalid number)
    if (isNaN(monthNum) || isNaN(yearNum)) {
      setError("Month and year must be valid numbers");
      return;
    }

    // Check if the parsed value matches the input (catches cases like "12.5" -> 12)
    if (monthNum.toString() !== month.trim() || yearNum.toString() !== year.trim()) {
      setError("Month and year must be whole numbers (no decimals)");
      return;
    }

    if (monthNum < 1 || monthNum > 12) {
      setError("Month must be between 1 and 12");
      return;
    }

    if (yearNum < 2016 || yearNum > new Date().getFullYear() + 1) {
      setError(
        "Year must be between 2016 (when company was established) and current year",
      );
      return;
    }

    // Check if date is in the future
    const inputDate = new Date(yearNum, monthNum - 1, 1);
    const now = new Date();
    if (inputDate > now) {
      setError("Employment date cannot be in the future");
      return;
    }

    const newDate: EmploymentDate = {
      month: monthNum,
      year: yearNum,
    };

    // Save via context (handles persistence and state updates)
    const result = await setEmploymentDate(newDate);

    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || "Failed to save employment date");
    }
  }

  async function handleClear() {
    // Clear via context (handles persistence and state updates)
    const result = await setEmploymentDate(null);

    if (result.success) {
      setOpen(false);
    } else {
      setError("Failed to clear employment date");
    }
  }

  const monthName = employmentDate
    ? new Date(
        employmentDate.year,
        employmentDate.month - 1,
        1,
      ).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1 md:gap-2 shrink-0"
        disabled={hasCalculations && employmentDate !== null}
        title={
          hasCalculations && employmentDate !== null
            ? "Cannot change employment date when calculations exist"
            : employmentDate
              ? `Joined: ${monthName}`
              : "Set Employment Date"
        }
      >
        <Settings className="h-4 w-4 shrink-0" />
        <span className="hidden md:inline whitespace-nowrap">
          {employmentDate ? `Joined: ${monthName}` : "Set Employment Date"}
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Employment Start Date</DialogTitle>
            <DialogDescription>
              Set your employment start date for accurate benefit limit
              calculations.
              {hasCalculations && employmentDate && (
                <ErrorMessage
                  message={`Note: Employment date cannot be changed once calculations
                  exist.`}
                  variant="warning"
                />
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && <ErrorMessage message={error} variant="error" />}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input
                  id="month"
                  type="number"
                  min="1"
                  max="12"
                  step="1"
                  placeholder="1-12"
                  value={month}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  disabled={hasCalculations && employmentDate !== null}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="2016"
                  max={new Date().getFullYear() + 1}
                  step="1"
                  placeholder="e.g., 2025"
                  value={year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  disabled={hasCalculations && employmentDate !== null}
                />
              </div>
            </div>

            {employmentDate && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="font-medium">Current Setting:</p>
                <p className="text-muted-foreground">{monthName}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            {employmentDate && !hasCalculations && (
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={hasCalculations && employmentDate !== null}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
