import { Heading, Text, VStack } from "@chakra-ui/react"
import { t } from "../lib/i18n"

export const DashboardPage = () => (
  <VStack align="start" gap="4">
    <Heading size="lg">{t("dashboard.title")}</Heading>
    <Text color="fg.muted">{t("dashboard.description")}</Text>
  </VStack>
)
