/**
 * User Settings Types
 */

export interface UserSettings {
  id: string; // Always "user-settings" (singleton)
  employmentDate: {
    month: number;
    year: number;
  } | null;
  theme: "light" | "dark" | "system";
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsInput {
  employmentDate?: {
    month: number;
    year: number;
  } | null;
  theme?: "light" | "dark" | "system";
}
