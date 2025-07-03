export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  user_id?: number;
}

export interface Transaction {
  id: number;
  amount: number;
  description?: string;
  category_id: number;
  category_name?: string;
  category_color?: string;
  type: 'income' | 'expense';
  date: string;
  user_id: number;
  created_at: string;
}

export interface Budget {
  id: number;
  category_id: number;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  user_id: number;
  created_at: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: {
    name: string;
    color: string;
    total: number;
  }[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface TransactionFormData {
  amount: number;
  description: string;
  category_id: number;
  type: 'income' | 'expense';
  date: string;
}

export interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
  color: string;
}