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
  clientTxId: createClientTxId(),
  formId: undefined,
  serverTxId: undefined,
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
  lines: [...state.lines, line],
  expandedLineIds: [...state.expandedLineIds, line.lineId],
})

export const issuanceFormReducer = (state: IssuanceFormState, action: IssuanceFormAction): IssuanceFormState => {
  switch (action.type) {
    case "SET_RECEIVER":
      return { ...state, receiver: action.payload }

    case "ADD_LINE_FROM_INVENTORY":
      return appendLine(state, createLineFromInventoryItem(action.payload))

    case "ADD_CUSTOM_LINE":
      return appendLine(state, createCustomLine(action.payload))

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
      const remaining = state.lines.filter((line) => line.lineId !== action.payload)
      return {
        ...state,
        lines: remaining.length === 0 ? [createEmptyLine()] : remaining,
        expandedLineIds: state.expandedLineIds.filter((id) => id !== action.payload),
      }
    }

    case "SET_EXPANDED_LINE_IDS":
      return { ...state, expandedLineIds: action.payload }

    case "SET_PERFORMED_AT":
      return { ...state, performedAt: action.payload }

    case "SET_GLOBAL_NOTES":
      return { ...state, globalNotes: action.payload }

    case "SET_RECEIVER_SIGNATURE":
      return { ...state, receiverSignature: action.payload }

    case "SET_GIVER_SIGNATURE":
      return { ...state, giverSignature: action.payload }

    case "SHOW_SUCCESS":
      return { ...state, showSuccess: true, formId: action.payload.formId, serverTxId: action.payload.txId }

    case "REGENERATE_CLIENT_TX_ID":
      return { ...state, clientTxId: createClientTxId() }

    case "RESTORE_DRAFT":
      return {
        ...action.payload,
        showSuccess: false,
        formId: undefined,
        serverTxId: undefined,
      }

    case "RESET":
      return createInitialState()
  }
}

export type IssuanceFormState = {
  clientTxId: string
  formId: string | undefined
  serverTxId: string | undefined
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
  | { type: "SHOW_SUCCESS"; payload: { formId: string; txId: string } }
  | { type: "REGENERATE_CLIENT_TX_ID" }
  | { type: "RESTORE_DRAFT"; payload: IssuanceFormState }
  | { type: "RESET" }
