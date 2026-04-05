import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { Company } from "../types"

export const useCompanies = () =>
  useQuery({
    queryKey: ["companies"],
    queryFn: () => api.get<Company[]>("companies.list"),
  })

export const useUpsertCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (company: UpsertCompanyInput) =>
      api.post<{ companyId: string; name: string }>("companies.upsert", company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
  })
}

type UpsertCompanyInput = {
  companyId?: string
  name: string
  isActive?: boolean
}
