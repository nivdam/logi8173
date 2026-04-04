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

export const AppNav = () => (
  <Flex
    as="nav"
    direction="column"
    w="200px"
    py="4"
    px="2"
    gap="1"
    borderInlineEndWidth="1px"
    borderColor="border"
    bg="bg.card"
    display={{ base: "none", md: "flex" }}
  >
    {navItems.map((item) => (
      <NavLink key={item.to} to={item.to} end={item.to === "/"}>
        {({ isActive }) => (
          <Flex
            align="center"
            gap="3"
            px="3"
            py="2"
            borderRadius="md"
            bg={isActive ? "sage.100" : "transparent"}
            color={isActive ? "sage.700" : "fg.muted"}
            fontWeight={isActive ? "600" : "400"}
            _hover={{ bg: isActive ? "sage.100" : "bg.muted" }}
            cursor="pointer"
            css={{ transition: "all 0.2s ease" }}
          >
            <item.icon
              size={18}
              strokeWidth={isActive ? 2.2 : 1.8}
              style={{ transition: "all 0.2s ease" }}
            />
            <Text textStyle="sm">{item.label}</Text>
          </Flex>
        )}
      </NavLink>
    ))}
  </Flex>
)
