"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useKakeibo } from "@/hooks/useKakeibo";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  timestamp: number;
}

export default function CalendarPage() {
  const { shifts, expenses, extraIncomes, loading } = useKakeibo();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    
    // 日誌データを読み込み
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">✨ Cargando calendario...</div>
      </main>
    );
  }

  // 選択された月の日別データを取得
  const getDailyData = () => {
    const dailyData: Record<string, { income: number, expense: number, hasJournal: boolean }> = {};
    
    // シフト収入を集計
    shifts.forEach(shift => {
      if (shift.date.startsWith(selectedMonth)) {
        const day = shift.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { income: 0, expense: 0, hasJournal: false };
        }
        dailyData[day].income += shift.totalIncome;
      }
    });

    // 臨時収入を集計
    extraIncomes.forEach(income => {
      if (income.date.startsWith(selectedMonth)) {
        const day = income.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { income: 0, expense: 0, hasJournal: false };
        }
        dailyData[day].income += income.amount;
      }
    });

    // 支出を集計
    expenses.forEach(expense => {
      if (expense.date.startsWith(selectedMonth)) {
        const day = expense.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { income: 0, expense: 0, hasJournal: false };
        }
        dailyData[day].expense += expense.amount;
      }
    });

    // 日誌データを集計
    journalEntries.forEach(entry => {
      if (entry.date.startsWith(selectedMonth)) {
        const day = entry.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { income: 0, expense: 0, hasJournal: false };
        }
        dailyData[day].hasJournal = true;
      }
    });

    return dailyData;
  };

  // カレンダーの日付配列を生成
  const generateCalendarDays = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // 前月の空白日を追加
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // その月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const dailyData = getDailyData();
  const calendarDays = generateCalendarDays();
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <main className="min-h-screen" style={{backgroundColor: '#fefcf7'}}>
      {/* ヘッダー */}
      <header className="bg-amber-50 shadow-sm border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
          <Link href="/" className="text-blue-600 mr-3">
            🏠 Inicio
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 flex-1 text-center">
            📅 Calendario Mensual
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 月選択 */}
        <div className="bg-amber-50 rounded-lg shadow-md p-4 mb-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              📅 {formatMonth(selectedMonth)}
            </h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* カレンダー */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-amber-200">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* カレンダーの日付 */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-20"></div>;
              }

              const dayKey = String(day).padStart(2, '0');
              const data = dailyData[dayKey];
              const hasData = data && (data.income > 0 || data.expense > 0);
              const hasJournal = data && data.hasJournal;
              const fullDate = `${selectedMonth}-${dayKey}`;
              const journalForDay = journalEntries.find(entry => entry.date === fullDate);

              const handleDayClick = () => {
                if (journalForDay) {
                  setSelectedEntry(journalForDay);
                  setShowModal(true);
                }
              };

              return (
                <div
                  key={day}
                  onClick={handleDayClick}
                  className={`h-20 border rounded-lg p-2 ${
                    hasData ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  } ${
                    hasJournal ? 'cursor-pointer hover:bg-yellow-50' : ''
                  } relative`}
                >
                  <div className="font-semibold text-sm text-gray-800 mb-1 flex items-center justify-between">
                    <span>{day}</span>
                    {hasJournal && (
                      <span className="text-xs">📝</span>
                    )}
                  </div>
                  {hasData && (
                    <div className="text-xs space-y-1">
                      {data.income > 0 && (
                        <div className="text-green-600 font-medium">
                          +¥{data.income.toLocaleString()}
                        </div>
                      )}
                      {data.expense > 0 && (
                        <div className="text-red-600 font-medium">
                          -¥{data.expense.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 凡例 */}
        <div className="bg-amber-50 rounded-lg shadow-md p-4 mt-6 border border-amber-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">📖 Leyenda</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span className="text-green-700">💰 Ingresos (+)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
              <span className="text-red-700">💸 Gastos (-)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-2"></div>
              <span className="text-blue-700">📊 Día con actividad</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded mr-2 flex items-center justify-center">
                <span className="text-xs">📝</span>
              </div>
              <span className="text-yellow-700">📝 Día con diario</span>
            </div>
          </div>
        </div>

        {/* 日誌モーダル */}
        {showModal && selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedEntry.title}</h3>
                  <p className="text-sm text-gray-500">{selectedEntry.date}</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedEntry.content}
              </div>
              <div className="mt-4 flex gap-2">
                <Link 
                  href={`/journal`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  日誌ページで編集
                </Link>
                <button 
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}