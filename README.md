# Invoice Heaven Calculator

**Version:** 0.3.0 · **Status:** Production Ready · **Updated:** January 29, 2026

## Summary

Next.js app for calculating and formatting employee reimbursement data for InvoiceHeaven. React 19, Zod validation, IndexedDB storage, WCAG 2.1 AA–compliant UI.

**Stack:** Next.js 16 (App Router) · TypeScript 5.7 (strict) · React 19 · Tailwind 4 · base-ui · React Hook Form + Zod · IndexedDB

---

## Purpose

- Calculate monthly reimbursements across benefit categories (Master Learner, Master Care, Tools, Budget, Integrations, Other)
- Multi-currency tools with PLN conversion; track usage vs. annual/bi-monthly/quarterly limits
- Generate InvoiceHeaven format strings; maintain calculation history (Saved, Submitted, Declined, Approved)
- Import/export for backup and migration

**Rules:** Period-based inputs (Master Care/Learner bi-monthly, Integrations quarterly); annual limits (e.g. Master Learner 3,000 / 1,500 PLN by employment date); one calculation per month; real-time validation.

---

## Install

**Prerequisites:** Node.js 24+ or Bun 1.2+

```bash
git clone <repository-url>
cd invoice-heaven-calculator
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Production:** `bun run build` then `bun run start`.

---

## Development

### Tech Stack

Next.js 16 (App Router, RSC) · React 19 + React Compiler · Tailwind 4 (HSL variables) · shadcn/ui (New York) · Radix · Lucide · Context API + `useOptimistic`/`useTransition` · IndexedDB (idb) · React Hook Form + Zod 4 · next-themes · TypeScript 5.7 strict

### Project Structure

```
├── app/                 # App Router: page.tsx, create/, edit/[id]/, layout
├── providers/           # AppStateProvider, CalculationFormProvider
├── components/         # UI (shadcn), form-fields, calculation-list, dialogs, etc.
├── schemas/            # calculation-schema.ts, tool-schema.ts (Zod)
├── hooks/              # useTools, useBudgetValidation, useInvoiceString
├── lib/                # db.ts (IndexedDB), utils.ts
├── types/              # TypeScript definitions
├── utils/              # money.ts, currency.ts, periods.ts, limits.ts, export, import, clipboard
└── docs/               # USER_STORIES, TECHNICAL_DESCRIPTION, DESIGN_SPECIFICATIONS, ADRs, etc.
```

### Scripts

| Command         | Description       |
| --------------- | ----------------- |
| `bun run dev`   | Dev server        |
| `bun run build` | Production build  |
| `bun run start` | Production server |
| `bun run lint`  | Lint              |

### Guidelines

- **Money:** Use `addFinancialValues()` from `utils/money.ts` for currency math.
- **Components:** `"use client"` only when needed; prefer Server Components; use `cn()` from `lib/utils.ts`.
- **Styling:** CSS variables and Tailwind 4; test light/dark.
- **Validation:** Real-time, block submit on errors, clear messages.
- **A11y:** Radix/shadcn, labels, ARIA, keyboard nav.

### AI / Cursor

- **PM agent:** Requirement intake → impact → backlog (INVEST, Given/When/Then) → docs sync. See `docs/USER_STORIES.md`, `docs/TECHNICAL_DESCRIPTION.md`, `docs/DESIGN_SPECIFICATIONS.md`, `docs/ADR-001-calculation-storage-strategy.md`.
- **Designer agent:** shadcn New York, Tailwind 4, WCAG. Rules in `.cursor/rules/`.
- **Practice:** Review AI output; test both themes, a11y, and financial edge cases.

---

## Documentation

| Doc                                                                                     | Description                                              |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [USER_STORIES.md](docs/USER_STORIES.md)                                                 | User stories, acceptance criteria, business requirements |
| [TECHNICAL_DESCRIPTION.md](docs/TECHNICAL_DESCRIPTION.md)                               | Architecture, stack, data flow, config                   |
| [DESIGN_SPECIFICATIONS.md](docs/DESIGN_SPECIFICATIONS.md)                               | UI/UX specs, components, design system                   |
| [ADR-001-calculation-storage-strategy.md](docs/ADR-001-calculation-storage-strategy.md) | IndexedDB storage decision                               |

**Quick refs:** `utils/money.ts` (currency math), `utils/periods.ts` (periods), `utils/limits.ts` (limits), `lib/db.ts` (IndexedDB), `types/` (interfaces).

---

## Changelog

**0.3.0 (current)** — Calculation list, edit flow, dialogs; refinements to form and state.

**2.0** — React 19 patterns, React Hook Form + Zod, Context providers, WCAG 2.1 AA, code reduction.

**0.2.0** — IndexedDB, create/edit/delete, status tracking, import/export, employment date, period validation.

**0.1.0** — Initial: calculator form, tools, InvoiceHeaven string, theme, localStorage tools.

---

## License · Contributing · Support

[Add license and contributing guidelines if needed.] For feedback or issues, use the in-app form or contact the maintainer.

**Maintained by:** Jakub Reczko
