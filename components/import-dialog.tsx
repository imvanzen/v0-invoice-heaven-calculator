"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  validateImportFile,
  processImportCalculations,
  ImportStrategy,
} from "@/utils/import";
import { ExportData } from "@/utils/export";
import { CalculationService, SettingsService } from "@/lib/db";
import { formatMonth } from "@/utils/periods";
import { ErrorMessage } from "@/components/ui/error-message";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function ImportDialog({
  open,
  onOpenChange,
  onImportComplete,
}: ImportDialogProps) {
  const { setTheme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ExportData | null>(null);
  const [preview, setPreview] = useState<{
    count: number;
    dateRange: { start: string; end: string } | null;
    statusSummary: Record<string, number>;
    hasSettings: boolean;
    settingsPreview?: {
      employmentDate: string | null;
      theme: string;
    };
  } | null>(null);
  const [strategy, setStrategy] = useState<ImportStrategy>("skip-duplicates");
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setFile(null);
      setImportData(null);
      setPreview(null);
      setError(null);
      setStrategy("skip-duplicates");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    // Explicitly handle cancel case - don't change state if no file selected
    if (!selectedFile) {
      // User cancelled or cleared selection - keep current state
      return;
    }

    // Update file immediately but keep preview/importData until new file is loaded
    setFile(selectedFile);
    setError(null);
    // Don't clear preview/importData here - keep them visible to prevent flicker

    try {
      const content = await selectedFile.text();
      const validation = validateImportFile(content);

      if (!validation.isValid) {
        setError(validation.error || "Invalid file");
        // Clear file state and preview on validation error
        setFile(null);
        setImportData(null);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Only update preview/importData after successful validation
      setImportData(validation.data || null);
      setPreview(validation.preview || null);
    } catch (err) {
      setError("Failed to read file");
      // Clear file state and preview on read error
      setFile(null);
      setImportData(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      console.error(err);
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setImporting(true);
    try {
      const existingCalculations = await CalculationService.getAll();
      const calculationsToImport = processImportCalculations(
        importData.calculations,
        existingCalculations,
        strategy,
      );

      if (strategy === "replace") {
        await CalculationService.deleteAll();
      }

      await CalculationService.bulkImport(calculationsToImport);

      // Import settings if available
      if (importData.settings) {
        // Validate employment date if present
        if (importData.settings.employmentDate) {
          const { year } = importData.settings.employmentDate;
          if (year < 2016) {
            setError(
              `Employment date cannot be before 2016 (when company was established). Found year: ${year}`,
            );
            setImporting(false);
            return;
          }
        }

        await SettingsService.import(importData.settings);

        // Notify app state to re-sync employment date from DB (e.g. set, cleared, or unchanged)
        window.dispatchEvent(new Event("employmentDateChanged"));

        // Apply theme immediately using next-themes
        if (importData.settings.theme) {
          setTheme(importData.settings.theme);
        }
      }

      onImportComplete();
      onOpenChange(false);

      // Reset state
      setFile(null);
      setImportData(null);
      setPreview(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError("Failed to import calculations");
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setFile(null);
      setImportData(null);
      setPreview(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Calculations</DialogTitle>
          <DialogDescription>
            Import calculations from a previously exported JSON file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-file">Select File</Label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="sr-only"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? "Change file" : "Choose file"}
              </Button>
              <div className="flex-1 min-w-0">
                {file ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No file chosen
                  </span>
                )}
              </div>
            </div>
          </div>

          {error && <ErrorMessage message={error} variant="error" />}

          {preview && (
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Import Preview</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Calculations:</span>{" "}
                  {preview.count}
                </p>
                <p>
                  <span className="font-medium">Date Range:</span>{" "}
                  {preview.dateRange
                    ? `${formatMonth(preview.dateRange.start)} - ${formatMonth(preview.dateRange.end)}`
                    : "—"}
                </p>
                <div>
                  <span className="font-medium">Status Summary:</span>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {Object.entries(preview.statusSummary).map(
                      ([status, count]) => (
                        <li key={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}:{" "}
                          {count}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                {preview.hasSettings && preview.settingsPreview && (
                  <div className="pt-2 border-t">
                    <span className="font-medium">User Settings:</span>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>
                        Employment Date:{" "}
                        {preview.settingsPreview.employmentDate
                          ? formatMonth(preview.settingsPreview.employmentDate)
                          : "Not set"}
                      </li>
                      <li>
                        Theme:{" "}
                        {preview.settingsPreview.theme.charAt(0).toUpperCase() +
                          preview.settingsPreview.theme.slice(1)}
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="import-strategy">Import Strategy</Label>
                <Select
                  value={strategy}
                  onValueChange={(value) => {
                    if (value) {
                      setStrategy(value as ImportStrategy);
                    }
                  }}
                >
                  <SelectTrigger id="import-strategy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip-duplicates">
                      Skip Duplicates (Recommended)
                    </SelectItem>
                    <SelectItem value="merge">
                      Merge (Keep All with New IDs)
                    </SelectItem>
                    <SelectItem value="replace">
                      Replace All (⚠ Delete Existing)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {strategy === "skip-duplicates" &&
                    "Only import calculations for months that don't already exist."}
                  {strategy === "merge" &&
                    "Import all calculations. Duplicates will get new IDs."}
                  {strategy === "replace" &&
                    "⚠ WARNING: This will delete all existing calculations and replace them with imported ones."}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!importData || importing}>
            {importing ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
