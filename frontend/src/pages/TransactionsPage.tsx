import { useEffect, useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import type { Expense } from '../types/expense';
import ExpenseModal from '../components/expense/ExpenseModal';

const formatPeso = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function TransactionsPage() {
  const { expenses, categories, isLoading, fetchExpenses, fetchCategories, addExpense, editExpense, removeExpense } =
    useExpenseStore();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses(selectedMonth, selectedYear);
    fetchCategories();
  }, [selectedMonth, selectedYear]);

  const handleSubmit = async (data: {
    categoryId?: string;
    amount: number;
    notes?: string;
    expenseDate: string;
    transactionType?: 'EXPENSE' | 'INCOME';
  }) => {
    setActionError(null);
    const payload = {
      categoryId: data.categoryId || undefined,
      amount: data.amount,
      notes: data.notes,
      expenseDate: data.expenseDate,
      transactionType: data.transactionType ?? 'EXPENSE',
    };
    try {
      if (editingExpense) {
        await editExpense(editingExpense.id, payload);
      } else {
        await addExpense(payload);
      }
      fetchExpenses(selectedMonth, selectedYear);
    } catch {
      setActionError('Failed to save expense. Please try again.');
      throw new Error('submit failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await removeExpense(id);
      fetchExpenses(selectedMonth, selectedYear);
    } catch {
      setActionError('Failed to delete expense.');
    }
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Transactions</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          + Add Expense
        </button>
      </div>

      {/* Month filter */}
      <div className="flex gap-2 mb-5">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {actionError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-gray-400 text-sm py-12">Loading...</p>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <p className="text-gray-400 text-sm">No transactions for this period.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {expenses.map((expense, i) => (
            <div
              key={expense.id}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== expenses.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div>
                <p className="text-sm text-gray-800">{expense.notes || expense.categoryName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {expense.categoryName} · {formatDate(expense.expenseDate)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold ${
                    expense.transactionType === 'INCOME' ? 'text-green-500' : 'text-gray-800'
                  }`}
                >
                  {expense.transactionType === 'INCOME' ? '+' : '-'}
                  {formatPeso(expense.amount)}
                </span>
                <button
                  onClick={() => openEdit(expense)}
                  className="text-xs text-gray-400 hover:text-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        categories={categories}
        editingExpense={editingExpense}
      />
    </div>
  );
}
