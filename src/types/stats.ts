export interface CashFlowPoint {
  month: string;
  income: number;
  expenses: number;
}

export interface BalancePoint {
  month: string;
  balance: number;
}

export interface CategoryStat {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface StatsData {
  cash_flow: CashFlowPoint[];
  balance_history: BalancePoint[];
  categories: CategoryStat[];
}
