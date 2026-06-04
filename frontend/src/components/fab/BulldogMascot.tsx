import { useId } from 'react';

interface BulldogMascotProps {
  size?: number;
  /** "happy" brightens the eyes to arcs and opens the smile for success reactions. */
  expression?: 'idle' | 'happy';
  className?: string;
}

/**
 * "Coachy" — the Ipon Challenge budgeting companion. An original, friendly
 * bulldog bust (a nod to NU Laguna's bulldog spirit, not its official mark):
 * navy fur, a soft lighter muzzle, a dark collar with a gold ₱ tag, and a
 * smart, encouraging expression. Pure SVG so it stays crisp at any size and
 * inherits the brand palette.
 */
export default function BulldogMascot({ size = 44, expression = 'idle', className }: BulldogMascotProps) {
  const uid = useId().replace(/:/g, '');
  const fur = `fur-${uid}`;
  const muzzle = `muzzle-${uid}`;
  const gold = `gold-${uid}`;
  const happy = expression === 'happy';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={fur} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5061b8" />
          <stop offset="1" stopColor="#232a57" />
        </linearGradient>
        <linearGradient id={muzzle} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbe1f5" />
          <stop offset="1" stopColor="#9aa7dd" />
        </linearGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd633" />
          <stop offset="1" stopColor="#f5b300" />
        </linearGradient>
      </defs>

      {/* Ears — small folded bulldog ears tucked behind the head */}
      <g>
        <ellipse cx="15" cy="22" rx="6" ry="8.5" fill={`url(#${fur})`} transform="rotate(-28 15 22)" />
        <ellipse cx="49" cy="22" rx="6" ry="8.5" fill={`url(#${fur})`} transform="rotate(28 49 22)" />
        <ellipse cx="16" cy="23" rx="2.6" ry="4.4" fill="#161a38" opacity="0.55" transform="rotate(-28 16 23)" />
        <ellipse cx="48" cy="23" rx="2.6" ry="4.4" fill="#161a38" opacity="0.55" transform="rotate(28 48 23)" />
      </g>

      {/* Collar + gold ₱ tag (drawn first so the chin overlaps it naturally) */}
      <rect x="17" y="47" width="30" height="7" rx="3.5" fill="#161a38" />
      <circle cx="32" cy="55.5" r="5.2" fill={`url(#${gold})`} stroke="#b36b00" strokeWidth="0.6" />
      <text
        x="32"
        y="58"
        textAnchor="middle"
        fontSize="7"
        fontWeight="800"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fill="#232a57"
      >
        ₱
      </text>

      {/* Head */}
      <path
        d="M32 11 C19.8 11 11.5 19.2 11.5 30.5 C11.5 38.4 15.2 43.8 21 47 C24.2 48.8 28 49.6 32 49.6 C36 49.6 39.8 48.8 43 47 C48.8 43.8 52.5 38.4 52.5 30.5 C52.5 19.2 44.2 11 32 11 Z"
        fill={`url(#${fur})`}
      />

      {/* Cyan rim highlight (subtle) */}
      <path
        d="M18 20 C22 15.5 27 13 32 13"
        stroke="#5eead4"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.45"
        fill="none"
      />

      {/* Forehead wrinkle + brows */}
      <path d="M28 18.5 Q32 16.5 36 18.5" stroke="#161a38" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" fill="none" />
      <path d="M20.5 23.5 Q24 21.8 27.5 23.2" stroke="#161a38" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" fill="none" />
      <path d="M36.5 23.2 Q40 21.8 43.5 23.5" stroke="#161a38" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" fill="none" />

      {/* Muzzle pad */}
      <path
        d="M32 29 C24.5 29 21 33.6 21 38 C21 43 26.2 46.5 32 46.5 C37.8 46.5 43 43 43 38 C43 33.6 39.5 29 32 29 Z"
        fill={`url(#${muzzle})`}
      />

      {/* Eyes */}
      {happy ? (
        <>
          <path d="M21.5 27 Q25 23.6 28.5 27" stroke="#161a38" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M35.5 27 Q39 23.6 42.5 27" stroke="#161a38" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="25" cy="27" rx="3.7" ry="4.2" fill="#fbfcff" />
          <ellipse cx="39" cy="27" rx="3.7" ry="4.2" fill="#fbfcff" />
          <circle cx="25.8" cy="27.4" r="2.1" fill="#161a38" />
          <circle cx="39.8" cy="27.4" r="2.1" fill="#161a38" />
          <circle cx="24.9" cy="26.4" r="0.8" fill="#fff" />
          <circle cx="38.9" cy="26.4" r="0.8" fill="#fff" />
        </>
      )}

      {/* Nose */}
      <path d="M26.6 33.4 a5.4 4.6 0 0 1 10.8 0 c0 2.3 -2.9 4 -5.4 4 s-5.4 -1.7 -5.4 -4 Z" fill="#161a38" />
      <ellipse cx="29.6" cy="33.4" rx="0.9" ry="1.2" fill="#3d4a9c" />
      <ellipse cx="34.4" cy="33.4" rx="0.9" ry="1.2" fill="#3d4a9c" />

      {/* Mouth + underbite */}
      {happy ? (
        <>
          <path d="M27 39 Q32 45.5 37 39 Z" fill="#161a38" />
          <path d="M30 43 Q32 45 34 43 Z" fill="#ff7a8a" />
          <rect x="28.5" y="38.4" width="7" height="1.8" rx="0.9" fill="#fbfcff" />
        </>
      ) : (
        <>
          <path d="M32 38 Q28.5 42 25 40.5" stroke="#161a38" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M32 38 Q35.5 42 39 40.5" stroke="#161a38" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M29.4 38 h5.2 a0.8 0.8 0 0 1 0.8 0.8 v1.4 a0.8 0.8 0 0 1 -0.8 0.8 h-5.2 a0.8 0.8 0 0 1 -0.8 -0.8 v-1.4 a0.8 0.8 0 0 1 0.8 -0.8 Z" fill="#fbfcff" />
          <path d="M32 38 v3" stroke="#cdd5ee" strokeWidth="0.7" />
        </>
      )}

      {/* Happy sparkles */}
      {happy && (
        <g fill="#ffd633">
          <path d="M50 16 l1 2.4 l2.4 1 l-2.4 1 l-1 2.4 l-1 -2.4 l-2.4 -1 l2.4 -1 Z" />
          <circle cx="13" cy="38" r="1.3" />
        </g>
      )}
    </svg>
  );
}
