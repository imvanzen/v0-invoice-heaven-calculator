import { z } from "zod";

/**
 * Validation schema for Tool entries
 * Simple schema matching the Tool type - amountInPLN is computed, not stored
 * Ensures currency codes, exchange rates, and amounts are valid
 */
export const toolSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, "Tool name is required")
    .max(100, "Tool name too long"),
  amount: z
    .number({ error: "Amount must be a number" })
    .min(0, "Amount cannot be negative")
    .max(999999, "Amount exceeds maximum value"),
  currency: z.enum(["PLN", "USD", "EUR"], {
    message: "Invalid currency code",
  }),
  exchangeRate: z
    .number({ error: "Exchange rate must be a number" })
    .min(0.01, "Exchange rate must be greater than 0")
    .max(1000, "Exchange rate exceeds reasonable limit"),
});

export type ToolFormData = z.infer<typeof toolSchema>;

/**
 * Validation schema for creating a new tool (without id)
 */
export const createToolSchema = toolSchema.omit({ id: true });

export type CreateToolFormData = z.infer<typeof createToolSchema>;
