import { describe, it, expect } from "vitest"
import {
  parseSpreadsheetText,
  detectColumnMapping,
  validateInventoryRows,
  validateSoldierRows,
  hasRequiredInventoryColumns,
  hasRequiredSoldierColumns,
  getMissingColumns,
  INVENTORY_HEADER_ALIASES,
  SOLDIER_HEADER_ALIASES,
} from "./import-parsers"
import type { InventoryItem, Soldier } from "../../../types"

// --- parseSpreadsheetText ---

describe("parseSpreadsheetText", () => {
  it("splits TSV into rows and cells", () => {
    const result = parseSpreadsheetText("a\tb\tc\n1\t2\t3")
    expect(result).toEqual([["a", "b", "c"], ["1", "2", "3"]])
  })

  it("handles Windows line endings", () => {
    const result = parseSpreadsheetText("a\tb\r\n1\t2")
    expect(result).toEqual([["a", "b"], ["1", "2"]])
  })

  it("trims whitespace from cells", () => {
    const result = parseSpreadsheetText(" hello \t world \n foo \t bar ")
    expect(result).toEqual([["hello", "world"], ["foo", "bar"]])
  })

  it("skips empty lines", () => {
    const result = parseSpreadsheetText("a\tb\n\n1\t2\n\n")
    expect(result).toEqual([["a", "b"], ["1", "2"]])
  })

  it("returns empty array for empty input", () => {
    expect(parseSpreadsheetText("")).toEqual([])
    expect(parseSpreadsheetText("   ")).toEqual([])
  })
})

// --- detectColumnMapping ---

describe("detectColumnMapping", () => {
  it("detects Hebrew inventory headers", () => {
    const headers = ["שם פריט", "מק\"ט", "קטגוריה", "כמות"]
    const mapping = detectColumnMapping(headers, INVENTORY_HEADER_ALIASES)
    expect(mapping.name).toBe(0)
    expect(mapping.itemNumber).toBe(1)
    expect(mapping.category).toBe(2)
    expect(mapping.initialQty).toBe(3)
  })

  it("detects Hebrew soldier headers", () => {
    const headers = ["מספר אישי", "שם מלא", "דרגה", "פלוגה", "מחלקה", "טלפון"]
    const mapping = detectColumnMapping(headers, SOLDIER_HEADER_ALIASES)
    expect(mapping.personalId).toBe(0)
    expect(mapping.fullName).toBe(1)
    expect(mapping.rank).toBe(2)
    expect(mapping.company).toBe(3)
    expect(mapping.platoon).toBe(4)
    expect(mapping.phone).toBe(5)
  })

  it("handles reordered columns", () => {
    const headers = ["דרגה", "שם מלא", "פלוגה", "מספר אישי"]
    const mapping = detectColumnMapping(headers, SOLDIER_HEADER_ALIASES)
    expect(mapping.rank).toBe(0)
    expect(mapping.fullName).toBe(1)
    expect(mapping.company).toBe(2)
    expect(mapping.personalId).toBe(3)
  })

  it("returns empty mapping for unrecognized headers", () => {
    const headers = ["עמודה1", "עמודה2"]
    const mapping = detectColumnMapping(headers, INVENTORY_HEADER_ALIASES)
    expect(Object.keys(mapping)).toHaveLength(0)
  })

  it("is case-insensitive for English headers", () => {
    const headers = ["Name", "Category", "Qty"]
    const mapping = detectColumnMapping(headers, INVENTORY_HEADER_ALIASES)
    expect(mapping.name).toBe(0)
    expect(mapping.category).toBe(1)
  })
})

// --- hasRequired / getMissing ---

describe("hasRequiredInventoryColumns", () => {
  it("returns true when name and category are mapped", () => {
    expect(hasRequiredInventoryColumns({ name: 0, category: 1 })).toBe(true)
  })

  it("returns false when category is missing", () => {
    expect(hasRequiredInventoryColumns({ name: 0 })).toBe(false)
  })
})

describe("hasRequiredSoldierColumns", () => {
  it("returns true when all 4 required fields are mapped", () => {
    expect(hasRequiredSoldierColumns({ personalId: 0, fullName: 1, rank: 2, company: 3 })).toBe(true)
  })

  it("returns false when rank is missing", () => {
    expect(hasRequiredSoldierColumns({ personalId: 0, fullName: 1, company: 3 })).toBe(false)
  })
})

describe("getMissingColumns", () => {
  it("returns Hebrew labels for missing fields", () => {
    const missing = getMissingColumns({ personalId: 0 }, ["personalId", "fullName", "rank", "company"])
    expect(missing).toEqual(["שם מלא", "דרגה", "פלוגה"])
  })

  it("returns empty array when all present", () => {
    const missing = getMissingColumns({ name: 0, category: 1 }, ["name", "category"])
    expect(missing).toEqual([])
  })
})

// --- validateInventoryRows ---

describe("validateInventoryRows", () => {
  const existingItems: InventoryItem[] = [
    { itemId: "i1", itemNumber: "5001", name: "וסט מגן", category: "רספאי", tags: [], unitOfMeasure: "יחידה", currentQty: 100, minThreshold: 80, status: "ok", notes: "" },
  ]
  const mapping = { name: 0, itemNumber: 1, category: 2, initialQty: 3 }

  it("validates a correct new row", () => {
    const rows = [["קסדה קרבית", "5002", "רספאי", "50"]]
    const result = validateInventoryRows(rows, mapping, existingItems)
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe("will_create")
    expect(result[0].errors).toEqual([])
    expect(result[0].data?.name).toBe("קסדה קרבית")
    expect(result[0].data?.initialQty).toBe(50)
  })

  it("detects existing item as will_update", () => {
    const rows = [["וסט מגן", "5001", "רספאי", "120"]]
    const result = validateInventoryRows(rows, mapping, existingItems)
    expect(result[0].status).toBe("will_update")
  })

  it("reports missing name", () => {
    const rows = [["", "5003", "רספאי", "10"]]
    const result = validateInventoryRows(rows, mapping, existingItems)
    expect(result[0].status).toBe("invalid")
    expect(result[0].errors).toContain("שם פריט חסר")
  })

  it("reports invalid category", () => {
    const rows = [["פריט", "5003", "קטגוריה_לא_קיימת", "10"]]
    const result = validateInventoryRows(rows, mapping, existingItems)
    expect(result[0].status).toBe("invalid")
    expect(result[0].errors[0]).toContain("קטגוריה לא חוקית")
  })

  it("reports negative quantity", () => {
    const rows = [["פריט", "5003", "כללי", "-5"]]
    const result = validateInventoryRows(rows, mapping, existingItems)
    expect(result[0].status).toBe("invalid")
    expect(result[0].errors).toContain("כמות לא חוקית")
  })

  it("reports non-numeric quantity", () => {
    const rows = [["פריט", "5003", "כללי", "abc"]]
    const result = validateInventoryRows(rows, mapping, existingItems)
    expect(result[0].status).toBe("invalid")
    expect(result[0].errors).toContain("כמות לא חוקית")
  })

  it("allows row without optional fields", () => {
    const rows = [["פריט בסיסי", "", "כללי", ""]]
    const result = validateInventoryRows(rows, mapping, existingItems)
    expect(result[0].status).toBe("will_create")
    expect(result[0].data?.itemNumber).toBeUndefined()
    expect(result[0].data?.initialQty).toBeUndefined()
  })

  it("detects duplicate itemNumber within file", () => {
    const rows = [
      ["פריט א", "9999", "כללי", "10"],
      ["פריט ב", "9999", "כללי", "20"],
    ]
    const result = validateInventoryRows(rows, mapping, existingItems)
    expect(result[0].status).toBe("will_create")
    expect(result[1].status).toBe("duplicate_in_file")
  })
})

// --- validateSoldierRows ---

describe("validateSoldierRows", () => {
  const existingSoldiers: Soldier[] = [
    { personalId: "8001001", fullName: "יוסי כהן", rank: "סמל", company: "פלוגה א'", platoon: "מחלקה 1", phone: "050-1234567", createdAt: "2026-01-15" },
  ]
  const mapping = { personalId: 0, fullName: 1, rank: 2, company: 3, platoon: 4, phone: 5 }

  it("validates a correct new soldier", () => {
    const rows = [["9001001", "דוד כהן", "סמל", "פלוגה א'", "מחלקה 1", "050-1111111"]]
    const result = validateSoldierRows(rows, mapping, existingSoldiers)
    expect(result[0].status).toBe("will_create")
    expect(result[0].data?.personalId).toBe("9001001")
  })

  it("detects existing soldier as will_update", () => {
    const rows = [["8001001", "יוסי כהן", "סמל", "פלוגה א'", "", ""]]
    const result = validateSoldierRows(rows, mapping, existingSoldiers)
    expect(result[0].status).toBe("will_update")
  })

  it("reports missing required fields", () => {
    const rows = [["", "", "", ""]]
    const result = validateSoldierRows(rows, mapping, existingSoldiers)
    expect(result[0].status).toBe("invalid")
    expect(result[0].errors).toContain("מספר אישי חסר")
    expect(result[0].errors).toContain("שם מלא חסר")
    expect(result[0].errors).toContain("דרגה חסרה")
    expect(result[0].errors).toContain("פלוגה חסרה")
  })

  it("reports invalid rank", () => {
    const rows = [["9001001", "דוד כהן", "גנרל", "פלוגה א'", "", ""]]
    const result = validateSoldierRows(rows, mapping, existingSoldiers)
    expect(result[0].status).toBe("invalid")
    expect(result[0].errors[0]).toContain("דרגה לא חוקית")
  })

  it("allows optional platoon and phone to be empty", () => {
    const rows = [["9001001", "דוד כהן", "סמל", "פלוגה א'", "", ""]]
    const result = validateSoldierRows(rows, mapping, existingSoldiers)
    expect(result[0].status).toBe("will_create")
    expect(result[0].data?.platoon).toBeUndefined()
    expect(result[0].data?.phone).toBeUndefined()
  })

  it("detects duplicate personalId within file", () => {
    const rows = [
      ["9002001", "חייל א", "סמל", "פלוגה ב'", "", ""],
      ["9002001", "חייל ב", "טוראי", "פלוגה ג'", "", ""],
    ]
    const result = validateSoldierRows(rows, mapping, existingSoldiers)
    expect(result[0].status).toBe("will_create")
    expect(result[1].status).toBe("duplicate_in_file")
  })
})
