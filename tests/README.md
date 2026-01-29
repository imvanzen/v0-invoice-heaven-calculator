# Functional Tests

This directory contains functional tests for the Invoice Heaven Calculator application using Playwright.

## Test Coverage

### Calculator Tests (`calculator.spec.ts`)

- Form display and validation
- Calculation logic for total sum
- String format generation (`ML;{value};MC;{value};REIM.RAZEM;{value};...`)
- REIM.RAZEM calculation (sum of tools, budzet, integracje, inne)
- Decimal precision handling
- Input validation (max values, negative values)
- Clear functionality
- Clipboard copy functionality

### Tools Section Tests (`tools-section.spec.ts`)

- Tools section UI and interactions
- Adding/removing tools
- Currency conversion (PLN, USD, EUR)
- Exchange rate handling
- Multiple tools calculation
- Integration with main calculator

## Running Tests

```bash
# Run all tests
bun test

# Run tests in UI mode (interactive)
bun run test:ui

# Run tests in headed mode (see browser)
bun run test:headed

# Run tests in debug mode
bun run test:debug

# Run specific test file
bun test tests/calculator.spec.ts
```

## Test Structure

Tests follow Playwright best practices:

- Use semantic selectors (getByRole, getByLabel, getByText)
- Proper waiting for async operations
- Isolated test cases with beforeEach hooks
- Clear test descriptions

## Business Logic Verified

1. **Total Sum Calculation**: Sum of all fields (ML + MC + tools + budzet + integracje + inne)
2. **REIM.RAZEM Calculation**: Sum of tools + budzet + integracje + inne
3. **String Format**: `ML;{ml};MC;{mc};REIM.RAZEM;{razem};narzędzia;{tools};budżet na dojazdy i noclegi;{budzet};integracje;{integracje};inne;{inne}`
4. **Decimal Precision**: Uses financial math to avoid floating point errors
