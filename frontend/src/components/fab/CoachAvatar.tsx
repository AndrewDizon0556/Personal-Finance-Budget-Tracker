import { useId } from 'react';
import { cn } from '../../lib/utils';

export type CoachVariant = 'man' | 'woman';

interface CoachAvatarProps {
  variant: CoachVariant;
  size?: number;
  className?: string;
}

const SKIN = { light: '#FAD7B4', base: '#F0BE92', shadow: '#E1A073' };

const PALETTE: Record<CoachVariant, { bg0: string; bg1: string; shirt0: string; shirt1: string; hair0: string; hair1: string }> = {
  man: { bg0: '#EAEEFB', bg1: '#C8D3F1', shirt0: '#46549F', shirt1: '#2C3470', hair0: '#4A3526', hair1: '#291C14' },
  woman: { bg0: '#FDE6F1', bg1: '#F6CADF', shirt0: '#E2739F', shirt1: '#C24E84', hair0: '#6B4327', hair1: '#3F2619' },
};

/**
 * Friendly, gender-customizable avatar for the Ipon Coach (AI) button.
 * Flat-illustration style with soft shading, a warm face, and styled hair —
 * the same component renders on the FAB, the panel header, and chat bubbles
 * (so PC and mobile stay in sync). Clipped to a circle via CSS.
 */
export default function CoachAvatar({ variant, size = 48, className }: CoachAvatarProps) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9]/g, '');
  const p = PALETTE[variant];
  const bg = `bg${uid}`;
  const sk = `sk${uid}`;
  const hr = `hr${uid}`;
  const sh = `sh${uid}`;

  return (
    <span
      className={cn('inline-block shrink-0 overflow-hidden rounded-full', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <defs>
          <radialGradient id={bg} cx="0.32" cy="0.26" r="0.92">
            <stop offset="0" stopColor={p.bg0} />
            <stop offset="1" stopColor={p.bg1} />
          </radialGradient>
          <linearGradient id={`vig${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.55" stopColor="#0b1020" stopOpacity="0" />
            <stop offset="1" stopColor="#0b1020" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id={sk} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SKIN.light} />
            <stop offset="1" stopColor={SKIN.base} />
          </linearGradient>
          <linearGradient id={hr} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor={p.hair0} />
            <stop offset="1" stopColor={p.hair1} />
          </linearGradient>
          <linearGradient id={sh} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.shirt0} />
            <stop offset="1" stopColor={p.shirt1} />
          </linearGradient>
        </defs>

        <rect width="100" height="100" fill={`url(#${bg})`} />

        {/* Long hair behind the head (woman) */}
        {variant === 'woman' && (
          <path
            d="M23 56 C23 28 35 20 50 20 C65 20 77 28 77 56 L77 94 C71 88 66 88 63 90 L63 50 C63 40 57 35 50 35 C43 35 37 40 37 50 L37 90 C34 88 29 88 23 94 Z"
            fill={`url(#${hr})`}
          />
        )}

        {/* Shoulders / shirt */}
        <path d="M15 100 C15 75 31 67 50 67 C69 67 85 75 85 100 Z" fill={`url(#${sh})`} />
        {/* Soft collar / neckline highlight */}
        <path d="M41 68 L50 80 L59 68 Z" fill="#ffffff" opacity="0.10" />

        {/* Neck */}
        <path d="M43 53 h14 v9 a7 7 0 0 1 -14 0 Z" fill={SKIN.shadow} />

        {/* Ears */}
        <circle cx="33.5" cy="44" r="3.6" fill={`url(#${sk})`} />
        <circle cx="66.5" cy="44" r="3.6" fill={`url(#${sk})`} />
        {variant === 'woman' && (
          <>
            <circle cx="33.5" cy="48.5" r="1.5" fill="#F5B301" />
            <circle cx="66.5" cy="48.5" r="1.5" fill="#F5B301" />
          </>
        )}

        {/* Head */}
        <path
          d="M34 41 C34 28 41 24 50 24 C59 24 66 28 66 41 C66 52 59 60 50 60 C41 60 34 52 34 41 Z"
          fill={`url(#${sk})`}
        />

        {/* Cheeks */}
        <ellipse cx="40.5" cy="47.5" rx="3.1" ry="2.1" fill="#F39B9B" opacity="0.4" />
        <ellipse cx="59.5" cy="47.5" rx="3.1" ry="2.1" fill="#F39B9B" opacity="0.4" />

        {/* Eyebrows */}
        <path d="M40 38.5 Q43 36.7 46.2 38.3" stroke={p.hair1} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M53.8 38.3 Q57 36.7 60 38.5" stroke={p.hair1} strokeWidth="1.6" fill="none" strokeLinecap="round" />

        {/* Eyes */}
        <circle cx="43" cy="43.2" r="2.4" fill="#3A2E2A" />
        <circle cx="57" cy="43.2" r="2.4" fill="#3A2E2A" />
        <circle cx="43.8" cy="42.4" r="0.85" fill="#ffffff" />
        <circle cx="57.8" cy="42.4" r="0.85" fill="#ffffff" />

        {/* Nose */}
        <path d="M50 44.5 q1.6 2.8 0 4.4" stroke={SKIN.shadow} strokeWidth="1.3" fill="none" strokeLinecap="round" />

        {/* Smile */}
        <path d="M44 51 Q50 56.5 56 51" stroke="#C2674B" strokeWidth="1.9" fill="none" strokeLinecap="round" />

        {/* Top hair / bangs */}
        {variant === 'man' ? (
          <path
            d="M32 45 C30 23 42 17 50 17 C58 17 70 22 68 45 C66.5 39 62 36 59.5 36 C57.5 32 54 31 50 31 C46 31 42.5 32 40.5 36 C38 36 33.5 39 32 45 Z"
            fill={`url(#${hr})`}
          />
        ) : (
          <path
            d="M33 46 C31 26 41 21 50 21 C59 21 69 26 67 46 C64 39 60 36.5 57 36 C56 32.5 53 31.5 50 31.5 C46 31.5 41 33 38 39 C36.5 33 34.5 33 33 46 Z"
            fill={`url(#${hr})`}
          />
        )}
        {/* Hair sheen */}
        <path
          d={variant === 'man' ? 'M40 24 C45 20 55 20 60 24' : 'M41 27 C45 23 52 23 57 26'}
          stroke="#ffffff"
          strokeOpacity="0.22"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Soft bottom vignette for depth */}
        <rect width="100" height="100" fill={`url(#vig${uid})`} />
      </svg>
    </span>
  );
}
