import { Grid } from "@chakra-ui/react"
import { Package, AlertTriangle, XCircle, CalendarCheck } from "lucide-react"
import { StatCard } from "../../components/StatCard"
import { t } from "../../lib/i18n"
import type { DashboardSummary } from "../../types"

export const SummaryCards = ({ summary }: Props) => (
  <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={{ base: "3", md: "4" }}>
    <StatCard icon={Package} value={summary.totalItems} label={t("dashboard.totalItems")} color="sky.600" bgTint="sky.50" />
    <StatCard icon={AlertTriangle} value={summary.lowStockCount} label={t("dashboard.lowStock")} color="yellow.600" bgTint="yellow.600/10" />
    <StatCard icon={XCircle} value={summary.gapCount} label={t("dashboard.gaps")} color="red.600" bgTint="rose.50" />
    <StatCard icon={CalendarCheck} value={summary.activeActivities} label={t("dashboard.activeActivities")} color="sage.600" bgTint="sage.50" />
  </Grid>
)

type Props = {
  summary: DashboardSummary
}
