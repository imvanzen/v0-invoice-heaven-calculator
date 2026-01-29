import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Calculation, CalculationInput } from "@/types/calculation";
import { getCurrentBenefitRules } from "@/types/benefit-rules";
import { UserSettings, UserSettingsInput } from "@/types/settings";
import type { Tool } from "@/types/tools";

// Database schema interface
interface CalculationDB extends DBSchema {
  calculations: {
    key: string;
    value: Calculation;
    indexes: {
      "by-month": string;
      "by-status": string;
      "by-createdAt": Date;
    };
  };
  settings: {
    key: string;
    value: UserSettings;
  };
  draftTools: {
    key: string;
    value: { id: string; tools: Tool[] };
  };
}

const DB_NAME = "invoice-heaven-db";
const DB_VERSION = 3; // v3: draftTools store (replaces localStorage for draft tools)

// Initialize database
async function initDB(): Promise<IDBPDatabase<CalculationDB>> {
  return openDB<CalculationDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create calculations store if it doesn't exist
      if (!db.objectStoreNames.contains("calculations")) {
        const store = db.createObjectStore("calculations", {
          keyPath: "id",
        });

        // Create indexes
        store.createIndex("by-month", "month", { unique: true });
        store.createIndex("by-status", "status", { unique: false });
        store.createIndex("by-createdAt", "createdAt", { unique: false });
      }

      // Create settings store if it doesn't exist (v2)
      if (oldVersion < 2 && !db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", {
          keyPath: "id",
        });
      }

      // Create draftTools store (v3) — persists last-used tools on create page (IndexedDB-only, no localStorage)
      if (oldVersion < 3 && !db.objectStoreNames.contains("draftTools")) {
        db.createObjectStore("draftTools", { keyPath: "id" });
      }
    },
  });
}

// Database service
export class CalculationService {
  private static dbPromise: Promise<IDBPDatabase<CalculationDB>> | null = null;

  private static getDB(): Promise<IDBPDatabase<CalculationDB>> {
    if (!CalculationService.dbPromise) {
      CalculationService.dbPromise = initDB();
    }
    return CalculationService.dbPromise;
  }

  // Create a new calculation
  static async create(input: CalculationInput): Promise<Calculation> {
    const db = await CalculationService.getDB();

    // Get current benefit rules version if not provided
    const benefitRulesVersion =
      input.benefitRulesVersion || getCurrentBenefitRules().version;

    const calculation: Calculation = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: input.status || "saved",
      benefitRulesVersion,
      ...input,
    };

    await db.add("calculations", calculation);
    return calculation;
  }

  // Get calculation by ID
  static async getById(id: string): Promise<Calculation | undefined> {
    const db = await CalculationService.getDB();
    return db.get("calculations", id);
  }

  // Get calculation by month
  static async getByMonth(month: string): Promise<Calculation | undefined> {
    const db = await CalculationService.getDB();
    return db.getFromIndex("calculations", "by-month", month);
  }

  // Get all calculations
  static async getAll(): Promise<Calculation[]> {
    const db = await CalculationService.getDB();
    return db.getAll("calculations");
  }

  // Get all calculations sorted by month (newest first)
  static async getAllSorted(): Promise<Calculation[]> {
    const calculations = await CalculationService.getAll();
    return calculations.sort((a, b) => {
      return b.month.localeCompare(a.month);
    });
  }

  // Get calculations by status
  static async getByStatus(status: string): Promise<Calculation[]> {
    const db = await CalculationService.getDB();
    return db.getAllFromIndex("calculations", "by-status", status);
  }

  // Update existing calculation
  static async update(
    id: string,
    updates: Partial<CalculationInput>,
  ): Promise<Calculation> {
    const db = await CalculationService.getDB();
    const existing = await db.get("calculations", id);

    if (!existing) {
      throw new Error(`Calculation with id ${id} not found`);
    }

    const updated: Calculation = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    await db.put("calculations", updated);
    return updated;
  }

  // Delete calculation
  static async delete(id: string): Promise<void> {
    const db = await CalculationService.getDB();
    await db.delete("calculations", id);
  }

  // Delete all calculations (for import replace strategy)
  static async deleteAll(): Promise<void> {
    const db = await CalculationService.getDB();
    const tx = db.transaction("calculations", "readwrite");
    await tx.objectStore("calculations").clear();
    await tx.done;
  }

  // Bulk import calculations
  static async bulkImport(calculations: Calculation[]): Promise<void> {
    const db = await CalculationService.getDB();
    const tx = db.transaction("calculations", "readwrite");

    for (const calculation of calculations) {
      await tx.store.put(calculation);
    }

    await tx.done;
  }

  // Check if calculation exists for a given month
  static async existsForMonth(month: string): Promise<boolean> {
    const calculation = await CalculationService.getByMonth(month);
    return calculation !== undefined;
  }

  // Get calculations within date range
  static async getByDateRange(
    startMonth: string,
    endMonth: string,
  ): Promise<Calculation[]> {
    const all = await CalculationService.getAll();
    return all.filter(
      (calc) => calc.month >= startMonth && calc.month <= endMonth,
    );
  }
}

// User Settings Service
export class SettingsService {
  private static dbPromise: Promise<IDBPDatabase<CalculationDB>> | null = null;
  private static readonly SETTINGS_ID = "user-settings";

  private static getDB(): Promise<IDBPDatabase<CalculationDB>> {
    if (!SettingsService.dbPromise) {
      SettingsService.dbPromise = initDB();
    }
    return SettingsService.dbPromise;
  }

  // Get user settings (singleton)
  static async get(): Promise<UserSettings | undefined> {
    const db = await SettingsService.getDB();
    return db.get("settings", SettingsService.SETTINGS_ID);
  }

  // Save or update user settings
  static async save(input: UserSettingsInput): Promise<UserSettings> {
    const db = await SettingsService.getDB();
    const existing = await db.get("settings", SettingsService.SETTINGS_ID);

    const now = new Date().toISOString();
    const settings: UserSettings = {
      id: SettingsService.SETTINGS_ID,
      employmentDate:
        input.employmentDate !== undefined
          ? input.employmentDate
          : existing?.employmentDate || null,
      theme: input.theme || existing?.theme || "system",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await db.put("settings", settings);
    return settings;
  }

  // Clear all settings
  static async clear(): Promise<void> {
    const db = await SettingsService.getDB();
    await db.delete("settings", SettingsService.SETTINGS_ID);
  }

  // Import settings (used during file import)
  static async import(settings: UserSettings): Promise<void> {
    const db = await SettingsService.getDB();
    await db.put("settings", {
      ...settings,
      id: SettingsService.SETTINGS_ID, // Ensure correct ID
    });
  }
}

const DRAFT_TOOLS_ID = "default";

// Draft tools (create-page last-used tools) — IndexedDB only, no localStorage
export class DraftToolsService {
  private static dbPromise: Promise<IDBPDatabase<CalculationDB>> | null = null;

  private static getDB(): Promise<IDBPDatabase<CalculationDB>> {
    if (!DraftToolsService.dbPromise) {
      DraftToolsService.dbPromise = initDB();
    }
    return DraftToolsService.dbPromise;
  }

  static async get(): Promise<Tool[]> {
    const db = await DraftToolsService.getDB();
    const row = await db.get("draftTools", DRAFT_TOOLS_ID);
    return row?.tools && Array.isArray(row.tools) && row.tools.length > 0
      ? row.tools
      : [];
  }

  static async save(tools: Tool[]): Promise<void> {
    const db = await DraftToolsService.getDB();
    await db.put("draftTools", { id: DRAFT_TOOLS_ID, tools });
  }
}
