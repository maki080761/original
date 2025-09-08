// CLAUDE.mdで定義されたデータ構造

export interface ShiftData {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyWage: number;
  totalIncome: number;
}

export interface ExpenseData {
  id: string;
  date: string;
  amount: number;
  category: string;
  categoryIcon: string;
  categoryName: string;
}

export interface BalanceData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

// バイト以外の臨時収入データ
export interface ExtraIncomeData {
  id: string;
  date: string;
  amount: number;
  source: string;
  sourceIcon: string;
  sourceName: string;
  description?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}