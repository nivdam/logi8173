import { useState } from "react";
import { Box, Button, Flex, Heading, Image, Menu, Portal, Text } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../lib/use-auth";
import { useAdaptivePolling } from "../lib/useAdaptivePolling";
import { t } from "../lib/i18n";
import logo from "../assets/logo.png";
import { AppNav } from "./AppNav";
import { BottomNav } from "./BottomNav";
import { FetchProgressBar } from "./FetchProgressBar";
import { OperatorProfileDialog } from "./OperatorProfileDialog";
import { RefreshDataButton } from "./RefreshDataButton";
import { UserAvatar } from "./UserAvatar";
import type { OperatorProfile } from "../lib/auth.types";

export const AppLayout = () => {
  useAdaptivePolling();
  const { operator, operatorProfile, saveOperatorProfile, clearOperatorProfile, logout } = useAuth();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const accountDisplayName = operatorProfile?.fullName || t("auth.accountNameFallback");

  const handleOpenProfileDialog = () => {
    setIsProfileDialogOpen(true)
  }

  const handleProfileDialogOpenChange = (details: { open: boolean }) => {
    setIsProfileDialogOpen(details.open)
  }

  const handleResetProfile = () => {
    clearOperatorProfile()
    setIsProfileDialogOpen(false)
  }

  const handleSaveProfile = (profile: OperatorProfile) => {
    saveOperatorProfile(profile)
    setIsProfileDialogOpen(false)
  }

  return (
    <Flex direction="column" minH="100dvh">
      <FetchProgressBar />
      <Flex
        as="header"
        align="center"
        gap="3"
        px="4"
        py="3"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg.card"
      >
        <Image src={logo} alt={t("app.battalion")} h="36px" w="auto" />
        <Heading size="md" fontWeight="light">
          {t("app.name")}
        </Heading>

        <Flex ms="auto" align="center" gap="2">
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
                    <Text textStyle="sm" display={{ base: "none", md: "block" }}>
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
                    <Menu.Item value="edit-profile" onClick={handleOpenProfileDialog}>
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

      <Flex flex="1">
        <AppNav />
        <Box
          as="main"
          flex="1"
          p={{ base: "4", md: "8" }}
          pb={{ base: "24", md: "8" }}
          maxW="1200px"
          overflowY="auto"
        >
          <Outlet />
        </Box>
      </Flex>
      <BottomNav />
      {operator && isProfileDialogOpen ? (
        <OperatorProfileDialog
          open
          onOpenChange={handleProfileDialogOpenChange}
          defaultFullName={operatorProfile?.fullName ?? ""}
          initialProfile={operatorProfile}
          isSaving={false}
          showReset={operatorProfile !== undefined}
          onReset={handleResetProfile}
          onSubmit={handleSaveProfile}
        />
      ) : null}
    </Flex>
  );
};
