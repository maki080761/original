"use client";

import { useState } from "react";
import Link from "next/link";
import { useKakeibo } from "@/hooks/useKakeibo";

const EXPENSE_CATEGORIES = [
  { id: "food", name: "Comida", icon: "🍽️" },
  { id: "transport", name: "Transporte", icon: "🚌" },
  { id: "entertainment", name: "Entretenimiento", icon: "🎮" },
  { id: "shopping", name: "Compras", icon: "🛍️" },
  { id: "other", name: "Otros", icon: "📝" },
];

export default function MonthlyPage() {
  const { getMonthlySummary, loading } = useKakeibo();
  const [selectedMonth, setSelectedMonth] = useState("");
  
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">✨ Cargando datos...</div>
      </main>
    );
  }

  const monthlySummaries = getMonthlySummary();
  
  // Si hay selección de mes, mostrar solo ese mes
  const filteredSummaries = selectedMonth 
    ? monthlySummaries.filter(s => s.month === selectedMonth)
    : monthlySummaries;

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    return `${parseInt(month)}/${year}`;
  };

  const getCategoryDisplay = (categoryId: string) => {
    const category = EXPENSE_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? `${category.icon} ${category.name}` : categoryId;
  };

  return (
    <main className="min-h-screen" style={{backgroundColor: '#fefcf7'}}>
      {/* ヘッダー */}
      <header className="bg-amber-50 shadow-sm border-b border-amber-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <Link href="/" className="text-blue-600 mr-3">
            🏠 Inicio
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 flex-1 text-center">
            📅 Resumen Mensual
          </h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Filtro de selección de mes */}
        {monthlySummaries.length > 0 && (
          <div className="bg-amber-50 rounded-lg shadow-md p-4 mb-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                🔍 Filtrar por mes:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los meses</option>
                {monthlySummaries.map((summary) => (
                  <option key={summary.month} value={summary.month}>
                    {formatMonth(summary.month)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Lista de resúmenes mensuales */}
        {filteredSummaries.length === 0 ? (
          <div className="bg-amber-50 rounded-lg shadow-md p-8 text-center border border-amber-200">
            <div className="text-6xl mb-4">😊</div>
            <div className="text-gray-600 mb-2">Aún no hay datos</div>
            <div className="text-sm text-gray-500">¡Prueba registrando trabajo o gastos!</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSummaries.map((summary) => (
              <div key={summary.month} className="bg-amber-50 rounded-lg shadow-md p-5 border border-amber-200">
                {/* Título del mes */}
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    📅 {formatMonth(summary.month)}
                  </h2>
                  <div className="text-sm text-gray-500">
                    💼 {summary.shiftCount} turnos • ✨ {summary.extraIncomeCount} ingresos extra • 💸 {summary.expenseCount} gastos
                  </div>
                </div>

                {/* Datos de ingresos y gastos */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">💰 Ingresos</div>
                    <div className="text-lg font-semibold text-green-600">
                      ¥{summary.totalIncome.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">💸 Gastos</div>
                    <div className="text-lg font-semibold text-red-600">
                      ¥{summary.totalExpense.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">💎 Balance</div>
                    <div className={`text-lg font-semibold ${
                      summary.balance >= 0 ? "text-blue-600" : "text-red-600"
                    }`}>
                      ¥{summary.balance.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* カテゴリ別支出表示 */}
                {Object.keys(summary.expenseByCategory).length > 0 && (
                  <div className="bg-red-50 rounded-lg p-3 mb-3">
                    <div className="text-sm text-red-700 mb-2 font-medium">💸 カテゴリ別支出</div>
                    <div className="space-y-1">
                      {Object.entries(summary.expenseByCategory)
                        .sort(([,a], [,b]) => b - a)
                        .map(([category, amount]) => (
                          <div key={category} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{getCategoryDisplay(category)}</span>
                            <span className="font-semibold text-red-600">
                              ¥{amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Mostrar tasa de ahorro */}
                {summary.totalIncome > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-blue-700 mb-1">🏦 Tasa de Ahorro</div>
                    <div className="text-lg font-bold text-blue-800">
                      {Math.round((summary.balance / summary.totalIncome) * 100)}%
                    </div>
                    <div className="text-xs text-blue-600">
                      {summary.balance >= 0 ? "😊 ¡Muy bien!" : "😅 El próximo mes intenta ahorrar más"}
                    </div>
                  </div>
                )}

                {/* 詳細ボタン */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/history?month=${summary.month}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-center text-sm hover:bg-gray-200 transition-colors"
                  >
                    📋 詳細履歴
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 全体統計（複数月ある場合） */}
        {!selectedMonth && monthlySummaries.length > 1 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-5 mt-6">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">
              🌟 Estadísticas Generales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">📅 Período de Registro</div>
                <div className="font-semibold text-gray-800">
                  {monthlySummaries.length} meses
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">📊 Balance Promedio</div>
                <div className="font-semibold text-gray-800">
                  ¥{Math.round(
                    monthlySummaries.reduce((sum, s) => sum + s.balance, 0) / monthlySummaries.length
                  ).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}