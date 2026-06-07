import { useId } from 'react';
import { cn } from '../../lib/utils';

/**
 * Inline, theme-aware brand mark (squircle + coin + peso ₱ + graduation cap).
 * Unlike the static /logo-icon.svg (an <img>, which can't inherit page CSS),
 * this reads the brand CSS variables, so it recolors with the active palette
 * (Ocean Blue / Minimal Light / Pastel Pink). Used by the Logo lockup.
 */
export default function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const raw = useId();
  const u = raw.replace(/[^a-zA-Z0-9]/g, '');
  const blue = (s: number) => `rgb(var(--c-blue-${s}))`;
  const gold = (s: number) => `rgb(var(--c-gold-${s}))`;

  return (
    <span
      className={cn('inline-block shrink-0 overflow-hidden rounded-[23%] shadow-glow-blue', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 512 512" width={size} height={size} role="img" aria-label="Ipon Challenge">
        <defs>
          <linearGradient id={`bg${u}`} x1="40" y1="20" x2="472" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: blue(500) }} />
            <stop offset="0.5" style={{ stopColor: blue(700) }} />
            <stop offset="1" style={{ stopColor: blue(950) }} />
          </linearGradient>
          <radialGradient id={`coin${u}`} cx="0.38" cy="0.30" r="0.92">
            <stop offset="0" style={{ stopColor: gold(200) }} />
            <stop offset="0.55" style={{ stopColor: gold(400) }} />
            <stop offset="1" style={{ stopColor: gold(600) }} />
          </radialGradient>
          <linearGradient id={`cap${u}`} x1="172" y1="116" x2="340" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: gold(200) }} />
            <stop offset="1" style={{ stopColor: gold(500) }} />
          </linearGradient>
        </defs>

        {/* Background squircle */}
        <rect width="512" height="512" fill={`url(#bg${u})`} />
        <rect x="6" y="6" width="500" height="500" rx="111" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />

        {/* Coin */}
        <circle cx="256" cy="296" r="120" fill={`url(#coin${u})`} />
        <circle cx="256" cy="296" r="100" fill="none" style={{ stroke: blue(950) }} strokeOpacity="0.18" strokeWidth="6" />
        <path d="M164 244 A108 108 0 0 1 320 206" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="7" strokeLinecap="round" />

        {/* Peso ₱ */}
        <g style={{ stroke: blue(950) }} strokeLinecap="round" fill="none">
          <path d="M248 224 V372" strokeWidth="26" />
          <path d="M248 228 h26 a48 46 0 0 1 0 92 h-26" strokeWidth="26" />
          <path d="M206 256 H286" strokeWidth="16" />
          <path d="M206 286 H286" strokeWidth="16" />
        </g>

        {/* Graduation cap */}
        <polygon points="256,116 340,152 256,188 172,152" fill={`url(#cap${u})`} style={{ stroke: blue(950) }} strokeOpacity="0.25" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="256,116 340,152 256,152 172,152" fill="#ffffff" fillOpacity="0.15" />
        <circle cx="256" cy="152" r="7" style={{ fill: blue(950) }} fillOpacity="0.55" />
        <path d="M340 152 V196" style={{ stroke: gold(500) }} strokeWidth="6" strokeLinecap="round" />
        <circle cx="340" cy="202" r="8" fill={`url(#cap${u})`} />
      </svg>
    </span>
  );
}
