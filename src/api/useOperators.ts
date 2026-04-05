import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { AuthenticatedOperator, OperatorRole } from "../lib/auth.types"

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
  })

export const useUpsertOperator = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpsertOperatorInput) =>
      api.post<{ email: string; fullName: string; role: string }>(
        "operators.upsert",
        input,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] })
    },
  })
}

type UpsertOperatorInput = {
  email: string
  fullName: string
  role: OperatorRole
  savedSignatureUrl?: string
}
