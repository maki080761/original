import { useState, useEffect } from 'react';
import { ShiftData, ExpenseData, ExtraIncomeData, BalanceData } from '@/lib/types';
import { shiftStorage, expenseStorage, extraIncomeStorage, calculateBalance } from '@/lib/storage';

export const useKakeibo = () => {
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [extraIncomes, setExtraIncomes] = useState<ExtraIncomeData[]>([]);
  const [balance, setBalance] = useState<BalanceData>({
    totalIncome: 0,
    shiftIncome: 0,
    extraIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

  // データを読み込む
  const loadData = () => {
    try {
      const shiftsData = shiftStorage.getAll();
      const expensesData = expenseStorage.getAll();
      const extraIncomesData = extraIncomeStorage.getAll();
      const balanceData = calculateBalance();

      setShifts(shiftsData);
      setExpenses(expensesData);
      setExtraIncomes(extraIncomesData);
      setBalance(balanceData);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    loadData();
  }, []);

  // シフトを追加
  const addShift = (shiftData: Omit<ShiftData, 'id'>) => {
    try {
      const newShift = shiftStorage.save(shiftData);
      setShifts(prev => [...prev, newShift]);
      setBalance(calculateBalance());
      return newShift;
    } catch (error) {
      console.error('シフトの保存に失敗しました:', error);
      throw error;
    }
  };

  // シフトを更新
  const updateShift = (id: string, updatedData: Partial<Omit<ShiftData, 'id'>>) => {
    try {
      const updatedShift = shiftStorage.update(id, updatedData);
      if (updatedShift) {
        setShifts(prev => prev.map(shift => shift.id === id ? updatedShift : shift));
        setBalance(calculateBalance());
        return updatedShift;
      }
      return null;
    } catch (error) {
      console.error('シフトの更新に失敗しました:', error);
      throw error;
    }
  };

  // シフトを削除
  const deleteShift = (id: string) => {
    try {
      const success = shiftStorage.delete(id);
      if (success) {
        // データを再読み込みして確実に同期を取る
        loadData();
      }
      return success;
    } catch (error) {
      console.error('シフトの削除に失敗しました:', error);
      throw error;
    }
  };

  // 支出を追加
  const addExpense = (expenseData: Omit<ExpenseData, 'id'>) => {
    try {
      const newExpense = expenseStorage.save(expenseData);
      setExpenses(prev => [...prev, newExpense]);
      setBalance(calculateBalance());
      return newExpense;
    } catch (error) {
      console.error('支出の保存に失敗しました:', error);
      throw error;
    }
  };

  // 支出を更新
  const updateExpense = (id: string, updatedData: Partial<Omit<ExpenseData, 'id'>>) => {
    try {
      const updatedExpense = expenseStorage.update(id, updatedData);
      if (updatedExpense) {
        setExpenses(prev => prev.map(expense => expense.id === id ? updatedExpense : expense));
        setBalance(calculateBalance());
        return updatedExpense;
      }
      return null;
    } catch (error) {
      console.error('支出の更新に失敗しました:', error);
      throw error;
    }
  };

  // 支出を削除
  const deleteExpense = (id: string) => {
    try {
      const success = expenseStorage.delete(id);
      if (success) {
        // データを再読み込みして確実に同期を取る
        loadData();
      }
      return success;
    } catch (error) {
      console.error('支出の削除に失敗しました:', error);
      throw error;
    }
  };

  // 臨時収入を追加
  const addExtraIncome = (incomeData: Omit<ExtraIncomeData, 'id'>) => {
    try {
      const newIncome = extraIncomeStorage.save(incomeData);
      setExtraIncomes(prev => [...prev, newIncome]);
      setBalance(calculateBalance());
      return newIncome;
    } catch (error) {
      console.error('臨時収入の保存に失敗しました:', error);
      throw error;
    }
  };

  // 臨時収入を更新
  const updateExtraIncome = (id: string, updatedData: Partial<Omit<ExtraIncomeData, 'id'>>) => {
    try {
      const updatedIncome = extraIncomeStorage.update(id, updatedData);
      if (updatedIncome) {
        setExtraIncomes(prev => prev.map(income => income.id === id ? updatedIncome : income));
        setBalance(calculateBalance());
        return updatedIncome;
      }
      return null;
    } catch (error) {
      console.error('臨時収入の更新に失敗しました:', error);
      throw error;
    }
  };

  // 臨時収入を削除
  const deleteExtraIncome = (id: string) => {
    try {
      const success = extraIncomeStorage.delete(id);
      if (success) {
        // データを再読み込みして確実に同期を取る
        loadData();
      }
      return success;
    } catch (error) {
      console.error('臨時収入の削除に失敗しました:', error);
      throw error;
    }
  };

  // 月別サマリーを取得
  const getMonthlySummary = () => {
    const summaryMap = new Map<string, {
      month: string,
      shiftIncome: number,
      extraIncome: number,
      totalIncome: number,
      totalExpense: number,
      balance: number,
      shiftCount: number,
      extraIncomeCount: number,
      expenseCount: number,
      expenseByCategory: Record<string, number>
    }>();

    // シフトデータを月別に集計
    shifts.forEach(shift => {
      const month = shift.date.substring(0, 7); // "YYYY-MM"
      if (!summaryMap.has(month)) {
        summaryMap.set(month, {
          month,
          shiftIncome: 0,
          extraIncome: 0,
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          shiftCount: 0,
          extraIncomeCount: 0,
          expenseCount: 0,
          expenseByCategory: {}
        });
      }
      const summary = summaryMap.get(month)!;
      summary.shiftIncome += shift.totalIncome;
      summary.shiftCount++;
    });

    // 臨時収入データを月別に集計
    extraIncomes.forEach(income => {
      const month = income.date.substring(0, 7); // "YYYY-MM"
      if (!summaryMap.has(month)) {
        summaryMap.set(month, {
          month,
          shiftIncome: 0,
          extraIncome: 0,
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          shiftCount: 0,
          extraIncomeCount: 0,
          expenseCount: 0,
          expenseByCategory: {}
        });
      }
      const summary = summaryMap.get(month)!;
      summary.extraIncome += income.amount;
      summary.extraIncomeCount++;
    });

    // 支出データを月別に集計
    expenses.forEach(expense => {
      const month = expense.date.substring(0, 7); // "YYYY-MM"
      if (!summaryMap.has(month)) {
        summaryMap.set(month, {
          month,
          shiftIncome: 0,
          extraIncome: 0,
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          shiftCount: 0,
          extraIncomeCount: 0,
          expenseCount: 0,
          expenseByCategory: {}
        });
      }
      const summary = summaryMap.get(month)!;
      summary.totalExpense += expense.amount;
      summary.expenseCount++;

      // カテゴリ別集計を追加
      if (!summary.expenseByCategory[expense.category]) {
        summary.expenseByCategory[expense.category] = 0;
      }
      summary.expenseByCategory[expense.category] += expense.amount;
    });

    // すべてのサマリーに対して、最終的な合計と残高を計算
    summaryMap.forEach(summary => {
      summary.totalIncome = summary.shiftIncome + summary.extraIncome;
      summary.balance = summary.totalIncome - summary.totalExpense;
    });

    // 月順でソート（新しい月が上）
    return Array.from(summaryMap.values()).sort((a, b) => b.month.localeCompare(a.month));
  };

  return {
    // データ
    shifts,
    expenses,
    extraIncomes,
    balance,
    loading,
    
    // メソッド
    loadData,
    addShift,
    updateShift,
    deleteShift,
    addExpense,
    updateExpense,
    deleteExpense,
    addExtraIncome,
    updateExtraIncome,
    deleteExtraIncome,
    getMonthlySummary,
  };
};