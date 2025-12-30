"use client"

import { useState, useEffect, useCallback } from "react"
import type { Tool, ToolWithCalculatedAmount } from "@/types/tools"
import { addFinancialValues } from "@/utils/financialMath"

const TOOLS_STORAGE_KEY = "invoice-heaven-tools"

function createEmptyTool(): Tool {
  return {
    id: crypto.randomUUID(),
    name: "",
    amount: "",
    currency: "PLN",
    exchangeRate: "1",
  }
}

export function useTools() {
  const [tools, setTools] = useState<Tool[]>(() => {
    if (typeof window === "undefined") return [createEmptyTool()]
    const stored = localStorage.getItem(TOOLS_STORAGE_KEY)
    return stored && JSON.parse(stored).length > 0 ? JSON.parse(stored) : [createEmptyTool()]
  })

  useEffect(() => {
    localStorage.setItem(TOOLS_STORAGE_KEY, JSON.stringify(tools))
  }, [tools])

  const addTool = useCallback(() => {
    const newTool = createEmptyTool()
    setTools((prevTools) => [...prevTools, newTool])
    return newTool.id
  }, [])

  const updateTool = useCallback((id: string, updates: Partial<Tool>) => {
    // If changing currency to PLN, set exchange rate to 1
    if (updates.currency === "PLN") {
      updates.exchangeRate = "1"
    }

    setTools((prevTools) => prevTools.map((tool) => (tool.id === id ? { ...tool, ...updates } : tool)))
  }, [])

  const removeTool = useCallback((id: string) => {
    // Don't remove if it's the last tool
    setTools((prevTools) => {
      if (prevTools.length <= 1) {
        return [createEmptyTool()]
      }
      return prevTools.filter((tool) => tool.id !== id)
    })
  }, [])

  const calculateToolsTotal = useCallback((): number => {
    const toolsWithAmount = tools.map((tool) => {
      // Skip empty fields
      if (!tool.amount || tool.amount === "") return { ...tool, calculatedPLN: 0 }

      // Validate exchange rate for non-PLN currencies
      const exchangeRate =
        tool.currency !== "PLN" && (!tool.exchangeRate || tool.exchangeRate === "") ? 0 : Number(tool.exchangeRate || 1)

      return {
        ...tool,
        calculatedPLN: Number(tool.amount) * exchangeRate,
      }
    }) as ToolWithCalculatedAmount[]

    return addFinancialValues(...toolsWithAmount.map((tool) => tool.calculatedPLN))
  }, [tools])

  const getToolsWithErrors = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {}

    tools.forEach((tool) => {
      if (tool.currency !== "PLN" && (!tool.exchangeRate || tool.exchangeRate === "")) {
        errors[tool.id] = "Exchange rate is required for non-PLN currencies"
      }
    })

    return errors
  }, [tools])

  return {
    tools,
    addTool,
    updateTool,
    removeTool,
    calculateToolsTotal,
    getToolsWithErrors,
  }
}
