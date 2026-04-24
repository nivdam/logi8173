import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import { ACTIVE_POLL_MS } from "./polling"
import type { InventoryItem } from "../types"

export const useInventory = () =>
  useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.get<InventoryItem[]>("inventory.list"),
    refetchInterval: ACTIVE_POLL_MS,
    staleTime: ACTIVE_POLL_MS,
  })

export const useUpsertInventoryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item: UpsertInventoryItemInput) =>
      api.protectedPost<{ itemId: string; name: string }>("inventory.upsert", item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useBatchUpdateInventory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BatchUpdateInventoryInput) =>
      api.protectedPost<BatchUpdateInventoryResult>("inventory.batchUpdate", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useActivityInventory = (
  activityId: string | undefined,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ["activityInventory", activityId],
    queryFn: () =>
      api.post<InventoryItem[]>("activityInventory.list", { activityId }),
    enabled: !!activityId && (options?.enabled ?? true),
    refetchInterval: ACTIVE_POLL_MS,
    staleTime: ACTIVE_POLL_MS,
  })

export const useBatchUpdateActivityInventory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BatchUpdateActivityInventoryInput) =>
      api.protectedPost<BatchUpdateInventoryResult>("activityInventory.batchUpdate", payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activityInventory", variables.activityId] })
      queryClient.invalidateQueries({ queryKey: ["activities", variables.activityId] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

type UpsertInventoryItemInput = {
  itemId?: string
  itemNumber?: string
  name: string
  category: string
  tags?: string[]
  unitOfMeasure?: string
  initialQty?: number
  minThreshold?: number
  notes?: string
}

type BatchUpdateInventoryInput = {
  modified: Record<string, string | number | string[]>[]
  added: InventoryItem[]
  deleted: string[]
}

type BatchUpdateActivityInventoryInput = BatchUpdateInventoryInput & {
  activityId: string
}

type BatchUpdateInventoryResult = {
  modified: number
  added: number
  deleted: number
}
