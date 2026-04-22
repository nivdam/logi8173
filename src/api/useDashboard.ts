import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { ACTIVE_POLL_MS } from "./polling"
import type { DashboardSummary } from "../types"

export const useDashboard = (activityId?: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["dashboard", activityId ?? "master"],
    queryFn: () =>
      activityId
        ? api.post<DashboardSummary>("dashboard.summary", { activityId })
        : api.get<DashboardSummary>("dashboard.summary"),
    refetchInterval: ACTIVE_POLL_MS,
    staleTime: ACTIVE_POLL_MS,
    enabled: options?.enabled ?? true,
  })
