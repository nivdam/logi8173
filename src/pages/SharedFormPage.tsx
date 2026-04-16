import { Box, Flex, Heading, Image, Separator, Spinner, Text, VStack } from "@chakra-ui/react"
import { AlertTriangle } from "lucide-react"
import { useParams } from "react-router-dom"
import { usePublicTransaction } from "../api"
import { SharedFormHeader } from "../features/shared-form/SharedFormHeader"
import { SharedFormItems } from "../features/shared-form/SharedFormItems"
import { SharedFormParties } from "../features/shared-form/SharedFormParties"
import { SharedFormSignatures } from "../features/shared-form/SharedFormSignatures"
import { t } from "../lib/i18n"
import { animations } from "../theme/animations"
import logo from "../assets/logo-with-text.png"

export const SharedFormPage = () => {
  const { activityId = "", txId = "" } = useParams<SharedFormPageParams>()
  const { data: transaction, isLoading, isError } = usePublicTransaction(activityId, txId)

  if (isLoading) {
    return <LoadingState />
  }

  if (isError || !transaction) {
    return <ErrorState />
  }

  return (
    <Flex
      direction="column"
      align="center"
      minH="100dvh"
      bg="bg"
      p="4"
      css={animations.fadeInUp}
    >
      <Box maxW="600px" w="full" py="6">
        <VStack gap="6" align="stretch">
          <Flex justify="center">
            <Image src={logo} alt={t("app.battalion")} w="100px" h="auto" opacity={0.7} />
          </Flex>

          <SharedFormHeader transaction={transaction} />
          <Separator />
          <SharedFormParties transaction={transaction} />
          <SharedFormItems items={transaction.items} />

          {transaction.notes && (
            <Box bg="bg.muted" borderRadius="xl" p="4">
              <Text textStyle="xs" fontWeight="600" color="fg.muted" mb="1">
                {t("sharedForm.notes")}
              </Text>
              <Text textStyle="sm">{transaction.notes}</Text>
            </Box>
          )}

          <SharedFormSignatures signatureBase64={transaction.signatureBase64} />

          <Text textStyle="xs" color="fg.muted" textAlign="center" mt="4">
            {t("sharedForm.generatedBy")}
          </Text>
        </VStack>
      </Box>
    </Flex>
  )
}

const LoadingState = () => (
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

const ErrorState = () => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    minH="100dvh"
    bg="bg"
    p="6"
    css={animations.fadeInUp}
  >
    <VStack gap="4" align="center">
      <Flex
        align="center"
        justify="center"
        w="16"
        h="16"
        borderRadius="full"
        bg="red.50"
      >
        <AlertTriangle size={32} color="var(--chakra-colors-red-500)" />
      </Flex>
      <Heading size="lg" fontWeight="600" textAlign="center">
        {t("sharedForm.error")}
      </Heading>
      <Text color="fg.muted" textStyle="sm" textAlign="center">
        {t("sharedForm.notFound")}
      </Text>
    </VStack>
  </Flex>
)

type SharedFormPageParams = {
  activityId: string
  txId: string
}
