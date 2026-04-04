import { Box, Grid, Heading, Text } from "@chakra-ui/react"
import { t } from "../../lib/i18n"
import { formatDateTime, getTransactionTypeLabel } from "../../lib/formatters"
import type { Transaction } from "../../types"

const formatItemsSummary = (transaction: Transaction): string => {
  const totalQty = transaction.items.reduce((sum, item) => sum + Math.abs(item.qty), 0)
  if (transaction.items.length === 1) return `${transaction.items[0].name} (${totalQty})`
  return `${transaction.items.length} ${t("dashboard.txItems")} (${totalQty})`
}

export const RecentTransactions = ({ transactions }: Props) => (
  <Box
    bg="bg.card"
    borderRadius="xl"
    borderWidth="1px"
    borderColor="border"
    p="5"
  >
    <Heading size="md" fontWeight="600" mb="4">
      {t("dashboard.recentTransactions")}
    </Heading>
    <Grid gap="0" role="table">
      <Grid
        templateColumns="1fr 1fr 1fr auto"
        gap="4"
        py="2"
        px="3"
        role="row"
      >
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("dashboard.txType")}</Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("dashboard.txReceiver")}</Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("dashboard.txItems")}</Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("dashboard.txDate")}</Text>
      </Grid>
      {transactions.map((transaction) => (
        <Grid
          key={transaction.txId}
          templateColumns="1fr 1fr 1fr auto"
          gap="4"
          py="2.5"
          px="3"
          borderTopWidth="1px"
          borderColor="border"
          role="row"
          _hover={{ bg: "bg.muted" }}
        >
          <Text textStyle="sm" role="cell">{getTransactionTypeLabel(transaction.txType)}</Text>
          <Text textStyle="sm" role="cell">{transaction.receiverName}</Text>
          <Text textStyle="sm" role="cell" color="fg.muted">{formatItemsSummary(transaction)}</Text>
          <Text textStyle="xs" color="fg.muted" role="cell">{formatDateTime(transaction.performedAt)}</Text>
        </Grid>
      ))}
    </Grid>
  </Box>
)

type Props = {
  transactions: Transaction[]
}
