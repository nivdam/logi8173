import { DEFAULT_CONDITION, DEFAULT_UNIT_OF_MEASURE } from "./issuance.constants"
import type { InventoryItem } from "../../types/inventory"
import type { IssuanceLineItem } from "./issuance.types"
import type { TransactionLineItem } from "../../types/transaction"

export const createLineFromInventoryItem = (item: InventoryItem): IssuanceLineItem => ({
  lineId: crypto.randomUUID(),
  itemId: item.itemId,
  catalogNumber: item.itemNumber,
  name: item.name,
  qty: 1,
  unitOfMeasure: item.unitOfMeasure,
  condition: DEFAULT_CONDITION,
  notes: "",
  isCustom: false,
  availableQty: item.currentQty,
  maxQty: item.currentQty,
})

export const createEmptyLine = (): IssuanceLineItem => ({
  lineId: crypto.randomUUID(),
  itemId: "",
  catalogNumber: "",
  name: "",
  qty: 1,
  unitOfMeasure: DEFAULT_UNIT_OF_MEASURE,
  condition: DEFAULT_CONDITION,
  notes: "",
  isCustom: false,
  availableQty: 0,
  maxQty: undefined,
})

export const createCustomLine = (name: string): IssuanceLineItem => ({
  lineId: crypto.randomUUID(),
  itemId: "",
  catalogNumber: "",
  name,
  qty: 1,
  unitOfMeasure: DEFAULT_UNIT_OF_MEASURE,
  condition: DEFAULT_CONDITION,
  notes: "",
  isCustom: true,
  availableQty: 0,
  maxQty: undefined,
})

export const duplicateLine = (source: IssuanceLineItem): IssuanceLineItem => ({
  ...source,
  lineId: crypto.randomUUID(),
  qty: 1,
  notes: "",
})

export const getFilledLines = (lines: IssuanceLineItem[]): IssuanceLineItem[] =>
  lines.filter((line) => line.name !== "" && line.qty > 0)

export const hasLineErrors = (line: IssuanceLineItem): boolean =>
  validateLine(line).length > 0

export const mapLinesToTransactionItems = (
  lines: IssuanceLineItem[],
): TransactionLineItem[] =>
  getFilledLines(lines)
    .map((line) => ({
      itemId: line.itemId,
      name: line.name,
      qty: line.qty,
      condition: line.condition,
      unitOfMeasure: line.unitOfMeasure,
      notes: line.notes !== "" ? line.notes : undefined,
      serialNumber: line.catalogNumber !== "" ? line.catalogNumber : undefined,
      isCustom: line.isCustom ? true : undefined,
    }))

export const validateLine = (
  line: IssuanceLineItem,
): Array<{ field: string; message: string }> => {
  const errors: Array<{ field: string; message: string }> = []

  if (!line.isCustom && line.maxQty !== undefined && line.qty > line.maxQty) {
    errors.push({ field: "qty", message: `כמות מקסימלית: ${line.maxQty}` })
  }

  if (line.name === "") {
    errors.push({ field: "name", message: "שם פריט חובה" })
  }

  return errors
}
