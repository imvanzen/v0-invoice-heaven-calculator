export function addFinancialValues(...values: number[]): number {
  // Convert all values to integers (cents)
  const intValues = values.map((value) => Math.round(value * 100))

  // Sum the integer values
  const sum = intValues.reduce((acc, val) => acc + val, 0)

  // Convert back to decimal and round to 2 decimal places
  return Math.round(sum) / 100
}
