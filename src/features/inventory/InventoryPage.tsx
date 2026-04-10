import { useState } from "react"
import { Flex, Spinner, Text, VStack } from "@chakra-ui/react"
import { PackageSearch } from "lucide-react"
import { PageHeader } from "../../components/PageHeader"
import { ApiErrorState } from "../../components/ApiErrorState"
import { SearchInput } from "../../components/SearchInput"
import { FilterSelect } from "../../components/FilterSelect"
import { EmptyState } from "../../components/EmptyState"
import { t } from "../../lib/i18n"
import { filterInventory, sortInventory } from "../../lib/filters"
import { useInventory } from "../../api"
import { InventoryTable } from "./InventoryTable"
import type { SortConfig } from "../../components/SortableHeader"
import type { ItemCategory, ItemStatus } from "../../types"

const CATEGORY_OPTIONS = [
  { value: "רספאי", label: "רספאי" },
  { value: "קבלר_קרביות", label: "קבלר קרביות" },
  { value: "ציוד_אישי", label: "ציוד אישי" },
  { value: "אנרגיה", label: "אנרגיה" },
  { value: "תקשורת", label: "תקשורת" },
  { value: "כללי", label: "כללי" },
] as const

const STATUS_OPTIONS = [
  { value: "ok", label: "תקין" },
  { value: "low", label: "מלאי נמוך" },
  { value: "gap", label: "חוסר" },
] as const

const parseCategory = (value: string | undefined): ItemCategory | undefined =>
  CATEGORY_OPTIONS.find((option) => option.value === value)?.value

const parseStatus = (value: string | undefined): ItemStatus | undefined =>
  STATUS_OPTIONS.find((option) => option.value === value)?.value

export const InventoryPage = () => {
  const {
    data: inventoryItems = [],
    error,
    isPending: isLoading,
    refetch,
  } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<ItemStatus | undefined>(undefined)
  const [sort, setSort] = useState<SortConfig>({ key: "name", direction: "asc" })

  const filtered = filterInventory(inventoryItems, searchQuery, categoryFilter, statusFilter)
  const sortedItems = sortInventory(filtered, sort)

  const hasActiveFilters = searchQuery || categoryFilter || statusFilter

  const handleCategoryChange = (value: string | undefined) => {
    setCategoryFilter(parseCategory(value))
  }

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(parseStatus(value))
  }

  const handleRetry = () => {
    void refetch()
  }

  const clearAll = () => {
    setSearchQuery("")
    setCategoryFilter(undefined)
    setStatusFilter(undefined)
  }

  if (isLoading) {
    return (
      <Flex justify="center" py="16">
        <Spinner size="lg" color="sage.400" />
      </Flex>
    )
  }

  if (error) {
    return (
      <ApiErrorState
        title={t("inventory.title")}
        error={error}
        fallbackMessage={t("common.error")}
        actionLabel={t("common.retry")}
        onAction={handleRetry}
      />
    )
  }

  return (
    <VStack align="stretch" gap={{ base: "5", md: "7" }}>
      <PageHeader title={t("inventory.title")} description={t("inventory.description")} />

      <Flex gap="3" flexWrap="wrap" align="center">
        <SearchInput placeholder={t("inventory.searchPlaceholder")} onSearch={setSearchQuery} />
        <FilterSelect
          label={t("inventory.allCategories")}
          value={categoryFilter}
          options={[...CATEGORY_OPTIONS]}
          onChange={handleCategoryChange}
        />
        <FilterSelect
          label={t("inventory.allStatuses")}
          value={statusFilter}
          options={[...STATUS_OPTIONS]}
          onChange={handleStatusChange}
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
