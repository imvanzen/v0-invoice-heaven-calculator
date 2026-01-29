import { Calculation } from "@/types/calculation";
import { UserSettings } from "@/types/settings";

export interface ExportData {
  version: string;
  exportDate: string;
  calculationsCount: number;
  calculations: Calculation[];
  settings?: UserSettings;
}

export function exportCalculationsToJSON(
  calculations: Calculation[],
  settings: UserSettings | undefined,
  filename?: string
): void {
  const exportData: ExportData = {
    version: process.env.NEXT_PUBLIC_VERSION || "0.0.0",
    exportDate: new Date().toISOString(),
    calculationsCount: calculations.length,
    calculations: calculations,
    settings: settings,
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const defaultFilename = `invoice-heaven-backup-${
    new Date().toISOString().split("T")[0]
  }.json`;

  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
