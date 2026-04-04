import { useState } from "react"
import { Flex, VStack } from "@chakra-ui/react"
import { PackageSearch } from "lucide-react"
import { PageHeader } from "../../components/PageHeader"
import { SearchInput } from "../../components/SearchInput"
import { EmptyState } from "../../components/EmptyState"
import { t } from "../../lib/i18n"
import { filterInventory } from "../../lib/filters"
import { inventoryMock } from "../../mocks/inventory.mock"
import { InventoryTable } from "./InventoryTable"
import type { ItemCategory, ItemStatus } from "../../types"

export const InventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<ItemStatus | undefined>(undefined)

  const filteredItems = filterInventory(inventoryMock, searchQuery, categoryFilter, statusFilter)

  return (
    <VStack align="stretch" gap="5">
      <PageHeader title={t("inventory.title")} description={t("inventory.description")} />
      <Flex gap="3" flexWrap="wrap">
        <SearchInput placeholder={t("inventory.searchPlaceholder")} onSearch={setSearchQuery} />
      </Flex>
      {filteredItems.length > 0 ? (
        <InventoryTable items={filteredItems} />
      ) : (
        <EmptyState
          icon={PackageSearch}
          title={t("common.noResults")}
          description={t("inventory.noResultsDescription")}
          actionLabel={t("inventory.clearFilters")}
          onAction={() => {
            setSearchQuery("")
            setCategoryFilter(undefined)
            setStatusFilter(undefined)
          }}
        />
      )}
    </VStack>
  )
}
