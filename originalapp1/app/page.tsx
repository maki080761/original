"use client";

import Link from "next/link";
import { useKakeibo } from "@/hooks/useKakeibo";

export default function Home() {
  const { balance, loading } = useKakeibo();

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando datos...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-25" style={{backgroundColor: '#fefcf7'}}>
      {/* ヘッダー */}
      <header className="bg-amber-50 shadow-sm border-b border-amber-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-center text-gray-800">
            Libro de Esfuerzo
          </h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* 現在の残高表示（メイン機能） */}
        <div className="bg-amber-50 rounded-lg shadow-md p-6 mb-6 border border-amber-200">
          <h2 className="text-sm font-medium text-gray-600 text-center mb-2">
            Balance Actual
          </h2>
          <div className="text-4xl font-bold text-center mb-4">
            <span className={balance.balance >= 0 ? "text-blue-600" : "text-red-600"}>
              ¥{balance.balance.toLocaleString()}
            </span>
          </div>
          
          {/* 収入・支出の内訳 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Ingresos</div>
              <div className="text-lg font-semibold text-green-600">
                ¥{balance.totalIncome.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Gastos</div>
              <div className="text-lg font-semibold text-red-600">
                ¥{balance.totalExpense.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="space-y-3">
          {/* 収入系ボタン */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/shift"
              className="bg-green-600 text-white py-3 px-3 rounded-lg font-medium text-center block hover:bg-green-700 transition-colors text-sm"
            >
              ⏰ Turno de Trabajo
            </Link>
            
            <Link
              href="/extra-income"
              className="bg-yellow-600 text-white py-3 px-3 rounded-lg font-medium text-center block hover:bg-yellow-700 transition-colors text-sm"
            >
              🌟 Ingreso Extra
            </Link>
          </div>
          
          <Link
            href="/expense"
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium text-center block hover:bg-red-700 transition-colors"
          >
            💸 Registrar Gastos
          </Link>
          
          <Link
            href="/history"
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium text-center block hover:bg-gray-700 transition-colors"
          >
            📋 Ver Historial
          </Link>
          
          <Link
            href="/monthly"
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium text-center block hover:bg-purple-700 transition-colors"
          >
            📅 Resumen Mensual
          </Link>
          
          <Link
            href="/calendar"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium text-center block hover:bg-indigo-700 transition-colors"
          >
            📅 Calendario Mensual
          </Link>
        </div>
      </div>
    </main>
  );
}
