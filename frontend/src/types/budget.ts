export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  remainingBudget: number;
  spentAmount: number;
  month: number;
  year: number;
}

export interface BudgetPayload {
  categoryId: string;
  budgetAmount: number;
  month?: number;
  year?: number;
}
