import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { ACTIVE_POLL_MS } from "./polling"
import type { DashboardSummary } from "../types"

export const useDashboard = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardSummary>("dashboard.summary"),
    refetchInterval: ACTIVE_POLL_MS,
    staleTime: ACTIVE_POLL_MS,
  })
