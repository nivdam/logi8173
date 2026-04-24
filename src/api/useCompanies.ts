import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import { REFERENCE_STALE_MS } from "./polling"
import type { Company } from "../types"

export const useCompanies = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["companies"],
    queryFn: () => api.get<Company[]>("companies.list"),
    enabled: options?.enabled ?? true,
    staleTime: REFERENCE_STALE_MS,
    refetchOnWindowFocus: false,
  })

export const useUpsertCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (company: UpsertCompanyInput) =>
      api.protectedPost<{ companyId: string; name: string }>("companies.upsert", company),
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
