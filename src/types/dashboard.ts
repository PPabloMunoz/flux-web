export interface Transaction {
    id: number;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    account_id: number;
    category_id: number;
    category_name: string;
    category_color: string;
    account_name: string;
    transfer_id?: number;
}

export interface DashboardData {
    total_balance: number;
    monthly_income: number;
    monthly_expenses: number;
    total_balance_change_pct: number;
    monthly_income_change_pct: number;
    monthly_expenses_change_pct: number;
    last_transactions: Transaction[];
}
