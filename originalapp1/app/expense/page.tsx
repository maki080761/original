"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useKakeibo } from "@/hooks/useKakeibo";
import { getJSTDate } from "@/lib/dateUtils";

const EXPENSE_CATEGORIES = [
  { id: "food", name: "Comida", icon: "🍽️", color: "bg-orange-100 border-orange-300" },
  { id: "transport", name: "Transporte", icon: "🚌", color: "bg-blue-100 border-blue-300" },
  { id: "entertainment", name: "Entretenimiento", icon: "🎮", color: "bg-purple-100 border-purple-300" },
  { id: "shopping", name: "Compras", icon: "🛍️", color: "bg-pink-100 border-pink-300" },
  { id: "other", name: "Otros", icon: "📝", color: "bg-gray-100 border-gray-300" },
];

export default function ExpensePage() {
  const router = useRouter();
  const { addExpense } = useKakeibo();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState(getJSTDate());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !selectedCategory) {
      alert("🥺 Por favor selecciona cantidad y categoría");
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (expenseAmount <= 0) {
      alert("😅 Por favor ingresa una cantidad válida");
      return;
    }

    const category = EXPENSE_CATEGORIES.find(cat => cat.id === selectedCategory);
    if (!category) {
      alert("😊 Por favor selecciona una categoría");
      return;
    }

    try {
      const expenseData = {
        date,
        amount: expenseAmount,
        category: selectedCategory,
        categoryName: category.name,
        categoryIcon: category.icon
      };

      addExpense(expenseData);
      alert(`🎉 ${category.icon} ¥${expenseAmount.toLocaleString()} registrado exitosamente`);
      
      // Volver a la pantalla principal
      router.push('/');
    } catch (error) {
      console.error('Error de registro de gastos:', error);
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
            Registrar Gastos
          </h1>
        </div>
      </header>

      {/* フォーム */}
      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-amber-50 rounded-lg shadow-md p-6 border border-amber-200">
          {/* 日付 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
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
              Cantidad (¥)
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

          {/* Selección de categoría */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecciona categoría
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

          {/* Vista previa de categoría y cantidad seleccionada */}
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

          {/* Botón de envío */}
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Registrar Gasto
          </button>
        </form>
      </div>
    </main>
  );
}

