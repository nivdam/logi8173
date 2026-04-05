import { t } from "../../lib/i18n"
import type { ItemCondition } from "./issuance.types"
import type { UnitOfMeasure } from "../../types/inventory"

export const DEFAULT_CONDITION: ItemCondition = "new"
export const DEFAULT_UNIT_OF_MEASURE: UnitOfMeasure = "יחידה"

export const ITEM_CONDITIONS: ItemCondition[] = ["new", "used", "damaged"]

export const getConditionLabel = (condition: ItemCondition): string => {
  const labels: Record<ItemCondition, string> = {
    new: t("issuance.conditionNew"),
    used: t("issuance.conditionUsed"),
    damaged: t("issuance.conditionDamaged"),
  }
  return labels[condition]
}

export const CONDITION_COLOR: Record<ItemCondition, string> = {
  new: "green.600",
  used: "yellow.600",
  damaged: "red.600",
}

export const UNIT_OPTIONS: Array<{ value: UnitOfMeasure; label: string }> = [
  { value: "יחידה", label: "יחידה" },
  { value: "זוג", label: "זוג" },
  { value: "קופסה", label: "קופסה" },
  { value: "ערכה", label: "ערכה" },
  { value: "סט", label: "סט" },
]
