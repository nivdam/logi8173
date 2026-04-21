import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import { ADMIN_POLL_MS } from "./polling"
import type { Soldier } from "../types"

export const useSoldiers = () =>
  useQuery({
    queryKey: ["soldiers"],
    queryFn: () => api.get<Soldier[]>("soldiers.list"),
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
