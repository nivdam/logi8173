import { useState } from "react"
import { Flex, Text, VStack } from "@chakra-ui/react"
import { PackageSearch } from "lucide-react"
import { PageHeader } from "../../components/PageHeader"
import { SearchInput } from "../../components/SearchInput"
import { FilterSelect } from "../../components/FilterSelect"
import { EmptyState } from "../../components/EmptyState"
import { t } from "../../lib/i18n"
import { filterInventory, sortInventory } from "../../lib/filters"
import { inventoryMock } from "../../mocks/inventory.mock"
import { InventoryTable } from "./InventoryTable"
import type { SortConfig } from "../../components/SortableHeader"
import type { ItemCategory, ItemStatus } from "../../types"

const categoryOptions = [
  { value: "רספאי", label: "רספאי" },
  { value: "קבלר_קרביות", label: "קבלר קרביות" },
  { value: "ציוד_אישי", label: "ציוד אישי" },
  { value: "אנרגיה", label: "אנרגיה" },
  { value: "תקשורת", label: "תקשורת" },
  { value: "כללי", label: "כללי" },
]

const statusOptions = [
  { value: "ok", label: "תקין" },
  { value: "low", label: "מלאי נמוך" },
  { value: "gap", label: "חוסר" },
]

export const InventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<ItemStatus | undefined>(undefined)
  const [sort, setSort] = useState<SortConfig>({ key: "name", direction: "asc" })

  const filtered = filterInventory(inventoryMock, searchQuery, categoryFilter, statusFilter)
  const sortedItems = sortInventory(filtered, sort)

  const hasActiveFilters = searchQuery || categoryFilter || statusFilter

  const clearAll = () => {
    setSearchQuery("")
    setCategoryFilter(undefined)
    setStatusFilter(undefined)
  }

  return (
    <VStack align="stretch" gap={{ base: "5", md: "7" }}>
      <PageHeader title={t("inventory.title")} description={t("inventory.description")} />

      <Flex gap="3" flexWrap="wrap" align="center">
        <SearchInput placeholder={t("inventory.searchPlaceholder")} onSearch={setSearchQuery} />
        <FilterSelect
          label={t("inventory.allCategories")}
          value={categoryFilter}
          options={categoryOptions}
          onChange={(value) => setCategoryFilter(value as ItemCategory | undefined)}
        />
        <FilterSelect
          label={t("inventory.allStatuses")}
          value={statusFilter}
          options={statusOptions}
          onChange={(value) => setStatusFilter(value as ItemStatus | undefined)}
        />
        {hasActiveFilters ? (
          <Text
            textStyle="xs"
            color="sage.600"
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
            onClick={clearAll}
          >
            {t("inventory.clearFilters")}
          </Text>
        ) : null}
      </Flex>

      {sortedItems.length > 0 ? (
        <InventoryTable items={sortedItems} sort={sort} onSort={setSort} />
      ) : (
        <EmptyState
          icon={PackageSearch}
          title={t("common.noResults")}
          description={t("inventory.noResultsDescription")}
          actionLabel={t("inventory.clearFilters")}
          onAction={clearAll}
        />
      )}
    </VStack>
  )
}
