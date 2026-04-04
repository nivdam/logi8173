import { Flex, Text } from "@chakra-ui/react"
import { NavLink } from "react-router-dom"
import { t } from "../lib/i18n"

const navItems = [
  { to: "/", label: t("nav.dashboard"), icon: "📊" },
  { to: "/inventory", label: t("nav.inventory"), icon: "📦" },
  { to: "/activities", label: t("nav.activities"), icon: "📋" },
  { to: "/soldiers", label: t("nav.soldiers"), icon: "👤" },
  { to: "/settings", label: t("nav.settings"), icon: "⚙️" },
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
            <Text fontSize="xl" lineHeight="1">
              {item.icon}
            </Text>
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
