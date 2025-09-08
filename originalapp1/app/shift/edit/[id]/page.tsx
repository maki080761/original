"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useKakeibo } from "@/hooks/useKakeibo";
import { hourlyWageStorage } from "@/lib/storage";

export default function ShiftEditPage() {
  const router = useRouter();
  const params = useParams();
  const { shifts, updateShift } = useKakeibo();
  
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hourlyWage, setHourlyWage] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const shiftId = params.id as string;

  useEffect(() => {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      setDate(shift.date);
      setStartTime(shift.startTime);
      setEndTime(shift.endTime);
      setHourlyWage(shift.hourlyWage.toString());
      setLoading(false);
    } else if (shifts.length > 0) {
      setNotFound(true);
      setLoading(false);
    }
  }, [shifts, shiftId]);

  const calculateIncome = () => {
    if (!startTime || !endTime || !hourlyWage) return 0;
    
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return Math.max(0, hours * parseFloat(hourlyWage));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const income = calculateIncome();
    if (income <= 0) {
      alert("😅 時間と時給を確認してね♪");
      return;
    }

    try {
      const updatedData = {
        date,
        startTime,
        endTime,
        hourlyWage: parseFloat(hourlyWage),
        totalIncome: income
      };

      await updateShift(shiftId, updatedData);
      
      // 時給を記憶（編集時も保存）
      hourlyWageStorage.save(parseFloat(hourlyWage));
      
      alert(`🎉 更新完了♪`);
      
      router.push('/history');
    } catch (error) {
      console.error('シフト更新エラー:', error);
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
              シフト編集
            </h1>
          </div>
        </header>
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-amber-50 rounded-lg shadow-md p-6 text-center border border-amber-200">
            <div className="text-gray-600 mb-4">指定されたシフトが見つかりません</div>
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
            シフト編集
          </h1>
        </div>
      </header>

      {/* フォーム */}
      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-amber-50 rounded-lg shadow-md p-6 border border-amber-200">
          {/* 日付 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              勤務日
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* 開始時間 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開始時間
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* 終了時間 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              終了時間
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* 時給 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              時給（円）
            </label>
            <input
              type="number"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(e.target.value)}
              placeholder="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              min="0"
              step="1"
            />
          </div>

          {/* 収入プレビュー */}
          {startTime && endTime && hourlyWage && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-center">
                <div className="text-sm text-green-700">更新後の収入</div>
                <div className="text-2xl font-bold text-green-800">
                  ¥{calculateIncome().toLocaleString()}
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
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              更新する
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}