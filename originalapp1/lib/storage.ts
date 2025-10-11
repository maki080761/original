import { ShiftData, ExpenseData, ExtraIncomeData, BalanceData } from './types';

const STORAGE_KEYS = {
  SHIFTS: 'kakeibo_shifts',
  EXPENSES: 'kakeibo_expenses',
  EXTRA_INCOMES: 'kakeibo_extra_incomes',
} as const;

// シフトデータの管理
export const shiftStorage = {
  // 全シフトデータを取得
  getAll: (): ShiftData[] => {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    return data ? JSON.parse(data) : [];
  },

  // シフトデータを保存
  save: (shift: Omit<ShiftData, 'id'>): ShiftData => {
    const shifts = shiftStorage.getAll();
    const newShift: ShiftData = {
      ...shift,
      id: Date.now().toString(),
    };
    
    shifts.push(newShift);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    return newShift;
  },

  // シフトデータを更新
  update: (id: string, updatedShift: Partial<Omit<ShiftData, 'id'>>): ShiftData | null => {
    const shifts = shiftStorage.getAll();
    const index = shifts.findIndex(shift => shift.id === id);
    
    if (index === -1) return null;
    
    shifts[index] = { ...shifts[index], ...updatedShift };
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    return shifts[index];
  },

  // シフトデータを削除
  delete: (id: string): boolean => {
    const shifts = shiftStorage.getAll();
    const filteredShifts = shifts.filter(shift => shift.id !== id);
    
    if (filteredShifts.length === shifts.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(filteredShifts));
    return true;
  },
};

// 支出データの管理
export const expenseStorage = {
  // 全支出データを取得
  getAll: (): ExpenseData[] => {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },

  // 支出データを保存
  save: (expense: Omit<ExpenseData, 'id'>): ExpenseData => {
    const expenses = expenseStorage.getAll();
    const newExpense: ExpenseData = {
      ...expense,
      id: Date.now().toString(),
    };
    
    expenses.push(newExpense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return newExpense;
  },

  // 支出データを更新
  update: (id: string, updatedExpense: Partial<Omit<ExpenseData, 'id'>>): ExpenseData | null => {
    const expenses = expenseStorage.getAll();
    const index = expenses.findIndex(expense => expense.id === id);
    
    if (index === -1) return null;
    
    expenses[index] = { ...expenses[index], ...updatedExpense };
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return expenses[index];
  },

  // 支出データを削除
  delete: (id: string): boolean => {
    const expenses = expenseStorage.getAll();
    const filteredExpenses = expenses.filter(expense => expense.id !== id);
    
    if (filteredExpenses.length === expenses.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filteredExpenses));
    return true;
  },
};

// 臨時収入データの管理
export const extraIncomeStorage = {
  // 全臨時収入データを取得
  getAll: (): ExtraIncomeData[] => {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(STORAGE_KEYS.EXTRA_INCOMES);
    return data ? JSON.parse(data) : [];
  },

  // 臨時収入データを保存
  save: (income: Omit<ExtraIncomeData, 'id'>): ExtraIncomeData => {
    const incomes = extraIncomeStorage.getAll();
    const newIncome: ExtraIncomeData = {
      ...income,
      id: Date.now().toString(),
    };
    
    incomes.push(newIncome);
    localStorage.setItem(STORAGE_KEYS.EXTRA_INCOMES, JSON.stringify(incomes));
    return newIncome;
  },

  // 臨時収入データを更新
  update: (id: string, updatedIncome: Partial<Omit<ExtraIncomeData, 'id'>>): ExtraIncomeData | null => {
    const incomes = extraIncomeStorage.getAll();
    const index = incomes.findIndex(income => income.id === id);
    
    if (index === -1) return null;
    
    incomes[index] = { ...incomes[index], ...updatedIncome };
    localStorage.setItem(STORAGE_KEYS.EXTRA_INCOMES, JSON.stringify(incomes));
    return incomes[index];
  },

  // 臨時収入データを削除
  delete: (id: string): boolean => {
    const incomes = extraIncomeStorage.getAll();
    const filteredIncomes = incomes.filter(income => income.id !== id);
    
    if (filteredIncomes.length === incomes.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.EXTRA_INCOMES, JSON.stringify(filteredIncomes));
    return true;
  },
};

// 残高計算
export const calculateBalance = (): BalanceData => {
  const shifts = shiftStorage.getAll();
  const expenses = expenseStorage.getAll();
  const extraIncomes = extraIncomeStorage.getAll();

  const shiftIncome = shifts.reduce((sum, shift) => sum + shift.totalIncome, 0);
  const extraIncome = extraIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalIncome = shiftIncome + extraIncome;
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    shiftIncome,
    extraIncome,
    totalExpense,
    balance,
  };
};

// 時給設定の管理
export const hourlyWageStorage = {
  // 最後に使用した時給を保存
  save: (hourlyWage: number): void => {
    localStorage.setItem('kakeibo_last_hourly_wage', hourlyWage.toString());
  },

  // 最後に使用した時給を取得
  get: (): number | null => {
    if (typeof window === 'undefined') return null;
    
    const saved = localStorage.getItem('kakeibo_last_hourly_wage');
    return saved ? parseFloat(saved) : null;
  },
};

// シフト時間とシフト数の記憶管理
export const shiftTimeStorage = {
  // 前日のシフト時間とシフト数を保存
  save: (shifts: { startTime: string; endTime: string }[]): void => {
    const shiftData = { shifts, count: shifts.length };
    localStorage.setItem('kakeibo_last_shift_data', JSON.stringify(shiftData));
  },

  // 前日のシフト時間とシフト数を取得
  get: (): { shifts: { startTime: string; endTime: string }[]; count: number } | null => {
    if (typeof window === 'undefined') return null;
    
    const saved = localStorage.getItem('kakeibo_last_shift_data');
    return saved ? JSON.parse(saved) : null;
  },
};

// データを全て削除（デバッグ用）
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.SHIFTS);
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  localStorage.removeItem(STORAGE_KEYS.EXTRA_INCOMES);
  localStorage.removeItem('kakeibo_last_hourly_wage');
  localStorage.removeItem('kakeibo_last_shift_data');
  localStorage.removeItem('kakeibo_last_shift_times'); // 旧形式も削除
};