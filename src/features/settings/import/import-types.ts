type ImportRowStatus =
  | "valid"
  | "invalid"
  | "duplicate_in_file"
  | "will_create"
  | "will_update"
  | "importing"
  | "imported"
  | "failed"

type ImportRow<T> = {
  index: number
  raw: string[]
  data: T | null
  errors: string[]
  status: ImportRowStatus
}

type ImportResult = {
  createdCount: number
  updatedCount: number
  failedCount: number
  errors: Array<{ index: number; message: string }>
}

type ImportEntity = "inventory" | "soldiers"

type ColumnMapping = Record<string, number>

export type { ImportRow, ImportRowStatus, ImportResult, ImportEntity, ColumnMapping }
