import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import { ADMIN_POLL_MS } from "./polling"
import type { Company } from "../types"

export const useCompanies = () =>
  useQuery({
    queryKey: ["companies"],
    queryFn: () => api.get<Company[]>("companies.list"),
    refetchInterval: ADMIN_POLL_MS,
    staleTime: ADMIN_POLL_MS,
  })

export const useUpsertCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (company: UpsertCompanyInput) =>
      api.post<{ companyId: string; name: string }>("companies.upsert", company),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] })
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

type UpsertCompanyInput = {
  companyId?: string
  name: string
  isActive?: boolean
}
