import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { DashboardSummary } from "../types"

const POLL_INTERVAL_MS = 60_000

export const useDashboard = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardSummary>("dashboard.summary"),
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  })
