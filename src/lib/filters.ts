import type { InventoryItem, ItemCategory, ItemStatus, Soldier } from "../types"
import type { SortConfig } from "../components/SortableHeader"

export const filterInventory = <T extends InventoryItem>(
  items: T[],
  query: string,
  category: ItemCategory | undefined,
  status: ItemStatus | undefined,
): T[] => {
  const lowerQuery = query.toLowerCase()

  return items.filter((item) => {
    if (category && item.category !== category) return false
    if (status && item.status !== status) return false
    if (lowerQuery && !item.name.toLowerCase().includes(lowerQuery) && !item.itemNumber.includes(lowerQuery)) return false
    return true
  })
}

export const sortInventory = <T extends InventoryItem>(
  items: T[],
  sort: SortConfig,
): T[] => {
  const sorted = [...items].sort((itemA, itemB) => {
    const key = sort.key as keyof InventoryItem
    const valueA = itemA[key]
    const valueB = itemB[key]

    if (typeof valueA === "number" && typeof valueB === "number") {
      return valueA - valueB
    }
    return String(valueA).localeCompare(String(valueB), "he")
  })

  if (sort.direction === "desc") sorted.reverse()
  return sorted
}

export const filterSoldiers = (
  soldiers: Soldier[],
  query: string,
  company: string | undefined,
  platoon: string | undefined,
): Soldier[] => {
  const lowerQuery = query.toLowerCase()

  return soldiers.filter((soldier) => {
    if (company && soldier.company !== company) return false
    if (platoon && soldier.platoon !== platoon) return false
    if (lowerQuery && !soldier.fullName.toLowerCase().includes(lowerQuery) && !String(soldier.personalId).includes(lowerQuery)) return false
    return true
  })
}

export const getUniquePlatoons = (soldiers: Soldier[], company: string | undefined): string[] => {
  const filtered = company ? soldiers.filter((soldier) => soldier.company === company) : soldiers
  const platoons = filtered
    .map((soldier) => soldier.platoon)
    .filter((platoon): platoon is string => platoon !== undefined)
  return [...new Set(platoons)].sort((platoonA, platoonB) => platoonA.localeCompare(platoonB, "he"))
}

export const sortSoldiers = (
  soldiers: Soldier[],
  sort: SortConfig,
): Soldier[] => {
  const sorted = [...soldiers].sort((soldierA, soldierB) => {
    const key = sort.key as keyof Soldier
    const valueA = soldierA[key] ?? ""
    const valueB = soldierB[key] ?? ""
    return String(valueA).localeCompare(String(valueB), "he")
  })

  if (sort.direction === "desc") sorted.reverse()
  return sorted
}
