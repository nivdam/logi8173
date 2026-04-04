import { Flex, Heading, Image, Text } from "@chakra-ui/react"
import logo from "../assets/logo-with-text.png"

export const SplashScreen = () => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    minH="100dvh"
    bg="bg.canvas"
    gap="6"
  >
    <Image src={logo} alt="סמל גדוד 8173" w="160px" h="auto" />
    <Heading size="2xl" fontWeight="700">
      Logi8173
    </Heading>
    <Text textStyle="lg" color="fg.muted">
      ניהול לוגיסטיקה דיגיטלית
    </Text>
  </Flex>
)
