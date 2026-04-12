import { useReducer, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../../lib/use-auth"
import { useCreateTransaction } from "../../../api"
import { toaster } from "../../../lib/toaster"
import { t } from "../../../lib/i18n"
import {
  createEmptyLine,
  duplicateLine,
  getFilledLines,
  hasLineErrors,
  mapLinesToTransactionItems,
} from "../../issuance/issuance.utils"
import type { Soldier } from "../../../types"
import type { InventoryItem } from "../../../types/inventory"
import type { IssuanceLineItem } from "../../issuance/issuance.types"

const createInitialState = (): ReturnFormState => ({
  activityId: undefined,
  formId: undefined,
  giver: undefined,
  performedAt: new Date().toISOString(),
  lines: [createEmptyLine()],
  expandedLineIds: [],
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

const reducer = (state: ReturnFormState, action: ReturnFormAction): ReturnFormState => {
  switch (action.type) {
    case "SET_ACTIVITY":
      return {
        ...state,
        activityId: action.payload,
        giver: undefined,
        lines: [createEmptyLine()],
        expandedLineIds: [],
        globalNotes: "",
        giverSignature: "",
        receiverSignature: "",
      }

    case "SET_GIVER":
      return { ...state, giver: action.payload }

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

export const useReturnForm = () => {
  const { operator, operatorProfile } = useAuth()
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()
  const createTransaction = useCreateTransaction()

  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  const savedSignature = operatorProfile?.savedSignature || operator?.savedSignatureUrl
  const hasReceiverSignature = state.receiverSignature !== "" || !!savedSignature
  const filledLines = getFilledLines(state.lines)
  const hasValidLines = filledLines.length > 0 && !filledLines.some(hasLineErrors)

  const isFormDirty =
    state.giver !== undefined ||
    filledLines.length > 0 ||
    state.globalNotes !== "" ||
    state.giverSignature !== "" ||
    state.receiverSignature !== ""

  const isFormValid =
    state.activityId !== undefined &&
    state.giver !== undefined &&
    hasValidLines &&
    state.giverSignature !== "" &&
    hasReceiverSignature

  const totalItemCount = filledLines.reduce((sum, line) => sum + line.qty, 0)

  const handleSelectGiver = (soldier: Soldier) => {
    dispatch({ type: "SET_GIVER", payload: soldier })
  }

  const handleClearGiver = () => {
    dispatch({ type: "SET_GIVER", payload: undefined })
  }

  const handleSetPerformedAt = (iso: string) => {
    dispatch({ type: "SET_PERFORMED_AT", payload: iso })
  }

  const handleAddEmptyLine = () => {
    dispatch({ type: "ADD_EMPTY_LINE" })
  }

  const handleBindLineToItem = (lineId: string, item: InventoryItem) => {
    dispatch({ type: "BIND_LINE_TO_ITEM", payload: { lineId, item } })
  }

  const handleUpdateLineField = (lineId: string, field: keyof IssuanceLineItem, value: string | number | boolean) => {
    dispatch({ type: "UPDATE_LINE_FIELD", payload: { lineId, field, value } })
  }

  const handleDuplicateLine = (lineId: string) => {
    dispatch({ type: "DUPLICATE_LINE", payload: lineId })
  }

  const handleRemoveLine = (lineId: string) => {
    dispatch({ type: "REMOVE_LINE", payload: lineId })
  }

  const handleSetGlobalNotes = (notes: string) => {
    dispatch({ type: "SET_GLOBAL_NOTES", payload: notes })
  }

  const handleExpandedLineIdsChange = (expandedLineIds: string[]) => {
    dispatch({ type: "SET_EXPANDED_LINE_IDS", payload: expandedLineIds })
  }

  const handleSetGiverSignature = (base64: string) => {
    dispatch({ type: "SET_GIVER_SIGNATURE", payload: base64 })
  }

  const handleSetReceiverSignature = (base64: string) => {
    dispatch({ type: "SET_RECEIVER_SIGNATURE", payload: base64 })
  }

  const handleSelectActivity = (activityId: string) => {
    dispatch({ type: "SET_ACTIVITY", payload: activityId })
  }

  const handleSubmit = useCallback(() => {
    if (createTransaction.isPending) return
    if (!state.activityId || !state.giver || !operator) return

    const transactionItems = mapLinesToTransactionItems(state.lines)
    if (transactionItems.length === 0) return

    const receiverSignatureValue = state.receiverSignature || savedSignature || ""

    createTransaction.mutate(
      {
        activityId: state.activityId,
        txType: "return",
        performedAt: state.performedAt,
        giverPersonalId: state.giver.personalId,
        giverName: state.giver.fullName,
        receiverPersonalId: operatorProfile?.personalId || operator.email,
        receiverName: operatorProfile?.fullName || operator.fullName,
        items: transactionItems,
        notes: state.globalNotes || undefined,
        signatureBase64: state.giverSignature,
        giverSignatureBase64: receiverSignatureValue || undefined,
      },
      {
        onSuccess: (result) => {
          setSearchParams({ id: result.txId }, { replace: true })
          dispatch({ type: "SHOW_SUCCESS", payload: result.txId })
        },
        onError: () => {
          toaster.create({
            title: t("common.error"),
            description: t("returns.submitError"),
            type: "error",
            duration: 5000,
          })
        },
      },
    )
  }, [state.activityId, state.giver, state.performedAt, state.lines, state.globalNotes, state.giverSignature, state.receiverSignature, savedSignature, operator, operatorProfile, createTransaction, setSearchParams])

  const handleNewReturn = () => {
    setSearchParams({}, { replace: true })
    dispatch({ type: "RESET" })
  }

  const handleBackToDashboard = useCallback(() => {
    navigate("/")
  }, [navigate])

  return {
    state,
    isFormValid,
    isFormDirty,
    totalItemCount,
    isSubmitting: createTransaction.isPending,
    handleSelectActivity,
    handleSelectGiver,
    handleClearGiver,
    handleSetPerformedAt,
    handleAddEmptyLine,
    handleBindLineToItem,
    handleUpdateLineField,
    handleDuplicateLine,
    handleRemoveLine,
    handleSetGlobalNotes,
    handleExpandedLineIdsChange,
    handleSetGiverSignature,
    handleSetReceiverSignature,
    handleSubmit,
    handleNewReturn,
    handleBackToDashboard,
  }
}

type ReturnFormState = {
  activityId: string | undefined
  formId: string | undefined
  giver: Soldier | undefined
  performedAt: string
  lines: IssuanceLineItem[]
  expandedLineIds: string[]
  globalNotes: string
  giverSignature: string
  receiverSignature: string
  showSuccess: boolean
}

type ReturnFormAction =
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
  | { type: "SHOW_SUCCESS"; payload: string }
  | { type: "RESET" }
