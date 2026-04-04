import { Heading, Text, VStack } from "@chakra-ui/react"
import { t } from "../lib/i18n"

export const SettingsPage = () => (
  <VStack align="start" gap="4">
    <Heading size="lg">{t("settings.title")}</Heading>
    <Text color="fg.muted">{t("settings.description")}</Text>
  </VStack>
)
