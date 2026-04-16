import { useMemo, useReducer } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../../lib/use-auth"
import { useCreateTransaction, useTransactions } from "../../../api"
import { showApiErrorToast } from "../../../lib/api-error"
import { t } from "../../../lib/i18n"
import { toaster } from "../../../lib/toaster"
import { useDraftPersistence } from "../../../lib/use-draft-persistence"
import {
  getFilledLines,
  hasLineErrors,
  mapLinesToTransactionItems,
} from "../../issuance/issuance.utils"
import { computeSoldierIssuedItems } from "../return.utils"
import { createInitialState, returnFormReducer } from "./returnFormReducer"
import type { InventoryItem } from "../../../types/inventory"
import type { Soldier } from "../../../types"
import type { IssuanceLineItem } from "../../issuance/issuance.types"
import type { SoldierIssuedItem } from "../return.types"
import type { ReturnFormState } from "./returnFormReducer"

const serializeReturnState = (formState: ReturnFormState) => ({
  ...formState,
  selectedIssuedItemIds: Array.from(formState.selectedIssuedItemIds),
  giverSignature: "",
  receiverSignature: "",
})

export const useReturnForm = () => {
  const { operator, operatorProfile } = useAuth()
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()
  const createTransaction = useCreateTransaction()

  const [state, dispatch] = useReducer(returnFormReducer, undefined, createInitialState)

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

  const soldierPersonalId = state.giver?.personalId
  const soldierIssuedItems = useMemo(
    () => soldierPersonalId ? computeSoldierIssuedItems(transactions, soldierPersonalId) : [],
    [transactions, soldierPersonalId],
  )

  const isLoadingIssuedItems = state.giver !== undefined && transactionsQuery.isLoading

  const draft = useDraftPersistence("draft:return", state, isFormDirty, state.showSuccess, serializeReturnState)

  const handleRestoreDraft = () => {
    if (!draft.savedDraft) return
    dispatch({ type: "RESTORE_DRAFT", payload: draft.savedDraft })
    draft.dismissDraft()
  }

  const handleDiscardDraft = () => {
    draft.clearDraft()
  }

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

  const handleSubmit = () => {
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
        clientTxId: state.clientTxId,
      },
      {
        onSuccess: (result) => {
          if (result.status === "duplicate") {
            toaster.create({
              title: t("common.success"),
              description: t("returns.submitDuplicate"),
              type: "info",
              duration: 5000,
            })
          }
          setSearchParams({ id: result.txId }, { replace: true })
          dispatch({ type: "SHOW_SUCCESS", payload: { formId: result.formNumber || result.txId, txId: result.txId } })
        },
        onError: (error) => {
          showApiErrorToast({
            actionLabel: t("returns.submitReturn"),
            error,
            fallbackMessage: t("returns.submitError"),
          })
        },
      },
    )
  }

  const handleNewReturn = () => {
    setSearchParams({}, { replace: true })
    draft.clearDraft()
    dispatch({ type: "RESET" })
  }

  const handleBackToDashboard = () => {
    navigate("/")
  }

  return {
    state,
    isFormValid,
    isFormDirty,
    totalItemCount,
    isSubmitting: createTransaction.isPending,
    hasDraft: draft.hasDraft,
    handleRestoreDraft,
    handleDiscardDraft,
    savedSignature,
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
