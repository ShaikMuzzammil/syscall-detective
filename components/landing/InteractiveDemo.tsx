'use client';
import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import { getPrecomputedTrace } from '@/lib/precomputed-traces';
import { buildSummaryStats } from '@/lib/strace-parser';
import { getWeirdnessLevel } from '@/lib/weirdness-scorer';
import { getCategoryColor } from '@/lib/utils';

const PROGRAMS = ['ls', 'curl', 'python3', 'nginx', 'bash', 'node'];

export default function InteractiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<null | ReturnType<typeof buildSummaryStats>>(null);
  const [weirdness, setWeirdness] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [loading, setLoading] = useState(false);

  const analyze = () => {
    if (!selected) return;
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const trace = getPrecomputedTrace(selected);
      if (trace) {
        const stats = buildSummaryStats(trace.syscalls).slice(0, 10);
        setResult(stats);
        setWeirdness(trace.weirdnessScore);
        setTotalCalls(trace.syscalls.length);
      }
      setLoading(false);
    }, 800);
  };

  const { level, color } = getWeirdnessLevel(weirdness);

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <div className="text-accent-green font-mono text-sm mb-3 tracking-widest">TRY IT NOW</div>
          <h2 className="text-4xl font-bold text-text-primary">Live Demo — No Sign-In Required</h2>
          <p className="text-text-secondary mt-4">Select a program and analyze its syscall fingerprint instantly</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 md:p-8"
        >
          {/* Program selector */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
            {PROGRAMS.map(prog => (
              <button
                key={prog}
                onClick={() => setSelected(prog)}
                className={`py-2.5 px-3 rounded-xl text-sm font-mono font-medium transition-all ${
                  selected === prog
                    ? 'bg-accent-green text-bg-primary'
                    : 'bg-bg-card border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20'
                }`}
              >
                {prog}
              </button>
            ))}
          </div>

          <button
            onClick={analyze}
            disabled={!selected || loading}
            className="w-full py-4 bg-accent-green text-bg-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-accent-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed pulse-green-btn mb-6"
          >
            <Zap className="w-5 h-5" />
            {loading ? 'Analyzing...' : `Analyze${selected ? ` — ${selected}` : ''}`}
          </button>

          {/* Results */}
          {loading && (
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-text-muted text-sm font-mono ml-2">Running strace analysis...</span>
            </div>
          )}

          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-bg-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold font-mono text-text-primary">{totalCalls.toLocaleString()}</div>
                  <div className="text-xs text-text-muted mt-1">Total Syscalls</div>
                </div>
                <div className="bg-bg-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold font-mono text-text-primary">{result.length}</div>
                  <div className="text-xs text-text-muted mt-1">Unique Calls</div>
                </div>
                <div className="bg-bg-card rounded-xl p-4 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold font-mono" style={{ color }}>{weirdness}</div>
                  <div className="text-xs mt-1 font-mono" style={{ color }}>{level}</div>
                  <div className="text-xs text-text-muted">Weirdness</div>
                </div>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.slice(0, 8)} barSize={20}>
                    <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: '#16161F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                      labelStyle={{ color: '#F0F0F0' }}
                    />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                      {result.slice(0, 8).map((entry, i) => (
                        <Cell key={i} fill={getCategoryColor(entry.category)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center">
                <Link
                  href={`/analyze?program=${selected}`}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  See Full Report
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {!result && !loading && (
            <div className="text-center py-8 text-text-muted text-sm">
              ↑ Select a program above and click Analyze to see live results
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
