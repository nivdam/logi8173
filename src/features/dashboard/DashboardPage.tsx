import { Box, Button, Flex, Grid, Heading, Spinner, Text } from "@chakra-ui/react"
import {
  Package, AlertTriangle, XCircle, CalendarCheck,
  Plus, Search, ChevronLeft,
} from "lucide-react"
import { PageHeader } from "../../components/PageHeader"
import { ApiErrorState } from "../../components/ApiErrorState"
import { t } from "../../lib/i18n"
import { useDashboard, useActivities } from "../../api"
import { formatDateTime, getTransactionTypeLabel, getActivityStatusLabel } from "../../lib/formatters"
import { animations } from "../../theme/animations"
import { activityStatusColor } from "../activities/activity-helpers"
import type { Transaction } from "../../types"

const formatItemsSummary = (transaction: Transaction): string => {
  let totalQty = 0
  for (const item of transaction.items) {
    totalQty += Math.abs(item.qty)
  }
  if (transaction.items.length === 1) return `${transaction.items[0].name} (${totalQty})`
  return `${transaction.items.length} ${t("dashboard.txItems")} (${totalQty})`
}

export const DashboardPage = () => {
  const {
    data: dashboard,
    error: dashboardError,
    isPending: isDashboardPending,
    refetch: refetchDashboard,
  } = useDashboard()
  const {
    data: activities,
    error: activitiesError,
    isPending: isActivitiesPending,
    refetch: refetchActivities,
  } = useActivities()
  const isLoading = isDashboardPending || isActivitiesPending

  const handleRetry = () => {
    void refetchDashboard()
    void refetchActivities()
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="24">
        <Spinner size="lg" color="sage.400" />
      </Flex>
    )
  }

  if (dashboardError || activitiesError) {
    return (
      <ApiErrorState
        title={t("dashboard.title")}
        error={dashboardError ?? activitiesError}
        fallbackMessage={t("common.error")}
        actionLabel={t("common.retry")}
        onAction={handleRetry}
      />
    )
  }

  if (!dashboard || !activities) return null

  const maxIssuedCount = Math.max(...dashboard.companyBreakdown.map((breakdown) => breakdown.issuedCount))

  return (
  <Flex direction="column" gap={{ base: "6", md: "8" }}>
    {/* Header + actions */}
    <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap="4">
      <PageHeader title={t("dashboard.title")} description={t("dashboard.description")} />
      <Flex gap="3">
        <Button size="sm" variant="outline" borderRadius="lg" css={animations.cardHover}>
          <Search size={16} />
          {t("common.search")}
        </Button>
        <Button size="sm" borderRadius="lg" bg="sage.600" color="white" _hover={{ bg: "sage.700" }} css={animations.cardHover}>
          <Plus size={16} />
          {t("dashboard.newIssuance")}
        </Button>
      </Flex>
    </Flex>

    {/* Stat cards row */}
    <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={{ base: "3", md: "5" }}>
      <StatCard
        label={t("dashboard.totalItems")}
        value={dashboard.totalItems}
        icon={Package}
        color="sage.600"
        iconBg="sage.50"
        link={t("dashboard.viewInventory")}
        index={0}
      />
      <StatCard
        label={t("dashboard.lowStock")}
        value={dashboard.lowStockCount}
        icon={AlertTriangle}
        color="sunburst.400"
        iconBg="sunburst.400/10"
        link={t("dashboard.viewLowStock")}
        index={1}
      />
      <StatCard
        label={t("dashboard.gaps")}
        value={dashboard.gapCount}
        icon={XCircle}
        color="red.600"
        iconBg="rose.50"
        link={t("dashboard.viewGaps")}
        index={2}
      />
      <StatCard
        label={t("dashboard.activeActivities")}
        value={dashboard.activeActivities}
        icon={CalendarCheck}
        color="sky.600"
        iconBg="sky.50"
        link={t("dashboard.viewActivities")}
        index={3}
      />
    </Grid>

    {/* Two sections */}
    <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={{ base: "4", md: "5" }}>
      {/* Recent transactions */}
      <Box
        bg="bg.card"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="border"
        p={{ base: "5", md: "6" }}
        css={animations.delayedFadeInUp(0.25)}
      >
        <Flex justify="space-between" align="center" mb="5">
          <Flex align="center" gap="2">
            <Heading size="md" fontWeight="600">{t("dashboard.recentTransactions")}</Heading>
          </Flex>
          <Flex align="center" gap="1" color="sage.500" cursor="pointer" _hover={{ color: "sage.700" }} css={{ transition: "color 0.15s ease" }}>
            <Text textStyle="sm">{t("common.viewAll")}</Text>
            <ChevronLeft size={16} />
          </Flex>
        </Flex>

        <Flex direction="column" gap="0">
          {dashboard.recentTransactions.map((transaction, index) => (
            <Flex
              key={transaction.txId}
              gap="3"
              py="3.5"
              borderTopWidth={index > 0 ? "1px" : "0"}
              borderColor="border"
              align="center"
              css={{
                ...animations.listItem(index),
                
                transition: "background 0.15s ease",
                borderRadius: "var(--chakra-radii-lg)",
                marginInline: "-8px",
                paddingInline: "8px",
                "&:hover": { background: "var(--chakra-colors-bg-muted)" },
              }}
            >
              {/* Avatar circle with initials */}
              <Flex
                align="center"
                justify="center"
                w="10"
                h="10"
                borderRadius="full"
                bg={transaction.txType === "issue" ? "sage.100" : "sky.100"}
                color={transaction.txType === "issue" ? "sage.700" : "sky.700"}
                fontWeight="600"
                textStyle="sm"
                flexShrink={0}
              >
                {transaction.receiverName.split(" ").map((word) => word[0]).join("")}
              </Flex>
              {/* Details */}
              <Flex direction="column" gap="0.5" flex="1" minW="0">
                <Text textStyle="sm" fontWeight="600">{transaction.receiverName}</Text>
                <Text textStyle="xs" color="fg.muted" truncate>{formatItemsSummary(transaction)}</Text>
              </Flex>
              {/* Type badge */}
              <Flex
                px="2.5"
                py="1"
                borderRadius="full"
                bg={transaction.txType === "issue" ? "sage.50" : transaction.txType === "return" ? "sky.50" : "gray.100"}
                flexShrink={0}
              >
                <Text
                  textStyle="xs"
                  fontWeight="500"
                  color={transaction.txType === "issue" ? "sage.700" : transaction.txType === "return" ? "sky.700" : "gray.600"}
                >
                  {getTransactionTypeLabel(transaction.txType)}
                </Text>
              </Flex>
              {/* Date — desktop only */}
              <Text textStyle="xs" color="fg.muted" flexShrink={0} display={{ base: "none", md: "block" }}>
                {formatDateTime(transaction.performedAt)}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>

      {/* Activities + Company breakdown */}
      <Flex direction="column" gap={{ base: "4", md: "5" }}>
        {/* Activities */}
        <Box
          bg="bg.card"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="border"
          p={{ base: "5", md: "6" }}
          css={animations.delayedFadeInUp(0.35)}
        >
          <Flex justify="space-between" align="center" mb="5">
            <Flex align="center" gap="2">
              <CalendarCheck size={18} />
              <Heading size="md" fontWeight="600">{t("nav.activities")}</Heading>
            </Flex>
            <Flex align="center" gap="1" color="sage.500" cursor="pointer" _hover={{ color: "sage.700" }} css={{ transition: "color 0.15s ease" }}>
              <Text textStyle="sm">{t("common.viewAll")}</Text>
              <ChevronLeft size={16} />
            </Flex>
          </Flex>

          <Flex direction="column" gap="3">
            {activities.map((activity, index) => (
              <Flex
                key={activity.activityId}
                justify="space-between"
                align="center"
                p="3"
                borderRadius="xl"
                bg="bg.muted"
                cursor="pointer"
                css={{
                  ...animations.cardHover,
                  ...animations.listItem(index),
                  
                }}
              >
                <Flex direction="column" gap="0.5">
                  <Text textStyle="sm" fontWeight="500">{activity.name}</Text>
                  <Text textStyle="xs" color="fg.muted">{activity.startDate}</Text>
                </Flex>
                <Flex
                  px="2.5"
                  py="1"
                  borderRadius="full"
                  bg={`${activityStatusColor[activity.status]}/10`}
                >
                  <Text textStyle="xs" fontWeight="500" color={activityStatusColor[activity.status]}>
                    {getActivityStatusLabel(activity.status)}
                  </Text>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Box>

        {/* Company breakdown */}
        <Box
          bg="bg.card"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="border"
          p={{ base: "5", md: "6" }}
          css={animations.delayedFadeInUp(0.45)}
        >
          <Heading size="md" fontWeight="600" mb="5">{t("dashboard.companyBreakdown")}</Heading>
          <Flex direction="column" gap="4">
            {dashboard.companyBreakdown.map((company, index) => (
                <Flex
                  key={company.companyName}
                  direction="column"
                  gap="1.5"
                  css={{
                    ...animations.listItem(index),
                    
                  }}
                >
                  <Flex justify="space-between" align="baseline">
                    <Text textStyle="sm" fontWeight="500">{company.companyName}</Text>
                    <Text textStyle="sm" fontWeight="700">{company.issuedCount}</Text>
                  </Flex>
                  <Box h="2" bg="bg.muted" borderRadius="full" overflow="hidden">
                    <Box
                      h="full"
                      bg={["sage.400", "sky.400", "sunburst.400", "rose.300", "sage.600"][index % 5]}
                      borderRadius="full"
                      css={{
                        width: `${(company.issuedCount / maxIssuedCount) * 100}%`,
                        transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </Box>
                </Flex>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Grid>
  </Flex>
  )
}

const StatCard = ({ label, value, icon: Icon, color, iconBg, link, index }: StatCardProps) => (
  <Box
    bg="bg.card"
    borderRadius="2xl"
    borderWidth="1px"
    borderColor="border"
    p={{ base: "4", md: "5" }}
    css={{
      ...animations.cardHover,
      ...animations.listItem(index),
      
    }}
  >
    <Flex justify="space-between" align="start" mb={{ base: "3", md: "4" }}>
      <Text textStyle="sm" color="fg.muted">{label}</Text>
      <Flex
        align="center"
        justify="center"
        w="9"
        h="9"
        borderRadius="xl"
        bg={iconBg}
        color={color}
      >
        <Icon size={18} />
      </Flex>
    </Flex>
    <Heading size={{ base: "2xl", md: "3xl" }} fontWeight="700" color={color} lineHeight="1" mb="3">
      {value}
    </Heading>
    <Flex align="center" gap="1" color="fg.muted" cursor="pointer" _hover={{ color: "fg" }} css={{ transition: "color 0.15s ease" }}>
      <Text textStyle="xs">{link}</Text>
      <ChevronLeft size={14} />
    </Flex>
  </Box>
)

type StatCardProps = {
  label: string
  value: number
  icon: typeof Package
  color: string
  iconBg: string
  link: string
  index: number
}
