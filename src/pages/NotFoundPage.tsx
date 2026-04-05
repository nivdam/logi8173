import { Flex, Heading, Image, Text, VStack } from "@chakra-ui/react"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { t } from "../lib/i18n"
import { animations } from "../theme/animations"
import logo from "../assets/logo-with-text.png"

export const NotFoundPage = () => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    minH="100dvh"
    bg="bg"
    p="6"
    css={animations.fadeInUp}
  >
    <VStack gap="6" align="center">
      <Image src={logo} alt={t("app.battalion")} w="120px" h="auto" opacity={0.6} />

      <Heading size="6xl" fontWeight="800" color="sage.300">
        404
      </Heading>

      <VStack gap="1">
        <Heading size="lg" fontWeight="600">
          {t("notFound.title")}
        </Heading>
        <Text color="fg.muted" textStyle="sm">
          {t("notFound.description")}
        </Text>
      </VStack>

      <Flex
        asChild
        align="center"
        gap="2"
        color="sunburst.500"
        textStyle="sm"
        fontWeight="500"
        _hover={{ color: "sunburst.400", textDecoration: "underline" }}
        css={{ transition: "all 0.15s ease" }}
      >
        <Link to="/">
          <ArrowLeft size={16} />
          {t("notFound.backHome")}
        </Link>
      </Flex>
    </VStack>
  </Flex>
)
