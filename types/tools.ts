export type Currency = "PLN" | "USD" | "EUR";

export interface Tool {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  exchangeRate: number;
}
