import { useReducer, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../../lib/use-auth"
import { useCreateTransaction, useTransactions } from "../../../api"
import { toaster } from "../../../lib/toaster"
import { t } from "../../../lib/i18n"
import {
  createEmptyLine,
  duplicateLine,
  getFilledLines,
  hasLineErrors,
  mapLinesToTransactionItems,
} from "../../issuance/issuance.utils"
import { computeSoldierIssuedItems, createLineFromIssuedItem } from "../return.utils"
import type { Soldier } from "../../../types"
import type { InventoryItem } from "../../../types/inventory"
import type { IssuanceLineItem } from "../../issuance/issuance.types"
import type { SoldierIssuedItem } from "../return.types"

const createInitialState = (): ReturnFormState => ({
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

const reducer = (state: ReturnFormState, action: ReturnFormAction): ReturnFormState => {
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
      const nextSelectedIds = new Set<string>()
      const newLines: IssuanceLineItem[] = []
      const newExpandedIds: string[] = []

      for (const item of items) {
        nextSelectedIds.add(item.itemId)
        const existingLine = state.lines.find((line) => line.itemId === item.itemId)
        if (existingLine) {
          newLines.push(existingLine)
        } else {
          const newLine = createLineFromIssuedItem(item)
          newLines.push(newLine)
          newExpandedIds.push(newLine.lineId)
        }
      }

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

  const transactionsQuery = useTransactions(state.activityId ?? "")
  const transactions = transactionsQuery.data ?? []

  const soldierIssuedItems = state.giver
    ? computeSoldierIssuedItems(transactions, state.giver.personalId)
    : []

  const isLoadingIssuedItems = state.giver !== undefined && transactionsQuery.isLoading

  const handleSelectGiver = (soldier: Soldier) => {
    dispatch({ type: "SET_GIVER", payload: soldier })
  }

  const handleClearGiver = () => {
    dispatch({ type: "SET_GIVER", payload: undefined })
  }

  const handleToggleIssuedItem = (item: SoldierIssuedItem) => {
    const isCurrentlySelected = state.selectedIssuedItemIds.has(item.itemId)
    dispatch({
      type: "POPULATE_FROM_ISSUED",
      payload: { item, selected: !isCurrentlySelected },
    })
  }

  const handleSelectAllIssued = () => {
    dispatch({ type: "POPULATE_ALL_ISSUED", payload: { items: soldierIssuedItems } })
  }

  const handleDeselectAllIssued = () => {
    dispatch({ type: "CLEAR_ALL_ISSUED" })
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
    soldierIssuedItems,
    isLoadingIssuedItems,
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
    handleToggleIssuedItem,
    handleSelectAllIssued,
    handleDeselectAllIssued,
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
  selectedIssuedItemIds: Set<string>
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
  | { type: "POPULATE_FROM_ISSUED"; payload: { item: SoldierIssuedItem; selected: boolean } }
  | { type: "POPULATE_ALL_ISSUED"; payload: { items: SoldierIssuedItem[] } }
  | { type: "CLEAR_ALL_ISSUED" }
  | { type: "SHOW_SUCCESS"; payload: string }
  | { type: "RESET" }
