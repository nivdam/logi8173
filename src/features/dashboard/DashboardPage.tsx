import { Grid, VStack } from "@chakra-ui/react"
import { PageHeader } from "../../components/PageHeader"
import { t } from "../../lib/i18n"
import { dashboardMock } from "../../mocks/dashboard.mock"
import { SummaryCards } from "./SummaryCards"
import { RecentTransactions } from "./RecentTransactions"
import { CompanyBreakdown } from "./CompanyBreakdown"

export const DashboardPage = () => (
  <VStack align="stretch" gap="6">
    <PageHeader title={t("dashboard.title")} description={t("dashboard.description")} />
    <SummaryCards summary={dashboardMock} />
    <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="6">
      <RecentTransactions transactions={dashboardMock.recentTransactions} />
      <CompanyBreakdown breakdown={dashboardMock.companyBreakdown} />
    </Grid>
  </VStack>
)
