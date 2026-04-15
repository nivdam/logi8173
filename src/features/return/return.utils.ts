import { DEFAULT_CONDITION, DEFAULT_UNIT_OF_MEASURE } from "../issuance/issuance.constants"
import type { Transaction } from "../../types"
import type { IssuanceLineItem } from "../issuance/issuance.types"
import type { SoldierIssuedItem } from "./return.types"

export const computeSoldierIssuedItems = (
  transactions: Transaction[],
  soldierPersonalId: string,
): SoldierIssuedItem[] => {
  const itemMap = new Map<string, SoldierIssuedItem>()

  const issueTransactions = transactions.filter(
    (transaction) => transaction.txType === "issue" && transaction.receiverPersonalId === soldierPersonalId,
  )
  const returnTransactions = transactions.filter(
    (transaction) => transaction.txType === "return" && transaction.giverPersonalId === soldierPersonalId,
  )

  for (const transaction of issueTransactions) {
    for (const item of transaction.items) {
      const existing = itemMap.get(item.itemId)
      if (existing) {
        itemMap.set(item.itemId, {
          ...existing,
          issuedQty: existing.issuedQty + item.qty,
          remainingQty: existing.issuedQty + item.qty - existing.returnedQty,
          condition: item.condition ?? existing.condition,
        })
      } else {
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

  for (const transaction of returnTransactions) {
    for (const item of transaction.items) {
      const existing = itemMap.get(item.itemId)
      if (!existing) continue
      itemMap.set(item.itemId, {
        ...existing,
        returnedQty: existing.returnedQty + item.qty,
        remainingQty: existing.issuedQty - (existing.returnedQty + item.qty),
      })
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
