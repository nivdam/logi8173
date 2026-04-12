import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { Activity, ActivityDetails, ActivityType } from "../types"

export const useActivities = () =>
  useQuery({
    queryKey: ["activities"],
    queryFn: () => api.get<Activity[]>("activities.list"),
  })

export const useActivity = (activityId: string | undefined) =>
  useQuery({
    queryKey: ["activities", activityId],
    queryFn: () => api.post<ActivityDetails>("activities.get", { activityId }),
    enabled: !!activityId,
  })

export const useOpenActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: OpenActivityInput) =>
      api
        .post<Activity | Activity[]>("activities.open", input)
        .then(normalizeSingleActivityResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useAddItemsToActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddItemsToActivityInput) =>
      api.post<ActivityDetails>("activities.addItems", input),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      queryClient.invalidateQueries({ queryKey: ["activities", variables.activityId] })
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
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      queryClient.invalidateQueries({ queryKey: ["activities", variables.activityId] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

type OpenActivityInput = {
  name: string
  activityType: ActivityType
  startDate: string
  itemIds: string[]
}

type CloseActivityInput = {
  activityId: string
  endDate?: string
}

type AddItemsToActivityInput = {
  activityId: string
  itemIds: string[]
}

const normalizeSingleActivityResponse = (
  response: Activity | Activity[],
): Activity => {
  if (Array.isArray(response)) {
    if (response.length === 0) {
      throw new Error("activities.open returned an empty activity list")
    }
    return response[0]
  }

  return response
}
