type IssuanceStep = "soldier" | "items" | "review" | "success"

type ItemCondition = "new" | "used" | "damaged"

type SelectedItem = {
  itemId: string
  name: string
  availableQty: number
  selectedQty: number
  condition: ItemCondition
}

export type { IssuanceStep, ItemCondition, SelectedItem }
