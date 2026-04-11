import { Box, Button, Flex, HStack, Image, Separator, Spinner, Text, VStack } from "@chakra-ui/react"
import { ApiError } from "../lib/api"
import { useSetupStatus } from "../api"
import { SetupPage } from "../pages/SetupPage"
import { t } from "../lib/i18n"
import { useAuth } from "../lib/use-auth"
import logo from "../assets/logo-with-text.png"

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
    const technicalMessage =
      error instanceof ApiError ? `${error.code}: ${error.message}` : t("common.error")
    const isTokenError =
      error instanceof ApiError &&
      ["INVALID_ID_TOKEN", "UNAUTHORIZED", "FORBIDDEN"].includes(error.code)

    return (
      <Flex
        align="center"
        justify="center"
        minH="100dvh"
        bg="linear-gradient(180deg, #f8faf8 0%, #eef2ef 100%)"
        p={{ base: "4", md: "6" }}
      >
        <Box
          maxW="2xl"
          w="100%"
          bg="white"
          borderWidth="1px"
          borderColor="sage.200"
          borderRadius="3xl"
          boxShadow="0 18px 48px rgba(30, 41, 32, 0.08)"
          overflow="hidden"
        >
          <VStack gap="0" align="stretch">
            <Box px={{ base: "5", md: "8" }} pt={{ base: "6", md: "8" }}>
              <VStack gap="4" align="stretch">
                <Image src={logo} alt={t("app.battalion")} w={{ base: "112px", md: "136px" }} h="auto" />
                <VStack gap="2" align="stretch">
                  <Text fontWeight="700" textStyle={{ base: "xl", md: "2xl" }} color="fg.default">
                    {t("setup.backendErrorTitle")}
                  </Text>
                  <Text color="fg.muted" lineHeight="tall">
                    {t("setup.backendErrorDescription")}
                  </Text>
                </VStack>
              </VStack>
            </Box>

            <Box px={{ base: "5", md: "8" }} py={{ base: "5", md: "6" }}>
              <VStack gap="3" align="stretch">
                <Text fontWeight="600" color="fg.default">
                  {t("setup.backendErrorActionsTitle")}
                </Text>
                <VStack gap="2" align="stretch" color="fg.muted">
                  <Text>{t("setup.backendErrorActionRetry")}</Text>
                  <Text>{t("setup.backendErrorActionCheck")}</Text>
                  {isTokenError ? <Text>{t("setup.invalidSessionHelp")}</Text> : null}
                </VStack>
              </VStack>
            </Box>

            <Box bg="gray.50" px={{ base: "5", md: "8" }} py={{ base: "4", md: "5" }}>
              <VStack gap="3" align="stretch">
                <Text fontWeight="600" textStyle="sm" color="fg.default">
                  {t("setup.backendErrorDetailsTitle")}
                </Text>
                <Text
                  color="fg.muted"
                  textStyle="sm"
                  wordBreak="break-word"
                  fontFamily="mono"
                  direction="ltr"
                  textAlign="left"
                >
                  {technicalMessage}
                </Text>
              </VStack>
            </Box>

            <Separator />

            <Box px={{ base: "5", md: "8" }} py={{ base: "4", md: "5" }}>
              <HStack wrap="wrap" gap="3">
                <Button onClick={handleRetry}>{t("common.retry")}</Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  {t("common.refreshData")}
                </Button>
                {isTokenError ? (
                  <Button variant="subtle" onClick={resetSession}>
                    {t("auth.resetSession")}
                  </Button>
                ) : null}
              </HStack>
            </Box>
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
