export interface RecurrentPayment {
  id: number;
  account_id: number;
  category_id?: number;
  amount: number;
  type: 'income' | 'expense';
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  last_executed?: string;
  next_date: string;
  is_active: boolean;
  created_at: string;
  
  // Joined fields if any (following the pattern in dashboard types)
  account_name?: string;
  category_name?: string;
  category_color?: string;
}
