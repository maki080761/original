"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useKakeibo } from "@/hooks/useKakeibo";

const INCOME_SOURCES = [
  { id: "gift", name: "お小遣い", icon: "🎀", color: "bg-pink-100 border-pink-300" },
  { id: "bonus", name: "一時金", icon: "💝", color: "bg-yellow-100 border-yellow-300" },
  { id: "other", name: "その他", icon: "🌈", color: "bg-purple-100 border-purple-300" },
];

export default function ExtraIncomeEditPage() {
  const router = useRouter();
  const params = useParams();
  const { extraIncomes, updateExtraIncome } = useKakeibo();
  
  const [amount, setAmount] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const incomeId = params.id as string;

  useEffect(() => {
    const income = extraIncomes.find(i => i.id === incomeId);
    if (income) {
      setDate(income.date);
      setAmount(income.amount.toString());
      setSelectedSource(income.source);
      setDescription(income.description || "");
      setLoading(false);
    } else if (extraIncomes.length > 0) {
      setNotFound(true);
      setLoading(false);
    }
  }, [extraIncomes, incomeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !selectedSource) {
      alert("🥺 金額と収入源を選択してね♪");
      return;
    }

    const incomeAmount = parseFloat(amount);
    if (incomeAmount <= 0) {
      alert("😅 正しい金額を入力してね♪");
      return;
    }

    const source = INCOME_SOURCES.find(src => src.id === selectedSource);
    if (!source) {
      alert("😊 収入源を選択してね♪");
      return;
    }

    try {
      const updatedData = {
        date,
        amount: incomeAmount,
        source: selectedSource,
        sourceName: source.name,
        sourceIcon: source.icon,
        description: description.trim() || undefined
      };

      await updateExtraIncome(incomeId, updatedData);
      alert(`🎉 更新完了♪`);
      
      router.push('/history');
    } catch (error) {
      console.error('臨時収入更新エラー:', error);
      alert('😭 更新できませんでした');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#fefcf7'}}>
        <div className="text-gray-600">✨ 読み込み中...</div>
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
              臨時収入編集
            </h1>
          </div>
        </header>
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-amber-50 rounded-lg shadow-md p-6 text-center border border-amber-200">
            <div className="text-gray-600 mb-4">指定された臨時収入が見つかりません</div>
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
            🌟 臨時収入編集
          </h1>
        </div>
      </header>

      {/* フォーム */}
      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-amber-50 rounded-lg shadow-md p-6 border border-amber-200">
          {/* 日付 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 日付
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>

          {/* 金額 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 金額（円）
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg"
              required
              min="1"
              step="1"
            />
          </div>

          {/* 収入源選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ✨ 収入源を選択
            </label>
            <div className="grid grid-cols-3 gap-3">
              {INCOME_SOURCES.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedSource(source.id)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedSource === source.id
                      ? `${source.color} border-current`
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{source.icon}</div>
                  <div className="text-sm font-medium text-gray-700">
                    {source.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* メモ（任意） */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 メモ（任意）
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例: お年玉♪、おばあちゃんから♡、臨時ボーナス✨"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              maxLength={50}
            />
          </div>

          {/* プレビュー */}
          {amount && selectedSource && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {INCOME_SOURCES.find(src => src.id === selectedSource)?.icon}
                </div>
                <div className="text-sm text-yellow-700">
                  {INCOME_SOURCES.find(src => src.id === selectedSource)?.name}
                </div>
                <div className="text-2xl font-bold text-yellow-800">
                  +¥{parseFloat(amount).toLocaleString()}
                </div>
                {description && (
                  <div className="text-xs text-yellow-600 mt-1">
                    📝 {description}
                  </div>
                )}
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
              className="flex-1 bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
            >
              🌟 更新する♪
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}