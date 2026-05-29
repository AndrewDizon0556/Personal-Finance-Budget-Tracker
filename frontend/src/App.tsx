import { useEffect } from 'react';
import AppRouter from './routes/AppRouter';
import { useThemeStore } from './store/themeStore';

export default function App() {
  const applyToDocument = useThemeStore((s) => s.applyToDocument);

  // Apply persisted theme (dark mode + accent) on first paint.
  useEffect(() => {
    applyToDocument();
  }, [applyToDocument]);

  return <AppRouter />;
}
