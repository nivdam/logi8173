import { Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { PackageSearch } from "lucide-react"
import { EmptyState } from "../../components/EmptyState"
import { FilterSelect } from "../../components/FilterSelect"
import { SearchInput } from "../../components/SearchInput"
import { t } from "../../lib/i18n"
import type { SortConfig } from "../../components/SortableHeader"
import type { InventoryItem, ItemCategory, ItemStatus } from "../../types"
import { InventoryTable } from "../inventory/InventoryTable"
import { getInventoryStatusOptions } from "./activity-helpers"

export const ActivitySnapshotSection = ({
  categoryFilter,
  categories,
  onCategoryChange,
  onSearch,
  onSort,
  onStatusChange,
  sort,
  sortedItems,
  statusFilter,
}: Props) => (
  <Stack gap="4">
    <Stack gap="1">
      <Heading size="md" fontWeight="600">
        {t("activities.snapshotTitle")}
      </Heading>
      <Text textStyle="sm" color="fg.muted">
        {t("activities.snapshotDescription")}
      </Text>
    </Stack>

    <Flex gap="3" flexWrap="wrap" align="center">
      <SearchInput
        placeholder={t("activities.snapshotSearchPlaceholder")}
        onSearch={onSearch}
      />
      <FilterSelect
        label={t("inventory.allCategories")}
        value={categoryFilter}
        options={categories.map((category) => ({
          value: category,
          label: category,
        }))}
        onChange={onCategoryChange}
      />
      <FilterSelect
        label={t("inventory.allStatuses")}
        value={statusFilter}
        options={getInventoryStatusOptions()}
        onChange={onStatusChange}
      />
    </Flex>

    {sortedItems.length > 0 ? (
      <InventoryTable items={sortedItems} sort={sort} onSort={onSort} />
    ) : (
      <EmptyState
        icon={PackageSearch}
        title={t("activities.noSnapshotItemsTitle")}
        description={t("activities.noSnapshotItemsDescription")}
      />
    )}
  </Stack>
)

type Props = {
  categoryFilter: ItemCategory | undefined
  categories: string[]
  onCategoryChange: (value: string | undefined) => void
  onSearch: (value: string) => void
  onSort: (sort: SortConfig) => void
  onStatusChange: (value: string | undefined) => void
  sort: SortConfig
  sortedItems: InventoryItem[]
  statusFilter: ItemStatus | undefined
}
