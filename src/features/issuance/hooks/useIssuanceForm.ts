import { useReducer } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../../lib/use-auth"
import { useCreateTransaction } from "../../../api"
import { showApiErrorToast } from "../../../lib/api-error"
import { t } from "../../../lib/i18n"
import { toaster } from "../../../lib/toaster"
import { useDraftPersistence } from "../../../lib/use-draft-persistence"
import {
  mapLinesToTransactionItems,
  getFilledLines,
  hasLineErrors,
} from "../issuance.utils"
import { createInitialState, issuanceFormReducer } from "./issuanceFormReducer"
import type { InventoryItem } from "../../../types/inventory"
import type { Soldier } from "../../../types"
import type { IssuanceLineItem } from "../issuance.types"
import type { IssuanceFormState } from "./issuanceFormReducer"

const serializeIssuanceState = (formState: IssuanceFormState) => ({
  ...formState,
  receiverSignature: "",
  giverSignature: "",
})

export const useIssuanceForm = () => {
  const { operator, operatorProfile } = useAuth()
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()
  const createTransaction = useCreateTransaction()

  const [state, dispatch] = useReducer(issuanceFormReducer, undefined, createInitialState)

  const savedSignature = operatorProfile?.savedSignature || operator?.savedSignatureUrl
  const hasGiverSignature = state.giverSignature !== "" || !!savedSignature
  const filledLines = getFilledLines(state.lines)
  const hasValidLines = filledLines.length > 0 && !filledLines.some(hasLineErrors)

  const isFormDirty =
    state.receiver !== undefined ||
    filledLines.length > 0 ||
    state.globalNotes !== "" ||
    state.receiverSignature !== "" ||
    state.giverSignature !== ""

  const isFormValid =
    state.activityId !== undefined &&
    state.receiver !== undefined &&
    hasValidLines &&
    state.receiverSignature !== "" &&
    hasGiverSignature

  const totalItemCount = filledLines.reduce((sum, line) => sum + line.qty, 0)

  const draft = useDraftPersistence("draft:issuance", state, isFormDirty, state.showSuccess, serializeIssuanceState)

  const handleRestoreDraft = () => {
    if (!draft.savedDraft) return
    dispatch({ type: "RESTORE_DRAFT", payload: draft.savedDraft })
    draft.dismissDraft()
  }

  const handleDiscardDraft = () => {
    draft.clearDraft()
  }

  const handleSelectReceiver = (soldier: Soldier) => {
    dispatch({ type: "SET_RECEIVER", payload: soldier })
  }

  const handleClearReceiver = () => {
    dispatch({ type: "SET_RECEIVER", payload: undefined })
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

  const handleSetReceiverSignature = (base64: string) => {
    dispatch({ type: "SET_RECEIVER_SIGNATURE", payload: base64 })
  }

  const handleSetGiverSignature = (base64: string) => {
    dispatch({ type: "SET_GIVER_SIGNATURE", payload: base64 })
  }

  const handleSelectActivity = (activityId: string) => {
    dispatch({ type: "SET_ACTIVITY", payload: activityId })
  }

  const handleSubmit = () => {
    if (createTransaction.isPending) return
    if (!state.activityId || !state.receiver || !operator) return

    const transactionItems = mapLinesToTransactionItems(state.lines)
    if (transactionItems.length === 0) return

    const giverSignatureValue = state.giverSignature || savedSignature || ""

    createTransaction.mutate(
      {
        activityId: state.activityId,
        txType: "issue",
        performedAt: state.performedAt,
        giverPersonalId: operatorProfile?.personalId || operator.email,
        giverName: operatorProfile?.fullName || operator.fullName,
        receiverPersonalId: state.receiver.personalId,
        receiverName: state.receiver.fullName,
        items: transactionItems,
        notes: state.globalNotes || undefined,
        signatureBase64: state.receiverSignature,
        giverSignatureBase64: giverSignatureValue || undefined,
        clientTxId: state.clientTxId,
      },
      {
        onSuccess: (result) => {
          if (result.status === "duplicate") {
            toaster.create({
              title: t("common.success"),
              description: t("issuance.submitDuplicate"),
              type: "info",
              duration: 5000,
            })
          }
          setSearchParams({ id: result.txId }, { replace: true })
          dispatch({ type: "SHOW_SUCCESS", payload: { formId: result.formNumber || result.txId, txId: result.txId } })
        },
        onError: (error) => {
          showApiErrorToast({
            actionLabel: t("issuance.submitIssuance"),
            error,
            fallbackMessage: t("issuance.submitError"),
          })
        },
      },
    )
  }

  const handleNewIssuance = () => {
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
    handleSelectActivity,
    handleSelectReceiver,
    handleClearReceiver,
    handleSetPerformedAt,
    handleAddEmptyLine,
    handleBindLineToItem,
    handleUpdateLineField,
    handleDuplicateLine,
    handleRemoveLine,
    handleSetGlobalNotes,
    handleExpandedLineIdsChange,
    handleSetReceiverSignature,
    handleSetGiverSignature,
    handleSubmit,
    handleNewIssuance,
    handleBackToDashboard,
  }
}
