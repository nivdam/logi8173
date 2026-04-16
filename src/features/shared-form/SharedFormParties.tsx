import { Box, Flex, Text, VStack } from "@chakra-ui/react"
import { User, Shield } from "lucide-react"
import { t } from "../../lib/i18n"
import type { PublicTransaction } from "../../types"

export const SharedFormParties = ({ transaction }: Props) => {
  const soldier = transaction.soldier
  const operator = transaction.operator
  const isIssuanceType = transaction.txType === "issue" || transaction.txType === "borrow_in"

  const soldierName = soldier?.fullName
    || (isIssuanceType ? transaction.receiverName : transaction.giverName)
    || ""
  const soldierPersonalId = soldier?.personalId
    || (isIssuanceType ? transaction.receiverPersonalId : transaction.giverPersonalId)
    || ""

  return (
    <Flex gap="4" direction={{ base: "column", md: "row" }}>
      <Box
        flex="1"
        bg="bg.muted"
        borderRadius="xl"
        p="4"
      >
        <Flex align="center" gap="2" mb="3">
          <User size={16} color="var(--chakra-colors-fg-muted)" />
          <Text textStyle="xs" fontWeight="600" color="fg.muted" textTransform="uppercase">
            {t("sharedForm.soldierDetails")}
          </Text>
        </Flex>
        <VStack gap="1.5" align="stretch">
          <DetailRow label={t("sharedForm.name")} value={soldierName} />
          <DetailRow label={t("sharedForm.personalId")} value={soldierPersonalId} />
          {soldier?.rank && <DetailRow label={t("sharedForm.rank")} value={soldier.rank} />}
          {soldier?.company && <DetailRow label={t("sharedForm.company")} value={soldier.company} />}
        </VStack>
      </Box>

      <Box
        flex="1"
        bg="bg.muted"
        borderRadius="xl"
        p="4"
      >
        <Flex align="center" gap="2" mb="3">
          <Shield size={16} color="var(--chakra-colors-fg-muted)" />
          <Text textStyle="xs" fontWeight="600" color="fg.muted" textTransform="uppercase">
            {t("sharedForm.operatorDetails")}
          </Text>
        </Flex>
        <VStack gap="1.5" align="stretch">
          <DetailRow
            label={t("sharedForm.name")}
            value={operator?.fullName || transaction.performedBy}
          />
          {operator?.role && (
            <DetailRow label={t("sharedForm.role")} value={t(`roles.${operator.role}`)} />
          )}
        </VStack>
      </Box>
    </Flex>
  )
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <Flex justify="space-between" align="center">
    <Text textStyle="xs" color="fg.muted">{label}</Text>
    <Text textStyle="sm" fontWeight="500">{value}</Text>
  </Flex>
)

type Props = {
  transaction: PublicTransaction
}

type DetailRowProps = {
  label: string
  value: string
}
