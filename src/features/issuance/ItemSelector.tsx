import { useState } from "react"
import { Flex, Text, VStack } from "@chakra-ui/react"
import { PackageSearch } from "lucide-react"
import { SearchInput } from "../../components/SearchInput"
import { EmptyState } from "../../components/EmptyState"
import { useInventory } from "../../api"
import { t } from "../../lib/i18n"
import { ItemSelectorRow } from "./ItemSelectorRow"
import type { ItemCondition, SelectedItem } from "./issuance.types"

export const ItemSelector = ({ selectedItems, onUpdateItem, onChangeCondition }: Props) => {
  const { data: inventoryItems = [] } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = inventoryItems.filter((item) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.itemNumber.toLowerCase().includes(query)
    )
  })

  const selectedCount = selectedItems.reduce((sum, item) => sum + item.selectedQty, 0)

  return (
    <VStack gap="4" align="stretch">
      <Flex justify="space-between" align="center">
        <SearchInput
          onSearch={setSearchQuery}
          placeholder={t("inventory.searchPlaceholder")}
        />
        {selectedCount > 0 && (
          <Text textStyle="sm" fontWeight="600" color="sage.600" flexShrink={0} ps="3">
            {selectedCount} {t("issuance.selectedItems")}
          </Text>
        )}
      </Flex>

      {filtered.length === 0 && searchQuery && (
        <EmptyState
          icon={PackageSearch}
          title={t("inventory.noResultsDescription")}
        />
      )}

      <VStack gap="0" align="stretch">
        {filtered.map((item, index) => {
          const selected = selectedItems.find((selectedItem) => selectedItem.itemId === item.itemId)

          const handleUpdateQty = (itemId: string, qty: number) => {
            onUpdateItem(itemId, item.name, item.currentQty, qty)
          }

          return (
            <ItemSelectorRow
              key={item.itemId}
              itemId={item.itemId}
              name={item.name}
              availableQty={item.currentQty}
              selectedQty={selected?.selectedQty ?? 0}
              condition={selected?.condition ?? "new"}
              index={index}
              onUpdateQty={handleUpdateQty}
              onChangeCondition={onChangeCondition}
            />
          )
        })}
      </VStack>
    </VStack>
  )
}

type Props = {
  selectedItems: SelectedItem[]
  onUpdateItem: (itemId: string, name: string, availableQty: number, qty: number) => void
  onChangeCondition: (itemId: string, condition: ItemCondition) => void
}
