import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { DashboardSummary } from "../types"

export const useDashboard = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardSummary>("dashboard.summary"),
  })
