import { Box, Flex, Text } from "@chakra-ui/react"
import { NavLink } from "react-router-dom"

const navItems = [
  { to: "/", label: "לוח בקרה" },
  { to: "/inventory", label: "מלאי" },
  { to: "/activities", label: "פעילויות" },
  { to: "/soldiers", label: "חיילים" },
  { to: "/settings", label: "הגדרות" },
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
    borderColor="border.muted"
    bg={{ base: "white", _dark: "gray.800" }}
    display={{ base: "none", md: "flex" }}
  >
    {navItems.map((item) => (
      <NavLink key={item.to} to={item.to} end={item.to === "/"}>
        {({ isActive }) => (
          <Box
            px="3"
            py="2"
            borderRadius="md"
            bg={isActive ? "brand.muted" : "transparent"}
            color={isActive ? "brand.fg" : "fg.muted"}
            fontWeight={isActive ? "600" : "400"}
            _hover={{ bg: isActive ? "brand.muted" : "bg.subtle" }}
            cursor="pointer"
          >
            <Text textStyle="sm">{item.label}</Text>
          </Box>
        )}
      </NavLink>
    ))}
  </Flex>
)
