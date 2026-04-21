import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { Transaction, TransactionType, TransactionLineItem, PublicTransaction } from "../types"

const TRANSACTIONS_POLL_MS = 10_000

export const useTransactions = (activityId: string) =>
  useQuery({
    queryKey: ["transactions", activityId],
    queryFn: () =>
      api.post<Transaction[]>("tx.list", { activityId }),
    enabled: !!activityId,
    refetchInterval: TRANSACTIONS_POLL_MS,
    staleTime: TRANSACTIONS_POLL_MS,
  })

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      api.post<CreateTransactionResult>("tx.create", input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.activityId],
      })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
  })
}

type CreateTransactionInput = {
  activityId: string
  txType: TransactionType
  performedAt?: string
  giverPersonalId?: string
  giverName?: string
  receiverPersonalId?: string
  receiverName?: string
  items: TransactionLineItem[]
  notes?: string
  signatureBase64?: string
  giverSignatureBase64?: string
  clientTxId?: string
}

type CreateTransactionResult = {
  txId: string
  formNumber?: string
  status?: "duplicate"
  txType?: TransactionType
  performedBy?: string
  performedAt?: string
  items?: TransactionLineItem[]
  signatureUrl?: string
}

export const usePublicTransaction = (activityId: string, txId: string) =>
  useQuery({
    queryKey: ["publicTransaction", activityId, txId],
    queryFn: () =>
      api.publicPost<PublicTransaction>("tx.getPublic", { activityId, txId }),
    enabled: !!activityId && !!txId,
    retry: false,
  })
