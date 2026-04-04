import { Box, Flex, Heading, Image } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import logo from "../assets/logo.png"
import { AppNav } from "./AppNav"

export const AppLayout = () => (
  <Flex direction="column" minH="100dvh">
    <Flex
      as="header"
      align="center"
      gap="3"
      px="4"
      py="3"
      borderBottomWidth="1px"
      borderColor="border.muted"
      bg={{ base: "white", _dark: "gray.800" }}
    >
      <Image src={logo} alt="סמל גדוד 8173" boxSize="36px" />
      <Heading size="md" fontWeight="600">
        Logi8173
      </Heading>
    </Flex>

    <Flex flex="1">
      <AppNav />
      <Box as="main" flex="1" p="6" overflowY="auto">
        <Outlet />
      </Box>
    </Flex>
  </Flex>
)
