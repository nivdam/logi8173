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
  <Flex
    as="nav"
    display={{ base: "flex", md: "none" }}
    position="fixed"
    bottom="0"
    insetInline="0"
    zIndex="sticky"
    bg="bg.card"
    borderTopWidth="1px"
    borderColor="border"
    justify="space-around"
    alignItems="center"
    h="16"
    pb="env(safe-area-inset-bottom, 0px)"
    shadow="lg"
  >
    {navItems.map((item) => (
      <NavLink key={item.to} to={item.to} end={item.to === "/"}>
        {({ isActive }) => (
          <Flex
            direction="column"
            align="center"
            gap="1"
            py="1"
            minW="16"
            transition="all 0.2s ease"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              w={isActive ? "14" : "10"}
              h="8"
              borderRadius="full"
              bg={isActive ? "#2D5A3D" : "transparent"}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              <item.icon
                size={20}
                strokeWidth={isActive ? 2.3 : 1.5}
                color={isActive ? "#F0C75E" : undefined}
                style={{
                  opacity: isActive ? 1 : 0.45,
                  transition: "all 0.2s ease",
                }}
              />
            </Box>
            <Text
              textStyle="xs"
              fontWeight={isActive ? "600" : "400"}
              color={isActive ? "#2D5A3D" : "fg.muted"}
              transition="all 0.2s ease"
              lineHeight="1"
            >
              {item.label}
            </Text>
          </Flex>
        )}
      </NavLink>
    ))}
  </Flex>
)
