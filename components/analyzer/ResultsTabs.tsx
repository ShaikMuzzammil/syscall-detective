'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import SummaryDashboard from './SummaryDashboard';
import SyscallHistogram from './SyscallHistogram';
import AIReport from './AIReport';
import RawTrace from './RawTrace';
import ExportPanel from './ExportPanel';
import CallGraphTab from './CallGraph';

const TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'callgraph', label: 'Call Graph' },
  { id: 'histogram', label: 'Histogram' },
  { id: 'heatmap', label: 'Heatmap' },
  { id: 'flamegraph', label: 'Flame Graph' },
  { id: 'latency', label: 'Latency' },
  { id: 'ai', label: 'AI Report' },
  { id: 'raw', label: 'Raw Trace' },
  { id: 'export', label: 'Export' },
];

interface Props { result: AnalysisResult }

export default function ResultsTabs({ result }: Props) {
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'text-accent-green' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-green"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'summary' && <SummaryDashboard result={result} />}
            {activeTab === 'callgraph' && <CallGraphTab result={result} />}
            {activeTab === 'histogram' && <SyscallHistogram result={result} />}
            {activeTab === 'heatmap' && <TimeHeatmap result={result} />}
            {activeTab === 'flamegraph' && <FlameGraphTab result={result} />}
            {activeTab === 'latency' && <LatencyTab result={result} />}
            {activeTab === 'ai' && <AIReport result={result} />}
            {activeTab === 'raw' && <RawTrace result={result} />}
            {activeTab === 'export' && <ExportPanel result={result} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Inline minimal implementations for less-critical tabs
function TimeHeatmap({ result }: Props) {
  const { syscalls } = result;
  const buckets = 40;
  const maxTime = Math.max(...syscalls.map(s => s.seq));
  const categories = ['fileio', 'network', 'process', 'memory', 'signal', 'ipc'];
  const colors: Record<string, string> = {
    fileio: '#3B82F6', network: '#F59E0B', process: '#EF4444',
    memory: '#8B5CF6', signal: '#EC4899', ipc: '#14B8A6',
  };

  const grid: Record<string, number[]> = {};
  categories.forEach(c => { grid[c] = new Array(buckets).fill(0); });

  syscalls.forEach(s => {
    const bucket = Math.floor((s.seq / maxTime) * (buckets - 1));
    if (grid[s.category]) grid[s.category][bucket]++;
  });

  return (
    <div>
      <h3 className="text-sm font-bold text-text-primary mb-4 font-mono">Time Heatmap</h3>
      <div className="space-y-3">
        {categories.map(cat => {
          const maxVal = Math.max(...grid[cat], 1);
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-xs font-mono text-text-muted w-16 shrink-0" style={{ color: colors[cat] }}>{cat}</span>
              <div className="flex gap-0.5 flex-1">
                {grid[cat].map((v, i) => (
                  <div
                    key={i}
                    className="h-5 flex-1 rounded-sm transition-all hover:opacity-100"
                    title={`${cat}: ${v} calls`}
                    style={{
                      backgroundColor: colors[cat],
                      opacity: v === 0 ? 0.05 : 0.1 + (v / maxVal) * 0.9,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-text-muted mt-2 font-mono">
        <span>0ms</span>
        <span>{(result.duration * 500).toFixed(0)}ms</span>
        <span>{(result.duration * 1000).toFixed(0)}ms</span>
      </div>
    </div>
  );
}

function FlameGraphTab({ result }: Props) {
  const { syscalls } = result;
  const categories: Record<string, number> = {};
  syscalls.forEach(s => { categories[s.category] = (categories[s.category] || 0) + s.duration; });
  const totalTime = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
  const colors: Record<string, string> = {
    fileio: '#3B82F6', network: '#F59E0B', process: '#EF4444',
    memory: '#8B5CF6', signal: '#EC4899', ipc: '#14B8A6', misc: '#6B7280', security: '#FF8C00',
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-text-primary mb-4 font-mono">Flame Graph</h3>
      <div className="space-y-1">
        {/* Main bar */}
        <div className="flex h-8 rounded-lg overflow-hidden border border-white/10">
          {Object.entries(categories).map(([cat, time]) => {
            const pct = (time / totalTime) * 100;
            return (
              <div
                key={cat}
                className="flex items-center justify-center text-[10px] font-mono text-white overflow-hidden"
                style={{ width: `${pct}%`, backgroundColor: colors[cat] || '#6B7280', minWidth: pct > 3 ? undefined : 0 }}
                title={`${cat}: ${(time * 1000).toFixed(2)}ms`}
              >
                {pct > 5 ? cat : ''}
              </div>
            );
          })}
        </div>
        {/* Second level - top syscalls */}
        <div className="flex h-6 rounded-lg overflow-hidden border border-white/10">
          {syscalls.slice(0, 20).map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-center overflow-hidden"
              style={{
                flex: s.duration || 0.001,
                backgroundColor: colors[s.category] || '#6B7280',
                opacity: 0.7,
              }}
              title={s.name}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {Object.entries(categories).map(([cat, time]) => (
          <div key={cat} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[cat] }} />
            <span className="text-text-muted capitalize">{cat}</span>
            <span className="ml-auto font-mono text-text-secondary">{(time * 1000).toFixed(1)}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LatencyTab({ result }: Props) {
  const { syscalls } = result;
  const stats: Record<string, { count: number; min: number; max: number; total: number }> = {};

  syscalls.forEach(s => {
    if (!stats[s.name]) stats[s.name] = { count: 0, min: Infinity, max: 0, total: 0 };
    stats[s.name].count++;
    stats[s.name].total += s.duration;
    stats[s.name].min = Math.min(stats[s.name].min, s.duration);
    stats[s.name].max = Math.max(stats[s.name].max, s.duration);
  });

  const totalTime = syscalls.reduce((s, e) => s + e.duration, 0) || 1;
  const rows = Object.entries(stats)
    .map(([name, s]) => ({ name, ...s, avg: s.total / s.count, pct: (s.total / totalTime) * 100 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);

  const topBottleneck = rows[0];

  return (
    <div>
      <h3 className="text-sm font-bold text-text-primary mb-4 font-mono">Latency Breakdown</h3>
      {topBottleneck && (
        <div className="p-3 bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg mb-4 text-xs">
          <span className="text-accent-yellow font-mono">⚡ Bottleneck: </span>
          <span className="text-text-secondary">
            {topBottleneck.name}() is consuming {topBottleneck.pct.toFixed(1)}% of runtime
          </span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10">
              {['Syscall', 'Count', 'Min (µs)', 'Max (µs)', 'Avg (µs)', '% Runtime'].map(h => (
                <th key={h} className="text-left py-2 px-3 text-text-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="py-2 px-3 text-accent-green">{row.name}</td>
                <td className="py-2 px-3 text-text-secondary">{row.count}</td>
                <td className="py-2 px-3 text-text-muted">{(row.min * 1000000).toFixed(0)}</td>
                <td className="py-2 px-3 text-text-muted">{(row.max * 1000000).toFixed(0)}</td>
                <td className="py-2 px-3 text-text-secondary">{(row.avg * 1000000).toFixed(0)}</td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-bg-hover rounded-full" style={{ width: '60px' }}>
                      <div
                        className="h-full bg-accent-blue rounded-full"
                        style={{ width: `${Math.min(100, row.pct)}%` }}
                      />
                    </div>
                    <span className="text-text-muted">{row.pct.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
