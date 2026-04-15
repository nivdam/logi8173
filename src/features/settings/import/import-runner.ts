import { api } from "../../../lib/api"
import type { ImportRow, ImportResult } from "./import-types"

const THROTTLE_MS = 1000

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const hasImportableData = <T,>(row: ImportRow<T>): row is ImportRow<T> & { data: T } =>
  row.data !== null && (row.status === "will_create" || row.status === "will_update")

export const runImport = async <T extends Record<string, unknown>>(
  endpoint: string,
  rows: ImportRow<T>[],
  onRowUpdate: (index: number, status: "importing" | "imported" | "failed", error?: string) => void,
  shouldCancel: () => boolean,
): Promise<ImportResult> => {
  const importableRows = rows.filter(hasImportableData)
  const result: ImportResult = { createdCount: 0, updatedCount: 0, failedCount: 0, errors: [] }

  for (const row of importableRows) {
    if (shouldCancel()) break

    const originalStatus = row.status
    onRowUpdate(row.index, "importing")

    try {
      await api.post(endpoint, row.data)
      if (shouldCancel()) break
      onRowUpdate(row.index, "imported")

      if (originalStatus === "will_update") {
        result.updatedCount++
      } else {
        result.createdCount++
      }
    } catch (error) {
      if (shouldCancel()) break
      const message = error instanceof Error ? error.message : "שגיאה לא ידועה"
      onRowUpdate(row.index, "failed", message)
      result.failedCount++
      result.errors.push({ index: row.index, message })
    }

    await delay(THROTTLE_MS)
  }

  return result
}
