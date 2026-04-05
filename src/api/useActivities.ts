import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { Activity, ActivityType } from "../types"

export const useActivities = () =>
  useQuery({
    queryKey: ["activities"],
    queryFn: () => api.get<Activity[]>("activities.list"),
  })

export const useOpenActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: OpenActivityInput) =>
      api.post<Activity & { folderUrl: string }>("activities.open", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useCloseActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CloseActivityInput) =>
      api.post<{ activityId: string; status: string; closedAt: string }>(
        "activities.close",
        input,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

type OpenActivityInput = {
  name: string
  activityType: ActivityType
  startDate: string
}

type CloseActivityInput = {
  activityId: string
  endDate?: string
}
