import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

/** Accent presets — each maps to an RGB tri(matches CSS var format "r g b"). */
export const ACCENT_PRESETS = {
  gold: { label: 'NU Gold', rgb: '245 179 0', soft: '255 244 198' },
  blue: { label: 'NU Blue', rgb: '61 74 156', soft: '221 226 244' },
  emerald: { label: 'Emerald', rgb: '16 185 129', soft: '209 250 229' },
  rose: { label: 'Rose', rgb: '244 63 94', soft: '255 228 230' },
  violet: { label: 'Violet', rgb: '139 92 246', soft: '237 233 254' },
} as const;

export type AccentKey = keyof typeof ACCENT_PRESETS;

interface ThemeState {
  mode: ThemeMode;
  accent: AccentKey;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (accent: AccentKey) => void;
  applyToDocument: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      accent: 'gold',
      setMode: (mode) => {
        set({ mode });
        get().applyToDocument();
      },
      toggleMode: () => {
        set({ mode: get().mode === 'light' ? 'dark' : 'light' });
        get().applyToDocument();
      },
      setAccent: (accent) => {
        set({ accent });
        get().applyToDocument();
      },
      applyToDocument: () => {
        const { mode, accent } = get();
        const root = document.documentElement;
        root.classList.toggle('dark', mode === 'dark');
        const preset = ACCENT_PRESETS[accent];
        root.style.setProperty('--accent', preset.rgb);
        root.style.setProperty('--accent-soft', preset.soft);
      },
    }),
    { name: 'ipon-theme' },
  ),
);
