import { Badge, Flex, Spinner, Stack, Text } from "@chakra-ui/react";
import { ClipboardList } from "lucide-react";
import { t } from "../../lib/i18n";
import { getActivityTypeLabel } from "../activities/activity-helpers";
import type { Activity } from "../../types";

export const SelectedActivityDisplay = ({
  activity,
  snapshotItemCount,
  isLoadingSnapshot,
}: SelectedActivityDisplayProps) => (
  <Flex align="center" gap="3">
    <Flex
      align="center"
      justify="center"
      w="10"
      h="10"
      borderRadius="full"
      bg="sage.100"
      color="sage.700"
      flexShrink={0}
    >
      <ClipboardList size={20} />
    </Flex>
    <Stack gap="0.5">
      <Flex align="center" gap="2">
        <Text textStyle="sm" fontWeight="600">
          {activity.name}
        </Text>
        <Badge colorPalette="sage" size="sm">
          {getActivityTypeLabel(activity.activityType)}
        </Badge>
      </Flex>
      {isLoadingSnapshot ? (
        <Flex align="center" gap="2">
          <Spinner size="xs" color="sage.400" />
          <Text textStyle="xs" color="fg.muted">
            {t("issuance.loadingSnapshot")}
          </Text>
        </Flex>
      ) : (
        <Text textStyle="xs" color="fg.muted">
          {snapshotItemCount} {t("issuance.snapshotItems")}
        </Text>
      )}
    </Stack>
  </Flex>
);

type SelectedActivityDisplayProps = {
  activity: Activity;
  snapshotItemCount: number;
  isLoadingSnapshot: boolean;
};
