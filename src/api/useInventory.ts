import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { InventoryItem } from "../types"

const INVENTORY_POLL_MS = 30_000

export const useInventory = () =>
  useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.get<InventoryItem[]>("inventory.list"),
    refetchInterval: INVENTORY_POLL_MS,
    staleTime: INVENTORY_POLL_MS,
  })

export const useUpsertInventoryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item: UpsertInventoryItemInput) =>
      api.post<{ itemId: string; name: string }>("inventory.upsert", item),
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
      api.post<BatchUpdateInventoryResult>("inventory.batchUpdate", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
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

type BatchUpdateInventoryResult = {
  modified: number
  added: number
  deleted: number
}
