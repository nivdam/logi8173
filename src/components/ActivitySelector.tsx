import { useState } from "react";
import { Box, Button, Flex, Image, Menu, Portal, Text } from "@chakra-ui/react";
import { ChevronDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActivityMenuItem } from "./ActivityMenuItem";
import { ActivityMenuRow } from "./ActivityMenuRow";
import { useActiveActivity } from "../lib/active-activity-context";
import { t } from "../lib/i18n";
import logo from "../assets/logo.png";

export const ActivitySelector = () => {
  const navigate = useNavigate();
  const { activeActivityId, activeActivity, openActivities, setActiveActivity, isResolving } =
    useActiveActivity();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuOpenChange = (details: { open: boolean }) => {
    setIsMenuOpen(details.open);
  };

  const handleSelectMaster = () => {
    setActiveActivity(undefined);
  };

  const handleCreateNew = () => {
    navigate("/activities?new=1");
  };

  const triggerLabel = activeActivity?.name ?? t("activitySelector.master");
  const triggerCaption = activeActivity ? undefined : t("activitySelector.masterCaption");

  return (
    <Menu.Root
      positioning={{ placement: "bottom-start" }}
      onOpenChange={handleMenuOpenChange}
    >
      <Menu.Trigger asChild>
        <Button
          variant="ghost"
          px="2"
          py="1"
          h="auto"
          disabled={isResolving}
          maxW={{ base: "220px", md: "320px" }}
          _hover={{ bg: "bg.muted" }}
          _active={{ bg: "bg.subtle" }}
          css={{ "&[data-state='open']": { background: "var(--chakra-colors-bg-muted)" } }}
        >
          <Flex align="center" gap="2" minW="0">
            <Image src={logo} alt={t("app.battalion")} h="32px" w="auto" />
            <Flex direction="column" align="flex-start" lineHeight="1.1" minW="0">
              <Text textStyle="sm" fontWeight="600" truncate maxW="100%">
                {triggerLabel}
              </Text>
              {triggerCaption ? (
                <Text textStyle="xs" color="fg.muted">
                  {triggerCaption}
                </Text>
              ) : null}
            </Flex>
            <Box
              transition="transform 0.15s ease-out"
              transform={isMenuOpen ? "rotate(180deg)" : undefined}
              display="inline-flex"
              alignItems="center"
            >
              <ChevronDown size={16} />
            </Box>
          </Flex>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="260px" maxW="360px">
            <Menu.Item value="master" onClick={handleSelectMaster}>
              <ActivityMenuRow
                label={t("activitySelector.master")}
                caption={t("activitySelector.masterCaption")}
                isSelected={activeActivityId === undefined}
              />
            </Menu.Item>
            {openActivities.length > 0 ? (
              <>
                <Menu.Separator />
                <Box px="3" py="1">
                  <Text textStyle="xs" color="fg.muted">
                    {t("activitySelector.sectionActivities")}
                  </Text>
                </Box>
                {openActivities.map((activity) => (
                  <ActivityMenuItem
                    key={activity.activityId}
                    activity={activity}
                    isSelected={activeActivityId === activity.activityId}
                    onSelect={setActiveActivity}
                  />
                ))}
              </>
            ) : null}
            <Menu.Separator />
            <Menu.Item value="create-new" onClick={handleCreateNew}>
              <Flex align="center" gap="2">
                <Plus size={16} />
                <Text>{t("activitySelector.createNew")}</Text>
              </Flex>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
