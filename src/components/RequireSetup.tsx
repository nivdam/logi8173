import { Box, Button, Flex, HStack, Spinner, Text, VStack } from "@chakra-ui/react"
import { ApiError } from "../lib/api"
import { useSetupStatus } from "../api"
import { SetupPage } from "../pages/SetupPage"
import { t } from "../lib/i18n"
import { useAuth } from "../lib/use-auth"

export const RequireSetup = ({ children }: Props) => {
  const { resetSession } = useAuth()
  const { data, isPending, error, refetch } = useSetupStatus()

  const handleRetry = () => {
    void refetch()
  }

  // First load only — full-screen spinner
  if (isPending) {
    return (
      <Flex align="center" justify="center" minH="100dvh" bg="bg">
        <VStack gap="4">
          <Spinner size="lg" color="sage.400" />
          <Text color="fg.muted" textStyle="sm">
            {t("setup.checking")}
          </Text>
        </VStack>
      </Flex>
    )
  }

  if (error) {
    const message =
      error instanceof ApiError
        ? `${error.code}: ${error.message}`
        : t("common.error")
    const isTokenError =
      error instanceof ApiError &&
      ["INVALID_ID_TOKEN", "UNAUTHORIZED", "FORBIDDEN"].includes(error.code)

    return (
      <Flex align="center" justify="center" minH="100dvh" bg="bg" p="6">
        <Box
          maxW="xl"
          w="100%"
          bg="bg.card"
          borderWidth="1px"
          borderColor="red.200"
          borderRadius="2xl"
          p="6"
        >
          <VStack gap="4" align="stretch">
            <Text fontWeight="700" textStyle="lg" color="red.600">
              {t("setup.backendCheckFailed")}
            </Text>
            <Text color="fg.muted">{message}</Text>
            {isTokenError ? (
              <Text color="fg.muted" textStyle="sm">
                {t("setup.invalidSessionHelp")}
              </Text>
            ) : null}
            <HStack wrap="wrap" gap="3">
              <Button onClick={handleRetry}>{t("common.retry")}</Button>
              {isTokenError ? (
                <Button variant="outline" onClick={resetSession}>
                  {t("auth.resetSession")}
                </Button>
              ) : null}
            </HStack>
          </VStack>
        </Box>
      </Flex>
    )
  }

  // System not initialized — show setup wizard
  if (data && !data.initialized) {
    return <SetupPage onComplete={handleRetry} />
  }

  return children
}

type Props = {
  children: React.ReactNode
}
