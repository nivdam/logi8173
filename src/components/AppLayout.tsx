import { Box, Button, Flex, Heading, Image, Text } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { t } from "../lib/i18n"
import logo from "../assets/logo.png"
import { AppNav } from "./AppNav"

export const AppLayout = () => {
  const { operator, logout } = useAuth()

  return (
    <Flex direction="column" minH="100dvh">
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
        <Heading size="md" fontWeight="600">
          {t("app.name")}
        </Heading>

        <Flex ms="auto" align="center" gap="3">
          {operator ? (
            <>
              {operator.avatarUrl ? (
                <Image
                  src={operator.avatarUrl}
                  alt={operator.fullName}
                  boxSize="32px"
                  borderRadius="full"
                />
              ) : null}
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
        <Box as="main" flex="1" p="6" overflowY="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}
