import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { ACTIVE_POLL_MS } from "./polling"
import type { OnlineOperator } from "../types"

export const useOnlineOperators = () =>
  useQuery({
    queryKey: ["presence", "online"],
    queryFn: () => api.get<OnlineOperator[]>("presence.getOnline"),
    refetchInterval: ACTIVE_POLL_MS,
    staleTime: ACTIVE_POLL_MS,
  })
