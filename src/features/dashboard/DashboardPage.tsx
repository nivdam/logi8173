import { Box, Flex, Grid, Heading, Text } from "@chakra-ui/react"
import { Package, AlertTriangle, XCircle, CalendarCheck, ArrowUpRight } from "lucide-react"
import { t } from "../../lib/i18n"
import { dashboardMock } from "../../mocks/dashboard.mock"
import { formatDateTime, getTransactionTypeLabel } from "../../lib/formatters"
import { animations } from "../../theme/animations"
import { CompanyBreakdown } from "./CompanyBreakdown"
import type { Transaction } from "../../types"

const formatItemsSummary = (transaction: Transaction): string => {
  const totalQty = transaction.items.reduce((sum, item) => sum + Math.abs(item.qty), 0)
  if (transaction.items.length === 1) return `${transaction.items[0].name} (${totalQty})`
  return `${transaction.items.length} ${t("dashboard.txItems")} (${totalQty})`
}

export const DashboardPage = () => (
  <Flex direction="column" gap={{ base: "6", md: "8" }}>
    {/* Hero greeting */}
    <Box css={{ ...animations.fadeInUp, "@keyframes fadeInUp": animations.fadeInUp["@keyframes fadeInUp"] }}>
      <Heading size={{ base: "xl", md: "2xl" }} fontWeight="700" mb="1">
        {t("dashboard.title")}
      </Heading>
      <Text textStyle={{ base: "sm", md: "md" }} color="fg.muted">
        {t("dashboard.description")}
      </Text>
    </Box>

    {/* Bento Grid */}
    <Grid
      templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
      templateRows={{ base: "auto", md: "auto auto" }}
      gap={{ base: "4", md: "5" }}
    >
      {/* Big stat — total items (spans 2 cols) */}
      <BentoCard colSpan={{ base: 1, md: 2 }} index={0}>
        <Flex align="center" gap="4" mb="3">
          <Flex align="center" justify="center" w="12" h="12" borderRadius="xl" bg="sky.50" color="sky.600">
            <Package size={24} />
          </Flex>
          <Box>
            <Heading size={{ base: "3xl", md: "3xl" }} fontWeight="800" color="sky.600" lineHeight="1">
              {dashboardMock.totalItems}
            </Heading>
          </Box>
        </Flex>
        <Text textStyle="md" fontWeight="500">{t("dashboard.totalItems")}</Text>
        <Text textStyle="sm" color="fg.muted" mt="1">{t("dashboard.description")}</Text>
      </BentoCard>

      {/* Low stock */}
      <BentoCard index={1}>
        <Flex align="center" justify="center" w="10" h="10" borderRadius="xl" bg="yellow.600/10" color="yellow.600" mb="3">
          <AlertTriangle size={20} />
        </Flex>
        <Heading size="2xl" fontWeight="800" color="yellow.600" lineHeight="1" mb="2">
          {dashboardMock.lowStockCount}
        </Heading>
        <Text textStyle="sm" color="fg.muted">{t("dashboard.lowStock")}</Text>
      </BentoCard>

      {/* Gaps */}
      <BentoCard index={2} highlight={dashboardMock.gapCount > 0}>
        <Flex align="center" justify="center" w="10" h="10" borderRadius="xl" bg="rose.50" color="red.600" mb="3">
          <XCircle size={20} />
        </Flex>
        <Heading size="2xl" fontWeight="800" color="red.600" lineHeight="1" mb="2">
          {dashboardMock.gapCount}
        </Heading>
        <Text textStyle="sm" color="fg.muted">{t("dashboard.gaps")}</Text>
      </BentoCard>

      {/* Active activities */}
      <BentoCard index={3}>
        <Flex align="center" justify="center" w="10" h="10" borderRadius="xl" bg="sage.50" color="sage.600" mb="3">
          <CalendarCheck size={20} />
        </Flex>
        <Heading size="2xl" fontWeight="800" color="sage.600" lineHeight="1" mb="2">
          {dashboardMock.activeActivities}
        </Heading>
        <Text textStyle="sm" color="fg.muted">{t("dashboard.activeActivities")}</Text>
      </BentoCard>

      {/* Recent transactions (spans 3 cols) */}
      <BentoCard colSpan={{ base: 1, md: 3 }} index={4}>
        <Flex justify="space-between" align="center" mb="5">
          <Heading size="md" fontWeight="600">{t("dashboard.recentTransactions")}</Heading>
          <Flex align="center" gap="1" color="sage.500" cursor="pointer" _hover={{ color: "sage.700" }} css={{ transition: "color 0.15s ease" }}>
            <Text textStyle="xs">{t("common.viewAll")}</Text>
            <ArrowUpRight size={14} />
          </Flex>
        </Flex>

        {/* Desktop rows */}
        <Flex direction="column" gap="0" display={{ base: "none", md: "flex" }}>
          {dashboardMock.recentTransactions.map((transaction, index) => (
            <Flex
              key={transaction.txId}
              align="center"
              justify="space-between"
              py="3.5"
              borderTopWidth={index > 0 ? "1px" : "0"}
              borderColor="border"
              css={{
                ...animations.listItem(index),
                "@keyframes fadeInUp": animations.fadeInUp["@keyframes fadeInUp"],
              }}
            >
              <Flex direction="column" gap="0.5">
                <Text textStyle="sm" fontWeight="500">{transaction.receiverName}</Text>
                <Text textStyle="xs" color="fg.muted">{formatItemsSummary(transaction)}</Text>
              </Flex>
              <Flex direction="column" align="end" gap="0.5">
                <Text textStyle="xs" fontWeight="500" color={transaction.txType === "issue" ? "sage.600" : "sky.600"}>
                  {getTransactionTypeLabel(transaction.txType)}
                </Text>
                <Text textStyle="xs" color="fg.muted">{formatDateTime(transaction.performedAt)}</Text>
              </Flex>
            </Flex>
          ))}
        </Flex>

        {/* Mobile cards */}
        <Flex direction="column" gap="3" display={{ base: "flex", md: "none" }}>
          {dashboardMock.recentTransactions.map((transaction, index) => (
            <Box
              key={transaction.txId}
              p="3"
              borderRadius="lg"
              bg="bg.muted"
              css={{
                ...animations.listItem(index),
                "@keyframes fadeInUp": animations.fadeInUp["@keyframes fadeInUp"],
              }}
            >
              <Flex justify="space-between" align="center" mb="1">
                <Text textStyle="sm" fontWeight="500">{transaction.receiverName}</Text>
                <Text textStyle="xs" fontWeight="500" color={transaction.txType === "issue" ? "sage.600" : "sky.600"}>
                  {getTransactionTypeLabel(transaction.txType)}
                </Text>
              </Flex>
              <Text textStyle="xs" color="fg.muted">
                {formatItemsSummary(transaction)} · {formatDateTime(transaction.performedAt)}
              </Text>
            </Box>
          ))}
        </Flex>
      </BentoCard>

      {/* Company breakdown (1 col) */}
      <Box css={{ ...animations.listItem(5), "@keyframes fadeInUp": animations.fadeInUp["@keyframes fadeInUp"] }}>
        <CompanyBreakdown breakdown={dashboardMock.companyBreakdown} />
      </Box>
    </Grid>
  </Flex>
)

const BentoCard = ({ children, colSpan, index = 0, highlight = false }: BentoCardProps) => (
  <Box
    p={{ base: "5", md: "6" }}
    bg="bg.card"
    borderRadius="2xl"
    borderWidth="1px"
    borderColor={highlight ? "red.600/30" : "border"}
    gridColumn={colSpan}
    css={{
      ...animations.cardHover,
      ...animations.listItem(index),
      "@keyframes fadeInUp": animations.fadeInUp["@keyframes fadeInUp"],
    }}
  >
    {children}
  </Box>
)

type BentoCardProps = {
  children: React.ReactNode
  colSpan?: Record<string, number>
  index?: number
  highlight?: boolean
}
