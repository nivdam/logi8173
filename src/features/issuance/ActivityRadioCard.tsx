import { chakra, Flex, Stack, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";
import { getActivityTypeLabel } from "../activities/activity-helpers";
import type { Activity } from "../../types";

export const ActivityRadioCard = ({
  activity,
  isSelected,
  onSelect,
}: ActivityRadioCardProps) => {
  const handleClick = () => {
    onSelect(activity.activityId);
  };

  return (
    <chakra.button
      type="button"
      w="full"
      textAlign="start"
      p="4"
      borderWidth="2px"
      borderColor={isSelected ? "forest.400" : "border"}
      bg={isSelected ? "forest.50" : "bg"}
      borderRadius="xl"
      cursor="pointer"
      transition="border-color 0.15s ease, background 0.15s ease"
      _hover={{ borderColor: "forest.300", bg: "forest.50" }}
      minH="56px"
      onClick={handleClick}
    >
      <Flex align="center" justify="space-between" gap="3">
        <Stack gap="0.5">
          <Text textStyle="sm" fontWeight="600">
            {activity.name}
          </Text>
          <Text textStyle="xs" color="fg.muted">
            {getActivityTypeLabel(activity.activityType)}
          </Text>
        </Stack>
        {isSelected ? (
          <Flex
            align="center"
            justify="center"
            w="8"
            h="8"
            borderRadius="full"
            bg="forest.400"
            color="white"
            flexShrink={0}
          >
            <Check size={16} />
          </Flex>
        ) : null}
      </Flex>
    </chakra.button>
  );
};

type ActivityRadioCardProps = {
  activity: Activity;
  isSelected: boolean;
  onSelect: (activityId: string) => void;
};
