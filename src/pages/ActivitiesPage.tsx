import { Heading, Text, VStack } from "@chakra-ui/react"
import { t } from "../lib/i18n"

export const ActivitiesPage = () => (
  <VStack align="start" gap="4">
    <Heading size="lg">{t("activities.title")}</Heading>
    <Text color="fg.muted">{t("activities.description")}</Text>
  </VStack>
)
