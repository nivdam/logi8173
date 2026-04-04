import { Box, Flex, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { useAutoAnimate } from "@formkit/auto-animate/react";
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
      bg="sage.800"
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
            <NavItem item={item} isActive={isActive} />
          )}
        </NavLink>
      ))}
    </Flex>
  </Box>
);

const NavItem = ({ item, isActive }: NavItemProps) => {
  const [animateRef] = useAutoAnimate({ duration: 200 });

  return (
    <Flex
      ref={animateRef}
      direction="column"
      align="center"
      position="relative"
    >
      {isActive ? (
        <Box
          key="indicator"
          position="absolute"
          top="-1px"
          w={12}
          h="4px"
          borderBottomRadius="full"
          bg="sunburst.400"
        />
      ) : null}
      <Flex
        align="center"
        justify="center"
        gap="2"
        bg={isActive ? "sage.600" : "transparent"}
        borderRadius="xl"
        px={isActive ? "3.5" : "0"}
        py="2"
        minW="10"
        css={{
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <item.icon
          size={isActive ? 18 : 20}
          strokeWidth={isActive ? 2 : 1.5}
          color={isActive ? "white" : "#8db1a8"}
          style={{ transition: "all 0.2s ease" }}
        />
        {isActive ? (
          <Text
            key="label"
            textStyle="xs"
            fontWeight="500"
            color="white"
            lineHeight="1"
          >
            {item.label}
          </Text>
        ) : null}
      </Flex>
    </Flex>
  );
};

type NavItemProps = {
  item: (typeof navItems)[number]
  isActive: boolean
}
