"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useKakeibo } from "@/hooks/useKakeibo";
import { useSearchParams } from "next/navigation";

function HistoryContent() {
  const { shifts, expenses, extraIncomes, balance, loading, deleteShift, deleteExpense, deleteExtraIncome } = useKakeibo();
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense">("all");
  const [selectedDate, setSelectedDate] = useState("");
  const searchParams = useSearchParams();

  // Obtener mes de parámetros URL y configurar filtro
  useEffect(() => {
    if (loading) return; // データが読み込まれるまで待機
    
    const monthParam = searchParams.get('month');
    if (monthParam) {
      // Usar marcador especial para mostrar todos los datos de ese mes como visualización mensual
      setSelectedDate(`month:${monthParam}`);
    } else {
      setSelectedDate(''); // Limpiar si no hay parámetros URL
    }
  }, [searchParams, loading]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando datos...</div>
      </main>
    );
  }

  const formatDate = (dateString: string) => {
    // YYYY-MM-DD形式の文字列を直接パースして日付を取得
    const [, month, day] = dateString.split('-').map(Number);
    return `${month}/${day}`;
  };

  const getAllTransactions = () => {
    const shiftTransactions = shifts.map(shift => ({
      ...shift,
      type: "income" as const,
      subType: "shift" as const,
      title: `⏰ Trabajo (${shift.startTime}-${shift.endTime})`,
      amount: shift.totalIncome
    }));

    const extraIncomeTransactions = extraIncomes.map(income => ({
      ...income,
      type: "income" as const,
      subType: "extra" as const,
      title: `${income.sourceIcon} ${income.sourceName}${income.description ? ` (${income.description})` : ''}`,
      amount: income.amount
    }));

    const expenseTransactions = expenses.map(expense => ({
      ...expense,
      type: "expense" as const,
      subType: "expense" as const,
      title: `${expense.categoryIcon} ${expense.categoryName}`,
      amount: -expense.amount
    }));

    return [...shiftTransactions, ...extraIncomeTransactions, ...expenseTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getFilteredTransactions = () => {
    const allTransactions = getAllTransactions();
    
    let filtered = allTransactions;
    
    // タブでフィルター
    switch (activeTab) {
      case "income":
        filtered = filtered.filter(t => t.type === "income");
        break;
      case "expense":
        filtered = filtered.filter(t => t.type === "expense");
        break;
    }
    
    // 日付または月でフィルター
    if (selectedDate) {
      if (selectedDate.startsWith('month:')) {
        // 月フィルター
        const month = selectedDate.replace('month:', '');
        filtered = filtered.filter(t => t.date.startsWith(month));
      } else {
        // 日付フィルター
        filtered = filtered.filter(t => t.date === selectedDate);
      }
    }
    
    return filtered;
  };

  const handleDelete = (id: string, type: "income" | "expense", subType?: "shift" | "extra" | "expense") => {
    if (!confirm(`${type === "income" ? "🥺" : "🥺"} ¿Realmente quieres eliminar?`)) {
      return;
    }

    try {
      let success = false;
      if (type === "income") {
        if (subType === "shift") {
          success = deleteShift(id);
        } else if (subType === "extra") {
          success = deleteExtraIncome(id);
        }
      } else {
        success = deleteExpense(id);
      }
      
      if (success) {
        alert("🎉 Eliminado exitosamente");
      } else {
        alert("😭 No se pudo eliminar");
      }
    } catch (error) {
      console.error("Error de eliminación:", error);
      alert("😭 No se pudo eliminar");
    }
  };

  // 日付のオプションを取得
  const getAvailableDates = () => {
    const allTransactions = getAllTransactions();
    const dates = [...new Set(allTransactions.map(t => t.date))];
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  };

  // balanceオブジェクトから値を取得

  return (
    <main className="min-h-screen" style={{backgroundColor: '#fefcf7'}}>
      {/* ヘッダー */}
      <header className="bg-amber-50 shadow-sm border-b border-amber-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <Link href={selectedDate.startsWith('month:') ? "/monthly" : "/"} className="text-blue-600 mr-3">
            ← {selectedDate.startsWith('month:') ? "月別サマリー" : "ホーム"}
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 flex-1 text-center">
            {selectedDate.startsWith('month:') 
              ? `📋 Historial de ${selectedDate.replace('month:', '').replace('-', '/')}`
              : "📋 Ver Historial"
            }
          </h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* サマリー */}
        <div className="bg-amber-50 rounded-lg shadow-md p-4 mb-4 border border-amber-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600">Ingresos</div>
              <div className="text-lg font-semibold text-green-600">
                ¥{balance.totalIncome.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Gastos</div>
              <div className="text-lg font-semibold text-red-600">
                ¥{balance.totalExpense.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">残高</div>
              <div className={`text-lg font-semibold ${balance.balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                ¥{balance.balance.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 日付フィルター */}
        {!selectedDate.startsWith('month:') ? (
          <div className="bg-amber-50 rounded-lg shadow-md p-4 mb-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                🔍 日付で絞り込み:
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las fechas</option>
                {getAvailableDates().map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('ja-JP')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 rounded-lg shadow-md p-4 mb-4 border border-blue-200">
            <div className="text-center">
              <div className="text-blue-700 font-medium">
                📅 Mostrando historial de {selectedDate.replace('month:', '').replace('-', '/')}
              </div>
              <div className="text-blue-600 text-sm">
                Se muestran todos los ingresos y gastos de este mes
              </div>
            </div>
          </div>
        )}

        {/* タブ */}
        <div className="bg-amber-50 rounded-lg shadow-md mb-4 border border-amber-200">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab("income")}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === "income"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600"
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setActiveTab("expense")}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === "expense"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600"
              }`}
            >
              Gastos
            </button>
          </div>

          {/* Historial de transacciones */}
          <div className="p-4">
            {getFilteredTransactions().length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No hay datos
              </div>
            ) : (
              <div className="space-y-3">
                {getFilteredTransactions().map((transaction, index) => (
                  <div
                    key={`${transaction.type}-${transaction.id}-${index}`}
                    className="flex items-center py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {transaction.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-semibold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : ""}
                        ¥{Math.abs(transaction.amount).toLocaleString()}
                      </div>
                      <div className="flex gap-1">
                        <Link
                          href={`/${
                            transaction.type === "income" 
                              ? (transaction.subType === "shift" ? "shift" : "extra-income")
                              : "expense"
                          }/edit/${transaction.id}`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          ✨
                        </Link>
                        <button
                          onClick={() => handleDelete(transaction.id, transaction.type, transaction.subType)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando datos...</div>
      </main>
    }>
      <HistoryContent />
    </Suspense>
  );
}