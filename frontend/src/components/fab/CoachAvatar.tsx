import { cn } from '../../lib/utils';

export type CoachVariant = 'man' | 'woman';

interface CoachAvatarProps {
  variant: CoachVariant;
  size?: number;
  className?: string;
}

/**
 * Friendly, gender-customizable avatar for the Ipon Coach (AI) button.
 * Clean silhouette style (head + shoulders + hair) — the hair length reads as
 * man vs woman without drawing facial features. Clipped to a circle via CSS.
 */
export default function CoachAvatar({ variant, size = 48, className }: CoachAvatarProps) {
  return (
    <span
      className={cn('inline-block shrink-0 overflow-hidden rounded-full', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        {variant === 'woman' ? <Woman /> : <Man />}
      </svg>
    </span>
  );
}

function Man() {
  return (
    <>
      <rect width="100" height="100" fill="#DDE2F4" />
      {/* shoulders / shirt */}
      <path d="M14 100 C14 75 31 69 50 69 C69 69 86 75 86 100 Z" fill="#35408E" />
      {/* head */}
      <circle cx="50" cy="44" r="19" fill="#F1C9A0" />
      {/* short hair */}
      <path d="M30 45 C30 25 40 21 50 21 C60 21 70 25 70 45 C66 37 60 35 50 35 C40 35 34 37 30 45 Z" fill="#3A2E22" />
    </>
  );
}

function Woman() {
  return (
    <>
      <rect width="100" height="100" fill="#F3E1F1" />
      {/* long hair (behind) */}
      <path
        d="M22 54 C22 26 35 19 50 19 C65 19 78 26 78 54 L78 92 C72 86 67 86 64 88 L64 50 C64 39 58 33 50 33 C42 33 36 39 36 50 L36 88 C33 86 28 86 22 92 Z"
        fill="#4A2E1E"
      />
      {/* shoulders / shirt */}
      <path d="M18 100 C18 77 34 71 50 71 C66 71 82 77 82 100 Z" fill="#A24BA6" />
      {/* head */}
      <circle cx="50" cy="46" r="18" fill="#F1C9A0" />
      {/* bangs / top hair */}
      <path d="M32 47 C32 27 41 23 50 23 C59 23 68 27 68 47 C63 38 57 36 50 36 C43 36 37 38 32 47 Z" fill="#4A2E1E" />
    </>
  );
}
