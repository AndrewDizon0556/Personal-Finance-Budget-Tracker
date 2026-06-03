import Dexie, { type Table } from 'dexie';
import type { Expense, ExpenseCategory } from '../types/expense';
import type { Budget } from '../types/budget';
import type { SavingsGoal } from '../types/goal';

export interface OfflineQueueItem {
  id?: number;
  queueId: string;       // client UUID — echoed back by server to identify synced items
  offlineId: string;     // client UUID for the entity (used in idempotency checks)
  entity: 'expense' | 'budget' | 'goal';
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: unknown;
  attempts: number;
  createdAt: string;
}

export interface CachedExpense extends Expense {
  offlineId?: string;
}

export interface CachedBudget extends Budget {
  offlineId?: string;
}

export interface CachedGoal extends SavingsGoal {
  offlineId?: string;
}

class IponDatabase extends Dexie {
  expenses!: Table<CachedExpense>;
  categories!: Table<ExpenseCategory>;
  budgets!: Table<CachedBudget>;
  goals!: Table<CachedGoal>;
  offlineQueue!: Table<OfflineQueueItem>;

  constructor() {
    super('ipon_database');
    this.version(1).stores({
      expenses:     'id, transactionType, expenseDate, offlineId',
      categories:   'id, type',
      budgets:      'id, month, year, offlineId',
      goals:        'id, offlineId',
      offlineQueue: '++id, queueId, offlineId, entity, operation, attempts',
    });
  }
}

export const db = new IponDatabase();
