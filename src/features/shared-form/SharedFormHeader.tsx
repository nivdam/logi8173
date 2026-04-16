import { Badge, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { FileText, Calendar, Clock, MapPin } from "lucide-react"
import { t } from "../../lib/i18n"
import type { PublicTransaction } from "../../types"

const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return isoString
  }
}

const formatTime = (isoString: string): string => {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

const transactionTypeLabel = (txType: PublicTransaction["txType"]): string => {
  const labels: Record<PublicTransaction["txType"], string> = {
    issue: t("transaction.issue"),
    return: t("transaction.return"),
    borrow_in: t("transaction.borrowIn"),
    return_borrow: t("transaction.returnBorrow"),
    count_adjustment: t("transaction.countAdjustment"),
    write_off: t("transaction.writeOff"),
  }
  return labels[txType]
}

const transactionTypeColor = (txType: PublicTransaction["txType"]): string => {
  if (txType === "issue" || txType === "borrow_in") return "green"
  if (txType === "return" || txType === "return_borrow") return "blue"
  return "gray"
}

export const SharedFormHeader = ({ transaction }: Props) => (
  <VStack gap="4" align="stretch">
    <Flex align="center" justify="space-between">
      <Flex align="center" gap="2">
        <FileText size={20} color="var(--chakra-colors-fg-muted)" />
        <Heading size="lg" fontWeight="700">
          {transaction.txType === "issue"
            ? t("sharedForm.issuanceTitle")
            : t("sharedForm.returnTitle")}
        </Heading>
      </Flex>
      <Badge
        colorPalette={transactionTypeColor(transaction.txType)}
        size="lg"
        px="3"
        py="1"
        borderRadius="full"
      >
        {transactionTypeLabel(transaction.txType)}
      </Badge>
    </Flex>

    {transaction.formNumber && (
      <Text textStyle="sm" color="fg.muted" fontWeight="600">
        {t("sharedForm.formNumber")} {transaction.formNumber}
      </Text>
    )}

    <Flex gap="4" wrap="wrap">
      <Flex align="center" gap="1.5">
        <Calendar size={14} color="var(--chakra-colors-fg-muted)" />
        <Text textStyle="sm" color="fg.muted">
          {formatDate(transaction.performedAt)}
        </Text>
      </Flex>
      <Flex align="center" gap="1.5">
        <Clock size={14} color="var(--chakra-colors-fg-muted)" />
        <Text textStyle="sm" color="fg.muted">
          {formatTime(transaction.performedAt)}
        </Text>
      </Flex>
      {transaction.activityName && (
        <Flex align="center" gap="1.5">
          <MapPin size={14} color="var(--chakra-colors-fg-muted)" />
          <Text textStyle="sm" color="fg.muted">
            {transaction.activityName}
          </Text>
        </Flex>
      )}
    </Flex>
  </VStack>
)

type Props = {
  transaction: PublicTransaction
}
