import { Button, Flex, Spinner, Text, VStack } from "@chakra-ui/react"
import { ApiError } from "../lib/api"
import { useSetupStatus } from "../api"
import { SetupPage } from "../pages/SetupPage"
import { AuthErrorCard } from "./AuthErrorCard"
import { PermissionDeniedScreen } from "./PermissionDeniedScreen"
import { t } from "../lib/i18n"

const PERMISSION_ERROR_CODES = ["UNAUTHORIZED", "FORBIDDEN"]

export const RequireSetup = ({ children }: Props) => {
  const { data, isPending, error, refetch } = useSetupStatus()

  const handleRetry = () => {
    void refetch()
  }

  if (isPending) {
    return (
      <Flex align="center" justify="center" minH="100dvh" bg="bg">
        <VStack gap="4">
          <Spinner size="lg" color="forest.400" />
          <Text color="fg.muted" textStyle="sm">
            {t("setup.checking")}
          </Text>
        </VStack>
      </Flex>
    )
  }

  if (error) {
    if (error instanceof ApiError && PERMISSION_ERROR_CODES.includes(error.code)) {
      return <PermissionDeniedScreen error={error} />
    }

    const technicalMessage =
      error instanceof ApiError ? `${error.code}: ${error.message}` : t("common.error")

    return (
      <AuthErrorCard
        title={t("setup.genericErrorTitle")}
        description={t("setup.genericErrorDescription")}
        technicalMessage={technicalMessage}
      >
        <Button colorPalette="primary" variant="solid" w="100%" size="lg" onClick={handleRetry}>
          {t("setup.backendErrorRetryAction")}
        </Button>
      </AuthErrorCard>
    )
  }

  if (data && !data.initialized) {
    return <SetupPage onComplete={handleRetry} />
  }

  return children
}

type Props = {
  children: React.ReactNode
}
