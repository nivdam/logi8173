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
    pb="env(safe-area-inset-bottom, 6px)"
  >
  <Flex
    as="nav"
    bg="bg.card"
    borderWidth="1px"
    borderColor="border"
    borderRadius="2xl"
    justify="space-around"
    alignItems="center"
    h="16"
    mx="auto"
    maxW="md"
    shadow="md"
  >
    {navItems.map((item) => (
      <NavLink key={item.to} to={item.to} end={item.to === "/"}>
        {({ isActive }) => (
          <Flex
            direction="column"
            align="center"
            gap="1"
            py="1.5"
            position="relative"
          >
            {isActive ? (
              <Box
                position="absolute"
                top="-2px"
                w="10"
                h="3px"
                borderBottomRadius="full"
                bg="#E8942A"
              />
            ) : null}
            <Flex
              align="center"
              justify="center"
              gap="1.5"
              px={isActive ? "3" : "0"}
              py={isActive ? "1.5" : "0"}
              borderRadius="full"
              bg={isActive ? "sage.100" : "transparent"}
            >
              <item.icon
                size={20}
                strokeWidth={isActive ? 2 : 1.4}
                style={{ opacity: isActive ? 1 : 0.4 }}
              />
              {isActive ? (
                <Text
                  textStyle="xs"
                  fontWeight="400"
                  color="sage.700"
                  lineHeight="1"
                >
                  {item.label}
                </Text>
              ) : null}
            </Flex>
          </Flex>
        )}
      </NavLink>
    ))}
  </Flex>
  </Box>
)
