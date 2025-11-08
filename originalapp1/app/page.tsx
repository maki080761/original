"use client";

import Link from "next/link";
import { useKakeibo } from "@/hooks/useKakeibo";
import JSZip from 'jszip';

export default function Home() {
  const { balance, loading } = useKakeibo();

  const downloadBackup = async () => {
    // LocalStorageから全データを取得
    const shifts = localStorage.getItem('shifts');
    const expenses = localStorage.getItem('expenses');
    const extraIncomes = localStorage.getItem('extraIncomes');
    const journalEntries = localStorage.getItem('journalEntries');

    const shiftsData = shifts ? JSON.parse(shifts) : [];
    const expensesData = expenses ? JSON.parse(expenses) : [];
    const extraIncomesData = extraIncomes ? JSON.parse(extraIncomes) : [];
    const journalEntriesData = journalEntries ? JSON.parse(journalEntries) : [];

    // CSV変換関数
    const arrayToCSV = (data: Record<string, unknown>[], headers: string[]) => {
      if (data.length === 0) return headers.join(',') + '\n';
      const rows = data.map(item =>
        headers.map(header => {
          const value = item[header] || '';
          // カンマや改行を含む場合はダブルクォートで囲む
          if (String(value).includes(',') || String(value).includes('\n')) {
            return `"${String(value).replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      );
      return headers.join(',') + '\n' + rows.join('\n');
    };

    // 収入CSV（シフト）
    const shiftsCSV = arrayToCSV(shiftsData, ['date', 'startTime', 'endTime', 'hourlyWage', 'income']);

    // 収入CSV（特別収入）
    const extraIncomesCSV = arrayToCSV(extraIncomesData, ['date', 'amount', 'note']);

    // 支出CSV
    const expensesCSV = arrayToCSV(expensesData, ['date', 'amount', 'category']);

    // 日誌CSV
    const journalCSV = arrayToCSV(journalEntriesData, ['date', 'title', 'content']);

    // ZIPファイルを作成
    const zip = new JSZip();
    zip.file('シフト収入.csv', '\uFEFF' + shiftsCSV); // BOM追加でExcelの文字化け対策
    zip.file('特別収入.csv', '\uFEFF' + extraIncomesCSV);
    zip.file('支出.csv', '\uFEFF' + expensesCSV);
    zip.file('日誌.csv', '\uFEFF' + journalCSV);

    // ZIPをダウンロード
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `家計簿データ_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
          
          {/* 収入・支出の詳細内訳 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-600">Trabajo</div>
              <div className="text-sm font-semibold text-green-600">
                ¥{balance.shiftIncome.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Extra</div>
              <div className="text-sm font-semibold text-blue-600">
                ¥{balance.extraIncome.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Gastos</div>
              <div className="text-sm font-semibold text-red-600">
                ¥{balance.totalExpense.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 総収入表示 */}
          <div className="mt-3 pt-3 border-t border-amber-200">
            <div className="text-center">
              <div className="text-xs text-gray-600">Total Ingresos</div>
              <div className="text-lg font-semibold text-green-600">
                ¥{balance.totalIncome.toLocaleString()}
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
          
          <Link
            href="/journal"
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium text-center block hover:bg-teal-700 transition-colors"
          >
            📝 日誌
          </Link>

          <button
            onClick={downloadBackup}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
          >
            💾 データをダウンロード
          </button>
        </div>
      </div>
    </main>
  );
}
