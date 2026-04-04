type ItemCategory = "רספאי" | "קבלר_קרביות" | "ציוד_אישי" | "אנרגיה" | "תקשורת" | "כללי"

type UnitOfMeasure = "יחידה" | "זוג" | "קופסה" | "ערכה" | "סט"

type ItemStatus = "ok" | "low" | "gap"

type InventoryItem = {
  itemId: string
  itemNumber: string
  name: string
  category: ItemCategory
  tags: string[]
  unitOfMeasure: UnitOfMeasure
  currentQty: number
  minThreshold: number
  status: ItemStatus
  notes: string
}

export type { InventoryItem, ItemCategory, UnitOfMeasure, ItemStatus }
