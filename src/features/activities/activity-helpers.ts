import type { SystemStyleObject } from "@chakra-ui/react";
import { t } from "../../lib/i18n";
import type { AuthenticatedOperator, OperatorProfile } from "../../lib/auth.types";
import type {
  Activity,
  ActivityStatus,
  ActivityType,
  ItemCategory,
  ItemStatus,
} from "../../types";

export const activityStatusColor: Record<
  ActivityStatus,
  SystemStyleObject["color"]
> = {
  active: "green.600",
  draft: "gray.500",
  closed: "sky.600",
  credit: "yellow.600",
  reconciliation: "orange.500",
};

const ACTIVITY_TYPES: ActivityType[] = [
  "training",
  "operation",
  "war",
  "other",
];
const ACTIVITY_STATUSES: ActivityStatus[] = ["active", "closed"];
const ITEM_STATUSES: ItemStatus[] = ["ok", "low", "gap"];
const INVENTORY_STATUS_LABELS: Record<ItemStatus, string> = {
  ok: t("status.ok"),
  low: t("status.low"),
  gap: t("status.shortage"),
};

export const getActivityTypeLabel = (type: ActivityType) => {
  if (type === "training") return t("activities.type.training");
  if (type === "operation") return t("activities.type.operation");
  if (type === "war") return t("activities.type.war");
  return t("activities.type.other");
};

export const getActivityTypeOptions = () =>
  ACTIVITY_TYPES.map((value) => ({
    value,
    label: getActivityTypeLabel(value),
  }));

export const getActivityStatusOptions = () =>
  ACTIVITY_STATUSES.map((value) => ({
    value,
    label: value === "active" ? t("status.active") : t("status.closed"),
  }));

export const getInventoryStatusOptions = () =>
  ITEM_STATUSES.map((value) => ({
    value,
    label: INVENTORY_STATUS_LABELS[value],
  }));

export const sortActivities = (activities: Activity[]) =>
  [...activities].sort((activityA, activityB) => {
    if (activityA.status === "active" && activityB.status !== "active")
      return -1;
    if (activityA.status !== "active" && activityB.status === "active")
      return 1;
    return (
      new Date(activityB.createdAt).getTime() -
      new Date(activityA.createdAt).getTime()
    );
  });

export const parseActivityStatus = (
  value: string | undefined,
): ActivityStatus | undefined =>
  ACTIVITY_STATUSES.find((status) => status === value);

export const parseActivityType = (value: string | undefined): ActivityType =>
  ACTIVITY_TYPES.find((type) => type === value) ?? "training";

export const parseItemStatus = (
  value: string | undefined,
): ItemStatus | undefined => ITEM_STATUSES.find((status) => status === value);

export const parseCategory = (
  value: string | undefined,
  categories: ItemCategory[],
): ItemCategory | undefined =>
  categories.find((category) => category === value);

export const getSelectedItemCount = (selectedItemCount: number | undefined) => {
  const normalizedCount = Number(selectedItemCount);
  return Number.isFinite(normalizedCount) ? normalizedCount : 0;
};

export const getSelectedItemCountLabel = (
  selectedItemCount: number | undefined,
) => {
  const normalizedCount = getSelectedItemCount(selectedItemCount);
  if (normalizedCount <= 0) {
    return t("activities.noSelectedItemsYet");
  }

  return String(normalizedCount);
};

export const getOpenedByLabel = (
  openedByEmail: string,
  operator: AuthenticatedOperator | undefined,
  operatorProfile: OperatorProfile | undefined,
) => {
  if (operator?.email !== openedByEmail) {
    return openedByEmail;
  }

  return operatorProfile?.fullName || operator.fullName || openedByEmail;
};
