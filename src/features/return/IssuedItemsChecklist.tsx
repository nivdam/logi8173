import { Badge, Box, Button, Checkbox, Flex, Heading, Spinner, Stack, Text } from "@chakra-ui/react"
import { PackageCheck } from "lucide-react"
import { t } from "../../lib/i18n"
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

const IssuedItemRow = ({ item, isSelected, onToggle }: IssuedItemRowProps) => {
  const handleCheckedChange = () => {
    onToggle()
  }

  return (
    <Checkbox.Root
      checked={isSelected}
      onCheckedChange={handleCheckedChange}
      width="100%"
    >
      <Checkbox.HiddenInput />
      <Flex
        align="center"
        gap="3"
        px="3"
        py="2"
        borderRadius="lg"
        bg={isSelected ? "sage.50" : "bg.muted"}
        borderWidth="1px"
        borderColor={isSelected ? "sage.300" : "transparent"}
        cursor="pointer"
        width="100%"
      >
        <Checkbox.Control />
        <Flex flex="1" direction={{ base: "column", md: "row" }} gap={{ base: "1", md: "3" }} align={{ md: "center" }}>
          <Flex flex="1" direction="column" gap="0.5">
            <Checkbox.Label>
              <Text textStyle="sm" fontWeight="500">{item.name}</Text>
            </Checkbox.Label>
            {item.catalogNumber !== "" && (
              <Text textStyle="xs" color="fg.muted">{item.catalogNumber}</Text>
            )}
          </Flex>
          <Flex gap="3" align="center" flexShrink={0}>
            <Flex direction="column" align="center">
              <Text textStyle="xs" color="fg.muted">{t("returns.remainingQty")}</Text>
              <Text textStyle="sm" fontWeight="600" color="sage.700">
                {item.remainingQty} {item.unitOfMeasure}
              </Text>
            </Flex>
            {item.returnedQty > 0 && (
              <Flex direction="column" align="center">
                <Text textStyle="xs" color="fg.muted">{t("returns.returnedQty")}</Text>
                <Text textStyle="xs" color="fg.muted">
                  {item.returnedQty}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Checkbox.Root>
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

type IssuedItemRowProps = {
  item: SoldierIssuedItem
  isSelected: boolean
  onToggle: () => void
}
