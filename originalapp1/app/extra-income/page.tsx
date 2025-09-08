"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useKakeibo } from "@/hooks/useKakeibo";

const INCOME_SOURCES = [
  { id: "gift", name: "Propina", icon: "🎀", color: "bg-pink-100 border-pink-300" },
  { id: "bonus", name: "Bono", icon: "💝", color: "bg-yellow-100 border-yellow-300" },
  { id: "other", name: "Otros", icon: "🌈", color: "bg-purple-100 border-purple-300" },
];

export default function ExtraIncomePage() {
  const router = useRouter();
  const { addExtraIncome } = useKakeibo();
  const [amount, setAmount] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !selectedSource) {
      alert("🥺 Por favor selecciona cantidad y fuente de ingresos");
      return;
    }

    const incomeAmount = parseFloat(amount);
    if (incomeAmount <= 0) {
      alert("😅 Por favor ingresa una cantidad válida");
      return;
    }

    const source = INCOME_SOURCES.find(src => src.id === selectedSource);
    if (!source) {
      alert("😊 Por favor selecciona una fuente de ingresos");
      return;
    }

    try {
      const incomeData = {
        date,
        amount: incomeAmount,
        source: selectedSource,
        sourceName: source.name,
        sourceIcon: source.icon,
        description: description.trim() || undefined
      };

      addExtraIncome(incomeData);
      alert(`🎉 ${source.icon} ¥${incomeAmount.toLocaleString()} registrado exitosamente`);
      
      // Volver a la pantalla principal
      router.push('/');
    } catch (error) {
      console.error('Error de registro de ingreso extra:', error);
      alert('😭 No se pudo registrar');
    }
  };

  return (
    <main className="min-h-screen" style={{backgroundColor: '#fefcf7'}}>
      {/* ヘッダー */}
      <header className="bg-amber-50 shadow-sm border-b border-amber-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <Link href="/" className="text-blue-600 mr-3">
            ← Volver
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 flex-1 text-center">
            🌟 Registro de Ingreso Extra
          </h1>
        </div>
      </header>

      {/* フォーム */}
      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-amber-50 rounded-lg shadow-md p-6 border border-amber-200">
          {/* 日付 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Fecha
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
              💰 Cantidad (¥)
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
          <button
            type="submit"
            className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
          >
            🌟 登録する♪
          </button>
        </form>
      </div>
    </main>
  );
}