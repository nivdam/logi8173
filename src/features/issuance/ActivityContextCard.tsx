import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ClipboardList } from "lucide-react";
import { useActivities, useAddItemsToActivity, useInventory } from "../../api";
import { EmptyState } from "../../components/EmptyState";
import { t } from "../../lib/i18n";
import { toaster } from "../../lib/toaster";
import { ActivityInventoryDialog } from "../activities/ActivityInventoryDialog";
import { sortActivities } from "../activities/activity-helpers";
import { ActivityRadioCard } from "./ActivityRadioCard";
import { ContextCardShell } from "./ContextCardShell";
import { EmptySnapshotWarning } from "./EmptySnapshotWarning";
import { SelectedActivityDisplay } from "./SelectedActivityDisplay";
import { SnapshotErrorState } from "./SnapshotErrorState";
import { SwitchActivityDialog } from "./SwitchActivityDialog";

const LAST_ACTIVITY_STORAGE_KEY = "logi8173_last_activity_id";

export const ActivityContextCard = ({
  selectedActivityId,
  snapshotItemCount,
  isLoadingSnapshot,
  isSnapshotError,
  isFormDirty,
  isSubmitting,
  onSelect,
}: Props) => {
  const navigate = useNavigate();
  const { data: activities = [], isLoading: isLoadingActivities } =
    useActivities();
  const { data: inventoryItems = [], isLoading: isInventoryLoading } =
    useInventory();
  const addItemsToActivity = useAddItemsToActivity();
  const [isChanging, setIsChanging] = useState(false);
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [pendingActivityId, setPendingActivityId] = useState<
    string | undefined
  >(undefined);

  const activeActivities = useMemo(
    () =>
      sortActivities(activities).filter(
        (activity) => activity.status === "active",
      ),
    [activities],
  );

  const selectedActivity = useMemo(
    () =>
      activeActivities.find(
        (activity) => activity.activityId === selectedActivityId,
      ),
    [activeActivities, selectedActivityId],
  );

  useEffect(() => {
    if (!selectedActivityId) return;
    localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, selectedActivityId);
  }, [selectedActivityId]);

  useEffect(() => {
    if (selectedActivityId !== undefined) return;
    if (activeActivities.length === 0) return;
    if (isSubmitting || isFormDirty || pendingActivityId !== undefined) return;

    const lastActivityId = localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY);
    if (!lastActivityId) return;

    const rememberedActivity = activeActivities.find(
      (activity) => activity.activityId === lastActivityId,
    );
    if (!rememberedActivity) return;

    onSelect(rememberedActivity.activityId);
  }, [
    activeActivities,
    isFormDirty,
    isSubmitting,
    onSelect,
    pendingActivityId,
    selectedActivityId,
  ]);

  const handleGoToActivities = () => {
    navigate("/activities");
  };

  const handleSelectActivity = (activityId: string) => {
    if (activityId === selectedActivityId) return;
    if (isSubmitting) return;
    if (pendingActivityId !== undefined) return;

    if (isFormDirty && selectedActivityId) {
      setPendingActivityId(activityId);
      return;
    }

    onSelect(activityId);
    setIsChanging(false);
  };

  const handleConfirmSwitch = () => {
    if (!pendingActivityId) return;
    onSelect(pendingActivityId);
    setPendingActivityId(undefined);
    setIsChanging(false);
  };

  const handleCancelSwitch = () => {
    setPendingActivityId(undefined);
  };

  const handleStartChanging = () => {
    if (isSubmitting) return;
    setIsChanging(true);
  };

  const handleOpenAddInventory = () => {
    if (!selectedActivityId) return;
    setIsAddInventoryOpen(true);
  };

  const handleAddInventoryOpenChange = (details: { open: boolean }) => {
    setIsAddInventoryOpen(details.open);
  };

  const handleAddInventory = (itemIds: string[]) => {
    if (!selectedActivityId) return;

    addItemsToActivity.mutate(
      { activityId: selectedActivityId, itemIds },
      {
        onSuccess: () => {
          toaster.create({
            title: t("common.success"),
            description: t("activities.addInventorySuccess"),
            type: "success",
          });
          setIsAddInventoryOpen(false);
          onSelect(selectedActivityId);
        },
        onError: () => {
          toaster.create({
            title: t("common.error"),
            description: t("activities.addInventoryError"),
            type: "error",
          });
        },
      },
    );
  };

  if (isLoadingActivities) {
    return (
      <ContextCardShell>
        <Flex align="center" justify="center" py="6">
          <Spinner size="md" color="sage.400" />
        </Flex>
      </ContextCardShell>
    );
  }

  if (activeActivities.length === 0) {
    return (
      <ContextCardShell>
        <EmptyState
          icon={ClipboardList}
          title={t("issuance.noActiveActivities")}
          description={t("issuance.noActiveActivitiesHelper")}
          actionLabel={t("issuance.goToActivities")}
          onAction={handleGoToActivities}
        />
      </ContextCardShell>
    );
  }

  const isEmptySnapshot =
    !isLoadingSnapshot &&
    !isSnapshotError &&
    snapshotItemCount === 0 &&
    selectedActivityId !== undefined;

  if (selectedActivity && !isChanging) {
    return (
      <>
        <ContextCardShell>
          <SelectedActivityDisplay
            activity={selectedActivity}
            snapshotItemCount={snapshotItemCount}
            isLoadingSnapshot={isLoadingSnapshot}
            onChangeActivity={handleStartChanging}
          />

          {isSnapshotError && (
            <SnapshotErrorState
              onRetry={() => onSelect(selectedActivity.activityId)}
              onChooseAnother={handleStartChanging}
            />
          )}

          {isEmptySnapshot && (
            <EmptySnapshotWarning
              onAddInventory={handleOpenAddInventory}
              onChooseAnother={handleStartChanging}
            />
          )}
        </ContextCardShell>

        <ActivityInventoryDialog
          open={isAddInventoryOpen}
          inventoryItems={inventoryItems}
          isInventoryLoading={isInventoryLoading}
          isSubmitting={addItemsToActivity.isPending}
          onOpenChange={handleAddInventoryOpenChange}
          onSubmit={handleAddInventory}
        />

        <SwitchActivityDialog
          open={pendingActivityId !== undefined}
          onConfirm={handleConfirmSwitch}
          onCancel={handleCancelSwitch}
        />
      </>
    );
  }

  return (
    <>
      <ContextCardShell>
        <Heading size="sm" fontWeight="600" mb="3">
          {t("issuance.selectActivity")}
        </Heading>
        <Text textStyle="xs" color="fg.muted" mb="3">
          {t("issuance.selectActivityHelper")}
        </Text>
        <Stack gap="2">
          {activeActivities.map((activity) => (
            <ActivityRadioCard
              key={activity.activityId}
              activity={activity}
              isSelected={activity.activityId === selectedActivityId}
              onSelect={handleSelectActivity}
            />
          ))}
        </Stack>
      </ContextCardShell>
      <ActivityInventoryDialog
        open={isAddInventoryOpen}
        inventoryItems={inventoryItems}
        isInventoryLoading={isInventoryLoading}
        isSubmitting={addItemsToActivity.isPending}
        onOpenChange={handleAddInventoryOpenChange}
        onSubmit={handleAddInventory}
      />
      <SwitchActivityDialog
        open={pendingActivityId !== undefined}
        onConfirm={handleConfirmSwitch}
        onCancel={handleCancelSwitch}
      />
    </>
  );
};

type Props = {
  selectedActivityId: string | undefined;
  snapshotItemCount: number;
  isLoadingSnapshot: boolean;
  isSnapshotError: boolean;
  isFormDirty: boolean;
  isSubmitting: boolean;
  onSelect: (activityId: string) => void;
};
