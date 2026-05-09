'use client';
import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X, ChevronDown } from 'lucide-react';

const FEATURES_BASE = [
  { feature: 'Visual Call Graph', sd: true, strace: false, ltrace: false, gdb: false },
  { feature: 'AI Explanation', sd: true, strace: false, ltrace: false, gdb: false },
  { feature: 'Weirdness Score', sd: true, strace: false, ltrace: false, gdb: false },
  { feature: 'Compare Programs', sd: true, strace: false, ltrace: false, gdb: false },
  { feature: 'No Terminal Needed', sd: true, strace: false, ltrace: false, gdb: false },
  { feature: 'Custom Upload', sd: true, strace: true, ltrace: true, gdb: true },
  { feature: 'Web Interface', sd: true, strace: false, ltrace: false, gdb: false },
  { feature: 'Share Results', sd: true, strace: false, ltrace: false, gdb: false },
];

const FEATURES_EXTRA = [
  { feature: 'Time Heatmap', sd: true, strace: false, ltrace: false, gdb: false },
  { feature: 'Flame Graph', sd: true, strace: false, ltrace: false, gdb: false },
  { feature: 'Latency Breakdown', sd: true, strace: false, ltrace: false, gdb: false },
  { feature: 'PDF Export', sd: true, strace: false, ltrace: false, gdb: false },
  { feature: 'API Access', sd: true, strace: false, ltrace: false, gdb: false },
  { feature: 'Docker Sandbox', sd: true, strace: false, ltrace: false, gdb: false },
];

const COLS = ['Feature', 'Syscall Detective', 'strace (raw)', 'ltrace', 'gdb'];

export default function ComparisonTable() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [showExtra, setShowExtra] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const features = showExtra ? [...FEATURES_BASE, ...FEATURES_EXTRA] : FEATURES_BASE;

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <div className="text-accent-green font-mono text-sm mb-3 tracking-widest">COMPARISON</div>
          <h2 className="text-4xl font-bold text-text-primary">Why Syscall Detective?</h2>
          <p className="text-text-secondary mt-4">See how we compare to traditional Linux tracing tools</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {COLS.map((col, i) => (
                  <th
                    key={i}
                    className={`px-4 py-4 text-left text-xs font-mono font-bold tracking-widest ${
                      i === 0 ? 'text-text-secondary' :
                      i === 1 ? 'text-accent-green' : 'text-text-muted'
                    }`}
                  >
                    {col}
                    {i === 1 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-accent-green/20 text-accent-green text-[10px] rounded">★</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 transition-colors cursor-default"
                  style={{ backgroundColor: hoveredRow === i ? 'rgba(0,255,136,0.04)' : 'transparent' }}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{row.feature}</td>
                  {[row.sd, row.strace, row.ltrace, row.gdb].map((val, j) => (
                    <td key={j} className="px-4 py-3.5">
                      {val ? (
                        <div className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-accent-green" />
                          {j === 0 && <span className="text-xs text-accent-green font-medium">YES</span>}
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-text-muted opacity-40" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowExtra(v => !v)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-white/10 rounded-lg hover:border-white/20 transition-all"
          >
            {showExtra ? 'Hide' : 'Show Advanced Features'}
            <ChevronDown
              className="w-4 h-4 transition-transform"
              style={{ transform: showExtra ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
