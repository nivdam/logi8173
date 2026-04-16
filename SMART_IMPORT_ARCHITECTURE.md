# Smart Import Architecture

## 1. Current State Assessment

### What Exists

The import pipeline lives in `src/features/settings/import/` and consists of:

| File | Responsibility |
|------|---------------|
| `import-parsers.ts` | TSV/CSV parsing, delimiter detection, header alias matching, row validation |
| `import-runner.ts` | Sequential per-row upsert with 1s throttle, cancel support |
| `import-types.ts` | `ImportRow`, `ImportResult`, `ColumnMapping`, status types |
| `ImportDialog.tsx` | Orchestrator — tab switching, state management, parse → review flow |
| `ImportPasteStep.tsx` | Input UI — paste, URL load, file drag/drop |
| `ImportReviewStep.tsx` | Preview + import execution with progress |
| `ImportPreviewTable.tsx` | Row-level preview with status badges |

### What Works

- **Paste from Excel/Sheets** — TSV parsing with quoted-field handling works reliably.
- **CSV/TSV file drop** — reads `.csv`, `.tsv`, `.txt` via `File.text()`.
- **Google Sheets URL** — backend fetches sheet text via `imports.fetchSheetText`.
- **Exact header matching** — `detectColumnMapping` matches headers against known aliases (case-insensitive).
- **Row validation** — per-row checks for required fields, valid categories, valid ranks, duplicate detection.
- **Per-row upsert with progress** — visual feedback per row, error aggregation, cancel support.

### What Breaks on Real Data

1. **Headers don't match aliases** — Real Excel files use ad-hoc Hebrew headers like "שם הפריט" (instead of "שם פריט"), "כמות ראשונית" (instead of "כמות"), or entirely custom labels. A single missing character causes total detection failure.

2. **No fuzzy/partial matching** — The current `detectColumnMapping` requires exact lowercase equality. "שם  פריט" (double space) or "שם_פריט" (underscore) won't match.

3. **Category values don't match enum** — Real data uses natural Hebrew like "רספ״י", "ציוד אישי", "כללי - שונות" instead of the system's underscore-delimited enum values ("רספאי", "ציוד_אישי", "כללי").

4. **No header row detection** — The parser always assumes row 0 is the header. Real files may have title rows, blank rows, or metadata above the actual header.

5. **No column mapping UI** — When auto-detection fails, there's no way for the user to manually assign columns. The flow just shows an error.

6. **Rank values vary** — Real data uses "טור'" (abbreviated), "סמל ראשון" (expanded), or "סמ״ר" (geresh instead of quote) instead of the exact enum values.

7. **Mixed data in quantity columns** — Values like "50 יח'" or "~100" are common and fail `Number()` parsing.

8. **No preset/memory** — Every import starts from scratch. Users importing from the same Excel template every time must re-verify the same mapping.

9. **No `.xlsx` support** — File input accepts only `.csv/.tsv/.txt`. Real battalion files are `.xlsx`.

---

## 2. Parsing Pipeline Stages

```
Raw Input → [1: Normalize] → [2: Detect Headers] → [3: Infer Fields] → [4: Normalize Values] → [5: Validate] → [6: Review UX] → Import
```

### Stage 1: Raw Input → Normalized Rows

**Goal**: Accept any input format and produce `string[][]`.

```
parseRawInput(input: RawImportInput): string[][]
```

```ts
type RawImportInput =
  | { source: "paste"; text: string }
  | { source: "file"; file: File }
  | { source: "url"; url: string }
```

**Changes from current state**:
- Add `.xlsx` support via [SheetJS (xlsx)](https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.mini.min.js) — free, no server needed, reads ArrayBuffer in-browser.
- For `.xlsx` files: `XLSX.read(arrayBuffer) → worksheet → XLSX.utils.sheet_to_json({ header: 1 })` → `string[][]`.
- For paste/CSV/TSV: keep existing `parseSpreadsheetText` (already handles quoted fields, delimiter detection).
- For URL: keep existing `imports.fetchSheetText` backend endpoint.
- Strip leading/trailing blank rows before returning.

**`.xlsx` integration pseudocode**:
```ts
const parseExcelFile = async (file: File): Promise<string[][]> => {
  const { read, utils } = await import("xlsx")
  const buffer = await file.arrayBuffer()
  const workbook = read(buffer, { type: "array" })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: unknown[][] = utils.sheet_to_json(firstSheet, { header: 1 })
  return rows.map(row => row.map(cell => String(cell ?? "").trim()))
}
```

**Bundle note**: `xlsx` mini build is ~250KB gzipped. Use dynamic `import()` to avoid loading it unless an `.xlsx` file is selected. For $0 budget this is the only viable option — no server-side Excel parsing needed.

### Stage 2: Header Detection

**Goal**: Find the header row and map columns to known fields.

```
detectHeaders(rows: string[][], entity: ImportEntity): HeaderDetectionResult
```

```ts
type HeaderMatch = {
  field: string          // canonical field name (e.g., "name", "category")
  columnIndex: number    // which column in the raw data
  confidence: number     // 0–1 score
  matchedAlias: string   // what the header actually said
  method: "exact" | "fuzzy" | "inferred"
}

type HeaderDetectionResult = {
  headerRowIndex: number
  mappings: HeaderMatch[]
  unmappedColumns: number[]    // column indices with no match
  unmappedFields: string[]     // required fields with no column
}
```

**Algorithm**:

1. **Find header row** — scan first 10 rows. Score each row by how many known aliases it matches. The row with the highest score (minimum 2 matches) is the header. If no row scores ≥ 2, fall back to row 0.

2. **Exact match pass** — for each header cell, check against all aliases (normalized: lowercase, trim, strip punctuation). This is the current behavior.

3. **Fuzzy match pass** — for unmatched columns, compute similarity scores:
   - Levenshtein distance (normalized to 0–1)
   - Contains-check (alias is substring of header or vice versa)
   - Accept matches with score ≥ 0.7
   - Use best-scoring match per field, break ties by column order

4. **Score assignment**:
   - Exact match → confidence 1.0
   - Fuzzy match → confidence = similarity score (0.7–0.99)
   - Inferred (Stage 3) → confidence = inference score (0.3–0.7)

**Fuzzy matching implementation** — use a simple Levenshtein function (< 30 lines). No library needed.

```ts
const normalizeHeader = (header: string): string =>
  header
    .trim()
    .toLowerCase()
    .replace(/[״"']/g, '"')     // normalize geresh/gershayim
    .replace(/[\s_\-]+/g, " ")  // normalize separators
    .replace(/[^\w\sא-ת"]/g, "") // strip punctuation
    .trim()

const levenshteinSimilarity = (a: string, b: string): number => {
  // standard Levenshtein → normalize to 0–1
  const distance = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  return maxLen === 0 ? 1 : 1 - distance / maxLen
}
```

### Stage 3: Field Inference

**Goal**: When header detection leaves unmapped required fields, infer them from data patterns.

```
inferFields(rows: string[][], mapped: HeaderMatch[]): HeaderMatch[]
```

This stage only runs for columns not yet mapped. It samples the first 20 data rows and scores each unmapped column.

**Inference rules**:

| Target Field | Pattern | Score |
|-------------|---------|-------|
| `personalId` | 7–9 digit numbers in >80% of non-empty cells | 0.7 |
| `initialQty` | Numeric values (possibly with text suffix) in >70% of cells, and max < 100,000 | 0.5 |
| `category` | Values match known categories (exact or fuzzy) in >50% of cells | 0.6 |
| `rank` | Values match known ranks in >50% of cells | 0.6 |
| `fullName` | Hebrew text, 2+ words, no digits in >70% of cells | 0.5 |
| `company` | Contains "פלוגה" or matches known company pattern in >50% of cells | 0.5 |
| `phone` | Matches `05\d-?\d{7}` pattern in >50% of non-empty cells | 0.6 |

**Rules**:
- Each column can only be assigned to one field.
- Each field can only be assigned to one column.
- Conflicts resolved by highest score; ties broken by column order (leftmost wins).
- Inferred mappings always have `method: "inferred"` and require user confirmation.

### Stage 4: Value Normalization

**Goal**: Transform raw cell values to match system-expected formats.

```
normalizeValue(field: string, rawValue: string): NormalizedValue
```

```ts
type NormalizedValue = {
  value: string | number
  original: string
  wasNormalized: boolean
  confidence: number      // 1.0 for exact match, lower for fuzzy
}
```

**Normalization rules by field**:

#### Category Normalization

```ts
const CATEGORY_ALIASES: Record<ItemCategory, string[]> = {
  "רספאי": ["רספאי", "רספ״י", "רספ\"י", "רספי", "ריפוי"],
  "קבלר_קרביות": ["קבלר קרביות", "קבלר", "קרביות"],
  "ציוד_אישי": ["ציוד אישי", "ציוד_אישי", "אישי"],
  "אנרגיה": ["אנרגיה", "חשמל", "סוללות"],
  "תקשורת": ["תקשורת", "קשר"],
  "כללי": ["כללי", "שונות", "אחר", "כללי - שונות"],
}
```

Matching strategy:
1. Exact match against canonical value → confidence 1.0
2. Exact match against alias → confidence 0.95
3. Fuzzy match (Levenshtein ≥ 0.7) against aliases → confidence = similarity
4. No match → keep original, flag as warning

#### Quantity Extraction

```ts
const extractQuantity = (raw: string): NormalizedValue => {
  const cleaned = raw.replace(/[,،]/g, "")  // strip thousand separators
  const match = cleaned.match(/(\d+(?:\.\d+)?)/)
  if (match) {
    return { value: Number(match[1]), original: raw, wasNormalized: raw !== match[1], confidence: 0.9 }
  }
  return { value: raw, original: raw, wasNormalized: false, confidence: 0 }
}
```

Handles: "50 יח'", "~100", "100.0", "1,000", "50+".

#### Rank Normalization

```ts
const RANK_ALIASES: Record<string, string[]> = {
  "טוראי": ["טוראי", "טור'", "טור׳", "טור"],
  "רב\"ט": ["רב\"ט", "רבט", "רב״ט"],
  "סמל": ["סמל", "סמ'", "סמ׳"],
  "סמ\"ר": ["סמ\"ר", "סמר", "סמ״ר", "סמל ראשון"],
  // ... extend for all RANK_OPTIONS
}
```

Same matching strategy as categories: exact → alias → fuzzy.

#### Personal ID Formatting

```ts
const normalizePersonalId = (raw: string): NormalizedValue => {
  const digitsOnly = raw.replace(/\D/g, "")
  if (digitsOnly.length >= 7 && digitsOnly.length <= 9) {
    return { value: digitsOnly, original: raw, wasNormalized: raw !== digitsOnly, confidence: 1.0 }
  }
  return { value: raw, original: raw, wasNormalized: false, confidence: 0 }
}
```

Handles: "8001001", "800-1001", "8,001,001".

#### Phone Formatting

```ts
const normalizePhone = (raw: string): NormalizedValue => {
  const digitsOnly = raw.replace(/\D/g, "")
  if (digitsOnly.length === 10 && digitsOnly.startsWith("05")) {
    const formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`
    return { value: formatted, original: raw, wasNormalized: true, confidence: 1.0 }
  }
  return { value: raw, original: raw, wasNormalized: false, confidence: 0.5 }
}
```

### Stage 5: Validation

**Goal**: Per-row and cross-row checks. Largely the same as current `validateInventoryRows` / `validateSoldierRows`, but operating on normalized values.

**Changes from current state**:
- Accept `NormalizedValue[]` instead of raw `string[]` — validation runs after normalization.
- Add warning-level issues (not just blocking errors):

```ts
type ValidationSeverity = "error" | "warning"

type ValidationIssue = {
  field: string
  message: string
  severity: ValidationSeverity
}
```

- **Errors** block import: missing required fields, invalid format after normalization.
- **Warnings** allow import but flag: low-confidence normalization, unusual values, optional field issues.

**Cross-row checks** (same as current):
- Duplicate `itemNumber` within file
- Duplicate `personalId` within file
- Existing in system → `will_update`

### Stage 6: Review UX

**Goal**: User confirms/corrects mappings before data preview.

This is a new step inserted between paste and preview. See Section 6 for full UX flow.

---

## 3. Header Detection Strategy — Expanded Alias Maps

Extend current aliases significantly. The key insight: real IDF Excel files use dozens of header variations.

### Inventory Headers

```ts
const INVENTORY_HEADER_ALIASES: Record<string, string[]> = {
  name: [
    "שם", "שם פריט", "שם הפריט", "פריט", "תיאור", "תיאור פריט",
    "name", "item_name", "item name", "description",
  ],
  itemNumber: [
    "מק\"ט", "מקט", "מסט\"ב", "מק״ט", "מספר פריט", "מספר קטלוגי",
    "catalog", "item_number", "itemNumber", "sku",
  ],
  category: [
    "קטגוריה", "סוג", "סוג פריט", "מחלקה", "תחום",
    "category", "type",
  ],
  unitOfMeasure: [
    "יחידת מידה", "יחידה", "יח'", "יח׳", "יח\"מ",
    "unit", "unitOfMeasure", "uom",
  ],
  initialQty: [
    "כמות", "כמות התחלתית", "כמות ראשונית", "כמות נוכחית", "מלאי",
    "qty", "quantity", "initialQty", "amount", "stock",
  ],
  minThreshold: [
    "מינימום", "סף מינימום", "סף", "מינימלי", "כמות מינימלית",
    "min", "minThreshold", "minimum",
  ],
  notes: [
    "הערות", "הערה", "נוסף",
    "notes", "remarks", "comments",
  ],
}
```

### Soldier Headers

```ts
const SOLDIER_HEADER_ALIASES: Record<string, string[]> = {
  personalId: [
    "מספר אישי", "מ.א", "מ.א.", "מא", "מ״א", "מס' אישי", "מספר אישי",
    "personal_id", "personalId", "id",
  ],
  fullName: [
    "שם מלא", "שם", "שם פרטי ומשפחה", "שם החייל",
    "name", "fullName", "full_name",
  ],
  rank: [
    "דרגה", "דרג",
    "rank",
  ],
  company: [
    "פלוגה", "פלוגה/יחידה", "יחידה",
    "company", "unit",
  ],
  platoon: [
    "מחלקה", "מחלקה/צוות", "צוות",
    "platoon", "team",
  ],
  phone: [
    "טלפון", "נייד", "טל'", "טל׳", "מספר טלפון", "סלולרי",
    "phone", "mobile", "cell",
  ],
}
```

---

## 4. Normalization Architecture — Module Structure

All normalization logic lives in a single new file:

```
src/features/settings/import/
  import-normalizers.ts    ← NEW
```

```ts
// import-normalizers.ts

export const CATEGORY_ALIASES: Record<ItemCategory, string[]> = { ... }
export const RANK_ALIASES: Record<string, string[]> = { ... }

export const normalizeCategory = (raw: string): NormalizedValue => { ... }
export const normalizeQuantity = (raw: string): NormalizedValue => { ... }
export const normalizeRank = (raw: string): NormalizedValue => { ... }
export const normalizePersonalId = (raw: string): NormalizedValue => { ... }
export const normalizePhone = (raw: string): NormalizedValue => { ... }

// Field-keyed normalizer lookup
export const FIELD_NORMALIZERS: Record<string, (raw: string) => NormalizedValue> = {
  category: normalizeCategory,
  initialQty: normalizeQuantity,
  minThreshold: normalizeQuantity,
  rank: normalizeRank,
  personalId: normalizePersonalId,
  phone: normalizePhone,
}

// Generic: normalize a row using the mapping
export const normalizeRow = (
  raw: string[],
  mapping: ColumnMapping,
): Record<string, NormalizedValue> => {
  const result: Record<string, NormalizedValue> = {}
  for (const [field, colIndex] of Object.entries(mapping)) {
    const rawValue = raw[colIndex]?.trim() ?? ""
    const normalizer = FIELD_NORMALIZERS[field]
    result[field] = normalizer
      ? normalizer(rawValue)
      : { value: rawValue, original: rawValue, wasNormalized: false, confidence: 1.0 }
  }
  return result
}
```

---

## 5. Error Handling Policy

### Severity Levels

| Level | Behavior | Examples |
|-------|----------|----------|
| **Error** | Row blocked from import | Missing required field, invalid format after normalization |
| **Warning** | Row importable, flagged for review | Low-confidence normalization, unusual value, optional field issue |
| **Info** | No action needed, informational | Value was normalized, existing item will be updated |

### Partial Import

- Import proceeds for all valid rows, skips invalid ones.
- Result summary shows: created / updated / failed / skipped counts.
- Failed rows remain visible with error details.
- User can fix source data and re-import — duplicates detected via `itemNumber` / `personalId` and handled as updates.

### Import Result Enhancement

```ts
type ImportResult = {
  createdCount: number
  updatedCount: number
  failedCount: number
  skippedCount: number     // rows with errors that were never attempted
  errors: Array<{ index: number; message: string }>
  warnings: Array<{ index: number; field: string; message: string }>
}
```

---

## 6. Review UX Flow

### Current Flow (2 steps)

```
[Paste/Upload] → [Preview + Import]
```

### New Flow (3 steps)

```
[Paste/Upload] → [Column Mapping Review] → [Data Preview + Import]
```

### Step 2: Column Mapping Review (NEW)

This step appears after parsing, before the data preview table.

**Layout**:

```
┌─────────────────────────────────────────────┐
│  מיפוי עמודות                                │
│                                             │
│  ┌─────────────┬──────────────┬───────────┐ │
│  │ עמודה בקובץ  │ שדה במערכת    │ ביטחון     │ │
│  ├─────────────┼──────────────┼───────────┤ │
│  │ שם הפריט    │ [שם פריט ▼]  │ ●●●○ 85%  │ │
│  │ מק"ט        │ [מק"ט ▼]     │ ●●●● 100% │ │
│  │ סוג         │ [קטגוריה ▼]  │ ●●●○ 70%  │ │
│  │ כמות ראשונית │ [כמות ▼]     │ ●●○○ 60%  │ │
│  │ עמודה 5     │ [לא ממופה ▼] │            │ │
│  └─────────────┴──────────────┴───────────┘ │
│                                             │
│  ⚠ שדה חובה חסר: יחידת מידה                  │
│                                             │
│  [חזרה]                    [אישור מיפוי →]  │
└─────────────────────────────────────────────┘
```

**Behavior**:
- Each row shows: original header text, dropdown with system fields + "unmapped", confidence indicator.
- Auto-detected mappings pre-selected. Fuzzy/inferred matches highlighted in amber.
- User can override any mapping via dropdown.
- Missing required fields shown as warning banner.
- "Confirm Mapping" button proceeds to data preview. Disabled if required fields unmapped.
- Data preview shows first 3 rows as sample below the mapping table.

**Component structure**:

```
src/features/settings/import/
  ColumnMappingStep.tsx       ← NEW: the mapping review UI
  ColumnMappingRow.tsx        ← NEW: single row with dropdown
```

### Confidence Indicators

| Score | Visual | Meaning |
|-------|--------|---------|
| 1.0 | ●●●● green | Exact alias match |
| 0.7–0.99 | ●●●○ amber | Fuzzy match, likely correct |
| 0.3–0.69 | ●●○○ orange | Inferred from data, verify |
| < 0.3 | ●○○○ red | Low confidence, manual review needed |
| unmapped | — gray | No match found |

---

## 7. Reusable Presets

### Concept

A preset captures a column mapping so recurring imports from the same Excel template auto-configure.

### Data Structure

```ts
type ImportPreset = {
  id: string                    // crypto.randomUUID()
  name: string                  // user-chosen label, e.g. "טבלת מחסן ראשית"
  entity: ImportEntity          // "inventory" | "soldiers"
  headerSignature: string       // hash of sorted original header texts
  mapping: ColumnMapping        // field → column index
  headerLabels: string[]        // original header row for display
  createdAt: string
  lastUsedAt: string
}
```

### Storage

- **localStorage** — `logi8173_import_presets` key, JSON array.
- No backend needed. Presets are per-device, which is fine for a small operator team.
- Max 20 presets. Oldest auto-evicted.

### Header Signature

```ts
const computeHeaderSignature = (headers: string[]): string => {
  const normalized = headers.map(h => normalizeHeader(h)).sort().join("|")
  // Simple hash — djb2 or similar, no crypto needed
  return djb2Hash(normalized)
}
```

### Auto-Detection Flow

1. After parsing raw rows, compute header signature from row 0.
2. Check localStorage for presets with matching `headerSignature` and `entity`.
3. If found → pre-fill mapping, show "Preset loaded: {name}" banner, skip to data preview.
4. If not found → run normal header detection → show Column Mapping Step.

### Save Preset UI

After successful import:
```
┌────────────────────────────────────────┐
│ 💾 שמור מיפוי לשימוש חוזר?              │
│ [שם התבנית: ________] [שמור] [דלג]     │
└────────────────────────────────────────┘
```

---

## 8. Implementation Phases

### Phase 1: Extended Aliases + Header Normalization (Low effort, High value)

**Scope**:
- Expand `INVENTORY_HEADER_ALIASES` and `SOLDIER_HEADER_ALIASES` with real-world variations (Section 3).
- Add `normalizeHeader()` function that strips punctuation, normalizes geresh/gershayim, collapses whitespace.
- Apply normalization before alias comparison in `detectColumnMapping`.
- Add `CATEGORY_ALIASES` and `RANK_ALIASES` normalization in new `import-normalizers.ts`.
- Wire normalizers into validation (normalize before checking enum membership).

**Files changed**:
- `import-parsers.ts` — expand aliases, add header normalization
- `import-normalizers.ts` — new file with value normalizers
- `import-parsers.test.ts` — new test cases for fuzzy headers and normalized values

**Estimated effort**: 1–2 sessions.

### Phase 2: Column Mapping UI (Medium effort, High value)

**Scope**:
- Add `ColumnMappingStep.tsx` between paste and preview.
- Show detected mappings with confidence scores.
- Dropdown per column to manually assign/reassign fields.
- Sample data rows below mapping table.
- Update `ImportDialog.tsx` orchestrator to include new step.

**Files changed/added**:
- `ColumnMappingStep.tsx` — new
- `ColumnMappingRow.tsx` — new
- `ImportDialog.tsx` — add mapping step state
- `import-types.ts` — add `HeaderMatch`, `HeaderDetectionResult`

**Estimated effort**: 2–3 sessions.

### Phase 3: Fuzzy Detection + Field Inference (Medium effort, Medium value)

**Scope**:
- Implement Levenshtein similarity function.
- Add fuzzy matching pass to `detectColumnMapping`.
- Add field inference from data patterns (Section 3, Stage 3).
- Confidence scoring for all match types.
- Header row auto-detection (scan first 10 rows).

**Files changed**:
- `import-parsers.ts` — fuzzy matching, header row detection
- `import-normalizers.ts` — inference rules
- `import-types.ts` — `HeaderMatch` type with confidence

**Estimated effort**: 2 sessions.

### Phase 4: Presets + Auto-Detection (Low effort, Medium value)

**Scope**:
- `ImportPreset` type and localStorage CRUD.
- Header signature computation.
- Auto-detect preset on parse.
- Save preset prompt after successful import.

**Files changed/added**:
- `import-presets.ts` — new: preset storage, signature, CRUD
- `ColumnMappingStep.tsx` — preset banner, save prompt
- `ImportDialog.tsx` — wire preset loading

**Estimated effort**: 1–2 sessions.

### Phase 5: Excel Support (Low effort, High value for UX)

**Scope**:
- Add `xlsx` package (dynamic import).
- Parse `.xlsx` files in `ImportPasteStep` file handler.
- Update file input accept list.

**Files changed**:
- `ImportPasteStep.tsx` — file type handling
- `import-parsers.ts` — `parseExcelFile` function
- `package.json` — add `xlsx` dependency

**Estimated effort**: 1 session.

---

## 9. File Structure After All Phases

```
src/features/settings/import/
  import-parsers.ts          ← extended aliases, fuzzy matching, header row detection
  import-normalizers.ts      ← NEW: value normalization (category, rank, qty, ID, phone)
  import-presets.ts          ← NEW: localStorage preset CRUD, header signatures
  import-runner.ts           ← unchanged
  import-types.ts            ← extended with HeaderMatch, NormalizedValue, ValidationIssue
  ImportDialog.tsx            ← updated: 3-step flow, preset wiring
  ImportPasteStep.tsx         ← updated: .xlsx support
  ColumnMappingStep.tsx       ← NEW: mapping review UI
  ColumnMappingRow.tsx        ← NEW: single mapping row with dropdown
  ImportReviewStep.tsx        ← updated: warning support
  ImportPreviewTable.tsx      ← updated: warning indicators
  ImportSection.tsx           ← unchanged
  import-parsers.test.ts     ← extended
```

---

## 10. Key Type Definitions Summary

```ts
// import-types.ts additions

type HeaderMatchMethod = "exact" | "fuzzy" | "inferred"

type HeaderMatch = {
  field: string
  columnIndex: number
  confidence: number
  matchedAlias: string
  method: HeaderMatchMethod
}

type HeaderDetectionResult = {
  headerRowIndex: number
  mappings: HeaderMatch[]
  unmappedColumns: number[]
  unmappedFields: string[]
}

type NormalizedValue = {
  value: string | number
  original: string
  wasNormalized: boolean
  confidence: number
}

type ValidationSeverity = "error" | "warning"

type ValidationIssue = {
  field: string
  message: string
  severity: ValidationSeverity
}

type ImportPreset = {
  id: string
  name: string
  entity: ImportEntity
  headerSignature: string
  mapping: ColumnMapping
  headerLabels: string[]
  createdAt: string
  lastUsedAt: string
}
```

---

## 11. Dependencies

| Package | Purpose | Size | Phase |
|---------|---------|------|-------|
| `xlsx` (sheetjs) | Parse `.xlsx` files in browser | ~250KB gzipped (mini build) | Phase 5 |

No other external dependencies. Levenshtein, hashing, and normalization are all hand-written (< 50 lines each). This keeps the $0 budget constraint and avoids bloat.

---

## 12. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| `xlsx` bundle size | Dynamic import — only loaded when user selects `.xlsx` file |
| Fuzzy matching false positives | Column Mapping Review step lets user override before import |
| Normalization corrupts data | Always preserve `original` value; show normalization diff in review |
| localStorage preset corruption | Validate on read, discard invalid entries, cap at 20 presets |
| Performance on 500 rows | All normalization is synchronous string ops — negligible even at 500 rows |
