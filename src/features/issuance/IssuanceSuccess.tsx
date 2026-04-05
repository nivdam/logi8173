import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { CheckCircle2, ArrowLeft, Plus } from "lucide-react"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import type { Soldier } from "../../types"

export const IssuanceSuccess = ({ receiver, itemCount, onNewIssuance, onBackToDashboard }: Props) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    minH="60dvh"
    css={animations.fadeInUp}
  >
    <VStack gap="6" align="center" maxW="400px">
      <Flex
        align="center"
        justify="center"
        w="16"
        h="16"
        borderRadius="full"
        bg="green.50"
      >
        <CheckCircle2 size={32} color="var(--chakra-colors-green-600)" />
      </Flex>

      <VStack gap="2">
        <Heading size="xl" fontWeight="700" textAlign="center">
          {t("issuance.successTitle")}
        </Heading>
        <Text color="fg.muted" textAlign="center" textStyle="sm">
          {t("issuance.successDescription")}
        </Text>
      </VStack>

      <Box
        bg="bg.muted"
        borderRadius="xl"
        p="4"
        w="100%"
        textAlign="center"
      >
        <Text textStyle="xs" color="fg.muted" mb="1">{t("issuance.issuedTo")}</Text>
        <Text textStyle="lg" fontWeight="700">{receiver.fullName}</Text>
        <Text textStyle="sm" color="fg.muted">
          {receiver.personalId} · {itemCount} {t("issuance.reviewItems")}
        </Text>
      </Box>

      <VStack w="100%" gap="3">
        <Button
          w="100%"
          size="lg"
          bg="sage.600"
          color="white"
          borderRadius="xl"
          _hover={{ bg: "sage.700" }}
          onClick={onNewIssuance}
        >
          <Plus size={18} />
          {t("issuance.newIssuance")}
        </Button>
        <Button
          w="100%"
          size="lg"
          variant="outline"
          borderRadius="xl"
          onClick={onBackToDashboard}
        >
          <ArrowLeft size={18} />
          {t("issuance.backToDashboard")}
        </Button>
      </VStack>
    </VStack>
  </Flex>
)

type Props = {
  receiver: Soldier
  itemCount: number
  onNewIssuance: () => void
  onBackToDashboard: () => void
}
