import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { Soldier } from "../types"

const POLL_INTERVAL_MS = 60_000

export const useSoldiers = () =>
  useQuery({
    queryKey: ["soldiers"],
    queryFn: () => api.get<Soldier[]>("soldiers.list"),
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  })

export const useUpsertSoldier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (soldier: UpsertSoldierInput) =>
      api.post<{ personalId: string; fullName: string }>("soldiers.upsert", soldier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soldiers"] })
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
