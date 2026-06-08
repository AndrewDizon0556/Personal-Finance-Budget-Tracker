import goalService from '../services/goalService';
import { db } from '../db/database';
import { syncManager } from '../sync/SyncManager';
import type { SavingsGoal, SavingsGoalPayload } from '../types/goal';

const isOnline = () => navigator.onLine;
const genId = () => crypto.randomUUID();

export const SavingsGoalRepository = {
  async getAll(): Promise<SavingsGoal[]> {
    if (isOnline()) {
      try {
        const goals = await goalService.getGoals();
        await db.goals.bulkPut(goals);
        return goals;
      } catch {
        return db.goals.orderBy('createdAt').reverse().toArray();
      }
    }
    return db.goals.orderBy('createdAt').reverse().toArray();
  },

  async create(payload: SavingsGoalPayload): Promise<SavingsGoal> {
    if (isOnline()) {
      const goal = await goalService.createGoal(payload);
      await db.goals.put(goal);
      return goal;
    }

    const offlineId = genId();
    const temp: SavingsGoal = {
      id: `offline_${offlineId}`,
      goalName: payload.goalName,
      targetAmount: payload.targetAmount,
      currentAmount: payload.currentAmount ?? 0,
      progressPercentage: 0,
      completed: false,
      targetDate: payload.targetDate ?? null,
      createdAt: new Date().toISOString(),
    };
    await db.goals.put({ ...temp, offlineId });
    await syncManager.enqueue({
      queueId: genId(),
      offlineId,
      entity: 'goal',
      operation: 'CREATE',
      payload,
    });
    return temp;
  },

  async update(id: string, payload: SavingsGoalPayload): Promise<SavingsGoal> {
    if (isOnline()) {
      const goal = await goalService.updateGoal(id, payload);
      await db.goals.put(goal);
      return goal;
    }

    const offlineId = genId();
    const existing = await db.goals.get(id);
    const progress = existing?.targetAmount
      ? Math.min(((payload.currentAmount ?? existing.currentAmount) / existing.targetAmount) * 100, 100)
      : 0;
    const updated: SavingsGoal = {
      ...(existing ?? ({} as SavingsGoal)),
      ...payload,
      id,
      progressPercentage: progress,
      completed: (payload.currentAmount ?? 0) >= (existing?.targetAmount ?? 1),
    };
    await db.goals.put({ ...updated, offlineId });
    await syncManager.enqueue({
      queueId: genId(),
      offlineId,
      entity: 'goal',
      operation: 'UPDATE',
      payload: { id, ...payload },
    });
    return updated;
  },

  // Adding money moves funds out of the spendable balance and writes a ledger
  // entry server-side, so it must happen online — we don't queue it offline.
  async contribute(id: string, amount: number): Promise<SavingsGoal> {
    if (!isOnline()) {
      throw new Error("You're offline. Connect to the internet to add money to a goal.");
    }
    const goal = await goalService.contribute(id, amount);
    await db.goals.put(goal);
    return goal;
  },

  async remove(id: string): Promise<void> {
    if (isOnline()) {
      await goalService.deleteGoal(id);
      await db.goals.delete(id);
      return;
    }

    await db.goals.delete(id);
    await syncManager.enqueue({
      queueId: genId(),
      offlineId: genId(),
      entity: 'goal',
      operation: 'DELETE',
      payload: { id },
    });
  },
};
