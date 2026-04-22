import { useCallback, useRef, useState } from "react";
import { Box, Button, Dialog, Flex, Image, Menu, Portal, Text } from "@chakra-ui/react";
import { ChevronDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActivityMenuItem } from "./ActivityMenuItem";
import { ActivityMenuRow } from "./ActivityMenuRow";
import { useActiveActivity } from "../lib/active-activity-context";
import { hasDirtyForms } from "../lib/dirty-form-registry";
import { t } from "../lib/i18n";
import logo from "../assets/logo.png";

export const ActivitySelector = () => {
  const navigate = useNavigate();
  const {
    activeActivityId,
    activeActivity,
    openActivities,
    setActiveActivity,
    isResolving,
    isProtectedRequestActive,
  } = useActiveActivity();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingActivityId, setPendingActivityId] = useState<string | undefined>(undefined);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const hasPendingTargetRef = useRef(false);

  const handleMenuOpenChange = (details: { open: boolean }) => {
    setIsMenuOpen(details.open);
  };

  const attemptSwitch = useCallback(
    (nextActivityId: string | undefined) => {
      if (activeActivityId === nextActivityId) return;
      if (hasDirtyForms()) {
        setPendingActivityId(nextActivityId);
        hasPendingTargetRef.current = true;
        setIsConfirmOpen(true);
        return;
      }
      setActiveActivity(nextActivityId);
    },
    [activeActivityId, setActiveActivity],
  );

  const handleSelectMaster = () => {
    attemptSwitch(undefined);
  };

  const handleSelectActivity = useCallback(
    (activityId: string) => {
      attemptSwitch(activityId);
    },
    [attemptSwitch],
  );

  const handleCreateNew = () => {
    navigate("/activities?new=1");
  };

  const handleConfirmOpenChange = (details: { open: boolean }) => {
    setIsConfirmOpen(details.open);
    if (!details.open) {
      hasPendingTargetRef.current = false;
      setPendingActivityId(undefined);
    }
  };

  const handleConfirmSwitch = () => {
    if (!hasPendingTargetRef.current) return;
    const target = pendingActivityId;
    hasPendingTargetRef.current = false;
    setIsConfirmOpen(false);
    setPendingActivityId(undefined);
    setActiveActivity(target);
  };

  const handleCancelSwitch = () => {
    hasPendingTargetRef.current = false;
    setIsConfirmOpen(false);
    setPendingActivityId(undefined);
  };

  const triggerLabel = activeActivity?.name ?? t("activitySelector.master");
  const triggerCaption = activeActivity ? undefined : t("activitySelector.masterCaption");

  return (
    <>
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
            disabled={isResolving || isProtectedRequestActive}
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
                      onSelect={handleSelectActivity}
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

      <Dialog.Root
        open={isConfirmOpen}
        onOpenChange={handleConfirmOpenChange}
        role="alertdialog"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content mx="4" maxW="md">
              <Dialog.Header>
                <Dialog.Title>{t("activitySelector.dirtyConfirmTitle")}</Dialog.Title>
                <Dialog.Description>
                  {t("activitySelector.dirtyConfirmDescription")}
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Button variant="ghost" onClick={handleCancelSwitch}>
                  {t("activitySelector.dirtyConfirmCancel")}
                </Button>
                <Button colorPalette="sage" onClick={handleConfirmSwitch}>
                  {t("activitySelector.dirtyConfirmSwitch")}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};
