import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { Company } from "../types"

const POLL_INTERVAL_MS = 60_000

export const useCompanies = () =>
  useQuery({
    queryKey: ["companies"],
    queryFn: () => api.get<Company[]>("companies.list"),
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  })

export const useUpsertCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (company: UpsertCompanyInput) =>
      api.post<{ companyId: string; name: string }>("companies.upsert", company),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
  })
}

type UpsertCompanyInput = {
  companyId?: string
  name: string
  isActive?: boolean
}
