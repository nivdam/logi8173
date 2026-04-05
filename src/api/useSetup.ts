import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { SetupStatus, SetupResult } from "../types"

export const useSetupStatus = () =>
  useQuery({
    queryKey: ["setup", "status"],
    queryFn: () => api.get<SetupStatus>("setup.status"),
    staleTime: Infinity,
  })

export const useInitializeSystem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post<SetupResult>("setup.initialize", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setup"] })
    },
  })
}
