# ADR-001: Calculation Storage Strategy

## Status

**Proposed** | **Date:** 2026-01-16 | **Deciders:** Development Team

## Context

The Invoice Heaven Calculator needs to store calculation history to support:
- Monthly calculation tracking (US-022)
- Calculation history viewing (US-023)
- Editing saved calculations (US-024)
- Accumulated usage tracking for limit validation (US-026, US-027)
- Status management (US-029, US-030)

**Requirements:**
- Store multiple calculations per user (potentially hundreds over time)
- Each calculation contains: form values, InvoiceHeaven string, totals, timestamps, status, optional metadata
- Support querying by month/year, status, date range
- Enable editing and updating calculations
- No backend database or user authentication (complexity reduction requirement)
- Data must persist across browser sessions
- Data should be accessible for export/backup

**Current State:**
- Tools section uses localStorage (small, simple data)
- No calculation history storage yet
- Fully client-side application (no backend)

**Constraints:**
- Must work offline
- Must work across browser restarts
- Should handle data growth (users may have 50-200+ calculations over time)
- Should support data export/backup
- Must avoid backend infrastructure and authentication complexity

## Decision Drivers

1. **Storage Capacity:** Need to handle potentially large datasets (200+ calculations × ~2-5KB each = 400KB-1MB+)
2. **Query Performance:** Need to filter/search by month, status, date range
3. **Data Persistence:** Must survive browser restarts, cache clears (if possible)
4. **User Experience:** Fast reads/writes, no blocking operations
5. **Complexity:** Prefer simpler solutions, avoid external dependencies
6. **Portability:** Ability to export/backup data
7. **Browser Compatibility:** Support modern browsers (Chrome, Firefox, Safari, Edge)

## Considered Options

### Option 1: IndexedDB

**Description:**
Use IndexedDB (browser-native NoSQL database) as primary storage for calculation history. IndexedDB provides structured storage with indexing capabilities, transactions, and large storage quotas.

**Implementation:**
- Use `idb` library (lightweight IndexedDB wrapper) or native IndexedDB API
- Store calculations in object store with indexes on: month/year, status, timestamp
- Use localStorage as temporary cache for current session state

**Pros:**
- ✅ **Large Storage Capacity:** Typically 50% of disk space (much larger than localStorage's ~5-10MB)
- ✅ **Structured Queries:** Indexes enable fast filtering by month, status, date range
- ✅ **Transaction Support:** ACID-like transactions for data integrity
- ✅ **Asynchronous:** Non-blocking operations, better performance
- ✅ **Persistent:** Survives browser restarts, cache clears (unless user explicitly clears site data)
- ✅ **Structured Data:** Native support for complex objects, arrays
- ✅ **Browser Native:** No external dependencies, widely supported
- ✅ **Scalable:** Handles large datasets efficiently

**Cons:**
- ❌ **Complexity:** More complex API than localStorage (requires wrapper library or careful implementation)
- ❌ **Async API:** Requires Promise/async-await patterns (more complex than synchronous localStorage)
- ❌ **Browser Support:** Older browsers may have limited support (but modern browsers fully support)
- ❌ **Learning Curve:** Team needs to understand IndexedDB concepts (object stores, indexes, transactions)
- ❌ **Migration:** Need to handle schema migrations if data structure changes

**Storage Capacity:** ~50% of disk space (typically 10GB+)
**Query Performance:** Excellent (indexed queries)
**Persistence:** High (survives restarts, cache clears)
**Complexity:** Medium-High

---

### Option 2: Local File Storage (File System Access API / Download)

**Description:**
Store calculations in local files using File System Access API (modern browsers) or download/upload JSON files (fallback). User manages files manually.

**Implementation:**
- **Modern Approach:** Use File System Access API to save/load JSON file in user-selected directory
- **Fallback Approach:** Download JSON file, user uploads to restore
- Use localStorage as temporary cache for current session
- Calculations stored in single JSON file or multiple files (one per month)

**Pros:**
- ✅ **User Control:** User owns their data, can backup/transfer easily
- ✅ **Portability:** JSON files can be moved between devices, shared, backed up
- ✅ **Transparency:** User can inspect/edit data if needed
- ✅ **No Quota Limits:** Limited only by disk space
- ✅ **Export/Backup:** Built-in export functionality
- ✅ **Simple Format:** JSON is human-readable, easy to debug

**Cons:**
- ❌ **User Friction:** Requires user to manually save/load files
- ❌ **Browser Support:** File System Access API not available in all browsers (Safari support limited)
- ❌ **Workflow Disruption:** Interrupts user flow (save dialog, file selection)
- ❌ **No Auto-Save:** User must remember to save/load files
- ❌ **File Management:** User responsible for file organization
- ❌ **Search/Filter:** Requires loading entire file into memory, no native indexing
- ❌ **Concurrent Access:** Multiple tabs may have issues with file access
- ❌ **Mobile Support:** File System Access API has limited mobile support

**Storage Capacity:** Unlimited (disk space)
**Query Performance:** Poor (must load entire file)
**Persistence:** High (user-controlled)
**Complexity:** Medium (API complexity + user workflow)

---

### Option 3: localStorage (Temporary Cache Only)

**Description:**
Use localStorage only for temporary session state. Calculations are not persisted long-term, or persisted with significant limitations.

**Implementation:**
- Store current calculation draft in localStorage
- Optionally store recent calculations (last 10-20) in localStorage
- No long-term history storage
- Calculations lost if localStorage cleared

**Pros:**
- ✅ **Simple:** Synchronous API, easy to use
- ✅ **Fast:** Immediate reads/writes, no async overhead
- ✅ **Already Used:** Team familiar with localStorage (used for Tools)
- ✅ **No Dependencies:** Browser-native, no libraries needed
- ✅ **Universal Support:** Supported in all browsers

**Cons:**
- ❌ **Storage Limit:** ~5-10MB total (shared with other site data)
- ❌ **No Queries:** Must load all data to filter/search
- ❌ **Performance:** Loading large datasets blocks main thread
- ❌ **Fragility:** Data lost if user clears browser data
- ❌ **No Structure:** No native indexing, must implement manually
- ❌ **Synchronous:** Blocks UI thread on large operations
- ❌ **Limited Scalability:** Not suitable for 100+ calculations

**Storage Capacity:** ~5-10MB (shared)
**Query Performance:** Poor (must load all data)
**Persistence:** Low (cleared easily)
**Complexity:** Low

---

## Decision

**Selected Option: Hybrid Approach - IndexedDB (Primary) + localStorage (Temporary Cache)**

### Rationale

1. **Storage Requirements:** Users may accumulate 100-200+ calculations over time. Each calculation is ~2-5KB. Total: 200KB-1MB+. IndexedDB's large capacity (10GB+) easily handles this, while localStorage's 5-10MB limit is risky.

2. **Query Performance:** Need to filter by month, status, date range frequently. IndexedDB's indexing provides O(log n) query performance vs. O(n) for localStorage/file loading.

3. **User Experience:** IndexedDB is asynchronous and non-blocking, providing better UX than synchronous localStorage operations on large datasets.

4. **Persistence:** IndexedDB survives browser restarts and cache clears (unless user explicitly clears site data), providing better reliability than localStorage.

5. **Complexity Trade-off:** While IndexedDB is more complex than localStorage, the complexity is manageable with a wrapper library (e.g., `idb`). The benefits (capacity, performance, persistence) outweigh the added complexity.

6. **Future-Proof:** IndexedDB scales well if requirements grow (e.g., more data, complex queries, offline sync preparation).

### Implementation Strategy

**Primary Storage: IndexedDB**
- Store all calculation history in IndexedDB
- Use `idb` library (lightweight, TypeScript-friendly wrapper)
- Create object store: `calculations`
- Create indexes:
  - `monthYear` (for filtering by month)
  - `status` (for filtering by status)
  - `timestamp` (for date range queries, sorting)
  - `createdAt` (for chronological queries)

**Temporary Cache: localStorage**
- Store current calculation draft/form state in localStorage
- Store recent calculations (last 5-10) for quick access
- Use for session state (e.g., "last viewed calculation")
- Provides fast access to frequently used data

**Data Structure:**
```typescript
interface Calculation {
  id: string; // UUID
  monthYear: string; // "2026-01"
  timestamp: number; // Date.now()
  createdAt: number;
  updatedAt: number;
  name?: string; // Optional description
  status: 'saved' | 'submitted' | 'declined' | 'approved';
  values: {
    masterLearner: string;
    masterCare: string;
    tools: Tool[];
    budzet: string;
    integracje: string;
    inne: string;
  };
  invoiceHeavenString: string;
  totalSum: number;
  reimRazem: number;
}
```

**Migration Path:**
- Start with IndexedDB for new calculations
- If localStorage has old calculation data, migrate on first load
- Provide export functionality (JSON download) for backup

### Rejected Options

**Local File Storage:** Rejected due to:
- User friction (manual save/load workflow)
- Poor browser support (especially Safari, mobile)
- Disrupts user experience (save dialogs interrupt flow)
- No auto-save capability
- Poor query performance (must load entire file)

**localStorage Only:** Rejected due to:
- Storage capacity limitations (5-10MB shared)
- Poor scalability (blocks UI thread with large datasets)
- Fragility (data lost easily)
- No native indexing (must implement manually)

## Consequences

### Positive

- ✅ **Scalable Storage:** Can handle hundreds of calculations without performance issues
- ✅ **Fast Queries:** Indexed queries enable quick filtering by month, status, date
- ✅ **Reliable Persistence:** Data survives browser restarts and cache clears
- ✅ **Non-Blocking:** Asynchronous operations don't block UI
- ✅ **Future-Proof:** Easy to extend with additional indexes or data structures
- ✅ **Export Ready:** Can easily implement JSON export for backup

### Negative

- ❌ **Added Complexity:** Requires learning IndexedDB concepts and using wrapper library
- ❌ **Async Patterns:** Must use Promises/async-await throughout (more complex than sync localStorage)
- ❌ **Migration Effort:** Need to implement data migration if schema changes
- ❌ **Browser Support:** Older browsers may need polyfills (but modern browsers fully support)

### Neutral

- ⚪ **Dependencies:** Adds `idb` library (~2KB gzipped) - minimal impact
- ⚪ **Bundle Size:** Small increase (~2KB) for IndexedDB wrapper
- ⚪ **Testing:** Requires mocking IndexedDB in tests (similar complexity to localStorage mocking)

## Implementation Notes

### Library Choice: `idb`

**Why `idb`:**
- Lightweight (~2KB gzipped)
- TypeScript-friendly
- Promise-based (modern async patterns)
- Well-maintained (by Google Chrome team)
- Simple API (wraps IndexedDB complexity)

**Installation:**
```bash
npm install idb
```

**Example Usage:**
```typescript
import { openDB, DBSchema } from 'idb';

interface CalculationDB extends DBSchema {
  calculations: {
    key: string;
    value: Calculation;
    indexes: { 'monthYear': string; 'status': string; 'timestamp': number };
  };
}

const db = await openDB<CalculationDB>('invoice-heaven-calculator', 1, {
  upgrade(db) {
    const store = db.createObjectStore('calculations', { keyPath: 'id' });
    store.createIndex('monthYear', 'monthYear');
    store.createIndex('status', 'status');
    store.createIndex('timestamp', 'timestamp');
  },
});
```

### Fallback Strategy

If IndexedDB is unavailable (very rare):
1. Fall back to localStorage with warning
2. Limit stored calculations (e.g., last 50)
3. Show message to user about storage limitations
4. Encourage export/backup functionality

### Data Export/Backup (Safety Requirement)

**Critical Safety Feature:** Export/import functionality is required for data protection and backup.

**Export Implementation:**
- User can download all calculations as JSON file
- Support filtering (all, date range, status, month/year)
- Include export metadata (date, version, count)
- Human-readable JSON format
- Descriptive filenames with timestamps
- Privacy warning about sensitive data

**Import Implementation:**
- User can upload JSON file to restore calculations
- File validation (format, structure, required fields)
- Import preview before confirmation
- Import strategies: merge, replace, skip duplicates
- Transaction support (rollback on error)
- Handle schema version differences gracefully

**User Stories:** US-031 (Export), US-032 (Import)

**Rationale:**
- Protects against data loss (browser data cleared, device lost)
- Enables device migration
- Provides user control over their data
- Critical safety feature for production use

## References

- [IndexedDB API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [idb Library - GitHub](https://github.com/jakearchibald/idb)
- [File System Access API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [localStorage API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- User Stories: US-022, US-023, US-024, US-026, US-027, US-029, US-030
- Decision D-006: Calculation History Storage Strategy (USER_STORIES.md)

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-16  
**Maintained By:** Development Team

