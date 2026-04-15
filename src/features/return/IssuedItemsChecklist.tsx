import { Badge, Box, Button, Flex, Heading, Spinner, Stack, Text } from "@chakra-ui/react"
import { PackageCheck } from "lucide-react"
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
      <Flex align="center" justify="center" py="6">
        <Text textStyle="sm" color="fg.muted">{t("returns.noIssuedItems")}</Text>
      </Flex>
    )
  }

  const allSelected = issuedItems.every((item) => selectedItemIds.has(item.itemId))

  return (
    <Box>
      <Flex align="center" justify="space-between" mb="3">
        <Flex align="center" gap="2">
          <PackageCheck size={16} />
          <Heading size="sm" fontWeight="600">
            {t("returns.issuedItemsTitle")}
          </Heading>
          <Badge colorPalette="sage" size="sm">
            {issuedItems.length}
          </Badge>
        </Flex>
        <Button
          variant="ghost"
          size="xs"
          onClick={allSelected ? onDeselectAll : onSelectAll}
        >
          {allSelected ? t("returns.deselectAll") : t("returns.selectAll")}
        </Button>
      </Flex>

      <Text textStyle="xs" color="fg.muted" mb="3">
        {t("returns.issuedItemsDescription")}
      </Text>

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
}
