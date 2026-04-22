import { Flex } from "@chakra-ui/react";
import { getActivityBorderColor } from "../lib/activity-color";

export const ActivityAvatar = ({ activityId, label }: ActivityAvatarProps) => {
  const initial = label.trim().charAt(0) || "•";
  const isMaster = !activityId;
  const background = isMaster ? "var(--chakra-colors-bg-muted)" : getActivityBorderColor(activityId);
  const color = isMaster ? "var(--chakra-colors-fg)" : "var(--chakra-colors-white)";

  return (
    <Flex
      align="center"
      justify="center"
      w="28px"
      h="28px"
      borderRadius="md"
      fontSize="xs"
      fontWeight="700"
      flexShrink="0"
      borderWidth={isMaster ? "1px" : "0"}
      borderColor="border"
      css={{ "&": { background: background, color: color } }}
    >
      {initial}
    </Flex>
  );
};

type ActivityAvatarProps = {
  activityId?: string;
  label: string;
};
