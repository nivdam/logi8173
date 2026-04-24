import { useMemo, useState } from "react"
import { Flex, Spinner, Stack } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { ApiErrorState } from "../../components/ApiErrorState"
import { useActivity, useCloseActivity, useReopenActivity } from "../../api"
import { showApiErrorToast } from "../../lib/api-error"
import { filterInventory, sortInventory } from "../../lib/filters"
import { t } from "../../lib/i18n"
import { toaster } from "../../lib/toaster"
import { useAuth } from "../../lib/use-auth"
import { parseCategory, parseItemStatus } from "./activity-helpers"
import { ActivityDetailHeader } from "./ActivityDetailHeader"
import { ActivityDetailSummary } from "./ActivityDetailSummary"
import { ActivitySnapshotSection } from "./ActivitySnapshotSection"
import { ConfirmActivityStatusDialog } from "./ConfirmActivityStatusDialog"
import type { SortConfig } from "../../components/SortableHeader"
import type { InventoryItem, ItemCategory, ItemStatus } from "../../types"

const EMPTY_SNAPSHOT_ITEMS: InventoryItem[] = []

export const ActivityDetailPage = ({ activityId }: ActivityDetailPageProps) => {
  const navigate = useNavigate()
  const { operator, operatorProfile } = useAuth()
  const { data, error, isPending, refetch } = useActivity(activityId)
  const closeActivity = useCloseActivity()
  const reopenActivity = useReopenActivity()

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
  const [confirmDialogVariant, setConfirmDialogVariant] = useState<
    "close" | "reopen" | null
  >(null)

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

  const isAdmin = operator?.role === "admin"

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

  const handleRequestClose = () => {
    setConfirmDialogVariant("close")
  }

  const handleRequestReopen = () => {
    setConfirmDialogVariant("reopen")
  }

  const handleCancelConfirm = () => {
    setConfirmDialogVariant(null)
  }

  const handleConfirmStatusChange = () => {
    if (!confirmDialogVariant) return

    const isClose = confirmDialogVariant === "close"
    const mutation = isClose ? closeActivity : reopenActivity

    mutation.mutate(
      { activityId },
      {
        onSuccess: () => {
          setConfirmDialogVariant(null)
          toaster.create({
            title: t("common.success"),
            description: t(isClose ? "activities.closeSuccess" : "activities.reopenSuccess"),
            type: "success",
          })
        },
        onError: (mutationError) => {
          setConfirmDialogVariant(null)
          showApiErrorToast({
            actionLabel: t(isClose ? "activities.closeAction" : "activities.reopenAction"),
            error: mutationError,
            fallbackMessage: t(isClose ? "activities.closeError" : "activities.reopenError"),
          })
        },
      },
    )
  }

  if (isPending) {
    return (
      <Flex justify="center" py="20">
        <Spinner size="lg" color="forest.400" />
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
        canCloseActivity={isAdmin && activity.status === "active"}
        canReopenActivity={isAdmin && activity.status === "closed"}
        isStatusChanging={closeActivity.isPending || reopenActivity.isPending}
        onBack={handleBack}
        onCloseActivity={handleRequestClose}
        onReopenActivity={handleRequestReopen}
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

      <ConfirmActivityStatusDialog
        open={confirmDialogVariant !== null}
        variant={confirmDialogVariant ?? "close"}
        isLoading={closeActivity.isPending || reopenActivity.isPending}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelConfirm}
      />
    </Stack>
  )
}

type ActivityDetailPageProps = {
  activityId: string
}
