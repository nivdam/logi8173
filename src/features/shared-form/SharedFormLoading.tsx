import { Flex, Spinner, Text } from "@chakra-ui/react"
import { t } from "../../lib/i18n"

export const SharedFormLoading = () => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    minH="100dvh"
    bg="bg"
    gap="4"
  >
    <Spinner size="lg" color="sage.500" />
    <Text color="fg.muted" textStyle="sm">{t("sharedForm.loading")}</Text>
  </Flex>
)
