import { useEffect, useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { useUiStore } from '../../store/uiStore';
import ExpenseModal from './ExpenseModal';
import AdvisorModal from '../finance/AdvisorModal';
import financialHealthService from '../../services/financialHealthService';
import type { ExpensePayload } from '../../types/expense';
import type { PurchaseAdvisor } from '../../types/financialHealth';

/** App-wide expense modal with Before-You-Buy advisor for EXPENSE transactions. */
export default function GlobalExpenseModal() {
  const { categories, fetchCategories, addExpense, editExpense } = useExpenseStore();
  const { expenseModalOpen, editingExpense, closeExpenseModal, bumpMutation } = useUiStore();

  // Advisor state — holds pending payload until user confirms or cancels
  const [pendingPayload, setPendingPayload] = useState<ExpensePayload | null>(null);
  const [advisor, setAdvisor] = useState<PurchaseAdvisor | null>(null);
  const [advisorLoading, setAdvisorLoading] = useState(false);

  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, []);

  const handleSubmit = async (data: ExpensePayload) => {
    const isExpense = (data.transactionType ?? 'EXPENSE') === 'EXPENSE';

    // Skip advisor for income entries and edits
    if (!isExpense || editingExpense) {
      await commitExpense(data);
      return;
    }

    // Show advisor before committing
    setPendingPayload(data);
    setAdvisor(null);
    setAdvisorLoading(true);
    try {
      const result = await financialHealthService.checkPurchase(data.amount, data.categoryId);
      setAdvisor(result);
    } catch {
      // If advisor fails, don't block the user — just commit immediately
      await commitExpense(data);
      setPendingPayload(null);
    } finally {
      setAdvisorLoading(false);
    }
  };

  const commitExpense = async (data: ExpensePayload) => {
    const payload: ExpensePayload = {
      categoryId: data.categoryId || undefined,
      amount: data.amount,
      notes: data.notes,
      expenseDate: data.expenseDate,
      transactionType: data.transactionType ?? 'EXPENSE',
    };

    if (editingExpense) {
      await editExpense(editingExpense.id, payload);
    } else {
      await addExpense(payload);
    }
    bumpMutation();
  };

  const handleAdvisorConfirm = async () => {
    if (!pendingPayload) return;
    await commitExpense(pendingPayload);
    setPendingPayload(null);
    setAdvisor(null);
    closeExpenseModal();
  };

  const handleAdvisorCancel = () => {
    setPendingPayload(null);
    setAdvisor(null);
  };

  return (
    <>
      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={closeExpenseModal}
        onSubmit={handleSubmit}
        categories={categories}
        editingExpense={editingExpense}
      />

      <AdvisorModal
        isOpen={pendingPayload !== null}
        advice={advisor}
        isLoading={advisorLoading}
        onConfirm={handleAdvisorConfirm}
        onCancel={handleAdvisorCancel}
      />
    </>
  );
}
