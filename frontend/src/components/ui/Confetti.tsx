import { motion } from 'framer-motion';

const COLORS = ['#f5b300', '#35408e', '#10b981', '#ec4899', '#ffc91a'];
const PIECES = Array.from({ length: 14 });

/** Small one-shot confetti burst from center. */
export default function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PIECES.map((_, i) => {
        const angle = (i / PIECES.length) * Math.PI * 2;
        const dist = 60 + Math.random() * 50;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist + 30,
              opacity: 0,
              scale: 0.4,
              rotate: Math.random() * 360,
            }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          />
        );
      })}
    </div>
  );
}
