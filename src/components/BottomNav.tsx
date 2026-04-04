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
    px="3"
    pb="env(safe-area-inset-bottom, 8px)"
  >
    <Flex
      as="nav"
      justify="space-around"
      alignItems="center"
      h="14"
      bg="gray.800"
      borderRadius="2xl"
      mx="auto"
      maxW="md"
      position="relative"
      shadow="lg"
    >
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === "/"}>
          {({ isActive }) => (
            <Flex
              align="center"
              justify="center"
              position="relative"
              h="full"
              px="2"
            >
              {isActive ? (
                <>
                  {/* Top bar indicator */}
                  <Box
                    position="absolute"
                    top="0"
                    w="10"
                    h="3px"
                    borderBottomRadius="full"
                    bg="#E8942A"
                  />
                  {/* Active pill */}
                  <Flex
                    align="center"
                    gap="2"
                    bg="gray.700"
                    borderRadius="xl"
                    px="4"
                    py="2"
                  >
                    <item.icon size={18} strokeWidth={2.2} color="white" />
                    <Text
                      textStyle="sm"
                      fontWeight="600"
                      color="white"
                      lineHeight="1"
                    >
                      {item.label}
                    </Text>
                  </Flex>
                </>
              ) : (
                <Flex
                  align="center"
                  justify="center"
                  w="10"
                  h="10"
                >
                  <item.icon
                    size={20}
                    strokeWidth={1.4}
                    color="#9CA3AF"
                  />
                </Flex>
              )}
            </Flex>
          )}
        </NavLink>
      ))}
    </Flex>
  </Box>
)
