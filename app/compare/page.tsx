'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { GitCompare } from 'lucide-react';
import { getPrecomputedTrace, PRECOMPUTED_PROGRAM_NAMES } from '@/lib/precomputed-traces';
import { buildSummaryStats } from '@/lib/strace-parser';
import { computeWeirdnessScore } from '@/lib/weirdness-scorer';

function ProgramSelector({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-xs font-mono font-bold text-text-muted mb-3">{label}</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {PRECOMPUTED_PROGRAM_NAMES.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`py-2 px-2 rounded-lg text-xs font-mono transition-all ${
              value === p ? 'bg-accent-green text-bg-primary' : 'bg-bg-card border border-white/10 text-text-secondary hover:text-text-primary'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [progA, setProgA] = useState('ls');
  const [progB, setProgB] = useState('curl');
  const [compared, setCompared] = useState(false);

  const traceA = getPrecomputedTrace(progA);
  const traceB = getPrecomputedTrace(progB);

  const statsA = traceA ? buildSummaryStats(traceA.syscalls).slice(0, 10) : [];
  const statsB = traceB ? buildSummaryStats(traceB.syscalls).slice(0, 10) : [];
  const scoreA = traceA ? computeWeirdnessScore(traceA.syscalls).score : 0;
  const scoreB = traceB ? computeWeirdnessScore(traceB.syscalls).score : 0;

  const namesA = new Set(statsA.map(s => s.name));
  const namesB = new Set(statsB.map(s => s.name));
  const onlyA = [...namesA].filter(n => !namesB.has(n));
  const onlyB = [...namesB].filter(n => !namesA.has(n));
  const common = [...namesA].filter(n => namesB.has(n));

  const categories = ['fileio', 'network', 'process', 'memory', 'signal', 'ipc'];
  const radarData = categories.map(cat => {
    const aCount = traceA?.syscalls.filter(s => s.category === cat).length || 0;
    const bCount = traceB?.syscalls.filter(s => s.category === cat).length || 0;
    const maxVal = Math.max(aCount, bCount, 1);
    return { category: cat, A: Math.round((aCount / maxVal) * 100), B: Math.round((bCount / maxVal) * 100) };
  });

  // Merge histogram data
  const allNames = [...new Set([...statsA.map(s => s.name), ...statsB.map(s => s.name)])].slice(0, 12);
  const overlayData = allNames.map(name => ({
    name,
    A: statsA.find(s => s.name === name)?.count || 0,
    B: statsB.find(s => s.name === name)?.count || 0,
  }));

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            <span className="text-accent-green">$</span> Compare Programs
          </h1>
          <p className="text-text-muted text-sm mt-1">Side-by-side syscall analysis with AI-powered diff</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <ProgramSelector value={progA} onChange={setProgA} label="PROGRAM A" />
          <ProgramSelector value={progB} onChange={setProgB} label="PROGRAM B" />
        </div>

        <button
          onClick={() => setCompared(true)}
          className="w-full py-4 bg-accent-green text-bg-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-accent-green/90 transition-all text-sm mb-8"
        >
          <GitCompare className="w-5 h-5" />
          Compare {progA} vs {progB}
        </button>

        <AnimatePresence>
          {compared && traceA && traceB && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Metrics */}
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { prog: progA, score: scoreA, calls: traceA.syscalls.length, dur: traceA.duration, color: '#3B82F6' },
                  { prog: progB, score: scoreB, calls: traceB.syscalls.length, dur: traceB.duration, color: '#7C3AED' },
                ].map((p, i) => (
                  <div key={i} className="glass rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xl font-bold font-mono text-text-primary">{p.score}</div>
                      <div className="text-xs text-text-muted">Weirdness</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold font-mono text-text-primary">{p.calls.toLocaleString()}</div>
                      <div className="text-xs text-text-muted">Syscalls</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold font-mono text-text-primary">{p.dur.toFixed(2)}s</div>
                      <div className="text-xs text-text-muted">Duration</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overlay histogram */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-mono font-bold text-text-primary mb-4">Syscall Frequency Comparison</h3>
                <div className="h-56">
                  <ResponsiveContainer>
                    <BarChart data={overlayData} barSize={12}>
                      <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 9, fontFamily: 'var(--font-mono)' }} angle={-30} textAnchor="end" height={50} />
                      <YAxis tick={{ fill: '#888', fontSize: 9 }} />
                      <Tooltip contentStyle={{ background: '#16161F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px' }} />
                      <Legend />
                      <Bar dataKey="A" fill="#3B82F6" fillOpacity={0.85} name={progA} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="B" fill="#7C3AED" fillOpacity={0.6} name={progB} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Radar chart */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-mono font-bold text-text-primary mb-4">Syscall Category Radar</h3>
                <div className="h-64">
                  <ResponsiveContainer>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: '#888', fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} />
                      <Radar dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name={progA} />
                      <Radar dataKey="B" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} name={progB} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Diff view */}
              <div className="glass rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-mono font-bold text-text-primary">Syscall Diff</h3>
                <div className="grid md:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <div className="text-blue-400 font-bold mb-2">Only in {progA}:</div>
                    {onlyA.length ? onlyA.map(n => <div key={n} className="text-text-muted py-0.5">• {n}</div>) : <div className="text-text-muted">None</div>}
                  </div>
                  <div>
                    <div className="text-text-muted font-bold mb-2">Common:</div>
                    {common.slice(0, 8).map(n => <div key={n} className="text-text-muted py-0.5">≈ {n}</div>)}
                  </div>
                  <div>
                    <div className="text-purple-400 font-bold mb-2">Only in {progB}:</div>
                    {onlyB.length ? onlyB.map(n => <div key={n} className="text-text-muted py-0.5">• {n}</div>) : <div className="text-text-muted">None</div>}
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10 text-xs text-text-muted">
                  {progB} makes {traceB.syscalls.length > traceA.syscalls.length ? `${Math.round((traceB.syscalls.length / traceA.syscalls.length) * 10) / 10}x more` : 'fewer'} syscalls than {progA}.
                  {' '}Weirdness: {progA} {scoreA} vs {progB} {scoreB}.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
