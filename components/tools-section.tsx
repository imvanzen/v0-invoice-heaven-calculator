"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import type { Currency, Tool } from "@/types/tools";
import {
  multiplyMoney,
  formatMoney,
  parseMoneyFormValue,
  toMoneyInputValue,
  addMoney,
} from "@/utils/money";
import { InlineError } from "@/components/ui/inline-error";

const CURRENCIES: Currency[] = ["PLN", "USD", "EUR"] as const;
const CURRENCY_SYMBOLS = {
  PLN: "PLN",
  USD: "$",
  EUR: "€",
} satisfies Record<Currency, string>;

type Props = {
  onChange: (value: number, tools: Tool[]) => void;
  tools: Tool[];
  setTools: (tools: Tool[]) => void;
};

function createEmptyTool(): Tool {
  return {
    id: crypto.randomUUID(),
    name: "",
    amount: 0,
    currency: "PLN",
    exchangeRate: 1,
  };
}

export function ToolsSection({ onChange, tools, setTools }: Props) {
  const [toolErrors, setToolErrors] = useState<Record<string, string>>({});
  const nameInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

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

  useEffect(() => {
    const total = calculateToolsTotal();
    onChange(total, tools);
  }, [tools, calculateToolsTotal, onChange]);

  useEffect(() => {
    const errors = getToolsWithErrors();
    setToolErrors(errors);
  }, [tools, getToolsWithErrors]);

  useEffect(() => {
    if (lastAddedId && nameInputRefs.current[lastAddedId]) {
      nameInputRefs.current[lastAddedId]?.focus();
      setLastAddedId(null);
    }
  }, [lastAddedId]);

  const handleAddTool = useCallback(() => {
    const newTool = createEmptyTool();
    setTools([...tools, newTool]);
    setLastAddedId(newTool.id);
  }, [tools, setTools]);

  const handleUpdateTool = useCallback(
    (id: string, updates: Partial<Tool>) => {
      if (updates.currency === "PLN") {
        updates.exchangeRate = 1;
      }
      setTools(
        tools.map((tool) => (tool.id === id ? { ...tool, ...updates } : tool)),
      );
    },
    [tools, setTools],
  );

  const handleRemoveTool = useCallback(
    (id: string) => {
      if (tools.length <= 1) {
        setTools([createEmptyTool()]);
        return;
      }
      setTools(tools.filter((tool) => tool.id !== id));
    },
    [tools, setTools],
  );

  return (
    <div className="space-y-4">
      <Card className="bg-muted/50">
        <CardContent className="pt-6 space-y-2">
          <div className="flex flex-col gap-2">
            {tools.length === 0 ? (
              <p
                className="h-10 flex items-center text-sm text-muted-foreground"
                aria-live="polite"
              >
                No tools added yet.
              </p>
            ) : null}
            {tools.map((tool) => (
              <div key={tool.id}>
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-2 text-sm">
                  <div>
                    <Input
                      placeholder="Name"
                      value={tool.name}
                      onChange={(e) =>
                        handleUpdateTool(tool.id, { name: e.target.value })
                      }
                      ref={(el) => {
                        nameInputRefs.current[tool.id] = el;
                      }}
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      data-1p-ignore
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      type="number"
                      step="any"
                      placeholder="0"
                      min="0"
                      value={toMoneyInputValue(tool.amount)}
                      onChange={(e) =>
                        handleUpdateTool(tool.id, {
                          amount: parseMoneyFormValue(
                            e.target.value,
                            tool.amount,
                          ),
                        })
                      }
                    />
                  </div>
                  <div className="w-full">
                    <Select
                      value={tool.currency}
                      onValueChange={(value: Currency) =>
                        handleUpdateTool(tool.id, { currency: value })
                      }
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
                      step="any"
                      placeholder="1"
                      min="0"
                      value={toMoneyInputValue(tool.exchangeRate)}
                      onChange={(e) =>
                        handleUpdateTool(tool.id, {
                          exchangeRate: parseMoneyFormValue(
                            e.target.value,
                            tool.exchangeRate,
                          ),
                        })
                      }
                      disabled={tool.currency === "PLN"}
                      className={
                        toolErrors[tool.id] ? "border-destructive" : ""
                      }
                    />
                  </div>
                  <div className="w-full whitespace-nowrap">
                    ={" "}
                    {formatMoney(
                      multiplyMoney(
                        Number(tool.amount) || 0,
                        Number(tool.exchangeRate) || 1,
                      ),
                    )}{" "}
                    PLN
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => handleRemoveTool(tool.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {toolErrors[tool.id] && (
                  <InlineError
                    message={toolErrors[tool.id]}
                    className="text-sm mt-1"
                  />
                )}
              </div>
            ))}
          </div>

          <Button variant="ghost" className="mt-2" onClick={handleAddTool}>
            + Add tool
          </Button>

          <div className="flex gap-2 items-center">
            <Label htmlFor="totalTools">Total</Label>
            <Input
              id="totalTools"
              type="number"
              step="any"
              min="0"
              readOnly
              value={formatMoney(calculateToolsTotal())}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
