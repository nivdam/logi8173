import { Heading, Text, VStack } from "@chakra-ui/react"
import { t } from "../lib/i18n"

export const InventoryPage = () => (
  <VStack align="start" gap="4">
    <Heading size="lg">{t("inventory.title")}</Heading>
    <Text color="fg.muted">{t("inventory.description")}</Text>
  </VStack>
)
