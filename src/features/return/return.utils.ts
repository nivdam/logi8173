import { DEFAULT_CONDITION, DEFAULT_UNIT_OF_MEASURE } from "../issuance/issuance.constants"
import type { Transaction } from "../../types"
import type { IssuanceLineItem } from "../issuance/issuance.types"
import type { SoldierIssuedItem } from "./return.types"

export const computeSoldierIssuedItems = (
  transactions: Transaction[],
  soldierPersonalId: string,
): SoldierIssuedItem[] => {
  const itemMap = new Map<string, SoldierIssuedItem>()

  for (const tx of transactions) {
    const isIssueToSoldier =
      tx.txType === "issue" && tx.receiverPersonalId === soldierPersonalId
    const isReturnBySoldier =
      tx.txType === "return" && tx.giverPersonalId === soldierPersonalId

    if (!isIssueToSoldier && !isReturnBySoldier) continue

    for (const item of tx.items) {
      const existing = itemMap.get(item.itemId)

      if (existing) {
        if (isIssueToSoldier) {
          existing.issuedQty += item.qty
          existing.condition = item.condition ?? existing.condition
        } else {
          existing.returnedQty += item.qty
        }
        existing.remainingQty = existing.issuedQty - existing.returnedQty
      } else if (isIssueToSoldier) {
        itemMap.set(item.itemId, {
          itemId: item.itemId,
          name: item.name,
          catalogNumber: item.serialNumber ?? "",
          unitOfMeasure: item.unitOfMeasure ?? DEFAULT_UNIT_OF_MEASURE,
          issuedQty: item.qty,
          returnedQty: 0,
          remainingQty: item.qty,
          condition: item.condition ?? DEFAULT_CONDITION,
        })
      }
    }
  }

  return Array.from(itemMap.values()).filter((item) => item.remainingQty > 0)
}

export const createLineFromIssuedItem = (item: SoldierIssuedItem): IssuanceLineItem => ({
  lineId: crypto.randomUUID(),
  itemId: item.itemId,
  catalogNumber: item.catalogNumber,
  name: item.name,
  qty: item.remainingQty,
  unitOfMeasure: item.unitOfMeasure,
  condition: item.condition,
  notes: "",
  isCustom: false,
  availableQty: item.remainingQty,
  maxQty: item.remainingQty,
})
