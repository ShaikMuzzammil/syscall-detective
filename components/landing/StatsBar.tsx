'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
  { value: 2847, label: 'Programs Analyzed', suffix: '' },
  { value: 180432, label: 'Syscalls Traced', suffix: '' },
  { value: 94, label: 'Accuracy Rate', suffix: '%' },
  { value: 12, label: 'Core Features', suffix: '' },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  const formatted = count >= 1000 ? count.toLocaleString() : count.toString();

  return <span ref={ref}>{formatted}{suffix}</span>;
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-16 border-y border-white/5 bg-bg-secondary/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-white/10">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 px-6 text-center"
            >
              <div className="text-4xl font-bold font-mono text-text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-text-muted">{stat.label}</div>
              <div className="w-8 h-0.5 bg-accent-green rounded-full" style={{ boxShadow: '0 0 8px rgba(0,255,136,0.5)' }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
