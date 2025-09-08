"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useKakeibo } from "@/hooks/useKakeibo";

const EXPENSE_CATEGORIES = [
  { id: "food", name: "食事", icon: "🍽️", color: "bg-orange-100 border-orange-300" },
  { id: "transport", name: "交通", icon: "🚌", color: "bg-blue-100 border-blue-300" },
  { id: "entertainment", name: "娯楽", icon: "🎮", color: "bg-purple-100 border-purple-300" },
  { id: "shopping", name: "買い物", icon: "🛍️", color: "bg-pink-100 border-pink-300" },
  { id: "other", name: "その他", icon: "📝", color: "bg-gray-100 border-gray-300" },
];

export default function ExpenseEditPage() {
  const router = useRouter();
  const params = useParams();
  const { expenses, updateExpense } = useKakeibo();
  
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const expenseId = params.id as string;

  useEffect(() => {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      setDate(expense.date);
      setAmount(expense.amount.toString());
      setSelectedCategory(expense.category);
      setLoading(false);
    } else if (expenses.length > 0) {
      setNotFound(true);
      setLoading(false);
    }
  }, [expenses, expenseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !selectedCategory) {
      alert("🥺 金額とカテゴリを選択してね♪");
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (expenseAmount <= 0) {
      alert("😅 正しい金額を入力してね♪");
      return;
    }

    const category = EXPENSE_CATEGORIES.find(cat => cat.id === selectedCategory);
    if (!category) {
      alert("😊 カテゴリを選択してね♪");
      return;
    }

    try {
      const updatedData = {
        date,
        amount: expenseAmount,
        category: selectedCategory,
        categoryName: category.name,
        categoryIcon: category.icon
      };

      await updateExpense(expenseId, updatedData);
      alert(`🎉 更新完了♪`);
      
      router.push('/history');
    } catch (error) {
      console.error('支出更新エラー:', error);
      alert('😭 更新できませんでした');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#fefcf7'}}>
        <div className="text-gray-600">読み込み中...</div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen" style={{backgroundColor: '#fefcf7'}}>
        <header className="bg-amber-50 shadow-sm border-b border-amber-200">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center">
            <Link href="/history" className="text-blue-600 mr-3">
              ← 戻る
            </Link>
            <h1 className="text-lg font-semibold text-gray-800 flex-1 text-center">
              支出編集
            </h1>
          </div>
        </header>
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-amber-50 rounded-lg shadow-md p-6 text-center border border-amber-200">
            <div className="text-gray-600 mb-4">指定された支出が見つかりません</div>
            <Link
              href="/history"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              履歴に戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{backgroundColor: '#fefcf7'}}>
      {/* ヘッダー */}
      <header className="bg-amber-50 shadow-sm border-b border-amber-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <Link href="/history" className="text-blue-600 mr-3">
            ← 戻る
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 flex-1 text-center">
            支出編集
          </h1>
        </div>
      </header>

      {/* フォーム */}
      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-amber-50 rounded-lg shadow-md p-6 border border-amber-200">
          {/* 日付 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日付
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* 金額 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              金額（円）
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
              required
              min="1"
              step="1"
            />
          </div>

          {/* カテゴリ選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              カテゴリを選択
            </label>
            <div className="grid grid-cols-2 gap-3">
              {EXPENSE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedCategory === category.id
                      ? `${category.color} border-current`
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-700">
                    {category.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 選択されたカテゴリと金額のプレビュー */}
          {amount && selectedCategory && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {EXPENSE_CATEGORIES.find(cat => cat.id === selectedCategory)?.icon}
                </div>
                <div className="text-sm text-red-700">
                  {EXPENSE_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
                </div>
                <div className="text-2xl font-bold text-red-800">
                  -¥{parseFloat(amount).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex gap-3">
            <Link
              href="/history"
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-gray-700 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              更新する
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}