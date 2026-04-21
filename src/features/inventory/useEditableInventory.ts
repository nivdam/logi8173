import { useCallback, useEffect, useState } from "react"
import type { InventoryItem } from "../../types"

const NEW_ROW_PREFIX = "new_"

const EMPTY_ROW: EditableRow = {
  itemId: "",
  itemNumber: "",
  name: "",
  category: "כללי",
  tags: [],
  unitOfMeasure: "יחידה",
  currentQty: 0,
  minThreshold: 0,
  status: "ok",
  notes: "",
  changeType: "added",
  changedFields: new Set(),
}

const createEmptyRow = (): EditableRow => ({
  ...EMPTY_ROW,
  itemId: NEW_ROW_PREFIX + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
})

const toUnchangedRow = (item: InventoryItem): EditableRow => ({
  ...item,
  changeType: "unchanged",
  changedFields: new Set<EditableField>(),
})

const isRowValid = (row: EditableRow): boolean => {
  if (row.name.trim() === "") return false
  if (row.category.trim() === "") return false
  if (row.currentQty < 0) return false
  return true
}

export const useEditableInventory = (serverItems: InventoryItem[]) => {
  const [editableRows, setEditableRows] = useState<EditableRow[]>(() =>
    serverItems.map(toUnchangedRow),
  )
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

  const modifiedRows = editableRows.filter((row) => row.changeType === "modified")
  const addedRows = editableRows.filter((row) => row.changeType === "added")
  const changeCount = modifiedRows.length + addedRows.length + deletedIds.length
  const hasPendingChanges = changeCount > 0

  // Sync drafts from server when there are no pending changes.
  // When dirty, ignore incoming server changes to avoid clobbering user edits.
  useEffect(() => {
    if (hasPendingChanges) return
    setEditableRows(serverItems.map(toUnchangedRow))
  }, [serverItems, hasPendingChanges])

  const updateField = useCallback(
    (itemId: string, field: EditableField, value: string | number) => {
      setEditableRows((previous) =>
        previous.map((row) => {
          if (row.itemId !== itemId) return row
          const nextChangeType: ChangeType =
            row.changeType === "added" ? "added" : "modified"
          const nextChangedFields = new Set(row.changedFields)
          nextChangedFields.add(field)
          return {
            ...row,
            [field]: value,
            changeType: nextChangeType,
            changedFields: nextChangedFields,
          }
        }),
      )
    },
    [],
  )

  const addRow = useCallback(() => {
    const newRow = createEmptyRow()
    setEditableRows((previous) => [newRow, ...previous])
    setExpandedRowId(newRow.itemId)
  }, [])

  const deleteRow = useCallback((itemId: string) => {
    setEditableRows((previous) => previous.filter((row) => row.itemId !== itemId))
    setExpandedRowId((current) => (current === itemId ? null : current))

    const isNewRow = itemId.startsWith(NEW_ROW_PREFIX)
    if (!isNewRow) {
      setDeletedIds((previous) => [...previous, itemId])
    }
  }, [])

  const cancelEditing = useCallback(() => {
    setEditableRows(serverItems.map(toUnchangedRow))
    setDeletedIds([])
    setExpandedRowId(null)
  }, [serverItems])

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedRowId((current) => (current === itemId ? null : itemId))
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedRowId(null)
  }, [])

  const hasValidationErrors = editableRows.some(
    (row) => row.changeType !== "unchanged" && !isRowValid(row),
  )

  const canSave = hasPendingChanges && !hasValidationErrors

  const buildPayload = (): BatchUpdatePayload => ({
    modified: modifiedRows.map(buildModifiedDelta),
    added: addedRows.map(stripEditMetadata),
    deleted: deletedIds,
  })

  return {
    editableRows,
    expandedRowId,
    changeCount,
    hasPendingChanges,
    canSave,
    hasValidationErrors,
    updateField,
    addRow,
    deleteRow,
    cancelEditing,
    toggleExpanded,
    collapseAll,
    buildPayload,
  }
}

const stripEditMetadata = (row: EditableRow): InventoryItem => {
  const { changeType: _changeType, changedFields: _changedFields, ...item } = row
  return item
}

const buildModifiedDelta = (row: EditableRow): Record<string, string | number | string[]> => {
  const delta: Record<string, string | number | string[]> = { itemId: row.itemId }
  row.changedFields.forEach((field) => {
    delta[field] = row[field]
  })
  return delta
}

type ChangeType = "unchanged" | "modified" | "added"

type EditableRow = InventoryItem & {
  changeType: ChangeType
  changedFields: Set<EditableField>
}

type EditableField = keyof Pick<
  InventoryItem,
  "name" | "itemNumber" | "category" | "currentQty" | "unitOfMeasure" | "notes" | "minThreshold"
>

type BatchUpdatePayload = {
  modified: Record<string, string | number | string[]>[]
  added: InventoryItem[]
  deleted: string[]
}

export type { EditableRow, EditableField, BatchUpdatePayload, ChangeType }
