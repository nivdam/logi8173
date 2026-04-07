import { useMemo, useState } from "react"
import { Box, Button, Flex, Grid, Heading, Spinner, Stack, Text } from "@chakra-ui/react"
import type { SystemStyleObject } from "@chakra-ui/react"
import { ArrowLeft, CalendarCheck, FolderOpen, PackageSearch } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { EmptyState } from "../../components/EmptyState"
import { FilterSelect } from "../../components/FilterSelect"
import { PageHeader } from "../../components/PageHeader"
import { SearchInput } from "../../components/SearchInput"
import { useActivity, useCloseActivity } from "../../api"
import { InventoryTable } from "../inventory/InventoryTable"
import { filterInventory, sortInventory } from "../../lib/filters"
import { formatDate, formatDateTime, getActivityStatusLabel } from "../../lib/formatters"
import { t } from "../../lib/i18n"
import { toaster } from "../../lib/toaster"
import { useAuth } from "../../lib/use-auth"
import {
  activityStatusColor,
  getActivityTypeLabel,
  getInventoryStatusOptions,
  getOpenedByLabel,
  getSelectedItemCountLabel,
  parseCategory,
  parseItemStatus,
} from "./activity-helpers"
import type { SortConfig } from "../../components/SortableHeader"
import type { ItemCategory, ItemStatus } from "../../types"

const EMPTY_SNAPSHOT_ITEMS: never[] = []

export const ActivityDetailPage = ({ activityId }: ActivityDetailPageProps) => {
  const navigate = useNavigate()
  const { operator, operatorProfile } = useAuth()
  const { data, isPending } = useActivity(activityId)
  const closeActivity = useCloseActivity()

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<ItemStatus | undefined>(undefined)
  const [sort, setSort] = useState<SortConfig>({ key: "name", direction: "asc" })

  const snapshotItems = data?.snapshotItems ?? EMPTY_SNAPSHOT_ITEMS
  const filteredItems = filterInventory(snapshotItems, searchQuery, categoryFilter, statusFilter)
  const sortedItems = sortInventory(filteredItems, sort)
  const categories = useMemo(
    () => [...new Set(snapshotItems.map((item) => item.category))].sort((a, b) => a.localeCompare(b, "he")),
    [snapshotItems],
  )

  const handleBack = () => {
    navigate("/activities")
  }

  const handleOpenFolder = () => {
    if (!data?.activity.folderUrl) {
      return
    }

    window.open(data.activity.folderUrl, "_blank", "noopener,noreferrer")
  }

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(parseItemStatus(value))
  }

  const handleCategoryChange = (value: string | undefined) => {
    setCategoryFilter(parseCategory(value, categories))
  }

  const handleCloseActivity = () => {
    closeActivity.mutate(
      { activityId },
      {
        onSuccess: () => {
          toaster.create({
            title: t("common.success"),
            description: t("activities.closeSuccess"),
            type: "success",
          })
        },
        onError: () => {
          toaster.create({
            title: t("common.error"),
            description: t("activities.closeError"),
            type: "error",
          })
        },
      },
    )
  }

  if (isPending) {
    return (
      <Flex justify="center" py="20">
        <Spinner size="lg" color="sage.400" />
      </Flex>
    )
  }

  if (!data) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title={t("activities.notFoundTitle")}
        description={t("activities.notFoundDescription")}
        actionLabel={t("common.back")}
        onAction={handleBack}
      />
    )
  }

  const { activity } = data

  return (
    <Stack gap={{ base: "5", md: "7" }}>
      <Flex gap="3" direction={{ base: "column", md: "row" }} justify="space-between">
        <Stack gap="3">
          <Button variant="ghost" alignSelf="flex-start" px="0" onClick={handleBack}>
            <ArrowLeft size={16} />
            {t("activities.backToList")}
          </Button>
          <PageHeader title={activity.name} description={t("activities.detailDescription")} />
        </Stack>

        <Flex gap="3" align={{ base: "stretch", md: "flex-start" }} direction={{ base: "column", md: "row" }}>
          <Button variant="outline" onClick={handleOpenFolder}>
            <FolderOpen size={16} />
            {t("activities.folderAction")}
          </Button>
          {operator?.role === "admin" && activity.status === "active" && (
            <Button
              colorPalette="red"
              variant="outline"
              loading={closeActivity.isPending}
              onClick={handleCloseActivity}
            >
              {t("activities.closeAction")}
            </Button>
          )}
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap="4">
        <DetailCard label={t("activities.fields.type")} value={getActivityTypeLabel(activity.activityType)} />
        <DetailCard label={t("activities.fields.status")} value={getActivityStatusLabel(activity.status)} color={activityStatusColor[activity.status]} />
        <DetailCard label={t("activities.fields.startDate")} value={formatDate(activity.startDate)} />
        <DetailCard label={t("activities.fields.selectedItems")} value={getSelectedItemCountLabel(activity.selectedItemCount)} />
      </Grid>

      <Box bg="bg.card" borderWidth="1px" borderColor="border" borderRadius="2xl" p={{ base: "5", md: "6" }}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="4">
          <MetaRow
            label={t("activities.fields.openedBy")}
            value={getOpenedByLabel(activity.openedBy, operator, operatorProfile)}
          />
          <MetaRow label={t("activities.fields.createdAt")} value={formatDateTime(activity.createdAt)} />
          <MetaRow
            label={t("activities.fields.closedAt")}
            value={activity.closedAt ? formatDateTime(activity.closedAt) : t("activities.stillOpen")}
          />
        </Grid>
      </Box>

      <Stack gap="4">
        <Stack gap="1">
          <Heading size="md" fontWeight="600">{t("activities.snapshotTitle")}</Heading>
          <Text textStyle="sm" color="fg.muted">{t("activities.snapshotDescription")}</Text>
        </Stack>

        <Flex gap="3" flexWrap="wrap" align="center">
          <SearchInput
            placeholder={t("activities.snapshotSearchPlaceholder")}
            onSearch={setSearchQuery}
          />
          <FilterSelect
            label={t("inventory.allCategories")}
            value={categoryFilter}
            options={categories.map((category) => ({ value: category, label: category }))}
            onChange={handleCategoryChange}
          />
          <FilterSelect
            label={t("inventory.allStatuses")}
            value={statusFilter}
            options={getInventoryStatusOptions()}
            onChange={handleStatusChange}
          />
        </Flex>

        {sortedItems.length > 0 ? (
          <InventoryTable items={sortedItems} sort={sort} onSort={setSort} />
        ) : (
          <EmptyState
            icon={PackageSearch}
            title={t("activities.noSnapshotItemsTitle")}
            description={t("activities.noSnapshotItemsDescription")}
          />
        )}
      </Stack>
    </Stack>
  )
}

const DetailCard = ({ label, value, color }: DetailCardProps) => (
  <Box bg="bg.card" borderWidth="1px" borderColor="border" borderRadius="2xl" p="5">
    <Text textStyle="sm" color="fg.muted">{label}</Text>
    <Text textStyle="lg" fontWeight="600" mt="2" color={color}>{value}</Text>
  </Box>
)

const MetaRow = ({ label, value }: MetaRowProps) => (
  <Stack gap="1">
    <Text textStyle="xs" color="fg.muted">{label}</Text>
    <Text textStyle="sm" fontWeight="500" wordBreak="break-word">{value}</Text>
  </Stack>
)

type ActivityDetailPageProps = {
  activityId: string
}

type DetailCardProps = {
  label: string
  value: string
  color?: SystemStyleObject["color"]
}

type MetaRowProps = {
  label: string
  value: string
}
