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

export const AppNav = () => (
  <Flex
    as="nav"
    direction="column"
    w="220px"
    py="4"
    px="3"
    gap="1.5"
    bg="sage.800"
    display={{ base: "none", md: "flex" }}
  >
    {navItems.map((item) => (
      <NavLink key={item.to} to={item.to} end={item.to === "/"}>
        {({ isActive }) => (
          <Flex
            align="center"
            gap="3"
            px="3"
            py="2.5"
            borderRadius="xl"
            position="relative"
            cursor="pointer"
            css={{
              background: isActive
                ? "var(--chakra-colors-sage-600)"
                : "transparent",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                background: isActive
                  ? "var(--chakra-colors-sage-600)"
                  : "var(--chakra-colors-sage-700)",
              },
            }}
          >
            {/* Orange indicator bar on the right */}
            <Box
              position="absolute"
              insetInlineEnd="-3px"
              top="50%"
              css={{
                transform: isActive ? "translateY(-50%) scaleY(1)" : "translateY(-50%) scaleY(0)",
                opacity: isActive ? 1 : 0,
                transition: "all 0.25s ease",
              }}
              w="4px"
              h="6"
              borderRadius="full"
              bg="sunburst.400"
            />
            <item.icon
              size={18}
              strokeWidth={isActive ? 2 : 1.5}
              color={isActive ? "white" : "#8db1a8"}
              style={{ transition: "all 0.2s ease" }}
            />
            <Text
              textStyle="sm"
              fontWeight={isActive ? "500" : "400"}
              color={isActive ? "white" : "#8db1a8"}
              css={{ transition: "color 0.2s ease" }}
            >
              {item.label}
            </Text>
          </Flex>
        )}
      </NavLink>
    ))}
  </Flex>
)
