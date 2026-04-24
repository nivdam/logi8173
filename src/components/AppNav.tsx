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
            bg={isActive ? "surface.selected" : "transparent"}
            color={isActive ? "interactive" : "fg.muted"}
            fontWeight={isActive ? "600" : "400"}
            _hover={{ bg: isActive ? "surface.selected" : "bg.muted" }}
            cursor="pointer"
            position="relative"
            css={{
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: isActive ? "translateX(-2px)" : "translateX(0)",
            }}
          >
            <Box
              position="absolute"
              insetInlineStart="-2px"
              top="50%"
              w="4px"
              h="5"
              borderRadius="full"
              bg="sunburst.400"
              css={{
                transform: isActive ? "translateY(-50%) scaleY(1)" : "translateY(-50%) scaleY(0)",
                opacity: isActive ? 1 : 0,
                transition: "all 0.25s ease",
              }}
            />
            <Box css={{ transition: "transform 0.2s ease", transform: isActive ? "scale(1.1)" : "scale(1)", display: "flex" }}>
              <item.icon
                size={18}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </Box>
            <Text textStyle="sm" css={{ transition: "all 0.2s ease" }}>{item.label}</Text>
          </Flex>
        )}
      </NavLink>
    ))}
  </Flex>
)
