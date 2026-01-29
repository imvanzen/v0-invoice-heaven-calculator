# Documentation Index

**Last Updated:** January 27, 2026  
**Purpose:** Centralized index of all project documentation organized by type

---

## Document Categories

### 📋 Project Management

| Document | Description | Created | Status |
|----------|-------------|---------|--------|
| [README.md](../README.md) | Main project documentation with installation, development guide, and overview | 2026-01-16 | ✅ **Active** - Primary project reference |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and release notes following Keep a Changelog format | 2026-01-16 | ✅ **Active** - Maintained for all releases |

---

### 🏗️ Architecture & Technical

| Document | Description | Created | Status |
|----------|-------------|---------|--------|
| [TECHNICAL_DESCRIPTION.md](./TECHNICAL_DESCRIPTION.md) | Complete technical architecture, stack details, patterns, and implementation decisions | 2026-01-16 | ✅ **Active** - Core technical reference (v2.0) |
| [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) | Component trees, provider hierarchy, data flow diagrams (post-refactor v2.0) | 2026-01-16 | ✅ **Active** - Visual architecture reference |
| [ADR-001-calculation-storage-strategy.md](./ADR-001-calculation-storage-strategy.md) | Architecture Decision Record: IndexedDB vs localStorage choice with rationale | 2026-01-16 | ✅ **Active** - Historical decision record |

---

### 🎨 Design

| Document | Description | Created | Status |
|----------|-------------|---------|--------|
| [DESIGN_SPECIFICATIONS.md](./DESIGN_SPECIFICATIONS.md) | UI/UX design specs, component specifications, Tailwind strategies, design system | 2026-01-16 | ✅ **Active** - Design system reference (v1.1) |

---

### 💼 Business Requirements

| Document | Description | Created | Status |
|----------|-------------|---------|--------|
| [USER_STORIES.md](./USER_STORIES.md) | Comprehensive user stories, acceptance criteria, business rules organized by Epic | 2026-01-16 | ✅ **Active** - Primary requirements reference |

---

### 📋 Verification

| Document | Description | Created | Status |
|----------|-------------|---------|--------|
| [DOCUMENTATION_VERIFICATION.md](./DOCUMENTATION_VERIFICATION.md) | Doc vs code verification report and applied corrections | 2026-01-28 | ✅ **Active** - Snapshot of verification |

---

### 🔄 Refactoring Documentation

| Document | Description | Created | Status |
|----------|-------------|---------|--------|
| [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) | Overview of calculation form refactoring (field components, shared form) | 2026-01-20 | ⚠️ **Historical** - Post-refactor summary, reference only |
| [PAGE_REFACTORING.md](./PAGE_REFACTORING.md) | Detailed page component refactoring (FormPageLayout, EmploymentDateGuard, etc.) | 2026-01-20 | ⚠️ **Historical** - Post-refactor summary, reference only |
| [PAGE_REFACTORING_SUMMARY.md](./PAGE_REFACTORING_SUMMARY.md) | Summary of page refactoring with metrics and improvements | 2026-01-20 | ⚠️ **Historical** - Post-refactor summary, reference only |
| [REFACTORING_FORMS.md](./REFACTORING_FORMS.md) | Form refactoring documentation (field components, shared CalculationForm) | 2026-01-20 | ⚠️ **Historical** - Post-refactor summary, reference only |
| [INVOICE_STRING_REFACTORING.md](./INVOICE_STRING_REFACTORING.md) | Invoice string generation and dialog component refactoring | 2026-01-20 | ⚠️ **Historical** - Post-refactor summary, reference only |
| [DIALOG_REFACTORING_SUMMARY.md](./DIALOG_REFACTORING_SUMMARY.md) | Summary of dialog and invoice string refactoring with implementation details | 2026-01-20 | ⚠️ **Historical** - Post-refactor summary, reference only |

---

### 🧪 Testing

| Document | Description | Created | Status |
|----------|-------------|---------|--------|
| [tests/README.md](../tests/README.md) | Functional test documentation with Playwright, test coverage, and running instructions | Unknown | ✅ **Active** - Test documentation |

---

## Status Legend

- ✅ **Active** - Current, maintained, and relevant for ongoing development
- ⚠️ **Historical** - Completed refactoring documentation, useful for reference but not actively maintained

---

## Quick Navigation by Purpose

### Getting Started
- Start with [README.md](../README.md) for installation and overview
- Review [TECHNICAL_DESCRIPTION.md](./TECHNICAL_DESCRIPTION.md) for architecture details

### Understanding Requirements
- [USER_STORIES.md](./USER_STORIES.md) - All business requirements and acceptance criteria
- [DESIGN_SPECIFICATIONS.md](./DESIGN_SPECIFICATIONS.md) - UI/UX requirements

### Architecture Decisions
- [ADR-001-calculation-storage-strategy.md](./ADR-001-calculation-storage-strategy.md) - Storage strategy decision
- [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) - Visual architecture reference

### Development History
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- Refactoring docs (Historical) - Understanding past refactoring work

### Testing
- [tests/README.md](../tests/README.md) - Test documentation and running instructions

---

## Notes

- All refactoring documentation (created 2026-01-20) documents completed work from the v2.0 major refactor
- These historical documents are preserved for reference but are not actively maintained
- Current architecture and patterns are documented in TECHNICAL_DESCRIPTION.md and ARCHITECTURE_DIAGRAMS.md
- For the most up-to-date information, refer to Active documents
