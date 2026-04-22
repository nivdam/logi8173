import { Box, Flex, Text } from "@chakra-ui/react";
import { CheckCircle2 } from "lucide-react";
import { ActivityAvatar } from "./ActivityAvatar";

export const ActivityMenuRow = ({
  label,
  caption,
  isSelected,
  activityId,
}: ActivityMenuRowProps) => (
  <Flex align="center" justify="space-between" w="100%" gap="3">
    <Flex align="center" gap="3" minW="0" flex="1">
      <ActivityAvatar activityId={activityId} label={label} />
      <Flex direction="column" lineHeight="1.2" minW="0">
        <Text textStyle="sm" fontWeight={isSelected ? "600" : "500"} truncate>
          {label}
        </Text>
        {caption ? (
          <Text textStyle="xs" color="fg.muted">
            {caption}
          </Text>
        ) : null}
      </Flex>
    </Flex>
    {isSelected ? (
      <Box color="sage.500" display="inline-flex" flexShrink="0">
        <CheckCircle2 size={18} fill="currentColor" stroke="white" strokeWidth={2.5} />
      </Box>
    ) : null}
  </Flex>
);

type ActivityMenuRowProps = {
  label: string;
  caption?: string;
  isSelected: boolean;
  activityId?: string;
};
