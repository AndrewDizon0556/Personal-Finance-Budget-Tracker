import { useEffect, useRef, useState } from 'react';
import { useNotificationStore } from '../../store/notificationStore';

const severityColor: Record<string, string> = {
  CRITICAL: 'text-red-600',
  WARNING: 'text-yellow-600',
  INFO: 'text-blue-600',
};

const severityDot: Record<string, string> = {
  CRITICAL: 'bg-red-400',
  WARNING: 'bg-yellow-400',
  INFO: 'bg-blue-400',
};

export default function NotificationBell() {
  const { notifications, fetchNotifications } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const count = notifications.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 z-20 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-700">Notifications</p>
          </div>

          {count === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">All clear — no notifications.</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {notifications.map((n, i) => (
                <div key={i} className="px-4 py-3 flex gap-3">
                  <span
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${severityDot[n.severity] ?? 'bg-gray-300'}`}
                  />
                  <div>
                    <p className={`text-xs font-semibold ${severityColor[n.severity] ?? 'text-gray-600'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
