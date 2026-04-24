import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { DashboardSummary } from "../types"

export const useDashboard = (activityId?: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["dashboard", activityId ?? "master"],
    queryFn: () =>
      activityId
        ? api.post<DashboardSummary>("dashboard.summary", { activityId })
        : api.get<DashboardSummary>("dashboard.summary"),
    enabled: options?.enabled ?? true,
  })
