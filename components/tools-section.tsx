"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import type { Currency } from "@/types/tools"
import { useTools } from "@/hooks/useTools"

const CURRENCIES: Currency[] = ["PLN", "USD", "EUR"]
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  PLN: "PLN",
  USD: "$",
  EUR: "€",
}

type Props = {
  onChange: (value: Number) => void
}

export function ToolsSection({ onChange }: Props) {
  const { tools, addTool, updateTool, removeTool, calculateToolsTotal, getToolsWithErrors } = useTools()
  const [toolErrors, setToolErrors] = useState<Record<string, string>>({})
  const nameInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)

  useEffect(() => {
    onChange(calculateToolsTotal().toFixed(2));
  }, [calculateToolsTotal, tools])

  // Check for validation errors when tools change
  useEffect(() => {
    const errors = getToolsWithErrors()
    setToolErrors(errors)
  }, [getToolsWithErrors])

  // Autofocus the name input when a new tool is added
  useEffect(() => {
    if (lastAddedId && nameInputRefs.current[lastAddedId]) {
      nameInputRefs.current[lastAddedId]?.focus()
      setLastAddedId(null)
    }
  }, [lastAddedId])

  const handleAddTool = useCallback(() => {
    const newId = addTool()
    setLastAddedId(newId)
  }, [addTool])

  return (
    <div className="space-y-4">
      <Card className="bg-muted/50">
        <CardContent className="pt-6 space-y-2">
          <div className="flex flex-col gap-2">
            {tools.map((tool) => (
              <div key={tool.id}>
                <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] items-center gap-2 text-sm">
                  <div>
                    <Input
                      placeholder="Nazwa"
                      value={tool.name}
                      onChange={(e) => updateTool(tool.id, { name: e.target.value })}
                      ref={(el) => (nameInputRefs.current[tool.id] = el)}
                      data-1p-ignore
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={tool.amount}
                      onChange={(e) => updateTool(tool.id, { amount: e.target.value })}
                    />
                  </div>
                  <div className="w-full">
                    <Select
                      value={tool.currency}
                      onValueChange={(value: Currency) => updateTool(tool.id, { currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {CURRENCY_SYMBOLS[currency]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Input
                      type="number"
                      placeholder="1"
                      min="0"
                      value={tool.exchangeRate}
                      onChange={(e) => updateTool(tool.id, { exchangeRate: e.target.value })}
                      disabled={tool.currency === "PLN"}
                      className={toolErrors[tool.id] ? "border-destructive" : ""}
                    />
                  </div>
                  <div className="w-full whitespace-nowrap">
                    = {((Number(tool.amount) || 0) * (Number(tool.exchangeRate) || 1)).toFixed(2)} PLN
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => removeTool(tool.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {toolErrors[tool.id] && <p className="text-sm text-destructive mt-1">{toolErrors[tool.id]}</p>}
              </div>
            ))}
          </div>

          <Button variant="ghost" className="mt-2" onClick={handleAddTool}>
            + Dodaj narzędzie
          </Button>

          <div className="flex gap-2 items-center">
            <Label htmlFor="totalTools">Podsuma</Label>
            <Input
              id="totalTools"
              type="number"
              readOnly
              value={calculateToolsTotal().toFixed(2)}
              placeholder="0"
            />
          </div>   
        </CardContent>
      </Card> 
    </div>
  )
}
