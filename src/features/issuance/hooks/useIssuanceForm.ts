import { useReducer, useCallback, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../../lib/auth-context"
import { useCreateTransaction } from "../../../api"
import { toaster } from "../../../lib/toaster"
import { t } from "../../../lib/i18n"
import {
  createLineFromInventoryItem,
  createCustomLine,
  createEmptyLine,
  duplicateLine,
  mapLinesToTransactionItems,
  getFilledLines,
  hasLineErrors,
} from "../issuance.utils"
import type { Soldier } from "../../../types"
import type { InventoryItem } from "../../../types/inventory"
import type { IssuanceLineItem } from "../issuance.types"

type IssuanceFormState = {
  formId: string | undefined
  receiver: Soldier | undefined
  lines: IssuanceLineItem[]
  globalNotes: string
  receiverSignature: string
  giverSignature: string
  showSuccess: boolean
}

type IssuanceFormAction =
  | { type: "SET_RECEIVER"; payload: Soldier | undefined }
  | { type: "ADD_LINE_FROM_INVENTORY"; payload: InventoryItem }
  | { type: "ADD_CUSTOM_LINE"; payload: string }
  | { type: "ADD_EMPTY_LINE" }
  | { type: "UPDATE_LINE_FIELD"; payload: { lineId: string; field: keyof IssuanceLineItem; value: string | number | boolean } }
  | { type: "BIND_LINE_TO_ITEM"; payload: { lineId: string; item: InventoryItem } }
  | { type: "DUPLICATE_LINE"; payload: string }
  | { type: "REMOVE_LINE"; payload: string }
  | { type: "SET_GLOBAL_NOTES"; payload: string }
  | { type: "SET_RECEIVER_SIGNATURE"; payload: string }
  | { type: "SET_GIVER_SIGNATURE"; payload: string }
  | { type: "SHOW_SUCCESS"; payload: string }
  | { type: "RESET" }

const createInitialState = (): IssuanceFormState => ({
  formId: undefined,
  receiver: undefined,
  lines: [createEmptyLine()],
  globalNotes: "",
  receiverSignature: "",
  giverSignature: "",
  showSuccess: false,
})

const reducer = (state: IssuanceFormState, action: IssuanceFormAction): IssuanceFormState => {
  switch (action.type) {
    case "SET_RECEIVER":
      return { ...state, receiver: action.payload }

    case "ADD_LINE_FROM_INVENTORY": {
      const newLine = createLineFromInventoryItem(action.payload)
      return { ...state, lines: [...state.lines, newLine] }
    }

    case "ADD_CUSTOM_LINE": {
      const newLine = createCustomLine(action.payload)
      return { ...state, lines: [...state.lines, newLine] }
    }

    case "ADD_EMPTY_LINE":
      return { ...state, lines: [...state.lines, createEmptyLine()] }

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
      const duplicate = duplicateLine(source)
      const before = state.lines.slice(0, sourceIndex + 1)
      const after = state.lines.slice(sourceIndex + 1)
      return { ...state, lines: [...before, duplicate, ...after] }
    }

    case "REMOVE_LINE": {
      const remaining = state.lines.filter((line) => line.lineId !== action.payload)
      return { ...state, lines: remaining.length === 0 ? [createEmptyLine()] : remaining }
    }

    case "SET_GLOBAL_NOTES":
      return { ...state, globalNotes: action.payload }

    case "SET_RECEIVER_SIGNATURE":
      return { ...state, receiverSignature: action.payload }

    case "SET_GIVER_SIGNATURE":
      return { ...state, giverSignature: action.payload }

    case "SHOW_SUCCESS":
      return { ...state, showSuccess: true, formId: action.payload }

    case "RESET":
      return createInitialState()
  }
}

export const useIssuanceForm = () => {
  const { operator } = useAuth()
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()
  const createTransaction = useCreateTransaction()

  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  // Sync formId to URL after successful submit
  useEffect(() => {
    if (state.formId && state.showSuccess) {
      setSearchParams({ id: state.formId }, { replace: true })
    }
  }, [state.formId, state.showSuccess, setSearchParams])

  const savedSignatureUrl = operator?.savedSignatureUrl
  const hasGiverSignature = state.giverSignature !== "" || (savedSignatureUrl !== undefined && savedSignatureUrl !== "")
  const filledLines = getFilledLines(state.lines)
  const hasValidLines = filledLines.length > 0 && !filledLines.some(hasLineErrors)

  const isFormValid =
    state.receiver !== undefined &&
    hasValidLines &&
    state.receiverSignature !== "" &&
    hasGiverSignature

  const totalItemCount = filledLines.reduce((sum, line) => sum + line.qty, 0)

  const handleSelectReceiver = useCallback((soldier: Soldier) => {
    dispatch({ type: "SET_RECEIVER", payload: soldier })
  }, [])

  const handleClearReceiver = useCallback(() => {
    dispatch({ type: "SET_RECEIVER", payload: undefined })
  }, [])

  const handleAddEmptyLine = useCallback(() => {
    dispatch({ type: "ADD_EMPTY_LINE" })
  }, [])

  const handleBindLineToItem = useCallback((lineId: string, item: InventoryItem) => {
    dispatch({ type: "BIND_LINE_TO_ITEM", payload: { lineId, item } })
  }, [])

  const handleUpdateLineField = useCallback((lineId: string, field: keyof IssuanceLineItem, value: string | number | boolean) => {
    dispatch({ type: "UPDATE_LINE_FIELD", payload: { lineId, field, value } })
  }, [])

  const handleDuplicateLine = useCallback((lineId: string) => {
    dispatch({ type: "DUPLICATE_LINE", payload: lineId })
  }, [])

  const handleRemoveLine = useCallback((lineId: string) => {
    dispatch({ type: "REMOVE_LINE", payload: lineId })
  }, [])

  const handleSetGlobalNotes = useCallback((notes: string) => {
    dispatch({ type: "SET_GLOBAL_NOTES", payload: notes })
  }, [])

  const handleSetReceiverSignature = useCallback((base64: string) => {
    dispatch({ type: "SET_RECEIVER_SIGNATURE", payload: base64 })
  }, [])

  const handleSetGiverSignature = useCallback((base64: string) => {
    dispatch({ type: "SET_GIVER_SIGNATURE", payload: base64 })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!state.receiver || !operator) return

    const transactionItems = mapLinesToTransactionItems(state.lines)
    if (transactionItems.length === 0) return

    const giverSignatureValue = state.giverSignature || savedSignatureUrl || ""

    createTransaction.mutate(
      {
        activityId: "act1",
        txType: "issue",
        giverPersonalId: operator.email,
        giverName: operator.fullName,
        receiverPersonalId: state.receiver.personalId,
        receiverName: state.receiver.fullName,
        items: transactionItems,
        notes: state.globalNotes || undefined,
        signatureBase64: state.receiverSignature,
        giverSignatureBase64: giverSignatureValue || undefined,
      },
      {
        onSuccess: (result) => {
          dispatch({ type: "SHOW_SUCCESS", payload: result.txId })
        },
        onError: () => {
          toaster.create({
            title: t("common.error"),
            description: t("issuance.submitError"),
            type: "error",
            duration: 5000,
          })
        },
      },
    )
  }, [state.receiver, state.lines, state.globalNotes, state.receiverSignature, state.giverSignature, savedSignatureUrl, operator, createTransaction])

  const handleNewIssuance = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  const handleBackToDashboard = useCallback(() => {
    navigate("/")
  }, [navigate])

  return {
    state,
    isFormValid,
    totalItemCount,
    isSubmitting: createTransaction.isPending,
    handleSelectReceiver,
    handleClearReceiver,
    handleAddEmptyLine,
    handleBindLineToItem,
    handleUpdateLineField,
    handleDuplicateLine,
    handleRemoveLine,
    handleSetGlobalNotes,
    handleSetReceiverSignature,
    handleSetGiverSignature,
    handleSubmit,
    handleNewIssuance,
    handleBackToDashboard,
  }
}
