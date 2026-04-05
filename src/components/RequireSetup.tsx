import { Flex, Spinner, Text, VStack } from "@chakra-ui/react"
import { useSetupStatus } from "../api"
import { SetupPage } from "../pages/SetupPage"
import { t } from "../lib/i18n"

export const RequireSetup = ({ children }: Props) => {
  const { data, isPending, error, refetch } = useSetupStatus()

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

  // API unreachable — show app with mock data
  if (error) {
    return children
  }

  // System not initialized — show setup wizard
  if (data && !data.initialized) {
    return <SetupPage onComplete={() => refetch()} />
  }

  return children
}

type Props = {
  children: React.ReactNode
}
