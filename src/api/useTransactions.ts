import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { Transaction, TransactionType, TransactionLineItem } from "../types"

export const useTransactions = (activityId: string) =>
  useQuery({
    queryKey: ["transactions", activityId],
    queryFn: () =>
      api.post<Transaction[]>("tx.list", { activityId }),
    enabled: !!activityId,
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
  txType: TransactionType
  performedBy: string
  performedAt: string
  items: TransactionLineItem[]
  signatureUrl: string
}
