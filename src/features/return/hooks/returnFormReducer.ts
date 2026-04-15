import {
  createEmptyLine,
  duplicateLine,
} from "../../issuance/issuance.utils"
import { createLineFromIssuedItem } from "../return.utils"
import type { Soldier } from "../../../types"
import type { InventoryItem } from "../../../types/inventory"
import type { IssuanceLineItem } from "../../issuance/issuance.types"
import type { SoldierIssuedItem } from "../return.types"

export const createInitialState = (): ReturnFormState => ({
  activityId: undefined,
  formId: undefined,
  giver: undefined,
  performedAt: new Date().toISOString(),
  lines: [],
  expandedLineIds: [],
  selectedIssuedItemIds: new Set<string>(),
  globalNotes: "",
  giverSignature: "",
  receiverSignature: "",
  showSuccess: false,
})

const appendLine = (state: ReturnFormState, line: IssuanceLineItem): ReturnFormState => ({
  ...state,
  lines: [...state.lines, line],
  expandedLineIds: [...state.expandedLineIds, line.lineId],
})

export const returnFormReducer = (state: ReturnFormState, action: ReturnFormAction): ReturnFormState => {
  switch (action.type) {
    case "SET_ACTIVITY":
      return {
        ...state,
        activityId: action.payload,
        giver: undefined,
        lines: [],
        expandedLineIds: [],
        selectedIssuedItemIds: new Set<string>(),
        globalNotes: "",
        giverSignature: "",
        receiverSignature: "",
      }

    case "SET_GIVER":
      return {
        ...state,
        giver: action.payload,
        lines: [],
        expandedLineIds: [],
        selectedIssuedItemIds: new Set<string>(),
      }

    case "POPULATE_FROM_ISSUED": {
      const { item, selected } = action.payload
      const nextSelectedIds = new Set(state.selectedIssuedItemIds)

      if (selected) {
        nextSelectedIds.add(item.itemId)
        const newLine = createLineFromIssuedItem(item)
        return {
          ...state,
          selectedIssuedItemIds: nextSelectedIds,
          lines: [...state.lines, newLine],
          expandedLineIds: [...state.expandedLineIds, newLine.lineId],
        }
      }

      nextSelectedIds.delete(item.itemId)
      const remainingLines = state.lines.filter((line) => line.itemId !== item.itemId)
      return {
        ...state,
        selectedIssuedItemIds: nextSelectedIds,
        lines: remainingLines,
        expandedLineIds: state.expandedLineIds.filter(
          (id) => remainingLines.some((line) => line.lineId === id),
        ),
      }
    }

    case "POPULATE_ALL_ISSUED": {
      const { items } = action.payload
      const nextSelectedIds = new Set(items.map((item) => item.itemId))
      const existingLinesByItemId = new Map(
        state.lines
          .filter((line) => line.itemId !== "")
          .map((line) => [line.itemId, line]),
      )

      const newLines = items.map((item) =>
        existingLinesByItemId.get(item.itemId) ?? createLineFromIssuedItem(item),
      )
      const newExpandedIds = newLines
        .filter((line) => !existingLinesByItemId.has(line.itemId))
        .map((line) => line.lineId)

      return {
        ...state,
        selectedIssuedItemIds: nextSelectedIds,
        lines: newLines,
        expandedLineIds: [...state.expandedLineIds, ...newExpandedIds],
      }
    }

    case "CLEAR_ALL_ISSUED":
      return {
        ...state,
        selectedIssuedItemIds: new Set<string>(),
        lines: [],
        expandedLineIds: [],
      }

    case "ADD_EMPTY_LINE":
      return appendLine(state, createEmptyLine())

    case "UPDATE_LINE_FIELD":
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.lineId === action.payload.lineId
            ? { ...line, [action.payload.field]: action.payload.value }
            : line,
        ),
      }

    case "BIND_LINE_TO_ITEM": {
      const { lineId, item } = action.payload
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.lineId === lineId
            ? {
                ...line,
                itemId: item.itemId,
                name: item.name,
                catalogNumber: item.itemNumber,
                unitOfMeasure: item.unitOfMeasure,
                availableQty: item.currentQty,
                maxQty: item.currentQty,
                isCustom: false,
              }
            : line,
        ),
      }
    }

    case "DUPLICATE_LINE": {
      const sourceIndex = state.lines.findIndex((line) => line.lineId === action.payload)
      if (sourceIndex === -1) return state
      const source = state.lines[sourceIndex]
      const duplicated = duplicateLine(source)
      const before = state.lines.slice(0, sourceIndex + 1)
      const after = state.lines.slice(sourceIndex + 1)
      return {
        ...state,
        lines: [...before, duplicated, ...after],
        expandedLineIds: [...state.expandedLineIds, duplicated.lineId],
      }
    }

    case "REMOVE_LINE": {
      const removedLine = state.lines.find((line) => line.lineId === action.payload)
      const remaining = state.lines.filter((line) => line.lineId !== action.payload)
      const nextSelectedIds = new Set(state.selectedIssuedItemIds)
      if (removedLine && nextSelectedIds.has(removedLine.itemId)) {
        nextSelectedIds.delete(removedLine.itemId)
      }
      return {
        ...state,
        lines: remaining,
        expandedLineIds: state.expandedLineIds.filter((id) => id !== action.payload),
        selectedIssuedItemIds: nextSelectedIds,
      }
    }

    case "SET_EXPANDED_LINE_IDS":
      return { ...state, expandedLineIds: action.payload }

    case "SET_PERFORMED_AT":
      return { ...state, performedAt: action.payload }

    case "SET_GLOBAL_NOTES":
      return { ...state, globalNotes: action.payload }

    case "SET_GIVER_SIGNATURE":
      return { ...state, giverSignature: action.payload }

    case "SET_RECEIVER_SIGNATURE":
      return { ...state, receiverSignature: action.payload }

    case "SHOW_SUCCESS":
      return { ...state, showSuccess: true, formId: action.payload }

    case "RESET":
      return createInitialState()
  }
}

export type ReturnFormState = {
  activityId: string | undefined
  formId: string | undefined
  giver: Soldier | undefined
  performedAt: string
  lines: IssuanceLineItem[]
  expandedLineIds: string[]
  selectedIssuedItemIds: Set<string>
  globalNotes: string
  giverSignature: string
  receiverSignature: string
  showSuccess: boolean
}

export type ReturnFormAction =
  | { type: "SET_ACTIVITY"; payload: string }
  | { type: "SET_GIVER"; payload: Soldier | undefined }
  | { type: "SET_PERFORMED_AT"; payload: string }
  | { type: "ADD_EMPTY_LINE" }
  | { type: "UPDATE_LINE_FIELD"; payload: { lineId: string; field: keyof IssuanceLineItem; value: string | number | boolean } }
  | { type: "BIND_LINE_TO_ITEM"; payload: { lineId: string; item: InventoryItem } }
  | { type: "DUPLICATE_LINE"; payload: string }
  | { type: "REMOVE_LINE"; payload: string }
  | { type: "SET_EXPANDED_LINE_IDS"; payload: string[] }
  | { type: "SET_GLOBAL_NOTES"; payload: string }
  | { type: "SET_GIVER_SIGNATURE"; payload: string }
  | { type: "SET_RECEIVER_SIGNATURE"; payload: string }
  | { type: "POPULATE_FROM_ISSUED"; payload: { item: SoldierIssuedItem; selected: boolean } }
  | { type: "POPULATE_ALL_ISSUED"; payload: { items: SoldierIssuedItem[] } }
  | { type: "CLEAR_ALL_ISSUED" }
  | { type: "SHOW_SUCCESS"; payload: string }
  | { type: "RESET" }
