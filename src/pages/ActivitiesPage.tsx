import { useEffect, useMemo, useState } from "react";
import { Button, Flex, Grid, Spinner, Stack } from "@chakra-ui/react";
import { CalendarCheck, Plus } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ApiErrorState } from "../components/ApiErrorState";
import { EmptyState } from "../components/EmptyState";
import { FilterSelect } from "../components/FilterSelect";
import { PageHeader } from "../components/PageHeader";
import { SearchInput } from "../components/SearchInput";
import { useActivities, useInventory, useOpenActivity } from "../api";
import { ActivityCard } from "../features/activities/ActivityCard";
import { ActivityDetailPage } from "../features/activities/ActivityDetailPage";
import { OpenActivityDialog } from "../features/activities/OpenActivityDialog";
import {
  getActivityStatusOptions,
  getOpenedByLabel,
  getSelectedItemCount,
  parseActivityStatus,
  sortActivities,
} from "../features/activities/activity-helpers";
import type { OpenActivityFormValues } from "../features/activities/activity-types";
import { showApiErrorToast } from "../lib/api-error";
import { t } from "../lib/i18n";
import { toaster } from "../lib/toaster";
import { useActiveActivity } from "../lib/active-activity-context";
import { useAuth } from "../lib/use-auth";
import type { Activity, ActivityStatus } from "../types";
import { useQueryClient } from "@tanstack/react-query";

export const ActivitiesPage = () => {
  const { activityId } = useParams();

  if (activityId) {
    return <ActivityDetailPage activityId={activityId} />;
  }

  return <ActivitiesListPage />;
};

const ActivitiesListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { operator, operatorProfile } = useAuth();
  const { setActiveActivity } = useActiveActivity();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | undefined>(
    undefined,
  );
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(
    () => searchParams.get("new") === "1",
  );
  const {
    data: activities = [],
    error: activitiesError,
    isPending: isActivitiesPending,
    refetch: refetchActivities,
  } = useActivities();
  const {
    data: inventoryItems = [],
    error: inventoryError,
    isPending: isInventoryPending,
    refetch: refetchInventory,
  } = useInventory({ enabled: isOpenDialogOpen });
  const openActivity = useOpenActivity();

  useEffect(() => {
    if (searchParams.get("new") !== "1") return
    setIsOpenDialogOpen(true);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("new");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const filteredActivities = useMemo(() => {
    const lowerQuery = searchQuery.trim().toLowerCase();
    return sortActivities(activities).filter((activity) => {
      if (statusFilter && activity.status !== statusFilter) return false;
      if (!lowerQuery) return true;
      return (
        activity.name.toLowerCase().includes(lowerQuery) ||
        activity.openedBy.toLowerCase().includes(lowerQuery)
      );
    });
  }, [activities, searchQuery, statusFilter]);

  const activeCount = activities.filter(
    (activity) => activity.status === "active",
  ).length;
  const totalSelectedItems = activities.reduce(
    (sum, activity) => sum + getSelectedItemCount(activity.selectedItemCount),
    0,
  );

  const handleOpenDialog = () => {
    setIsOpenDialogOpen(true);
  };

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(parseActivityStatus(value));
  };

  const handleDialogOpenChange = (details: { open: boolean }) => {
    setIsOpenDialogOpen(details.open);
  };

  const handleOpenActivity = (input: OpenActivityFormValues) => {
    openActivity.mutate(input, {
      onSuccess: (activity) => {
        toaster.create({
          title: t("common.success"),
          description: t("activities.openSuccess"),
          type: "success",
        });
        queryClient.setQueryData<Activity[]>(["activities"], (previous) =>
          previous ? [...previous, activity] : [activity],
        );
        setActiveActivity(activity.activityId);
        setIsOpenDialogOpen(false);
        navigate(`/activities/${activity.activityId}`);
      },
      onError: (error) => {
        showApiErrorToast({
          actionLabel: t("activities.openAction"),
          error,
          fallbackMessage: t("activities.openError"),
        });
      },
    });
  };

  const handleRetry = () => {
    void refetchActivities();
  };

  const handleRetryInventory = () => {
    void refetchInventory();
  };

  if (activitiesError) {
    return (
      <ApiErrorState
        error={activitiesError}
        title={t("activities.loadErrorTitle")}
        fallbackMessage={t("activities.loadErrorDescription")}
        actionLabel={t("common.retry")}
        onAction={handleRetry}
      />
    );
  }

  return (
    <Stack gap={{ base: "5", md: "7" }}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="4"
      >
        <PageHeader
          title={t("activities.title")}
          description={t("activities.description")}
        />
        <Button
          alignSelf={{ base: "stretch", md: "flex-start" }}
          colorPalette="primary"
          onClick={handleOpenDialog}
        >
          <Plus size={16} />
          {t("activities.openAction")}
        </Button>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="4">
        <SummaryCard
          label={t("activities.summary.total")}
          value={activities.length}
        />
        <SummaryCard
          label={t("activities.summary.active")}
          value={activeCount}
        />
        <SummaryCard
          label={t("activities.summary.items")}
          value={totalSelectedItems}
        />
      </Grid>

      <Flex gap="3" flexWrap="wrap" align="center">
        <SearchInput
          placeholder={t("activities.searchPlaceholder")}
          onSearch={setSearchQuery}
        />
        <FilterSelect
          label={t("activities.allStatuses")}
          value={statusFilter}
          options={getActivityStatusOptions()}
          onChange={handleStatusChange}
        />
      </Flex>

      {isActivitiesPending ? (
        <Flex justify="center" py="16">
          <Spinner size="lg" color="forest.400" />
        </Flex>
      ) : filteredActivities.length > 0 ? (
        <Stack gap="4">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.activityId}
              activity={activity}
              openedByLabel={getOpenedByLabel(
                activity.openedBy,
                operator,
                operatorProfile,
              )}
              onOpen={() => navigate(`/activities/${activity.activityId}`)}
            />
          ))}
        </Stack>
      ) : (
        <EmptyState
          icon={CalendarCheck}
          title={t("activities.emptyTitle")}
          description={t("activities.emptyDescription")}
          actionLabel={t("activities.openAction")}
          onAction={handleOpenDialog}
        />
      )}

      <OpenActivityDialog
        open={isOpenDialogOpen}
        inventoryItems={inventoryItems}
        isInventoryLoading={isInventoryPending}
        inventoryError={inventoryError}
        onRetryInventory={handleRetryInventory}
        isSubmitting={openActivity.isPending}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleOpenActivity}
      />
    </Stack>
  );
};

const SummaryCard = ({ label, value }: SummaryCardProps) => (
  <Flex
    direction="column"
    bg="bg.card"
    borderWidth="1px"
    borderColor="border"
    borderRadius="2xl"
    p="5"
  >
    <Flex as="span" textStyle="sm" color="fg.muted">
      {label}
    </Flex>
    <Flex as="strong" fontSize="2xl" fontWeight="600" mt="2">
      {value}
    </Flex>
  </Flex>
);

type SummaryCardProps = {
  label: string;
  value: number;
};
