import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { OnlineOperator } from "../types"

const POLL_INTERVAL_MS = 30_000

export const useOnlineOperators = () =>
  useQuery({
    queryKey: ["presence", "online"],
    queryFn: () => api.get<OnlineOperator[]>("presence.getOnline"),
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  })
