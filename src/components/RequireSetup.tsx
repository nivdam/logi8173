import { Accordion, Box, Button, Flex, Image, Spinner, Text, VStack } from "@chakra-ui/react"
import { ChevronDown } from "lucide-react"
import { ApiError } from "../lib/api"

const TOKEN_ERROR_CODES = ["INVALID_ID_TOKEN", "UNAUTHORIZED", "FORBIDDEN"]
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
      TOKEN_ERROR_CODES.includes(error.code)

    return (
      <Flex
        align="center"
        justify="center"
        minH="100dvh"
        bg="linear-gradient(180deg, #f8faf8 0%, #eef2ef 100%)"
        p={{ base: "4", md: "6" }}
      >
        <Box
          maxW="sm"
          w="100%"
          bg="white"
          borderWidth="1px"
          borderColor="sage.200"
          borderRadius="2xl"
          boxShadow="0 14px 36px rgba(30, 41, 32, 0.08)"
          overflow="hidden"
          px={{ base: "6", md: "8" }}
          py={{ base: "8", md: "10" }}
        >
          <VStack gap="6" align="center">
            <Image src={logo} alt={t("app.battalion")} w="72px" h="auto" />

            <VStack gap="2" align="center" textAlign="center">
              <Text fontWeight="700" textStyle={{ base: "xl", md: "2xl" }} color="fg.default">
                {isTokenError ? t("setup.tokenErrorTitle") : t("setup.genericErrorTitle")}
              </Text>
              <Text color="fg.muted" textStyle="sm">
                {isTokenError ? t("setup.tokenErrorDescription") : t("setup.genericErrorDescription")}
              </Text>
            </VStack>

            <Flex gap="3" w="100%" direction={{ base: "column", sm: "row" }}>
              {isTokenError ? (
                <>
                  <Button colorPalette="sage" variant="solid" flex="1" size="lg" onClick={resetSession}>
                    {t("setup.backendErrorReloginAction")}
                  </Button>
                  <Button colorPalette="sage" variant="outline" flex="1" size="lg" onClick={handleRetry}>
                    {t("setup.backendErrorRetrySecondary")}
                  </Button>
                </>
              ) : (
                <Button colorPalette="sage" variant="solid" w="100%" size="lg" onClick={handleRetry}>
                  {t("setup.backendErrorRetryAction")}
                </Button>
              )}
            </Flex>

            <Accordion.Root collapsible variant="plain" size="sm" w="100%">
              <Accordion.Item value="details">
                <Accordion.ItemTrigger cursor="pointer" px="0" justifyContent="center">
                  <Text textStyle="xs" color="fg.muted">
                    {t("setup.backendErrorDetailsTitle")}
                  </Text>
                  <Accordion.ItemIndicator>
                    <ChevronDown size={14} />
                  </Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Box
                    bg="gray.50"
                    borderRadius="lg"
                    px="4"
                    py="3"
                    mt="1"
                  >
                    <Text
                      color="fg.muted"
                      textStyle="xs"
                      wordBreak="break-word"
                      fontFamily="mono"
                      direction="ltr"
                      textAlign="left"
                    >
                      {technicalMessage}
                    </Text>
                  </Box>
                </Accordion.ItemContent>
              </Accordion.Item>
            </Accordion.Root>
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
