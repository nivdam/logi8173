import { Flex, Text } from "@chakra-ui/react"
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
    py="2"
    pb="env(safe-area-inset-bottom, 8px)"
  >
    {navItems.map((item) => (
      <NavLink key={item.to} to={item.to} end={item.to === "/"}>
        {({ isActive }) => (
          <Flex
            direction="column"
            align="center"
            gap="0.5"
            px="2"
            py="1"
            minW="12"
            color={isActive ? "sage.600" : "fg.muted"}
          >
            <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            <Text
              textStyle="xs"
              fontWeight={isActive ? "600" : "400"}
            >
              {item.label}
            </Text>
          </Flex>
        )}
      </NavLink>
    ))}
  </Flex>
)
