import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

/** Accent presets — each maps to an RGB triple (CSS var format "r g b"). */
export const ACCENT_PRESETS = {
  gold: { label: 'NU Gold', rgb: '245 179 0', soft: '255 244 198' },
  blue: { label: 'NU Blue', rgb: '61 74 156', soft: '221 226 244' },
  emerald: { label: 'Emerald', rgb: '16 185 129', soft: '209 250 229' },
  rose: { label: 'Rose', rgb: '244 63 94', soft: '255 228 230' },
  violet: { label: 'Violet', rgb: '139 92 246', soft: '237 233 254' },
} as const;

export type AccentKey = keyof typeof ACCENT_PRESETS;

/** Full color themes (surfaces + brand scale). */
export const PALETTE_PRESETS = {
  minimal: { label: 'Minimal Light', desc: 'Clean white & soft grey', swatches: ['#f7f8fa', '#334155', '#94a3b8'] },
  ocean: { label: 'Ocean Blue', desc: 'The classic NU blue', swatches: ['#f7f8fc', '#35408e', '#ffc91a'] },
  pink: { label: 'Pastel Pink', desc: 'Soft, fresh & premium', swatches: ['#fff5f8', '#c41d4e', '#fb6f92'] },
} as const;

export type Palette = keyof typeof PALETTE_PRESETS;

// --- Brand ramps (50 → 950 for blue, 50 → 900 for gold/accent) ---
const BLUE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const GOLD_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

const RAMP = {
  blueOcean: ['#f0f2fa', '#dde2f4', '#c0c9ea', '#97a4da', '#6b7cc6', '#4d5db4', '#3d4a9c', '#35408e', '#2b3470', '#232a57', '#161a38'],
  goldOcean: ['#fffbeb', '#fff4c6', '#ffe888', '#ffd633', '#ffc91a', '#f5b300', '#d99000', '#b36b00', '#925406', '#7c4509'],
  blueSlate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#020617'],
  goldAmber: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  blueRose: ['#fff1f5', '#ffe4ec', '#fecdda', '#fda4be', '#fb6f92', '#f64d77', '#e22e60', '#c41d4e', '#a3153f', '#851235', '#4c0a1d'],
  goldRose: ['#fff6f3', '#ffe9e3', '#ffd2c6', '#f7b3a5', '#ef9a91', '#e07f86', '#cf6478', '#b04d68', '#8f3d56', '#75324a'],
};

function brandVars(blue: string[], gold: string[]): Record<string, string> {
  const v: Record<string, string> = {};
  BLUE_KEYS.forEach((k, i) => (v[`--c-blue-${k}`] = blue[i]));
  GOLD_KEYS.forEach((k, i) => (v[`--c-gold-${k}`] = gold[i]));
  return v;
}

type VarMap = Record<string, string>; // CSS var name -> hex

interface PaletteDef {
  light: VarMap;
  dark: VarMap; // overrides applied on top of `light` in dark mode
}

const PALETTES: Record<Palette, PaletteDef> = {
  ocean: {
    light: {
      '--surface': '#ffffff', '--surface-soft': '#f4f6fc', '--surface-border': '#e2e6f2',
      '--ink': '#191f38', '--ink-soft': '#5a6280', '--ink-faint': '#949cb8',
      '--page-bg': '#f7f8fc', '--sh': '#35408e',
      ...brandVars(RAMP.blueOcean, RAMP.goldOcean),
    },
    dark: {
      '--surface': '#1e2340', '--surface-soft': '#262c4e', '--surface-border': '#363e68',
      '--ink': '#e9ecf7', '--ink-soft': '#a8b0ce', '--ink-faint': '#7880a0',
      '--page-bg': '#12152a',
    },
  },
  minimal: {
    light: {
      '--surface': '#ffffff', '--surface-soft': '#f6f7f9', '--surface-border': '#eaecef',
      '--ink': '#1f2430', '--ink-soft': '#5d6573', '--ink-faint': '#9aa1ad',
      '--page-bg': '#f7f8fa', '--sh': '#334155',
      ...brandVars(RAMP.blueSlate, RAMP.goldAmber),
    },
    dark: {
      '--surface': '#1e293b', '--surface-soft': '#273349', '--surface-border': '#3a465c',
      '--ink': '#e8ebf0', '--ink-soft': '#aab2c0', '--ink-faint': '#7d8694',
      '--page-bg': '#0f1623', '--sh': '#0f172a',
    },
  },
  pink: {
    light: {
      '--surface': '#ffffff', '--surface-soft': '#fdf2f6', '--surface-border': '#f7dde7',
      '--ink': '#3a2230', '--ink-soft': '#7a5a68', '--ink-faint': '#b596a4',
      '--page-bg': '#fff5f8', '--sh': '#a14d6b',
      ...brandVars(RAMP.blueRose, RAMP.goldRose),
    },
    dark: {
      '--surface': '#2a1f27', '--surface-soft': '#352732', '--surface-border': '#4a3742',
      '--ink': '#f3e6ec', '--ink-soft': '#cbb0bc', '--ink-faint': '#9b8290',
      '--page-bg': '#1a1117', '--sh': '#4c0a1d',
    },
  },
};

function hexToRgb(hex: string): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const num = parseInt(h, 16);
  return `${(num >> 16) & 255} ${(num >> 8) & 255} ${num & 255}`;
}

/** Applies a palette + mode + accent to the document root (inline vars). */
function applyVars(palette: Palette, mode: ThemeMode, accent: AccentKey) {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  const def = PALETTES[palette] ?? PALETTES.minimal;
  const vars = mode === 'dark' ? { ...def.light, ...def.dark } : def.light;
  for (const [name, hex] of Object.entries(vars)) {
    root.style.setProperty(name, hexToRgb(hex));
  }
  const preset = ACCENT_PRESETS[accent];
  root.style.setProperty('--accent', preset.rgb);
  root.style.setProperty('--accent-soft', preset.soft);
}

interface ThemeState {
  mode: ThemeMode;
  accent: AccentKey;
  palette: Palette;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (accent: AccentKey) => void;
  setPalette: (palette: Palette) => void;
  applyToDocument: () => void;
  /** Temporarily apply a specific theme without persisting (e.g. public pages). */
  previewTheme: (palette: Palette, mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      accent: 'gold',
      palette: 'minimal',
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
      setPalette: (palette) => {
        set({ palette });
        get().applyToDocument();
      },
      applyToDocument: () => {
        const { mode, accent, palette } = get();
        applyVars(palette, mode, accent);
      },
      previewTheme: (palette, mode) => {
        applyVars(palette, mode, get().accent);
      },
    }),
    { name: 'ipon-theme' },
  ),
);
