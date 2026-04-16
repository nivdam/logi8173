import { useState, useCallback } from "react"
import type { InventoryItem } from "../../types"

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
}

const createEmptyRow = (): EditableRow => ({
  ...EMPTY_ROW,
  itemId: "new_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
})

const isRowValid = (row: EditableRow): boolean => {
  if (row.name.trim() === "") return false
  if (row.category.trim() === "") return false
  if (row.currentQty < 0) return false
  return true
}

export const useEditableInventory = (serverItems: InventoryItem[]) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editableRows, setEditableRows] = useState<EditableRow[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])

  const startEditing = useCallback(() => {
    setEditableRows(
      serverItems.map((item) => ({ ...item, changeType: "unchanged" })),
    )
    setDeletedIds([])
    setIsEditing(true)
  }, [serverItems])

  const cancelEditing = useCallback(() => {
    setEditableRows([])
    setDeletedIds([])
    setIsEditing(false)
  }, [])

  const updateField = useCallback(
    (itemId: string, field: EditableField, value: string | number) => {
      setEditableRows((previous) =>
        previous.map((row) => {
          if (row.itemId !== itemId) return row
          const nextChangeType =
            row.changeType === "added" ? "added" : "modified"
          return { ...row, [field]: value, changeType: nextChangeType }
        }),
      )
    },
    [],
  )

  const addRow = useCallback(() => {
    setEditableRows((previous) => [createEmptyRow(), ...previous])
  }, [])

  const deleteRow = useCallback((itemId: string) => {
    setEditableRows((previous) =>
      previous.filter((row) => row.itemId !== itemId),
    )

    const isNewRow = itemId.startsWith("new_")
    if (!isNewRow) {
      setDeletedIds((previous) => [...previous, itemId])
    }
  }, [])

  const modifiedRows = editableRows.filter(
    (row) => row.changeType === "modified",
  )
  const addedRows = editableRows.filter((row) => row.changeType === "added")
  const changeCount = modifiedRows.length + addedRows.length + deletedIds.length
  const hasChanges = changeCount > 0

  const hasValidationErrors = editableRows.some(
    (row) => row.changeType !== "unchanged" && !isRowValid(row),
  )

  const canSave = hasChanges && !hasValidationErrors

  const buildPayload = (): BatchUpdatePayload => ({
    modified: modifiedRows.map(stripChangeType),
    added: addedRows.map(stripChangeType),
    deleted: deletedIds,
  })

  return {
    isEditing,
    editableRows,
    changeCount,
    hasChanges,
    canSave,
    hasValidationErrors,
    startEditing,
    cancelEditing,
    updateField,
    addRow,
    deleteRow,
    buildPayload,
  }
}

const stripChangeType = (row: EditableRow): InventoryItem => {
  const { changeType: _changeType, ...item } = row
  return item
}

type ChangeType = "unchanged" | "modified" | "added"

type EditableRow = InventoryItem & {
  changeType: ChangeType
}

type EditableField = keyof Pick<
  InventoryItem,
  "name" | "itemNumber" | "category" | "currentQty" | "unitOfMeasure" | "notes" | "minThreshold"
>

type BatchUpdatePayload = {
  modified: InventoryItem[]
  added: InventoryItem[]
  deleted: string[]
}

export type { EditableRow, EditableField, BatchUpdatePayload, ChangeType }
