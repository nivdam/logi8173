import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import { ACTIVE_POLL_MS } from "./polling"
import type { Activity, ActivityDetails, ActivityType } from "../types"

export const useActivities = () =>
  useQuery({
    queryKey: ["activities"],
    queryFn: () => api.get<Activity[]>("activities.list"),
    refetchInterval: ACTIVE_POLL_MS,
    staleTime: ACTIVE_POLL_MS,
  })

export const useActivity = (activityId: string | undefined) =>
  useQuery({
    queryKey: ["activities", activityId],
    queryFn: () => api.post<ActivityDetails>("activities.get", { activityId }),
    enabled: !!activityId,
    refetchInterval: ACTIVE_POLL_MS,
    staleTime: ACTIVE_POLL_MS,
  })

export const useOpenActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: OpenActivityInput) =>
      api
        .protectedPost<Activity | Activity[]>("activities.open", input)
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
      api.protectedPost<ActivityDetails>("activities.addItems", input),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      queryClient.invalidateQueries({ queryKey: ["activities", variables.activityId] })
      queryClient.invalidateQueries({ queryKey: ["activityInventory", variables.activityId] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useCloseActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CloseActivityInput) =>
      api.protectedPost<{ activityId: string; status: string; closedAt: string }>(
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

export const useReopenActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ReopenActivityInput) =>
      api.protectedPost<{ activityId: string; status: string; reopenedAt: string }>(
        "activities.reopen",
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

type ReopenActivityInput = {
  activityId: string
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
