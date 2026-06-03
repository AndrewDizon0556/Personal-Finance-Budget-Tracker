import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useOfflineStore } from '../../store/offlineStore';
import { syncManager } from '../../sync/SyncManager';

export default function OfflineBanner() {
  const { isOnline, pendingSync, lastSync, isSyncing } = useOfflineStore();

  // Nothing to show when online and no pending items and not actively syncing
  const visible = !isOnline || pendingSync > 0 || isSyncing;

  const handleManualSync = () => {
    if (isOnline && !isSyncing) syncManager.sync();
  };

  const formatLastSync = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className={`sticky top-16 z-30 flex items-center justify-between px-4 py-2 text-xs font-semibold ${
            !isOnline
              ? 'bg-amber-500 text-white'
              : isSyncing
              ? 'bg-nu-blue-600 text-white'
              : 'bg-emerald-500 text-white'
          }`}
        >
          <span className="flex items-center gap-1.5">
            {!isOnline ? (
              <>
                <WifiOff size={13} />
                Offline Mode — changes saved locally
                {pendingSync > 0 && (
                  <span className="ml-1 rounded-full bg-white/25 px-1.5">
                    {pendingSync} pending
                  </span>
                )}
              </>
            ) : isSyncing ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Syncing {pendingSync} change{pendingSync !== 1 ? 's' : ''}…
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                All changes synced
                {lastSync && (
                  <span className="ml-1 opacity-75">· {formatLastSync(lastSync)}</span>
                )}
              </>
            )}
          </span>

          {isOnline && pendingSync > 0 && !isSyncing && (
            <button
              onClick={handleManualSync}
              className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 hover:bg-white/30"
            >
              <Wifi size={11} /> Sync now
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
