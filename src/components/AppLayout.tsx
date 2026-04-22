import { useState } from "react";
import { Box, Button, Flex, Menu, Portal, Text } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../lib/use-auth";
import { useHeartbeat } from "../lib/useHeartbeat";
import { useActiveActivity } from "../lib/active-activity-context";
import { getActivityBorderColor } from "../lib/activity-color";
import { t } from "../lib/i18n";
import { ActivitySelector } from "./ActivitySelector";
import { AppNav } from "./AppNav";
import { BottomNav } from "./BottomNav";
import { OnlineOperatorsBadge } from "./OnlineOperatorsBadge";
import { OperatorProfileDialog } from "./OperatorProfileDialog";
import { RefreshDataButton } from "./RefreshDataButton";
import { SessionExpiryBanner } from "./SessionExpiryBanner";
import { UserAvatar } from "./UserAvatar";
import { showApiErrorToast } from "../lib/api-error";
import { useSaveOperatorProfile } from "../features/operator-profile/useSaveOperatorProfile";
import type { OperatorProfile } from "../lib/auth.types";

export const AppLayout = () => {
  useHeartbeat();
  const { operator, operatorProfile, clearOperatorProfile, logout } = useAuth();
  const { activeActivityId } = useActiveActivity();
  const { saveProfile, isSaving } = useSaveOperatorProfile();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const accountDisplayName =
    operatorProfile?.fullName || t("auth.accountNameFallback");
  const activityBorderColor = getActivityBorderColor(activeActivityId);

  const handleOpenProfileDialog = () => {
    setIsProfileDialogOpen(true);
  };

  const handleProfileDialogOpenChange = (details: { open: boolean }) => {
    setIsProfileDialogOpen(details.open);
  };

  const handleResetProfile = () => {
    clearOperatorProfile();
    setIsProfileDialogOpen(false);
  };

  const handleSaveProfile = async (profile: OperatorProfile) => {
    try {
      await saveProfile(profile);
      setIsProfileDialogOpen(false);
    } catch (error) {
      showApiErrorToast({
        actionLabel: t("settings.myProfile.saveError"),
        error,
      });
    }
  };

  return (
    <Flex direction="column" h="100dvh" overflow="hidden">
      <Flex
        as="header"
        align="center"
        gap="3"
        px="4"
        py="3"
        borderBottomWidth="1px"
        borderColor="border"
        borderTopWidth="4px"
        bg="bg.card"
        css={{ "&": { borderTopColor: activityBorderColor } }}
      >
        <ActivitySelector />

        <Flex ms="auto" align="center" gap="2">
          <OnlineOperatorsBadge />
          <RefreshDataButton />
          {operator ? (
            <Menu.Root positioning={{ placement: "bottom-end" }}>
              <Menu.Trigger asChild>
                <Button variant="ghost" px="2" h="auto">
                  <Flex align="center" gap="2">
                    <UserAvatar
                      name={accountDisplayName}
                      avatarUrl={operator.avatarUrl}
                    />
                    <Text
                      textStyle="sm"
                      display={{ base: "none", md: "block" }}
                    >
                      {accountDisplayName}
                    </Text>
                  </Flex>
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content minW="220px">
                    <Box px="3" py="2">
                      <Text textStyle="sm" fontWeight="600">
                        {accountDisplayName}
                      </Text>
                      <Text textStyle="xs" color="fg.muted">
                        {operator.email}
                      </Text>
                    </Box>
                    <Menu.Separator />
                    <Menu.Item
                      value="edit-profile"
                      onClick={handleOpenProfileDialog}
                    >
                      {t("auth.editProfile")}
                    </Menu.Item>
                    <Menu.Item value="logout" onClick={logout}>
                      {t("auth.logout")}
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          ) : null}
        </Flex>
      </Flex>

      <SessionExpiryBanner />

      <Flex flex="1" minH="0">
        <AppNav />
        <Box
          as="main"
          flex="1"
          p={{ base: "4", md: "8" }}
          pb={{ base: "24", md: "8" }}
          w="100%"
          overflowY="auto"
        >
          <Outlet />
        </Box>
      </Flex>
      <BottomNav />
      <OperatorProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={handleProfileDialogOpenChange}
        defaultFullName={operatorProfile?.fullName ?? operator?.fullName ?? ""}
        defaultSavedSignature={operator?.savedSignatureUrl}
        initialProfile={operatorProfile}
        isSaving={isSaving}
        showReset={operatorProfile !== undefined}
        onReset={handleResetProfile}
        onSubmit={handleSaveProfile}
      />
    </Flex>
  );
};
