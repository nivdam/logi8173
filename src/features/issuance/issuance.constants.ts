import { t } from "../../lib/i18n"
import type { ItemCondition } from "./issuance.types"

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
