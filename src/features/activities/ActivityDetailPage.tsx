import { useMemo, useState } from "react"
import { Flex, Spinner, Stack } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { ApiErrorState } from "../../components/ApiErrorState"
import { useActivity, useCloseActivity } from "../../api"
import { showApiErrorToast } from "../../lib/api-error"
import { filterInventory, sortInventory } from "../../lib/filters"
import { t } from "../../lib/i18n"
import { toaster } from "../../lib/toaster"
import { useAuth } from "../../lib/use-auth"
import { parseCategory, parseItemStatus } from "./activity-helpers"
import { ActivityDetailHeader } from "./ActivityDetailHeader"
import { ActivityDetailSummary } from "./ActivityDetailSummary"
import { ActivitySnapshotSection } from "./ActivitySnapshotSection"
import type { SortConfig } from "../../components/SortableHeader"
import type { ItemCategory, ItemStatus } from "../../types"

const EMPTY_SNAPSHOT_ITEMS: never[] = []

export const ActivityDetailPage = ({ activityId }: ActivityDetailPageProps) => {
  const navigate = useNavigate()
  const { operator, operatorProfile } = useAuth()
  const { data, error, isPending, refetch } = useActivity(activityId)
  const closeActivity = useCloseActivity()

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | undefined>(
    undefined,
  )
  const [statusFilter, setStatusFilter] = useState<ItemStatus | undefined>(
    undefined,
  )
  const [sort, setSort] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  })

  const snapshotItems = data?.snapshotItems ?? EMPTY_SNAPSHOT_ITEMS
  const filteredItems = filterInventory(
    snapshotItems,
    searchQuery,
    categoryFilter,
    statusFilter,
  )
  const sortedItems = sortInventory(filteredItems, sort)
  const categories = useMemo(
    () =>
      [...new Set(snapshotItems.map((item) => item.category))].sort((a, b) =>
        a.localeCompare(b, "he"),
      ),
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

  const handleRetry = () => {
    void refetch()
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
        onError: (mutationError) => {
          showApiErrorToast({
            actionLabel: t("activities.closeAction"),
            error: mutationError,
            fallbackMessage: t("activities.closeError"),
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

  if (error || !data) {
    return (
      <ApiErrorState
        error={error}
        title={t("activities.loadErrorTitle")}
        fallbackMessage={t("activities.loadErrorDescription")}
        actionLabel={t("common.retry")}
        onAction={handleRetry}
      />
    )
  }

  const { activity } = data

  return (
    <Stack gap={{ base: "5", md: "7" }}>
      <ActivityDetailHeader
        activity={activity}
        canCloseActivity={operator?.role === "admin" && activity.status === "active"}
        isClosing={closeActivity.isPending}
        onBack={handleBack}
        onCloseActivity={handleCloseActivity}
        onOpenFolder={handleOpenFolder}
      />

      <ActivityDetailSummary
        activity={activity}
        operator={operator}
        operatorProfile={operatorProfile}
      />

      <ActivitySnapshotSection
        categoryFilter={categoryFilter}
        categories={categories}
        onCategoryChange={handleCategoryChange}
        onSearch={setSearchQuery}
        onSort={setSort}
        onStatusChange={handleStatusChange}
        sort={sort}
        sortedItems={sortedItems}
        statusFilter={statusFilter}
      />
    </Stack>
  )
}

type ActivityDetailPageProps = {
  activityId: string
}
