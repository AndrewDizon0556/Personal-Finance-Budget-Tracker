import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OfflineState {
  isOnline: boolean;
  pendingSync: number;
  lastSync: string | null;
  isSyncing: boolean;

  setOnline: (online: boolean) => void;
  setPendingSync: (count: number) => void;
  setLastSync: (time: string) => void;
  setIsSyncing: (syncing: boolean) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingSync: 0,
      lastSync: null,
      isSyncing: false,

      setOnline:      (online)  => set({ isOnline: online }),
      setPendingSync: (count)   => set({ pendingSync: count }),
      setLastSync:    (time)    => set({ lastSync: time }),
      setIsSyncing:   (syncing) => set({ isSyncing: syncing }),
    }),
    {
      name: 'ipon-offline-store',
      // only persist lastSync across sessions — runtime state re-derives itself
      partialize: (state) => ({ lastSync: state.lastSync }),
    },
  ),
);
