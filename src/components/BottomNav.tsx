import { Box, Flex, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  Users,
  Settings,
} from "lucide-react";
import { t } from "../lib/i18n";

const navItems = [
  { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
  { to: "/inventory", label: t("nav.inventory"), icon: Package },
  { to: "/activities", label: t("nav.activities"), icon: CalendarCheck },
  { to: "/soldiers", label: t("nav.soldiers"), icon: Users },
  { to: "/settings", label: t("nav.settings"), icon: Settings },
];

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
      bg="forest.800"
      borderRadius="2xl"
      justify="space-around"
      alignItems="center"
      h="14"
      mx="auto"
      maxW="md"
      shadow="xl"
    >
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === "/"}>
          {({ isActive }) => (
            <Flex direction="column" align="center" position="relative">
              {/* Orange top indicator */}
              <Box
                position="absolute"
                top="-1px"
                w={12}
                h="4px"
                borderBottomRadius="full"
                bg="sunburst.400"
                css={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  transition: "opacity 0.25s ease, transform 0.25s ease",
                }}
              />
              {/* Pill */}
              <Flex
                align="center"
                justify="center"
                gap="2"
                borderRadius="xl"
                py="2"
                css={{
                  background: isActive
                    ? "var(--chakra-colors-forest-600)"
                    : "transparent",
                  paddingInline: isActive ? "14px" : "0",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <Box
                  css={{
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <item.icon
                    size={isActive ? 18 : 20}
                    strokeWidth={isActive ? 2 : 1.5}
                    color={isActive ? "white" : "var(--chakra-colors-fg-muted)"}
                  />
                </Box>
                {/* Label — always rendered, animated via width + opacity */}
                <Box
                  overflow="hidden"
                  css={{
                    maxWidth: isActive ? "80px" : "0",
                    opacity: isActive ? 1 : 0,
                    transition:
                      "max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
                  }}
                >
                  <Text
                    textStyle="xs"
                    fontWeight="500"
                    color="white"
                    lineHeight="1"
                    whiteSpace="nowrap"
                  >
                    {item.label}
                  </Text>
                </Box>
              </Flex>
            </Flex>
          )}
        </NavLink>
      ))}
    </Flex>
  </Box>
);
