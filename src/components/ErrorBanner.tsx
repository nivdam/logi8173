import { Button, Flex, Heading, Image, Text, VStack } from "@chakra-ui/react"
import { t } from "../lib/i18n"
import logo from "../assets/logo-8173.png"

export const ErrorBanner = ({ message, onDismiss }: Props) => {
  if (!message) return null

  return (
    <Flex
      position="fixed"
      inset="0"
      zIndex="modal"
      align="center"
      justify="center"
      bg="blackAlpha.600"
    >
      <Flex
        direction="column"
        align="center"
        maxW="sm"
        mx="4"
        p="8"
        bg="bg.card"
        borderRadius="xl"
        shadow="lg"
        role="alert"
      >
        <VStack gap="5">
          <Image src={logo} alt={t("app.battalion")} w="80px" h="auto" opacity="0.8" />
          <Heading size="xl" fontWeight="600" textAlign="center">
            {t("common.error")}
          </Heading>
          <Text textStyle="md" color="fg.muted" textAlign="center">
            {message}
          </Text>
          <Button
            colorPalette="red"
            variant="solid"
            size="md"
            borderRadius="md"
            onClick={onDismiss}
          >
            {t("common.close")}
          </Button>
        </VStack>
      </Flex>
    </Flex>
  )
}

type Props = {
  message: string | undefined
  onDismiss: () => void
}
