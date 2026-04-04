import { Heading, Text, VStack } from "@chakra-ui/react"
import { t } from "../lib/i18n"

export const SoldiersPage = () => (
  <VStack align="start" gap="4">
    <Heading size="lg">{t("soldiers.title")}</Heading>
    <Text color="fg.muted">{t("soldiers.description")}</Text>
  </VStack>
)
