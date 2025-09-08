"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useKakeibo } from "@/hooks/useKakeibo";
import { hourlyWageStorage, shiftTimeStorage } from "@/lib/storage";

export default function ShiftPage() {
  const router = useRouter();
  const { addShift } = useKakeibo();
  const [date, setDate] = useState("");
  const [shiftCount, setShiftCount] = useState("2");
  const [shifts, setShifts] = useState([{
    startTime: "",
    endTime: ""
  }, {
    startTime: "",
    endTime: ""
  }]);
  const [hourlyWage, setHourlyWage] = useState("");

  // 初回読み込み時に最後に使用した時給と前日のシフト時間を設定
  useEffect(() => {
    const lastHourlyWage = hourlyWageStorage.get();
    if (lastHourlyWage) {
      setHourlyWage(lastHourlyWage.toString());
    }
    
    const lastShiftData = shiftTimeStorage.get();
    if (lastShiftData) {
      setShiftCount(lastShiftData.count.toString());
      setShifts(lastShiftData.shifts);
    }
    
    // デフォルトで今日の日付を設定
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  const calculateShiftIncome = (startTime: string, endTime: string) => {
    if (!startTime || !endTime || !hourlyWage) return 0;
    
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return Math.max(0, hours * parseFloat(hourlyWage));
  };

  const calculateTotalIncome = () => {
    return shifts.reduce((total, shift) => {
      return total + calculateShiftIncome(shift.startTime, shift.endTime);
    }, 0);
  };

  const updateShiftCount = (count: string) => {
    const numCount = parseInt(count);
    setShiftCount(count);
    
    if (numCount > shifts.length) {
      // Al aumentar el número de turnos, agregar turnos vacíos
      const newShifts = [...shifts];
      for (let i = shifts.length; i < numCount; i++) {
        newShifts.push({ startTime: "", endTime: "" });
      }
      setShifts(newShifts);
    } else if (numCount < shifts.length) {
      // Al reducir el número de turnos, eliminar desde el final
      setShifts(shifts.slice(0, numCount));
    }
  };

  const updateShift = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newShifts = [...shifts];
    newShifts[index][field] = value;
    setShifts(newShifts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 全シフトの入力チェック
    const invalidShifts = shifts.filter(shift => !shift.startTime || !shift.endTime);
    if (invalidShifts.length > 0) {
      alert("🥺 すべてのシフト時間を入力してね♪");
      return;
    }

    const totalIncome = calculateTotalIncome();
    if (totalIncome <= 0) {
      alert("😅 時間と時給を確認してね♪");
      return;
    }

    try {
      const hourlyWageNum = parseFloat(hourlyWage);
      
      // Registrar cada turno individualmente
      for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i];
        const shiftIncome = calculateShiftIncome(shift.startTime, shift.endTime);
        
        const shiftData = {
          date,
          startTime: shift.startTime,
          endTime: shift.endTime,
          hourlyWage: hourlyWageNum,
          totalIncome: shiftIncome
        };

        addShift(shiftData);
      }
      
      // 時給とシフトデータを記憶
      hourlyWageStorage.save(hourlyWageNum);
      shiftTimeStorage.save(shifts);
      
      alert(`🎉 ¥${totalIncome.toLocaleString()} 登録完了♪`);
      
      // ホーム画面に戻る
      router.push('/');
    } catch (error) {
      console.error('Error de registro de turno:', error);
      alert('😭 登録できませんでした');
    }
  };

  return (
    <main className="min-h-screen" style={{backgroundColor: '#fefcf7'}}>
      {/* ヘッダー */}
      <header className="bg-amber-50 shadow-sm border-b border-amber-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <Link href="/" className="text-blue-600 mr-3">
            ← 戻る
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 flex-1 text-center">
            ⏰ バイトシフト登録
          </h1>
        </div>
      </header>

      {/* フォーム */}
      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-amber-50 rounded-lg shadow-md p-6 border border-amber-200">
          {/* 日付 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 勤務日
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Selección de número de turnos */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔢 Número de Turnos Este Día
            </label>
            <select
              value={shiftCount}
              onChange={(e) => updateShiftCount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="1">1回</option>
              <option value="2">2回</option>
            </select>
          </div>

          {/* Entrada de horarios para cada turno */}
          {shifts.map((shift, index) => (
            <div key={index} className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-3">
                {shifts.length > 1 ? `⏰ Turno ${index + 1}` : "⏰ Horario de Turno"}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    value={shift.startTime}
                    onChange={(e) => updateShift(index, 'startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    value={shift.endTime}
                    onChange={(e) => updateShift(index, 'endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              {shift.startTime && shift.endTime && hourlyWage && (
                <div className="mt-2 text-center">
                  <span className="text-sm text-green-700">
                    💰 ¥{calculateShiftIncome(shift.startTime, shift.endTime).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* 時給 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 時給（円）
            </label>
            <input
              type="number"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(e.target.value)}
              placeholder={hourlyWage ? "" : "例: 1000（前回の時給・時間を記憶♪）"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              min="0"
              step="1"
            />
          </div>

          {/* Vista previa de ingresos totales */}
          {shifts.some(s => s.startTime && s.endTime) && hourlyWage && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-center">
                <div className="text-sm text-green-700">💰 Ingresos Totales Estimados</div>
                <div className="text-2xl font-bold text-green-800">
                  ¥{calculateTotalIncome().toLocaleString()}
                </div>
                {shifts.length > 1 && (
                  <div className="text-xs text-green-600 mt-1">
                    ⏰ {shifts.length}回のシフト合計
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            ⏰ Registrar Turno
          </button>
        </form>
      </div>
    </main>
  );
}