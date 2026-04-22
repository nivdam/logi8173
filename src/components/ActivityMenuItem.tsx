import { Menu } from "@chakra-ui/react";
import { ActivityMenuRow } from "./ActivityMenuRow";
import type { Activity } from "../types";

export const ActivityMenuItem = ({ activity, isSelected, onSelect }: ActivityMenuItemProps) => {
  const handleClick = () => {
    onSelect(activity.activityId);
  };

  return (
    <Menu.Item value={activity.activityId} onClick={handleClick}>
      <ActivityMenuRow
        label={activity.name}
        isSelected={isSelected}
        activityId={activity.activityId}
      />
    </Menu.Item>
  );
};

type ActivityMenuItemProps = {
  activity: Activity;
  isSelected: boolean;
  onSelect: (activityId: string) => void;
};
