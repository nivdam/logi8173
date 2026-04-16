import { Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { AlertTriangle } from "lucide-react"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"

export const SharedFormError = () => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    minH="100dvh"
    bg="bg"
    p="6"
    css={animations.fadeInUp}
  >
    <VStack gap="4" align="center">
      <Flex
        align="center"
        justify="center"
        w="16"
        h="16"
        borderRadius="full"
        bg="red.50"
      >
        <AlertTriangle size={32} color="var(--chakra-colors-red-500)" />
      </Flex>
      <Heading size="lg" fontWeight="600" textAlign="center">
        {t("sharedForm.error")}
      </Heading>
      <Text color="fg.muted" textStyle="sm" textAlign="center">
        {t("sharedForm.notFound")}
      </Text>
    </VStack>
  </Flex>
)
