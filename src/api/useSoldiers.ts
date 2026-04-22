import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import { ADMIN_POLL_MS } from "./polling"
import type { Soldier } from "../types"

export const useSoldiers = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["soldiers"],
    queryFn: () => api.get<Soldier[]>("soldiers.list"),
    enabled: options?.enabled ?? true,
    refetchInterval: ADMIN_POLL_MS,
    staleTime: ADMIN_POLL_MS,
  })

export const useActivitySoldiers = (
  activityId: string | undefined,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ["activitySoldiers", activityId],
    queryFn: () => api.post<Soldier[]>("activitySoldiers.list", { activityId }),
    enabled: !!activityId && (options?.enabled ?? true),
    refetchInterval: ADMIN_POLL_MS,
    staleTime: ADMIN_POLL_MS,
  })

export const useUpsertSoldier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (soldier: UpsertSoldierInput) =>
      api.post<{ personalId: string; fullName: string }>("soldiers.upsert", soldier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soldiers"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useUpsertActivitySoldier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (soldier: ActivitySoldierInput) =>
      api.post<{ personalId: string; fullName: string }>("activitySoldiers.upsert", soldier),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activitySoldiers", variables.activityId] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

type UpsertSoldierInput = {
  personalId: string
  fullName: string
  rank: string
  company: string
  platoon?: string
  phone?: string
}

type ActivitySoldierInput = UpsertSoldierInput & {
  activityId: string
}
