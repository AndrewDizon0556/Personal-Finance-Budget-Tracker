import { useEffect } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { useUiStore } from '../../store/uiStore';
import ExpenseModal from './ExpenseModal';
import type { ExpensePayload } from '../../types/expense';

/** App-wide expense modal driven by uiStore — opened by the floating button or any page. */
export default function GlobalExpenseModal() {
  const { categories, fetchCategories, addExpense, editExpense } = useExpenseStore();
  const { expenseModalOpen, editingExpense, closeExpenseModal, bumpMutation } = useUiStore();

  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, []);

  const handleSubmit = async (data: ExpensePayload) => {
    if (editingExpense) {
      await editExpense(editingExpense.id, {
        categoryId: data.categoryId || undefined,
        amount: data.amount,
        notes: data.notes,
        expenseDate: data.expenseDate,
        transactionType: data.transactionType ?? 'EXPENSE',
      });
    } else {
      await addExpense({
        categoryId: data.categoryId || undefined,
        amount: data.amount,
        notes: data.notes,
        expenseDate: data.expenseDate,
        transactionType: data.transactionType ?? 'EXPENSE',
      });
    }
    bumpMutation();
  };

  return (
    <ExpenseModal
      isOpen={expenseModalOpen}
      onClose={closeExpenseModal}
      onSubmit={handleSubmit}
      categories={categories}
      editingExpense={editingExpense}
    />
  );
}
