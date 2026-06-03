import budgetService from '../services/budgetService';
import { db } from '../db/database';
import { syncManager } from '../sync/SyncManager';
import type { Budget, BudgetPayload } from '../types/budget';

const isOnline = () => navigator.onLine;
const genId = () => crypto.randomUUID();

export const BudgetRepository = {
  async getAll(month?: number, year?: number): Promise<Budget[]> {
    if (isOnline()) {
      try {
        const budgets = await budgetService.getBudgets(month, year);
        await db.budgets.bulkPut(budgets);
        return budgets;
      } catch {
        return getFromCache(month, year);
      }
    }
    return getFromCache(month, year);
  },

  async create(payload: BudgetPayload): Promise<Budget> {
    if (isOnline()) {
      const budget = await budgetService.createBudget(payload);
      await db.budgets.put(budget);
      return budget;
    }

    const offlineId = genId();
    const temp: Budget = {
      id: `offline_${offlineId}`,
      categoryId: payload.categoryId,
      categoryName: 'Uncategorized',
      budgetAmount: payload.budgetAmount,
      remainingBudget: payload.budgetAmount,
      spentAmount: 0,
      month: payload.month ?? new Date().getMonth() + 1,
      year: payload.year ?? new Date().getFullYear(),
    };
    await db.budgets.put({ ...temp, offlineId });
    await syncManager.enqueue({
      queueId: genId(),
      offlineId,
      entity: 'budget',
      operation: 'CREATE',
      payload,
    });
    return temp;
  },

  async update(id: string, payload: BudgetPayload): Promise<Budget> {
    if (isOnline()) {
      const budget = await budgetService.updateBudget(id, payload);
      await db.budgets.put(budget);
      return budget;
    }

    const offlineId = genId();
    const existing = await db.budgets.get(id);
    const updated: Budget = { ...(existing ?? ({} as Budget)), ...payload, id };
    await db.budgets.put({ ...updated, offlineId });
    await syncManager.enqueue({
      queueId: genId(),
      offlineId,
      entity: 'budget',
      operation: 'UPDATE',
      payload: { id, ...payload },
    });
    return updated;
  },

  async remove(id: string): Promise<void> {
    if (isOnline()) {
      await budgetService.deleteBudget(id);
      await db.budgets.delete(id);
      return;
    }

    await db.budgets.delete(id);
    await syncManager.enqueue({
      queueId: genId(),
      offlineId: genId(),
      entity: 'budget',
      operation: 'DELETE',
      payload: { id },
    });
  },
};

async function getFromCache(month?: number, year?: number): Promise<Budget[]> {
  if (!month || !year) return db.budgets.toArray();
  return db.budgets.where('month').equals(month).and((b) => b.year === year).toArray();
}
