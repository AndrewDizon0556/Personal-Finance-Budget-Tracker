import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  /** Transform the raw animated number into a display string. */
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

/** Smoothly counts up/down to `value` whenever it changes. */
export default function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString(),
  duration = 1,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
