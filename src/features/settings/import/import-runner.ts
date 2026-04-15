import { api } from "../../../lib/api"
import type { ImportRow, ImportResult } from "./import-types"
import type { InventoryUpsertData, SoldierUpsertData } from "./import-parsers"

const THROTTLE_MS = 1000

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const runInventoryImport = async (
  rows: ImportRow<InventoryUpsertData>[],
  onRowUpdate: (index: number, status: "importing" | "imported" | "failed", error?: string) => void,
): Promise<ImportResult> => {
  const importableRows = rows.filter((row) => row.data !== null && (row.status === "will_create" || row.status === "will_update"))
  const result: ImportResult = { createdCount: 0, updatedCount: 0, failedCount: 0, errors: [] }

  for (const row of importableRows) {
    onRowUpdate(row.index, "importing")

    try {
      await api.post("inventory.upsert", row.data)
      onRowUpdate(row.index, "imported")

      if (row.status === "will_update") {
        result.updatedCount++
      } else {
        result.createdCount++
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "שגיאה לא ידועה"
      onRowUpdate(row.index, "failed", message)
      result.failedCount++
      result.errors.push({ index: row.index, message })
    }

    await delay(THROTTLE_MS)
  }

  return result
}

export const runSoldiersImport = async (
  rows: ImportRow<SoldierUpsertData>[],
  onRowUpdate: (index: number, status: "importing" | "imported" | "failed", error?: string) => void,
): Promise<ImportResult> => {
  const importableRows = rows.filter((row) => row.data !== null && (row.status === "will_create" || row.status === "will_update"))
  const result: ImportResult = { createdCount: 0, updatedCount: 0, failedCount: 0, errors: [] }

  for (const row of importableRows) {
    onRowUpdate(row.index, "importing")

    try {
      await api.post("soldiers.upsert", row.data)
      onRowUpdate(row.index, "imported")

      if (row.status === "will_update") {
        result.updatedCount++
      } else {
        result.createdCount++
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "שגיאה לא ידועה"
      onRowUpdate(row.index, "failed", message)
      result.failedCount++
      result.errors.push({ index: row.index, message })
    }

    await delay(THROTTLE_MS)
  }

  return result
}
