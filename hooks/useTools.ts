"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/types/tools";
import { addMoney, multiplyMoney } from "@/utils/money";

function createEmptyTool(): Tool {
  return {
    id: crypto.randomUUID(),
    name: "",
    amount: 0,
    currency: "PLN",
    exchangeRate: 1,
  };
}

/**
 * In-memory tools state. No persistence (app uses CalculationFormProvider + IndexedDB for draft tools on create page).
 */
export function useTools() {
  const [tools, setTools] = useState<Tool[]>(() => [createEmptyTool()]);

  const addTool = useCallback(() => {
    const newTool = createEmptyTool();
    setTools((prevTools) => [...prevTools, newTool]);
    return newTool.id;
  }, []);

  const updateTool = useCallback((id: string, updates: Partial<Tool>) => {
    // If changing currency to PLN, set exchange rate to 1
    if (updates.currency === "PLN") {
      updates.exchangeRate = 1;
    }

    setTools((prevTools) =>
      prevTools.map((tool) =>
        tool.id === id ? { ...tool, ...updates } : tool,
      ),
    );
  }, []);

  const removeTool = useCallback((id: string) => {
    // Don't remove if it's the last tool
    setTools((prevTools) => {
      if (prevTools.length <= 1) {
        return [createEmptyTool()];
      }
      return prevTools.filter((tool) => tool.id !== id);
    });
  }, []);

  const calculateToolsTotal = useCallback((): number => {
    const toolsWithAmount = tools.filter((tool) => tool.amount > 0);

    return addMoney(
      ...toolsWithAmount.map((tool) =>
        multiplyMoney(tool.amount, tool.exchangeRate),
      ),
    );
  }, [tools]);

  const getToolsWithErrors = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};

    tools.forEach((tool) => {
      if (
        tool.currency !== "PLN" &&
        (!tool.exchangeRate || tool.exchangeRate === 0)
      ) {
        errors[tool.id] = "Exchange rate is required for non-PLN currencies";
      }
    });

    return errors;
  }, [tools]);

  return {
    tools,
    addTool,
    updateTool,
    removeTool,
    calculateToolsTotal,
    getToolsWithErrors,
  };
}
