import { Box, Flex, Text } from "@chakra-ui/react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, Package, CalendarCheck, Users, Settings } from "lucide-react"
import { t } from "../lib/i18n"

const navItems = [
  { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
  { to: "/inventory", label: t("nav.inventory"), icon: Package },
  { to: "/activities", label: t("nav.activities"), icon: CalendarCheck },
  { to: "/soldiers", label: t("nav.soldiers"), icon: Users },
  { to: "/settings", label: t("nav.settings"), icon: Settings },
]

export const BottomNav = () => (
  <Box
    display={{ base: "block", md: "none" }}
    position="fixed"
    bottom="0"
    insetInline="0"
    zIndex="sticky"
    px="4"
    pb="env(safe-area-inset-bottom, 10px)"
  >
    <Flex
      as="nav"
      bg="sage.800"
      borderRadius="2xl"
      justify="space-around"
      alignItems="center"
      h="14"
      mx="auto"
      maxW="md"
      shadow="lg"
    >
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === "/"}>
          {({ isActive }) => (
            isActive ? (
              <Flex
                direction="column"
                align="center"
                position="relative"
              >
                <Box
                  position="absolute"
                  top="-7px"
                  w="8"
                  h="3px"
                  borderBottomRadius="full"
                  bg="#E8942A"
                />
              <Flex
                align="center"
                gap="2"
                bg="sage.600"
                borderRadius="xl"
                px="3.5"
                py="2"
              >
                <item.icon size={18} strokeWidth={2} color="white" />
                <Text
                  textStyle="xs"
                  fontWeight="500"
                  color="white"
                  lineHeight="1"
                >
                  {item.label}
                </Text>
              </Flex>
              </Flex>
            ) : (
              <Flex align="center" justify="center" w="10" h="10">
                <item.icon size={20} strokeWidth={1.5} color="#8db1a8" />
              </Flex>
            )
          )}
        </NavLink>
      ))}
    </Flex>
  </Box>
)
