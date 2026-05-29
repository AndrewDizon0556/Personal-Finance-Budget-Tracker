import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';

import { useNotificationStore } from '../../store/notificationStore';

const severityColor: Record<string, string> = {
  CRITICAL: 'text-rose-500',
  WARNING: 'text-nu-gold-600',
  INFO: 'text-nu-blue-600',
};

const severityDot: Record<string, string> = {
  CRITICAL: 'bg-rose-400',
  WARNING: 'bg-nu-gold-400',
  INFO: 'bg-nu-blue-400',
};

export default function NotificationBell() {
  const { notifications, fetchNotifications } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const count = notifications.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-xl text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            className="glass-strong absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-3xl"
          >
            <div className="border-b border-surface-border/60 px-4 py-3">
              <p className="text-sm font-semibold text-ink">Notifications</p>
            </div>

            {count === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-ink-faint">All clear — no notifications.</p>
              </div>
            ) : (
              <div className="max-h-72 divide-y divide-surface-border/50 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${severityDot[n.severity] ?? 'bg-ink-faint'}`} />
                    <div>
                      <p className={`text-xs font-semibold ${severityColor[n.severity] ?? 'text-ink'}`}>{n.title}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
