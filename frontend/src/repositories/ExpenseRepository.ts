import expenseService from '../services/expenseService';
import { db } from '../db/database';
import { syncManager } from '../sync/SyncManager';
import type { Expense, ExpenseCategory, ExpensePayload } from '../types/expense';

const isOnline = () => navigator.onLine;

const genId = () => crypto.randomUUID();

export const ExpenseRepository = {
  async getAll(month?: number, year?: number): Promise<Expense[]> {
    if (isOnline()) {
      try {
        const expenses = await expenseService.getExpenses(month, year);
        await db.expenses.bulkPut(expenses);
        return expenses;
      } catch {
        return getFromCache(month, year);
      }
    }
    return getFromCache(month, year);
  },

  async create(payload: ExpensePayload): Promise<Expense> {
    if (isOnline()) {
      const expense = await expenseService.createExpense(payload);
      await db.expenses.put(expense);
      return expense;
    }

    const offlineId = genId();
    const temp: Expense = {
      id: `offline_${offlineId}`,
      categoryId: payload.categoryId ?? null,
      categoryName: 'Uncategorized',
      amount: payload.amount,
      notes: payload.notes ?? null,
      expenseDate: payload.expenseDate,
      transactionType: payload.transactionType ?? 'EXPENSE',
      createdAt: new Date().toISOString(),
    };
    await db.expenses.put({ ...temp, offlineId });
    await syncManager.enqueue({
      queueId: genId(),
      offlineId,
      entity: 'expense',
      operation: 'CREATE',
      payload,
    });
    return temp;
  },

  async update(id: string, payload: ExpensePayload): Promise<Expense> {
    if (isOnline()) {
      const expense = await expenseService.updateExpense(id, payload);
      await db.expenses.put(expense);
      return expense;
    }

    const offlineId = genId();
    const existing = await db.expenses.get(id);
    const updated: Expense = {
      ...(existing ?? ({} as Expense)),
      ...payload,
      id,
    };
    await db.expenses.put({ ...updated, offlineId });
    await syncManager.enqueue({
      queueId: genId(),
      offlineId,
      entity: 'expense',
      operation: 'UPDATE',
      payload: { id, ...payload },
    });
    return updated;
  },

  async remove(id: string): Promise<void> {
    if (isOnline()) {
      await expenseService.deleteExpense(id);
      await db.expenses.delete(id);
      return;
    }

    await db.expenses.delete(id);
    await syncManager.enqueue({
      queueId: genId(),
      offlineId: genId(),
      entity: 'expense',
      operation: 'DELETE',
      payload: { id },
    });
  },

  async getCategories(): Promise<ExpenseCategory[]> {
    if (isOnline()) {
      try {
        const categories = await expenseService.getCategories();
        await db.categories.bulkPut(categories);
        return categories;
      } catch {
        return db.categories.toArray();
      }
    }
    return db.categories.toArray();
  },
};

async function getFromCache(month?: number, year?: number): Promise<Expense[]> {
  if (!month || !year) {
    return db.expenses.orderBy('expenseDate').reverse().toArray();
  }
  const paddedMonth = String(month).padStart(2, '0');
  const start = `${year}-${paddedMonth}-01`;
  const end   = `${year}-${paddedMonth}-31`;
  return db.expenses
    .where('expenseDate')
    .between(start, end, true, true)
    .reverse()
    .sortBy('expenseDate');
}
