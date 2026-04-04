import { Flex, Heading, Image, Text } from "@chakra-ui/react"
import { t } from "../lib/i18n"
import logo from "../assets/logo-with-text.png"

export const SplashScreen = () => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    minH="100dvh"
    bg="bg"
    gap="6"
  >
    <Image src={logo} alt={t("app.battalion")} w="160px" h="auto" />
    <Heading size="2xl" fontWeight="700">
      {t("app.name")}
    </Heading>
    <Text textStyle="lg" color="fg.muted">
      {t("app.tagline")}
    </Text>
  </Flex>
)
