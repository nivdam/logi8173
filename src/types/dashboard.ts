import type { Transaction } from "./transaction";

export type CompanyBreakdown = {
  companyName: string;
  issuedCount: number;
};

export type DashboardSummary = {
  totalItems: number;
  lowStockCount: number;
  gapCount: number;
  activeActivities: number;
  recentTransactions: Transaction[];
  companyBreakdown: CompanyBreakdown[];
};
