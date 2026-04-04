import type { DashboardSummary } from "../types"
import { transactionsMock } from "./transactions.mock"

export const dashboardMock: DashboardSummary = {
  totalItems: 18,
  lowStockCount: 4,
  gapCount: 3,
  activeActivities: 1,
  recentTransactions: transactionsMock.slice(0, 5),
  companyBreakdown: [
    { companyName: "פלוגה א'", issuedCount: 42 },
    { companyName: "פלוגה ב'", issuedCount: 38 },
    { companyName: "פלוגה ג'", issuedCount: 25 },
    { companyName: "מפקדה", issuedCount: 15 },
    { companyName: "סיירת", issuedCount: 31 },
  ],
}
