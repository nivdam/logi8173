import { RANK_OPTIONS } from "../../../lib/rank-options"
import type { InventoryItem, Soldier } from "../../../types"
import type { ImportRow, ColumnMapping } from "./import-types"

// --- Constants ---

const VALID_CATEGORIES = new Set<string>(["רספאי", "קבלר_קרביות", "ציוד_אישי", "אנרגיה", "תקשורת", "כללי"])

export const INVENTORY_HEADER_ALIASES: Record<string, string[]> = {
  name: ["שם", "שם פריט", "פריט", "name"],
  itemNumber: ["מק\"ט", "מקט", "מסט\"ב", "item_number", "itemNumber"],
  category: ["קטגוריה", "סוג", "category"],
  unitOfMeasure: ["יחידת מידה", "יחידה", "unit", "unitOfMeasure"],
  initialQty: ["כמות", "כמות התחלתית", "qty", "initialQty"],
  minThreshold: ["מינימום", "סף מינימום", "min", "minThreshold"],
  notes: ["הערות", "notes"],
}

export const SOLDIER_HEADER_ALIASES: Record<string, string[]> = {
  personalId: ["מספר אישי", "מ.א", "מ.א.", "מא", "personal_id", "personalId"],
  fullName: ["שם מלא", "שם", "name", "fullName"],
  rank: ["דרגה", "rank"],
  company: ["פלוגה", "company"],
  platoon: ["מחלקה", "platoon"],
  phone: ["טלפון", "נייד", "phone"],
}

// --- Parse ---

export const parseSpreadsheetText = (text: string): string[][] => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "")
  return lines.map((line) => line.split("\t").map((cell) => cell.trim()))
}

export const detectColumnMapping = (headerRow: string[], aliases: Record<string, string[]>): ColumnMapping => {
  const mapping: ColumnMapping = {}
  const normalizedHeaders = headerRow.map((header) => header.trim().toLowerCase())

  for (const [field, fieldAliases] of Object.entries(aliases)) {
    const matchIndex = normalizedHeaders.findIndex((header) =>
      fieldAliases.some((alias) => header === alias.toLowerCase()),
    )
    if (matchIndex >= 0) {
      mapping[field] = matchIndex
    }
  }

  return mapping
}

const getCell = (row: string[], mapping: ColumnMapping, field: string): string => {
  const index = mapping[field]
  if (index === undefined) return ""
  return row[index]?.trim() ?? ""
}

// --- Validate Inventory ---

export const validateInventoryRows = (
  rows: string[][],
  mapping: ColumnMapping,
  existingItems: InventoryItem[],
): ImportRow<InventoryUpsertData>[] => {
  const existingByNumber = new Map(
    existingItems
      .filter((item) => item.itemNumber)
      .map((item) => [String(item.itemNumber), item]),
  )
  const seenNumbers = new Set<string>()

  return rows.map((raw, index) => {
    const errors: string[] = []
    const name = getCell(raw, mapping, "name")
    const itemNumber = getCell(raw, mapping, "itemNumber")
    const category = getCell(raw, mapping, "category")
    const unitOfMeasure = getCell(raw, mapping, "unitOfMeasure")
    const initialQtyRaw = getCell(raw, mapping, "initialQty")
    const minThresholdRaw = getCell(raw, mapping, "minThreshold")
    const notes = getCell(raw, mapping, "notes")

    if (!name) errors.push("שם פריט חסר")
    if (!category) {
      errors.push("קטגוריה חסרה")
    } else if (!VALID_CATEGORIES.has(category)) {
      errors.push(`קטגוריה לא חוקית: "${category}"`)
    }

    const parsedInitialQty = Number(initialQtyRaw)
    const initialQty = initialQtyRaw ? parsedInitialQty : undefined
    if (initialQtyRaw && (isNaN(parsedInitialQty) || parsedInitialQty < 0)) {
      errors.push("כמות לא חוקית")
    }

    const parsedMinThreshold = Number(minThresholdRaw)
    const minThreshold = minThresholdRaw ? parsedMinThreshold : undefined
    if (minThresholdRaw && (isNaN(parsedMinThreshold) || parsedMinThreshold < 0)) {
      errors.push("סף מינימום לא חוקי")
    }

    const isDuplicateInFile = itemNumber !== "" && seenNumbers.has(itemNumber)
    if (itemNumber) seenNumbers.add(itemNumber)

    const existsInSystem = itemNumber !== "" && existingByNumber.has(itemNumber)

    if (errors.length > 0) {
      return { index, raw, data: null, errors, status: "invalid" }
    }

    if (isDuplicateInFile) {
      return { index, raw, data: null, errors: [`מק"ט כפול בקובץ: "${itemNumber}"`], status: "duplicate_in_file" }
    }

    const data: InventoryUpsertData = {
      name,
      category,
      ...(itemNumber && { itemNumber }),
      ...(unitOfMeasure && { unitOfMeasure }),
      ...(initialQty !== undefined && { initialQty }),
      ...(minThreshold !== undefined && { minThreshold }),
      ...(notes && { notes }),
    }

    return {
      index,
      raw,
      data,
      errors: [],
      status: existsInSystem ? "will_update" : "will_create",
    }
  })
}

// --- Validate Soldiers ---

export const validateSoldierRows = (
  rows: string[][],
  mapping: ColumnMapping,
  existingSoldiers: Soldier[],
): ImportRow<SoldierUpsertData>[] => {
  const existingByPersonalId = new Set(
    existingSoldiers.map((soldier) => String(soldier.personalId)),
  )
  const seenPersonalIds = new Set<string>()

  return rows.map((raw, index) => {
    const errors: string[] = []
    const personalId = getCell(raw, mapping, "personalId")
    const fullName = getCell(raw, mapping, "fullName")
    const rank = getCell(raw, mapping, "rank")
    const company = getCell(raw, mapping, "company")
    const platoon = getCell(raw, mapping, "platoon")
    const phone = getCell(raw, mapping, "phone")

    if (!personalId) errors.push("מספר אישי חסר")
    if (!fullName) errors.push("שם מלא חסר")
    if (!rank) {
      errors.push("דרגה חסרה")
    } else if (!RANK_OPTIONS.includes(rank)) {
      errors.push(`דרגה לא חוקית: "${rank}"`)
    }
    if (!company) errors.push("פלוגה חסרה")

    const isDuplicateInFile = personalId !== "" && seenPersonalIds.has(personalId)
    if (personalId) seenPersonalIds.add(personalId)

    const existsInSystem = personalId !== "" && existingByPersonalId.has(personalId)

    if (errors.length > 0) {
      return { index, raw, data: null, errors, status: "invalid" }
    }

    if (isDuplicateInFile) {
      return { index, raw, data: null, errors: [`מספר אישי כפול בקובץ: "${personalId}"`], status: "duplicate_in_file" }
    }

    const data: SoldierUpsertData = {
      personalId,
      fullName,
      rank,
      company,
      ...(platoon && { platoon }),
      ...(phone && { phone }),
    }

    return {
      index,
      raw,
      data,
      errors: [],
      status: existsInSystem ? "will_update" : "will_create",
    }
  })
}

// --- Header detection helpers ---

export const hasRequiredInventoryColumns = (mapping: ColumnMapping): boolean =>
  mapping.name !== undefined && mapping.category !== undefined

export const hasRequiredSoldierColumns = (mapping: ColumnMapping): boolean =>
  mapping.personalId !== undefined &&
  mapping.fullName !== undefined &&
  mapping.rank !== undefined &&
  mapping.company !== undefined

const FIELD_LABELS: Record<string, string> = {
  name: "שם פריט",
  category: "קטגוריה",
  personalId: "מספר אישי",
  fullName: "שם מלא",
  rank: "דרגה",
  company: "פלוגה",
}

export const getMissingColumns = (mapping: ColumnMapping, required: string[]): string[] =>
  required.filter((field) => mapping[field] === undefined).map((field) => FIELD_LABELS[field] ?? field)


type InventoryUpsertData = {
  name: string
  category: string
  itemNumber?: string
  unitOfMeasure?: string
  initialQty?: number
  minThreshold?: number
  notes?: string
}

type SoldierUpsertData = {
  personalId: string
  fullName: string
  rank: string
  company: string
  platoon?: string
  phone?: string
}

export type { InventoryUpsertData, SoldierUpsertData }
