import type { InventoryItem, ItemCategory, ItemStatus, Soldier } from "../types"

export const filterInventory = (
  items: InventoryItem[],
  query: string,
  category: ItemCategory | undefined,
  status: ItemStatus | undefined,
): InventoryItem[] => {
  const lowerQuery = query.toLowerCase()

  return items.filter((item) => {
    if (category && item.category !== category) return false
    if (status && item.status !== status) return false
    if (lowerQuery && !item.name.toLowerCase().includes(lowerQuery) && !item.itemNumber.includes(lowerQuery)) return false
    return true
  })
}

export const filterSoldiers = (
  soldiers: Soldier[],
  query: string,
  company: string | undefined,
): Soldier[] => {
  const lowerQuery = query.toLowerCase()

  return soldiers.filter((soldier) => {
    if (company && soldier.company !== company) return false
    if (lowerQuery && !soldier.fullName.toLowerCase().includes(lowerQuery) && !soldier.personalId.includes(lowerQuery)) return false
    return true
  })
}
