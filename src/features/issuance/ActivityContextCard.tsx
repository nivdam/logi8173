import { useState } from "react";
import { Flex, Spinner } from "@chakra-ui/react";
import { ClipboardList } from "lucide-react";
import { useAddItemsToActivity, useInventory } from "../../api";
import { EmptyState } from "../../components/EmptyState";
import { t } from "../../lib/i18n";
import { toaster } from "../../lib/toaster";
import { ActivityInventoryDialog } from "../activities/ActivityInventoryDialog";
import { ContextCardShell } from "./ContextCardShell";
import { EmptySnapshotWarning } from "./EmptySnapshotWarning";
import { SelectedActivityDisplay } from "./SelectedActivityDisplay";
import { SnapshotErrorState } from "./SnapshotErrorState";
import type { Activity } from "../../types";

export const ActivityContextCard = ({
  activity,
  isResolving,
  snapshotItemCount,
  isLoadingSnapshot,
  isSnapshotError,
  onRetrySnapshot,
}: Props) => {
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const { data: inventoryItems = [], isLoading: isInventoryLoading } = useInventory({ enabled: isAddInventoryOpen });
  const addItemsToActivity = useAddItemsToActivity();

  if (isResolving) {
    return (
      <ContextCardShell>
        <Flex align="center" justify="center" py="6">
          <Spinner size="md" color="forest.400" />
        </Flex>
      </ContextCardShell>
    );
  }

  if (!activity) {
    return (
      <ContextCardShell>
        <EmptyState
          icon={ClipboardList}
          title={t("issuance.noActiveActivitySelected")}
          description={t("issuance.selectFromHeader")}
        />
      </ContextCardShell>
    );
  }

  const isEmptySnapshot =
    !isLoadingSnapshot && !isSnapshotError && snapshotItemCount === 0;

  const handleOpenAddInventory = () => {
    setIsAddInventoryOpen(true);
  };

  const handleAddInventoryOpenChange = (details: { open: boolean }) => {
    setIsAddInventoryOpen(details.open);
  };

  const handleAddInventory = (itemIds: string[]) => {
    addItemsToActivity.mutate(
      { activityId: activity.activityId, itemIds },
      {
        onSuccess: () => {
          toaster.create({
            title: t("common.success"),
            description: t("activities.addInventorySuccess"),
            type: "success",
          });
          setIsAddInventoryOpen(false);
          onRetrySnapshot();
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

  return (
    <>
      <ContextCardShell>
        <SelectedActivityDisplay
          activity={activity}
          snapshotItemCount={snapshotItemCount}
          isLoadingSnapshot={isLoadingSnapshot}
        />

        {isSnapshotError && (
          <SnapshotErrorState onRetry={onRetrySnapshot} />
        )}

        {isEmptySnapshot && (
          <EmptySnapshotWarning onAddInventory={handleOpenAddInventory} />
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
    </>
  );
};

type Props = {
  activity: Activity | undefined;
  isResolving: boolean;
  snapshotItemCount: number;
  isLoadingSnapshot: boolean;
  isSnapshotError: boolean;
  onRetrySnapshot: () => void;
};
