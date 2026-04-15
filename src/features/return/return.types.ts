import type { ItemCondition } from "../issuance/issuance.types"
import type { UnitOfMeasure } from "../../types/inventory"

type SoldierIssuedItem = {
  itemId: string
  name: string
  catalogNumber: string
  unitOfMeasure: UnitOfMeasure
  issuedQty: number
  returnedQty: number
  remainingQty: number
  condition: ItemCondition
}

export type { SoldierIssuedItem }
