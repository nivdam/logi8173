import { Box, Button, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { useAdaptivePolling } from "../lib/useAdaptivePolling";
import { t } from "../lib/i18n";
import logo from "../assets/logo.png";
import { AppNav } from "./AppNav";
import { BottomNav } from "./BottomNav";
import { FetchProgressBar } from "./FetchProgressBar";
import { RefreshDataButton } from "./RefreshDataButton";
import { UserAvatar } from "./UserAvatar";

export const AppLayout = () => {
  useAdaptivePolling();
  const { operator, logout } = useAuth();

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
            <>
              <UserAvatar
                name={operator.fullName}
                avatarUrl={operator.avatarUrl}
                email={operator.email}
              />
              <Text textStyle="sm" display={{ base: "none", md: "block" }}>
                {operator.fullName}
              </Text>
              <Button variant="ghost" size="sm" onClick={logout}>
                {t("auth.logout")}
              </Button>
            </>
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
    </Flex>
  );
};
