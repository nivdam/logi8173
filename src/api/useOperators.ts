import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import { ADMIN_POLL_MS } from "./polling"
import type { AuthenticatedOperator, OperatorRole } from "../lib/auth.types"

export const useSetPinnedActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, clientSeq }: SetPinnedActivityInput) =>
      api.post<{ pinnedActivityId: string | undefined; accepted: boolean; appliedClientSeq: number }>(
        "operators.setPinnedActivity",
        { activityId: activityId ?? "", clientSeq },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["operators", "me"] })
    },
  })
}

export const useCurrentOperator = () =>
  useQuery({
    queryKey: ["operators", "me"],
    queryFn: () => api.get<AuthenticatedOperator>("auth.me"),
    staleTime: Infinity,
  })

export const useOperators = () =>
  useQuery({
    queryKey: ["operators"],
    queryFn: () => api.get<AuthenticatedOperator[]>("operators.list"),
    refetchInterval: ADMIN_POLL_MS,
    staleTime: ADMIN_POLL_MS,
  })

export const useUpsertOperator = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpsertOperatorInput) =>
      api.protectedPost<{ email: string; fullName: string; role: string }>(
        "operators.upsert",
        input,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["operators"] })
    },
  })
}

export const useSyncMyProfileSoldier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SyncMyProfileSoldierInput) =>
      api.protectedPost<{ personalId: string; fullName: string; created: boolean }>(
        "operators.syncMyProfile",
        input,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["soldiers"] })
      await queryClient.invalidateQueries({ queryKey: ["activitySoldiers"] })
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useDeleteOperator = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string) =>
      api.protectedPost<{ email: string }>("operators.delete", { email }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["operators"] })
    },
  })
}

type SetPinnedActivityInput = {
  activityId: string | undefined
  clientSeq: number
}

type UpsertOperatorInput = {
  email: string
  fullName: string
  role: OperatorRole
  savedSignatureUrl?: string
}

type SyncMyProfileSoldierInput = {
  personalId: string
  fullName: string
  rank: string
  company: string
  platoon?: string
  phone?: string
}
