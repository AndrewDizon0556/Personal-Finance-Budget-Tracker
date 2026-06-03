import axiosClient from '../api/axiosClient';
import { db, type OfflineQueueItem } from '../db/database';
import { useOfflineStore } from '../store/offlineStore';

interface IdMapping {
  offlineId: string;
  serverId: string;
}

interface SyncApiResponse {
  synced: string[];    // queueIds that succeeded
  failed: string[];    // queueIds that failed
  idMappings: IdMapping[];
}

class SyncManager {
  private static instance: SyncManager;
  private initialized = false;

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    window.addEventListener('online',  () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    useOfflineStore.getState().setOnline(navigator.onLine);
    this.refreshPendingCount();
  }

  private handleOnline(): void {
    useOfflineStore.getState().setOnline(true);
    this.sync();
  }

  private handleOffline(): void {
    useOfflineStore.getState().setOnline(false);
  }

  async refreshPendingCount(): Promise<void> {
    const count = await db.offlineQueue.count();
    useOfflineStore.getState().setPendingSync(count);
  }

  async enqueue(item: Omit<OfflineQueueItem, 'id' | 'attempts' | 'createdAt'>): Promise<void> {
    await db.offlineQueue.add({
      ...item,
      attempts: 0,
      createdAt: new Date().toISOString(),
    });
    await this.refreshPendingCount();
  }

  async sync(): Promise<void> {
    const { setIsSyncing, setLastSync, setPendingSync } = useOfflineStore.getState();
    const items = await db.offlineQueue.toArray();
    if (items.length === 0) return;

    setIsSyncing(true);
    try {
      const response = await axiosClient.post<SyncApiResponse>('/api/sync', { items });
      const { synced, idMappings } = response.data;

      // Update offline→server ID mappings in Dexie
      for (const mapping of idMappings) {
        const existing = await db.expenses.get(`offline_${mapping.offlineId}`);
        if (existing) {
          await db.expenses.delete(`offline_${mapping.offlineId}`);
          await db.expenses.put({ ...existing, id: mapping.serverId, offlineId: undefined });
        }
        const existingGoal = await db.goals.get(`offline_${mapping.offlineId}`);
        if (existingGoal) {
          await db.goals.delete(`offline_${mapping.offlineId}`);
          await db.goals.put({ ...existingGoal, id: mapping.serverId, offlineId: undefined });
        }
      }

      // Remove synced items from the queue
      const syncedIds = await db.offlineQueue
        .where('queueId')
        .anyOf(synced)
        .primaryKeys();
      await db.offlineQueue.bulkDelete(syncedIds);

      const remaining = await db.offlineQueue.count();
      setPendingSync(remaining);
      setLastSync(new Date().toISOString());
    } catch {
      // Increment attempt counter so the UI can surface persistent failures
      const items = await db.offlineQueue.toArray();
      for (const item of items) {
        if (item.id != null) {
          await db.offlineQueue.update(item.id, { attempts: item.attempts + 1 });
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }
}

export const syncManager = SyncManager.getInstance();
