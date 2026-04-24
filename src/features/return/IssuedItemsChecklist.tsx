import { Badge, Box, Button, Flex, Spinner, Stack, Text } from "@chakra-ui/react"
import { t } from "../../lib/i18n"
import { IssuedItemRow } from "./IssuedItemRow"
import type { SoldierIssuedItem } from "./return.types"

export const IssuedItemsChecklist = ({
  issuedItems,
  selectedItemIds,
  isLoading,
  onToggleItem,
  onSelectAll,
  onDeselectAll,
  onAddManualItem,
}: IssuedItemsChecklistProps) => {
  if (isLoading) {
    return (
      <Flex align="center" justify="center" py="6" gap="3">
        <Spinner size="sm" />
        <Text textStyle="sm" color="fg.muted">{t("returns.loadingIssuedItems")}</Text>
      </Flex>
    )
  }

  if (issuedItems.length === 0) {
    return (
      <Stack gap="3" py="4" align="start">
        <Text textStyle="sm" color="fg.muted">{t("returns.noIssuedItems")}</Text>
        <Text textStyle="xs" color="fg.muted">{t("returns.noIssuedItemsManualHint")}</Text>
        <Button size="sm" variant="outline" onClick={onAddManualItem}>
          {t("returns.addManualItem")}
        </Button>
      </Stack>
    )
  }

  const allSelected = issuedItems.every((item) => selectedItemIds.has(item.itemId))
  const selectedCount = issuedItems.filter((item) => selectedItemIds.has(item.itemId)).length

  return (
    <Box>
      <Flex align="center" justify="space-between" mb="3">
        <Flex align="center" gap="2">
          <Text textStyle="xs" color="fg.muted">
            {t("returns.issuedItemsDescription")}
          </Text>
          <Badge colorPalette="gray" size="sm">
            {issuedItems.length}
          </Badge>
          {selectedCount > 0 && (
            <Badge colorPalette="sky" size="sm">
              {selectedCount} {t("returns.selectedItems")}
            </Badge>
          )}
        </Flex>
        <Flex gap="2">
          <Button
            variant="ghost"
            size="xs"
            onClick={allSelected ? onDeselectAll : onSelectAll}
          >
            {allSelected ? t("returns.deselectAll") : t("returns.selectAll")}
          </Button>
          <Button size="xs" variant="outline" onClick={onAddManualItem}>
            {t("returns.addManualItem")}
          </Button>
        </Flex>
      </Flex>

      <Stack gap="2">
        {issuedItems.map((item) => {
          const isSelected = selectedItemIds.has(item.itemId)
          return (
            <IssuedItemRow
              key={item.itemId}
              item={item}
              isSelected={isSelected}
              onToggle={() => onToggleItem(item)}
            />
          )
        })}
      </Stack>
    </Box>
  )
}

type IssuedItemsChecklistProps = {
  issuedItems: SoldierIssuedItem[]
  selectedItemIds: Set<string>
  isLoading: boolean
  onToggleItem: (item: SoldierIssuedItem) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onAddManualItem: () => void
}
