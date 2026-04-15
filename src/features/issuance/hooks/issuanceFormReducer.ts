import {
  createLineFromInventoryItem,
  createCustomLine,
  createEmptyLine,
  duplicateLine,
} from "../issuance.utils"
import type { Soldier } from "../../../types"
import type { InventoryItem } from "../../../types/inventory"
import type { IssuanceLineItem } from "../issuance.types"

const createClientTxId = () => crypto.randomUUID()

export const createInitialState = (): IssuanceFormState => ({
  activityId: undefined,
  clientTxId: createClientTxId(),
  formId: undefined,
  receiver: undefined,
  performedAt: new Date().toISOString(),
  lines: [createEmptyLine()],
  expandedLineIds: [],
  globalNotes: "",
  receiverSignature: "",
  giverSignature: "",
  showSuccess: false,
})

const appendLine = (state: IssuanceFormState, line: IssuanceLineItem): IssuanceFormState => ({
  ...state,
  clientTxId: createClientTxId(),
  lines: [...state.lines, line],
  expandedLineIds: [...state.expandedLineIds, line.lineId],
})

export const issuanceFormReducer = (state: IssuanceFormState, action: IssuanceFormAction): IssuanceFormState => {
  switch (action.type) {
    case "SET_ACTIVITY":
      return {
        ...state,
        activityId: action.payload,
        clientTxId: createClientTxId(),
        receiver: undefined,
        lines: [createEmptyLine()],
        expandedLineIds: [],
        globalNotes: "",
        receiverSignature: "",
        giverSignature: "",
      }

    case "SET_RECEIVER":
      return { ...state, clientTxId: createClientTxId(), receiver: action.payload }

    case "ADD_LINE_FROM_INVENTORY":
      return appendLine(state, createLineFromInventoryItem(action.payload))

    case "ADD_CUSTOM_LINE":
      return appendLine(state, createCustomLine(action.payload))

    case "ADD_EMPTY_LINE":
      return appendLine(state, createEmptyLine())

    case "UPDATE_LINE_FIELD":
      return {
        ...state,
        clientTxId: createClientTxId(),
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
        clientTxId: createClientTxId(),
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
        clientTxId: createClientTxId(),
        lines: [...before, duplicated, ...after],
        expandedLineIds: [...state.expandedLineIds, duplicated.lineId],
      }
    }

    case "REMOVE_LINE": {
      const remaining = state.lines.filter((line) => line.lineId !== action.payload)
      return {
        ...state,
        clientTxId: createClientTxId(),
        lines: remaining.length === 0 ? [createEmptyLine()] : remaining,
        expandedLineIds: state.expandedLineIds.filter((id) => id !== action.payload),
      }
    }

    case "SET_EXPANDED_LINE_IDS":
      return { ...state, expandedLineIds: action.payload }

    case "SET_PERFORMED_AT":
      return { ...state, clientTxId: createClientTxId(), performedAt: action.payload }

    case "SET_GLOBAL_NOTES":
      return { ...state, clientTxId: createClientTxId(), globalNotes: action.payload }

    case "SET_RECEIVER_SIGNATURE":
      return { ...state, clientTxId: createClientTxId(), receiverSignature: action.payload }

    case "SET_GIVER_SIGNATURE":
      return { ...state, clientTxId: createClientTxId(), giverSignature: action.payload }

    case "SHOW_SUCCESS":
      return { ...state, showSuccess: true, formId: action.payload }

    case "RESET":
      return createInitialState()
  }
}

export type IssuanceFormState = {
  activityId: string | undefined
  clientTxId: string
  formId: string | undefined
  receiver: Soldier | undefined
  performedAt: string
  lines: IssuanceLineItem[]
  expandedLineIds: string[]
  globalNotes: string
  receiverSignature: string
  giverSignature: string
  showSuccess: boolean
}

export type IssuanceFormAction =
  | { type: "SET_ACTIVITY"; payload: string }
  | { type: "SET_RECEIVER"; payload: Soldier | undefined }
  | { type: "SET_PERFORMED_AT"; payload: string }
  | { type: "ADD_LINE_FROM_INVENTORY"; payload: InventoryItem }
  | { type: "ADD_CUSTOM_LINE"; payload: string }
  | { type: "ADD_EMPTY_LINE" }
  | { type: "UPDATE_LINE_FIELD"; payload: { lineId: string; field: keyof IssuanceLineItem; value: string | number | boolean } }
  | { type: "BIND_LINE_TO_ITEM"; payload: { lineId: string; item: InventoryItem } }
  | { type: "DUPLICATE_LINE"; payload: string }
  | { type: "REMOVE_LINE"; payload: string }
  | { type: "SET_EXPANDED_LINE_IDS"; payload: string[] }
  | { type: "SET_GLOBAL_NOTES"; payload: string }
  | { type: "SET_RECEIVER_SIGNATURE"; payload: string }
  | { type: "SET_GIVER_SIGNATURE"; payload: string }
  | { type: "SHOW_SUCCESS"; payload: string }
  | { type: "RESET" }
