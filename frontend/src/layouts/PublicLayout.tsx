import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[rgb(var(--page-bg))] bg-nu-mesh">
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t border-surface-border/40 px-4 py-4 text-center text-xs text-ink-faint">
        <span>© 2026 Ipon Challenge · </span>
        <Link to="/terms" className="hover:underline">Terms</Link>
        <span> · </span>
        <Link to="/privacy" className="hover:underline">Privacy</Link>
        <span> · </span>
        <a
          href="https://github.com/AndrewDizon0556/Personal-Finance-Budget-Tracker/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          MIT License
        </a>
      </footer>
    </div>
  );
}
