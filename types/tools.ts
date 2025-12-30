export type Currency = "PLN" | "USD" | "EUR"

export interface Tool {
  id: string
  name: string
  amount: string
  currency: Currency
  exchangeRate: string
}

export interface ToolWithCalculatedAmount extends Tool {
  calculatedPLN: number
}
