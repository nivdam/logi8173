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
  damageBreakdown: [
    {
      companyName: "פלוגה א'",
      totalDamagedQty: 19,
      items: [
        { itemName: "חולצות דרייפיט", qty: 5 },
        { itemName: "מכנסי מדי ב'", qty: 6 },
        { itemName: "שק״שים", qty: 8 },
      ],
    },
    {
      companyName: "פלוגה ב'",
      totalDamagedQty: 7,
      items: [
        { itemName: "כפפות עבודה", qty: 4 },
        { itemName: "וסט מגן", qty: 3 },
      ],
    },
    {
      companyName: "פלוגה ג'",
      totalDamagedQty: 12,
      items: [
        { itemName: "שק שינה", qty: 3 },
        { itemName: "פנס טקטי", qty: 2 },
        { itemName: "חולצות דרייפיט", qty: 4 },
        { itemName: "מטען USB נייד", qty: 3 },
      ],
    },
    {
      companyName: "מפקדה",
      totalDamagedQty: 2,
      items: [
        { itemName: "אוזניות תקשורת", qty: 2 },
      ],
    },
    {
      companyName: "סיירת",
      totalDamagedQty: 9,
      items: [
        { itemName: "קסדה קרבית", qty: 3 },
        { itemName: "מכשיר קשר מוטורולה", qty: 2 },
        { itemName: "שק״שים", qty: 4 },
      ],
    },
  ],
}
