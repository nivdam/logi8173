import type { UnitOfMeasure } from "../../types/inventory"

type ItemCondition = "new" | "used" | "damaged"

type IssuanceLineItem = {
  lineId: string
  itemId: string
  catalogNumber: string
  name: string
  qty: number
  unitOfMeasure: UnitOfMeasure
  condition: ItemCondition
  notes: string
  isCustom: boolean
  availableQty: number
}

export type { ItemCondition, IssuanceLineItem }
