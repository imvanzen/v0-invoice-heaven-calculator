# Changelog

All notable changes to the Invoice Heaven Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Separated month/year selector into two independent Select components
- Master Care input field now disabled outside settlement months with helper text
- Employment date requirement - blocking screen before accessing calculator
- User settings storage in IndexedDB (employment date, theme preferences)
- Complete backup/restore capability with settings included in export/import
- Import preview now shows settings information
- Dynamic month filtering based on selected year

### Changed

- Removed localStorage backward compatibility (IndexedDB only)
- Month selector dynamically filters based on employment date and current date
- Employment date manager syncs directly with IndexedDB

### Technical

- Upgraded IndexedDB schema to v2 with settings object store
- Added SettingsService for managing user settings
- Theme changes during import now properly applied to UI

## [0.2.0] - 2026-01-16

### Added

- Calculation history and limit tracking (Epic 6)
- Save calculations for specific months with one-per-month restriction
- View calculation history on home page with table format
- Edit existing calculations with pre-filled data
- Clone calculations to create copies for new months
- Delete calculations with confirmation dialog
- Accumulated limit validation (ML annual, MC bi-monthly, Team building quarterly)
- Export calculations to JSON file for backup
- Import calculations from JSON file with merge/replace/skip strategies
- Period-based input restrictions (MC only in settlement months, Team building only in quarter months)
- Calculator state persistence in localStorage (auto-save)
- Copy calculation InvoiceHeaven string from list
- Usage/limit summary display above calculation list
- Employment start date input for accurate limit calculations
- Month/year selector with guardrails (employment date to current month)
- Employment date change disabled once calculations exist

### Changed

- Moved calculator to separate `/create` page
- Home page now displays calculation list instead of calculator
- Corrected Master Care validation - only in settlement months (Feb, Apr, Jun, Aug, Oct, Dec)
- Team building limit fixed at 1,500 PLN quarterly (not employment date dependent)
- Master Learner limit based on employment date (3,000 PLN if Jan-Jun, 1,500 PLN if Jul-Dec)

### Technical

- IndexedDB for calculation storage with indexes
- Benefit rules versioning system for audit compliance
- Currency formatting with Intl module (Polish locale)
- Employment date reactive updates with custom event system

## [0.1.0] - Initial Release

### Added

- Core calculation engine for reimbursement totals
- Input fields for all benefit categories (ML, MC, Team building, Other)
- Multi-currency tools management (PLN, USD, EUR)
- Financial math utilities for precise calculations
- InvoiceHeaven string generation
- Copy to clipboard functionality
- Dark/light theme support
- Responsive UI with base-ui components
- Per-entry validation (max values, non-negative checks)
- Tools section with dynamic add/remove
- Exchange rate conversion for tools

### Benefit Categories

- Master Learner: 3,000 PLN annual learning benefit
- Master Care: 750 PLN bi-monthly health/sports benefit
- Integracje: 1,500 PLN quarterly integration benefit
- Budżet: Monthly commute/accommodation budget
- Tools: Equipment and software purchases
- Inne: Other reimbursements

### Technical

- Next.js 15 with App Router
- React 19 with TypeScript
- Tailwind CSS for styling
- base-ui component library
- Integer-based financial calculations
