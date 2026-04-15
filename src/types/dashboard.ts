import type { Transaction } from "./transaction";

export type CompanyBreakdown = {
  companyName: string;
  issuedCount: number;
};

export type DamagedItemDetail = {
  itemName: string;
  qty: number;
};

export type CompanyDamageBreakdown = {
  companyName: string;
  totalDamagedQty: number;
  items: DamagedItemDetail[];
};

export type DashboardSummary = {
  totalItems: number;
  lowStockCount: number;
  gapCount: number;
  activeActivities: number;
  recentTransactions: Transaction[];
  companyBreakdown: CompanyBreakdown[];
  damageBreakdown?: CompanyDamageBreakdown[];
};
