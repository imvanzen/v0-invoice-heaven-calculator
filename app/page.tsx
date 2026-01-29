"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, FileUp } from "lucide-react";
import { SettingsService } from "@/lib/db";
import type { Calculation } from "@/types/calculation";
import { CalculationList } from "@/components/calculation-list";
import { UsageSummary } from "@/components/usage-summary";
import { ImportDialog } from "@/components/import-dialog";
import { EmploymentDateManager } from "@/components/employment-date-manager";
import { exportCalculationsToJSON } from "@/utils/export";
import type { UserSettings } from "@/types/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState } from "@/providers/app-state-provider";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { PageFooter } from "@/components/page-footer";

export default function HomePage() {
  // Use app state context
  const {
    calculations,
    employmentDate,
    isCalculationsLoading,
    refreshCalculations,
  } = useAppState();

  // Get current theme from next-themes
  const { theme: currentTheme } = useTheme();

  // Local UI state
  const [filteredCalculations, setFilteredCalculations] = useState<
    Calculation[]
  >([]);
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const router = useRouter();

  // Filter calculations when calculations or filter changes
  useEffect(() => {
    if (!statusFilter || statusFilter === "all") {
      setFilteredCalculations(calculations);
    } else {
      setFilteredCalculations(
        calculations.filter((calc) => calc.status === statusFilter),
      );
    }
  }, [calculations, statusFilter]);

  function handleAddNew() {
    router.push("/create");
  }

  async function handleExport() {
    if (calculations.length === 0) {
      alert("No calculations to export");
      return;
    }

    try {
      const settings = await SettingsService.get();

      // Get current theme from next-themes (source of truth for active theme)
      // This ensures we export the actual current theme, not a stale IndexedDB value
      const themeToExport =
        currentTheme && ["light", "dark", "system"].includes(currentTheme)
          ? (currentTheme as "light" | "dark" | "system")
          : settings?.theme || "system";

      // Merge current theme with IndexedDB settings
      const settingsWithCurrentTheme: UserSettings | undefined = settings
        ? {
            ...settings,
            theme: themeToExport,
          }
        : {
            id: "user-settings",
            employmentDate: null,
            theme: themeToExport,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

      exportCalculationsToJSON(calculations, settingsWithCurrentTheme);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export calculations");
    }
  }

  function handleImport() {
    setShowImportDialog(true);
  }

  function handleImportComplete() {
    refreshCalculations();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-6xl">
        <PageHeader
          description="Manage your monthly reimbursement calculations"
          actions={
            <>
              <EmploymentDateManager />
              <Button
                variant="outline"
                onClick={handleImport}
                size="sm"
                className="shrink-0"
              >
                <FileUp className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Import</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                size="sm"
                className="shrink-0"
                disabled={calculations.length === 0}
              >
                <FileDown className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Export</span>
              </Button>
              <Button onClick={handleAddNew} size="sm" className="shrink-0">
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Add New</span>
              </Button>
            </>
          }
        />
        <CardContent>
          {isCalculationsLoading ? (
            <LoadingState message="Loading calculations..." />
          ) : calculations.length === 0 ? (
            <EmptyState
              title="No calculations yet. Create your first one!"
              action={
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Calculation
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              <UsageSummary
                calculations={calculations}
                employmentDate={employmentDate}
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {filteredCalculations.length} calculation
                    {filteredCalculations.length !== 1 ? "s" : ""} found
                    {statusFilter !== "all" && ` (filtered by ${statusFilter})`}
                  </p>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="saved">Saved</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CalculationList
                  calculations={filteredCalculations}
                  onUpdate={refreshCalculations}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PageFooter />

      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
