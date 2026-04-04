import { useState } from "react"
import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { t } from "../lib/i18n"

export const useErrorBanner = () => {
  const [error, setError] = useState<string | undefined>(undefined)

  const showError = (message: string) => setError(message)
  const clearError = () => setError(undefined)

  return { error, showError, clearError }
}

export const ErrorBanner = ({ message, onDismiss }: Props) => {
  if (!message) return null

  return (
    <Box
      position="fixed"
      top="0"
      insetInline="0"
      zIndex="banner"
      bg="red.600"
      color="white"
      px="4"
      py="3"
    >
      <Flex align="center" justify="space-between" maxW="600px" mx="auto">
        <Text textStyle="sm" fontWeight="500">
          {t("common.error")}: {message}
        </Text>
        <Button
          variant="ghost"
          size="xs"
          color="white"
          _hover={{ bg: "red.700" }}
          onClick={onDismiss}
        >
          {t("common.close")}
        </Button>
      </Flex>
    </Box>
  )
}

type Props = {
  message: string | undefined
  onDismiss: () => void
}
