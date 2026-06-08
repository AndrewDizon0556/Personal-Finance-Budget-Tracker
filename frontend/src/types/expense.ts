export type TransactionType = 'EXPENSE' | 'INCOME' | 'GOAL_CONTRIBUTION';
export type CategoryType = 'EXPENSE' | 'INCOME';

export interface ExpenseCategory {
  id: string;
  name: string;
  type: CategoryType;
}

export interface Expense {
  id: string;
  categoryId: string | null;
  categoryName: string;
  amount: number;
  notes: string | null;
  expenseDate: string;
  transactionType: TransactionType;
  createdAt: string;
}

export interface ExpensePayload {
  categoryId?: string;
  amount: number;
  notes?: string;
  expenseDate: string;
  transactionType?: TransactionType;
}
